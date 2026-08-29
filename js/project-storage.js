import {S} from "./state.js?v=0.8.21.3-20260829-1030";
import {snapshotProject,restoreProject,clearHistory} from "./history.js?v=0.8.21.3-20260829-1030";
import {clearAllGeometry,validateGeometryState} from "./geometry.js?v=0.8.21.3-20260829-1030";
import {clearWalls} from "./walls.js?v=0.8.21.3-20260829-1030";
import {resetDrawingCore} from "./drawing-core.js?v=0.8.21.3-20260829-1030";

export const PROJECT_SCHEMA_VERSION=1;
const INDEX_KEY="measurear.projects.v1.index";
const PROJECT_PREFIX="measurear.projects.v1.";
const RECOVERY_KEY="measurear.recovery.v1";
const LAST_PROJECT_KEY="measurear.lastProjectId.v1";

function nowIso(){return new Date().toISOString();}
function safeParse(raw){try{return JSON.parse(raw);}catch{return null;}}
function cleanName(name){return String(name||"").trim().replace(/\s+/g," ").slice(0,80);}
function newId(){return "prj-"+crypto.randomUUID();}
function cloneRelocForSave(){
  return {
    references:(S.project.relocalization?.references||[]).map(r=>({
      id:r.id,pointId:r.pointId,name:r.name,description:r.description,projectPosition:{...r.projectPosition}
    })),
    lastResult:S.project.relocalization?.lastResult||null
  };
}

function readIndex(){
  const x=safeParse(localStorage.getItem(INDEX_KEY));
  return Array.isArray(x)?x.filter(v=>v&&v.id&&v.name):[];
}
function writeIndex(items){localStorage.setItem(INDEX_KEY,JSON.stringify(items));}
function upsertIndex(meta){
  const items=readIndex().filter(x=>x.id!==meta.id);
  items.unshift({id:meta.id,name:meta.name,createdAt:meta.createdAt,updatedAt:meta.updatedAt,appVersion:meta.appVersion,schemaVersion:meta.schemaVersion});
  items.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
  writeIndex(items);
}
function sourceSnapshot(){
  const snap=snapshotProject();
  // Persist source/model data only. Never persist runtime preview/camera/mesh objects.
  snap.tool={...snap.tool,kind:null,status:"idle",activePointId:null,firstPointId:null,pointIds:[],lineIds:[],transactions:[],activePlane:null};
  return snap;
}
function envelope(name,id=null,createdAt=null){
  const n=cleanName(name)||"Nieuw project",ts=nowIso();
  return {
    format:"MeasureARProject",schemaVersion:PROJECT_SCHEMA_VERSION,appVersion:S.version,
    project:{id:id||newId(),name:n,createdAt:createdAt||ts,updatedAt:ts,geo:S.project.geo,relocalization:cloneRelocForSave()},
    data:sourceSnapshot()
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
    const pointIds=new Set((d.points||[]).map(p=>p.id)),lineIds=new Set((d.lines||[]).map(l=>l.id)),wallIds=new Set((d.walls||[]).map(w=>w.id));
    if(pointIds.size!==(d.points||[]).length)errors.push("Dubbele punt-ID in project.");
    if(lineIds.size!==(d.lines||[]).length)errors.push("Dubbele lijn-ID in project.");
    for(const p of d.points||[]){
      const q=p.position;if(!q||![q.x,q.y,q.z].every(Number.isFinite))errors.push(`Punt ${p.name||p.id} heeft ongeldige coördinaten.`);
    }
    for(const l of d.lines||[]){
      if(!pointIds.has(l.startId)||!pointIds.has(l.endId))errors.push(`Lijn ${l.name||l.id} verwijst naar ontbrekend punt.`);
    }
    for(const w of d.walls||[])if(!lineIds.has(w.lineId))errors.push(`Muur ${w.name||w.id} verwijst naar ontbrekende lijn.`);
    for(const o of d.openings||[])if(!wallIds.has(o.wallId))errors.push(`Opening ${o.name||o.id} verwijst naar ontbrekende muur.`);
    for(const r of e.project?.relocalization?.references||[])if(!pointIds.has(r.pointId))errors.push(`Projectreferentie ${r.name||r.id} verwijst naar ontbrekend punt.`);
  }
  return {ok:errors.length===0,errors};
}

