import {S,$,fmt,getPoint} from "./state.js?v=0.8.9.1-20260822-1715";
import {applyConstraint,nearestSnap} from "./constraints.js?v=0.8.9.1-20260822-1715";
import {createPoint,createLine,closeContour,deleteLineRaw,deletePointRaw} from "./geometry.js?v=0.8.9.1-20260822-1715";
import {getFilteredTarget,resetTrackingSamples} from "./ar.js?v=0.8.9.1-20260822-1715";
import {setActivePoint,clearActivePoint} from "./drawing-engine.js?v=0.8.9.1-20260822-1715";

function currentStartPoint(){
  if(S.draw.active && S.draw.lastId)return getPoint(S.draw.lastId);
  return getPoint(S.drawEngine.activePointId)||getPoint(S.activeStartId);
}

function target(){
  const raw=getFilteredTarget();
  if(!raw)return null;
  const start=currentStartPoint();
  const constrained=applyConstraint(raw,start);
  if(!constrained)return null;

  // Never let snapping invalidate an active constraint.
  if(S.drawEngine.direction==="free"){
    return nearestSnap(constrained)||constrained;
  }
  return constrained;
}

export function resetCurrent(){
  clearActivePoint();
  S.lineFinished=false;
  $("distance").textContent="—";
  $("detail").textContent="";
}

export function startMeasureNew(){
  S.mode="measure";S.draw.active=false;resetCurrent();
  $("stage").textContent="Nieuw startpunt";
  $("hint").textContent="Plaats punt A.";
}

export function startMeasureFrom(id){
  S.mode="measure";S.draw.active=false;S.lineFinished=false;
  const p=getPoint(id);if(!p)return;
  setActivePoint(id);
  $("stage").textContent=`Vanaf ${p.name}`;
  $("hint").textContent=`Vertrekpunt ${p.name} actief. Plaats het volgende punt.`;
}

export function startStake(id=null,meters=2){
  S.mode="stake";S.targetMeters=meters;S.draw.active=false;S.lineFinished=false;
  if(id){
    const p=getPoint(id);if(!p)return;
    setActivePoint(id);
    $("hint").textContent=`Vertrekpunt ${p.name} actief. Richt de gewenste zijde.`;
  }else{
    clearActivePoint();
    $("hint").textContent="Plaats eerst het vertrekpunt.";
  }
  $("stage").textContent="Uitzetten";
}

export function startContinuous(){
  S.mode="measure";resetCurrent();
  S.draw={active:true,startId:null,lastId:null,pointIds:[],lineIds:[]};
  $("drawControls").classList.add("visible");
  $("drawFinishBtn").disabled=true;
  $("stage").textContent="Doorlopend tekenen";
  $("hint").textContent="Plaats punt A.";
}

export function undoContinuous(){
  if(!S.draw.active)return;
  if(!S.draw.lineIds.length){
    if(S.draw.pointIds.length===1){
      const id=S.draw.pointIds.pop();deletePointRaw(id);
      S.draw.startId=S.draw.lastId=null;clearActivePoint();
      $("hint").textContent="Plaats opnieuw punt A.";
    }
    return;
  }
  const lid=S.draw.lineIds.pop(),line=S.lines.find(x=>x.id===lid);
  if(!line)return;
  const end=line.endId;
  deleteLineRaw(lid);deletePointRaw(end);S.draw.pointIds.pop();
  S.draw.lastId=S.draw.pointIds.at(-1)||S.draw.startId;
  if(S.draw.lastId)setActivePoint(S.draw.lastId);
  $("drawFinishBtn").disabled=S.draw.pointIds.length<3;
}

export function finishContinuous(){
  const {contour,closing}=closeContour();
  S.pendingContourId=contour.id;
  $("distance").textContent=fmt(closing.distance);
  $("drawControls").classList.remove("visible");
  return contour;
}

export function placePoint(){
  if(S.placing||S.lineFinished)return;
  const current=target();
  if(!current)return;

  S.placing=true;
  try{
    if(S.draw.active){
      if(!S.draw.startId){
        const a=createPoint(current);
        S.draw.startId=S.draw.lastId=a.id;
        S.draw.pointIds.push(a.id);
        setActivePoint(a.id);
        resetTrackingSamples();
        $("stage").textContent=`Punt ${a.name} vastgezet`;
        $("detail").textContent="Zoek nu het volgende punt";
        $("hint").textContent=`Vertrekpunt ${a.name} actief.`;
      }else{
        const a=getPoint(S.draw.lastId);
        if(!a)throw new Error("Laatste vaste punt ontbreekt.");
        const b=createPoint(current,0xffd166);
        const line=createLine(a,b,{undo:false});
        S.draw.pointIds.push(b.id);S.draw.lineIds.push(line.id);S.draw.lastId=b.id;
        setActivePoint(b.id);
        resetTrackingSamples();
        $("distance").textContent=fmt(line.distance);
        $("drawFinishBtn").disabled=S.draw.pointIds.length<3;
        $("stage").textContent=`Punt ${b.name} vastgezet`;
        $("hint").textContent=`Vertrekpunt ${b.name} actief.`;
      }
      return;
    }

    const active=currentStartPoint();
    if(!active){
      const a=createPoint(current);
      setActivePoint(a.id);
      resetTrackingSamples();
      $("stage").textContent=`Punt ${a.name} vastgezet`;
      $("detail").textContent="Punt blijft vast; zoek nu B";
      $("hint").textContent=`Vertrekpunt ${a.name} actief.`;
      return;
    }

    let bp=current.clone();
    if(S.mode==="stake"){
      let dir=bp.clone().sub(active.position);
      if(dir.lengthSq()<1e-8)throw new Error("Richting ongeldig.");
      bp=active.position.clone().add(dir.normalize().multiplyScalar(S.targetMeters));
    }

    const b=createPoint(bp,0xffd166);
    const line=createLine(active,b);
    setActivePoint(b.id);

    resetTrackingSamples();
    $("distance").textContent=fmt(line.distance);
    $("detail").textContent=`Lijn ${line.name}`;
    $("stage").textContent=`Punt ${b.name} vastgezet`;
    $("hint").textContent=`Vertrekpunt ${b.name} actief. Open het menu om verder te tekenen.`;
    S.lineFinished=true;
  }finally{
    S.placing=false;
  }
}
