import {S} from "./state.js?v=0.8.29.2-20260830-navigation-core";
import {snapshotProject,restoreProject,clearHistory} from "./history.js?v=0.8.29.2-20260830-navigation-core";
import {clearAllGeometry,validateGeometryState} from "./geometry.js?v=0.8.29.2-20260830-navigation-core";
import {clearWalls} from "./walls.js?v=0.8.29.2-20260830-navigation-core";
import {resetDrawingCore} from "./drawing-core.js?v=0.8.29.2-20260830-navigation-core";
import {detachAllPointAnchors} from "./world-lock.js?v=0.8.29.2-20260830-navigation-core";
import {clearCadRuntime,restoreCadRuntime} from "./cad.js?v=0.8.29.2-20260830-navigation-core";
import {clearAiBuilderObjects} from "./ai-builder.js?v=0.8.29.2-20260830-navigation-core";

export const PROJECT_SCHEMA_VERSION=1;
const INDEX_KEY="measurear.projects.v1.index";
const PROJECT_PREFIX="measurear.projects.v1.";
const RECOVERY_KEY="measurear.recovery.v1";
const LAST_PROJECT_KEY="measurear.lastProjectId.v1";
let lifecycleBusy=false;
let pendingAutoLoadId=null;

function nowIso(){return new Date().toISOString();}
function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
function cleanName(name){return String(name||"").trim().replace(/\s+/g," ").slice(0,80);}
function newId(){return "prj-"+crypto.randomUUID();}
function storageSet(key,value){
  try{localStorage.setItem(key,value);}catch(err){
    if(err?.name==="QuotaExceededError")throw new Error("Lokale opslag is vol. Exporteer of verwijder een oud project en probeer opnieuw.");
    throw new Error("Project kon niet lokaal worden opgeslagen.");
  }
}
function cloneReloc(reloc=S.project.relocalization){
  return {
    references:(reloc?.references||[]).map(r=>({id:r.id,pointId:r.pointId,name:r.name,description:r.description,projectPosition:{...r.projectPosition}})),
    lastResult:reloc?.lastResult||null
  };
}
function readIndex(){
  const x=safeParse(localStorage.getItem(INDEX_KEY));
  return Array.isArray(x)?x.filter(v=>v&&v.id&&cleanName(v.name)):[];
}
function writeIndex(items){storageSet(INDEX_KEY,JSON.stringify(items));}
function metaFromEnvelope(e){return {id:e.project.id,name:e.project.name,createdAt:e.project.createdAt,updatedAt:e.project.updatedAt,appVersion:e.appVersion,schemaVersion:e.schemaVersion};}
function upsertIndex(meta){
  const items=readIndex().filter(x=>x.id!==meta.id);
  items.push(meta);
  items.sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  writeIndex(items);
}
function sourceSnapshot(){
  const snap=snapshotProject();
  snap.tool={...snap.tool,kind:null,status:"idle",activePointId:null,firstPointId:null,pointIds:[],lineIds:[],transactions:[],activePlane:null};
  return snap;
}

function captureSpatialState(){
  const prev=S.project.spatial||{};
  let cam=null;
  try{
    if(S.renderer?.xr&&S.camera&&S.THREE){
      const xrCam=S.renderer.xr.getCamera(S.camera),p=new S.THREE.Vector3();
      xrCam.getWorldPosition(p);cam=p;
    }
  }catch{}
  return {
    projectOrigin:{...(prev.projectOrigin||{x:0,y:0,z:0})},
    savedWorldPose:cam&&[cam.x,cam.y,cam.z].every(Number.isFinite)?{camera:{x:cam.x,y:cam.y,z:cam.z},source:"xr-camera-local"}:(prev.savedWorldPose||null),
    savedAt:nowIso()
  };
}

function envelope(name,id,createdAt,data=sourceSnapshot(),projectExtras=null){
  const n=cleanName(name)||"Nieuw project",ts=nowIso();
  return {
    format:"MeasureARProject",schemaVersion:PROJECT_SCHEMA_VERSION,appVersion:S.version,
    project:{
      id:id||newId(),name:n,createdAt:createdAt||ts,updatedAt:ts,
      geo:projectExtras?.geo??S.project.geo,
      hybrid:projectExtras?.hybrid??JSON.parse(JSON.stringify(S.project.hybrid||{})),
      spatial:(()=>{const q=projectExtras?.spatial??captureSpatialState();return {...q,sessionTransform:null};})(),
      cad:JSON.parse(JSON.stringify(projectExtras?.cad??S.project.cad??{models:[]})),
      relocalization:projectExtras?.relocalization?cloneReloc(projectExtras.relocalization):cloneReloc()
    },
    data
  };
}

