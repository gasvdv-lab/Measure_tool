import {S,getPoint,projectToWorld} from "./state.js?v=0.8.37.3-20260830-cad-geometry-registration";

// Session-local WebXR anchor manager.
// Project coordinates remain immutable in point.position/point.locked.
// Anchor-corrected display coordinates live in point.worldPosition.
const anchors=new Map();
const pending=new Set();
const creating=new Set();
const hitAnchors=new Map();
// Per-point anchor calibration. An XR anchor may resolve a few millimetres away
// from the exact committed geometry (especially a hit-test anchor). Keep that
// initial difference as a fixed offset so acquiring the anchor can never make
// an already confirmed point jump.
let masterPointId=null;
let masterInitialMatrix=null;
let support="unknown";
let lastError="";
let anchorEpoch=0;

function enabledFeatures(session){
  try{return Array.from(session?.enabledFeatures||[]);}catch{return [];}
}

export function configureWorldLock(session){
  anchorEpoch++;
  for(const a of anchors.values()){try{a?.delete?.();}catch{}}
  anchors.clear();pending.clear();creating.clear();hitAnchors.clear();masterPointId=null;masterInitialMatrix=null;lastError="";
  const enabled=enabledFeatures(session);
  support=enabled.includes("anchors")?"anchors":"fallback";
  S.worldLock={mode:support,active:support==="anchors",anchored:0,pending:0,lastError:"",masterPointId:null,transform:null};
  for(const p of S.points)queuePointAnchor(p.id);
  emitStatus();
}

export function queuePointHitAnchor(pointId,hitResult){
  if(!pointId||!hitResult||typeof hitResult.createAnchor!=="function")return false;
  hitAnchors.set(pointId,hitResult);
  queuePointAnchor(pointId);
  return true;
}

export function queuePointAnchor(pointId){
  const p=getPoint(pointId);if(!p)return;
  if(!p.worldPosition&&p.position?.clone)p.worldPosition=p.position.clone();
  if(anchors.has(pointId)||creating.has(pointId))return;
  pending.add(pointId);
  if(S.worldLock)S.worldLock.pending=pending.size;
}

export function removePointAnchor(pointId){
  pending.delete(pointId);creating.delete(pointId);hitAnchors.delete(pointId);
  const a=anchors.get(pointId);
  try{a?.delete?.();}catch{}
  anchors.delete(pointId);
  if(S.worldLock){S.worldLock.anchored=anchors.size;S.worldLock.pending=pending.size;}
}


export function detachAllPointAnchors(){
  // Projectwissel/relocalisatie: verwijder ook de WebXR-anchors en invalideer
  // async anchor-creaties uit de vorige context.
  anchorEpoch++;
  for(const a of anchors.values()){try{a?.delete?.();}catch{}}
  anchors.clear();pending.clear();creating.clear();hitAnchors.clear();masterPointId=null;masterInitialMatrix=null;if(S.worldLock){S.worldLock.masterPointId=null;S.worldLock.transform=null;}
  if(S.worldLock)Object.assign(S.worldLock,{anchored:0,pending:0});
  emitStatus();
}

export function resetWorldLock(){
  anchorEpoch++;
  for(const a of anchors.values()){try{a?.delete?.();}catch{}}
  anchors.clear();pending.clear();creating.clear();hitAnchors.clear();masterPointId=null;masterInitialMatrix=null;if(S.worldLock){S.worldLock.masterPointId=null;S.worldLock.transform=null;}support="unknown";lastError="";
  if(S.worldLock)Object.assign(S.worldLock,{mode:"unknown",active:false,anchored:0,pending:0,lastError:""});
}

function emitStatus(){
  document.dispatchEvent(new CustomEvent("measurear:world-lock-status",{detail:worldLockStatus()}));
}

export function worldLockStatus(){
  return {mode:support,active:support==="anchors",anchored:anchors.size,pending:pending.size,lastError};
}

