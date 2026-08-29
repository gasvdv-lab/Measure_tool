import {S,getPoint} from "./state.js?v=0.8.21.7-20260829-1415";

// Session-local WebXR anchor manager.
// Project coordinates remain immutable in point.position/point.locked.
// Anchor-corrected display coordinates live in point.worldPosition.
const anchors=new Map();
const pending=new Set();
const creating=new Set();
let support="unknown";
let lastError="";

function enabledFeatures(session){
  try{return Array.from(session?.enabledFeatures||[]);}catch{return [];}
}

export function configureWorldLock(session){
  anchors.clear();pending.clear();creating.clear();lastError="";
  const enabled=enabledFeatures(session);
  support=enabled.includes("anchors")?"anchors":"fallback";
  S.worldLock={mode:support,active:support==="anchors",anchored:0,pending:0,lastError:""};
  for(const p of S.points)queuePointAnchor(p.id);
  emitStatus();
}

export function queuePointAnchor(pointId){
  const p=getPoint(pointId);if(!p)return;
  if(!p.worldPosition&&p.position?.clone)p.worldPosition=p.position.clone();
  if(anchors.has(pointId)||creating.has(pointId))return;
  pending.add(pointId);
  if(S.worldLock)S.worldLock.pending=pending.size;
}

export function removePointAnchor(pointId){
  pending.delete(pointId);creating.delete(pointId);
  const a=anchors.get(pointId);
  try{a?.delete?.();}catch{}
  anchors.delete(pointId);
  if(S.worldLock){S.worldLock.anchored=anchors.size;S.worldLock.pending=pending.size;}
}

export function resetWorldLock(){
  for(const a of anchors.values()){try{a?.delete?.();}catch{}}
  anchors.clear();pending.clear();creating.clear();support="unknown";lastError="";
  if(S.worldLock)Object.assign(S.worldLock,{mode:"unknown",active:false,anchored:0,pending:0,lastError:""});
}

function emitStatus(){
  document.dispatchEvent(new CustomEvent("measurear:world-lock-status",{detail:worldLockStatus()}));
}

export function worldLockStatus(){
  return {mode:support,active:support==="anchors",anchored:anchors.size,pending:pending.size,lastError};
}

async function createAnchorForPoint(frame,ref,pointId){
  const p=getPoint(pointId);if(!p||!frame?.createAnchor)return;
  creating.add(pointId);pending.delete(pointId);
  try{
    const q=p.position;
    const transform=new XRRigidTransform({x:q.x,y:q.y,z:q.z});
    const anchor=await frame.createAnchor(transform,ref);
    if(!getPoint(pointId)){try{anchor?.delete?.();}catch{};return;}
    anchors.set(pointId,anchor);
    p.worldLock="anchor";
  }catch(err){
    // Never break drawing when anchors are unavailable at runtime.
    support="fallback";lastError=String(err?.message||err||"Anchor kon niet worden aangemaakt.");
    p.worldLock="local";
  }finally{
    creating.delete(pointId);
    if(S.worldLock){
      S.worldLock.mode=support;S.worldLock.active=support==="anchors";
      S.worldLock.anchored=anchors.size;S.worldLock.pending=pending.size;S.worldLock.lastError=lastError;
    }
    emitStatus();
  }
}

export function updateWorldLock(frame,ref){
  if(!frame||!ref)return false;

  // Runtime capability is the final authority. Some browser builds expose the
  // optional feature differently through enabledFeatures.
  if(typeof frame.createAnchor==="function"&&support!=="anchors")support="anchors";
  if(typeof frame.createAnchor!=="function"&&pending.size){
    for(const id of pending){const p=getPoint(id);if(p)p.worldLock="local";}
    pending.clear();support="fallback";
    if(S.worldLock){S.worldLock.mode="fallback";S.worldLock.active=false;S.worldLock.pending=0;}
    emitStatus();
  }
  if(support==="anchors"&&typeof frame.createAnchor==="function"&&pending.size){
    // Create one anchor per frame to avoid a burst of asynchronous ARCore work.
    const id=pending.values().next().value;
    if(id&&!creating.has(id))createAnchorForPoint(frame,ref,id);
  }

  let changed=false;
  for(const p of S.points){
    if(!p.worldPosition)p.worldPosition=p.position.clone();
    const anchor=anchors.get(p.id);
    if(!anchor)continue;
    const pose=frame.getPose(anchor.anchorSpace,ref);if(!pose)continue;
    const t=pose.transform.position;
    const dx=p.worldPosition.x-t.x,dy=p.worldPosition.y-t.y,dz=p.worldPosition.z-t.z;
    if(dx*dx+dy*dy+dz*dz>1e-10)changed=true;
    p.worldPosition.set(t.x,t.y,t.z);
  }
  return changed;
}

// Geometry modules can use this without knowing anything about WebXR anchors.
export function displayPosition(point){
  return point?.worldPosition||point?.position||null;
}

document.addEventListener("measurear:point-created",e=>queuePointAnchor(e.detail?.pointId));
document.addEventListener("measurear:point-deleted",e=>removePointAnchor(e.detail?.pointId));
document.addEventListener("measurear:point-repositioned",e=>{const id=e.detail?.pointId;removePointAnchor(id);queuePointAnchor(id);});
