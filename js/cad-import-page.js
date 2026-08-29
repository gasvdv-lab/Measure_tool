const RECOVERY_KEY="measurear.recovery.v1";
const DB_NAME="measurear.cad.v1",STORE="files";
const $=id=>document.getElementById(id);
let preview=null,pendingFile=null,pendingData=null;

function showError(message){const e=$("cadStandaloneError");e.style.display="block";e.textContent=message;}
function clearError(){const e=$("cadStandaloneError");e.style.display="none";e.textContent="";}
function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
function dbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("CAD-opslag kon niet worden geopend."));});}
async function putBlob(key,blob){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(blob,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error||new Error("CAD-bestand kon niet worden opgeslagen."));});}
function recovery(){const r=safeParse(localStorage.getItem(RECOVERY_KEY));if(!r?.project||!r?.data)return null;return r;}
function addModelToRecovery(model){const rec=recovery();if(!rec)throw new Error("Geen actief herstelproject gevonden. Ga terug naar Measure AR en open CAD-import opnieuw.");if(!rec.project.cad)rec.project.cad={models:[]};if(!Array.isArray(rec.project.cad.models))rec.project.cad.models=[];rec.project.cad.models.push(model);rec.project.updatedAt=new Date().toISOString();rec.recovery=true;localStorage.setItem(RECOVERY_KEY,JSON.stringify(rec));}
function disposePreview(){if(!preview)return;cancelAnimationFrame(preview.raf);preview.controls?.dispose?.();preview.renderer?.dispose?.();preview.scene?.traverse?.(o=>{o.geometry?.dispose?.();const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>m?.dispose?.());});preview=null;}
async function buildPreview(file){
  disposePreview();
  const THREE=await import("https://esm.sh/three@0.167.1");
  const {GLTFLoader}=await import("https://esm.sh/three@0.167.1/examples/jsm/loaders/GLTFLoader.js");
  const {OrbitControls}=await import("https://esm.sh/three@0.167.1/examples/jsm/controls/OrbitControls.js");
  const loader=new GLTFLoader(),url=URL.createObjectURL(file);let gltf;
  try{gltf=await loader.loadAsync(url);}finally{URL.revokeObjectURL(url);}
  const root=gltf.scene,box=new THREE.Box3().setFromObject(root),size=new THREE.Vector3(),center=new THREE.Vector3();box.getSize(size);box.getCenter(center);
  if(!Number.isFinite(size.x)||Math.max(size.x,size.y,size.z)<=0)throw new Error("Het model bevat geen bruikbare 3D-afmetingen.");
  root.position.sub(center);root.updateMatrixWorld(true);
  const canvas=$("cadPreview"),renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x101312);scene.add(root);
  const hemi=new THREE.HemisphereLight(0xffffff,0x444444,2.4),dir=new THREE.DirectionalLight(0xffffff,2.2);dir.position.set(3,5,4);scene.add(hemi,dir);
  const axes=new THREE.AxesHelper(Math.max(size.x,size.y,size.z)*.35);scene.add(axes);
  const camera=new THREE.PerspectiveCamera(45,1,.001,Math.max(1000,Math.max(size.x,size.y,size.z)*100));
  const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.08;
  const radius=Math.max(size.length()*.6,.1);
  function resize(){const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);if(canvas.width!==Math.round(w*renderer.getPixelRatio())||canvas.height!==Math.round(h*renderer.getPixelRatio()))renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  function view(kind="iso"){
    controls.target.set(0,0,0);
    const d=radius*2.4;
    if(kind==="top")camera.position.set(0,d,0.001);else if(kind==="front")camera.position.set(0,0,d);else camera.position.set(d,d*.75,d);
    camera.near=Math.max(.001,radius/1000);camera.far=Math.max(100,radius*100);camera.updateProjectionMatrix();controls.update();
  }
  function loop(){resize();controls.update();renderer.render(scene,camera);preview.raf=requestAnimationFrame(loop);}
  let meshes=0,triangles=0;root.traverse(o=>{if(o.isMesh){meshes++;const g=o.geometry;if(g){triangles+=g.index?g.index.count/3:(g.attributes?.position?.count||0)/3;}}});
  preview={THREE,renderer,scene,camera,controls,root,size,view,raf:0};view("iso");loop();
  return {dimensions:{x:size.x,y:size.y,z:size.z},meshes,triangles:Math.round(triangles)};
}
function fmtM(v){return v<1?`${(v*100).toFixed(1)} cm`:`${v.toFixed(3)} m`;}
function resetCandidate(){pendingFile=null;pendingData=null;disposePreview();$("cadPreviewWrap").style.display="none";$("cadPreviewActions").style.display="none";$("cadStandaloneInfo").textContent="";$("cadStandaloneReturn").style.display="none";}

