import {S,$,fmt,getPoint,getLine,getContour,getShape} from "./state.js?v=0.8.12-20260822-2015";
import {
  startTool,cancelTool,setPlacement,setDistance,setConstraint,setAngle,flipSide,setReferenceLine,setSnapMode,
  confirmCandidate,undoToolStep,finishTool,toolLabel,constraintLabel,getActivePoint,referenceRequired,resetDrawingCore
} from "./drawing-core.js?v=0.8.12-20260822-2015";
import {
  createShape,updateShape,deleteShapeOnly,deleteShapeWithContour,deleteLineRaw,deletePointRaw,
  lineDependencies,pointDependencies,canDeleteLine,canDeletePoint,clearAllGeometry,validateGeometryState,dispose
} from "./geometry.js?v=0.8.12-20260822-2015";
import {startAR,applyZoom} from "./ar.js?v=0.8.12-20260822-2015";
import {createWall,deleteWall,toggleWall,wallsUsingLine,clearWalls} from "./walls.js?v=0.8.12-20260822-2015";

const pages=["home","objects","line","point","wallcreate","wall","shapecreate","shape","settings","clear"];
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
function closePopovers(){["directionPopover","distancePopover","morePopover"].forEach(id=>el(id)?.classList.remove("open"));}
function togglePopover(id){const was=el(id).classList.contains("open");closePopovers();if(!was)el(id).classList.add("open");}
function showPage(name,push=true){
  pages.forEach(p=>el("page-"+p)?.classList.remove("active"));const page=el("page-"+name);if(!page)throw new Error(`Menupagina ontbreekt: ${name}`);page.classList.add("active");
  const titles={home:"Measure AR",objects:"Objecten",line:"Lijn",point:"Punt",wallcreate:"Muur maken",wall:"Muur",shapecreate:"Vorm opslaan",shape:"Vorm",settings:"Instellingen",clear:"Alles wissen"};
  el("menuTitle").textContent=titles[name]||name;if(push&&menuStack.at(-1)!==name)menuStack.push(name);el("menuBackBtn").style.visibility=name==="home"?"hidden":"visible";if(name==="objects")renderObjects();
}
function openMenu(){menuStack=["home"];showPage("home",false);el("menuPanel").classList.add("open");el("menuMeta").textContent=`${S.points.length}p · ${S.lines.length}l · v${S.version}`;closePopovers();}
function closeMenu(){el("menuPanel").classList.remove("open");closePopovers();S.objectPickMode=null;}
function menuBack(){if(menuStack.length<=1){closeMenu();return;}menuStack.pop();showPage(menuStack.at(-1),false);}

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
function syncCandidateContext(){
  if(!S.tool.kind||!el("hudContext"))return;
  const p=getActivePoint(),candidate=S.tool.candidate;
  let context=S.tool.status==="complete"?"Klaar · open ☰ voor een nieuwe functie":p?`Vertrekpunt ${p.name} actief`:"Plaats punt A";
  if(candidate&&!candidate.valid)context=candidate.reason;
  el("hudContext").textContent=context;
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
  const multi=["polyline","shape"].includes(S.tool.kind)&&S.tool.status==="drawing";
  el("hudActions").classList.toggle("visible",multi||Boolean(S.tool.transactions.length));
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

function renderObjects(){
  const box=el("objectsList");box.innerHTML="";
  if(!S.walls.length&&!S.shapes.length&&!S.lines.length&&!S.points.length){box.innerHTML='<div class="help">Nog geen objecten.</div>';return;}
  if(S.walls.length){box.insertAdjacentHTML("beforeend","<h3>Muren</h3>");for(const w of S.walls){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${w.name} · ${w.height.toFixed(2)} m`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>{S.selectedWallId=w.id;el("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;showPage("wall");};del.onclick=()=>{deleteWall(w.id);renderObjects();};row.append(open,del);box.append(row);
  }}
  if(S.shapes.length){box.insertAdjacentHTML("beforeend","<h3>Vormen</h3>");for(const s of S.shapes){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${s.name} · ${s.area.toFixed(2)} m²`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>openShape(s.id);del.onclick=()=>{deleteShapeOnly(s.id);renderObjects();};row.append(open,del);box.append(row);
  }}
  if(S.lines.length){box.insertAdjacentHTML("beforeend","<h3>Lijnen</h3>");for(const l of S.lines){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`${l.name} · ${fmt(l.distance)}`;
    const del=document.createElement("button");del.className="danger";del.textContent="Wis";open.onclick=()=>{S.selectedLineId=l.id;el("lineInfo").textContent=open.textContent;showPage("line");};
    del.onclick=()=>{const d=lineDependencies(l.id);if(d.walls.length||d.shapes.length){showStatus("Deze lijn is gekoppeld aan een muur, vorm of contour.",true);return;}deleteLineRaw(l.id);renderObjects();};row.append(open,del);box.append(row);
  }}
  if(S.points.length){box.insertAdjacentHTML("beforeend","<h3>Punten</h3>");for(const p of S.points){
    const row=document.createElement("div");row.className="objectRow";const open=document.createElement("button");open.className="secondary";open.textContent=`Punt ${p.name}`;const del=document.createElement("button");del.className="danger";del.textContent="Wis";
    open.onclick=()=>{S.selectedPointId=p.id;el("pointInfo").textContent=`Punt ${p.name}`;showPage("point");};
    del.onclick=()=>{const d=pointDependencies(p.id);if(d.walls.length||d.shapes.length){showStatus("Dit punt hoort bij een muur, vorm of contour.",true);return;}for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(p.id);renderObjects();};row.append(open,del);box.append(row);
  }}
}
function openShape(id){
  const s=getShape(id);if(!s)return;S.selectedShapeId=id;el("shapeInfo").textContent=`${s.name} · ${s.area.toFixed(2)} m²`;
  el("editShapeName").value=s.name;el("editShapeFill").value=s.fill;el("editShapeBorder").value=s.border;el("editShapeOpacity").value=s.opacity;el("editShapeThickness").value=String(s.thickness);el("editShapeLabels").checked=s.labels;showPage("shape");
}

export function initUI(){
  bind("menuBtn","click",()=>el("menuPanel").classList.contains("open")?closeMenu():openMenu());bind("menuCloseBtn","click",closeMenu);bind("menuBackBtn","click",menuBack);
  document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));

  bind("quickLineBtn","click",()=>begin("line"));bind("quickPolylineBtn","click",()=>begin("polyline"));bind("quickShapeBtn","click",()=>begin("shape"));bind("quickStakeBtn","click",()=>begin("stake"));
  bind("quickWallBtn","click",()=>{showPage("objects");showStatus("Kies een basislijn en daarna ‘Maak muur van lijn’.");});

  bind("hudToolBtn","click",openMenu);bind("constraintHudBtn","click",()=>togglePopover("directionPopover"));bind("distanceHudBtn","click",()=>togglePopover("distancePopover"));bind("hudMoreBtn","click",()=>togglePopover("morePopover"));
  document.querySelectorAll("[data-hud-direction]").forEach(b=>b.addEventListener("click",()=>{setConstraint(b.dataset.hudDirection);syncHud();if(!referenceRequired())closePopovers();}));
  bind("hudReference","change",()=>{setReferenceLine(el("hudReference").value||null);syncHud();});
  bind("hudAngle","input",()=>{setAngle(el("hudAngle").value);syncHud();});
  bind("hudSideBtn","click",()=>{flipSide();showStatus(`Zijde omgekeerd (${S.tool.side>0?"links/positief":"rechts/negatief"}).`);syncHud();});
  bind("hudAutoBtn","click",()=>{setPlacement("manual");closePopovers();syncHud();showStatus("AUTO: camera bepaalt het volgende punt.");});
  bind("hudUseDistanceBtn","click",()=>{setDistance(el("hudDistance").value,el("hudUnit").value);setPlacement("metric");closePopovers();syncHud();showStatus("Exacte afstand ingesteld. Bevestig met de witte ronde knop.");});
  bind("hudSnap","change",()=>{setSnapMode(el("hudSnap").value);syncHud();});
  bind("hudUndoBtn","click",()=>{undoToolStep();syncHud();showStatus("Laatste tekenstap ongedaan gemaakt.");});
  bind("hudFinishBtn","click",()=>{
    const result=finishTool();syncHud();
    if(result.type==="polyline"){el("hint").textContent="Doorlopende lijn voltooid en open gebleven.";}
    if(result.type==="shape"){el("shapeCreateInfo").textContent=`${result.contour.pointIds.length} punten · gesloten contour`;openMenu();showPage("shapecreate");}
  });
  bind("hudCancelBtn","click",()=>{cancelTool();syncHud();showStatus("Tekenfunctie gestopt. Bevestigde geometrie blijft bestaan.");});

  bind("captureBtn","click",()=>{
    closePopovers();const r=confirmCandidate();syncHud();
    if(r.type==="point"){el("distance").textContent="—";el("detail").textContent=`Punt ${r.point.name} vastgezet`;el("hint").textContent=`${r.point.name} is vertrekpunt. Stel zo nodig afstand/richting in en bevestig het volgende punt.`;}
    else{el("distance").textContent=fmt(r.line.distance);el("detail").textContent=`${r.line.name} · ${fmt(r.line.distance)}`;el("hint").textContent=r.complete?`Lijn voltooid. Bekijk het resultaat en open ☰ voor de volgende functie.`:`${r.point.name} is nu het actieve vertrekpunt.`;}
    verifyState();
  });

  bind("lineFromStartBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");begin("line",l.startId);});
  bind("lineFromEndBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");begin("line",l.endId);});
  bind("useReferenceBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");setReferenceLine(l.id);closeMenu();syncHud();showStatus(`Referentielijn ${l.name} actief.`);});
  bind("createWallBtn","click",()=>{const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");el("wallCreateInfo").textContent=`Basislijn ${l.name} · ${fmt(l.distance)}`;el("wallName").value="";showPage("wallcreate");});
  bind("deleteLineBtn","click",()=>{const id=S.selectedLineId;if(!canDeleteLine(id))throw new Error("Deze lijn is gekoppeld aan een muur, vorm of contour.");deleteLineRaw(id);showPage("objects");renderObjects();});

  bind("pointNewLineBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("line",S.selectedPointId);});
  bind("pointPolylineBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("polyline",S.selectedPointId);});
  bind("pointStakeBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");begin("stake",S.selectedPointId);});
  bind("deletePointBtn","click",()=>{const id=S.selectedPointId;if(!canDeletePoint(id))throw new Error("Dit punt is gekoppeld aan een muur, vorm of contour.");const d=pointDependencies(id);for(const l of [...d.lines])deleteLineRaw(l.id);deletePointRaw(id);showPage("objects");renderObjects();});

  bind("confirmWallBtn","click",()=>{const line=getLine(S.selectedLineId);if(!line)throw new Error("Geen basislijn geselecteerd.");const w=createWall(line,{name:el("wallName").value,height:el("wallHeight").value,thickness:el("wallThickness").value,side:el("wallSide").value,orientation:el("wallOrientation").value,angle:el("wallAngle").value,color:el("wallColor").value,opacity:el("wallOpacity").value});closeMenu();showStatus(`Muur ${w.name} aangemaakt.`);});
  bind("cancelWallBtn","click",()=>showPage("line",false));bind("wallOrientation","change",()=>{el("wallAngleWrap").style.display=el("wallOrientation").value==="angle"?"block":"none";});
  bind("toggleWallBtn","click",()=>{toggleWall(S.selectedWallId);renderObjects();});bind("deleteWallBtn","click",()=>{deleteWall(S.selectedWallId);showPage("objects");renderObjects();});

  bind("createShapeBtn","click",()=>{const c=getContour(S.pendingContourId);if(!c)throw new Error("Gesloten contour ontbreekt.");const s=createShape(c,{name:el("shapeName").value,fill:el("shapeFill").value,opacity:el("shapeOpacity").value,border:el("shapeBorder").value,thickness:el("shapeThickness").value,labels:el("shapeLabels").checked});S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus(`Vorm ${s.name} aangemaakt · ${s.area.toFixed(2)} m².`);});
  bind("cancelShapeBtn","click",()=>{S.pendingContourId=null;closeMenu();cancelTool();syncHud();showStatus("Gesloten contour bewaard zonder opvulling.");});
  bind("saveShapeBtn","click",()=>{const s=getShape(S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");updateShape(s,{name:el("editShapeName").value,fill:el("editShapeFill").value,border:el("editShapeBorder").value,opacity:el("editShapeOpacity").value,thickness:el("editShapeThickness").value,labels:el("editShapeLabels").checked});openShape(s.id);});
  bind("deleteShapeOnlyBtn","click",()=>{deleteShapeOnly(S.selectedShapeId);showPage("objects");renderObjects();});
  bind("deleteShapeContourBtn","click",()=>{deleteShapeWithContour(S.selectedShapeId);showPage("objects");renderObjects();});

  bind("clearAllBtn","click",()=>showPage("clear"));bind("cancelClearBtn","click",()=>showPage("home",false));bind("confirmClearBtn","click",()=>{clearWalls();clearAllGeometry();resetDrawingCore();closeMenu();syncHud();el("distance").textContent="—";el("hint").textContent="Alles gewist. Open ☰ om opnieuw te beginnen.";verifyState();});

  bind("menuSettingsBtn","click",()=>showPage("settings"));
  bind("defaultUnit","change",()=>{S.defaults.unit=el("defaultUnit").value;el("hudUnit").value=S.defaults.unit;syncHud();});
  bind("defaultThickness","change",()=>{S.defaults.lineThickness=Number(el("defaultThickness").value)||2;});
  bind("defaultLabels","change",()=>{S.defaults.labels=el("defaultLabels").checked;});
  bind("zoomInBtn","click",()=>applyZoom(S.zoom+.25));bind("zoomOutBtn","click",()=>applyZoom(S.zoom-.25));bind("zoomResetBtn","click",()=>applyZoom(1));

  document.addEventListener("measurear:tool-changed",syncHud);document.addEventListener("measurear:tool-settings",syncHud);document.addEventListener("measurear:candidate-changed",syncCandidateContext);

  S.defaults.unit="cm";S.defaults.lineThickness=2;S.defaults.labels=true;el("defaultUnit").value="cm";el("hudUnit").value="cm";el("defaultThickness").value="2";el("defaultLabels").checked=true;
  syncHud();document.documentElement.dataset.uiReady="1";console.info("Measure AR unified drawing UI ready",S.version,S.build);
}
