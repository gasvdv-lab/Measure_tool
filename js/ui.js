import {S,$,fmt,getPoint,getLine,getContour,getShape} from "./state.js?v=0.8.21.3-20260829-1030";
import {
  startTool,cancelTool,setPlacement,setDistance,setConstraint,setAngle,flipSide,setReferenceLine,setSnapMode,
  confirmCandidate,undoToolStep,finishTool,toolLabel,constraintLabel,getActivePoint,referenceRequired,resetDrawingCore
} from "./drawing-core.js?v=0.8.21.3-20260829-1030";
import {
  createShape,updateShape,deleteShapeOnly,deleteShapeWithContour,deleteLineRaw,deletePointRaw,renamePoint,updateLine,analyzeContour,
  lineDependencies,pointDependencies,canDeleteLine,canDeletePoint,clearAllGeometry,validateGeometryState,dispose
} from "./geometry.js?v=0.8.21.3-20260829-1030";
import {startAR,applyZoom} from "./ar.js?v=0.8.21.3-20260829-1030";
import {createWall,updateWall,deleteWall,toggleWall,wallsUsingLine,clearWalls,createOpening,updateOpening,deleteOpening,getOpening,openingsForWall,nextOpeningName} from "./walls.js?v=0.8.21.3-20260829-1030";
import {runHistoryAction,undoHistory,redoHistory,historyStatus,clearHistory} from "./history.js?v=0.8.21.3-20260829-1030";
import {
  initProjectStorage,saveCurrentProject,listProjects,loadStoredProject,newProject,duplicateCurrentProject,
  deleteStoredProject,renameStoredProject,projectStats,formatStats,hasRecovery,recoveryInfo,restoreRecovery,clearRecovery,
  exportCurrentProject,importProjectFile
} from "./project-storage.js?v=0.8.21.3-20260829-1030";
import {
  captureCurrentGeo,addProjectReference,removeProjectReference,beginRelocalization,cancelRelocalization,
  captureRelocalizationPoint,solveRelocalization,applyRelocalization,relocalizationSummary
} from "./relocalization.js?v=0.8.21.3-20260829-1030";

const pages=["home","project","references","relocalize","projects","objects","line","point","walltool","wallcreate","wall","openingcreate","opening","shapecreate","shape","settings","clear"];
let menuStack=["home"];

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
  const titles={home:"Measure AR",project:"Project",references:"Projectreferenties",relocalize:"Project uitlijnen",projects:"Mijn projecten",objects:"Objecten",line:"Lijn",point:"Punt",walltool:"Muur tekenen",wallcreate:"Muur maken",wall:"Muur",openingcreate:"Opening toevoegen",opening:"Opening",shapecreate:"Vorm opslaan",shape:"Vorm",settings:"Instellingen",clear:"Alles wissen"};
  el("menuTitle").textContent=titles[name]||name;if(push&&menuStack.at(-1)!==name)menuStack.push(name);el("menuBackBtn").style.visibility=name==="home"?"hidden":"visible";if(name==="objects")renderObjects();if(name==="project")renderProjectPage();if(name==="references")renderReferenceManager();if(name==="relocalize")renderRelocalizePage();if(name==="projects")renderProjectsList();
}
function openMenu(){menuStack=["home"];showPage("home",false);el("menuPanel").classList.add("open");el("menuMeta").textContent=`${S.project.name||"Project"} · v${S.version}`;closePopovers();}
function closeMenu(){el("menuPanel").classList.remove("open");closePopovers();S.objectPickMode=null;}
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
  const n=unit==="cm"?S.tool.distanceM*100:S.tool.distanceM;
  return `${Number(n.toFixed(unit==="cm"?1:3))} ${unit} ▾`;
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
  el("hudSideChip").classList.toggle("optional",!sideRelevant);
  if(S.tool.constraint==="vertical")el("hudSideChip").textContent=`Richting: ${S.tool.side>0?"omhoog":"omlaag"}`;
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
  const geo=S.project.geo;el("relocalizeGeoInfo").textContent=geo?`Opgeslagen GPS: ${geo.lat.toFixed(6)}, ${geo.lon.toFixed(6)} · nauwkeurigheid ${Number.isFinite(geo.accuracy)?`±${geo.accuracy.toFixed(1)} m`:"onbekend"}`:"Geen GPS-locatie opgeslagen.";
  const refs=S.project.relocalization.references||[],box=el("relocalizeRefs");box.innerHTML="";
  if(!refs.length){box.innerHTML='<div class="help">Geen referentiepunten geregistreerd.</div>';return;}
  for(const r of refs){
    const row=document.createElement("div");row.className="objectRow";
    const info=document.createElement("button");info.className="secondary";info.textContent=`${r.name} · ${S.project.relocalization.captured.some(c=>c.refId===r.id)?"✓ opnieuw aangewezen":"nog aanwijzen"}`;
    const cap=document.createElement("button");cap.className="primary";cap.textContent="Gebruik vizier";
    cap.onclick=()=>{
      if(!S.currentTarget)throw new Error("Richt eerst het vizier op het fysieke referentiepunt.");
      captureRelocalizationPoint(r.id,S.currentTarget);
      renderRelocalizePage();showStatus(`${r.name} opnieuw aangewezen.`);
    };
    row.append(info,cap);box.append(row);
  }
}

