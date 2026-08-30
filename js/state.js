export const S={
  version:"0.8.29.2",build:"20260830-navigation-core",
  THREE:null,renderer:null,scene:null,camera:null,reticle:null,xrSession:null,hitSource:null,hitRequested:false,
  currentTarget:null,currentRawTarget:null,currentHitResult:null,currentXRFrame:null,currentReferenceSpace:null,targetSource:"none",zoom:1,pointPlacementEpoch:0,referenceCaptureId:null,
  points:[],lines:[],contours:[],shapes:[],walls:[],openings:[],aiObjects:[],
  wallTool:{height:2.40,thickness:.14,side:"center",orientation:"vertical",angle:90,color:"#d7d2c8",opacity:.65,namePrefix:"Muur"},
  pointCounter:0,contourCounter:1,
  selectedLineId:null,selectedPointId:null,selectedShapeId:null,selectedWallId:null,selectedOpeningId:null,selectedAiObjectId:null,objectPickMode:null,pendingContourId:null,
  defaults:{unit:"cm",lineThickness:2,labels:true},
  tool:{
    kind:null,status:"idle",
    activePointId:null,firstPointId:null,
    pointIds:[],lineIds:[],transactions:[],
    placement:"manual",distanceM:1,
    constraint:"free",angleDeg:45,side:1,referenceLineId:null,
    activePlane:null,hoverSurfaceNormal:null,
    candidate:null,snapMode:"smart",snapTolerance:.08,snapLineTolerance:.06,snapIntersectionTolerance:.08,snapOpeningTolerance:.07
  },
  history:{undo:[],redo:[],limit:80,restoring:false},
  preview:{point:null,line:null,label:null},
  diagnostics:{lastError:"",lastCheck:null,confirmBusy:false},
  worldLock:{mode:"unknown",active:false,anchored:0,pending:0,lastError:""},
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
export function pointName(i){
  const c=String.fromCharCode(65+(i%26)),n=Math.floor(i/26);
  return n?c+n:c;
}
export function projectToWorld(pos){
  const tr=S.project?.spatial?.sessionTransform;if(!tr||!S.THREE)return pos.clone();
  const R=new S.THREE.Matrix3().fromArray(tr.R),t=new S.THREE.Vector3(tr.t.x,tr.t.y,tr.t.z);
  return pos.clone().applyMatrix3(R).add(t);
}
export function worldToProject(pos){
  const tr=S.project?.spatial?.sessionTransform;if(!tr||!S.THREE)return pos.clone();
  const R=new S.THREE.Matrix3().fromArray(tr.R),Rt=R.clone().transpose(),t=new S.THREE.Vector3(tr.t.x,tr.t.y,tr.t.z);
  return pos.clone().sub(t).applyMatrix3(Rt);
}
export function getPoint(id){return S.points.find(p=>p.id===id)||null;}
export function getLine(id){return S.lines.find(l=>l.id===id)||null;}
export function getContour(id){return S.contours.find(c=>c.id===id)||null;}
export function getShape(id){return S.shapes.find(s=>s.id===id)||null;}
