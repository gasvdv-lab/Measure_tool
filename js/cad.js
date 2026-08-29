import {S,projectToWorld,worldToProject} from "./state.js?v=0.8.28-20260829-2035";

const DB_NAME="measurear.cad.v1",STORE="files";
let loaderPromise=null;

function dbOpen(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("CAD-opslag kon niet worden geopend."));
  });
}
async function putBlob(key,blob){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(blob,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error);});}
async function getBlob(key){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,"readonly"),r=tx.objectStore(STORE).get(key);r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error);});}
async function loadLoader(){
  if(!loaderPromise)loaderPromise=import("https://esm.sh/three@0.167.1/examples/jsm/loaders/GLTFLoader.js").then(m=>m.GLTFLoader);
  return loaderPromise;
}
function runtime(){if(!S.cadRuntime)S.cadRuntime={objects:new Map(),activeId:null,placing:false,offsetY:0};return S.cadRuntime;}
function ensureCadState(){if(!S.project.cad)S.project.cad={models:[]};if(!Array.isArray(S.project.cad.models))S.project.cad.models=[];return S.project.cad;}
function meta(id){return ensureCadState().models.find(m=>m.id===id)||null;}
function disposeObject(root){
  if(!root)return;root.traverse?.(o=>{o.geometry?.dispose?.();if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];a.forEach(m=>m?.dispose?.());}});root.parent?.remove(root);
}
function dimensionsOf(object){const box=new S.THREE.Box3().setFromObject(object),size=new S.THREE.Vector3();box.getSize(size);return {x:size.x,y:size.y,z:size.z,box};}
function makePivot(scene){
  const T=S.THREE,pivot=new T.Group();pivot.name="MeasureAR CAD";pivot.add(scene);
  scene.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(scene),center=new T.Vector3();box.getCenter(center);
  scene.position.x-=center.x;scene.position.z-=center.z;scene.position.y-=box.min.y;
  scene.updateMatrixWorld(true);return pivot;
}
async function parseBlob(blob){
  const GLTFLoader=await loadLoader(),loader=new GLTFLoader(),url=URL.createObjectURL(blob);
  try{const gltf=await loader.loadAsync(url);return gltf.scene;}finally{URL.revokeObjectURL(url);}
}
async function instantiate(m,blob){
  const raw=await parseBlob(blob),pivot=makePivot(raw),rt=runtime();
  S.scene.add(pivot);rt.objects.set(m.id,pivot);
  const p=m.position||{x:0,y:0,z:0},w=projectToWorld(new S.THREE.Vector3(p.x,p.y,p.z));pivot.position.copy(w);pivot.rotation.y=Number(m.yaw)||0;pivot.scale.set(1,1,1);
  return pivot;
}
export async function importCadFile(file){
  if(!file)throw new Error("Geen CAD-bestand gekozen.");
  if(!/\.(glb|gltf)$/i.test(file.name))throw new Error("v0.8.28 ondersteunt GLB/glTF. Exporteer FreeCAD eerst als GLB/glTF.");
  if(file.size>80*1024*1024)throw new Error("CAD-bestand is groter dan 80 MB.");
  if(!S.THREE||!S.scene)throw new Error("Start eerst AR.");
  const id="cad-"+crypto.randomUUID(),fileKey=id;
  await putBlob(fileKey,file);
  const scene=await parseBlob(file),pivot=makePivot(scene),d=dimensionsOf(pivot);
  S.scene.add(pivot);runtime().objects.set(id,pivot);
  const target=S.currentRawTarget||S.currentTarget;
  if(!target){disposeObject(pivot);runtime().objects.delete(id);throw new Error("Richt eerst het vizier op een oppervlak en probeer opnieuw.");}
  const pp=worldToProject(target);
  const m={id,name:file.name.replace(/\.(glb|gltf)$/i,""),fileName:file.name,fileKey,position:{x:pp.x,y:pp.y,z:pp.z},yaw:0,dimensions:{x:d.x,y:d.y,z:d.z},placed:false,importedAt:new Date().toISOString()};
  ensureCadState().models.push(m);
  const rt=runtime();rt.activeId=id;rt.placing=true;rt.offsetY=0;pivot.position.copy(target);pivot.rotation.y=0;
  document.dispatchEvent(new CustomEvent("measurear:cad-changed"));return m;
}
export function listCadModels(){return ensureCadState().models;}
export function activeCad(){return meta(runtime().activeId);}
export function selectCad(id){if(!meta(id))throw new Error("CAD-model niet gevonden.");runtime().activeId=id;return meta(id);}
export function beginCadPlacement(id){
  const m=selectCad(id),rt=runtime();rt.placing=true;rt.offsetY=0;m.placed=false;document.dispatchEvent(new CustomEvent("measurear:cad-changed"));return m;
}
export function rotateCad(deltaDeg){const m=activeCad();if(!m)throw new Error("Geen CAD-model geselecteerd.");m.yaw=(Number(m.yaw)||0)+deltaDeg*Math.PI/180;const o=runtime().objects.get(m.id);if(o)o.rotation.y=m.yaw;document.dispatchEvent(new CustomEvent("measurear:cad-changed"));}
export function moveCadHeight(deltaM){const m=activeCad();if(!m)throw new Error("Geen CAD-model geselecteerd.");const rt=runtime();rt.offsetY+=deltaM;if(!rt.placing){m.position.y+=deltaM;const o=rt.objects.get(m.id);if(o)o.position.copy(projectToWorld(new S.THREE.Vector3(m.position.x,m.position.y,m.position.z)));}document.dispatchEvent(new CustomEvent("measurear:cad-changed"));}
export function confirmCadPlacement(){
  const rt=runtime(),m=activeCad();if(!m)throw new Error("Geen CAD-model geselecteerd.");const o=rt.objects.get(m.id);if(!o)throw new Error("CAD-model is niet geladen.");
  const pp=worldToProject(o.position);m.position={x:pp.x,y:pp.y,z:pp.z};m.placed=true;rt.placing=false;rt.offsetY=0;document.dispatchEvent(new CustomEvent("measurear:cad-changed"));return m;
}
export function cancelCadPlacement(){const rt=runtime(),m=activeCad();if(!m)return;if(!m.placed){deleteCadModel(m.id);return;}rt.placing=false;rt.offsetY=0;const o=rt.objects.get(m.id);if(o)o.position.copy(projectToWorld(new S.THREE.Vector3(m.position.x,m.position.y,m.position.z)));document.dispatchEvent(new CustomEvent("measurear:cad-changed"));}
export function deleteCadModel(id){const rt=runtime(),o=rt.objects.get(id);disposeObject(o);rt.objects.delete(id);ensureCadState().models=ensureCadState().models.filter(m=>m.id!==id);if(rt.activeId===id){rt.activeId=null;rt.placing=false;}document.dispatchEvent(new CustomEvent("measurear:cad-changed"));}
export function updateCadFrame(){
  const rt=runtime();if(!S.THREE)return;
  for(const m of ensureCadState().models){const o=rt.objects.get(m.id);if(!o)continue;o.rotation.y=Number(m.yaw)||0;o.scale.set(1,1,1);if(rt.placing&&rt.activeId===m.id){const t=S.currentRawTarget||S.currentTarget;if(t){o.position.copy(t);o.position.y+=rt.offsetY;}}else if(m.position){o.position.copy(projectToWorld(new S.THREE.Vector3(m.position.x,m.position.y,m.position.z)));}}
}
export function clearCadRuntime(){const rt=runtime();for(const o of rt.objects.values())disposeObject(o);rt.objects.clear();rt.activeId=null;rt.placing=false;rt.offsetY=0;}
export async function restoreCadRuntime(){
  clearCadRuntime();if(!S.THREE||!S.scene)return;
  for(const m of ensureCadState().models){try{const blob=await getBlob(m.fileKey);if(blob)await instantiate(m,blob);else m.missingFile=true;}catch(err){console.warn("CAD restore failed",m.name,err);m.missingFile=true;}}
  document.dispatchEvent(new CustomEvent("measurear:cad-changed"));
}
export function cadStatus(){const rt=runtime(),m=activeCad();return {count:ensureCadState().models.length,active:m,placing:rt.placing,loaded:rt.objects.size};}