function setCurrentMeta(e,source="local"){
  Object.assign(S.project,{
    schemaVersion:e.schemaVersion,id:e.project.id,name:e.project.name,
    createdAt:e.project.createdAt||null,updatedAt:e.project.updatedAt||null,lastSavedAt:e.project.updatedAt||null,
    dirty:false,recoveryAvailable:hasRecovery(),loadedFrom:source,
    geo:e.project.geo||null,
    relocalization:{
      references:(e.project.relocalization?.references||[]).map(r=>({...r,projectPosition:{...r.projectPosition}})),
      active:false,captured:[],lastResult:e.project.relocalization?.lastResult||null,mode:"auto"
    }
  });
  localStorage.setItem(LAST_PROJECT_KEY,e.project.id);
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
function ensureCurrentIdentity(name=null){
  if(!S.project.id){S.project.id=newId();S.project.createdAt=nowIso();}
  if(name)S.project.name=cleanName(name)||S.project.name;
  if(!S.project.name)S.project.name="Nieuw project";
}

export function projectStats(){
  return {points:S.points.length,lines:S.lines.length,contours:S.contours.length,shapes:S.shapes.length,walls:S.walls.length,openings:S.openings.length};
}
export function formatStats(s=projectStats()){
  return `${s.points} punten · ${s.lines} lijnen · ${s.shapes} vormen · ${s.walls} muren · ${s.openings} openingen`;
}
export function listProjects(){return readIndex();}

export function saveCurrentProject(name=null,forceNew=false){
  if(forceNew){S.project.id=null;S.project.createdAt=null;}
  ensureCurrentIdentity(name);
  const e=envelope(S.project.name,S.project.id,S.project.createdAt);
  localStorage.setItem(PROJECT_PREFIX+e.project.id,JSON.stringify(e));
  upsertIndex({...e.project,appVersion:e.appVersion,schemaVersion:e.schemaVersion});
  setCurrentMeta(e,"local");
  clearRecovery();
  return e;
}
export function duplicateCurrentProject(name=null){
  const previous={id:S.project.id,name:S.project.name,createdAt:S.project.createdAt};
  const e=envelope(cleanName(name)||`${S.project.name} kopie`,null,null);
  localStorage.setItem(PROJECT_PREFIX+e.project.id,JSON.stringify(e));upsertIndex({...e.project,appVersion:e.appVersion,schemaVersion:e.schemaVersion});
  Object.assign(S.project,previous); // dupliceren opent de kopie niet automatisch
  return e;
}
export function renameStoredProject(id,name){
  const raw=localStorage.getItem(PROJECT_PREFIX+id),e=safeParse(raw);if(!e)throw new Error("Project niet gevonden.");
  const n=cleanName(name);if(!n)throw new Error("Projectnaam is verplicht.");
  e.project.name=n;e.project.updatedAt=nowIso();localStorage.setItem(PROJECT_PREFIX+id,JSON.stringify(e));upsertIndex({...e.project,appVersion:e.appVersion,schemaVersion:e.schemaVersion});
  if(S.project.id===id){S.project.name=n;S.project.updatedAt=e.project.updatedAt;document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));}
  return e;
}
export function deleteStoredProject(id){
  localStorage.removeItem(PROJECT_PREFIX+id);writeIndex(readIndex().filter(x=>x.id!==id));
  if(S.project.id===id){S.project.id=null;S.project.name="Nieuw project";S.project.lastSavedAt=null;S.project.dirty=true;}
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}

