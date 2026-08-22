import {S,$,fmt,getPoint,getLine} from "./state.js?v=0.8.12-20260822-2015";
import {createPoint,createLine,deleteLineRaw,deletePointRaw,createContour,dispose} from "./geometry.js?v=0.8.12-20260822-2015";

const REF_MODES=new Set(["parallel","perpendicular","angle"]);
const TOOL_NAMES={line:"LIJN",polyline:"POLYLIJN",shape:"VORM",stake:"UITZETTEN"};

function copyPlane(p){
  if(!p)return null;
  return {origin:p.origin.clone(),normal:p.normal.clone(),u:p.u.clone(),v:p.v.clone()};
}
function makePlane(origin,normal,preferred=null){
  const T=S.THREE,n=(normal?.clone?.()||new T.Vector3(0,1,0)).normalize();
  let u=(preferred?.clone?.()||new T.Vector3(1,0,0));
  u.sub(n.clone().multiplyScalar(u.dot(n)));
  if(u.lengthSq()<1e-8){
    u=Math.abs(n.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0);
    u.sub(n.clone().multiplyScalar(u.dot(n)));
  }
  u.normalize();const v=n.clone().cross(u).normalize();
  return {origin:origin.clone(),normal:n,u,v};
}
function worldHorizontalPlane(origin){
  return makePlane(origin,new S.THREE.Vector3(0,1,0),new S.THREE.Vector3(1,0,0));
}
function planeFromPoint(p,rayDir=null){
  const n=p.surfaceNormal?.clone?.()||new S.THREE.Vector3(0,1,0);
  return makePlane(p.position,n,rayDir);
}
function linePlaneVector(line,plane){
  if(!line||!plane)return null;
  const a=getPoint(line.startId),b=getPoint(line.endId);if(!a||!b)return null;
  const d=b.position.clone().sub(a.position);
  d.sub(plane.normal.clone().multiplyScalar(d.dot(plane.normal)));
  return d.lengthSq()>1e-8?d.normalize():null;
}
function rotateInPlane(vec,plane,deg){
  return vec.clone().applyAxisAngle(plane.normal,S.THREE.MathUtils.degToRad(deg)).normalize();
}
function intersectRayPlane(ray,plane){
  if(!ray||!plane)return null;
  const den=plane.normal.dot(ray.dir);if(Math.abs(den)<.01)return null;
  const t=plane.normal.dot(plane.origin.clone().sub(ray.origin))/den;
  if(t<=0||t>50)return null;
  return ray.origin.clone().add(ray.dir.clone().multiplyScalar(t));
}
function closestPointVertical(ray,origin){
  if(!ray)return null;
  const T=S.THREE,v=new T.Vector3(0,1,0),w0=ray.origin.clone().sub(origin);
  const a=ray.dir.dot(ray.dir),b=ray.dir.dot(v),c=1,d=ray.dir.dot(w0),e=v.dot(w0);
  const den=a*c-b*b;if(Math.abs(den)<1e-8)return null;
  const t=(b*e-c*d)/den,s=(a*e-b*d)/den;
  if(t<=0)return null;
  return origin.clone().add(v.multiplyScalar(s));
}
function requireReference(plane){
  const line=getLine(S.tool.referenceLineId);
  if(!line)throw new Error("Kies eerst een referentielijn.");
  const dir=linePlaneVector(line,plane);
  if(!dir)throw new Error("Referentielijn ligt niet bruikbaar in het actieve tekenvlak.");
  return dir;
}
function directionForExact(ray){
  const active=getActivePoint();if(!active)throw new Error("Geen actief vertrekpunt.");
  const kind=S.tool.constraint;
  const activePlane=S.tool.activePlane||planeFromPoint(active,ray?.dir);
  let dir=ray?.dir?.clone?.()||activePlane.u.clone();

  if(kind==="free"){
    if(S.tool.kind==="shape"){
      dir.sub(activePlane.normal.clone().multiplyScalar(dir.dot(activePlane.normal)));
      if(dir.lengthSq()<1e-8)dir=activePlane.u.clone();
    }else if(dir.lengthSq()<1e-8)dir=activePlane.u.clone();
  }else if(kind==="horizontal"){
    dir.y=0;if(dir.lengthSq()<1e-8)dir.set(1,0,0);
  }else if(kind==="vertical"){
    dir.set(0,(ray?.dir?.y??0)>=0?1:-1,0);
  }else if(kind==="surface"){
    dir.sub(activePlane.normal.clone().multiplyScalar(dir.dot(activePlane.normal)));
    if(dir.lengthSq()<1e-8)throw new Error("Richt de camera meer langs het actieve vlak.");
  }else if(kind==="parallel"){
    dir=requireReference(activePlane).multiplyScalar(S.tool.side);
  }else if(kind==="perpendicular"){
    const ref=requireReference(activePlane);
    dir=activePlane.normal.clone().cross(ref).normalize().multiplyScalar(S.tool.side);
  }else if(kind==="angle"){
    const ref=requireReference(activePlane);
    dir=rotateInPlane(ref,activePlane,S.tool.angleDeg*S.tool.side);
  }
  if(dir.lengthSq()<1e-8)throw new Error("Kon geen geldige richting bepalen.");
  return dir.normalize();
}
function manualCandidate(active,hit,ray){
  const kind=S.tool.constraint;
  const activePlane=S.tool.activePlane||planeFromPoint(active,ray?.dir);
  if(kind==="free"){
    if(S.tool.kind==="shape")return intersectRayPlane(ray,activePlane);
    return hit?.clone?.()||intersectRayPlane(ray,activePlane);
  }
  if(kind==="horizontal"){
    return intersectRayPlane(ray,worldHorizontalPlane(active.position));
  }
  if(kind==="vertical"){
    return closestPointVertical(ray,active.position);
  }
  if(kind==="surface"){
    return intersectRayPlane(ray,activePlane);
  }
  let raw=intersectRayPlane(ray,activePlane)||hit?.clone?.();
  if(!raw)return null;
  let dir;
  if(kind==="parallel")dir=requireReference(activePlane).multiplyScalar(S.tool.side);
  else if(kind==="perpendicular"){
    const ref=requireReference(activePlane);dir=activePlane.normal.clone().cross(ref).normalize().multiplyScalar(S.tool.side);
  }else if(kind==="angle"){
    const ref=requireReference(activePlane);dir=rotateInPlane(ref,activePlane,S.tool.angleDeg*S.tool.side);
  }
  const delta=raw.clone().sub(active.position),scalar=delta.dot(dir);
  return active.position.clone().add(dir.clone().multiplyScalar(scalar));
}
function pointSatisfiesConstraint(p,active){
  if(S.tool.constraint==="free")return true;
  const projected=manualCandidate(active,p.position? p.position:p,null);
  return projected?projected.distanceTo(p.position||p)<.025:false;
}
function snapCandidate(pos,active){
  if(!pos||S.tool.snapMode!=="points")return {position:pos,snappedPointId:null};
  let best=null,bestD=S.tool.snapTolerance;
  for(const p of S.points){
    if(active&&p.id===active.id)continue;
    const d=p.position.distanceTo(pos);
    if(d<bestD){
      if(S.tool.constraint==="free"||!active||pointSatisfiesConstraint(p,active)){best=p;bestD=d;}
    }
  }
  return best?{position:best.position.clone(),snappedPointId:best.id}:{position:pos,snappedPointId:null};
}

