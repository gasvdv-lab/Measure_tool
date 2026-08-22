import {setAngleDeg,setReferenceLine as setUnifiedReference} from "./drawing-engine.js?v=0.8.9-20260822-1645";
import {S,$,fmt,getPoint,getLine,getContour} from "./state.js?v=0.8.9-20260822-1645";
import {setConstraint,setReferenceLine,updateReferenceStatus} from "./constraints.js?v=0.8.9-20260822-1645";
import {startMeasureNew,startMeasureFrom,startStake,startContinuous,undoContinuous,finishContinuous,placePoint,resetCurrent} from "./drawing.js?v=0.8.9-20260822-1645";
import {createShape,deleteLineRaw,deletePointRaw,clearAllGeometry,dispose} from "./geometry.js?v=0.8.9-20260822-1645";
import {startAR,leaveAR,applyZoom} from "./ar.js?v=0.8.9-20260822-1645";
import {cancelParametricMode,placeParametricNext,setParametricStartPoint,updatePlacementUI} from "./placement.js?v=0.8.9-20260822-1645";
import {createWall,getWall,deleteWall,toggleWall,wallsUsingLine,clearWalls} from "./walls.js?v=0.8.9-20260822-1645";

const pages=["home","measure","stake","newline","constraint","placement","objects","line","point","wallcreate","wall","shapecreate","settings","clear"];
let menuStack=["home"];

