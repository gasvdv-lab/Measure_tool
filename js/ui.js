import {getActivePoint,setActivePoint,setAngleDeg,setReferenceLine as setUnifiedReference} from "./drawing-engine.js?v=0.8.9.3-20260822-1835";
import {S,$,fmt,getPoint,getLine,getContour} from "./state.js?v=0.8.9.3-20260822-1835";
import {setConstraint,setReferenceLine,updateReferenceStatus} from "./constraints.js?v=0.8.9.3-20260822-1835";
import {startMeasureNew,startMeasureFrom,startStake,startContinuous,undoContinuous,finishContinuous,placePoint,resetCurrent} from "./drawing.js?v=0.8.9.3-20260822-1835";
import {createShape,deleteLineRaw,deletePointRaw,clearAllGeometry,dispose} from "./geometry.js?v=0.8.9.3-20260822-1835";
import {startAR,leaveAR,applyZoom} from "./ar.js?v=0.8.9.3-20260822-1835";
import {cancelParametricMode,placeParametricNext,setParametricStartPoint,updatePlacementUI} from "./placement.js?v=0.8.9.3-20260822-1835";
import {createWall,getWall,deleteWall,toggleWall,wallsUsingLine,clearWalls} from "./walls.js?v=0.8.9.3-20260822-1835";

const pages=["home","measure","stake","newline","constraint","placement","objects","line","point","wallcreate","wall","shapecreate","shape","settings","clear"];
let menuStack=["home"];
let pendingPlacementStart=false;

