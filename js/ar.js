import {setHoverSurfaceNormal} from "./drawing-engine.js?v=0.8.9.1-20260822-1715";

import {S,$} from "./state.js?v=0.8.9.1-20260822-1715";
import {enforceLocked,updateLabels,updatePointLabels,updateMarkerScale,clearAllGeometry} from "./geometry.js?v=0.8.9.1-20260822-1715";
let samples=[],tmpPos,tmpQuat,up,camPos,camQuat,forward;

function withTimeout(promise,ms,label){
  return Promise.race([
    promise,
    new Promise((_,reject)=>setTimeout(()=>reject(new Error(`${label} duurde langer dan ${Math.round(ms/1000)} s.`)),ms))
  ]);
}
export async function loadThree(){
  if(S.THREE)return;
  S.THREE=await withTimeout(
    import("https://esm.sh/three@0.167.1"),
    10000,
    "Three.js laden"
  );
  const T=S.THREE;
  tmpPos=new T.Vector3();tmpQuat=new T.Quaternion();up=new T.Vector3(0,1,0);
  camPos=new T.Vector3();camQuat=new T.Quaternion();forward=new T.Vector3();
}
function init(){
  const T=S.THREE;S.scene=new T.Scene();S.camera=new T.PerspectiveCamera(70,innerWidth/innerHeight,.01,100);
  S.renderer=new T.WebGLRenderer({alpha:true,antialias:true});S.renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));S.renderer.setSize(innerWidth,innerHeight);S.renderer.xr.enabled=true;S.renderer.xr.setReferenceSpaceType("local");
  S.renderer.domElement.style.display="none";document.body.appendChild(S.renderer.domElement);
  S.reticle=new T.Mesh(new T.RingGeometry(.035,.045,40).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0x69ff9a}));S.reticle.matrixAutoUpdate=false;S.reticle.visible=false;S.scene.add(S.reticle);
}
export function cameraRay(){const c=S.renderer.xr.getCamera(S.camera);c.getWorldPosition(camPos);c.getWorldQuaternion(camQuat);forward.set(0,0,-1).applyQuaternion(camQuat).normalize();return{origin:camPos.clone(),dir:forward.clone()};}
export function getFilteredTarget(){
  if(!S.currentTarget)return null;if(samples.length<5)return S.currentTarget.clone();const m=new S.THREE.Vector3();samples.forEach(p=>m.add(p));return m.multiplyScalar(1/samples.length);
}
function addSample(p){samples.push(p.clone());if(samples.length>16)samples.shift();}
export function resetTrackingSamples(){
  samples.length=0;
  S.pointPlacementEpoch++;
  $("stability").textContent="Stabiliteit: opnieuw meten…";
}
function virtualTarget(){
  if(!S.pointA)return null;const ray=cameraRay(),n=up.clone(),den=n.dot(ray.dir);if(Math.abs(den)<.015)return null;const t=n.dot(S.pointA.clone().sub(ray.origin))/den;if(t<=0||t>40)return null;return ray.origin.clone().add(ray.dir.clone().multiplyScalar(t));
}
export function applyZoom(v){S.zoom=Math.max(1,Math.min(4,v));$("zoomValue").textContent=S.zoom.toFixed(1)+"×";if(S.camera){S.camera.fov=70/S.zoom;S.camera.updateProjectionMatrix();}}
export async function startAR(){
  if(!navigator.xr)throw new Error("WebXR niet beschikbaar in deze browser.");

  const supported=await withTimeout(
    navigator.xr.isSessionSupported("immersive-ar"),
    6000,
    "WebXR-ondersteuning controleren"
  );
  if(!supported)throw new Error("Immersive AR is niet beschikbaar op dit toestel.");

  await loadThree();
  if(!S.renderer)init();

  const session=await withTimeout(
    navigator.xr.requestSession("immersive-ar",{
      requiredFeatures:["hit-test"],
      optionalFeatures:["dom-overlay"],
      domOverlay:{root:document.body}
    }),
    10000,
    "AR-sessie starten"
  );

  S.xrSession=session;
  await withTimeout(S.renderer.xr.setSession(session),6000,"AR-renderer koppelen");

  S.renderer.domElement.style.display="block";
  $("app").style.display="none";
  $("overlay").style.display="block";
  S.xrSession.addEventListener("end",cleanup,{once:true});
  S.renderer.setAnimationLoop(render);
}
export async function leaveAR(){if(S.xrSession){await S.xrSession.end();return;}cleanup();}
function cleanup(){resetTrackingSamples();S.renderer?.setAnimationLoop(null);if(S.renderer?.domElement)S.renderer.domElement.style.display="none";S.xrSession=null;S.hitSource=null;S.hitRequested=false;clearAllGeometry();$("overlay").style.display="none";$("app").style.display="grid";}
function render(_,frame){
  if(!frame)return;const ref=S.renderer.xr.getReferenceSpace(),session=S.renderer.xr.getSession();
  if(!S.hitRequested){session.requestReferenceSpace("viewer").then(v=>session.requestHitTestSource({space:v}).then(s=>S.hitSource=s));S.hitRequested=true;}
  let hit=null,pose=null;if(S.hitSource){const r=frame.getHitTestResults(S.hitSource);if(r.length){pose=r[0].getPose(ref);if(pose)hit=new S.THREE.Vector3(pose.transform.position.x,pose.transform.position.y,pose.transform.position.z);}}
  if(hit&&pose){S.reticle.visible=true;S.reticle.matrix.fromArray(pose.transform.matrix);
    try{const q=new S.THREE.Quaternion().setFromRotationMatrix(S.reticle.matrix);setHoverSurfaceNormal(new S.THREE.Vector3(0,1,0).applyQuaternion(q).normalize());}catch{}S.currentTarget=hit;S.targetSource="hit";addSample(hit);$("aim").className="hit";$("captureBtn").disabled=S.lineFinished;}
  else if(S.pointA){const v=virtualTarget();if(v){S.reticle.visible=true;S.reticle.matrix.identity();S.reticle.matrix.setPosition(v);S.currentTarget=v;S.targetSource="virtual";addSample(v);$("aim").className="virtual";$("captureBtn").disabled=S.lineFinished;}else{$("captureBtn").disabled=true;}}
  else{S.reticle.visible=false;S.currentTarget=null;$("captureBtn").disabled=true;$("stage").textContent="Zoek een oppervlak";}
  enforceLocked();updateMarkerScale();updatePointLabels();updateLabels();S.renderer.render(S.scene,S.camera);
}
window.addEventListener("resize",()=>{S.renderer?.setSize(innerWidth,innerHeight);if(S.camera){S.camera.aspect=innerWidth/innerHeight;S.camera.updateProjectionMatrix();}});

document.addEventListener("measurear:reset-tracking",resetTrackingSamples);
