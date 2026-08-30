import {S,getPoint,getLine,getContour} from "./state.js?v=0.8.29.2-20260830-navigation-core";
import {
  createPoint,createLine,createShape,clearAllGeometry,validateGeometryState
} from "./geometry.js?v=0.8.29.2-20260830-navigation-core";
import {createWall,createOpening,clearWalls} from "./walls.js?v=0.8.29.2-20260830-navigation-core";
import {snapshotAiObjects,restoreAiBuilderObjects,clearAiBuilderObjects} from "./ai-builder.js?v=0.8.29.2-20260830-navigation-core";

function vec(v){return v?{x:v.x,y:v.y,z:v.z}:null;}
function vec3(v){return v?new S.THREE.Vector3(v.x,v.y,v.z):null;}
function plane(p){return p?{origin:vec(p.origin),normal:vec(p.normal),u:vec(p.u),v:vec(p.v)}:null;}
function restorePlane(p){return p?{origin:vec3(p.origin),normal:vec3(p.normal),u:vec3(p.u),v:vec3(p.v)}:null;}
function cloneTx(tx){return tx?JSON.parse(JSON.stringify(tx)):tx;}

export function snapshotProject(){
  return {
    pointCounter:S.pointCounter,contourCounter:S.contourCounter,
    selected:{line:S.selectedLineId,point:S.selectedPointId,shape:S.selectedShapeId,wall:S.selectedWallId,opening:S.selectedOpeningId,aiObject:S.selectedAiObjectId},
    wallTool:{...S.wallTool},
    points:S.points.map(p=>({id:p.id,name:p.name,position:vec(p.position),surfaceNormal:vec(p.surfaceNormal)})),
    lines:S.lines.map(l=>({
      id:l.id,name:l.name,autoName:l.autoName!==false,startId:l.startId,endId:l.endId,
      thickness:l.thickness,color:l.color,labelsVisible:l.labelsVisible!==false,ownerType:l.ownerType||null,ownerId:l.ownerId||null
    })),
    contours:S.contours.map(c=>({id:c.id,name:c.name,pointIds:[...c.pointIds],lineIds:[...c.lineIds],closed:Boolean(c.closed),kind:c.kind})),
    shapes:S.shapes.map(s=>({
      id:s.id,name:s.name,contourId:s.contourId,fill:s.fill,opacity:s.opacity,border:s.border,thickness:s.thickness,labels:s.labels!==false
    })),
    walls:S.walls.map(w=>({
      id:w.id,name:w.name,lineId:w.lineId,height:w.height,thickness:w.thickness,side:w.side,
      orientation:w.orientation,angle:w.angle,color:w.color,opacity:w.opacity,visible:w.visible!==false
    })),
    openings:S.openings.map(o=>({id:o.id,name:o.name,wallId:o.wallId,type:o.type,x:o.x,bottom:o.bottom,width:o.width,height:o.height})),
    aiObjects:snapshotAiObjects(),
    tool:{
      kind:S.tool.kind,status:S.tool.status,activePointId:S.tool.activePointId,firstPointId:S.tool.firstPointId,
      pointIds:[...S.tool.pointIds],lineIds:[...S.tool.lineIds],transactions:S.tool.transactions.map(cloneTx),
      placement:S.tool.placement,distanceM:S.tool.distanceM,constraint:S.tool.constraint,angleDeg:S.tool.angleDeg,
      side:S.tool.side,referenceLineId:S.tool.referenceLineId,activePlane:plane(S.tool.activePlane),
      snapMode:S.tool.snapMode,snapTolerance:S.tool.snapTolerance,snapLineTolerance:S.tool.snapLineTolerance
    }
  };
}

function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function emit(){document.dispatchEvent(new CustomEvent("measurear:history-changed"));}

export function commitSnapshot(label,before,after=snapshotProject()){
  if(S.history.restoring||same(before,after))return false;
  S.history.undo.push({type:"snapshot",label:String(label||"Actie"),before,after});
  while(S.history.undo.length>S.history.limit)S.history.undo.shift();
  S.history.redo.length=0;emit();return true;
}

export function runHistoryAction(label,fn){
  const before=snapshotProject();
  try{
    const result=fn();
    commitSnapshot(label,before);
    return result;
  }catch(err){
    // If a mutation threw halfway through, restore the exact pre-action state.
    restoreProject(before);
    throw err;
  }
}

