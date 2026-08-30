import {S,getShape,getPoint} from "./state.js?v=0.8.36.4.1-20260830-pwa-version-sync-fix";
import {analyzeShapePoints,dispose} from "./geometry.js?v=0.8.36.4.1-20260830-pwa-version-sync-fix";

const DEFAULT_COLOR="#b98b5f";
const MIN_HEIGHT=.01,MAX_HEIGHT=10;

function cleanText(v){return String(v||"").trim().replace(/\s+/g," ");}
function roundMm(m){return Math.round(m*1000)/1000;}
function numberFrom(raw){return Number(String(raw).replace(",","."));}
function toMeters(value,unit){
  const n=numberFrom(value);if(!Number.isFinite(n))return null;
  const u=String(unit||"").toLowerCase();
  return u==="mm"?n/1000:u==="cm"?n/100:n;
}
function findLength(text){
  const m=String(text).match(/(\d+(?:[.,]\d+)?)\s*(mm|cm|m)\b/i);
  return m?toMeters(m[1],m[2]):null;
}
function requireHorizontal(shape){
  const n=shape?.plane?.normal;if(!n)throw new Error("De geselecteerde vorm heeft geen bruikbaar vlak.");
  if(Math.abs(n.y)<.65)throw new Error("AI Builder prototype ondersteunt voorlopig alleen horizontale of bijna horizontale vormen.");
}
function normalizedDirection(shape){
  const n=shape.plane.normal.clone().normalize();
  if(n.y<0)n.multiplyScalar(-1);
  return n;
}
function makeMesh(shape,height,color=DEFAULT_COLOR){
  requireHorizontal(shape);
  const analysis=analyzeShapePoints(shape.pointIds),T=S.THREE,base=analysis.plane.pts.map(p=>p.clone()),dir=normalizedDirection(shape),top=base.map(p=>p.clone().add(dir.clone().multiplyScalar(height)));
  const arr=[];
  const pushTri=(a,b,c)=>arr.push(a.x,a.y,a.z,b.x,b.y,b.z,c.x,c.y,c.z);
  for(const tri of analysis.triangles){
    pushTri(base[tri[2]],base[tri[1]],base[tri[0]]);
    pushTri(top[tri[0]],top[tri[1]],top[tri[2]]);
  }
  for(let i=0;i<base.length;i++){
    const j=(i+1)%base.length,a=base[i],b=base[j],c=top[j],d=top[i];
    pushTri(a,b,c);pushTri(a,c,d);
  }
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(arr,3));geo.computeVertexNormals();
  const mat=new T.MeshBasicMaterial({color,transparent:true,opacity:.72,side:T.DoubleSide,depthWrite:false});
  const mesh=new T.Mesh(geo,mat);mesh.userData.measureArAiObject=true;S.scene.add(mesh);return mesh;
}
function nextName(kind){
  const base=kind==="box"?"Conceptkist":"Conceptvolume";let i=1,name=`${base} ${i}`;
  while(S.aiObjects.some(o=>o.name===name))name=`${base} ${++i}`;return name;
}
function objectForShape(shapeId){return S.aiObjects.find(o=>o.sourceShapeId===shapeId)||null;}
function parseCommand(text,existing=null){
  const raw=cleanText(text),q=raw.toLowerCase();if(!raw)throw new Error("Typ eerst wat je wilt maken of aanpassen.");
  const supported=/(kist|box|blok|volume)/i.test(q)||Boolean(existing);
  if(!supported)throw new Error("Prototype begrijpt voorlopig kist, box, blok of volume op een geselecteerde vorm.");
  let kind=existing?.kind||(/kist|box/i.test(q)?"box":"volume");
  let height=null,mode="set";
  const hm=q.match(/(?:hoogte\s*(?:van|=)?|hoog|van)\s*(\d+(?:[.,]\d+)?)\s*(mm|cm|m)\b/i);
  if(hm)height=toMeters(hm[1],hm[2]);
  if(height==null)height=findLength(q);
  if(existing&&/(hoger|lager)/i.test(q)){
    const delta=findLength(q);if(delta==null)throw new Error("Geef bij hoger/lager een exacte maat, bijvoorbeeld 20 cm hoger.");
    height=existing.height+(q.includes("lager")?-delta:delta);mode="delta";
  }
  if(height==null&&existing&&/(zelfde|behoud)/i.test(q))height=existing.height;
  if(height==null)throw new Error("Geef een exacte hoogte, bijvoorbeeld: ‘Maak hier een houten kist van 50 cm hoog.’");
  height=roundMm(height);if(height<MIN_HEIGHT||height>MAX_HEIGHT)throw new Error("Hoogte moet in dit prototype tussen 1 cm en 10 m liggen.");
  return {raw,kind,height,mode};
}
function createRecord(shape,parsed,opts={}){
  const id=opts.id||"ai-"+crypto.randomUUID();
  const rec={id,name:opts.name||nextName(parsed.kind),mode:"concept",kind:parsed.kind,sourceShapeId:shape.id,height:parsed.height,color:opts.color||DEFAULT_COLOR,locked:Boolean(opts.locked),createdAt:opts.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),lastCommand:parsed.raw,mesh:null};
  rec.mesh=makeMesh(shape,rec.height,rec.color);return rec;
}
export function executeAiPrototype(shapeId,command){
  const shape=getShape(shapeId);if(!shape)throw new Error("Selecteer eerst een bestaande vorm.");requireHorizontal(shape);
  let rec=objectForShape(shape.id);if(rec?.locked)throw new Error("Dit concept is vastgezet. Ontgrendel het eerst om het te wijzigen.");
  const parsed=parseCommand(command,rec);
  if(!rec){rec=createRecord(shape,parsed);S.aiObjects.push(rec);}
  else{dispose(rec.mesh);rec.height=parsed.height;rec.kind=parsed.kind;rec.lastCommand=parsed.raw;rec.updatedAt=new Date().toISOString();rec.mesh=makeMesh(shape,rec.height,rec.color);}
  S.selectedAiObjectId=rec.id;document.dispatchEvent(new CustomEvent("measurear:ai-builder-changed",{detail:{id:rec.id}}));return rec;
}
export function getAiObject(id){return S.aiObjects.find(o=>o.id===id)||null;}
export function getAiObjectForShape(shapeId){return objectForShape(shapeId);}
export function toggleAiObjectLock(id){const o=getAiObject(id);if(!o)throw new Error("AI-concept niet gevonden.");o.locked=!o.locked;o.updatedAt=new Date().toISOString();document.dispatchEvent(new CustomEvent("measurear:ai-builder-changed",{detail:{id:o.id}}));return o;}
export function deleteAiObject(id){const i=S.aiObjects.findIndex(o=>o.id===id);if(i<0)return;dispose(S.aiObjects[i].mesh);S.aiObjects.splice(i,1);if(S.selectedAiObjectId===id)S.selectedAiObjectId=null;document.dispatchEvent(new CustomEvent("measurear:ai-builder-changed",{detail:{id}}));}
export function clearAiBuilderObjects(){for(const o of S.aiObjects)dispose(o.mesh);S.aiObjects.length=0;S.selectedAiObjectId=null;}
export function snapshotAiObjects(){return S.aiObjects.map(o=>({id:o.id,name:o.name,mode:o.mode,kind:o.kind,sourceShapeId:o.sourceShapeId,height:o.height,color:o.color,locked:Boolean(o.locked),createdAt:o.createdAt,updatedAt:o.updatedAt,lastCommand:o.lastCommand}));}
export function restoreAiBuilderObjects(items=[]){
  clearAiBuilderObjects();
  for(const src of items||[]){
    const shape=getShape(src.sourceShapeId);if(!shape)continue;
    try{const parsed={raw:src.lastCommand||"Hersteld concept",kind:src.kind||"volume",height:Number(src.height)};const rec=createRecord(shape,parsed,src);rec.mode=src.mode||"concept";rec.updatedAt=src.updatedAt||rec.updatedAt;rec.lastCommand=src.lastCommand||"";S.aiObjects.push(rec);}catch(err){console.warn("AI Builder object kon niet worden hersteld",src?.id,err);}
  }
  document.dispatchEvent(new CustomEvent("measurear:ai-builder-changed"));
}
export function aiObjectSummary(o){if(!o)return "Nog geen AI-concept op deze vorm.";return `${o.name} · hoogte ${(o.height*100).toFixed(1)} cm · ${o.locked?"vastgezet":"bewerkbaar"}`;}
