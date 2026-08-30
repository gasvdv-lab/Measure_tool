import {S,$,fmt,fmtLine,fmtAreaUnit,fmtVolumeUnit,getPoint,getLine,getContour,getShape} from "./state.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {
  startTool,cancelTool,setPlacement,setDistance,setConstraint,setAxisDirection,setPerpendicularMode,setAngle,flipSide,setReferenceLine,setSnapMode,
  confirmCandidate,undoToolStep,finishTool,toolLabel,constraintLabel,getActivePoint,referenceRequired,resetDrawingCore
} from "./drawing-core.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {
  createShape,updateShape,deleteShapeOnly,deleteShapeWithContour,deleteLineRaw,deletePointRaw,renamePoint,updateLine,analyzeContour,analyzePolyline,updatePolyline,
  lineDependencies,pointDependencies,canDeleteLine,canDeletePoint,clearAllGeometry,validateGeometryState,dispose
} from "./geometry.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {startAR,resumeARFromGesture,suspendARForCadImport,applyZoom,resetTrackingSamples} from "./ar.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {createWall,updateWall,deleteWall,toggleWall,wallsUsingLine,clearWalls,createOpening,updateOpening,deleteOpening,getOpening,openingsForWall,nextOpeningName} from "./walls.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {runHistoryAction,undoHistory,redoHistory,historyStatus,clearHistory} from "./history.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {
  initProjectStorage,saveCurrentProject,listProjects,loadStoredProject,newProject,duplicateStoredProject,
  deleteStoredProject,renameStoredProject,projectStats,formatStats,getStoredProjectInfo,hasRecovery,recoveryInfo,restoreRecovery,clearRecovery,
  exportCurrentProject,importProjectFile,markDirtyAndRecover
} from "./project-storage.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {
  captureCurrentGeo,addProjectReference,removeProjectReference,clearProjectReferences,beginRelocalization,cancelRelocalization,
  captureRelocalizationPoint,solveRelocalization,applyRelocalization,relocalizationSummary,beginSpatialRestore
} from "./relocalization.js?v=0.8.36.2.2-20260830-capture-rearm-fix";

import {captureHybridBaseline,assessHybridLocation,enableHeading} from "./hybrid-localization.js?v=0.8.36.2.2-20260830-capture-rearm-fix";

import {detachAllPointAnchors} from "./world-lock.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {importCadFile,listCadModels,cadStatus,selectCad,beginCadPlacement,rotateCad,moveCadHeight,confirmCadPlacement,cancelCadPlacement,deleteCadModel,clearCadRuntime,restoreCadRuntime} from "./cad.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {initProfessionalColorPickers,refreshProfessionalColorPickers} from "./color-picker.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {initThemeSelector} from "./theme-selector.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {executeAiPrototype,getAiObject,getAiObjectForShape,toggleAiObjectLock,deleteAiObject,clearAiBuilderObjects,aiObjectSummary} from "./ai-builder.js?v=0.8.36.2.2-20260830-capture-rearm-fix";
import {listClearanceTargets,analyzeClearance,clearanceStatus,getClearance,createClearance,updateClearance,deleteClearance,clearClearances} from "./clearance.js?v=0.8.36.2.2-20260830-capture-rearm-fix";


const pages=["home","project","references","relocalize","projects","cad","objects","measurements","clearance","polyline","line","point","walltool","wallcreate","wall","openingcreate","opening","shapecreate","shape","aibuilder","settings","clear"];
let menuStack=["home"];
let toastTimer=null;


const el=id=>$(id);
function bind(id,event,fn){
  const node=el(id);if(!node)throw new Error(`UI-element ontbreekt: #${id}`);
  node.addEventListener(event,async ev=>{
    try{await fn(ev);}catch(err){console.error(`Actie #${id} mislukt`,err);showStatus(err.message||String(err),true);}
  });
}
function verifyState(){
  const r=validateGeometryState();S.diagnostics.lastCheck=r;
  if(!r.ok){S.diagnostics.lastError=r.errors.join(" | ");throw new Error("Projectconsistentie-fout: "+r.errors[0]);}
  return true;
}
function showStatus(msg,error=false){
  if(el("detail"))el("detail").textContent=msg;
  if(error&&el("hint"))el("hint").textContent=msg;
  const t=el("toast");
  if(t&&msg){clearTimeout(toastTimer);t.textContent=msg;t.classList.toggle("error",error);t.classList.add("show");toastTimer=setTimeout(()=>t.classList.remove("show"),2600);}
}
function closePopovers(){["directionPopover","distancePopover","morePopover"].forEach(id=>el(id)?.classList.remove("open"));S.hud.lastPopover=null;}
function togglePopover(id){
  const node=el(id),was=node.classList.contains("open");
  closePopovers();
  if(!was){node.classList.add("open");S.hud.lastPopover=id;}
  else S.hud.lastPopover=null;
}
function showPage(name,push=true){
  pages.forEach(p=>el("page-"+p)?.classList.remove("active"));const page=el("page-"+name);if(!page)throw new Error(`Menupagina ontbreekt: ${name}`);page.classList.add("active");
  const titles={home:"Measure AR",project:"Project",references:"Projectreferenties",relocalize:"Projectpositie herstellen",projects:"Mijn projecten",cad:"CAD / 3D-model",objects:"Objecten",measurements:"Metingen",clearance:"Vrije ruimte / collision",polyline:"Doorlopende meting",line:"Lijn",point:"Punt",walltool:"Muur tekenen",wallcreate:"Muur maken",wall:"Muur",openingcreate:"Opening toevoegen",opening:"Opening",shapecreate:"Vorm opslaan",shape:"Vorm",aibuilder:"AI Builder · Prototype",settings:"Instellingen",clear:"Alles wissen"};
  el("menuTitle").textContent=titles[name]||name;if(push&&menuStack.at(-1)!==name)menuStack.push(name);el("menuBackBtn").style.visibility=name==="home"?"hidden":"visible";if(name==="objects")renderObjects();if(name==="measurements")renderMeasurements();if(name==="clearance")renderClearancePage();if(name==="project")renderProjectPage();if(name==="references")renderReferenceManager();if(name==="relocalize")renderRelocalizePage();if(name==="projects")renderProjectsList();if(name==="cad")renderCadPage();requestAnimationFrame(refreshProfessionalColorPickers);
}
function cancelReferenceCapture(){
  S.referenceCaptureId=null;
}
function openMenu(){menuStack=["home"];showPage("home",false);el("menuPanel").classList.add("open");el("menuMeta").textContent=`${S.project.name||"Project"} · v${S.version}`;closePopovers();}
function closeMenu(){el("menuPanel").classList.remove("open");closePopovers();S.objectPickMode=null;}
function returnToArView(){
  closeMenu();
  if(S.xrSession){
    const app=el("app"),overlay=el("overlay");
    if(app)app.style.display="none";
    if(overlay)overlay.style.display="block";
    if(S.renderer?.domElement)S.renderer.domElement.style.display="block";
  }
}
function menuBack(){if(menuStack.length<=1){closeMenu();return;}menuStack.pop();showPage(menuStack.at(-1),false);}


function syncHistoryControls(){
  const h=historyStatus();
  for(const id of ["globalUndoBtn","hudUndoBtn"])if(el(id))el(id).disabled=!h.canUndo;
  for(const id of ["globalRedoBtn","hudRedoBtn"])if(el(id))el(id).disabled=!h.canRedo;
  if(el("historyInfo")){
    if(h.canUndo)el("historyInfo").textContent=`Ongedaan: ${h.undoLabel}${h.canRedo?` · Opnieuw: ${h.redoLabel}`:""}`;
    else if(h.canRedo)el("historyInfo").textContent=`Opnieuw: ${h.redoLabel}`;
    else el("historyInfo").textContent="Geen bewerkingen in historie.";
  }
}
function afterProjectChange(message=""){
  verifyState();renderObjects();syncHud();syncHistoryControls();syncProjectMeta();
  if(message)showStatus(message);
}