export function loadStoredProject(id){
  const e=safeParse(localStorage.getItem(PROJECT_PREFIX+id));if(!e)throw new Error("Project niet gevonden.");
  return loadEnvelope(e,"local");
}
export function loadEnvelope(e,source="import"){
  const v=validateProjectEnvelope(e);if(!v.ok)throw new Error("Project ongeldig: "+v.errors[0]);
  const before=snapshotProject();
  try{
    restoreProject(e.data);
    clearHistory();
    const check=validateGeometryState();if(!check.ok)throw new Error(check.errors[0]);
    setCurrentMeta(e,source);clearRecovery();
    document.dispatchEvent(new CustomEvent("measurear:project-loaded"));
    return e;
  }catch(err){
    try{restoreProject(before);}catch{}
    throw err;
  }
}
export function newProject(name="Nieuw project"){
  clearWalls();clearAllGeometry();resetDrawingCore();clearHistory();
  const ts=nowIso();Object.assign(S.project,{schemaVersion:1,id:newId(),name:cleanName(name)||"Nieuw project",createdAt:ts,updatedAt:ts,lastSavedAt:null,dirty:true,recoveryAvailable:false,loadedFrom:"new",geo:null,
    relocalization:{references:[],active:false,captured:[],lastResult:null,mode:"auto"}});
  clearRecovery();document.dispatchEvent(new CustomEvent("measurear:project-loaded"));document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
  return S.project;
}

export function markDirtyAndRecover(){
  if(S.history.restoring)return;
  ensureCurrentIdentity();
  S.project.dirty=true;S.project.updatedAt=nowIso();
  const e=envelope(S.project.name,S.project.id,S.project.createdAt);
  e.recovery=true;
  localStorage.setItem(RECOVERY_KEY,JSON.stringify(e));
  S.project.recoveryAvailable=true;
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
export function hasRecovery(){
  const e=safeParse(localStorage.getItem(RECOVERY_KEY));return Boolean(e&&validateProjectEnvelope(e).ok);
}
export function recoveryInfo(){
  const e=safeParse(localStorage.getItem(RECOVERY_KEY));if(!e)return null;
  const v=validateProjectEnvelope(e);return v.ok?{id:e.project.id,name:e.project.name,updatedAt:e.project.updatedAt,stats:{
    points:e.data.points.length,lines:e.data.lines.length,shapes:e.data.shapes.length,walls:e.data.walls.length,openings:e.data.openings.length
  }}:null;
}
export function restoreRecovery(){
  const e=safeParse(localStorage.getItem(RECOVERY_KEY));if(!e)throw new Error("Geen herstelproject gevonden.");
  return loadEnvelope(e,"recovery");
}
export function clearRecovery(){localStorage.removeItem(RECOVERY_KEY);S.project.recoveryAvailable=false;document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));}

export function exportCurrentProject(){
  ensureCurrentIdentity();const e=envelope(S.project.name,S.project.id,S.project.createdAt);
  const blob=new Blob([JSON.stringify(e,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  const safe=S.project.name.replace(/[^a-z0-9_-]+/gi,"_").replace(/^_+|_+$/g,"")||"measurear_project";
  a.href=url;a.download=`${safe}.measurear.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  return e;
}
export async function importProjectFile(file){
  if(!file)throw new Error("Geen bestand gekozen.");
  if(file.size>10*1024*1024)throw new Error("Projectbestand is groter dan 10 MB.");
  const raw=await file.text(),e=safeParse(raw);if(!e)throw new Error("Bestand bevat geen geldige JSON.");
  const v=validateProjectEnvelope(e);if(!v.ok)throw new Error("Import geweigerd: "+v.errors[0]);
  return loadEnvelope(e,"import");
}

export function initProjectStorage(){
  S.project.recoveryAvailable=hasRecovery();
  const last=localStorage.getItem(LAST_PROJECT_KEY),idx=readIndex();
  if(last){const meta=idx.find(x=>x.id===last);if(meta)Object.assign(S.project,{id:meta.id,name:meta.name,createdAt:meta.createdAt,updatedAt:meta.updatedAt,lastSavedAt:meta.updatedAt,loadedFrom:"meta"});}
  document.addEventListener("measurear:history-changed",()=>{if(!S.history.restoring)markDirtyAndRecover();});
  document.dispatchEvent(new CustomEvent("measurear:project-meta-changed"));
}
