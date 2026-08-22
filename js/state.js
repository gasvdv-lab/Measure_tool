
export const S={
  version:"0.8.9.2",build:"20260822-1840",
  THREE:null,renderer:null,scene:null,camera:null,reticle:null,xrSession:null,hitSource:null,hitRequested:false,
  mode:"measure",targetMeters:2,
  pointA:null,activeStartId:null,currentTarget:null,targetSource:"none",lineFinished:false,placing:false,
  points:[],lines:[],contours:[],shapes:[],walls:[],undo:[],
  pointCounter:0,contourCounter:1,selectedLineId:null,selectedPointId:null,selectedWallId:null,selectedShapeId:null,pendingContourId:null,objectPickMode:null,
  draw:{active:false,startId:null,lastId:null,pointIds:[],lineIds:[]},
  samples:[],
  zoom:1, pointPlacementEpoch:0,
  drawEngine:{mode:"manual",activePointId:null,distanceCm:100,direction:"free",angleDeg:45,referenceLineId:null,hoverSurfaceNormal:null,surfaceNormal:null},
};
export const $=id=>document.getElementById(id);
export function fmt(m){return m<1?`${(m*100).toFixed(1)} cm`:m<10?`${m.toFixed(3)} m`:`${m.toFixed(2)} m`;}
export function pointName(i){const c=String.fromCharCode(65+i%26),n=Math.floor(i/26);return n?c+n:c;}
export function getPoint(id){return S.points.find(p=>p.id===id)||null;}
export function getLine(id){return S.lines.find(l=>l.id===id)||null;}
export function getContour(id){return S.contours.find(c=>c.id===id)||null;}