function unitDistanceText(){
  if(S.tool.placement==="manual")return "AUTO ▾";
  const unit=el("hudUnit")?.value||S.defaults.unit;
  const n=unit==="mm"?S.tool.distanceM*1000:unit==="cm"?S.tool.distanceM*100:S.tool.distanceM;
  const decimals=unit==="mm"?0:unit==="cm"?1:3;
  return `${Number(n.toFixed(decimals))} ${unit} ▾`;
}
function populateReference(){
  const s=el("hudReference");if(!s)return;const old=S.tool.referenceLineId;s.innerHTML="";
  if(!S.lines.length){s.add(new Option("Geen lijnen beschikbaar",""));return;}
  S.lines.forEach(l=>s.add(new Option(`${l.name} · ${fmt(l.distance)}`,l.id)));
  if(old&&S.lines.some(l=>l.id===old))s.value=old;
}
function syncHudStatus(){
  if(!S.tool.kind)return;
  const p=getActivePoint();
  el("hudActivePoint").textContent=`Start: ${p?.name||"—"}`;

  const ref=getLine(S.tool.referenceLineId);
  const needsRef=referenceRequired();
  el("hudReferenceChip").classList.toggle("optional",!needsRef);
  el("hudReferenceChip").textContent=`Ref: ${ref?.name||"—"}`;

  const sideRelevant=["vertical","parallel","perpendicular","angle"].includes(S.tool.constraint);
  const axisLabels={"x+":"X+ →","x-":"X− ←","z+":"Z+ ↓","z-":"Z− ↑"};
  if(el("hudAxisWrap"))el("hudAxisWrap").style.display=S.tool.constraint==="axis"?"grid":"none";
  document.querySelectorAll("[data-axis-direction]").forEach(b=>b.classList.toggle("active",b.dataset.axisDirection===S.tool.axisDirection));
  el("hudSideChip").classList.toggle("optional",!sideRelevant);
  if(S.tool.constraint==="vertical")el("hudSideChip").textContent=`Richting: ${S.tool.side>0?"omhoog":"omlaag"}`;
  else if(S.tool.constraint==="perpendicular"&&S.tool.perpendicularMode==="vertical")el("hudSideChip").textContent=`Richting: ${S.tool.side>0?"omhoog":"omlaag"}`;
  else if(S.tool.constraint==="perpendicular")el("hudSideChip").textContent=`Zijde: ${S.tool.side>0?"links":"rechts"}`;
  else if(S.tool.constraint==="parallel")el("hudSideChip").textContent=`Richting: ${S.tool.side>0?"voor":"tegen"}`;
  else el("hudSideChip").textContent=`Zijde: ${S.tool.side>0?"links":"rechts"}`;

  const c=S.tool.candidate;
  const snapVisible=Boolean(c?.valid&&c.snapType);
  el("hudSnapChip").classList.toggle("optional",!snapVisible);
  const names={point:"punt",intersection:"snijpunt",midpoint:"midden",line:"lijn",opening:"opening",wall:"muur"};
  el("hudSnapChip").textContent=S.tool.snapMode==="off"?"SNAP ○":snapVisible?`SNAP ● · ${names[c.snapType]||c.snapType}`:"SNAP ●";
}
function syncCandidateContext(){
  if(!S.tool.kind||!el("hudContext"))return;
  const p=getActivePoint(),candidate=S.tool.candidate;
  let context=S.tool.status==="complete"?"Klaar · resultaat zichtbaar · open ☰ voor een nieuwe functie":p?`Vertrekpunt ${p.name} actief`:"Plaats punt A";
  if(candidate&&!candidate.valid)context=candidate.reason;
  el("hudContext").textContent=context;
  syncHudStatus();
}
function syncHud(){
  const active=Boolean(S.tool.kind);
  el("drawingHud").classList.toggle("active",active);
  if(!active){closePopovers();return;}
  el("hudToolBtn").textContent=toolLabel();
  el("constraintHudBtn").textContent=constraintLabel()+" ▾";
  el("distanceHudBtn").textContent=unitDistanceText();
  document.querySelectorAll("[data-hud-direction]").forEach(b=>b.classList.toggle("active",b.dataset.hudDirection===S.tool.constraint));
  const refNeeded=referenceRequired();el("hudReferenceWrap").style.display=refNeeded?"block":"none";el("hudAngleWrap").style.display=S.tool.constraint==="angle"?"grid":"none";
  if(el("hudPerpWrap"))el("hudPerpWrap").style.display=S.tool.constraint==="perpendicular"?"block":"none";
  if(el("hudConstraintDoneWrap"))el("hudConstraintDoneWrap").style.display=["perpendicular","angle"].includes(S.tool.constraint)?"block":"none";
  document.querySelectorAll("[data-perpendicular-mode]").forEach(b=>b.classList.toggle("active",b.dataset.perpendicularMode===S.tool.perpendicularMode));
  el("hudAngle").value=String(S.tool.angleDeg);populateReference();
  if(refNeeded&&S.tool.referenceLineId)el("hudReference").value=S.tool.referenceLineId;
  syncCandidateContext();
  const multi=["polyline","shape","wall"].includes(S.tool.kind)&&S.tool.status==="drawing";
  const showActions=multi||Boolean(S.tool.transactions.length);
  el("hudActions").classList.toggle("visible",showActions);
  el("drawingHud").classList.toggle("detailed",S.hud.compact===false);
  el("hudUndoBtn").disabled=S.tool.status==="complete"||!S.tool.transactions.length;
  el("hudFinishBtn").style.display=multi?"block":"none";
  el("hudFinishBtn").disabled=S.tool.kind==="shape"?S.tool.pointIds.length<3:!S.tool.lineIds.length;
  el("hudFinishBtn").textContent=S.tool.kind==="shape"?"Sluiten":"Voltooien";
}

function begin(kind,startPointId=null){
  startTool(kind,{startPointId});closeMenu();closePopovers();syncHud();
  el("distance").textContent="—";
  el("hint").textContent=startPointId?`Vertrekpunt ${getPoint(startPointId)?.name} actief. Stel richting/afstand in of richt handmatig.`:"Richt op een oppervlak en bevestig punt A.";
}


