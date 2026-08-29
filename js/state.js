export const S={
  version:"0.8.28",build:"20260829-1850",
  THREE:null,renderer:null,scene:null,camera:null,reticle:null,xrSession:null,hitSource:null,hitRequested:false,
  currentTarget:null,currentHitResult:null,currentXRFrame:null,currentReferenceSpace:null,targetSource:"none",zoom:1,pointPlacementEpoch:0,
  points:[],lines:[],contours:[],shapes:[],walls:[],openings:[],
  wallTool:{height:2.40,thickness:.14,side:"center",orientation:"vertical",angle:90,color:"#d7d2c8",opacity:.65,namePrefix:"Muur"},
  pointCounter:0,contourCounter:1,
  selectedLineId:null,selectedPointId:null,selectedShapeId:null,selectedWallId:null,selectedOpeningId:null,objectPickMode:null,pendingContourId:null,
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
  relocalizationAimMode:false,
  project:{
    schemaVersion:1,id:null,name:"Nieuw project",createdAt:null,updatedAt:null,lastSavedAt:null,
    dirty:false,recoveryAvailable:false,loadedFrom:null,
    geo:null,
    spatial:{projectOrigin:{x:0,y:0,z:0},savedWorldPose:null,savedAt:null},
    relocalization:{
      references:[],
      active:false,
      captured:[],
      lastResult:null,
      mode:"auto"
    }
  }
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
export function getPoint(id){return S.points.find(p=>p.id===id)||null;}
export function getLine(id){return S.lines.find(l=>l.id===id)||null;}
export function getContour(id){return S.contours.find(c=>c.id===id)||null;}
export function getShape(id){return S.shapes.find(s=>s.id===id)||null;}
