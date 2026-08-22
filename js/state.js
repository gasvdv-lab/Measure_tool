export const S={
  version:"0.8.14",build:"20260822-2130",
  THREE:null,renderer:null,scene:null,camera:null,reticle:null,xrSession:null,hitSource:null,hitRequested:false,
  currentTarget:null,targetSource:"none",zoom:1,pointPlacementEpoch:0,
  points:[],lines:[],contours:[],shapes:[],walls:[],
  pointCounter:0,contourCounter:1,
  selectedLineId:null,selectedPointId:null,selectedShapeId:null,selectedWallId:null,objectPickMode:null,pendingContourId:null,
  defaults:{unit:"cm",lineThickness:2,labels:true},
  tool:{
    kind:null,status:"idle",
    activePointId:null,firstPointId:null,
    pointIds:[],lineIds:[],transactions:[],
    placement:"manual",distanceM:1,
    constraint:"free",angleDeg:45,side:1,referenceLineId:null,
    activePlane:null,hoverSurfaceNormal:null,
    candidate:null,snapMode:"smart",snapTolerance:.08,snapLineTolerance:.06
  },
  history:{undo:[],redo:[]},
  preview:{point:null,line:null,label:null},
  diagnostics:{lastError:"",lastCheck:null,confirmBusy:false},
  hud:{compact:true,lastPopover:null}
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