export function validateProjectEnvelope(e){
  const errors=[];
  if(!e||typeof e!=="object")return {ok:false,errors:["Projectbestand is geen geldig object."]};
  if(e.format!=="MeasureARProject")errors.push("Onbekend projectformaat.");
  if(e.schemaVersion!==PROJECT_SCHEMA_VERSION)errors.push(`Niet-ondersteunde schemaVersion ${e.schemaVersion??"?"}.`);
  if(!e.project?.id||!cleanName(e.project?.name))errors.push("Project-ID of -naam ontbreekt.");
  const d=e.data;
  if(!d||typeof d!=="object")errors.push("Projectdata ontbreekt.");
  else{
    for(const key of ["points","lines","contours","shapes","walls","openings"])if(!Array.isArray(d[key]))errors.push(`Projectveld ${key} ontbreekt.`);
    if(d.aiObjects!=null&&!Array.isArray(d.aiObjects))errors.push("Projectveld aiObjects is ongeldig.");
    const pointIds=new Set((d.points||[]).map(p=>p.id)),lineIds=new Set((d.lines||[]).map(l=>l.id)),wallIds=new Set((d.walls||[]).map(w=>w.id));
    if(pointIds.size!==(d.points||[]).length)errors.push("Dubbele punt-ID in project.");
    if(lineIds.size!==(d.lines||[]).length)errors.push("Dubbele lijn-ID in project.");
    for(const p of d.points||[]){const q=p.position;if(!q||![q.x,q.y,q.z].every(Number.isFinite))errors.push(`Punt ${p.name||p.id} heeft ongeldige coördinaten.`);}
    for(const l of d.lines||[])if(!pointIds.has(l.startId)||!pointIds.has(l.endId))errors.push(`Lijn ${l.name||l.id} verwijst naar ontbrekend punt.`);
    for(const w of d.walls||[])if(!lineIds.has(w.lineId))errors.push(`Muur ${w.name||w.id} verwijst naar ontbrekende lijn.`);
    for(const o of d.openings||[])if(!wallIds.has(o.wallId))errors.push(`Opening ${o.name||o.id} verwijst naar ontbrekende muur.`);
    const shapeIds=new Set((d.shapes||[]).map(s=>s.id));
    for(const a of d.aiObjects||[]){if(!a?.id||!shapeIds.has(a.sourceShapeId))errors.push(`AI-concept ${a?.name||a?.id||"?"} verwijst naar ontbrekende vorm.`);if(!Number.isFinite(Number(a?.height))||Number(a.height)<=0)errors.push(`AI-concept ${a?.name||a?.id||"?"} heeft ongeldige hoogte.`);}
    for(const r of e.project?.relocalization?.references||[])if(!pointIds.has(r.pointId))errors.push(`Projectreferentie ${r.name||r.id} verwijst naar ontbrekend punt.`);
  }
  return {ok:errors.length===0,errors};
}
function readStoredEnvelope(id){
  const e=safeParse(localStorage.getItem(PROJECT_PREFIX+id));
  if(!e)throw new Error("Project niet gevonden.");
  const v=validateProjectEnvelope(e);if(!v.ok)throw new Error("Opgeslagen project is beschadigd: "+v.errors[0]);
  return e;
}
function storedEnvelopeOrNull(id){try{return id?readStoredEnvelope(id):null;}catch{return null;}}
function setCurrentMeta(e,source="local"){
  Object.assign(S.project,{
    schemaVersion:e.schemaVersion,id:e.project.id,name:e.project.name,
    createdAt:e.project.createdAt||null,updatedAt:e.project.updatedAt||null,lastSavedAt:e.project.updatedAt||null,
    dirty:false,recoveryAvailable:hasRecovery(),loadedFrom:source,geo:e.project.geo||null,
    hybrid:e.project.hybrid||{savedHeading:null,currentHeading:null,lastAssessment:null,headingSource:null},
    spatial:{...(e.project.spatial||{projectOrigin:{x:0,y:0,z:0},savedWorldPose:null,savedAt:null}),sessionTransform:null},
    cad:JSON.parse(JSON.stringify(e.project.cad||{models:[]})),
    relocalization:{references:(e.project.relocalization?.references||[]).map(r=>({...r,projectPosition:{...r.projectPosition}})),active:false,captured:[],lastResult:e.project.relocalization?.lastResult||null,mode:"auto"}
  });
  storageSet(LAST_PROJECT_KEY,e.project.id);
  pendingAutoLoadId=null;
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
function ensureCurrentIdentity(name=null){
  if(!S.project.id){S.project.id=newId();S.project.createdAt=nowIso();}
  if(name)S.project.name=cleanName(name)||S.project.name;
  if(!S.project.name)S.project.name="Nieuw project";
}
function recoveryEnvelope(){
  ensureCurrentIdentity();
  const e=envelope(S.project.name,S.project.id,S.project.createdAt);
  e.recovery=true;return e;
}
function writeRecovery(){
  const e=recoveryEnvelope();storageSet(RECOVERY_KEY,JSON.stringify(e));S.project.recoveryAvailable=true;return e;
}
function recoveryEnvelopeOrNull(){
  const e=safeParse(localStorage.getItem(RECOVERY_KEY));
  return e&&validateProjectEnvelope(e).ok?e:null;
}
function repairIndex(){
  const repaired=[];
  for(let i=0;i<localStorage.length;i++){
    const key=localStorage.key(i);if(!key?.startsWith(PROJECT_PREFIX)||key===INDEX_KEY)continue;
    const e=safeParse(localStorage.getItem(key));if(!e||!validateProjectEnvelope(e).ok)continue;
    repaired.push(metaFromEnvelope(e));
  }
  repaired.sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
  writeIndex(repaired);
  const last=localStorage.getItem(LAST_PROJECT_KEY);
  if(last&&!repaired.some(x=>x.id===last))localStorage.removeItem(LAST_PROJECT_KEY);
  return repaired;
}

export function projectStats(){return {points:S.points.length,lines:S.lines.length,contours:S.contours.length,shapes:S.shapes.length,walls:S.walls.length,openings:S.openings.length,ai:S.aiObjects.length,cad:S.project.cad?.models?.length||0};}
export function formatStats(s=projectStats()){return `${s.points} punten · ${s.lines} lijnen · ${s.shapes} vormen · ${s.walls} muren · ${s.openings} openingen · ${s.ai||0} AI-concepten · ${s.cad||0} CAD`;}
export function listProjects(){return readIndex();}
export function getStoredProjectInfo(id){const e=readStoredEnvelope(id);return {...metaFromEnvelope(e),stats:{points:e.data.points.length,lines:e.data.lines.length,shapes:e.data.shapes.length,walls:e.data.walls.length,openings:e.data.openings.length,ai:e.data.aiObjects?.length||0,cad:e.project.cad?.models?.length||0}};}

export function saveCurrentProject(name=null,forceNew=false){
  const oldMeta={id:S.project.id,name:S.project.name,createdAt:S.project.createdAt,updatedAt:S.project.updatedAt,lastSavedAt:S.project.lastSavedAt,dirty:S.project.dirty,loadedFrom:S.project.loadedFrom};
  const targetId=forceNew?newId():(S.project.id||newId());
  const targetCreated=forceNew?nowIso():(S.project.createdAt||nowIso());
  const targetName=cleanName(name)||S.project.name||"Nieuw project";
  const e=envelope(targetName,targetId,targetCreated);
  try{
    storageSet(PROJECT_PREFIX+e.project.id,JSON.stringify(e));upsertIndex(metaFromEnvelope(e));setCurrentMeta(e,"local");clearRecovery();return e;
  }catch(err){Object.assign(S.project,oldMeta);throw err;}
}
export function duplicateCurrentProject(name=null){
  ensureCurrentIdentity();
  const e=envelope(cleanName(name)||`${S.project.name} kopie`,null,null);
  storageSet(PROJECT_PREFIX+e.project.id,JSON.stringify(e));upsertIndex(metaFromEnvelope(e));return e;
}
export function duplicateStoredProject(id,name=null){
  const src=readStoredEnvelope(id);
  const copy=envelope(cleanName(name)||`${src.project.name} kopie`,null,null,JSON.parse(JSON.stringify(src.data)),{geo:src.project.geo||null,spatial:src.project.spatial||null,relocalization:src.project.relocalization||null,hybrid:src.project.hybrid||null,cad:src.project.cad||null});
  storageSet(PROJECT_PREFIX+copy.project.id,JSON.stringify(copy));upsertIndex(metaFromEnvelope(copy));return copy;
}
export function renameStoredProject(id,name){
  const e=readStoredEnvelope(id),n=cleanName(name);if(!n)throw new Error("Projectnaam is verplicht.");
  e.project.name=n;e.project.updatedAt=nowIso();storageSet(PROJECT_PREFIX+id,JSON.stringify(e));upsertIndex(metaFromEnvelope(e));
  if(S.project.id===id){S.project.name=n;S.project.updatedAt=e.project.updatedAt;document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));}
  return e;
}
export function deleteStoredProject(id){
  const active=S.project.id===id,oldName=S.project.name||"Project";
  localStorage.removeItem(PROJECT_PREFIX+id);writeIndex(readIndex().filter(x=>x.id!==id));
  if(localStorage.getItem(LAST_PROJECT_KEY)===id)localStorage.removeItem(LAST_PROJECT_KEY);
  const rec=recoveryEnvelopeOrNull();if(rec?.project?.id===id)localStorage.removeItem(RECOVERY_KEY);
  if(active){
    const ts=nowIso();
    Object.assign(S.project,{id:newId(),name:`Niet-opgeslagen kopie van ${oldName}`.slice(0,80),createdAt:ts,updatedAt:ts,lastSavedAt:null,dirty:true,recoveryAvailable:false,loadedFrom:"detached"});
    writeRecovery();
  }
  if(pendingAutoLoadId===id)pendingAutoLoadId=null;
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
  return {deletedId:id,wasActive:active};
}