function renderProjectPage(){
  el("projectName").value=S.project.name||"Nieuw project";
  el("projectStats").textContent=formatStats(projectStats())+` · ${S.project.relocalization.references.length} refs`;
  el("projectSaveState").textContent=S.project.dirty
    ?`Niet-opgeslagen wijzigingen · herstel ${S.project.recoveryAvailable?"beschikbaar":"nog niet beschikbaar"}`
    :(S.project.lastSavedAt?`Opgeslagen ${projectDate(S.project.lastSavedAt)}`:"Nog niet handmatig opgeslagen.");
  const info=recoveryInfo(),box=el("recoveryBox");
  box.style.display=info?"block":"none";
  if(info)el("recoveryInfo").textContent=`${info.name} · ${projectDate(info.updatedAt)} · ${info.stats.points}p/${info.stats.lines}l/${info.stats.walls}m/${info.stats.openings}o`;
  el("restoreRecoveryBtn").disabled=!info;el("discardRecoveryBtn").disabled=!info;
}
function renderProjectsList(){
  const box=el("projectsList"),items=listProjects();box.innerHTML="";
  if(!items.length){box.innerHTML='<div class="help">Nog geen opgeslagen projecten.</div>';return;}
  for(const p of items){
    const row=document.createElement("div");row.className="projectRow";
    const main=document.createElement("button");main.className="secondary projectOpen";main.textContent=`${p.name} · ${projectDate(p.updatedAt)}`;
    const duplicate=document.createElement("button");duplicate.className="secondary";duplicate.textContent="Kopie";
    const rename=document.createElement("button");rename.className="secondary";rename.textContent="Naam";
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    main.onclick=()=>{loadStoredProject(p.id);afterProjectChange(`Project ${p.name} geopend.`);renderProjectPage();showPage("project");};
    duplicate.onclick=()=>{const n=prompt("Naam voor kopie",`${p.name} kopie`);if(!n)return;loadStoredProject(p.id);const e=duplicateCurrentProject(n);showStatus(`Kopie ${e.project.name} opgeslagen.`);renderProjectsList();};
    rename.onclick=()=>{const n=prompt("Nieuwe projectnaam",p.name);if(!n)return;renameStoredProject(p.id,n);renderProjectsList();};
    del.onclick=()=>{if(!confirm(`Project "${p.name}" verwijderen?`))return;deleteStoredProject(p.id);renderProjectsList();};
    row.append(main,duplicate,rename,del);box.append(row);
  }
}
function syncProjectMeta(){
  if(el("projectName")&&document.getElementById("page-project")?.classList.contains("active"))renderProjectPage();
  if(el("startupRecovery")){
    const info=recoveryInfo();el("startupRecovery").style.display=info?"block":"none";
    if(info)el("startupRecovery").textContent=`Herstelproject gevonden: ${info.name}. Start AR en open Project → Herstel.`;
  }
}

