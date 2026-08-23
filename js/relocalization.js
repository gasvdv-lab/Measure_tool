import {S,getPoint} from "./state.js?v=0.8.21-20260823-0345";
import {snapshotProject,restoreProject} from "./history.js?v=0.8.21-20260823-0345";
import {validateGeometryState} from "./geometry.js?v=0.8.21-20260823-0345";

const EPS=1e-9;
function v3(x=0,y=0,z=0){return new S.THREE.Vector3(x,y,z);}
function cloneObj(o){return JSON.parse(JSON.stringify(o));}
function nowIso(){return new Date().toISOString();}

export function captureCurrentGeo(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error("Geolocatie is niet beschikbaar in deze browser."));return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      const geo={
        lat:pos.coords.latitude,lon:pos.coords.longitude,
        altitude:Number.isFinite(pos.coords.altitude)?pos.coords.altitude:null,
        accuracy:Number.isFinite(pos.coords.accuracy)?pos.coords.accuracy:null,
        altitudeAccuracy:Number.isFinite(pos.coords.altitudeAccuracy)?pos.coords.altitudeAccuracy:null,
        heading:Number.isFinite(pos.coords.heading)?pos.coords.heading:null,
        speed:Number.isFinite(pos.coords.speed)?pos.coords.speed:null,
        capturedAt:nowIso()
      };
      S.project.geo=geo;resolve(geo);
    },err=>reject(new Error("Locatie kon niet worden bepaald: "+err.message)),{enableHighAccuracy:true,maximumAge:0,timeout:12000});
  });
}

export function addProjectReference(pointId,name=null,description=""){
  const p=getPoint(pointId);if(!p)throw new Error("Referentiepunt bestaat niet.");
  if(S.project.relocalization.references.some(r=>r.pointId===pointId))throw new Error("Dit punt is al een projectreferentie.");
  const ref={
    id:"ref-"+crypto.randomUUID(),
    pointId,
    name:String(name||p.name||"Referentie").trim(),
    description:String(description||"").trim(),
    projectPosition:{x:p.position.x,y:p.position.y,z:p.position.z}
  };
  S.project.relocalization.references.push(ref);
  return ref;
}
export function removeProjectReference(id){
  S.project.relocalization.references=S.project.relocalization.references.filter(r=>r.id!==id);
}
export function clearProjectReferences(){S.project.relocalization.references.length=0;}

export function beginRelocalization(mode="auto"){
  const valid=new Set(["auto","1","2","3","precision"]);
  S.project.relocalization.mode=valid.has(String(mode))?String(mode):"auto";
  S.project.relocalization.active=true;
  S.project.relocalization.captured=[];
  S.project.relocalization.lastResult=null;
}
export function cancelRelocalization(){
  S.project.relocalization.active=false;S.project.relocalization.captured=[];
}
export function captureRelocalizationPoint(refId,worldPosition){
  const ref=S.project.relocalization.references.find(r=>r.id===refId);
  if(!ref)throw new Error("Projectreferentie niet gevonden.");
  const p=worldPosition?.clone?.()||null;
  if(!p||![p.x,p.y,p.z].every(Number.isFinite))throw new Error("Ongeldige AR-positie.");
  const entry={refId,world:{x:p.x,y:p.y,z:p.z}};
  const i=S.project.relocalization.captured.findIndex(c=>c.refId===refId);
  if(i>=0)S.project.relocalization.captured[i]=entry;else S.project.relocalization.captured.push(entry);
  return entry;
}

