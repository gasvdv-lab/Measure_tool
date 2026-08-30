import {S,getPoint,getLine,getShape} from "./state.js?v=0.8.37.1-20260830-rigid-world-lock";

// v0.8.37.1: one registry/selection contract for heterogeneous spatial project objects.
export const SPATIAL_TYPES=Object.freeze(["point","line","shape","wall","opening","ai","cad"]);
export function spatialKey(type,id){return `${type}:${id}`;}
export function selectSpatialObject(type,id){
  const obj=getSpatialObject(type,id);
  if(!obj)throw new Error("Ruimtelijk object niet gevonden.");
  S.selectedSpatialObject={type,id,key:spatialKey(type,id)};
  document.dispatchEvent(new CustomEvent("measurear:spatial-selection",{detail:{...S.selectedSpatialObject}}));
  return obj;
}
export function clearSpatialSelection(){S.selectedSpatialObject=null;document.dispatchEvent(new CustomEvent("measurear:spatial-selection",{detail:null}));}
export function getSpatialObject(type,id){
  if(type==="point")return getPoint(id);
  if(type==="line")return getLine(id);
  if(type==="shape")return getShape(id);
  if(type==="wall")return S.walls.find(x=>x.id===id)||null;
  if(type==="opening")return S.openings.find(x=>x.id===id)||null;
  if(type==="ai")return S.aiObjects.find(x=>x.id===id)||null;
  if(type==="cad")return S.project.cad?.models?.find(x=>x.id===id)||null;
  return null;
}
export function spatialDescriptor(type,obj){
  if(!obj)return null;
  const base={type,id:obj.id,key:spatialKey(type,obj.id),name:obj.name||obj.fileName||obj.id,locked:Boolean(obj.locked),visible:obj.visible!==false};
  if(type==="point")return {...base,kind:"Punt"};
  if(type==="line")return {...base,kind:"Lijn",distance:obj.distance};
  if(type==="shape")return {...base,kind:"Vorm",area:obj.area};
  if(type==="wall")return {...base,kind:"Muur",height:obj.height};
  if(type==="opening")return {...base,kind:"Opening",width:obj.width,height:obj.height};
  if(type==="ai")return {...base,kind:"AI-concept",height:obj.height};
  if(type==="cad")return {...base,kind:"CAD-model",visible:true,placed:Boolean(obj.placed)};
  return base;
}
export function listSpatialObjects(){
  return [
    ...S.walls.map(o=>spatialDescriptor("wall",o)),...S.openings.map(o=>spatialDescriptor("opening",o)),
    ...S.aiObjects.map(o=>spatialDescriptor("ai",o)),...S.shapes.map(o=>spatialDescriptor("shape",o)),
    ...S.lines.map(o=>spatialDescriptor("line",o)),...S.points.map(o=>spatialDescriptor("point",o)),
    ...(S.project.cad?.models||[]).map(o=>spatialDescriptor("cad",o))
  ];
}