$("cadStandaloneChoose").addEventListener("click",()=>{$("cadStandaloneFile").value="";$("cadStandaloneFile").click();});
$("cadStandaloneFile").addEventListener("change",async()=>{
  const file=$("cadStandaloneFile").files?.[0];if(!file)return;clearError();resetCandidate();const choose=$("cadStandaloneChoose");choose.disabled=true;$("cadStandaloneStatus").textContent="3D-preview wordt opgebouwd…";
  try{
    if(!/\.(glb|gltf)$/i.test(file.name))throw new Error("Kies een GLB- of glTF-bestand.");
    if(file.size>80*1024*1024)throw new Error("CAD-bestand is groter dan 80 MB.");
    if(!recovery())throw new Error("De actieve Measure AR-projectstate ontbreekt. Ga terug en open de import opnieuw vanuit het CAD-menu.");
    const info=await buildPreview(file);pendingFile=file;pendingData=info;const d=info.dimensions;
    $("cadPreviewWrap").style.display="block";$("cadPreviewActions").style.display="block";
    const unusual=Math.max(d.x,d.y,d.z)>500||Math.min(d.x,d.y,d.z)>100;
    $("cadStandaloneInfo").textContent=`Bestand: ${file.name}\nAfmetingen 1:1: ${fmtM(d.x)} × ${fmtM(d.y)} × ${fmtM(d.z)}\nMeshes: ${info.meshes} · Triangles: ${info.triangles.toLocaleString("nl-BE")} · Bestand: ${(file.size/1048576).toFixed(1)} MB${unusual?"\n⚠ Ongebruikelijk groot model — controleer de exporteenheden.":""}`;
    $("cadStandaloneStatus").textContent="Controleer model, oriëntatie en afmetingen. Draai met één vinger; zoom met twee vingers.";
  }catch(err){console.error(err);showError(err?.message||String(err));$("cadStandaloneStatus").textContent="Preview kon niet worden gemaakt.";}
  finally{choose.disabled=false;}
});
$("cadViewIso").addEventListener("click",()=>preview?.view("iso"));
$("cadViewTop").addEventListener("click",()=>preview?.view("top"));
$("cadViewFront").addEventListener("click",()=>preview?.view("front"));
$("cadViewFit").addEventListener("click",()=>preview?.view("iso"));
$("cadStandaloneReject").addEventListener("click",()=>{resetCandidate();$("cadStandaloneStatus").textContent="Kies een ander GLB/glTF-bestand.";$("cadStandaloneFile").value="";$("cadStandaloneFile").click();});
$("cadStandaloneUse").addEventListener("click",async()=>{
  if(!pendingFile||!pendingData)return;clearError();const use=$("cadStandaloneUse");use.disabled=true;$("cadStandaloneStatus").textContent="Model wordt lokaal opgeslagen…";
  try{const id="cad-"+crypto.randomUUID();await putBlob(id,pendingFile);const d=pendingData.dimensions;const model={id,name:pendingFile.name.replace(/\.(glb|gltf)$/i,""),fileName:pendingFile.name,fileKey:id,position:null,yaw:0,dimensions:d,placed:false,importedAt:new Date().toISOString()};addModelToRecovery(model);sessionStorage.setItem("measurear.pendingCadPlacement",id);$("cadStandaloneStatus").textContent="Model toegevoegd. Keer terug naar Measure AR om het 1:1 in AR te plaatsen.";$("cadStandaloneReturn").style.display="block";$("cadPreviewActions").style.display="none";$("cadStandaloneChoose").style.display="none";}catch(err){console.error(err);showError(err?.message||String(err));}finally{use.disabled=false;}
});
$("cadStandaloneReturn").addEventListener("click",()=>location.replace("./index.html?cad=pending"));
$("cadStandaloneCancel").addEventListener("click",()=>{sessionStorage.removeItem("measurear.pendingCadPlacement");disposePreview();location.replace("./index.html");});