function el(id){return $(id);}
function bind(id,event,handler){
  const node=el(id);
  if(!node){
    console.warn(`[UI 0.8.9] ontbrekend element: #${id}`);
    return false;
  }
  node.addEventListener(event,handler);
  return true;
}
function showPage(name,push=true){
  for(const p of pages){
    el("page-"+p)?.classList.remove("active");
  }
  const page=el("page-"+name);
  if(!page){
    console.error(`Onbekende menupagina: ${name}`);
    return;
  }
  page.classList.add("active");
  if(el("menuTitle")) el("menuTitle").textContent=name==="home"?"Measure AR":name;
  if(push && menuStack.at(-1)!==name) menuStack.push(name);
  if(el("menuBackBtn")) el("menuBackBtn").style.visibility=name==="home"?"hidden":"visible";
  if(name==="objects") renderObjects();
}
function updateMeta(){
  if(el("menuMeta")) el("menuMeta").textContent=`${S.points.length}p · ${S.lines.length}l · v${S.version}`;
}
function openMenu(){
  menuStack=["home"];
  showPage("home",false);
  el("menuPanel")?.classList.add("open");
  updateMeta();
}
function closeMenu(){
  el("menuPanel")?.classList.remove("open");
  S.objectPickMode=null;
}
function menuBack(){
  if(menuStack.length<=1){closeMenu();return;}
  menuStack.pop();
  showPage(menuStack.at(-1),false);
}
function openPlacementPage(){
  const startId=S.draw?.active?S.draw.lastId:S.activeStartId;
  const p=getPoint(startId);
  if(p)setParametricStartPoint(p.id);
  if(el("placementUnit"))el("placementUnit").value=el("defaultUnit")?.value||"cm";
  if(el("placementUnit")?.value==="cm"&&Number(el("placementDistance")?.value)<10)el("placementDistance").value="100";
  updatePlacementUI();
  showPage("placement");
}
function readStake(){
  const n=Number(el("stakeDistance")?.value);
  if(!Number.isFinite(n)||n<=0) return null;
  return el("stakeUnit")?.value==="cm"?n/100:n;
}
function renderObjects(){
  const box=el("objectsList");
  if(!box)return;
  box.innerHTML="";

  if(!S.walls.length&&!S.shapes.length&&!S.lines.length&&!S.points.length){
    box.innerHTML='<div class="help">Nog geen objecten.</div>';
    return;
  }

  if(S.walls.length){
    box.insertAdjacentHTML("beforeend","<h3>Muren</h3>");
    for(const w of S.walls){
      const row=document.createElement("div");row.className="objectRow";
      const open=document.createElement("button");open.className="secondary";open.textContent=`${w.name} · ${w.height.toFixed(2)} m hoog`;
      const del=document.createElement("button");del.className="danger";del.textContent="Wis";
      open.addEventListener("click",()=>{S.selectedWallId=w.id;el("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;showPage("wall");});
      del.addEventListener("click",()=>{deleteWall(w.id);renderObjects();});
      row.append(open,del);box.append(row);
    }
  }

  if(S.shapes.length){
    box.insertAdjacentHTML("beforeend","<h3>Vormen</h3>");
    for(const s of S.shapes){
      const row=document.createElement("div");row.className="objectRow";
      const open=document.createElement("button");open.className="secondary";open.textContent=`${s.name} · ${s.area.toFixed(2)} m²`;
      const del=document.createElement("button");del.className="danger";del.textContent="Wis";
      del.addEventListener("click",()=>{dispose(s.mesh);S.shapes.splice(S.shapes.indexOf(s),1);renderObjects();});
      row.append(open,del);box.append(row);
    }
  }

  if(S.lines.length){
    box.insertAdjacentHTML("beforeend","<h3>Lijnen</h3>");
    for(const l of S.lines){
      const row=document.createElement("div");row.className="objectRow";
      const open=document.createElement("button");open.className="secondary";open.textContent=`${l.name} · ${fmt(l.distance)}`;
      const del=document.createElement("button");del.className="danger";del.textContent="Wis";
      open.addEventListener("click",()=>{S.selectedLineId=l.id;el("lineInfo").textContent=open.textContent;showPage("line");});
      del.addEventListener("click",()=>{
        const deps=wallsUsingLine(l.id);
        if(deps.length){el("detail").textContent=`Lijn wordt gebruikt door muur: ${deps.map(w=>w.name).join(", ")}`;return;}
        deleteLineRaw(l.id);renderObjects();
      });
      row.append(open,del);box.append(row);
    }
  }

  if(S.points.length){
    box.insertAdjacentHTML("beforeend","<h3>Punten</h3>");
    for(const p of S.points){
      const row=document.createElement("div");row.className="objectRow";
      const open=document.createElement("button");open.className="secondary";open.textContent=`Punt ${p.name}`;
      const del=document.createElement("button");del.className="danger";del.textContent="Wis";
      open.addEventListener("click",()=>{
        if(S.objectPickMode==="measure"){S.objectPickMode=null;startMeasureFrom(p.id);closeMenu();return;}
        if(S.objectPickMode==="stake"){const m=readStake();S.objectPickMode=null;if(m)startStake(p.id,m);closeMenu();return;}
        S.selectedPointId=p.id;
        el("pointInfo").textContent=`Punt ${p.name}`;
        showPage("point");
      });
      del.addEventListener("click",()=>{
        for(const l of [...S.lines]) if(l.startId===p.id||l.endId===p.id) deleteLineRaw(l.id);
        deletePointRaw(p.id);renderObjects();
      });
      row.append(open,del);box.append(row);
    }
  }
}

export function initUI(){
  console.info("Measure AR UI init",S.version,S.build);

  bind("menuBtn","click",()=>el("menuPanel")?.classList.contains("open")?closeMenu():openMenu());
  bind("menuCloseBtn","click",closeMenu);
  bind("menuBackBtn","click",menuBack);

  document.querySelectorAll("[data-page]").forEach(node=>node.addEventListener("click",()=>showPage(node.dataset.page)));
  document.querySelectorAll(".constraintBtn").forEach(node=>node.addEventListener("click",()=>setConstraint(node.dataset.constraint)));

  bind("constraintAngle","change",()=>{setAngleDeg(Number(el("constraintAngle").value)||45);if(S.drawEngine.direction==="angle")setConstraint("angle");});
  bind("constraintHudBtn","click",()=>{openMenu();showPage("constraint");});

  bind("measureNewBtn","click",()=>{cancelParametricMode();S.placementMode="manual";startMeasureNew();closeMenu();});
  bind("measureLastBtn","click",()=>{const p=S.points.at(-1);if(p){startMeasureFrom(p.id);closeMenu();}});
  bind("measureExistingBtn","click",()=>{S.objectPickMode="measure";showPage("objects");});
  bind("measureParamBtn","click",openPlacementPage);

  bind("newIndependentBtn","click",()=>{cancelParametricMode();S.placementMode="manual";startMeasureNew();closeMenu();});
  bind("newFromLastBtn","click",()=>{const p=S.points.at(-1);if(p){startMeasureFrom(p.id);closeMenu();}});
  bind("newParamBtn","click",openPlacementPage);

  bind("stakeNewBtn","click",()=>{cancelParametricMode();S.placementMode="manual";const m=readStake();if(m){startStake(null,m);closeMenu();}});
  bind("stakeLastBtn","click",()=>{const p=S.points.at(-1),m=readStake();if(p&&m){startStake(p.id,m);closeMenu();}});
  bind("stakeExistingBtn","click",()=>{S.objectPickMode="stake";showPage("objects");});
  bind("stakeParamBtn","click",openPlacementPage);

  bind("continuousBtn","click",()=>{cancelParametricMode();S.placementMode="manual";startContinuous();closeMenu();});
  bind("continuousParamBtn","click",()=>{if(!S.draw.active)startContinuous();openMenu();openPlacementPage();});
  bind("drawUndoBtn","click",undoContinuous);
  bind("drawFinishBtn","click",()=>{
    try{
      const c=finishContinuous();
      el("shapeCreateInfo").textContent=`${c.pointIds.length} punten · ${c.lineIds.length} lijnen`;
      openMenu();showPage("shapecreate");
    }catch(e){el("detail").textContent=e.message||String(e);}
  });

  bind("captureBtn","click",placePoint);

  bind("lineFromStartBtn","click",()=>{const l=getLine(S.selectedLineId);if(l){startMeasureFrom(l.startId);closeMenu();}});
  bind("lineFromEndBtn","click",()=>{const l=getLine(S.selectedLineId);if(l){startMeasureFrom(l.endId);closeMenu();}});
  bind("useReferenceBtn","click",()=>{setReferenceLine(S.selectedLineId);setUnifiedReference(S.selectedLineId);closeMenu();});
  bind("createWallBtn","click",()=>{
    const l=getLine(S.selectedLineId);if(!l)return;
    el("wallCreateInfo").textContent=`Basislijn ${l.name} · ${fmt(l.distance)}`;
    el("wallName").value="";el("wallCreateError").style.display="none";
    showPage("wallcreate");
  });
  bind("deleteLineBtn","click",()=>{
    const deps=wallsUsingLine(S.selectedLineId);
    if(deps.length){el("detail").textContent=`Lijn wordt gebruikt door muur: ${deps.map(w=>w.name).join(", ")}`;closeMenu();return;}
    deleteLineRaw(S.selectedLineId);showPage("objects");
  });

  bind("pointNewLineBtn","click",()=>{if(S.selectedPointId){startMeasureFrom(S.selectedPointId);closeMenu();}});
  bind("pointStakeBtn","click",()=>showPage("stake"));
  bind("deletePointBtn","click",()=>{
    const id=S.selectedPointId;if(!id)return;
    for(const l of [...S.lines])if(l.startId===id||l.endId===id)deleteLineRaw(l.id);
    deletePointRaw(id);showPage("objects");
  });

  bind("confirmWallBtn","click",()=>{
    const line=getLine(S.selectedLineId);if(!line)return;
    try{
      const w=createWall(line,{
        name:el("wallName").value,height:el("wallHeight").value,thickness:el("wallThickness").value,
        side:el("wallSide").value,orientation:el("wallOrientation").value,angle:el("wallAngle").value,
        color:el("wallColor").value,opacity:el("wallOpacity").value
      });
      el("wallCreateError").style.display="none";
      S.selectedWallId=w.id;el("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;
      showPage("wall");renderObjects();
    }catch(e){el("wallCreateError").style.display="block";el("wallCreateError").textContent=e.message||String(e);}
  });
  bind("cancelWallBtn","click",()=>showPage("line",false));
  bind("toggleWallBtn","click",()=>{toggleWall(S.selectedWallId);renderObjects();});
  bind("deleteWallBtn","click",()=>{deleteWall(S.selectedWallId);showPage("objects");renderObjects();});

  bind("placementConstraint","change",updatePlacementUI);
  bind("placementDistance","input",updatePlacementUI);
  bind("placementUnit","change",updatePlacementUI);
  bind("placementAngle","input",()=>{setAngleDeg(Number(el("placementAngle").value)||45);updatePlacementUI();});
  bind("placementReference","change",()=>{setUnifiedReference(el("placementReference").value||null);updatePlacementUI();});
  bind("placementApplyBtn","click",()=>{
    try{const r=placeParametricNext();if(el("placementHelp"))el("placementHelp").textContent=`${r.line.name} geplaatst. ${r.point.name} is nu vertrekpunt.`;updatePlacementUI();}
    catch(e){el("placementHelp").textContent=e.message||String(e);}
  });

  bind("createShapeBtn","click",()=>{
    try{
      const c=getContour(S.pendingContourId);
      const s=createShape(c,{name:el("shapeName").value,fill:el("shapeFill").value,opacity:el("shapeOpacity").value,border:el("shapeBorder").value});
      S.pendingContourId=null;S.draw.active=false;resetCurrent();closeMenu();
      el("stage").textContent=`Vorm ${s.name}`;el("detail").textContent=`${s.area.toFixed(2)} m²`;
    }catch(e){el("shapeError").style.display="block";el("shapeError").textContent=e.message||String(e);}
  });
  bind("cancelShapeBtn","click",()=>{S.pendingContourId=null;S.draw.active=false;resetCurrent();closeMenu();});

  bind("undoBtn","click",()=>{
    const a=S.undo.pop();
    if(a?.type==="createdLine"){deleteLineRaw(a.lineId);deletePointRaw(a.endId);}
    else if(a?.type==="createdWall")deleteWall(a.wallId);
    closeMenu();renderObjects();
  });

  bind("clearAllBtn","click",()=>showPage("clear"));
  bind("cancelClearBtn","click",()=>showPage("home",false));
  bind("confirmClearBtn","click",()=>{
    clearWalls();clearAllGeometry();S.draw.active=false;resetCurrent();closeMenu();
    el("stage").textContent="Alles gewist";el("hint").textContent="AR blijft actief. Plaats opnieuw punt A.";
  });

    bind("menuSettingsBtn","click",()=>showPage("settings"));
  bind("zoomInBtn","click",()=>applyZoom(S.zoom+.25));
  bind("zoomOutBtn","click",()=>applyZoom(S.zoom-.25));
  bind("zoomResetBtn","click",()=>applyZoom(1));

  if(el("defaultUnit"))el("defaultUnit").value="cm";
  if(el("stakeUnit"))el("stakeUnit").value="cm";
  setConstraint("free");
  updateReferenceStatus();
  updateMeta();

  document.documentElement.dataset.uiReady="1";
  console.info("Measure AR menu bindings ready");
}