export function restoreProject(snap){
  if(!snap)throw new Error("Historie-snapshot ontbreekt.");
  S.history.restoring=true;
  try{
    clearAiBuilderObjects();clearWalls();clearAllGeometry();

    for(const p of snap.points){
      createPoint(vec3(p.position),{id:p.id,name:p.name,surfaceNormal:vec3(p.surfaceNormal)});
    }
    for(const l of snap.lines){
      const a=getPoint(l.startId),b=getPoint(l.endId);
      if(!a||!b)throw new Error(`Historie: punten voor lijn ${l.name} ontbreken.`);
      createLine(a,b,{
        id:l.id,name:l.name,autoName:l.autoName,color:l.color,thickness:l.thickness,
        labelsVisible:l.labelsVisible,ownerType:l.ownerType,ownerId:l.ownerId
      });
    }
    S.contours.length=0;
    for(const c of snap.contours){
      S.contours.push({id:c.id,name:c.name,pointIds:[...c.pointIds],lineIds:[...c.lineIds],closed:c.closed,kind:c.kind});
    }
    for(const s of snap.shapes){
      const c=getContour(s.contourId);if(!c)throw new Error(`Historie: contour van vorm ${s.name} ontbreekt.`);
      createShape(c,{id:s.id,name:s.name,fill:s.fill,opacity:s.opacity,border:s.border,thickness:s.thickness,labels:s.labels});
    }
    restoreAiBuilderObjects(snap.aiObjects||[]);
    for(const w of snap.walls){
      const l=getLine(w.lineId);if(!l)throw new Error(`Historie: basislijn van muur ${w.name} ontbreekt.`);
      createWall(l,{...w,id:w.id});
    }
    for(const o of (snap.openings||[])){
      const w=S.walls.find(x=>x.id===o.wallId);if(!w)throw new Error(`Historie: muur van opening ${o.name} ontbreekt.`);
      createOpening(w,{...o,id:o.id});
    }

    S.pointCounter=snap.pointCounter;S.contourCounter=snap.contourCounter;
    S.selectedLineId=getLine(snap.selected.line)?.id||null;
    S.selectedPointId=getPoint(snap.selected.point)?.id||null;
    S.selectedShapeId=S.shapes.find(x=>x.id===snap.selected.shape)?.id||null;
    S.selectedWallId=S.walls.find(x=>x.id===snap.selected.wall)?.id||null;
    S.selectedOpeningId=S.openings.find(x=>x.id===snap.selected.opening)?.id||null;
    S.selectedAiObjectId=S.aiObjects.find(x=>x.id===snap.selected.aiObject)?.id||null;

    if(snap.wallTool)Object.assign(S.wallTool,snap.wallTool);
    const t=snap.tool;
    S.tool.kind=t.kind;S.tool.status=t.status;S.tool.activePointId=getPoint(t.activePointId)?.id||null;
    S.tool.firstPointId=getPoint(t.firstPointId)?.id||null;
    S.tool.pointIds=t.pointIds.filter(id=>Boolean(getPoint(id)));
    S.tool.lineIds=t.lineIds.filter(id=>Boolean(getLine(id)));
    S.tool.transactions=t.transactions.map(cloneTx);
    S.tool.placement=t.placement;S.tool.distanceM=t.distanceM;S.tool.constraint=t.constraint;S.tool.angleDeg=t.angleDeg;
    S.tool.side=t.side;S.tool.referenceLineId=getLine(t.referenceLineId)?.id||null;
    S.tool.activePlane=restorePlane(t.activePlane);S.tool.candidate=null;
    S.tool.snapMode=t.snapMode;S.tool.snapTolerance=t.snapTolerance;S.tool.snapLineTolerance=t.snapLineTolerance;

    if(S.preview.point)S.preview.point.visible=false;
    if(S.preview.line)S.preview.line.visible=false;
    if(S.preview.label)S.preview.label.style.display="none";

    const check=validateGeometryState();
    if(!check.ok)throw new Error("Historie herstel gaf inconsistente projectstate: "+check.errors[0]);
    document.dispatchEvent(new CustomEvent("measurear:project-restored"));
  }finally{S.history.restoring=false;}
}

export function undoHistory(){
  const entry=S.history.undo.pop();if(!entry)throw new Error("Er is niets om ongedaan te maken.");
  restoreProject(entry.before);S.history.redo.push(entry);emit();return entry;
}
export function redoHistory(){
  const entry=S.history.redo.pop();if(!entry)throw new Error("Er is niets om opnieuw uit te voeren.");
  restoreProject(entry.after);S.history.undo.push(entry);emit();return entry;
}
export function clearHistory(){S.history.undo.length=0;S.history.redo.length=0;emit();}
export function historyStatus(){
  return {
    canUndo:S.history.undo.length>0,canRedo:S.history.redo.length>0,
    undoLabel:S.history.undo.at(-1)?.label||"",redoLabel:S.history.redo.at(-1)?.label||""
  };
}
