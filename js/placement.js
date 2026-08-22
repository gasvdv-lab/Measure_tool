
import {S,$,fmt} from "./state.js";
import {getPoint,getLine,createPoint,createLine} from "./geometry.js";
import {resetTrackingSamples} from "./ar.js";

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
  const param=S.placementMode==="parametric";
  $("placementHud")?.classList.add("visible");
  $("placementModeBtn").textContent=param?"Plaatsing: Op maat":"Plaatsing: Handmatig";
  $("placementParamPanel").classList.toggle("open",param);
  const c=$("placementConstraint").value;
  $("placementAngleWrap").style.display=c==="angle"?"block":"none";
  $("placementReferenceWrap").style.display=["parallel","perpendicular","angle"].includes(c)?"block":"none";
  refreshPlacementReferences();
}
export function togglePlacementMode(){S.placementMode=S.placementMode==="manual"?"parametric":"manual";updatePlacementUI();}
export function computeNext(start){
  if(!start)throw new Error("Plaats/selecteer eerst een vertrekpunt.");
  const d=distanceMeters(),c=$("placementConstraint").value;let dir=cameraDir();
  if(c==="horizontal")dir=horizontal(dir);
  else if(c==="vertical")dir=new S.THREE.Vector3(0,dir.y<0?-1:1,0);
  else if(["parallel","perpendicular","angle"].includes(c)){
    dir=referenceDir();if(!dir)throw new Error("Kies een geldige referentielijn.");
    dir=horizontal(dir);
    if(c==="perpendicular")dir=rotY(dir,90);
    if(c==="angle")dir=rotY(dir,Number($("placementAngle").value)||0);
  }
  return start.position.clone().add(dir.normalize().multiplyScalar(d));
}
export function placeParametricNext(){
  const start=getPoint(S.draw?.active?S.draw.lastId:S.activeStartId);
  if(!start)throw new Error("Plaats/selecteer eerst een vertrekpunt.");
  const b=createPoint(computeNext(start),0xffd166),l=createLine(start,b,{undo:!S.draw?.active});
  if(S.draw?.active){S.draw.pointIds.push(b.id);S.draw.lineIds.push(l.id);S.draw.lastId=b.id;$("drawFinishBtn").disabled=S.draw.pointIds.length<3;}
  S.activeStartId=b.id;S.pointA=b.position.clone();S.lineFinished=false;resetTrackingSamples();
  $("distance").textContent=fmt(l.distance);$("stage").textContent=`Punt ${b.name} op maat geplaatst`;$("detail").textContent=`${l.name} · ${fmt(l.distance)}`;
  refreshPlacementReferences();
}
