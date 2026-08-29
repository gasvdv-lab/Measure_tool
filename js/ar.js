import {S,$} from "./state.js?v=0.8.21.5-20260829-1305";
import {enforceLocked,updateLabels,updatePointLabels,updateMarkerScale,clearAllGeometry} from "./geometry.js?v=0.8.21.5-20260829-1305";
import {updateCandidate,updatePreviewScreen,isCaptureAllowed,resetDrawingCore} from "./drawing-core.js?v=0.8.21.5-20260829-1305";
import {clearWalls,syncWorldLockedWalls} from "./walls.js?v=0.8.21.5-20260829-1305";
import {configureWorldLock,updateWorldLock,resetWorldLock} from "./world-lock.js?v=0.8.21.5-20260829-1305";

let samples=[],sampleSource=null,camPos,camQuat,forward;

function withTimeout(promise,ms,label){
  return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} duurde langer dan ${Math.round(ms/1000)} s.`)),ms))]);
}
export async function loadThree(){
  if(S.THREE)return;
  S.THREE=await withTimeout(import("https://esm.sh/three@0.167.1"),10000,"Three.js laden");
  const T=S.THREE;camPos=new T.Vector3();camQuat=new T.Quaternion();forward=new T.Vector3();
}
function init(){
  const T=S.THREE;S.scene=new T.Scene();S.camera=new T.PerspectiveCamera(70,innerWidth/innerHeight,.01,100);
  S.renderer=new T.WebGLRenderer({alpha:true,antialias:true});S.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));S.renderer.setSize(innerWidth,innerHeight);
  S.renderer.xr.enabled=true;S.renderer.xr.setReferenceSpaceType("local");S.renderer.domElement.style.display="none";document.body.appendChild(S.renderer.domElement);
  S.reticle=new T.Mesh(new T.RingGeometry(.035,.045,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x69ff9a}));
  S.reticle.matrixAutoUpdate=false;S.reticle.visible=false;S.scene.add(S.reticle);
}
export function cameraRay(){
  const c=S.renderer.xr.getCamera(S.camera);c.getWorldPosition(camPos);c.getWorldQuaternion(camQuat);
  forward.set(0,0,-1).applyQuaternion(camQuat).normalize();return {origin:camPos.clone(),dir:forward.clone()};
}
function addSample(p,source){
  if(sampleSource!==source){samples.length=0;sampleSource=source;}
  samples.push(p.clone());if(samples.length>16)samples.shift();
}
function filteredHit(hit){
  if(!hit)return null;if(samples.length<5)return hit.clone();
  const m=new S.THREE.Vector3();samples.forEach(p=>m.add(p));return m.multiplyScalar(1/samples.length);
}
export function resetTrackingSamples(){
  samples.length=0;sampleSource=null;S.pointPlacementEpoch++;
  if($("stability"))$("stability").textContent="Stabiliteit: opnieuw meten…";
}
export function applyZoom(v){
  S.zoom=Math.max(1,Math.min(4,v));if($("zoomValue"))$("zoomValue").textContent=S.zoom.toFixed(1)+"×";
  if(S.camera){S.camera.fov=70/S.zoom;S.camera.updateProjectionMatrix();}
}
export async function startAR(){
  if(!navigator.xr)throw new Error("WebXR niet beschikbaar in deze browser.");
  const supported=await withTimeout(navigator.xr.isSessionSupported("immersive-ar"),6000,"WebXR-ondersteuning controleren");
  if(!supported)throw new Error("Immersive AR is niet beschikbaar op dit toestel.");
  await loadThree();if(!S.renderer)init();
  const session=await withTimeout(navigator.xr.requestSession("immersive-ar",{requiredFeatures:["hit-test"],optionalFeatures:["dom-overlay","anchors"],domOverlay:{root:document.body}}),10000,"AR-sessie starten");
  S.xrSession=session;configureWorldLock(session);await withTimeout(S.renderer.xr.setSession(session),6000,"AR-renderer koppelen");
  S.renderer.domElement.style.display="block";$("app").style.display="none";$("overlay").style.display="block";
  document.dispatchEvent(new CustomEvent("measurear:ar-ready"));
  session.addEventListener("end",cleanup,{once:true});S.renderer.setAnimationLoop(render);
}
function cleanup(){
  resetWorldLock();resetTrackingSamples();S.renderer?.setAnimationLoop(null);
  if(S.renderer?.domElement)S.renderer.domElement.style.display="none";
  S.xrSession=null;S.hitSource=null;S.hitRequested=false;S.currentTarget=null;S.targetSource="none";
  clearWalls();clearAllGeometry();resetDrawingCore();
  $("overlay").style.display="none";$("app").style.display="grid";
  if($("startArBtn")){$("startArBtn").disabled=false;$("startArBtn").textContent="AR starten";}
  if($("launchStatus"))$("launchStatus").textContent="Tik om AR te starten.";
}
export async function leaveAR(){if(S.xrSession){await S.xrSession.end();return;}cleanup();}

function render(_,frame){
  if(!frame)return;
  const ref=S.renderer.xr.getReferenceSpace(),session=S.renderer.xr.getSession();
  if(!S.hitRequested){
    session.requestReferenceSpace("viewer").then(v=>session.requestHitTestSource({space:v}).then(s=>S.hitSource=s)).catch(()=>{});
    S.hitRequested=true;
  }
  let hit=null,pose=null,normal=null;
  if(S.hitSource){
    const r=frame.getHitTestResults(S.hitSource);
    if(r.length){pose=r[0].getPose(ref);if(pose)hit=new S.THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z);}
  }
  if(hit&&pose){
    S.reticle.visible=true;S.reticle.matrix.fromArray(pose.transform.matrix);
    try{const q=new S.THREE.Quaternion().setFromRotationMatrix(S.reticle.matrix);normal=new S.THREE.Vector3(0,1,0).applyQuaternion(q).normalize();}catch{}
    addSample(hit,"hit");hit=filteredHit(hit);S.currentTarget=hit;S.targetSource="hit";$("aim").className="hit";
  }else{
    S.reticle.visible=false;S.currentTarget=null;S.targetSource="none";$("aim").className="";
  }

  const worldLockChanged=updateWorldLock(frame,ref);
  if(worldLockChanged)syncWorldLockedWalls();

  updateCandidate({hit,hitNormal:normal,ray:cameraRay()});
  $("captureBtn").disabled=!isCaptureAllowed();

  const c=S.tool.candidate;
  if(S.tool.kind&&S.tool.status==="drawing"){
    $("stage").textContent=c?.valid?(S.tool.activePointId?`Vanaf ${S.points.find(p=>p.id===S.tool.activePointId)?.name||"?"}`:"Plaats punt A"):(c?.reason||"Zoek een oppervlak");
  }else if(!S.tool.kind){
    $("stage").textContent="Kies een tekenfunctie";
  }

  enforceLocked();updateMarkerScale();updatePointLabels();updateLabels();updatePreviewScreen();
  S.renderer.render(S.scene,S.camera);
}
window.addEventListener("resize",()=>{S.renderer?.setSize(innerWidth,innerHeight);if(S.camera){S.camera.aspect=innerWidth/innerHeight;S.camera.updateProjectionMatrix();}});
document.addEventListener("measurear:reset-tracking",resetTrackingSamples);


document.addEventListener("measurear:world-lock-status",e=>{
  const d=e.detail||{};if(!$('stability'))return;
  if(d.mode==='anchors')$('stability').textContent=`World Lock: actief · ${d.anchored||0} anchors`;
  else $('stability').textContent='World Lock: lokale tracking (anchors niet actief)';
});