function el(id){return $(id);}
function actionMessage(message,isError=false){
  const detail=el("detail"),hint=el("hint");
  if(detail)detail.textContent=message;
  if(hint && isError)hint.textContent=message;
}
function setResultStatus({stageText,detailText,hintText,distanceText}={}){
  if(stageText&&el("stage"))el("stage").textContent=stageText;
  if(detailText&&el("detail"))el("detail").textContent=detailText;
  if(hintText&&el("hint"))el("hint").textContent=hintText;
  if(distanceText&&el("distance"))el("distance").textContent=distanceText;
}
async function runActionOnce(actionName,buttonId,fn,{closeAfter=false,result}={}){
  const now=Date.now();
  if(S.actionLock?.busy)return null;
  if(S.actionLock?.lastAction===actionName && now-(S.actionLock?.lastAt||0)<650)return null;
  S.actionLock.busy=true;
  S.actionLock.lastAction=actionName;
  S.actionLock.lastAt=now;
  const btn=buttonId?el(buttonId):null;
  if(btn)btn.disabled=true;
  try{
    const value=await fn();
    if(result){
      const data=typeof result==="function"?result(value):result;
      setResultStatus(data||{});
    }
    if(closeAfter)closeMenu();
    return value;
  }finally{
    setTimeout(()=>{
      S.actionLock.busy=false;
      if(btn)btn.disabled=false;
    },450);
  }
}
function bind(id,event,handler){
  const node=el(id);
  if(!node){
    console.warn(`[UI ${S.version}] ontbrekend element: #${id}`);
    return false;
  }
  node.addEventListener(event,async ev=>{
    try{
      await handler(ev);
    }catch(err){
      console.error(`Actie #${id} mislukt`,err);
      actionMessage(err?.message||String(err),true);
    }
  });
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
  const titles={home:"Measure AR",measure:"Meten",stake:"Uitzetten",newline:"Nieuwe lijn",constraint:"Richting",placement:"Op maat",objects:"Objecten",line:"Lijn",point:"Punt",wallcreate:"Muur maken",wall:"Muur",shapecreate:"Vorm maken",shape:"Vorm",settings:"Instellingen",clear:"Alles wissen"};
  if(el("menuTitle")) el("menuTitle").textContent=titles[name]||name;
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
  const start=getActivePoint() || getPoint(S.draw?.active?S.draw.lastId:S.activeStartId);
  if(start)setActivePoint(start.id);
  if(el("placementUnit"))el("placementUnit").value=el("defaultUnit")?.value||"cm";
  if(el("placementUnit")?.value==="cm"&&Number(el("placementDistance")?.value)<0.01)el("placementDistance").value="100";
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
      open.addEventListener("click",()=>{S.selectedShapeId=s.id;if(el("shapeInfo"))el("shapeInfo").textContent=`${s.name} · ${s.area.toFixed(2)} m²`;showPage("shape");});
      del.addEventListener("click",()=>{dispose(s.mesh);S.shapes.splice(S.shapes.indexOf(s),1);if(S.selectedShapeId===s.id)S.selectedShapeId=null;renderObjects();});
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
  document.querySelectorAll(".constraintBtn").forEach(node=>node.addEventListener("click",()=>{setConstraint(node.dataset.constraint);if(el("placementConstraint"))el("placementConstraint").value=node.dataset.constraint;updatePlacementUI();}));

  bind("constraintAngle","input",()=>{setAngleDeg(Number(el("constraintAngle").value)||45);if(S.drawEngine.direction==="angle"){setConstraint("angle");updatePlacementUI();}});
  bind("constraintHudBtn","click",()=>{openMenu();showPage("constraint");});

  bind("measureNewBtn","click",()=>{cancelParametricMode();startMeasureNew();closeMenu();});
  bind("measureLastBtn","click",()=>{const p=S.points.at(-1);if(!p)throw new Error("Er is nog geen bestaand punt.");startMeasureFrom(p.id);closeMenu();});
  bind("measureExistingBtn","click",()=>{S.objectPickMode="measure";showPage("objects");});
  bind("measureParamBtn","click",openPlacementPage);

  bind("newIndependentBtn","click",()=>{cancelParametricMode();startMeasureNew();closeMenu();});
  bind("newFromLastBtn","click",()=>{const p=S.points.at(-1);if(!p)throw new Error("Er is nog geen bestaand punt.");startMeasureFrom(p.id);closeMenu();});
  bind("newExistingBtn","click",()=>{S.objectPickMode="measure";showPage("objects");});
  bind("newParamBtn","click",openPlacementPage);

  bind("stakeNewBtn","click",()=>{cancelParametricMode();const m=readStake();if(m){startStake(null,m);closeMenu();}});
  bind("stakeLastBtn","click",()=>{const p=S.points.at(-1),m=readStake();if(!p)throw new Error("Er is nog geen bestaand punt.");if(!m)throw new Error("Geef een geldige afstand.");startStake(p.id,m);closeMenu();});
  bind("stakeExistingBtn","click",()=>{S.objectPickMode="stake";showPage("objects");});
  bind("stakeParamBtn","click",openPlacementPage);

  bind("continuousBtn","click",()=>{cancelParametricMode();startContinuous();closeMenu();});
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
  bind("useReferenceBtn","click",async()=>{
    const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");
    await runActionOnce("reference-line","useReferenceBtn",()=>{
      setReferenceLine(l.id);setUnifiedReference(l.id);updateReferenceStatus();return l;
    },{
      closeAfter:true,
      result:l=>({
        stageText:`Referentielijn ${l.name} actief`,
        detailText:`${l.name} · ${fmt(l.distance)}`,
        hintText:"De referentielijn is ingesteld. Open het menu om verder te werken."
      })
    });
  });
  bind("createWallBtn","click",()=>{
    const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");
    el("wallCreateInfo").textContent=`Basislijn ${l.name} · ${fmt(l.distance)}`;
    el("wallName").value="";el("wallCreateError").style.display="none";
    showPage("wallcreate");
  });
  bind("deleteLineBtn","click",async()=>{
    const l=getLine(S.selectedLineId);if(!l)throw new Error("Geen lijn geselecteerd.");
    const deps=wallsUsingLine(l.id);
    if(deps.length)throw new Error(`Lijn wordt gebruikt door muur: ${deps.map(w=>w.name).join(", ")}`);
    await runActionOnce("line-delete","deleteLineBtn",()=>{deleteLineRaw(l.id);renderObjects();return l;},{
      closeAfter:true,
      result:l=>({stageText:`Lijn ${l.name} verwijderd`,hintText:"AR blijft actief."})
    });
  });

  bind("pointNewLineBtn","click",()=>{if(S.selectedPointId){startMeasureFrom(S.selectedPointId);closeMenu();}});
  bind("pointStakeBtn","click",()=>{if(!S.selectedPointId)throw new Error("Geen punt geselecteerd.");setActivePoint(S.selectedPointId);showPage("stake");});
  bind("deletePointBtn","click",async()=>{
    const id=S.selectedPointId;const p=getPoint(id);if(!p)throw new Error("Geen punt geselecteerd.");
    await runActionOnce("point-delete","deletePointBtn",()=>{
      for(const l of [...S.lines])if(l.startId===id||l.endId===id)deleteLineRaw(l.id);
      deletePointRaw(id);renderObjects();return p;
    },{
      closeAfter:true,
      result:p=>({stageText:`Punt ${p.name} verwijderd`,hintText:"AR blijft actief."})
    });
  });

  bind("confirmWallBtn","click",async()=>{
    const line=getLine(S.selectedLineId);if(!line)throw new Error("Geen basislijn geselecteerd.");
    const w=await runActionOnce("wall-create","confirmWallBtn",()=>createWall(line,{
      name:el("wallName").value,height:el("wallHeight").value,thickness:el("wallThickness").value,
      side:el("wallSide").value,orientation:el("wallOrientation").value,angle:el("wallAngle").value,
      color:el("wallColor").value,opacity:el("wallOpacity").value
    }),{
      closeAfter:true,
      result:w=>({
        stageText:`Muur ${w.name} aangemaakt`,
        detailText:`${w.height.toFixed(2)} m hoog · ${w.thickness.toFixed(2)} m dik`,
        hintText:"Controleer de muur in AR. Open het menu om verder te werken."
      })
    });
    if(!w)return;
    el("wallCreateError").style.display="none";
    S.selectedWallId=w.id;
    renderObjects();
  });
  bind("cancelWallBtn","click",()=>showPage("line",false));
  bind("wallOrientation","change",()=>{if(el("wallAngleWrap"))el("wallAngleWrap").style.display=el("wallOrientation").value==="angle"?"block":"none";});
  bind("toggleWallBtn","click",()=>{toggleWall(S.selectedWallId);renderObjects();});
  bind("deleteWallBtn","click",async()=>{
    const w=S.walls.find(x=>x.id===S.selectedWallId);if(!w)throw new Error("Geen muur geselecteerd.");
    await runActionOnce("wall-delete","deleteWallBtn",()=>{deleteWall(w.id);renderObjects();return w;},{
      closeAfter:true,
      result:w=>({stageText:`Muur ${w.name} verwijderd`,hintText:"AR blijft actief."})
    });
  });

  bind("placementConstraint","change",()=>{setConstraint(el("placementConstraint").value);updatePlacementUI();});
  bind("placementDistance","input",updatePlacementUI);
  bind("placementUnit","change",updatePlacementUI);
  bind("placementAngle","input",()=>{setAngleDeg(Number(el("placementAngle").value)||45);if(el("constraintAngle"))el("constraintAngle").value=el("placementAngle").value;updatePlacementUI();});
  bind("placementReference","change",()=>{setUnifiedReference(el("placementReference").value||null);updateReferenceStatus();updatePlacementUI();});
  bind("placementApplyBtn","click",async()=>{
    const start=getActivePoint();
    if(!start){
      pendingPlacementStart=true;
      if(!S.draw.active)startMeasureNew();
      else{
        el("stage").textContent="Plaats vertrekpunt";
        el("hint").textContent="Plaats eerst punt A; daarna opent Op maat automatisch opnieuw.";
      }
      closeMenu();
      return;
    }

    const r=await runActionOnce("placement","placementApplyBtn",()=>placeParametricNext(),{
      closeAfter:true,
      result:r=>({
        stageText:`Punt ${r.point.name} vastgezet`,
        detailText:`${r.line.name} · ${fmt(r.line.distance)}`,
        hintText:`Vertrekpunt ${r.point.name} actief. Controleer het resultaat en open het menu voor de volgende stap.`,
        distanceText:fmt(r.line.distance)
      })
    });
    if(!r)return;
  });

  bind("createShapeBtn","click",async()=>{
    try{
      const c=getContour(S.pendingContourId);
      const s=await runActionOnce("shape-create","createShapeBtn",()=>createShape(c,{
        name:el("shapeName").value,fill:el("shapeFill").value,opacity:el("shapeOpacity").value,border:el("shapeBorder").value
      }),{
        closeAfter:true,
        result:s=>({
          stageText:`Vorm ${s.name} aangemaakt`,
          detailText:`${s.area.toFixed(2)} m²`,
          hintText:"Controleer de vorm in AR. Open het menu om verder te werken."
        })
      });
      if(!s)return;
      S.pendingContourId=null;S.draw.active=false;
    }catch(e){
      el("shapeError").style.display="block";
      el("shapeError").textContent=e.message||String(e);
    }
  });
  bind("cancelShapeBtn","click",()=>{S.pendingContourId=null;S.draw.active=false;resetCurrent();closeMenu();});
  bind("deleteShapeBtn","click",async()=>{
    const s=S.shapes.find(x=>x.id===S.selectedShapeId);if(!s)throw new Error("Geen vorm geselecteerd.");
    await runActionOnce("shape-delete","deleteShapeBtn",()=>{
      dispose(s.mesh);S.shapes.splice(S.shapes.indexOf(s),1);S.selectedShapeId=null;renderObjects();return s;
    },{
      closeAfter:true,
      result:s=>({stageText:`Vorm ${s.name} verwijderd`,hintText:"AR blijft actief."})
    });
  });

  bind("undoBtn","click",()=>{
    const a=S.undo.pop();
    if(!a)throw new Error("Er is niets om ongedaan te maken.");
    if(a.type==="createdLine"){deleteLineRaw(a.lineId);deletePointRaw(a.endId);}
    else if(a.type==="createdWall")deleteWall(a.wallId);
    closeMenu();renderObjects();
  });

  bind("clearAllBtn","click",()=>showPage("clear"));
  bind("cancelClearBtn","click",()=>showPage("home",false));
  bind("confirmClearBtn","click",async()=>{
    await runActionOnce("clear-all","confirmClearBtn",()=>{
      clearWalls();clearAllGeometry();S.draw.active=false;resetCurrent();return true;
    },{
      closeAfter:true,
      result:()=>({stageText:"Alles gewist",detailText:"",hintText:"AR blijft actief. Plaats opnieuw punt A.",distanceText:"—"})
    });
  });

    bind("menuSettingsBtn","click",()=>showPage("settings"));
  bind("zoomInBtn","click",()=>applyZoom(S.zoom+.25));
  bind("zoomOutBtn","click",()=>applyZoom(S.zoom-.25));
  bind("zoomResetBtn","click",()=>applyZoom(1));

  document.addEventListener("measurear:active-point-changed",()=>{
    if(!pendingPlacementStart)return;
    pendingPlacementStart=false;
    setTimeout(()=>{openMenu();openPlacementPage();},0);
  });

  if(el("defaultUnit"))el("defaultUnit").value="cm";
  if(el("stakeUnit"))el("stakeUnit").value="cm";
  setConstraint("free");
  if(el("wallAngleWrap")&&el("wallOrientation"))el("wallAngleWrap").style.display=el("wallOrientation").value==="angle"?"block":"none";
  updateReferenceStatus();
  updateMeta();

  document.documentElement.dataset.uiReady="1";
  console.info("Measure AR menu bindings ready");
}
