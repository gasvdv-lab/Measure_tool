
import {S,$,getPoint,getLine} from "./state.js?v=0.8.8.2-20260822-1625";
const labels={free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht 90°",angle:"Eigen hoek"};
export function setConstraint(mode){
  S.constraint.mode=mode; S.constraint.verticalPlane=null;
  S.constraint.angle=Number($("constraintAngle")?.value)||S.constraint.angle;
  $("constraintHudBtn").textContent=(labels[mode]||mode)+" ▾";
  document.querySelectorAll(".constraintBtn").forEach(b=>b.classList.toggle("primary",b.dataset.constraint===mode));
  updateReferenceStatus();
}
export function setReferenceLine(id){S.constraint.referenceLineId=id;updateReferenceStatus();}
export function updateReferenceStatus(){
  const l=getLine(S.constraint.referenceLineId);
  $("referenceStatus").textContent=l?`Referentie: lijn ${l.name}`:"Referentie: geen";
}
function anchor(){
  if(S.draw.active&&S.draw.lastId)return getPoint(S.draw.lastId);
  return getPoint(S.activeStartId);
}
function rotateY(v,deg){
  const r=deg*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  return new S.THREE.Vector3(v.x*c-v.z*s,v.y,v.x*s+v.z*c);
}
function projectAlong(a,raw,dir){
  const delta=raw.clone().sub(a.position),len=delta.length();
  if(len<1e-8)return raw.clone();
  const d=dir.clone().normalize();if(d.dot(delta)<0)d.multiplyScalar(-1);
  return a.position.clone().add(d.multiplyScalar(len));
}
export function applyConstraint(raw,cameraRay){
  if(!raw||!S.THREE)return raw;
  const a=anchor(); if(!a)return raw.clone();
  const mode=S.constraint.mode;
  if(mode==="free"||mode==="surface")return raw.clone();
  if(mode==="horizontal"){const p=raw.clone();p.y=a.position.y;return p;}
  if(mode==="vertical"){
    if(!S.constraint.verticalPlane){
      const ray=cameraRay(),n=new S.THREE.Vector3(ray.dir.x,0,ray.dir.z);
      if(n.lengthSq()<1e-8)n.set(0,0,1);
      S.constraint.verticalPlane={point:a.position.clone(),normal:n.normalize()};
    }
    const pl=S.constraint.verticalPlane,d=raw.clone().sub(pl.point);
    return raw.clone().sub(pl.normal.clone().multiplyScalar(d.dot(pl.normal)));
  }
  const ref=getLine(S.constraint.referenceLineId);
  if(!ref)return raw.clone();
  const p1=getPoint(ref.startId),p2=getPoint(ref.endId); if(!p1||!p2)return raw.clone();
  let dir=p2.position.clone().sub(p1.position);dir.y=0;
  if(mode==="parallel")return projectAlong(a,raw,dir);
  if(mode==="perpendicular")return projectAlong(a,raw,rotateY(dir,90));
  if(mode==="angle")return projectAlong(a,raw,rotateY(dir,S.constraint.angle));
  return raw.clone();
}
export function nearestSnap(raw){
  if(!raw)return raw;
  const radius=.08; let best=null,bestD=radius;
  for(const p of S.points){const d=raw.distanceTo(p.position);if(d<bestD){best=p.position.clone();bestD=d;}}
  if(best)return best;
  for(const l of S.lines){
    const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)continue;
    const ab=b.position.clone().sub(a.position),den=ab.lengthSq();if(den<1e-8)continue;
    const t=Math.max(0,Math.min(1,raw.clone().sub(a.position).dot(ab)/den));
    const q=a.position.clone().add(ab.multiplyScalar(t)),d=raw.distanceTo(q);
    if(d<bestD){best=q;bestD=d;}
  }
  return best||raw;
}
