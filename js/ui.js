
import {S,$,fmt,getPoint,getLine,getContour} from "./state.js";
import {setConstraint,setReferenceLine,updateReferenceStatus} from "./constraints.js";
import {startMeasureNew,startMeasureFrom,startStake,startContinuous,undoContinuous,finishContinuous,placePoint,resetCurrent} from "./drawing.js";
import {createShape,deleteLineRaw,deletePointRaw,clearAllGeometry,dispose} from "./geometry.js";
import {startAR,leaveAR,applyZoom} from "./ar.js";
import {createWall,getWall,deleteWall,toggleWall,wallsUsingLine,clearWalls} from "./walls.js";

const pages=["home","measure","stake","newline","constraint","objects","line","point","wallcreate","wall","shapecreate","clear"];
let menuStack=["home"];
function showPage(name,push=true){pages.forEach(p=>$("page-"+p).classList.remove("active"));$("page-"+name).classList.add("active");$("menuTitle").textContent=name==="home"?"Measure AR":name;if(push&&menuStack.at(-1)!==name)menuStack.push(name);$("menuBackBtn").style.visibility=name==="home"?"hidden":"visible";if(name==="objects")renderObjects();}
function openMenu(){menuStack=["home"];showPage("home",false);$("menuPanel").classList.add("open");updateMeta();}
function closeMenu(){$("menuPanel").classList.remove("open");S.objectPickMode=null;}
function updateMeta(){$("menuMeta").textContent=`${S.points.length}p · ${S.lines.length}l · v${S.version}`;}
function readStake(){const n=Number($("stakeDistance").value);return Number.isFinite(n)&&n>0?($("stakeUnit").value==="cm"?n/100:n):null;}
function renderObjects(){
  const box=$("objectsList");box.innerHTML="";
  if(S.walls.length){
    box.insertAdjacentHTML("beforeend","<h3>Muren</h3>");
    for(const w of S.walls){
      const r=document.createElement("div");r.className="objectRow";
      const a=document.createElement("button"),d=document.createElement("button");
      a.className="secondary";a.textContent=`${w.name} · ${w.height.toFixed(2)} m hoog`;
      d.className="danger";d.textContent="Wis";
      a.onclick=()=>{S.selectedWallId=w.id;$("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;showPage("wall");};
      d.onclick=()=>{deleteWall(w.id);renderObjects();};
      r.append(a,d);box.append(r);
    }
  }
  if(S.shapes.length){box.insertAdjacentHTML("beforeend","<h3>Vormen</h3>");for(const s of S.shapes){const r=document.createElement("div");r.className="objectRow";r.innerHTML=`<button class="secondary">${s.name} · ${s.area.toFixed(2)} m²</button><button class="danger">Wis</button>`;r.children[1].onclick=()=>{dispose(s.mesh);S.shapes.splice(S.shapes.indexOf(s),1);renderObjects();};box.append(r);}}
  if(S.lines.length){box.insertAdjacentHTML("beforeend","<h3>Lijnen</h3>");for(const l of S.lines){const r=document.createElement("div");r.className="objectRow";const a=document.createElement("button"),d=document.createElement("button");a.className="secondary";a.textContent=`${l.name} · ${fmt(l.distance)}`;d.className="danger";d.textContent="Wis";a.onclick=()=>{S.selectedLineId=l.id;$("lineInfo").textContent=a.textContent;showPage("line");};d.onclick=()=>{deleteLineRaw(l.id);renderObjects();};r.append(a,d);box.append(r);}}
  if(S.points.length){box.insertAdjacentHTML("beforeend","<h3>Punten</h3>");for(const p of S.points){const r=document.createElement("div");r.className="objectRow";const a=document.createElement("button"),d=document.createElement("button");a.className="secondary";a.textContent=`Punt ${p.name}`;d.className="danger";d.textContent="Wis";a.onclick=()=>{if(S.objectPickMode==="measure"){startMeasureFrom(p.id);closeMenu();return;}if(S.objectPickMode==="stake"){const m=readStake();if(m)startStake(p.id,m);closeMenu();return;}S.selectedPointId=p.id;$("pointInfo").textContent=a.textContent;showPage("point");};d.onclick=()=>{for(const l of [...S.lines])if(l.startId===p.id||l.endId===p.id)deleteLineRaw(l.id);deletePointRaw(p.id);renderObjects();};r.append(a,d);box.append(r);}}
}
export function initUI(){
  $("settingsBtn").onclick=()=>$("settingsPanel").classList.toggle("open");
  $("startBtn").onclick=async()=>{try{await startAR();}catch(e){$("error").style.display="block";$("error").textContent=e.message;}};
  $("menuBtn").onclick=()=>$("menuPanel").classList.contains("open")?closeMenu():openMenu();
  $("menuCloseBtn").onclick=closeMenu;$("menuBackBtn").onclick=()=>{if(menuStack.length<=1)return closeMenu();menuStack.pop();showPage(menuStack.at(-1),false);};
  document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
  document.querySelectorAll(".constraintBtn").forEach(b=>b.onclick=()=>setConstraint(b.dataset.constraint));
  $("constraintAngle").onchange=()=>{S.constraint.angle=Number($("constraintAngle").value)||45;if(S.constraint.mode==="angle")setConstraint("angle");};
  $("constraintHudBtn").onclick=()=>{openMenu();showPage("constraint");};
  $("measureNewBtn").onclick=()=>{startMeasureNew();closeMenu();};$("measureLastBtn").onclick=()=>{const p=S.points.at(-1);if(p){startMeasureFrom(p.id);closeMenu();}};$("measureExistingBtn").onclick=()=>{S.objectPickMode="measure";showPage("objects");};
  $("newIndependentBtn").onclick=()=>{startMeasureNew();closeMenu();};$("newFromLastBtn").onclick=()=>{const p=S.points.at(-1);if(p){startMeasureFrom(p.id);closeMenu();}};
  $("stakeNewBtn").onclick=()=>{const m=readStake();if(m){startStake(null,m);closeMenu();}};$("stakeLastBtn").onclick=()=>{const p=S.points.at(-1),m=readStake();if(p&&m){startStake(p.id,m);closeMenu();}};$("stakeExistingBtn").onclick=()=>{S.objectPickMode="stake";showPage("objects");};
  $("continuousBtn").onclick=()=>{startContinuous();closeMenu();};$("drawUndoBtn").onclick=undoContinuous;$("drawFinishBtn").onclick=()=>{try{const c=finishContinuous();$("shapeCreateInfo").textContent=`${c.pointIds.length} punten · ${c.lineIds.length} lijnen`;openMenu();showPage("shapecreate");}catch(e){$("detail").textContent=e.message;}};
  $("captureBtn").onclick=placePoint;
  $("lineFromStartBtn").onclick=()=>{const l=getLine(S.selectedLineId);if(l){startMeasureFrom(l.startId);closeMenu();}};$("lineFromEndBtn").onclick=()=>{const l=getLine(S.selectedLineId);if(l){startMeasureFrom(l.endId);closeMenu();}};
  $("useReferenceBtn").onclick=()=>{setReferenceLine(S.selectedLineId);closeMenu();};
  $("createWallBtn").onclick=()=>{
    const l=getLine(S.selectedLineId);if(!l)return;
    $("wallCreateInfo").textContent=`Basislijn ${l.name} · ${fmt(l.distance)}`;
    $("wallName").value="";$("wallCreateError").style.display="none";
    showPage("wallcreate");
  };
  $("deleteLineBtn").onclick=()=>{
    const deps=wallsUsingLine(S.selectedLineId);
    if(deps.length){$("detail").textContent=`Lijn wordt gebruikt door muur: ${deps.map(w=>w.name).join(", ")}`;closeMenu();return;}
    deleteLineRaw(S.selectedLineId);showPage("objects");
  };
  $("pointNewLineBtn").onclick=()=>{startMeasureFrom(S.selectedPointId);closeMenu();};$("pointStakeBtn").onclick=()=>{showPage("stake");};$("deletePointBtn").onclick=()=>{const id=S.selectedPointId;for(const l of [...S.lines])if(l.startId===id||l.endId===id)deleteLineRaw(l.id);deletePointRaw(id);showPage("objects");};

  $("confirmWallBtn").onclick=()=>{
    const line=getLine(S.selectedLineId);if(!line)return;
    try{
      const w=createWall(line,{
        name:$("wallName").value,
        height:$("wallHeight").value,
        thickness:$("wallThickness").value,
        side:$("wallSide").value,
        orientation:$("wallOrientation").value,
        angle:$("wallAngle").value,
        color:$("wallColor").value,
        opacity:$("wallOpacity").value
      });
      $("wallCreateError").style.display="none";
      S.selectedWallId=w.id;
      $("wallInfo").textContent=`${w.name} · hoogte ${w.height.toFixed(2)} m · dikte ${w.thickness.toFixed(2)} m`;
      showPage("wall");
      renderObjects();
    }catch(e){
      $("wallCreateError").style.display="block";
      $("wallCreateError").textContent=e.message;
    }
  };
  $("cancelWallBtn").onclick=()=>showPage("line",false);
  $("toggleWallBtn").onclick=()=>{toggleWall(S.selectedWallId);renderObjects();};
  $("deleteWallBtn").onclick=()=>{deleteWall(S.selectedWallId);showPage("objects");renderObjects();};

  $("createShapeBtn").onclick=()=>{try{const c=getContour(S.pendingContourId),s=createShape(c,{name:$("shapeName").value,fill:$("shapeFill").value,opacity:$("shapeOpacity").value,border:$("shapeBorder").value});S.pendingContourId=null;S.draw.active=false;resetCurrent();closeMenu();$("stage").textContent=`Vorm ${s.name}`;$("detail").textContent=`${s.area.toFixed(2)} m²`;}catch(e){$("shapeError").style.display="block";$("shapeError").textContent=e.message;}};
  $("cancelShapeBtn").onclick=()=>{S.pendingContourId=null;S.draw.active=false;resetCurrent();closeMenu();};
  $("undoBtn").onclick=()=>{
    const a=S.undo.pop();
    if(a?.type==="createdLine"){deleteLineRaw(a.lineId);deletePointRaw(a.endId);}
    else if(a?.type==="createdWall"){deleteWall(a.wallId);}
    closeMenu();renderObjects();
  };
  $("clearAllBtn").onclick=()=>showPage("clear");$("cancelClearBtn").onclick=()=>showPage("home",false);$("confirmClearBtn").onclick=()=>{clearWalls();clearAllGeometry();S.draw.active=false;resetCurrent();closeMenu();$("stage").textContent="Alles gewist";$("hint").textContent="AR blijft actief. Plaats opnieuw punt A.";};
  $("exitBtn").onclick=leaveAR;$("menuSettingsBtn").onclick=async()=>{closeMenu();await leaveAR();$("settingsPanel").classList.add("open");};
  $("zoomInBtn").onclick=()=>applyZoom(S.zoom+.25);$("zoomOutBtn").onclick=()=>applyZoom(S.zoom-.25);$("zoomResetBtn").onclick=()=>applyZoom(1);
  setConstraint("free");updateReferenceStatus();updateMeta();
}