export function loadStoredProject(id){return loadEnvelope(readStoredEnvelope(id),"local");}
export function loadEnvelope(e,source="import"){
  const v=validateProjectEnvelope(e);if(!v.ok)throw new Error("Project ongeldig: "+v.errors[0]);
  if(!S.THREE||!S.scene)throw new Error("Start eerst AR voordat je een project met geometrie opent.");
  const before=snapshotProject(),beforeMeta=JSON.parse(JSON.stringify(S.project));
  lifecycleBusy=true;
  try{
    // Een nieuw project mag nooit worden opgebouwd met de sessietransform/anchors
    // van het vorige project. Reset die context vóór createPoint() wordt aangeroepen.
    detachAllPointAnchors();
    clearCadRuntime();
    S.referenceCaptureId=null;
    S.project.spatial={...(S.project.spatial||{}),sessionTransform:null};
    restoreProject(e.data);clearHistory();
    const check=validateGeometryState();if(!check.ok)throw new Error(check.errors[0]);
    setCurrentMeta(e,source);clearRecovery();restoreCadRuntime().catch(err=>console.warn("CAD restore",err));document.dispatchEvent(new CustomEvent("measurear:project-loaded"));return e;
  }catch(err){
    try{
      detachAllPointAnchors();
      clearCadRuntime();clearAiBuilderObjects();
      Object.assign(S.project,beforeMeta);
      restoreProject(before);
    }catch{}
    throw err;
  }finally{lifecycleBusy=false;}
}
export function newProject(name="Nieuw project"){
  lifecycleBusy=true;
  try{
    detachAllPointAnchors();clearCadRuntime();clearAiBuilderObjects();S.referenceCaptureId=null;
    clearWalls();clearAllGeometry();resetDrawingCore();clearHistory();
    const ts=nowIso();Object.assign(S.project,{schemaVersion:1,id:newId(),name:cleanName(name)||"Nieuw project",createdAt:ts,updatedAt:ts,lastSavedAt:null,dirty:true,recoveryAvailable:false,loadedFrom:"new",geo:null,hybrid:{savedHeading:null,currentHeading:null,lastAssessment:null,headingSource:null},spatial:{projectOrigin:{x:0,y:0,z:0},savedWorldPose:null,savedAt:null,sessionTransform:null},cad:{models:[]},relocalization:{references:[],active:false,captured:[],lastResult:null,mode:"auto"}});
    writeRecovery();document.dispatchEvent(new CustomEvent("measurear:project-loaded"));document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));return S.project;
  }finally{lifecycleBusy=false;}
}