function typeLabel(type){return type==="door"?"Deur":type==="window"?"Raam":"Opening";}
function openWall(id){
  const w=S.walls.find(x=>x.id===id);if(!w)return;
  S.selectedWallId=w.id;el("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;
  el("editWallName").value=w.name;el("editWallHeight").value=w.height;el("editWallThickness").value=w.thickness;
  el("editWallSide").value=w.side;el("editWallOrientation").value=w.orientation;el("editWallAngle").value=w.angle;
  el("editWallAngleWrap").style.display=w.orientation==="angle"?"block":"none";el("editWallColor").value=w.color;el("editWallOpacity").value=w.opacity;
  const openings=openingsForWall(w.id);
  el("wallOpeningsInfo").textContent=openings.length?`${openings.length} opening(en): ${openings.map(o=>o.name).join(", ")}`:"Geen openingen.";
  showPage("wall");
}
function beginOpening(type){
  const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");
  const presets=type==="door"?{width:.90,height:2.10,bottom:0}:type==="window"?{width:1.20,height:1.10,bottom:.90}:{width:1,height:1,bottom:.50};
  el("openingType").value=type;el("openingName").value=nextOpeningName(type);
  el("openingX").value=.50;el("openingWidth").value=presets.width;el("openingHeight").value=presets.height;el("openingBottom").value=presets.bottom;
  el("openingCreateInfo").textContent=`In ${w.name} · positie X gemeten vanaf begin van de muur.`;
  el("openingError").style.display="none";showPage("openingcreate");
}
function openOpening(id){
  const o=getOpening(id);if(!o)return;S.selectedOpeningId=o.id;S.selectedWallId=o.wallId;
  el("openingInfo").textContent=`${typeLabel(o.type)} in ${S.walls.find(w=>w.id===o.wallId)?.name||"muur"}`;
  el("editOpeningType").value=o.type;el("editOpeningName").value=o.name;el("editOpeningX").value=o.x;
  el("editOpeningWidth").value=o.width;el("editOpeningHeight").value=o.height;el("editOpeningBottom").value=o.bottom;
  showPage("opening");
}


function projectDate(iso){
  if(!iso)return "—";const d=new Date(iso);return Number.isNaN(d.getTime())?"—":d.toLocaleString("nl-BE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

function relocalizeModeText(mode){
  return mode==="auto"?"Grof: alleen opgeslagen locatie/oriëntatie-hints. Geen centimeterprecisie."
    :mode==="1"?"Snel: corrigeert positie met één fysiek referentiepunt."
    :mode==="2"?"Standaard: corrigeert positie en richting met twee referentiepunten."
    :mode==="3"?"Nauwkeurig: volledige 3D-uitlijning met drie niet-collineaire punten."
    :"Precisie: 4+ punten met best-fit en foutcontrole.";
}
function renderReferenceManager(){
  const sel=el("referencePointSelect"),current=S.project.relocalization.references||[];sel.innerHTML="";
  const used=new Set(current.map(r=>r.pointId));
  for(const p of S.points)if(!used.has(p.id))sel.add(new Option(`Punt ${p.name}`,p.id));
  el("referenceName").value=sel.options.length?`Referentie ${current.length+1}`:"";
  const box=el("referenceList");box.innerHTML="";
  if(!current.length){box.innerHTML='<div class="help">Nog geen referentiepunten.</div>';return;}
  for(const r of current){
    const row=document.createElement("div");row.className="objectRow";
    const info=document.createElement("button");info.className="secondary";info.textContent=`${r.name} · punt ${getPoint(r.pointId)?.name||"?"}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    del.onclick=()=>{removeProjectReference(r.id);markProjectDirtyFromReference();renderReferenceManager();};
    row.append(info,del);box.append(row);
  }
}
function markProjectDirtyFromReference(){
  document.dispatchEvent(new CustomEvent("measurear:history-changed"));
}
function renderRelocalizePage(){
  const mode=el("relocalizeMode").value||"2";el("relocalizeHelp").textContent=relocalizeModeText(mode);
  const geo=S.project.geo,ass=S.project.hybrid?.lastAssessment;
  el("relocalizeGeoInfo").textContent=geo?`Opgeslagen GPS: ${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)} · ±${Number.isFinite(geo.accuracy)?geo.accuracy.toFixed(1):"?"} m${Number.isFinite(S.project.hybrid?.savedHeading)?` · richting ${S.project.hybrid.savedHeading.toFixed(0)}°`:""}`:"Geen GPS-locatie opgeslagen.";
  if(el("hybridStatus")){
    el("hybridStatus").textContent=ass?`Hybride check: ${ass.quality} · ${ass.distance.toFixed(1)} m van opgeslagen locatie · gecombineerde GPS-onzekerheid ±${ass.uncertainty.toFixed(1)} m${Number.isFinite(ass.headingDelta)?` · richtingsverschil ${Math.abs(ass.headingDelta).toFixed(0)}°`:" · richting niet beschikbaar"}. GPS/richting dienen alleen als grove voorlokalisatie; referenties bepalen de precisie.`:"Nog geen hybride locatiecheck uitgevoerd.";
  }
  const refs=S.project.relocalization.references||[],box=el("relocalizeRefs");box.innerHTML="";
  if(!refs.length){box.innerHTML='<div class="help">Geen referentiepunten geregistreerd.</div>';return;}
  for(const r of refs){
    const row=document.createElement("div");row.className="objectRow";
    const info=document.createElement("button");info.className="secondary";info.textContent=`${r.name} · ${S.project.relocalization.captured.some(c=>c.refId===r.id)?"✓ opnieuw aangewezen":"nog aanwijzen"}`;
    const cap=document.createElement("button");cap.className="primary";cap.textContent="Gebruik vizier";
    cap.onclick=()=>{
      S.referenceCaptureId=r.id;
      resetTrackingSamples();
      returnToArView();
      el("hint").textContent=`${r.name} aanwijzen · richt het vizier exact op het fysieke punt en druk op de witte knop.`;
      showStatus(`${r.name}: richt nu met het vizier en bevestig met de witte knop.`);
    };
    row.append(info,cap);box.append(row);
  }
}

function renderProjectPage(){
  el("projectName").value=S.project.name||"Nieuw project";
  el("projectStats").textContent=formatStats(projectStats())+` · ${S.project.relocalization.references.length} refs`;
  const saveState=el("projectSaveState");
  saveState.textContent=S.project.dirty
    ?`● Gewijzigd · ${S.project.recoveryAvailable?"herstel beschikbaar":"nog niet opgeslagen"}`
    :(S.project.lastSavedAt?`✓ Opgeslagen · ${projectDate(S.project.lastSavedAt)}`:"Nog niet handmatig opgeslagen.");
  saveState.classList.toggle("dirty",S.project.dirty);saveState.classList.toggle("saved",!S.project.dirty&&Boolean(S.project.lastSavedAt));
  const info=recoveryInfo(),box=el("recoveryBox");
  box.style.display=info?"block":"none";
  if(info)el("recoveryInfo").textContent=`${info.name} · ${projectDate(info.updatedAt)} · ${info.stats.points}p/${info.stats.lines}l/${info.stats.walls}m/${info.stats.openings}o`;
  el("restoreRecoveryBtn").disabled=!info;el("discardRecoveryBtn").disabled=!info;
}
function renderProjectsList(){
  const box=el("projectsList"),items=listProjects();box.innerHTML="";
  if(!items.length){box.innerHTML='<div class="help">Nog geen opgeslagen projecten. Maak of sla eerst een project op.</div>';return;}
  for(const p of items){
    let info=null;try{info=getStoredProjectInfo(p.id);}catch{}
    const card=document.createElement("div");card.className="projectCard";
    const head=document.createElement("div");head.className="projectCardHead";
    const text=document.createElement("div");
    const title=document.createElement("div");title.className="projectCardTitle";title.textContent=p.name;
    const meta=document.createElement("div");meta.className="projectCardMeta";meta.textContent=`${projectDate(p.updatedAt)}${info?` · ${formatStats(info.stats)}`:""}`;
    text.append(title,meta);head.append(text);
    if(S.project.id===p.id){const badge=document.createElement("span");badge.className="projectBadge";badge.textContent="ACTIEF";head.append(badge);}
    const actions=document.createElement("div");actions.className="projectCardActions";
    const open=document.createElement("button");open.className="primary";open.textContent=S.project.id===p.id?"Actief project":"Openen";
    open.disabled=S.project.id===p.id;
    const more=document.createElement("button");more.className="secondary projectMore";more.textContent="⋮";more.setAttribute("aria-label",`Meer acties voor ${p.name}`);
    actions.append(open,more);
    const panel=document.createElement("div");panel.className="projectMorePanel";
    const duplicate=document.createElement("button");duplicate.className="secondary";duplicate.textContent="Kopiëren";
    const rename=document.createElement("button");rename.className="secondary";rename.textContent="Hernoemen";
    const del=document.createElement("button");del.className="danger";del.textContent="Project wissen";
    panel.append(rename,duplicate,del);
    open.onclick=()=>{
      if(S.project.dirty&&(S.points.length||S.lines.length||S.walls.length||S.shapes.length)&&!confirm("Er zijn niet-opgeslagen wijzigingen. Ander project openen en deze wijzigingen verlaten?"))return;
      const e=loadStoredProject(p.id);
      const refs=S.project.relocalization.references?.length||0;
      if(refs){
        beginSpatialRestore();
        showPage("relocalize",false);renderRelocalizePage();
        showStatus(`Project ${e.project.name} geladen · herstel positie met ${refs} opgeslagen referentiepunt(en).`);
      }else{afterProjectChange(`✓ Project ${e.project.name} geopend.`);closeMenu();}
    };
    more.onclick=()=>panel.classList.toggle("open");
    duplicate.onclick=()=>{const n=prompt("Naam voor kopie",`${p.name} kopie`);if(!n)return;const e=duplicateStoredProject(p.id,n);showStatus(`✓ Kopie ${e.project.name} opgeslagen.`);renderProjectsList();};
    rename.onclick=()=>{const n=prompt("Nieuwe projectnaam",p.name);if(!n)return;const e=renameStoredProject(p.id,n);showStatus(`✓ Project hernoemd naar ${e.project.name}.`);renderProjectsList();};
    del.onclick=()=>{if(!confirm(`Project "${p.name}" verwijderen?`))return;const r=deleteStoredProject(p.id);renderProjectsList();showStatus(r.wasActive?"Project verwijderd. De geopende geometrie blijft als niet-opgeslagen kopie.":`Project ${p.name} verwijderd.`);};
    card.append(head,actions,panel);box.append(card);
  }
}
function syncProjectMeta(){
  if(el("projectQuickState"))el("projectQuickState").textContent=`${S.project.name||"Nieuw project"} · ${S.project.dirty?"gewijzigd":"opgeslagen"}`;
  if(el("menuMeta"))el("menuMeta").textContent=`${S.project.name||"Project"} · v${S.version}`;
  if(el("projectName")&&document.getElementById("page-project")?.classList.contains("active"))renderProjectPage();
  if(el("startupRecovery")){
    const info=recoveryInfo();el("startupRecovery").style.display=info?"block":"none";
    if(info)el("startupRecovery").textContent=`Herstelproject gevonden: ${info.name}. Start AR en open Project → Herstel.`;
  }
}

function renderCadPage(){
  const box=el("cadList"),st=cadStatus(),models=listCadModels();if(!box)return;box.innerHTML="";
  el("cadStatus").textContent=models.length?`${models.length} CAD-model(len) · ${st.loaded} geladen in AR${S.xrSession?"":" · AR tijdelijk gestopt"}`:`Nog geen CAD-model geladen.`;
  if(el("cadResumeArBtn"))el("cadResumeArBtn").style.display=!S.xrSession&&models.length?"block":"none";
  for(const m of models){
    const row=document.createElement("div");row.className="objectRow";
    const b=document.createElement("button");b.className="secondary";b.textContent=`${m.name} · ${(m.dimensions?.x||0).toFixed(2)} × ${(m.dimensions?.z||0).toFixed(2)} × ${(m.dimensions?.y||0).toFixed(2)} m${m.missingFile?" · bestand ontbreekt":""}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    b.onclick=()=>{selectCad(m.id);if(!S.xrSession){renderCadPage();showStatus("Hervat AR om dit CAD-model te plaatsen.");return;}beginCadPlacement(m.id);renderCadPage();returnToArView();el("hint").textContent=`${m.name}: richt op positie. Open ☰ → CAD om rotatie/hoogte te regelen en te bevestigen.`;};
    del.onclick=()=>{deleteCadModel(m.id);markDirtyAndRecover();renderCadPage();showStatus(`CAD ${m.name} verwijderd.`);};
    row.append(b,del);box.append(row);
  }
  const active=st.active;el("cadPlacementControls").style.display=S.xrSession&&active?"block":"none";
}
function analyzeLineMeasurement(l){
  const a=getPoint(l?.startId),b=getPoint(l?.endId);
  if(!a||!b)return {height:NaN,horizontal:NaN,vertical:false,signedHeight:NaN};
  const dx=b.position.x-a.position.x,dy=b.position.y-a.position.y,dz=b.position.z-a.position.z;
  const horizontal=Math.hypot(dx,dz),height=Math.abs(dy);
  return {height,horizontal,vertical:horizontal<=.025&&height>.001,signedHeight:dy};
}
function openLineEditor(l){
  if(!l)return;
  S.selectedLineId=l.id;
  const m=analyzeLineMeasurement(l),unit=l.unit||S.defaults.unit||"cm";
  const detail=m.vertical?` · hoogte ${fmtMeasureUnit(m.height,unit)}`:` · Δhoogte ${fmtMeasureUnit(m.height,unit)} · horizontaal ${fmtMeasureUnit(m.horizontal,unit)}`;
  el("lineInfo").textContent=`${l.name} · ${fmtLine(l)}${detail} · ${getPoint(l.startId)?.name||"?"} → ${getPoint(l.endId)?.name||"?"}`;
  el("editLineName").value=l.name;el("editLineColor").value=l.color||"#ffffff";
  el("editLineThickness").value=String(l.thickness||2);el("editLineLabels").checked=l.labelsVisible!==false;
  if(el("editLineVisible"))el("editLineVisible").checked=l.visible!==false;
  if(el("editLineUnit"))el("editLineUnit").value=l.unit||S.defaults.unit||"cm";
  if(el("editLineClearance"))el("editLineClearance").checked=Boolean(l.clearanceEnabled);
  if(el("editLineClearanceRequired"))el("editLineClearanceRequired").value=Number.isFinite(Number(l.clearanceRequiredM))?(Number(l.clearanceRequiredM)*100).toFixed(1):"";
  if(el("lineClearanceInfo")){
    if(l.clearanceEnabled&&Number.isFinite(Number(l.clearanceRequiredM))){const margin=l.distance-Number(l.clearanceRequiredM);el("lineClearanceInfo").textContent=`Vrije maat ${fmtMeasureUnit(l.distance,unit)} · vereist ${fmtMeasureUnit(Number(l.clearanceRequiredM),unit)} · ${margin>=0?`✓ marge ${fmtMeasureUnit(margin,unit)}`:`⚠ tekort ${fmtMeasureUnit(Math.abs(margin),unit)}`}`;}
    else el("lineClearanceInfo").textContent="Optioneel: gebruik deze afstand als vrije-ruimtecontrole.";
  }
  showPage("line");
}
function fmtMeasureUnit(m,unit){
  if(!Number.isFinite(m))return "—";
  if(unit==="mm")return `${(m*1000).toFixed(0)} mm`;
  if(unit==="cm")return `${(m*100).toFixed(1)} cm`;
  return `${m.toFixed(m<10?3:2)} m`;
}
function openPolylineEditor(c){
  const a=analyzePolyline(c);S.selectedContourId=c.id;
  el("polylineInfo").textContent=`${c.name} · ${a.pointCount} punten · totaal ${fmtMeasureUnit(a.totalLength,c.unit||"cm")}`;
  el("editPolylineName").value=c.name;el("editPolylineUnit").value=c.unit||S.defaults.unit||"cm";
  el("polylineSegments").innerHTML=`<strong>Segmenten</strong><br>${a.segments.map((x,i)=>`${i+1}. ${getPoint(x.startId)?.name||"?"}→${getPoint(x.endId)?.name||"?"}: ${fmtMeasureUnit(x.distance,c.unit||"cm")}`).join("<br>")}`;
  el("polylineAngles").innerHTML=a.angles.length?`<strong>Hoeken</strong><br>${a.angles.map(x=>`${x.pointName}: ${x.degrees.toFixed(1)}°`).join("<br>")}`:"<strong>Hoeken</strong><br>Minstens 3 punten nodig.";
  showPage("polyline");
}

function fmtClearanceUnit(m,unit="cm"){return unit==="mm"?`${(m*1000).toFixed(0)} mm`:unit==="m"?`${m.toFixed(m<10?3:2)} m`:`${(m*100).toFixed(1)} cm`;}
function fillClearanceSelect(select,targets,value){if(!select)return;select.innerHTML="";for(const t of targets){const o=document.createElement("option");o.value=t.ref;o.textContent=t.label;select.append(o);}if(value&&targets.some(t=>t.ref===value))select.value=value;}
function renderClearanceResult(c=null){
  const box=el("clearanceResult");if(!box)return;
  const aRef=el("clearanceObjectA")?.value,bRef=el("clearanceObjectB")?.value,unit=el("clearanceUnit")?.value||c?.unit||"cm";
  const rawReq=Number(el("clearanceRequired")?.value);const required=Number.isFinite(rawReq)?(unit==="mm"?rawReq/1000:unit==="m"?rawReq:rawReq/100):Number(c?.requiredM)||0;
  try{const a=analyzeClearance(aRef,bRef);const margin=a.gap-required;
    if(a.collision)box.textContent=`⚠ COLLISION · begrenzingen overlappen ca. ${fmtClearanceUnit(a.penetration,unit)} op de kleinste overlap-as.`;
    else if(a.touching)box.textContent=`⚠ Objecten raken elkaar · vrije ruimte 0 ${unit}.`;
    else box.textContent=`Vrije ruimte ${fmtClearanceUnit(a.gap,unit)} · vereist ${fmtClearanceUnit(required,unit)} · ${margin>=0?`✓ marge ${fmtClearanceUnit(margin,unit)}`:`⚠ tekort ${fmtClearanceUnit(Math.abs(margin),unit)}`} · ΔX ${fmtClearanceUnit(a.separation.x,unit)} · ΔY ${fmtClearanceUnit(a.separation.y,unit)} · ΔZ ${fmtClearanceUnit(a.separation.z,unit)}`;
  }catch(err){box.textContent=err.message||String(err);}
}
function renderClearancePage(c=null){
  const targets=listClearanceTargets(),selected=c||getClearance(S.selectedClearanceId),list=el("clearanceSavedList");
  if(list){list.innerHTML="";for(const x of S.clearances){const row=document.createElement("div");row.className="objectRow measurementRow";const b=document.createElement("button");b.className="secondary";try{const st=clearanceStatus(x);b.textContent=`${x.name} · ${st.collision?"⚠ collision":st.passes?"✓ voldoende":"⚠ te klein"} · ${fmtClearanceUnit(st.gap,x.unit)}`;}catch{b.textContent=`${x.name} · object niet beschikbaar`;}b.onclick=()=>{S.selectedClearanceId=x.id;renderClearancePage(x);};const d=document.createElement("button");d.className="danger";d.textContent="Wis";d.onclick=()=>{runHistoryAction(`Vrije ruimte ${x.name} verwijderen`,()=>deleteClearance(x.id));afterProjectChange(`${x.name} verwijderd.`);renderClearancePage();renderMeasurements();};row.append(b,d);list.append(row);}}
  fillClearanceSelect(el("clearanceObjectA"),targets,selected?.aRef);fillClearanceSelect(el("clearanceObjectB"),targets,selected?.bRef);
  if(!selected&&targets.length>1){el("clearanceObjectA").selectedIndex=0;el("clearanceObjectB").selectedIndex=1;}
  if(el("clearanceName"))el("clearanceName").value=selected?.name||`Vrije ruimte ${S.clearances.length+1}`;
  if(el("clearanceUnit"))el("clearanceUnit").value=selected?.unit||S.defaults.unit||"cm";
  if(el("clearanceRequired")){const u=el("clearanceUnit").value,m=Number(selected?.requiredM)||0;el("clearanceRequired").value=u==="mm"?(m*1000).toFixed(0):u==="m"?m.toFixed(3):(m*100).toFixed(1);}
  const no=el("clearanceNoTargets");if(no){no.style.display=targets.length<2?"block":"none";no.textContent=targets.length<2?"Minstens twee ruimtelijke objecten nodig (muur, vorm, AI-object of geplaatst CAD-model).":"";}
  ["clearanceAnalyzeBtn","clearanceSaveBtn"].forEach(id=>{if(el(id))el(id).disabled=targets.length<2;});renderClearanceResult(selected);
}

function renderMeasurements(){
  const box=el("measurementsList"),summary=el("measurementsSummary");if(!box)return;box.innerHTML="";
  const lines=S.lines.filter(l=>l.ownerType!=="wallbase"&&l.ownerType!=="polyline");
  const polylines=S.contours.filter(c=>c.kind==="polyline"&&!c.closed);
  const polyAnalyses=polylines.map(c=>({c,a:analyzePolyline(c)}));
  const areas=S.shapes.filter(s=>Number.isFinite(s.area));
  const clearanceChecks=S.clearances||[];
  const total=lines.reduce((n,l)=>n+(Number.isFinite(l.distance)?l.distance:0),0)+polyAnalyses.reduce((n,x)=>n+x.a.totalLength,0);
  const count=lines.length+polylines.length+areas.length+clearanceChecks.length;
  if(summary)summary.textContent=count?`${count} meetobject(en) · lijnlengte ${fmt(total)}${areas.length?` · ${areas.length} oppervlakte(n)`:""}${clearanceChecks.length?` · ${clearanceChecks.length} vrije-ruimtecontrole(s)`:""}`:"Nog geen metingen.";
  if(!count){box.innerHTML='<div class="help">Maak eerst een lijn, doorlopende lijn, gesloten vorm of vrije-ruimtecontrole.</div>';return;}
  for(const c of clearanceChecks){
    const row=document.createElement("div");row.className="objectRow measurementRow";const open=document.createElement("button");open.className="secondary";
    try{const st=clearanceStatus(c);open.textContent=`${c.name} · ${st.collision?"⚠ collision":st.passes?"✓ voldoende":"⚠ te klein"} · ${fmtClearanceUnit(st.gap,c.unit)}`;}catch{open.textContent=`${c.name} · object niet beschikbaar`;}
    open.onclick=()=>{S.selectedClearanceId=c.id;showPage("clearance");};row.append(open);box.append(row);
  }
  for(const sh of areas){
    const row=document.createElement("div");row.className="objectRow measurementRow";
    const open=document.createElement("button");open.className="secondary";{const vol=sh.volumeEnabled&&Number.isFinite(Number(sh.volumeHeightM))?sh.area*Number(sh.volumeHeightM):null;open.textContent=`${sh.name} · ${fmtAreaUnit(sh.area,"m")} · omtrek ${fmtMeasureUnit(sh.perimeter,"m")}${Number.isFinite(vol)?` · volume ${fmtVolumeUnit(vol,"m")}`:""}`;}open.onclick=()=>openShape(sh.id);
    row.append(open);box.append(row);
  }
  for(const {c,a} of polyAnalyses){
    const row=document.createElement("div");row.className="objectRow measurementRow";
    const open=document.createElement("button");open.className="secondary";open.textContent=`${c.name} · totaal ${fmtMeasureUnit(a.totalLength,c.unit||"cm")} · ${a.angles.length} hoek(en)`;open.onclick=()=>openPolylineEditor(c);
    row.append(open);box.append(row);
  }
  for(const l of lines){
    const a=getPoint(l.startId),b=getPoint(l.endId),row=document.createElement("div");row.className="objectRow measurementRow";
    const open=document.createElement("button");open.className="secondary";const m=analyzeLineMeasurement(l);
    const clearance=l.clearanceEnabled&&Number.isFinite(Number(l.clearanceRequiredM))?` · clearance ${l.distance>=Number(l.clearanceRequiredM)?"✓":"⚠"}`:"";
    open.textContent=(m.vertical?`${l.name} · hoogte ${fmtMeasureUnit(m.height,l.unit||"cm")} · ${a?.name||"?"}→${b?.name||"?"}`:`${l.name} · ${fmtLine(l)} · ΔH ${fmtMeasureUnit(m.height,l.unit||"cm")} · ${a?.name||"?"}→${b?.name||"?"}`)+clearance;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openLineEditor(l);
    del.onclick=()=>{const d=lineDependencies(l.id);if(d.walls.length||d.shapes.length||d.contours.length){showStatus("Deze meting is gekoppeld aan een muur, vorm of contour.",true);return;}runHistoryAction(`Meting ${l.name} verwijderen`,()=>deleteLineRaw(l.id));afterProjectChange(`Meting ${l.name} verwijderd.`);renderMeasurements();};
    row.append(open,del);box.append(row);
  }
}
function renderObjects(){
  const box=el("objectsList");box.innerHTML="";
  if(!S.walls.length&&!S.shapes.length&&!S.lines.length&&!S.points.length&&!S.aiObjects.length){box.innerHTML='<div class="help">Nog geen objecten.</div>';return;}
  if(S.walls.length){box.insertAdjacentHTML("beforeend","<h3>Muren</h3>");for(const w of S.walls){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${w.name} · ${w.height.toFixed(2)} m`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openWall(w.id);del.onclick=()=>{runHistoryAction(`Muur ${w.name} verwijderen`,()=>deleteWall(w.id));afterProjectChange(`Muur ${w.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.openings.length){box.insertAdjacentHTML("beforeend","<h3>Openingen</h3>");for(const o of S.openings){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${o.name} · ${o.width.toFixed(2)} × ${o.height.toFixed(2)} m`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openOpening(o.id);del.onclick=()=>{runHistoryAction(`${o.name} verwijderen`,()=>deleteOpening(o.id));afterProjectChange(`${o.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.aiObjects.length){box.insertAdjacentHTML("beforeend","<h3>AI-concepten · prototype</h3>");for(const o of S.aiObjects){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${o.name} · ${(o.height*100).toFixed(0)} cm${o.locked?" · 🔒":""}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>{S.selectedAiObjectId=o.id;S.selectedShapeId=o.sourceShapeId;openAiBuilder();};del.onclick=()=>{runHistoryAction(`AI-concept ${o.name} verwijderen`,()=>deleteAiObject(o.id));afterProjectChange(`${o.name} verwijderd.`);renderObjects();};row.append(open,del);box.append(row);
  }}
  if(S.shapes.length){box.insertAdjacentHTML("beforeend","<h3>Vormen</h3>");for(const s of S.shapes){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${s.name} · ${s.area.toFixed(2)} m²`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openShape(s.id);del.onclick=()=>{runHistoryAction(`Vorm ${s.name} verwijderen`,()=>{const ai=getAiObjectForShape(s.id);if(ai)deleteAiObject(ai.id);deleteShapeOnly(s.id);});afterProjectChange(`Vorm ${s.name} verwijderd; contour bewaard.`);};row.append(open,del);box.append(row);
  }}
  if(S.lines.length){box.insertAdjacentHTML("beforeend","<h3>Lijnen</h3>");for(const l of S.lines){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${l.name} · ${fmtLine(l)}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openLineEditor(l);
    del.onclick=()=>{const d=lineDependencies(l.id);if(d.walls.length||d.shapes.length||d.contours.length){showStatus("Deze lijn is gekoppeld aan een muur, vorm of contour.",true);return;}runHistoryAction(`Lijn ${l.name} verwijderen`,()=>deleteLineRaw(l.id));afterProjectChange(`Lijn ${l.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.points.length){box.insertAdjacentHTML("beforeend","<h3>Punten</h3>");for(const p of S.points){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`Punt ${p.name}`;const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    open.onclick=()=>{S.selectedPointId=p.id;el("pointInfo").textContent=`Punt ${p.name}`;el("editPointName").value=p.name;showPage("point");};
    del.onclick=()=>{const d=pointDependencies(p.id);if(d.walls.length||d.shapes.length||d.contours.length||d.references?.length){showStatus(d.references?.length?"Dit punt is een projectreferentie. Verwijder eerst de referentie.":"Dit punt hoort bij een muur, vorm of contour.",true);return;}runHistoryAction(`Punt ${p.name} verwijderen`,()=>{for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(p.id);});afterProjectChange(`Punt ${p.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
}
function openShape(id){
  const s=getShape(id);if(!s)return;S.selectedShapeId=id;
  const vol=s.volumeEnabled&&Number.isFinite(Number(s.volumeHeightM))?s.area*Number(s.volumeHeightM):null;
  el("shapeInfo").textContent=`${s.name} · ${s.area.toFixed(2)} m² · omtrek ${s.perimeter.toFixed(2)} m${Number.isFinite(vol)?` · volume ${fmtVolumeUnit(vol,"m")}`:""}`;
  el("editShapeName").value=s.name;el("editShapeFill").value=s.fill;el("editShapeBorder").value=s.border;el("editShapeOpacity").value=s.opacity;el("editShapeThickness").value=String(s.thickness);el("editShapeLabels").checked=s.labels;
  if(el("editShapeVolume"))el("editShapeVolume").checked=Boolean(s.volumeEnabled);
  if(el("editShapeVolumeHeight"))el("editShapeVolumeHeight").value=Number.isFinite(Number(s.volumeHeightM))?(Number(s.volumeHeightM)).toFixed(3):"";
  if(el("shapeVolumeInfo"))el("shapeVolumeInfo").textContent=Number.isFinite(vol)?`Volume = ${s.area.toFixed(3)} m² × ${Number(s.volumeHeightM).toFixed(3)} m = ${fmtVolumeUnit(vol,"m")}`:"Optioneel: geef een hoogte/diepte op om volume uit deze footprint te berekenen.";
  showPage("shape");
}
function renderAiBuilder(){
  const shape=getShape(S.selectedShapeId),obj=shape?getAiObjectForShape(shape.id):getAiObject(S.selectedAiObjectId);
  if(!shape){el("aiBuilderContext").textContent="Selecteer eerst een vorm via Objecten.";el("aiBuilderStatus").textContent="Geen bronvorm geselecteerd.";el("aiRunBtn").disabled=true;return;}
  S.selectedShapeId=shape.id;S.selectedAiObjectId=obj?.id||null;el("aiRunBtn").disabled=false;
  el("aiBuilderContext").textContent=`Bronvorm: ${shape.name} · ${shape.area.toFixed(2)} m². Prototype gebruikt de exacte contour als footprint.`;
  el("aiBuilderStatus").textContent=aiObjectSummary(obj);el("aiLockBtn").style.display=obj?"block":"none";el("aiDeleteBtn").style.display=obj?"block":"none";el("aiLockBtn").textContent=obj?.locked?"Ontgrendel concept":"🔒 Concept vastzetten";
  if(obj&&!el("aiPrompt").value.trim())el("aiPrompt").value=`Maak hem ${(obj.height*100).toFixed(0)} cm hoog`;
}
function openAiBuilder(){showPage("aibuilder");renderAiBuilder();}

export function initUI(){
  initThemeSelector();
  initProfessionalColorPickers();
  bind("menuBtn","click",()=>{
    if(S.referenceCaptureId){cancelReferenceCapture();showStatus("Referentie aanwijzen geannuleerd.");}
    el("menuPanel").classList.contains("open")?closeMenu():openMenu();
  });bind("menuCloseBtn","click",closeMenu);bind("menuBackBtn","click",menuBack);
  bind("globalUndoBtn","click",()=>{const e=undoHistory();afterProjectChange(`Ongedaan: ${e.label}`);});
  bind("globalRedoBtn","click",()=>{const e=redoHistory();afterProjectChange(`Opnieuw: ${e.label}`);});
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
  document.querySelectorAll("[data-ai-example]").forEach(b=>b.addEventListener("click",()=>{el("aiPrompt").value=b.dataset.aiExample||"";}));

  bind("saveProjectBtn","click",()=>{
    const e=saveCurrentProject(el("projectName").value,false);renderProjectPage();showStatus(`✓ Project ${e.project.name} opgeslagen.`);closeMenu();
  });
  bind("saveProjectAsBtn","click",()=>{
    const e=saveCurrentProject(el("projectName").value,true);renderProjectPage();showStatus(`✓ Nieuw project ${e.project.name} opgeslagen.`);closeMenu();
  });
  bind("newProjectBtn","click",()=>{
    const name=el("projectName").value||"Nieuw project";
    if((S.points.length||S.lines.length||S.walls.length||S.shapes.length)&&!confirm("Huidige scène leegmaken en een nieuw project starten? Niet-opgeslagen werk kan verloren gaan."))return;
    // Ontkoppel World Lock eerst zonder XR-anchors te verwijderen; projectbeheer mag de AR-sessie niet beëindigen.
    detachAllPointAnchors();
    newProject(name);afterProjectChange(`Nieuw project ${S.project.name} gestart.`);renderProjectPage();returnToArView();
  });
  bind("projectListBtn","click",()=>showPage("projects"));
  
  bind("captureGeoBtn","click",async()=>{
    const h=await captureHybridBaseline();markProjectDirtyFromReference();renderProjectPage();
    showStatus(`Hybride locatie opgeslagen · GPS ±${Number.isFinite(h.geo.accuracy)?h.geo.accuracy.toFixed(1):"?"} m${Number.isFinite(h.heading)?` · richting ${h.heading.toFixed(0)}°`:" · richting niet beschikbaar"}.`);
  });
  bind("hybridCheckBtn","click",async()=>{
    const a=await assessHybridLocation();renderRelocalizePage();
    showStatus(`Locatiecheck: ${a.quality} · ${a.distance.toFixed(1)} m van opgeslagen positie.`);
  });
  bind("referenceManagerBtn","click",()=>showPage("references"));
  bind("projectLocationBtn","click",()=>{showPage("relocalize");renderRelocalizePage();});
  bind("addReferenceBtn","click",()=>{
    const pid=el("referencePointSelect").value;if(!pid)throw new Error("Geen punt beschikbaar.");
    addProjectReference(pid,el("referenceName").value,el("referenceDescription").value);
    markProjectDirtyFromReference();renderReferenceManager();showStatus("Projectreferentie toegevoegd.");
  });
  bind("relocalizeMode","change",()=>renderRelocalizePage());
  bind("startRelocalizeBtn","click",()=>{
    beginRelocalization(el("relocalizeMode").value);renderRelocalizePage();showStatus("Positieherstel gestart. Wijs dezelfde fysieke referentiepunten opnieuw aan.");
  });
  let lastRelocalizationResult=null;
  bind("solveRelocalizeBtn","click",()=>{
    lastRelocalizationResult=solveRelocalization();
    el("relocalizeQuality").textContent=`${lastRelocalizationResult.count} punt(en) · ${lastRelocalizationResult.quality} · gemiddelde ${(lastRelocalizationResult.mean*100).toFixed(1)} cm · max ${(lastRelocalizationResult.max*100).toFixed(1)} cm`;
  });
  bind("applyRelocalizeBtn","click",()=>{
    if(!lastRelocalizationResult)throw new Error("Bereken eerst de uitlijning.");
    const r=applyRelocalization(lastRelocalizationResult);lastRelocalizationResult=null;
    markProjectDirtyFromReference();afterProjectChange(`Project uitgelijnd · ${r.quality} · max ${(r.max*100).toFixed(1)} cm.`);
    closeMenu();
  });
  bind("cancelRelocalizeBtn","click",()=>{cancelRelocalization();showPage("project");});

  bind("exportProjectBtn","click",()=>{exportCurrentProject();showStatus("Projectbestand geëxporteerd.");});
  bind("importProjectBtn","click",()=>el("importProjectFile").click());
  bind("importProjectFile","change",async()=>{
    const file=el("importProjectFile").files?.[0];if(!file)return;
    await importProjectFile(file);el("importProjectFile").value="";afterProjectChange(`✓ Project ${S.project.name} geïmporteerd.`);renderProjectPage();closeMenu();
  });
  bind("cadImportBtn","click",async()=>{
    // v0.8.28.5: native file picker draait in een volledig apart document.
    // Eerst actuele projectstate naar recovery schrijven; daarna XR netjes stoppen en navigeren.
    try{
      markDirtyAndRecover();
      showStatus("CAD-importpagina wordt geopend…");
      await suspendARForCadImport();
      location.assign("./cad-import.html");
    }catch(e){console.error(e);showStatus(`CAD-import kon niet starten: ${e.message||e}`,true);}
  });
  bind("cadRotateLeftBtn","click",()=>{rotateCad(-5);markDirtyAndRecover();renderCadPage();});
  bind("cadRotateRightBtn","click",()=>{rotateCad(5);markDirtyAndRecover();renderCadPage();});
  bind("cadDownBtn","click",()=>{moveCadHeight(-0.01);markDirtyAndRecover();renderCadPage();});
  bind("cadUpBtn","click",()=>{moveCadHeight(0.01);markDirtyAndRecover();renderCadPage();});
  bind("cadConfirmBtn","click",()=>{const m=confirmCadPlacement();S.externalPicker=null;S.cadPickerLifecycle={active:false,returned:false};sessionStorage.removeItem("measurear.cadPickerActive");markDirtyAndRecover();renderCadPage();closeMenu();showStatus(`CAD ${m.name} geplaatst.`);});
  bind("cadCancelBtn","click",()=>{cancelCadPlacement();S.externalPicker=null;S.cadPickerLifecycle={active:false,returned:false};sessionStorage.removeItem("measurear.cadPickerActive");renderCadPage();showStatus("CAD-plaatsing geannuleerd.");});
  bind("restoreRecoveryBtn","click",()=>{restoreRecovery();afterProjectChange(`✓ Herstelproject ${S.project.name} geopend.`);renderProjectPage();closeMenu();});
  bind("discardRecoveryBtn","click",()=>{clearRecovery();renderProjectPage();syncProjectMeta();showStatus("Hersteldata verwijderd.");});


  bind("quickLineBtn","click",()=>begin("line"));bind("quickPolylineBtn","click",()=>begin("polyline"));bind("quickShapeBtn","click",()=>begin("shape"));bind("quickStakeBtn","click",()=>begin("stake"));
  bind("quickWallBtn","click",()=>{
    el("wallToolPrefix").value=S.wallTool.namePrefix;el("wallToolHeight").value=S.wallTool.height;el("wallToolThickness").value=S.wallTool.thickness;
    el("wallToolSide").value=S.wallTool.side;el("wallToolOrientation").value=S.wallTool.orientation;el("wallToolAngle").value=S.wallTool.angle;
    el("wallToolAngleWrap").style.display=S.wallTool.orientation==="angle"?"block":"none";el("wallToolColor").value=S.wallTool.color;el("wallToolOpacity").value=S.wallTool.opacity;
    showPage("walltool");
  });
  bind("wallToolOrientation","change",()=>{el("wallToolAngleWrap").style.display=el("wallToolOrientation").value==="angle"?"block":"none";});
  bind("startWallToolBtn","click",()=>{
    const height=Number(el("wallToolHeight").value),thickness=Number(el("wallToolThickness").value),opacity=Number(el("wallToolOpacity").value);
    if(!Number.isFinite(height)||height<=0)throw new Error("Geef een geldige muurhoogte.");
    if(!Number.isFinite(thickness)||thickness<=0)throw new Error("Geef een geldige muurdikte.");
    if(!Number.isFinite(opacity)||opacity<=0||opacity>1)throw new Error("Geef een geldige transparantie.");
    Object.assign(S.wallTool,{namePrefix:el("wallToolPrefix").value.trim()||"Muur",height,thickness,side:el("wallToolSide").value,orientation:el("wallToolOrientation").value,angle:Number(el("wallToolAngle").value)||90,color:el("wallToolColor").value,opacity});
    begin("wall");
    showStatus(`Muurmodus: ${height.toFixed(2)} m hoog · ${(thickness*100).toFixed(0)} cm dik.`);
  });


  bind("hudToolBtn","click",openMenu);bind("constraintHudBtn","click",()=>togglePopover("directionPopover"));bind("distanceHudBtn","click",()=>togglePopover("distancePopover"));bind("hudMoreBtn","click",()=>togglePopover("morePopover"));
  document.querySelectorAll("[data-hud-direction]").forEach(b=>b.addEventListener("click",()=>{
    setConstraint(b.dataset.hudDirection);
    syncHud();
    if(!referenceRequired() && S.tool.constraint!=="angle") closePopovers();
  }));
  document.querySelectorAll("[data-axis-direction]").forEach(b=>b.addEventListener("click",()=>{setAxisDirection(b.dataset.axisDirection);syncHud();showStatus(`Asrichting ${b.textContent.trim()} vergrendeld.`);}));
  document.querySelectorAll("[data-perpendicular-mode]").forEach(b=>b.addEventListener("click",()=>{
    setPerpendicularMode(b.dataset.perpendicularMode);syncHud();
    showStatus(S.tool.perpendicularMode==="vertical"?"Loodrecht 90° · verticaal actief. Kies omhoog/omlaag.":"Loodrecht 90° · horizontaal actief. Kies links/rechts.");
  }));
  bind("hudConstraintDoneBtn","click",()=>{
    if(referenceRequired()&&!S.tool.referenceLineId)throw new Error("Kies eerst een referentielijn.");
    closePopovers();syncHud();
    showStatus(S.tool.constraint==="perpendicular"?"Richt nabij de referentielijn om het vertrekpunt te kiezen, of teken verder vanaf het actieve punt.":`Eigen hoek ${S.tool.angleDeg}° actief. Richt en bevestig het volgende punt.`);
  });
  bind("hudReference","change",()=>{
    setReferenceLine(el("hudReference").value||null);
    syncHud();
    if(S.tool.referenceLineId && S.tool.constraint!=="angle") closePopovers();
  });
  bind("hudAngle","input",()=>{setAngle(el("hudAngle").value);syncHud();});
  bind("hudSideBtn","click",()=>{flipSide();showStatus(`Zijde omgekeerd (${S.tool.side>0?"links/positief":"rechts/negatief"}).`);syncHud();});
  bind("hudSideChip","click",()=>{flipSide();syncHud();showStatus((S.tool.constraint==="vertical"||(S.tool.constraint==="perpendicular"&&S.tool.perpendicularMode==="vertical"))?`Verticale richting: ${S.tool.side>0?"omhoog":"omlaag"}.`:S.tool.constraint==="parallel"?`Parallelrichting ${S.tool.side>0?"voor":"tegen"} referentie.`:`Zijde ${S.tool.side>0?"links":"rechts"}.`);});
  bind("hudLastReferenceBtn","click",()=>{
    const l=S.lines.at(-1);if(!l)throw new Error("Er bestaat nog geen lijn om als referentie te gebruiken.");
    setReferenceLine(l.id);syncHud();
    if(S.tool.constraint!=="angle")closePopovers();
    showStatus(`Referentielijn ${l.name} actief.`);
  });
  bind("hudAutoBtn","click",()=>{setPlacement("manual");closePopovers();syncHud();showStatus("AUTO actief: camera bepaalt het volgende punt.");});
  bind("hudUseDistanceBtn","click",()=>{setDistance(el("hudDistance").value,el("hudUnit").value);setPlacement("metric");closePopovers();syncHud();showStatus("Exacte afstand ingesteld. Bevestig met de witte ronde knop.");});
  bind("hudSnapChip","click",()=>{
    if(S.tool.snapMode==="off"){setSnapMode(S.hud.previousSnapMode||"smart");el("hudSnap").value=S.tool.snapMode;showStatus("Snappen ingeschakeld.");}
    else{S.hud.previousSnapMode=S.tool.snapMode;setSnapMode("off");el("hudSnap").value="off";showStatus("Snappen tijdelijk uitgeschakeld.");}
    syncHud();
  });
  bind("hudSnap","change",()=>{
    setSnapMode(el("hudSnap").value);
    const labels={
      smart:"Smart: punt → middenpunt → lijn.",
      points:"Alleen bestaande punten.",
      midpoints:"Alleen middelpunten van lijnen.",
      lines:"Alleen dichtstbijzijnde positie op lijnen.",
      off:"Snapping uit."
    };
    el("hudSnapHelp").textContent=labels[S.tool.snapMode]||"";
    syncHud();
  });
  bind("hudDensity","change",()=>{
    S.hud.compact=el("hudDensity").value!=="detailed";
    syncHud();
  });
  bind("hudUndoBtn","click",()=>{const e=undoHistory();afterProjectChange(`Ongedaan: ${e.label}`);});
  bind("hudRedoBtn","click",()=>{const e=redoHistory();afterProjectChange(`Opnieuw: ${e.label}`);});
  bind("hudFinishBtn","click",()=>{
    const result=finishTool();syncHud();syncHistoryControls();
    if(result.type==="polyline"){const a=analyzePolyline(result.contour);el("hint").textContent=`Doorlopende meting voltooid · totaal ${fmtMeasureUnit(a.totalLength,result.contour.unit||"cm")} · ${a.angles.length} hoek(en).`;}if(result.type==="wall"){el("hint").textContent="Muurpad voltooid. Alle muursegmenten blijven gekoppeld aan hun basislijnen.";}
    if(result.type==="shape"){
      const a=analyzeContour(result.contour);
      let nr=1,name=`Vorm ${nr}`;while(S.shapes.some(s=>s.name===name)){nr++;name=`Vorm ${nr}`;}
      const shape=runHistoryAction("Vorm sluiten en opvullen",()=>createShape(result.contour,{name,fill:el("shapeFill").value||"#4caf50",opacity:el("shapeOpacity").value||.30,border:el("shapeBorder").value||"#ffffff",thickness:el("shapeThickness").value||2,labels:el("shapeLabels").checked}));
      S.pendingContourId=null;cancelTool();syncHud();syncHistoryControls();afterProjectChange(`Vorm ${shape.name} gesloten en opgevuld · ${a.area.toFixed(2)} m².`);
    }
  });
  bind("hudCancelBtn","click",()=>{runHistoryAction("Tekenfunctie stoppen",()=>cancelTool());syncHud();syncHistoryControls();showStatus("Tekenfunctie gestopt. Bevestigde geometrie blijft bestaan.");});

  bind("captureBtn","click",()=>{
    if(S.referenceCaptureId){
      const ref=S.project.relocalization.references.find(x=>x.id===S.referenceCaptureId);
      if(!ref)throw new Error("Referentiepunt niet gevonden.");
      if(!S.currentTarget)throw new Error("Nog geen geldig oppervlak onder het vizier.");
      captureRelocalizationPoint(ref.id,S.currentRawTarget||S.currentTarget);S.referenceCaptureId=null;
      openMenu();showPage("relocalize",false);renderRelocalizePage();showStatus(`${ref.name} opnieuw aangewezen.`);return;
    }
    closePopovers();const r=confirmCandidate();syncHud();
    if(r.type==="point"){el("distance").textContent="—";el("detail").textContent=`Punt ${r.point.name} vastgezet`;el("hint").textContent=`${r.point.name} is vertrekpunt. Stel zo nodig afstand/richting in en bevestig het volgende punt.`;}
    else{el("distance").textContent=fmt(r.line.distance);el("detail").textContent=r.wall?`${r.wall.name} · ${fmt(r.line.distance)}`:`${r.line.name} · ${fmt(r.line.distance)}`;el("hint").textContent=r.wall?`${r.wall.name} geplaatst. ${r.point.name} is nu vertrekpunt voor het volgende muursegment.`:(r.complete?`Lijn voltooid. Bekijk het resultaat en open ☰ voor de volgende functie.`:`${r.point.name} is nu het actieve vertrekpunt.`);}
    verifyState();syncHistoryControls();
  });

  bind("savePolylineBtn","click",()=>{
    const c=getContour(S.selectedContourId);if(!c)throw new Error("Geen doorlopende meting geselecteerd.");
    runHistoryAction(`Doorlopende meting ${c.name} bewerken`,()=>updatePolyline(c,{name:el("editPolylineName").value,unit:el("editPolylineUnit").value}));
    afterProjectChange(`Doorlopende meting ${c.name} opgeslagen.`);openPolylineEditor(c);
  });

  
  bind("clearanceAnalyzeBtn","click",()=>renderClearanceResult(getClearance(S.selectedClearanceId)));
  ["clearanceObjectA","clearanceObjectB","clearanceRequired","clearanceUnit"].forEach(id=>bind(id,"change",()=>renderClearanceResult(getClearance(S.selectedClearanceId))));
  bind("clearanceNewBtn","click",()=>{S.selectedClearanceId=null;renderClearancePage();});
  bind("clearanceSaveBtn","click",()=>{
    const unit=el("clearanceUnit").value,raw=Number(el("clearanceRequired").value),requiredM=unit==="mm"?raw/1000:unit==="m"?raw:raw/100;
    if(!Number.isFinite(requiredM)||requiredM<0)throw new Error("Geef een geldige minimale vrije ruimte.");
    let c=getClearance(S.selectedClearanceId);
    if(c)runHistoryAction(`Vrije ruimte ${c.name} bewerken`,()=>updateClearance(c,{name:el("clearanceName").value,aRef:el("clearanceObjectA").value,bRef:el("clearanceObjectB").value,requiredM,unit}));
    else c=runHistoryAction("Vrije-ruimtecontrole aanmaken",()=>createClearance({name:el("clearanceName").value,aRef:el("clearanceObjectA").value,bRef:el("clearanceObjectB").value,requiredM,unit}));
    S.selectedClearanceId=c.id;afterProjectChange(`${c.name} opgeslagen.`);renderClearancePage(c);renderMeasurements();
  });

bind("saveLineBtn","click",()=>{
    const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");
    const clearanceEnabled=Boolean(el("editLineClearance")?.checked);const reqCm=Number(el("editLineClearanceRequired")?.value);
    if(clearanceEnabled&&(!Number.isFinite(reqCm)||reqCm<0))throw new Error("Geef een geldige vereiste vrije maat in cm.");
    runHistoryAction(`Lijn ${l.name} bewerken`,()=>updateLine(l,{name:el("editLineName").value,color:el("editLineColor").value,thickness:el("editLineThickness").value,labels:el("editLineLabels").checked,visible:el("editLineVisible").checked,unit:el("editLineUnit").value,clearanceEnabled,clearanceRequiredM:clearanceEnabled?reqCm/100:null}));
    afterProjectChange(`Lijn ${l.name} opgeslagen.`);el("lineInfo").textContent=`${l.name} · ${fmtLine(l)}`;
  });
  bind("savePointBtn","click",()=>{
    const p=getPoint(S.selectedPointId);if(!p)throw new Error("Geen punt geselecteerd.");
    const old=p.name;runHistoryAction(`Punt ${old} hernoemen`,()=>renamePoint(p,el("editPointName").value));
    afterProjectChange(`Punt ${p.name} opgeslagen.`);el("pointInfo").textContent=`Punt ${p.name}`;
  });
  
  bind("addDoorBtn","click",()=>beginOpening("door"));
  bind("addWindowBtn","click",()=>beginOpening("window"));
  bind("addOpeningBtn","click",()=>beginOpening("free"));
  bind("confirmOpeningBtn","click",()=>{
    const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");
    try{
      const o=runHistoryAction("Opening aanmaken",()=>createOpening(w,{type:el("openingType").value,name:el("openingName").value,x:el("openingX").value,width:el("openingWidth").value,height:el("openingHeight").value,bottom:el("openingBottom").value}));
      el("openingError").style.display="none";afterProjectChange(`${o.name} aangemaakt.`);openWall(w.id);
    }catch(err){el("openingError").style.display="block";el("openingError").textContent=err.message||String(err);throw err;}
  });
  bind("cancelOpeningBtn","click",()=>openWall(S.selectedWallId));
  bind("saveOpeningBtn","click",()=>{
    const o=getOpening(S.selectedOpeningId);if(!o)throw new Error("Geen opening geselecteerd.");
    runHistoryAction(`${o.name} bewerken`,()=>updateOpening(o,{type:el("editOpeningType").value,name:el("editOpeningName").value,x:el("editOpeningX").value,width:el("editOpeningWidth").value,height:el("editOpeningHeight").value,bottom:el("editOpeningBottom").value}));
    afterProjectChange(`${o.name} opgeslagen.`);openOpening(o.id);
  });
  bind("deleteOpeningBtn","click",()=>{
    const o=getOpening(S.selectedOpeningId);if(!o)throw new Error("Geen opening geselecteerd.");const wallId=o.wallId,name=o.name;
    runHistoryAction(`${name} verwijderen`,()=>deleteOpening(o.id));afterProjectChange(`${name} verwijderd.`);openWall(wallId);
  });
bind("saveWallBtn","click",()=>{
    const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");
    runHistoryAction(`Muur ${w.name} bewerken`,()=>{
      const newHeight=Number(el("editWallHeight").value);
      for(const o of openingsForWall(w.id))if(o.bottom+o.height>newHeight+.0005)throw new Error(`Nieuwe muurhoogte is te laag voor ${o.name}.`);
      return updateWall(w,{name:el("editWallName").value,height:newHeight,thickness:el("editWallThickness").value,side:el("editWallSide").value,orientation:el("editWallOrientation").value,angle:el("editWallAngle").value,color:el("editWallColor").value,opacity:el("editWallOpacity").value});
    });
    afterProjectChange(`Muur ${w.name} opgeslagen.`);el("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;
  });
  bind("editWallOrientation","change",()=>{el("editWallAngleWrap").style.display=el("editWallOrientation").value==="angle"?"block":"none";});
  bind("lineFromStartBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");begin("line",l.startId);});
  bind("lineFromEndBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");begin("line",l.endId);});
  bind("useReferenceBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");setReferenceLine(l.id);closeMenu();syncHud();showStatus(`Referentielijn ${l.name} actief.`);});
  bind("createWallBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");el("wallCreateInfo").textContent=`Basislijn ${l.name} · ${fmt(l.distance)}`;el("wallName").value="";showPage("wallcreate");});
  bind("deleteLineBtn","click",()=>{const id=S.selectedLineId;if(!canDeleteLine(id))throw new Error("Deze lijn is gekoppeld aan een muur, vorm of contour.");const l=getLine(id);runHistoryAction(`Lijn ${l?.name||""} verwijderen`,()=>deleteLineRaw(id));showPage("objects");afterProjectChange(`Lijn ${l?.name||""} verwijderd.`);});

  bind("pointNewLineBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("line",S.selectedPointId);});
  bind("pointPolylineBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("polyline",S.selectedPointId);});
  bind("pointStakeBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("stake",S.selectedPointId);});
  bind("deletePointBtn","click",()=>{const id=S.selectedPointId;if(!canDeletePoint(id))throw new Error(pointDependencies(id).references?.length?"Dit punt is een projectreferentie. Verwijder eerst de referentie.":"Dit punt is gekoppeld aan een muur, vorm of contour.");const p=getPoint(id),d=pointDependencies(id);runHistoryAction(`Punt ${p?.name||""} verwijderen`,()=>{for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(id);});showPage("objects");afterProjectChange(`Punt ${p?.name||""} verwijderd.`);});

  bind("confirmWallBtn","click",()=>{const line=getLine(S.selectedLineId);if(!line)throw new Error("Geen basislijn geselecteerd.");const w=runHistoryAction("Muur aanmaken",()=>createWall(line,{name:el("wallName").value,height:el("wallHeight").value,thickness:el("wallThickness").value,side:el("wallSide").value,orientation:el("wallOrientation").value,angle:el("wallAngle").value,color:el("wallColor").value,opacity:el("wallOpacity").value}));closeMenu();afterProjectChange(`Muur ${w.name} aangemaakt.`);});
  bind("cancelWallBtn","click",()=>showPage("line",false));bind("wallOrientation","change",()=>{el("wallAngleWrap").style.display=el("wallOrientation").value==="angle"?"block":"none";});
  bind("toggleWallBtn","click",()=>{const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");runHistoryAction(`Muur ${w.name} zichtbaarheid`,()=>toggleWall(w.id));afterProjectChange(`Muur ${w.name} ${w.visible?"zichtbaar":"verborgen"}.`);});bind("deleteWallBtn","click",()=>{const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");runHistoryAction(`Muur ${w.name} verwijderen`,()=>deleteWall(w.id));showPage("objects");afterProjectChange(`Muur ${w.name} verwijderd.`);});

  bind("createShapeBtn","click",()=>{const c=getContour(S.pendingContourId);if(!c)throw new Error("Gesloten contour ontbreekt.");const s=runHistoryAction("Vorm aanmaken",()=>createShape(c,{name:el("shapeName").value,fill:el("shapeFill").value,opacity:el("shapeOpacity").value,border:el("shapeBorder").value,thickness:el("shapeThickness").value,labels:el("shapeLabels").checked}));S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus(`Vorm ${s.name} aangemaakt · ${s.area.toFixed(2)} m² · omtrek ${s.perimeter.toFixed(2)} m.`);});
  bind("cancelShapeBtn","click",()=>{S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus("Gesloten contour bewaard zonder opvulling.");});
  bind("openAiBuilderBtn","click",openAiBuilder);
  bind("aiRunBtn","click",()=>{
    const shape=getShape(S.selectedShapeId);if(!shape)throw new Error("Selecteer eerst een vorm.");const before=getAiObjectForShape(shape.id);
    const o=runHistoryAction(before?`AI-concept ${before.name} aanpassen`:`AI-concept op ${shape.name} maken`,()=>executeAiPrototype(shape.id,el("aiPrompt").value));
    afterProjectChange(`${o.name} ${before?"aangepast":"aangemaakt"} · ${(o.height*100).toFixed(1)} cm hoog.`);renderAiBuilder();
  });
  bind("aiLockBtn","click",()=>{const o=getAiObject(S.selectedAiObjectId);if(!o)throw new Error("Geen AI-concept geselecteerd.");runHistoryAction(`${o.name} ${o.locked?"ontgrendelen":"vastzetten"}`,()=>toggleAiObjectLock(o.id));afterProjectChange(`${o.name}: ${o.locked?"vastgezet":"ontgrendeld"}.`);renderAiBuilder();});
  bind("aiDeleteBtn","click",()=>{const o=getAiObject(S.selectedAiObjectId);if(!o)throw new Error("Geen AI-concept geselecteerd.");runHistoryAction(`AI-concept ${o.name} verwijderen`,()=>deleteAiObject(o.id));afterProjectChange(`${o.name} verwijderd.`);S.selectedAiObjectId=null;renderAiBuilder();});
  bind("saveShapeBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");
    const volumeEnabled=Boolean(el("editShapeVolume")?.checked),heightM=Number(el("editShapeVolumeHeight")?.value);
    if(volumeEnabled&&(!Number.isFinite(heightM)||heightM<=0))throw new Error("Geef een geldige volumehoogte/diepte in meter.");
    runHistoryAction(`Vorm ${s.name} bewerken`,()=>updateShape(s,{name:el("editShapeName").value,fill:el("editShapeFill").value,border:el("editShapeBorder").value,opacity:el("editShapeOpacity").value,thickness:el("editShapeThickness").value,labels:el("editShapeLabels").checked,volumeEnabled,volumeHeightM:volumeEnabled?heightM:null}));afterProjectChange(`Vorm ${s.name} opgeslagen.`);openShape(s.id);});
  bind("deleteShapeOnlyBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");runHistoryAction(`Vorm ${s.name} verwijderen`,()=>{const ai=getAiObjectForShape(s.id);if(ai)deleteAiObject(ai.id);deleteShapeOnly(s.id);});showPage("objects");afterProjectChange(`Vorm ${s.name} verwijderd; gekoppeld AI-concept indien aanwezig ook verwijderd.`);});
  bind("deleteShapeContourBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");runHistoryAction(`Vorm ${s.name} + contour verwijderen`,()=>{const ai=getAiObjectForShape(s.id);if(ai)deleteAiObject(ai.id);deleteShapeWithContour(s.id);});showPage("objects");afterProjectChange(`Vorm ${s.name}, contour en gekoppeld AI-concept verwijderd.`);});

  bind("clearAllBtn","click",()=>showPage("clear"));bind("cancelClearBtn","click",()=>showPage("home",false));bind("confirmClearBtn","click",()=>{runHistoryAction("Alles wissen",()=>{clearCadRuntime();S.project.cad={models:[]};clearAiBuilderObjects();clearClearances();clearWalls();clearAllGeometry();clearProjectReferences();resetDrawingCore();});closeMenu();el("distance").textContent="—";el("hint").textContent="Alles gewist. Open ☰ om opnieuw te beginnen.";afterProjectChange("Alles gewist.");});

  bind("menuSettingsBtn","click",()=>showPage("settings"));
  bind("defaultUnit","change",()=>{S.defaults.unit=el("defaultUnit").value;el("hudUnit").value=S.defaults.unit;syncHud();});
  bind("defaultThickness","change",()=>{S.defaults.lineThickness=Number(el("defaultThickness").value)||2;});
  bind("defaultLabels","change",()=>{S.defaults.labels=el("defaultLabels").checked;});
  bind("zoomInBtn","click",()=>applyZoom(S.zoom+.25));bind("zoomOutBtn","click",()=>applyZoom(S.zoom-.25));bind("zoomResetBtn","click",()=>applyZoom(1));

  document.addEventListener("measurear:tool-changed",syncHud);document.addEventListener("measurear:tool-settings",syncHud);document.addEventListener("measurear:candidate-changed",syncCandidateContext);
  document.addEventListener("measurear:history-changed",syncHistoryControls);
  document.addEventListener("measurear:project-restored",()=>{syncHud();syncHistoryControls();renderObjects();syncProjectMeta();});
  document.addEventListener("measurear:project-meta-changed",syncProjectMeta);
  document.addEventListener("measurear:project-loaded",()=>{syncProjectMeta();renderObjects();renderCadPage();syncHistoryControls();});
  document.addEventListener("measurear:ai-builder-changed",()=>{if(document.getElementById("page-aibuilder")?.classList.contains("active"))renderAiBuilder();});
  document.addEventListener("measurear:cad-changed",()=>{if(document.getElementById("page-cad")?.classList.contains("active"))renderCadPage();syncProjectMeta();});
  document.addEventListener("measurear:cad-return-ready",()=>{menuStack=["home","cad"];showPage("cad",false);renderCadPage();closeMenu();showStatus("CAD geladen · richt het vizier op de gewenste positie.");});

  initProjectStorage();
  enableHeading().catch(()=>{});
  S.defaults.unit="cm";S.defaults.lineThickness=2;S.defaults.labels=true;S.hud.compact=true;S.tool.snapMode="smart";el("hudDensity").value="compact";el("hudSnap").value="smart";el("defaultUnit").value="cm";el("hudUnit").value="cm";el("defaultThickness").value="2";el("defaultLabels").checked=true;
  sessionStorage.removeItem("measurear.cadPickerActive");
  syncHud();syncHistoryControls();document.documentElement.dataset.uiReady="1";console.info("Measure AR unified drawing UI ready",S.version,S.build);
}

document.addEventListener("measurear:project-loaded",()=>{S.referenceCaptureId=null;});
