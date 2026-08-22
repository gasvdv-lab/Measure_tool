
import {S,$,fmt} from "./state.js?v=0.8.8-20260822-1605";
import {getPoint,getLine,createPoint,createLine} from "./geometry.js?v=0.8.8-20260822-1605";
import {resetTrackingSamples} from "./ar.js?v=0.8.8-20260822-1605";

function distanceMeters(){
  const n=Number($("placementDistance").value);
  if(!Number.isFinite(n)||n<=0)throw new Error("Geef een geldige afstand.");
  return $("placementUnit").value==="cm"?n/100:n;
}
function cameraDir(){
  const c=S.renderer.xr.getCamera(S.camera),q=new S.THREE.Quaternion();
  c.getWorldQuaternion(q);return new S.THREE.Vector3(0,0,-1).applyQuaternion(q).normalize();
}
function horizontal(v){v=v.clone();v.y=0;return v.lengthSq()>1e-8?v.normalize():new S.THREE.Vector3(1,0,0);}
function referenceDir(){
  const l=getLine($("placementReference").value);if(!l)return null;
  const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)return null;
  return b.position.clone().sub(a.position).normalize();
}
function rotY(v,deg){return v.clone().applyAxisAngle(new S.THREE.Vector3(0,1,0),deg*Math.PI/180).normalize();}
export function refreshPlacementReferences(){
  const e=$("placementReference");if(!e)return;const old=e.value;e.innerHTML="";
  if(!S.lines.length){e.add(new Option("Nog geen lijnen",""));return;}
  S.lines.forEach(l=>e.add(new Option(`${l.name} · ${fmt(l.distance)}`,l.id)));
  if(S.lines.some(l=>l.id===old))e.value=old;
}
export function updatePlacementUI(){
  const c=$("placementConstraint")?.value||"free";
  const a=$("placementAngleWrap"),r=$("placementReferenceWrap");
  if(a)a.style.display=c==="angle"?"block":"none";
  if(r)r.style.display=["parallel","perpendicular","angle"].includes(c)?"block":"none";
  refreshPlacementReferences();
}
export function togglePlacementMode(){
  S.placementMode=S.placementMode==="manual"?"parametric":"manual";
}
export function placeParametricNext(){
  S.placementMode="parametric";
  const start=getPoint(S.draw?.active?S.draw.lastId:S.activeStartId);
  if(!start)throw new Error("Plaats/selecteer eerst een vertrekpunt.");
  const b=createPoint(computeNext(start),0xffd166),l=createLine(start,b,{undo:!S.draw?.active});
  if(S.draw?.active){S.draw.pointIds.push(b.id);S.draw.lineIds.push(l.id);S.draw.lastId=b.id;$("drawFinishBtn").disabled=S.draw.pointIds.length<3;}
  S.activeStartId=b.id;S.pointA=b.position.clone();S.lineFinished=false;resetTrackingSamples();
  $("distance").textContent=fmt(l.distance);$("stage").textContent=`Punt ${b.name} op maat geplaatst`;$("detail").textContent=`${l.name} · ${fmt(l.distance)}`;
  refreshPlacementReferences();
}
