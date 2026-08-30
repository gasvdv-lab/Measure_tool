export const S={
  version:"0.8.37.1",build:"20260830-rigid-world-lock",
  THREE:null,renderer:null,scene:null,camera:null,reticle:null,xrSession:null,hitSource:null,hitRequested:false,
  currentTarget:null,currentRawTarget:null,currentHitResult:null,currentXRFrame:null,currentReferenceSpace:null,targetSource:"none",zoom:1,pointPlacementEpoch:0,referenceCaptureId:null,
  points:[],lines:[],contours:[],shapes:[],walls:[],openings:[],aiObjects:[],clearances:[],
  wallTool:{height:2.40,thickness:.14,side:"center",orientation:"vertical",angle:90,color:"#d7d2c8",opacity:.65,namePrefix:"Muur"},
  pointCounter:0,contourCounter:1,
  selectedLineId:null,selectedContourId:null,selectedPointId:null,selectedShapeId:null,selectedWallId:null,selectedOpeningId:null,selectedAiObjectId:null,selectedClearanceId:null,selectedSpatialObject:null,objectPickMode:null,pendingContourId:null,
  defaults:{unit:"cm",lineThickness:2,labels:true},
  tool:{
    kind:null,status:"idle",
    activePointId:null,firstPointId:null,
    pointIds:[],lineIds:[],transactions:[],
    placement:"manual",distanceM:1,
    constraint:"free",angleDeg:45,side:1,axisDirection:null,perpendicularMode:"horizontal",referenceLineId:null,
    activePlane:null,hoverSurfaceNormal:null,
    candidate:null,snapMode:"smart",snapTolerance:.08,snapLineTolerance:.06,snapIntersectionTolerance:.08,snapOpeningTolerance:.07
  },
  history:{undo:[],redo:[],limit:80,restoring:false},
  preview:{point:null,line:null,label:null},
  diagnostics:{lastError:"",lastCheck:null,confirmBusy:false},
  worldLock:{mode:"unknown",active:false,anchored:0,pending:0,lastError:"",masterPointId:null,transform:null},
  hud:{compact:true,lastPopover:null},
  project:{
    schemaVersion:1,id:null,name:"Nieuw project",createdAt:null,updatedAt:null,lastSavedAt:null,
    dirty:false,recoveryAvailable:false,loadedFrom:null,
    geo:null,
    hybrid:{savedHeading:null,currentHeading:null,lastAssessment:null,headingSource:null},
    spatial:{projectOrigin:{x:0,y:0,z:0},savedWorldPose:null,savedAt:null,sessionTransform:null},
    cad:{models:[]},
    relocalization:{
      references:[],
      active:false,
      captured:[],
      lastResult:null,
      mode:"auto"
    }
  },
  cadRuntime:{objects:new Map(),activeId:null,placing:false,offsetY:0},
  externalPicker:null,
  cadPickerLifecycle:{active:false,returned:false},
  xrEndIntent:null
};

export const $=id=>document.getElementById(id);
export function fmt(m){
  if(!Number.isFinite(m))return "—";
  return m<1?`${(m*100).toFixed(1)} cm`:m<10?`${m.toFixed(3)} m`:`${m.toFixed(2)} m`;
}
export function fmtUnit(m,unit="auto"){
  if(!Number.isFinite(m))return "—";
  if(unit==="mm")return `${(m*1000).toFixed(0)} mm`;
  if(unit==="cm")return `${(m*100).toFixed(1)} cm`;
  if(unit==="m")return `${m.toFixed(m<10?3:2)} m`;
  return fmt(m);
}
export function fmtLine(line){return fmtUnit(line?.distance,line?.unit||"auto");}
export function fmtAreaUnit(m2,unit="m"){
  if(!Number.isFinite(m2))return "—";
  if(unit==="mm")return `${(m2*1000000).toFixed(0)} mm²`;
  if(unit==="cm")return `${(m2*10000).toFixed(1)} cm²`;
  return `${m2.toFixed(m2<10?3:2)} m²`;
}
export function fmtVolumeUnit(m3,unit="m"){
  if(!Number.isFinite(m3))return "—";
  if(unit==="mm")return `${(m3*1000000000).toFixed(0)} mm³`;
  if(unit==="cm")return `${(m3*1000000).toFixed(1)} cm³`;
  return `${m3.toFixed(m3<10?3:2)} m³`;
}
export function pointName(i){
  const c=String.fromCharCode(65+(i%26)),n=Math.floor(i/26);
  return n?c+n:c;
}
export function projectToWorld(pos){
  let out=pos.clone();
  const tr=S.project?.spatial?.sessionTransform;
  if(tr&&S.THREE){
    const R=new S.THREE.Matrix3().fromArray(tr.R),t=new S.THREE.Vector3(tr.t.x,tr.t.y,tr.t.z);
    out.applyMatrix3(R).add(t);
  }
  // World Lock is one rigid project-frame correction. Never apply independent
  // point corrections: that can stretch, rotate or shear committed geometry.
  const wl=S.worldLock?.transform;
  if(wl&&S.THREE)out.applyMatrix4(new S.THREE.Matrix4().fromArray(wl));
  return out;
}
export function worldToProject(pos){
  let out=pos.clone();
  const wl=S.worldLock?.transform;
  if(wl&&S.THREE)out.applyMatrix4(new S.THREE.Matrix4().fromArray(wl).invert());
  const tr=S.project?.spatial?.sessionTransform;
  if(tr&&S.THREE){
    const R=new S.THREE.Matrix3().fromArray(tr.R),Rt=R.clone().transpose(),t=new S.THREE.Vector3(tr.t.x,tr.t.y,tr.t.z);
    out.sub(t).applyMatrix3(Rt);
  }
  return out;
}
export function getPoint(id){return S.points.find(p=>p.id===id)||null;}
export function getLine(id){return S.lines.find(l=>l.id===id)||null;}
export function getContour(id){return S.contours.find(c=>c.id===id)||null;}
export function getShape(id){return S.shapes.find(s=>s.id===id)||null;}
