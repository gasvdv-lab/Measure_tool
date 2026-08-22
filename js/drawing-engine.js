import {S,$,fmt,getPoint,getLine} from "./state.js?v=0.8.10-20260822-1930";
import {createPoint,createLine,deletePointRaw} from "./geometry.js?v=0.8.10-20260822-1930";

export function getActivePoint(){
  const id=S.draw?.active ? S.draw.lastId : S.drawEngine.activePointId;
  return getPoint(id);
}

export function setActivePoint(id){
  const p=getPoint(id);
  if(!p)throw new Error("Actief vertrekpunt niet gevonden.");
  S.drawEngine.activePointId=id;
  S.activeStartId=id;
  S.pointA=p.position.clone();
  S.drawEngine.surfaceNormal=p.surfaceNormal?.clone?.() || S.drawEngine.hoverSurfaceNormal?.clone?.() || null;
  document.dispatchEvent(new CustomEvent("measurear:active-point-changed",{detail:{pointId:id}}));
  return p;
}

export function clearActivePoint(){
  S.drawEngine.activePointId=null;
  S.activeStartId=null;
  S.pointA=null;
  S.drawEngine.surfaceNormal=null;
}

export function setPlacementMode(mode){S.drawEngine.mode=mode==="metric"?"metric":"manual";}
export function setDirection(mode){S.drawEngine.direction=mode||"free";}
export function setDistanceCm(v){const n=Number(v);if(Number.isFinite(n)&&n>0)S.drawEngine.distanceCm=n;}
export function setAngleDeg(v){const n=Number(v);if(Number.isFinite(n))S.drawEngine.angleDeg=n;}
export function setReferenceLine(id){S.drawEngine.referenceLineId=id||null;}
export function setHoverSurfaceNormal(n){S.drawEngine.hoverSurfaceNormal=n?.clone?.()||null;}

export function referenceVector(){
  const line=getLine(S.drawEngine.referenceLineId);
  if(!line)return null;
  const a=getPoint(line.startId), b=getPoint(line.endId);
  if(!a||!b)return null;
  const v=b.position.clone().sub(a.position);
  return v.lengthSq()>1e-10?v.normalize():null;
}

function cameraForward(){
  const c=S.renderer?.xr?.getCamera?.(S.camera);
  if(!c)return new S.THREE.Vector3(1,0,0);
  const q=new S.THREE.Quaternion();
  c.getWorldQuaternion(q);
  return new S.THREE.Vector3(0,0,-1).applyQuaternion(q).normalize();
}
function horizontal(v){
  const d=v.clone();d.y=0;
  return d.lengthSq()>1e-10?d.normalize():new S.THREE.Vector3(1,0,0);
}
function rotateY(v,deg){
  return v.clone().applyAxisAngle(new S.THREE.Vector3(0,1,0),deg*Math.PI/180).normalize();
}
function chooseSign(dir,hint){
  if(!hint||hint.lengthSq()<1e-10)return dir;
  return dir.dot(hint)>=0?dir:dir.multiplyScalar(-1);
}

export function validateDirection(){
  const mode=S.drawEngine.direction;
  if(["parallel","perpendicular","angle"].includes(mode) && !referenceVector()){
    throw new Error("Deze richting vereist een referentielijn.");
  }
  if(mode==="surface" && !S.drawEngine.surfaceNormal){
    throw new Error("Geen vast tekenvlak beschikbaar bij het vertrekpunt.");
  }
  return true;
}

export function resolveMetricDirection(){
  validateDirection();
  const kind=S.drawEngine.direction;
  const cam=cameraForward();
  const ref=referenceVector();
  let dir=cam.clone();

  if(kind==="free"){
    dir=cam.clone();
  }else if(kind==="horizontal"){
    dir=horizontal(cam);
  }else if(kind==="vertical"){
    dir=new S.THREE.Vector3(0,cam.y<0?-1:1,0);
  }else if(kind==="surface"){
    const n=S.drawEngine.surfaceNormal.clone().normalize();
    dir=cam.clone().sub(n.multiplyScalar(cam.dot(n)));
    if(dir.lengthSq()<1e-10)throw new Error("Richt de camera meer langs het gekozen oppervlak.");
  }else if(kind==="parallel"){
    dir=chooseSign(ref.clone(),horizontal(cam));
  }else if(kind==="perpendicular"){
    dir=new S.THREE.Vector3(-ref.z,0,ref.x);
    if(dir.lengthSq()<1e-10)throw new Error("Loodrechte richting kon niet worden bepaald.");
    dir=chooseSign(dir.normalize(),horizontal(cam));
  }else if(kind==="angle"){
    dir=rotateY(horizontal(ref),S.drawEngine.angleDeg);
    dir=chooseSign(dir,horizontal(cam));
  }

  if(dir.lengthSq()<1e-10)throw new Error("De gekozen richting is ongeldig.");
  return dir.normalize();
}