function centroid(points){
  const c=v3();for(const p of points)c.add(p);return c.multiplyScalar(1/points.length);
}
function mat3FromQuaternion(q){
  const m=new S.THREE.Matrix4().makeRotationFromQuaternion(q);
  return new S.THREE.Matrix3().setFromMatrix4(m);
}
function applyRigid(p,R,t){
  return p.clone().applyMatrix3(R).add(t);
}
function basisFrom2(a,b,upHint=null){
  const x=b.clone().sub(a);if(x.lengthSq()<EPS)throw new Error("Referentiepunten liggen te dicht bij elkaar.");
  x.normalize();
  let y=upHint?.clone?.()||v3(0,1,0);
  y.sub(x.clone().multiplyScalar(y.dot(x)));
  if(y.lengthSq()<EPS)y=Math.abs(x.y)<.9?v3(0,1,0):v3(1,0,0);
  y.sub(x.clone().multiplyScalar(y.dot(x))).normalize();
  const z=x.clone().cross(y).normalize();
  y=z.clone().cross(x).normalize();
  return {x,y,z};
}
function basisFrom3(a,b,c){
  const x=b.clone().sub(a);if(x.lengthSq()<EPS)throw new Error("Referentie A en B liggen te dicht bij elkaar.");x.normalize();
  const ac=c.clone().sub(a);
  const z=x.clone().cross(ac);if(z.lengthSq()<EPS)throw new Error("De drie referentiepunten liggen bijna op één lijn.");z.normalize();
  const y=z.clone().cross(x).normalize();
  return {x,y,z};
}
function basisMatrix(b){
  return new S.THREE.Matrix3().set(
    b.x.x,b.y.x,b.z.x,
    b.x.y,b.y.y,b.z.y,
    b.x.z,b.y.z,b.z.z
  );
}
function transpose3(m){
  const e=m.elements;
  return new S.THREE.Matrix3().set(e[0],e[1],e[2],e[3],e[4],e[5],e[6],e[7],e[8]);
}
function mul3(a,b){
  return a.clone().multiply(b);
}

function solveOne(src,dst){
  return {R:new S.THREE.Matrix3().identity(),t:dst.clone().sub(src),method:"1-point"};
}
function solveTwo(src,dst){
  const bs=basisFrom2(src[0],src[1]),bd=basisFrom2(dst[0],dst[1]);
  const R=mul3(basisMatrix(bd),transpose3(basisMatrix(bs)));
  const t=dst[0].clone().sub(src[0].clone().applyMatrix3(R));
  return {R,t,method:"2-point"};
}
function solveThree(src,dst){
  const bs=basisFrom3(src[0],src[1],src[2]),bd=basisFrom3(dst[0],dst[1],dst[2]);
  const R=mul3(basisMatrix(bd),transpose3(basisMatrix(bs)));
  const t=dst[0].clone().sub(src[0].clone().applyMatrix3(R));
  return {R,t,method:"3-point"};
}
function solveBestFit(src,dst){
  // Horn/Kabsch-like rigid fit using a quaternion power iteration on 4x4 symmetric matrix.
  const cs=centroid(src),cd=centroid(dst);
  let Sxx=0,Sxy=0,Sxz=0,Syx=0,Syy=0,Syz=0,Szx=0,Szy=0,Szz=0;
  for(let i=0;i<src.length;i++){
    const a=src[i].clone().sub(cs),b=dst[i].clone().sub(cd);
    Sxx+=a.x*b.x;Sxy+=a.x*b.y;Sxz+=a.x*b.z;
    Syx+=a.y*b.x;Syy+=a.y*b.y;Syz+=a.y*b.z;
    Szx+=a.z*b.x;Szy+=a.z*b.y;Szz+=a.z*b.z;
  }
  const N=[
    [Sxx+Syy+Szz,Syz-Szy,Szx-Sxz,Sxy-Syx],
    [Syz-Szy,Sxx-Syy-Szz,Sxy+Syx,Szx+Sxz],
    [Szx-Sxz,Sxy+Syx,-Sxx+Syy-Szz,Syz+Szy],
    [Sxy-Syx,Szx+Sxz,Syz+Szy,-Sxx-Syy+Szz]
  ];
  let q=[1,0,0,0];
  for(let it=0;it<40;it++){
    const nq=N.map(r=>r[0]*q[0]+r[1]*q[1]+r[2]*q[2]+r[3]*q[3]);
    const len=Math.hypot(...nq)||1;q=nq.map(x=>x/len);
  }
  const quat=new S.THREE.Quaternion(q[1],q[2],q[3],q[0]).normalize();
  const R=mat3FromQuaternion(quat);
  const t=cd.clone().sub(cs.clone().applyMatrix3(R));
  return {R,t,method:"best-fit"};
}