export function markDirtyAndRecover(){
  if(S.history.restoring||lifecycleBusy)return;
  ensureCurrentIdentity();S.project.dirty=true;S.project.updatedAt=nowIso();writeRecovery();document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
export function hasRecovery(){return Boolean(recoveryEnvelopeOrNull());}
export function recoveryInfo(){
  const e=recoveryEnvelopeOrNull();if(!e)return null;
  return {id:e.project.id,name:e.project.name,updatedAt:e.project.updatedAt,stats:{points:e.data.points.length,lines:e.data.lines.length,shapes:e.data.shapes.length,walls:e.data.walls.length,openings:e.data.openings.length,ai:e.data.aiObjects?.length||0,cad:e.project.cad?.models?.length||0}};
}
export function restoreRecovery(){const e=recoveryEnvelopeOrNull();if(!e)throw new Error("Geen geldig herstelproject gevonden.");return loadEnvelope(e,"recovery");}
export function clearRecovery(){localStorage.removeItem(RECOVERY_KEY);S.project.recoveryAvailable=false;document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));}

export function exportCurrentProject(){
  ensureCurrentIdentity();const e=envelope(S.project.name,S.project.id,S.project.createdAt);
  const blob=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  const safe=S.project.name.replace(/[^a-z0-9_-]+/gi,"_").replace(/^_+|_+$/g,"")||"measurear_project";
  a.href=url;a.download=`${safe}.measurear.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return e;
}
export async function importProjectFile(file){
  if(!file)throw new Error("Geen bestand gekozen.");if(file.size>10*1024*1024)throw new Error("Projectbestand is groter dan 10 MB.");
  const raw=await file.text(),src=safeParse(raw);if(!src)throw new Error("Bestand bevat geen geldige JSON.");
  const v=validateProjectEnvelope(src);if(!v.ok)throw new Error("Import geweigerd: "+v.errors[0]);
  const idExists=Boolean(storedEnvelopeOrNull(src.project.id));
  const imported=envelope(idExists?`${src.project.name} import`:src.project.name,idExists?newId():src.project.id,src.project.createdAt,JSON.parse(JSON.stringify(src.data)),{geo:src.project.geo||null,spatial:src.project.spatial||null,relocalization:src.project.relocalization||null,hybrid:src.project.hybrid||null,cad:src.project.cad||null});
  loadEnvelope(imported,"import");
  storageSet(PROJECT_PREFIX+imported.project.id,JSON.stringify(imported));upsertIndex(metaFromEnvelope(imported));setCurrentMeta(imported,"local");clearRecovery();
  return imported;
}

function restoreProjectForArSession(){
  if(!S.THREE||!S.scene)return;
  const rec=recoveryEnvelopeOrNull();
  if(S.project.dirty&&rec&&rec.project.id===S.project.id){try{loadEnvelope(rec,"recovery");return;}catch(err){console.warn("Recovery auto-load failed",err);}}
  // On a fresh app start, never erase an available recovery by auto-opening the last saved project.
  // The user can explicitly restore it from Project → Herstel.
  if(!S.project.id&&rec)return;
  const id=S.project.id&&storedEnvelopeOrNull(S.project.id)?S.project.id:pendingAutoLoadId;
  if(id){try{loadStoredProject(id);}catch(err){console.warn("Last project auto-load failed",err);pendingAutoLoadId=null;}}
}
export function initProjectStorage(){
  const idx=repairIndex();S.project.recoveryAvailable=hasRecovery();
  const last=localStorage.getItem(LAST_PROJECT_KEY);pendingAutoLoadId=last&&idx.some(x=>x.id===last)?last:null;
  document.addEventListener("measurear:history-changed",()=>{if(!S.history.restoring&&!lifecycleBusy)markDirtyAndRecover();});
  document.addEventListener("measurear:ar-ready",restoreProjectForArSession);
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
