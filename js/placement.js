import {S,$,fmt,getPoint,getLine} from "./state.js?v=0.8.8.2-20260822-1625";
import {createPoint,createLine,deletePointRaw} from "./geometry.js?v=0.8.8.2-20260822-1625";
import {resetTrackingSamples} from "./ar.js?v=0.8.8.2-20260822-1625";

function distanceMeters(){
  const n=Number($("placementDistance")?.value);
  if(!Number.isFinite(n)||n<=0)throw new Error("Geef een geldige afstand groter dan 0.");
  return $("placementUnit")?.value==="cm"?n/100:n;
}
function cameraDir(){
  const c=S.renderer?.xr?.getCamera?.(S.camera);
  if(!c)return new S.THREE.Vector3(1,0,0);
  const q=new S.THREE.Quaternion();c.getWorldQuaternion(q);
  return new S.THREE.Vector3(0,0,-1).applyQuaternion(q).normalize();
}
function horizontal(v){const d=v.clone();d.y=0;return d.lengthSq()>1e-8?d.normalize():new S.THREE.Vector3(1,0,0);}
function referenceDir(){
  const id=$("placementReference")?.value||S.placementReferenceLineId;
  const l=getLine(id);if(!l)return null;
  const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)return null;
  const d=b.position.clone().sub(a.position);return d.lengthSq()>1e-8?d.normalize():null;
}
function rotY(v,deg){return v.clone().applyAxisAngle(new S.THREE.Vector3(0,1,0),deg*Math.PI/180).normalize();}
export function getParametricStartPoint(){
  const id=S.parametric?.startPointId||(S.draw?.active?S.draw.lastId:S.activeStartId);
  return getPoint(id);
}
export function setParametricStartPoint(id){
  const p=getPoint(id);if(!p)throw new Error("Vertrekpunt niet gevonden.");
  S.parametric.active=true;S.parametric.startPointId=id;S.activeStartId=id;S.pointA=p.position.clone();
  updatePlacementUI();return p;
}
export function cancelParametricMode(){S.parametric.active=false;S.parametric.startPointId=null;}
export function refreshPlacementReferences(){
  const e=$("placementReference");if(!e)return;const old=e.value;e.innerHTML="";
  if(!S.lines.length){e.add(new Option("Nog geen lijnen",""));return;}
  S.lines.forEach(l=>e.add(new Option(`${l.name} · ${fmt(l.distance)}`,l.id)));
  if(S.lines.some(l=>l.id===old))e.value=old;
  else if(S.placementReferenceLineId&&S.lines.some(l=>l.id===S.placementReferenceLineId))e.value=S.placementReferenceLineId;
}
export function computeParametricPoint(start){
  if(!start)throw new Error("Plaats of selecteer eerst een vertrekpunt.");
  const d=distanceMeters(),c=$("placementConstraint")?.value||"free";let dir=cameraDir();
  if(c==="horizontal")dir=horizontal(dir);
  else if(c==="vertical")dir=new S.THREE.Vector3(0,dir.y<0?-1:1,0);
  else if(c==="surface")dir=horizontal(dir);
  else if(["parallel","perpendicular","angle"].includes(c)){
    const ref=referenceDir();if(!ref)throw new Error("Kies eerst een geldige referentielijn.");
    dir=horizontal(ref);
    if(c==="perpendicular")dir=rotY(dir,90);
    if(c==="angle")dir=rotY(dir,Number($("placementAngle")?.value)||0);
  }
  if(dir.lengthSq()<1e-8)throw new Error("De gekozen richting is ongeldig.");
  return start.position.clone().add(dir.normalize().multiplyScalar(d));
}
export function updatePlacementUI(){
  const c=$("placementConstraint")?.value||"free";
  if($("placementAngleWrap"))$("placementAngleWrap").style.display=c==="angle"?"block":"none";
  if($("placementReferenceWrap"))$("placementReferenceWrap").style.display=["parallel","perpendicular","angle"].includes(c)?"block":"none";
  refreshPlacementReferences();
  const start=getParametricStartPoint();
  if($("placementStartInfo"))$("placementStartInfo").textContent=start?`Vertrekpunt: ${start.name}`:"Vertrekpunt: geen";
  if($("placementContextInfo"))$("placementContextInfo").textContent=start?`Volgend punt vanaf ${start.name}.`:"Plaats of selecteer eerst een vast vertrekpunt.";
  if($("placementPreviewInfo")){
    try{
      if(!start)throw new Error("—");
      const pos=computeParametricPoint(start);
      const dist=start.position.distanceTo(pos);
      const dir=$("placementConstraint")?.selectedOptions?.[0]?.textContent||"Vrij";
      $("placementPreviewInfo").textContent=`Preview: ${start.name} → nieuw punt · ${fmt(dist)} · ${dir}`;
    }catch(e){$("placementPreviewInfo").textContent="Preview: "+(e.message||"—");}
  }
}
export function placeParametricNext(){
  const start=getParametricStartPoint();if(!start)throw new Error("Plaats of selecteer eerst een vertrekpunt.");
  const b=createPoint(computeParametricPoint(start),0xffd166);
  let l;try{l=createLine(start,b,{undo:!S.draw?.active});}catch(e){deletePointRaw(b.id);throw e;}
  if(S.draw?.active){S.draw.pointIds.push(b.id);S.draw.lineIds.push(l.id);S.draw.lastId=b.id;if($("drawFinishBtn"))$("drawFinishBtn").disabled=S.draw.pointIds.length<3;}
  S.parametric.active=true;S.parametric.startPointId=b.id;S.activeStartId=b.id;S.pointA=b.position.clone();S.lineFinished=false;
  resetTrackingSamples();
  if($("distance"))$("distance").textContent=fmt(l.distance);
  if($("stage"))$("stage").textContent=`Punt ${b.name} op maat vastgezet`;
  if($("detail"))$("detail").textContent=`${l.name} · ${fmt(l.distance)}`;
  if($("hint"))$("hint").textContent=`Vertrekpunt ${b.name} actief. Kies de volgende maat of Handmatig.`;
  updatePlacementUI();
  return {point:b,line:l};
}