async function createAnchorForPoint(frame,ref,pointId){
  const p=getPoint(pointId);if(!p)return;
  const epoch=anchorEpoch;
  creating.add(pointId);pending.delete(pointId);
  let anchor=null;
  try{
    const hitResult=hitAnchors.get(pointId);
    if(hitResult&&typeof hitResult.createAnchor==="function"){
      // Surface points must use the XRHitTestResult itself. This keeps the
      // point attached to the real detected surface instead of recreating a
      // free-floating pose from the current viewer reference space.
      anchor=await hitResult.createAnchor();
      if(epoch===anchorEpoch&&getPoint(pointId))p.worldLock="hit-anchor";
    }else if(typeof frame?.createAnchor==="function"){
      // Computed points (exact distance / axis lock / constraints) have no
      // matching hit result. For those points a frame anchor is appropriate.
      const q=p.worldPosition||p.position;
      const transform=new XRRigidTransform({x:q.x,y:q.y,z:q.z});
      anchor=await frame.createAnchor(transform,ref);
      if(epoch===anchorEpoch&&getPoint(pointId))p.worldLock="frame-anchor";
    }else{
      throw new Error("WebXR anchor API niet beschikbaar voor dit punt.");
    }
    if(epoch!==anchorEpoch||!getPoint(pointId)){
      try{anchor?.delete?.();}catch{}
      return;
    }
    anchors.set(pointId,anchor);
  }catch(err){
    // Een async resultaat uit een vorige project/restore-context mag de nieuwe
    // World Lock-status niet meer beïnvloeden.
    if(epoch!==anchorEpoch)return;
    // One failed point must never disable World Lock for the complete AR
    // session. Keep anchor capability active for all other/new points.
    lastError=String(err?.message||err||"Anchor kon niet worden aangemaakt.");
    const current=getPoint(pointId);if(current)current.worldLock="local";
  }finally{
    if(epoch===anchorEpoch){
      creating.delete(pointId);hitAnchors.delete(pointId);
      if(S.worldLock){
        S.worldLock.mode=support;S.worldLock.active=support==="anchors";
        S.worldLock.anchored=anchors.size;S.worldLock.pending=pending.size;S.worldLock.lastError=lastError;
      }
      emitStatus();
    }
  }
}

export function updateWorldLock(frame,ref){
  if(!frame||!ref)return false;

  // Runtime capability is the final authority. Some browser builds expose the
  // optional feature differently through enabledFeatures.
  // XRHitTestResult.createAnchor() and XRFrame.createAnchor() are separate
  // capabilities. Do not require frame.createAnchor before attempting a
  // surface hit anchor.
  if((typeof frame.createAnchor==="function"||hitAnchors.size)&&support!=="anchors")support="anchors";
  if(support==="anchors"&&pending.size){
    // Create one anchor per frame to avoid a burst of asynchronous ARCore work.
    const id=pending.values().next().value;
    if(id&&!creating.has(id))createAnchorForPoint(frame,ref,id);
  }

  let changed=false;
  // A complete project is one rigid body. Pick the first healthy anchor as the
  // session master and use only its rigid pose delta for the complete project.
  // Extra point anchors remain useful as fallbacks/diagnostics, but may never
  // independently move vertices and therefore can never deform a line/shape/wall.
  if(!masterPointId||!anchors.has(masterPointId)){
    masterPointId=anchors.keys().next().value||null;
    masterInitialMatrix=null;
    if(S.worldLock)S.worldLock.masterPointId=masterPointId;
  }
  if(masterPointId){
    const anchor=anchors.get(masterPointId),pose=anchor?frame.getPose(anchor.anchorSpace,ref):null;
    if(pose){
      const current=new S.THREE.Matrix4().fromArray(pose.transform.matrix);
      if(!masterInitialMatrix){
        const prev=S.worldLock?.transform;
        if(prev){
          // Master failover: calibrate the replacement against the already
          // active rigid transform so switching anchors cannot move the project.
          const desired=new S.THREE.Matrix4().fromArray(prev);
          masterInitialMatrix=desired.clone().invert().multiply(current.clone());
        }else{
          masterInitialMatrix=current.clone();
          if(S.worldLock)S.worldLock.transform=null; // first acquisition: no jump
        }
      }else{
        const delta=current.clone().multiply(masterInitialMatrix.clone().invert());
        const prev=S.worldLock?.transform;
        const arr=delta.toArray();
        if(!prev||arr.some((v,i)=>Math.abs(v-prev[i])>1e-7))changed=true;
        if(S.worldLock)S.worldLock.transform=arr;
      }
    }
  }
  // Recompute every committed point from immutable project geometry through
  // the same rigid transform. This is the invariant for every application.
  for(const p of S.points){
    const q=projectPositionForWorldLock(p);
    if(!p.worldPosition)p.worldPosition=q.clone();
    else p.worldPosition.copy(q);
  }
  return changed;
}

function projectPositionForWorldLock(point){return projectToWorld(point.position);}

// Geometry modules can use this without knowing anything about WebXR anchors.
export function displayPosition(point){
  return point?.worldPosition||point?.position||null;
}

document.addEventListener("measurear:point-created",e=>queuePointAnchor(e.detail?.pointId));
document.addEventListener("measurear:point-deleted",e=>removePointAnchor(e.detail?.pointId));
document.addEventListener("measurear:point-repositioned",e=>{const id=e.detail?.pointId;removePointAnchor(id);queuePointAnchor(id);});