function renderObjects(){
  const box=el("objectsList");box.innerHTML="";
  if(!S.walls.length&&!S.shapes.length&&!S.lines.length&&!S.points.length){box.innerHTML='<div class="help">Nog geen objecten.</div>';return;}
  if(S.walls.length){box.insertAdjacentHTML("beforeend","<h3>Muren</h3>");for(const w of S.walls){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${w.name} · ${w.height.toFixed(2)} m`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openWall(w.id);del.onclick=()=>{runHistoryAction(`Muur ${w.name} verwijderen`,()=>deleteWall(w.id));afterProjectChange(`Muur ${w.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.openings.length){box.insertAdjacentHTML("beforeend","<h3>Openingen</h3>");for(const o of S.openings){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${o.name} · ${o.width.toFixed(2)} × ${o.height.toFixed(2)} m`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openOpening(o.id);del.onclick=()=>{runHistoryAction(`${o.name} verwijderen`,()=>deleteOpening(o.id));afterProjectChange(`${o.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.shapes.length){box.insertAdjacentHTML("beforeend","<h3>Vormen</h3>");for(const s of S.shapes){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${s.name} · ${s.area.toFixed(2)} m²`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openShape(s.id);del.onclick=()=>{runHistoryAction(`Vorm ${s.name} verwijderen`,()=>deleteShapeOnly(s.id));afterProjectChange(`Vorm ${s.name} verwijderd; contour bewaard.`);};row.append(open,del);box.append(row);
  }}
  if(S.lines.length){box.insertAdjacentHTML("beforeend","<h3>Lijnen</h3>");for(const l of S.lines){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${l.name} · ${fmt(l.distance)}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>{
      S.selectedLineId=l.id;el("lineInfo").textContent=open.textContent;el("editLineName").value=l.name;el("editLineColor").value=l.color||"#ffffff";
      el("editLineThickness").value=String(l.thickness||2);el("editLineLabels").checked=l.labelsVisible!==false;showPage("line");
    };
    del.onclick=()=>{const d=lineDependencies(l.id);if(d.walls.length||d.shapes.length||d.contours.length){showStatus("Deze lijn is gekoppeld aan een muur, vorm of contour.",true);return;}runHistoryAction(`Lijn ${l.name} verwijderen`,()=>deleteLineRaw(l.id));afterProjectChange(`Lijn ${l.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
  if(S.points.length){box.insertAdjacentHTML("beforeend","<h3>Punten</h3>");for(const p of S.points){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`Punt ${p.name}`;const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    open.onclick=()=>{S.selectedPointId=p.id;el("pointInfo").textContent=`Punt ${p.name}`;el("editPointName").value=p.name;showPage("point");};
    del.onclick=()=>{const d=pointDependencies(p.id);if(d.walls.length||d.shapes.length||d.contours.length){showStatus("Dit punt hoort bij een muur, vorm of contour.",true);return;}runHistoryAction(`Punt ${p.name} verwijderen`,()=>{for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(p.id);});afterProjectChange(`Punt ${p.name} verwijderd.`);};row.append(open,del);box.append(row);
  }}
}
function openShape(id){
  const s=getShape(id);if(!s)return;S.selectedShapeId=id;el("shapeInfo").textContent=`${s.name} · ${s.area.toFixed(2)} m² · omtrek ${s.perimeter.toFixed(2)} m`;
  el("editShapeName").value=s.name;el("editShapeFill").value=s.fill;el("editShapeBorder").value=s.border;el("editShapeOpacity").value=s.opacity;el("editShapeThickness").value=String(s.thickness);el("editShapeLabels").checked=s.labels;showPage("shape");
}

export function initUI(){
  bind("menuBtn","click",()=>el("menuPanel").classList.contains("open")?closeMenu():openMenu());bind("menuCloseBtn","click",closeMenu);bind("menuBackBtn","click",menuBack);
  bind("globalUndoBtn","click",()=>{const e=undoHistory();afterProjectChange(`Ongedaan: ${e.label}`);});
  bind("globalRedoBtn","click",()=>{const e=redoHistory();afterProjectChange(`Opnieuw: ${e.label}`);});
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

  bind("saveProjectBtn","click",()=>{
    const e=saveCurrentProject(el("projectName").value,false);renderProjectPage();showStatus(`Project ${e.project.name} opgeslagen.`);
  });
  bind("saveProjectAsBtn","click",()=>{
    const e=saveCurrentProject(el("projectName").value,true);renderProjectPage();showStatus(`Nieuw project ${e.project.name} opgeslagen.`);
  });
  bind("newProjectBtn","click",()=>{
    const name=el("projectName").value||"Nieuw project";
    if((S.points.length||S.lines.length||S.walls.length||S.shapes.length)&&!confirm("Huidige scène leegmaken en een nieuw project starten? Niet-opgeslagen werk kan verloren gaan."))return;
    newProject(name);afterProjectChange(`Nieuw project ${S.project.name} gestart.`);renderProjectPage();
  });
  bind("projectListBtn","click",()=>showPage("projects"));
  
  bind("captureGeoBtn","click",async()=>{
    const g=await captureCurrentGeo();markProjectDirtyFromReference();renderProjectPage();showStatus(`GPS opgeslagen · nauwkeurigheid ±${Number.isFinite(g.accuracy)?g.accuracy.toFixed(1):"?"} m.`);
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
    beginRelocalization(el("relocalizeMode").value);renderRelocalizePage();showStatus("Heruitlijning gestart. Wijs de gewenste referentiepunten opnieuw aan.");
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
    await importProjectFile(file);el("importProjectFile").value="";afterProjectChange(`Project ${S.project.name} geïmporteerd.`);renderProjectPage();
  });
  bind("restoreRecoveryBtn","click",()=>{restoreRecovery();afterProjectChange(`Herstelproject ${S.project.name} geopend.`);renderProjectPage();});
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
  bind("hudReference","change",()=>{
    setReferenceLine(el("hudReference").value||null);
    syncHud();
    if(S.tool.referenceLineId && S.tool.constraint!=="angle") closePopovers();
  });
  bind("hudAngle","input",()=>{setAngle(el("hudAngle").value);syncHud();});
  bind("hudSideBtn","click",()=>{flipSide();showStatus(`Zijde omgekeerd (${S.tool.side>0?"links/positief":"rechts/negatief"}).`);syncHud();});
  bind("hudSideChip","click",()=>{flipSide();syncHud();showStatus(S.tool.constraint==="vertical"?`Verticale richting: ${S.tool.side>0?"omhoog":"omlaag"}.`:S.tool.constraint==="parallel"?`Parallelrichting ${S.tool.side>0?"voor":"tegen"} referentie.`:`Zijde ${S.tool.side>0?"links":"rechts"}.`);});
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
    if(result.type==="polyline"){el("hint").textContent="Doorlopende lijn voltooid en open gebleven.";}if(result.type==="wall"){el("hint").textContent="Muurpad voltooid. Alle muursegmenten blijven gekoppeld aan hun basislijnen.";}
    if(result.type==="shape"){const a=analyzeContour(result.contour);el("shapeCreateInfo").textContent=`${result.contour.pointIds.length} punten · ${a.area.toFixed(2)} m² · omtrek ${a.perimeter.toFixed(2)} m`;openMenu();showPage("shapecreate");}
  });
  bind("hudCancelBtn","click",()=>{runHistoryAction("Tekenfunctie stoppen",()=>cancelTool());syncHud();syncHistoryControls();showStatus("Tekenfunctie gestopt. Bevestigde geometrie blijft bestaan.");});

  bind("captureBtn","click",()=>{
    closePopovers();const r=confirmCandidate();syncHud();
    if(r.type==="point"){el("distance").textContent="—";el("detail").textContent=`Punt ${r.point.name} vastgezet`;el("hint").textContent=`${r.point.name} is vertrekpunt. Stel zo nodig afstand/richting in en bevestig het volgende punt.`;}
    else{el("distance").textContent=fmt(r.line.distance);el("detail").textContent=r.wall?`${r.wall.name} · ${fmt(r.line.distance)}`:`${r.line.name} · ${fmt(r.line.distance)}`;el("hint").textContent=r.wall?`${r.wall.name} geplaatst. ${r.point.name} is nu vertrekpunt voor het volgende muursegment.`:(r.complete?`Lijn voltooid. Bekijk het resultaat en open ☰ voor de volgende functie.`:`${r.point.name} is nu het actieve vertrekpunt.`);}
    verifyState();syncHistoryControls();
  });

  bind("saveLineBtn","click",()=>{
    const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");
    runHistoryAction(`Lijn ${l.name} bewerken`,()=>updateLine(l,{name:el("editLineName").value,color:el("editLineColor").value,thickness:el("editLineThickness").value,labels:el("editLineLabels").checked}));
    afterProjectChange(`Lijn ${l.name} opgeslagen.`);el("lineInfo").textContent=`${l.name} · ${fmt(l.distance)}`;
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
  bind("deletePointBtn","click",()=>{const id=S.selectedPointId;if(!canDeletePoint(id))throw new Error("Dit punt is gekoppeld aan een muur, vorm of contour.");const p=getPoint(id),d=pointDependencies(id);runHistoryAction(`Punt ${p?.name||""} verwijderen`,()=>{for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(id);});showPage("objects");afterProjectChange(`Punt ${p?.name||""} verwijderd.`);});

  bind("confirmWallBtn","click",()=>{const line=getLine(S.selectedLineId);if(!line)throw new Error("Geen basislijn geselecteerd.");const w=runHistoryAction("Muur aanmaken",()=>createWall(line,{name:el("wallName").value,height:el("wallHeight").value,thickness:el("wallThickness").value,side:el("wallSide").value,orientation:el("wallOrientation").value,angle:el("wallAngle").value,color:el("wallColor").value,opacity:el("wallOpacity").value}));closeMenu();afterProjectChange(`Muur ${w.name} aangemaakt.`);});
  bind("cancelWallBtn","click",()=>showPage("line",false));bind("wallOrientation","change",()=>{el("wallAngleWrap").style.display=el("wallOrientation").value==="angle"?"block":"none";});
  bind("toggleWallBtn","click",()=>{const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");runHistoryAction(`Muur ${w.name} zichtbaarheid`,()=>toggleWall(w.id));afterProjectChange(`Muur ${w.name} ${w.visible?"zichtbaar":"verborgen"}.`);});bind("deleteWallBtn","click",()=>{const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");runHistoryAction(`Muur ${w.name} verwijderen`,()=>deleteWall(w.id));showPage("objects");afterProjectChange(`Muur ${w.name} verwijderd.`);});

  bind("createShapeBtn","click",()=>{const c=getContour(S.pendingContourId);if(!c)throw new Error("Gesloten contour ontbreekt.");const s=runHistoryAction("Vorm aanmaken",()=>createShape(c,{name:el("shapeName").value,fill:el("shapeFill").value,opacity:el("shapeOpacity").value,border:el("shapeBorder").value,thickness:el("shapeThickness").value,labels:el("shapeLabels").checked}));S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus(`Vorm ${s.name} aangemaakt · ${s.area.toFixed(2)} m² · omtrek ${s.perimeter.toFixed(2)} m.`);});
  bind("cancelShapeBtn","click",()=>{S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus("Gesloten contour bewaard zonder opvulling.");});
  bind("saveShapeBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");runHistoryAction(`Vorm ${s.name} bewerken`,()=>updateShape(s,{name:el("editShapeName").value,fill:el("editShapeFill").value,border:el("editShapeBorder").value,opacity:el("editShapeOpacity").value,thickness:el("editShapeThickness").value,labels:el("editShapeLabels").checked}));afterProjectChange(`Vorm ${s.name} opgeslagen.`);openShape(s.id);});
  bind("deleteShapeOnlyBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");runHistoryAction(`Vorm ${s.name} verwijderen`,()=>deleteShapeOnly(s.id));showPage("objects");afterProjectChange(`Vorm ${s.name} verwijderd; contour bewaard.`);});
  bind("deleteShapeContourBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");runHistoryAction(`Vorm ${s.name} + contour verwijderen`,()=>deleteShapeWithContour(s.id));showPage("objects");afterProjectChange(`Vorm ${s.name} en contour verwijderd.`);});

  bind("clearAllBtn","click",()=>showPage("clear"));bind("cancelClearBtn","click",()=>showPage("home",false));bind("confirmClearBtn","click",()=>{runHistoryAction("Alles wissen",()=>{clearWalls();clearAllGeometry();resetDrawingCore();});closeMenu();el("distance").textContent="—";el("hint").textContent="Alles gewist. Open ☰ om opnieuw te beginnen.";afterProjectChange("Alles gewist.");});

  bind("menuSettingsBtn","click",()=>showPage("settings"));
  bind("defaultUnit","change",()=>{S.defaults.unit=el("defaultUnit").value;el("hudUnit").value=S.defaults.unit;syncHud();});
  bind("defaultThickness","change",()=>{S.defaults.lineThickness=Number(el("defaultThickness").value)||2;});
  bind("defaultLabels","change",()=>{S.defaults.labels=el("defaultLabels").checked;});
  bind("zoomInBtn","click",()=>applyZoom(S.zoom+.25));bind("zoomOutBtn","click",()=>applyZoom(S.zoom-.25));bind("zoomResetBtn","click",()=>applyZoom(1));

  document.addEventListener("measurear:tool-changed",syncHud);document.addEventListener("measurear:tool-settings",syncHud);document.addEventListener("measurear:candidate-changed",syncCandidateContext);
  document.addEventListener("measurear:history-changed",syncHistoryControls);
  document.addEventListener("measurear:project-restored",()=>{syncHud();syncHistoryControls();renderObjects();syncProjectMeta();});
  document.addEventListener("measurear:project-meta-changed",syncProjectMeta);
  document.addEventListener("measurear:project-loaded",()=>{syncProjectMeta();renderObjects();syncHistoryControls();});

  initProjectStorage();
  S.defaults.unit="cm";S.defaults.lineThickness=2;S.defaults.labels=true;S.hud.compact=true;S.tool.snapMode="smart";el("hudDensity").value="compact";el("hudSnap").value="smart";el("defaultUnit").value="cm";el("hudUnit").value="cm";el("defaultThickness").value="2";el("defaultLabels").checked=true;
  syncHud();syncHistoryControls();document.documentElement.dataset.uiReady="1";console.info("Measure AR unified drawing UI ready",S.version,S.build);
}
