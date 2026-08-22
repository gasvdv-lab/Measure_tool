import {S,$,getPoint} from "./state.js?v=0.8.9.3-20260822-1835";
import {setDirection,setReferenceLine as setEngineReference,constrainManualTarget} from "./drawing-engine.js?v=0.8.9.3-20260822-1835";

const REFERENCE_MODES=new Set(["parallel","perpendicular","angle"]);

export function setConstraint(mode){
  setDirection(mode);

  document.querySelectorAll(".constraintBtn").forEach(btn=>{
    const active=btn.dataset.constraint===mode;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-pressed",active?"true":"false");
  });

  const angleWrap=$("constraintAngleWrap");
  const refWrap=$("constraintReferenceWrap");
  if(angleWrap)angleWrap.style.display=mode==="angle"?"block":"none";
  if(refWrap)refWrap.style.display=REFERENCE_MODES.has(mode)?"block":"none";

  const help=$("constraintModeHelp");
  if(help){
    const texts={
      free:"Vrij tekenen zonder richtingsbeperking.",
      horizontal:"Zelfde hoogte als het actieve vertrekpunt. De kijkrichting bepaalt de horizontale zijde.",
      vertical:"Exact boven of onder het actieve vertrekpunt.",
      surface:"Tekenen in het vlak dat bij het actieve vertrekpunt werd vastgelegd.",
      parallel:"Parallel aan de gekozen referentielijn.",
      perpendicular:"Exact 90° op de gekozen referentielijn.",
      angle:"De ingegeven hoek wordt gemeten ten opzichte van de gekozen referentielijn."
    };
    help.textContent=texts[mode]||"";
  }

  updateReferenceStatus();
}

export function setReferenceLine(id){
  setEngineReference(id);
  updateReferenceStatus();
}

export function updateReferenceStatus(){
  const line=S.lines.find(x=>x.id===S.drawEngine.referenceLineId);
  const el=$("constraintReference");
  if(el)el.textContent="Referentie: "+(line?line.name:"geen");

  const hud=$("constraintHudBtn");
  if(hud){
    const labels={free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht",angle:"Eigen hoek"};
    hud.textContent=labels[S.drawEngine.direction]||"Vrij";
  }
}

export function applyConstraint(point,startPoint=null){
  return constrainManualTarget(point,startPoint||getPoint(S.drawEngine.activePointId)||getPoint(S.activeStartId));
}

export function nearestSnap(point,maxDistance=0.08){
  if(!point)return null;
  let best=null,bestD=maxDistance;
  for(const p of S.points){
    if(p.id===S.drawEngine.activePointId)continue;
    const d=p.position.distanceTo(point);
    if(d<bestD){best=p;bestD=d;}
  }
  return best?best.position.clone():null;
}

export function constraintNeedsReference(mode=S.drawEngine.direction){
  return REFERENCE_MODES.has(mode);
}
