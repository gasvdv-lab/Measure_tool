import {S,$,fmt} from "./state.js?v=0.8.10-20260822-1930";
import {getActivePoint,setActivePoint,setPlacementMode,setDistanceCm,setDirection,setAngleDeg,setReferenceLine,previewSummary,placeMetricPoint} from "./drawing-engine.js?v=0.8.10-20260822-1930";
import {setConstraint,updateReferenceStatus,constraintNeedsReference} from "./constraints.js?v=0.8.10-20260822-1930";

export function getParametricStartPoint(){return getActivePoint();}
export function setParametricStartPoint(id){return setActivePoint(id);}
export function cancelParametricMode(){setPlacementMode("manual");}

export function refreshPlacementReferences(){
  const e=$("placementReference");if(!e)return;
  const old=e.value;e.innerHTML="";
  if(!S.lines.length){e.add(new Option("Nog geen lijnen",""));return;}
  S.lines.forEach(l=>e.add(new Option(`${l.name} · ${fmt(l.distance)}`,l.id)));
  const preferred=S.drawEngine.referenceLineId;
  if(preferred&&S.lines.some(l=>l.id===preferred))e.value=preferred;
  else if(S.lines.some(l=>l.id===old))e.value=old;
}

export function updatePlacementUI(){
  const select=$("placementConstraint");
  if(select && select.value!==S.drawEngine.direction)select.value=S.drawEngine.direction;

  const direction=select?.value||S.drawEngine.direction||"free";
  setConstraint(direction);

  const angleWrap=$("placementAngleWrap");
  const refWrap=$("placementReferenceWrap");
  if(angleWrap)angleWrap.style.display=direction==="angle"?"block":"none";
  if(refWrap)refWrap.style.display=constraintNeedsReference(direction)?"block":"none";

  refreshPlacementReferences();
  const start=getActivePoint();
  if($("placementStartInfo"))$("placementStartInfo").textContent=start?`Vertrekpunt: ${start.name}`:"Vertrekpunt: geen";
  if($("placementContextInfo"))$("placementContextInfo").textContent=start?`Volgend punt vanaf ${start.name}.`:"Plaats of selecteer eerst een vertrekpunt.";
  if($("placementPreviewInfo"))$("placementPreviewInfo").textContent=previewSummary();

  updateReferenceStatus();
}

export function placeParametricNext(){
  const n=Number($("placementDistance")?.value);
  if(!Number.isFinite(n)||n<=0)throw new Error("Geef een geldige afstand.");
  const unit=$("placementUnit")?.value||"cm";
  setDistanceCm(unit==="m"?n*100:n);

  const direction=$("placementConstraint")?.value||S.drawEngine.direction;
  setDirection(direction);
  setAngleDeg(Number($("placementAngle")?.value)||S.drawEngine.angleDeg);

  if(constraintNeedsReference(direction)){
    const refId=$("placementReference")?.value||S.drawEngine.referenceLineId;
    if(!refId)throw new Error("Kies eerst een referentielijn.");
    setReferenceLine(refId);
  }

  setPlacementMode("metric");
  const result=placeMetricPoint();
  updatePlacementUI();
  return result;
}