function previewObjects(){
  if(S.preview.point&&S.preview.line)return;
  const T=S.THREE;
  const p=new T.Group();
  const sphere=new T.Mesh(new T.SphereGeometry(.018,16,10),new T.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.8}));
  const ring=new T.Mesh(new T.RingGeometry(.027,.034,32),new T.MeshBasicMaterial({color:0xffd166,side:T.DoubleSide,transparent:true,opacity:.85}));
  ring.rotation.x=-Math.PI/2;p.add(sphere,ring);S.scene.add(p);p.visible=false;
  const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]);
  const mat=new T.LineDashedMaterial({color:0xffd166,dashSize:.05,gapSize:.035,transparent:true,opacity:.9});
  const l=new T.Line(geo,mat);l.computeLineDistances();S.scene.add(l);l.visible=false;
  const label=document.createElement("div");label.className="previewLabel";label.style.display="none";$("lineLabels").appendChild(label);
  S.preview={point:p,line:l,label};
}
function updatePreviewVisual(){
  if(!S.THREE||!S.scene)return;
  previewObjects();
  const c=S.tool.candidate,active=getActivePoint();
  if(!c?.valid){
    S.preview.point.visible=false;S.preview.line.visible=false;S.preview.label.style.display="none";return;
  }
  S.preview.point.visible=true;S.preview.point.position.copy(c.position);
  if(active){
    const pos=S.preview.line.geometry.getAttribute("position");
    pos.setXYZ(0,active.position.x,active.position.y,active.position.z);
    pos.setXYZ(1,c.position.x,c.position.y,c.position.z);pos.needsUpdate=true;
    S.preview.line.computeLineDistances();S.preview.line.visible=true;
    S.preview.label.textContent=`${fmt(active.position.distanceTo(c.position))} · ${constraintLabel()}`;
  }else{
    S.preview.line.visible=false;S.preview.label.textContent="Punt A";
  }
}
export function updatePreviewScreen(){
  const c=S.tool.candidate;if(!S.preview.label||!c?.valid||!S.renderer||!S.camera){if(S.preview.label)S.preview.label.style.display="none";return;}
  const q=c.position.clone().project(S.renderer.xr.getCamera(S.camera));
  if(q.z<-1||q.z>1||Math.abs(q.x)>1.2||Math.abs(q.y)>1.2){S.preview.label.style.display="none";return;}
  S.preview.label.style.display="block";S.preview.label.style.left=(q.x*.5+.5)*innerWidth+"px";S.preview.label.style.top=(-q.y*.5+.5)*innerHeight-34+"px";
}
function hidePreview(){
  if(S.preview.point)S.preview.point.visible=false;
  if(S.preview.line)S.preview.line.visible=false;
  if(S.preview.label)S.preview.label.style.display="none";
}
function resetSession(keepSettings=true){
  S.tool.status="idle";S.tool.activePointId=null;S.tool.firstPointId=null;S.tool.pointIds=[];S.tool.lineIds=[];S.tool.transactions=[];S.tool.activePlane=null;S.tool.candidate=null;
  if(!keepSettings){
    S.tool.placement="manual";S.tool.distanceM=1;S.tool.constraint="free";S.tool.referenceLineId=null;S.tool.angleDeg=45;S.tool.side=1;
  }
  hidePreview();
}
export function toolLabel(){return TOOL_NAMES[S.tool.kind]||"TEKENEN";}
export function constraintLabel(){
  return ({free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht",angle:"Eigen hoek"})[S.tool.constraint]||"Vrij";
}
export function getActivePoint(){return getPoint(S.tool.activePointId);}
export function startTool(kind,{startPointId=null}={}){
  if(!TOOL_NAMES[kind])throw new Error("Onbekend tekengereedschap.");
  resetSession(true);S.tool.kind=kind;S.tool.status="drawing";
  if(startPointId){
    const p=getPoint(startPointId);if(!p)throw new Error("Vertrekpunt niet gevonden.");
    S.tool.activePointId=p.id;S.tool.firstPointId=p.id;S.tool.pointIds=[p.id];S.tool.activePlane=planeFromPoint(p);
  }
  document.dispatchEvent(new CustomEvent("measurear:tool-changed"));
  return kind;
}
export function cancelTool(){
  if(S.tool.kind==="polyline"&&S.tool.lineIds.length)createContour(S.tool.pointIds,S.tool.lineIds,{closed:false,kind:"polyline"});
  const old=S.tool.kind;resetSession(true);S.tool.kind=null;document.dispatchEvent(new CustomEvent("measurear:tool-changed"));return old;
}
export function setPlacement(mode){S.tool.placement=mode==="metric"?"metric":"manual";document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setDistance(value,unit="cm"){
  const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new Error("Geef een geldige afstand.");
  S.tool.distanceM=unit==="m"?n:n/100;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));
}
export function setConstraint(mode){S.tool.constraint=mode||"free";document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setAngle(deg){const n=Number(deg);if(!Number.isFinite(n))throw new Error("Ongeldige hoek.");S.tool.angleDeg=n;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function flipSide(){S.tool.side*=-1;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setReferenceLine(id){S.tool.referenceLineId=id||null;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setSnapMode(mode){S.tool.snapMode=mode==="off"?"off":"points";document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function referenceRequired(){return REF_MODES.has(S.tool.constraint);}
export function isCaptureAllowed(){return S.tool.kind&&S.tool.status==="drawing"&&Boolean(S.tool.candidate?.valid);}

export function updateCandidate({hit=null,hitNormal=null,ray=null}={}){
  S.tool.hoverSurfaceNormal=hitNormal?.clone?.()||S.tool.hoverSurfaceNormal;
  if(!S.tool.kind||S.tool.status!=="drawing"){S.tool.candidate=null;hidePreview();return;}
  const active=getActivePoint();
  try{
    let pos=null,planeNormal=hitNormal?.clone?.()||null;
    if(!active){
      if(!hit)throw new Error("Zoek eerst een herkenbaar oppervlak voor punt A.");
      pos=hit.clone();
    }else if(S.tool.placement==="metric"){
      const dir=directionForExact(ray);pos=active.position.clone().add(dir.multiplyScalar(S.tool.distanceM));
      planeNormal=S.tool.activePlane?.normal?.clone?.()||active.surfaceNormal?.clone?.()||null;
    }else{
      pos=manualCandidate(active,hit,ray);
      planeNormal=S.tool.activePlane?.normal?.clone?.()||active.surfaceNormal?.clone?.()||hitNormal?.clone?.()||null;
      if(!pos)throw new Error("Geen geldig kandidaatpunt in deze richting.");
    }
    const snapped=snapCandidate(pos,active);
    S.tool.candidate={valid:true,position:snapped.position,snappedPointId:snapped.snappedPointId,surfaceNormal:planeNormal,reason:""};
  }catch(err){
    S.tool.candidate={valid:false,position:null,snappedPointId:null,surfaceNormal:null,reason:err.message||String(err)};
  }
  updatePreviewVisual();
  document.dispatchEvent(new CustomEvent("measurear:candidate-changed"));
}

function transaction(tx){
  S.tool.transactions.push(tx);S.history.undo.push(tx);S.history.redo.length=0;
}
export function confirmCandidate(){
  if(S.diagnostics.confirmBusy)throw new Error("Punt wordt al bevestigd.");
  S.diagnostics.confirmBusy=true;
  try{
    if(!isCaptureAllowed())throw new Error(S.tool.candidate?.reason||"Geen geldig punt om te plaatsen.");
    const c=S.tool.candidate,active=getActivePoint();

    if(!active){
      let p,created=false;
      if(c.snappedPointId)p=getPoint(c.snappedPointId);
      else{p=createPoint(c.position,{surfaceNormal:c.surfaceNormal||S.tool.hoverSurfaceNormal});created=true;}
      S.tool.activePointId=p.id;S.tool.firstPointId=p.id;S.tool.pointIds=[p.id];S.tool.activePlane=planeFromPoint(p);
      transaction({type:"start",tool:S.tool.kind,pointId:p.id,createdPoint:created});
      S.tool.candidate=null;hidePreview();
      document.dispatchEvent(new CustomEvent("measurear:reset-tracking"));
      return {type:"point",point:p};
    }

    let end,created=false;
    if(c.snappedPointId)end=getPoint(c.snappedPointId);
    else{end=createPoint(c.position,{color:0xffd166,surfaceNormal:c.surfaceNormal});created=true;}
    if(!end||end.id===active.id)throw new Error("Het eindpunt valt samen met het vertrekpunt.");

    let line;
    try{line=createLine(active,end);}
    catch(err){
      if(created&&!S.lines.some(l=>l.startId===end.id||l.endId===end.id))deletePointRaw(end.id);
      throw err;
    }

    S.tool.lineIds.push(line.id);
    if(!S.tool.pointIds.includes(end.id))S.tool.pointIds.push(end.id);
    const tx={type:"segment",tool:S.tool.kind,lineId:line.id,createdPoint:created?end.id:null,previousActiveId:active.id,endId:end.id};
    transaction(tx);
    S.tool.activePointId=end.id;
    if(end.surfaceNormal&&S.tool.kind!=="shape")S.tool.activePlane=planeFromPoint(end);
    S.tool.candidate=null;hidePreview();
    if(S.tool.kind==="line"||S.tool.kind==="stake")S.tool.status="complete";
    document.dispatchEvent(new CustomEvent("measurear:reset-tracking"));
    return {type:"segment",point:end,line,complete:S.tool.status==="complete"};
  }finally{
    S.diagnostics.confirmBusy=false;
  }
}

export function undoToolStep(){
  const tx=S.tool.transactions.pop();if(!tx)throw new Error("Er is niets om ongedaan te maken.");
  S.history.undo.pop();S.history.redo.push(tx);
  if(tx.type==="segment"){
    deleteLineRaw(tx.lineId);
    if(tx.createdPoint&&!S.lines.some(l=>l.startId===tx.createdPoint||l.endId===tx.createdPoint))deletePointRaw(tx.createdPoint);
    S.tool.lineIds=S.tool.lineIds.filter(id=>id!==tx.lineId);
    S.tool.pointIds=S.tool.pointIds.filter(id=>id!==tx.endId||id===S.tool.firstPointId);
    S.tool.activePointId=tx.previousActiveId;S.tool.status="drawing";
    const p=getActivePoint();if(p)S.tool.activePlane=planeFromPoint(p);
  }else if(tx.type==="closing"){
    deleteLineRaw(tx.lineId);
    S.tool.lineIds=S.tool.lineIds.filter(id=>id!==tx.lineId);
    S.tool.activePointId=tx.previousActiveId;
    S.tool.status="drawing";
  }else if(tx.type==="closing"){
    deleteLineRaw(tx.lineId);
    S.tool.lineIds=S.tool.lineIds.filter(id=>id!==tx.lineId);
    S.tool.activePointId=tx.previousActiveId;
    S.tool.status="drawing";
  }else if(tx.type==="start"){
    if(tx.createdPoint&&!S.lines.some(l=>l.startId===tx.pointId||l.endId===tx.pointId))deletePointRaw(tx.pointId);
    S.tool.activePointId=null;S.tool.firstPointId=null;S.tool.pointIds=[];S.tool.activePlane=null;
  }
  hidePreview();return tx;
}

export function finishTool(){
  if(S.tool.kind==="polyline"){
    if(!S.tool.lineIds.length)throw new Error("Teken eerst minstens één segment.");
    const contour=createContour(S.tool.pointIds,S.tool.lineIds,{closed:false,kind:"polyline"});
    S.tool.status="complete";S.tool.transactions=[];hidePreview();return {type:"polyline",contour};
  }
  if(S.tool.kind==="shape"){
    if(S.tool.pointIds.length<3)throw new Error("Een vorm vereist minstens 3 punten.");
    const first=getPoint(S.tool.firstPointId),last=getActivePoint();if(!first||!last)throw new Error("Vormpunten ontbreken.");
    if(last.id!==first.id){
      const existing=S.lines.find(l=>(l.startId===last.id&&l.endId===first.id)||(l.startId===first.id&&l.endId===last.id));
      if(existing){
        if(!S.tool.lineIds.includes(existing.id))S.tool.lineIds.push(existing.id);
      }else{
        const closing=createLine(last,first);
        S.tool.lineIds.push(closing.id);
        transaction({type:"closing",tool:"shape",lineId:closing.id,previousActiveId:last.id,endId:first.id});
      }
    }
    const contour=createContour(S.tool.pointIds,S.tool.lineIds,{closed:true,kind:"shape"});
    S.pendingContourId=contour.id;S.tool.status="complete";S.tool.transactions=[];hidePreview();return {type:"shape",contour};
  }
  throw new Error("Dit gereedschap heeft geen Voltooien-functie.");
}

export function resetDrawingCore(){
  resetSession(false);S.tool.kind=null;S.history.undo.length=0;S.history.redo.length=0;document.dispatchEvent(new CustomEvent("measurear:tool-changed"));
}
