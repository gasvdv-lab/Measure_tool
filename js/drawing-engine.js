import {S,$,fmt,getPoint,getLine} from "./state.js?v=0.8.9-20260822-1645";
import {createPoint,createLine,deletePointRaw} from "./geometry.js?v=0.8.9-20260822-1645";
import {resetTrackingSamples} from "./ar.js?v=0.8.9-20260822-1645";

export function getActivePoint(){const id=S.draw?.active?S.draw.lastId:S.drawEngine.activePointId;return getPoint(id);}
export function setActivePoint(id){const p=getPoint(id);if(!p)throw new Error("Actief vertrekpunt niet gevonden.");S.drawEngine.activePointId=id;S.activeStartId=id;S.pointA=p.position.clone();return p;}
export function clearActivePoint(){S.drawEngine.activePointId=null;}
export function setPlacementMode(mode){S.drawEngine.mode=mode==="metric"?"metric":"manual";}
export function setDirection(mode){S.drawEngine.direction=mode||"free";}
export function setDistanceCm(v){const n=Number(v);if(Number.isFinite(n)&&n>0)S.drawEngine.distanceCm=n;}
export function setAngleDeg(v){const n=Number(v);if(Number.isFinite(n))S.drawEngine.angleDeg=n;}
export function setReferenceLine(id){S.drawEngine.referenceLineId=id||null;}
export function setSurfaceNormal(n){S.drawEngine.surfaceNormal=n?n.clone():null;}
export function referenceVector(){const l=getLine(S.drawEngine.referenceLineId);if(!l)return null;const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)return null;const v=b.position.clone().sub(a.position);return v.lengthSq()>1e-10?v.normalize():null;}
function cameraForward(){const c=S.renderer?.xr?.getCamera?.(S.camera);if(!c)return new S.THREE.Vector3(1,0,0);const q=new S.THREE.Quaternion();c.getWorldQuaternion(q);return new S.THREE.Vector3(0,0,-1).applyQuaternion(q).normalize();}
function horizontal(v){const d=v.clone();d.y=0;return d.lengthSq()>1e-10?d.normalize():new S.THREE.Vector3(1,0,0);}
function rotateY(v,deg){return v.clone().applyAxisAngle(new S.THREE.Vector3(0,1,0),deg*Math.PI/180).normalize();}
export function resolveDirection(){
 const kind=S.drawEngine.direction;let dir=cameraForward();const ref=referenceVector();
 if(kind==="horizontal")dir=horizontal(dir);
 else if(kind==="vertical")dir=new S.THREE.Vector3(0,dir.y<0?-1:1,0);
 else if(kind==="surface"){const n=S.drawEngine.surfaceNormal;if(n){const nn=n.clone().normalize();dir.sub(nn.multiplyScalar(dir.dot(nn)));if(dir.lengthSq()<1e-10)dir=horizontal(cameraForward());}else dir=horizontal(dir);}
 else if(kind==="parallel"){if(!ref)throw new Error("Kies eerst een referentielijn.");dir=ref.clone();}
 else if(kind==="perpendicular"){if(!ref)throw new Error("Kies eerst een referentielijn.");dir.set(-ref.z,0,ref.x);if(dir.lengthSq()<1e-10)dir=new S.THREE.Vector3(0,1,0);}
 else if(kind==="angle"){const base=ref?horizontal(ref):horizontal(dir);dir=rotateY(base,S.drawEngine.angleDeg);}
 if(dir.lengthSq()<1e-10)throw new Error("De gekozen richting is ongeldig.");return dir.normalize();
}
export function computeMetricPoint(start=null){const p=start||getActivePoint();if(!p)throw new Error("Plaats of selecteer eerst een vertrekpunt.");return p.position.clone().add(resolveDirection().multiplyScalar(S.drawEngine.distanceCm/100));}
export function previewSummary(){const p=getActivePoint();if(!p)return "Preview: —";try{const pos=computeMetricPoint(p),distance=p.position.distanceTo(pos);const n={free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht",angle:`${S.drawEngine.angleDeg}°`};return `Preview: ${p.name} → nieuw punt · ${fmt(distance)} · ${n[S.drawEngine.direction]||S.drawEngine.direction}`;}catch(e){return "Preview: "+(e.message||String(e));}}
export function placeMetricPoint(){const start=getActivePoint();if(!start)throw new Error("Plaats of selecteer eerst een vertrekpunt.");const end=createPoint(computeMetricPoint(start),0xffd166);let line;try{line=createLine(start,end,{undo:!S.draw?.active});}catch(e){deletePointRaw(end.id);throw e;}if(S.draw?.active){S.draw.pointIds.push(end.id);S.draw.lineIds.push(line.id);S.draw.lastId=end.id;if($("drawFinishBtn"))$("drawFinishBtn").disabled=S.draw.pointIds.length<3;}setActivePoint(end.id);S.lineFinished=false;resetTrackingSamples();if($("distance"))$("distance").textContent=fmt(line.distance);if($("stage"))$("stage").textContent=`Punt ${end.name} vastgezet`;if($("detail"))$("detail").textContent=`${line.name} · ${fmt(line.distance)}`;if($("hint"))$("hint").textContent=`Vertrekpunt ${end.name} actief. Kies de volgende stap.`;return {point:end,line};}