export function solveRelocalization(){
  const refs=S.project.relocalization.references;
  const caps=S.project.relocalization.captured;
  if(!caps.length)throw new Error("Nog geen referentiepunten opnieuw aangewezen.");
  const paired=caps.map(c=>{
    const r=refs.find(x=>x.id===c.refId);if(!r)throw new Error("Referentie ontbreekt.");
    return {src:v3(r.projectPosition.x,r.projectPosition.y,r.projectPosition.z),dst:v3(c.world.x,c.world.y,c.world.z),ref:r};
  });
  const src=paired.map(p=>p.src),dst=paired.map(p=>p.dst);
  let fit;
  if(src.length===1)fit=solveOne(src[0],dst[0]);
  else if(src.length===2)fit=solveTwo(src,dst);
  else if(src.length===3)fit=solveThree(src,dst);
  else fit=solveBestFit(src,dst);

  const residuals=paired.map(p=>applyRigid(p.src,fit.R,fit.t).distanceTo(p.dst));
  const mean=residuals.reduce((a,b)=>a+b,0)/residuals.length;
  const max=Math.max(...residuals);
  const rms=Math.sqrt(residuals.reduce((a,b)=>a+b*b,0)/residuals.length);
  const quality=max<=.02?"zeer goed":max<=.05?"goed":max<=.10?"matig":"zwak";
  return {...fit,residuals,mean,max,rms,quality,count:src.length};
}

export function applyRelocalization(result){
  if(!result?.R||!result?.t)throw new Error("Geen geldige uitlijning.");
  const before=snapshotProject();
  try{
    for(const p of S.points){
      p.position.applyMatrix3(result.R).add(result.t);
      p.locked=Object.freeze({x:p.position.x,y:p.position.y,z:p.position.z});
      p.marker?.position.copy(p.position);
      if(p.surfaceNormal)p.surfaceNormal.applyMatrix3(result.R).normalize();
    }
    // Rebuild entire project through snapshot/restore so all derived meshes follow transformed source points.
    const snap=snapshotProject();
    restoreProject(snap);
    const check=validateGeometryState();if(!check.ok)throw new Error(check.errors[0]);
    S.project.relocalization.lastResult={
      method:result.method,count:result.count,mean:result.mean,max:result.max,rms:result.rms,quality:result.quality,appliedAt:nowIso()
    };
    S.project.relocalization.active=false;
    document.dispatchEvent(new CustomEvent("measurear:relocalized"));
    return S.project.relocalization.lastResult;
  }catch(err){
    try{restoreProject(before);}catch{}
    throw err;
  }
}

export function referenceDistances(){
  const refs=S.project.relocalization.references.map(r=>({...r,p:v3(r.projectPosition.x,r.projectPosition.y,r.projectPosition.z)}));
  const out=[];for(let i=0;i<refs.length;i++)for(let j=i+1;j<refs.length;j++)out.push({a:refs[i].id,b:refs[j].id,distance:refs[i].p.distanceTo(refs[j].p)});
  return out;
}

export function relocalizationSummary(){
  const r=S.project.relocalization;
  return {
    referenceCount:r.references.length,capturedCount:r.captured.length,mode:r.mode,lastResult:r.lastResult,
    recommended:r.references.length>=4?"precision":r.references.length===3?"3":r.references.length===2?"2":r.references.length===1?"1":"auto"
  };
}