export function constrainManualTarget(candidate,start=null){
  if(!candidate)return null;
  const p=start||getActivePoint();
  if(!p || S.drawEngine.direction==="free")return candidate.clone();

  validateDirection();
  const delta=candidate.clone().sub(p.position);
  if(delta.lengthSq()<1e-10)return candidate.clone();

  const kind=S.drawEngine.direction;
  const ref=referenceVector();
  let resultDelta=delta.clone();

  if(kind==="horizontal"){
    resultDelta.y=0;
  }else if(kind==="vertical"){
    resultDelta.set(0,delta.y,0);
  }else if(kind==="surface"){
    const n=S.drawEngine.surfaceNormal.clone().normalize();
    resultDelta.sub(n.multiplyScalar(resultDelta.dot(n)));
  }else if(kind==="parallel"){
    const dir=chooseSign(ref.clone(),delta);
    resultDelta=dir.multiplyScalar(Math.abs(delta.dot(dir)));
  }else if(kind==="perpendicular"){
    let dir=new S.THREE.Vector3(-ref.z,0,ref.x);
    if(dir.lengthSq()<1e-10)throw new Error("Loodrechte richting kon niet worden bepaald.");
    dir=chooseSign(dir.normalize(),delta);
    resultDelta=dir.multiplyScalar(Math.abs(delta.dot(dir)));
  }else if(kind==="angle"){
    let dir=rotateY(horizontal(ref),S.drawEngine.angleDeg);
    dir=chooseSign(dir,delta);
    resultDelta=dir.multiplyScalar(Math.abs(delta.dot(dir)));
  }

  if(resultDelta.lengthSq()<1e-10)return null;
  return p.position.clone().add(resultDelta);
}

export function computeMetricPoint(start=null){
  const p=start||getActivePoint();
  if(!p)throw new Error("Plaats of selecteer eerst een vertrekpunt.");
  const dist=S.drawEngine.distanceCm/100;
  return p.position.clone().add(resolveMetricDirection().multiplyScalar(dist));
}

export function previewSummary(){
  const p=getActivePoint();
  if(!p)return "Preview: —";
  try{
    const pos=computeMetricPoint(p);
    const distance=p.position.distanceTo(pos);
    const names={free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht",angle:`${S.drawEngine.angleDeg}°`};
    return `Preview: ${p.name} → nieuw punt · ${fmt(distance)} · ${names[S.drawEngine.direction]||S.drawEngine.direction}`;
  }catch(e){
    return "Preview: "+(e.message||String(e));
  }
}

export function placeMetricPoint(){
  const start=getActivePoint();
  if(!start)throw new Error("Plaats of selecteer eerst een vertrekpunt.");

  const end=createPoint(computeMetricPoint(start),0xffd166);
  let line;
  try{line=createLine(start,end,{undo:!S.draw?.active});}
  catch(e){deletePointRaw(end.id);throw e;}

  if(S.draw?.active){
    S.draw.pointIds.push(end.id);
    S.draw.lineIds.push(line.id);
    S.draw.lastId=end.id;
    if($("drawFinishBtn"))$("drawFinishBtn").disabled=S.draw.pointIds.length<3;
  }

  setActivePoint(end.id);
  S.lineFinished=false;

  if($("distance"))$("distance").textContent=fmt(line.distance);
  if($("stage"))$("stage").textContent=`Punt ${end.name} vastgezet`;
  if($("detail"))$("detail").textContent=`${line.name} · ${fmt(line.distance)}`;
  if($("hint"))$("hint").textContent=`Vertrekpunt ${end.name} actief. Kies de volgende stap.`;

  document.dispatchEvent(new CustomEvent("measurear:reset-tracking"));
  return {point:end,line};
}
