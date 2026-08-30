import {S} from "./state.js?v=0.8.37.2-20260830-cad-placement-repair";

function now(){return new Date().toISOString();}
function cleanName(v){return String(v||"").trim().replace(/\s+/g," ");}
function refKey(type,id){return `${type}:${id}`;}
function splitRef(ref){const i=String(ref||"").indexOf(":");return i<1?null:{type:ref.slice(0,i),id:ref.slice(i+1)};}
function cadMeta(id){return (S.project?.cad?.models||[]).find(m=>m.id===id)||null;}
function cadObject(id){return S.cadRuntime?.objects?.get?.(id)||null;}
function itemFor(ref){
  const r=splitRef(ref);if(!r)return null;
  if(r.type==="wall"){const x=S.walls.find(v=>v.id===r.id);return x?{ref,label:`Muur · ${x.name}`,object:x.mesh,type:r.type,id:r.id}:null;}
  if(r.type==="ai"){const x=S.aiObjects.find(v=>v.id===r.id);return x?{ref,label:`AI-object · ${x.name}`,object:x.mesh,type:r.type,id:r.id}:null;}
  if(r.type==="shape"){const x=S.shapes.find(v=>v.id===r.id);return x?{ref,label:`Vorm · ${x.name}`,object:x.mesh,type:r.type,id:r.id}:null;}
  if(r.type==="cad"){const x=cadMeta(r.id),o=cadObject(r.id);return x?{ref,label:`CAD · ${x.name}`,object:o,type:r.type,id:r.id,missing:!o}:null;}
  return null;
}

export function listClearanceTargets(){
  const out=[];
  for(const w of S.walls)if(w.mesh)out.push({ref:refKey("wall",w.id),label:`Muur · ${w.name}`,type:"wall"});
  for(const o of S.aiObjects)if(o.mesh)out.push({ref:refKey("ai",o.id),label:`AI-object · ${o.name}`,type:"ai"});
  for(const s of S.shapes)if(s.mesh)out.push({ref:refKey("shape",s.id),label:`Vorm · ${s.name}`,type:"shape"});
  for(const m of (S.project?.cad?.models||[]))if(m.placed)out.push({ref:refKey("cad",m.id),label:`CAD · ${m.name}${cadObject(m.id)?"":" · nog laden"}`,type:"cad"});
  return out;
}

function boxFor(ref){
  const item=itemFor(ref);if(!item)throw new Error("Object voor vrije-ruimtecontrole bestaat niet meer.");
  if(!item.object)throw new Error(`${item.label} is nog niet geladen in de AR-scène.`);
  item.object.updateMatrixWorld?.(true);
  const box=new S.THREE.Box3().setFromObject(item.object);
  if(box.isEmpty())throw new Error(`${item.label} heeft geen bruikbare ruimtelijke begrenzing.`);
  return {item,box};
}
function overlap1(a0,a1,b0,b1){return Math.min(a1,b1)-Math.max(a0,b0);}
function separation1(a0,a1,b0,b1){return Math.max(0,b0-a1,a0-b1);}

export function analyzeClearance(aRef,bRef){
  if(!aRef||!bRef)throw new Error("Kies twee objecten.");
  if(aRef===bRef)throw new Error("Kies twee verschillende objecten.");
  const A=boxFor(aRef),B=boxFor(bRef),a=A.box,b=B.box;
  const dx=separation1(a.min.x,a.max.x,b.min.x,b.max.x);
  const dy=separation1(a.min.y,a.max.y,b.min.y,b.max.y);
  const dz=separation1(a.min.z,a.max.z,b.min.z,b.max.z);
  const gap=Math.hypot(dx,dy,dz);
  const ox=overlap1(a.min.x,a.max.x,b.min.x,b.max.x);
  const oy=overlap1(a.min.y,a.max.y,b.min.y,b.max.y);
  const oz=overlap1(a.min.z,a.max.z,b.min.z,b.max.z);
  const collision=ox>0&&oy>0&&oz>0;
  const touching=!collision&&gap<=1e-6;
  const penetration=collision?Math.min(ox,oy,oz):0;
  return {a:A.item,b:B.item,gap,collision,touching,penetration,separation:{x:dx,y:dy,z:dz},overlap:{x:ox,y:oy,z:oz}};
}

export function clearanceStatus(check){
  const a=analyzeClearance(check.aRef,check.bRef),required=Math.max(0,Number(check.requiredM)||0);
  const margin=a.gap-required;
  return {...a,required,margin,passes:!a.collision&&a.gap+1e-9>=required};
}
export function getClearance(id){return S.clearances.find(c=>c.id===id)||null;}
export function createClearance({name,aRef,bRef,requiredM=0,unit="cm"}={}){
  const n=cleanName(name)||`Vrije ruimte ${S.clearances.length+1}`;
  const req=Number(requiredM);if(!Number.isFinite(req)||req<0)throw new Error("Minimale vrije ruimte is ongeldig.");
  analyzeClearance(aRef,bRef);
  const c={id:"cl-"+crypto.randomUUID(),name:n,aRef,bRef,requiredM:req,unit:["mm","cm","m"].includes(unit)?unit:"cm",createdAt:now(),updatedAt:now()};
  S.clearances.push(c);S.selectedClearanceId=c.id;return c;
}
export function updateClearance(c,{name,aRef,bRef,requiredM,unit}={}){
  if(!c)throw new Error("Vrije-ruimtecontrole ontbreekt.");
  const req=Number(requiredM);if(!Number.isFinite(req)||req<0)throw new Error("Minimale vrije ruimte is ongeldig.");
  analyzeClearance(aRef,bRef);
  c.name=cleanName(name)||c.name;c.aRef=aRef;c.bRef=bRef;c.requiredM=req;c.unit=["mm","cm","m"].includes(unit)?unit:c.unit;c.updatedAt=now();return c;
}
export function deleteClearance(id){const i=S.clearances.findIndex(c=>c.id===id);if(i>=0)S.clearances.splice(i,1);if(S.selectedClearanceId===id)S.selectedClearanceId=null;}
export function clearClearances(){S.clearances.length=0;S.selectedClearanceId=null;}
export function snapshotClearances(){return S.clearances.map(c=>({...c}));}
export function restoreClearances(items=[]){S.clearances.length=0;for(const x of items||[])S.clearances.push({...x});S.selectedClearanceId=null;}
