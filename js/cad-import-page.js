const RECOVERY_KEY="measurear.recovery.v1";
const DB_NAME="measurear.cad.v1",STORE="files";
const $=id=>document.getElementById(id);

function showError(message){const e=$("cadStandaloneError");e.style.display="block";e.textContent=message;}
function clearError(){const e=$("cadStandaloneError");e.style.display="none";e.textContent="";}
function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
function dbOpen(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("CAD-opslag kon niet worden geopend."));});}
async function putBlob(key,blob){const db=await dbOpen();return new Promise((res,rej)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(blob,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error||new Error("CAD-bestand kon niet worden opgeslagen."));});}
async function measureFile(file){
  const THREE=await import("https://esm.sh/three@0.167.1");
  const {GLTFLoader}=await import("https://esm.sh/three@0.167.1/examples/jsm/loaders/GLTFLoader.js");
  const loader=new GLTFLoader(),url=URL.createObjectURL(file);
  try{
    const gltf=await loader.loadAsync(url),box=new THREE.Box3().setFromObject(gltf.scene),size=new THREE.Vector3();
    box.getSize(size);return {x:size.x,y:size.y,z:size.z};
  }finally{URL.revokeObjectURL(url);}
}
function recovery(){const r=safeParse(localStorage.getItem(RECOVERY_KEY));if(!r?.project||!r?.data)return null;return r;}
function addModelToRecovery(model){
  const rec=recovery();if(!rec)throw new Error("Geen actief herstelproject gevonden. Ga terug naar Measure AR en open CAD-import opnieuw.");
  if(!rec.project.cad)rec.project.cad={models:[]};if(!Array.isArray(rec.project.cad.models))rec.project.cad.models=[];
  rec.project.cad.models.push(model);rec.project.updatedAt=new Date().toISOString();rec.recovery=true;
  localStorage.setItem(RECOVERY_KEY,JSON.stringify(rec));
}

$("cadStandaloneChoose").addEventListener("click",()=>{$("cadStandaloneFile").value="";$("cadStandaloneFile").click();});
$("cadStandaloneFile").addEventListener("change",async()=>{
  const file=$("cadStandaloneFile").files?.[0];if(!file)return;
  clearError();const choose=$("cadStandaloneChoose");choose.disabled=true;$("cadStandaloneStatus").textContent="CAD-bestand wordt gecontroleerd en lokaal opgeslagen…";
  try{
    if(!/\.(glb|gltf)$/i.test(file.name))throw new Error("Kies een GLB- of glTF-bestand.");
    if(file.size>80*1024*1024)throw new Error("CAD-bestand is groter dan 80 MB.");
    if(!recovery())throw new Error("De actieve Measure AR-projectstate ontbreekt. Ga terug en open de import opnieuw vanuit het CAD-menu.");
    const dimensions=await measureFile(file),id="cad-"+crypto.randomUUID();
    await putBlob(id,file);
    const model={id,name:file.name.replace(/\.(glb|gltf)$/i,""),fileName:file.name,fileKey:id,position:null,yaw:0,dimensions,placed:false,importedAt:new Date().toISOString()};
    addModelToRecovery(model);
    sessionStorage.setItem("measurear.pendingCadPlacement",id);
    $("cadStandaloneInfo").textContent=`${model.name} · ${dimensions.x.toFixed(2)} × ${dimensions.y.toFixed(2)} × ${dimensions.z.toFixed(2)} m · schaal 1:1`;
    $("cadStandaloneStatus").textContent="Bestand is veilig opgeslagen. Keer nu terug naar Measure AR.";
    $("cadStandaloneReturn").style.display="block";
  }catch(err){console.error(err);showError(err?.message||String(err));$("cadStandaloneStatus").textContent="Import niet voltooid.";}
  finally{choose.disabled=false;}
});
$("cadStandaloneReturn").addEventListener("click",()=>location.replace("./index.html?cad=pending"));
$("cadStandaloneCancel").addEventListener("click",()=>{sessionStorage.removeItem("measurear.pendingCadPlacement");location.replace("./index.html");});
