
import {S,$,fmt,getPoint} from "./state.js";
import {applyConstraint,nearestSnap} from "./constraints.js";
import {createPoint,createLine,closeContour,deleteLineRaw,deletePointRaw} from "./geometry.js";
import {cameraRay,getFilteredTarget,resetTrackingSamples} from "./ar.js";

function target(){const p=getFilteredTarget();return p?nearestSnap(applyConstraint(p,cameraRay)):null;}
export function resetCurrent(){
  S.pointA=null;S.activeStartId=null;S.lineFinished=false;S.constraint.verticalPlane=null;
  $("distance").textContent="—";$("detail").textContent="";
}
export function startMeasureNew(){S.mode="measure";S.draw.active=false;resetCurrent();$("stage").textContent="Nieuw startpunt";$("hint").textContent="Plaats punt A.";}
export function startMeasureFrom(id){S.mode="measure";S.draw.active=false;resetCurrent();const p=getPoint(id);if(!p)return;S.pointA=p.position.clone();S.activeStartId=id;$("stage").textContent=`Vanaf ${p.name}`;}
export function startStake(id=null,meters=2){S.mode="stake";S.targetMeters=meters;S.draw.active=false;resetCurrent();if(id){const p=getPoint(id);S.pointA=p.position.clone();S.activeStartId=id;}$("stage").textContent="Uitzetten";}
export function startContinuous(){
  S.mode="measure";resetCurrent();S.draw={active:true,startId:null,lastId:null,pointIds:[],lineIds:[]};
  $("drawControls").classList.add("visible");$("drawFinishBtn").disabled=true;$("stage").textContent="Doorlopend tekenen";
}
export function undoContinuous(){
  if(!S.draw.active)return;if(!S.draw.lineIds.length){if(S.draw.pointIds.length===1){deletePointRaw(S.draw.pointIds.pop());S.draw.startId=S.draw.lastId=null;}return;}
  const lid=S.draw.lineIds.pop(),l=S.lines.find(x=>x.id===lid);if(!l)return;const end=l.endId;deleteLineRaw(lid);deletePointRaw(end);S.draw.pointIds.pop();S.draw.lastId=S.draw.pointIds.at(-1)||S.draw.startId;$("drawFinishBtn").disabled=S.draw.pointIds.length<3;
}
export function finishContinuous(){
  const {contour,closing}=closeContour();S.pendingContourId=contour.id;$("distance").textContent=fmt(closing.distance);$("drawControls").classList.remove("visible");return contour;
}
export function placePoint(){
  if(S.placing||S.lineFinished)return;

  // Snapshot the current filtered/constrained target now.
  // From this point onward this placement uses its own Vector3 clone only.
  const current=target();
  if(!current)return;
  const p=current.clone();

  S.placing=true;
  try{
    if(S.draw.active){
      if(!S.draw.startId){
        const a=createPoint(p);
        S.draw.startId=S.draw.lastId=a.id;
        S.draw.pointIds.push(a.id);
        S.activeStartId=a.id;
        S.pointA=a.position.clone();

        // Critical: samples used to place A must NEVER bleed into B.
        resetTrackingSamples();
        $("stage").textContent=`Punt ${a.name} vastgezet`;
        $("detail").textContent="Zoek nu het volgende punt";
      }else{
        const a=getPoint(S.draw.lastId);
        if(!a)throw new Error("Laatste vaste punt ontbreekt.");

        const b=createPoint(p,0xffd166);
        const l=createLine(a,b,{undo:false});

        S.draw.pointIds.push(b.id);
        S.draw.lineIds.push(l.id);
        S.draw.lastId=b.id;
        S.activeStartId=b.id;
        S.pointA=b.position.clone();

        resetTrackingSamples();
        $("distance").textContent=fmt(l.distance);
        $("drawFinishBtn").disabled=S.draw.pointIds.length<3;
        $("stage").textContent=`Punt ${b.name} vastgezet`;
      }
      return;
    }

    if(!S.pointA){
      const a=createPoint(p);
      S.activeStartId=a.id;
      S.pointA=a.position.clone();

      resetTrackingSamples();
      $("stage").textContent=`Punt ${a.name} vastgezet`;
      $("detail").textContent="Punt blijft vast; zoek nu B";
      return;
    }

    const a=getPoint(S.activeStartId);
    if(!a)throw new Error("Startpunt ontbreekt.");

    let bp=p.clone();
    if(S.mode==="stake"){
      let dir=p.clone().sub(a.position);
      if(dir.lengthSq()<1e-8)throw new Error("Richting ongeldig.");
      bp=a.position.clone().add(dir.normalize().multiplyScalar(S.targetMeters));
    }

    const b=createPoint(bp,0xffd166);
    const l=createLine(a,b);

    resetTrackingSamples();
    $("distance").textContent=fmt(l.distance);
    $("detail").textContent=`Lijn ${l.name}`;
    $("stage").textContent=`Punt ${b.name} vastgezet`;
    S.lineFinished=true;

  }finally{
    S.placing=false;
  }
}
