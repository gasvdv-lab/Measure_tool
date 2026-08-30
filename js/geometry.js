import {S,$,fmt,fmtLine,pointName,getPoint,getLine,getContour,getShape,projectToWorld} from "./state.js?v=0.8.30-20260830-measure-engine-foundation";

export function renderPosition(p){return p?.worldPosition||p?.position||null;}

export function dispose(obj){
  if(!obj||!S.scene)return;
  S.scene.remove(obj);
  obj.traverse?.(c=>{
    c.geometry?.dispose?.();
    if(Array.isArray(c.material))c.material.forEach(m=>m?.dispose?.());
    else c.material?.dispose?.();
  });
}

function makePointMarker(color){
  if(!S.THREE||!S.scene)throw new Error("Rendering state niet geïnitialiseerd (THREE/scene ontbreekt).");
  const T=S.THREE,g=new T.Group();
  const pin=new T.Mesh(new T.SphereGeometry(.014,18,12),new T.MeshBasicMaterial({color}));
  const halo=new T.Mesh(new T.RingGeometry(.022,.029,32),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.95}));
  halo.rotation.x=-Math.PI/2;
  g.add(pin,halo);S.scene.add(g);return g;
}
function makePointLabel(text){
  const el=document.createElement("div");el.className="pointLabel";el.textContent=text;$("pointLabels").appendChild(el);return el;
}
function makeLineLabel(text){
  const el=document.createElement("div");el.className="lineLabel";el.textContent=text;$("lineLabels").appendChild(el);return el;
}
function lineRadius(level){
  return ({1:.0015,2:.0025,3:.004,4:.006})[Number(level)]||.0025;
}
function makeLineMesh(a,b,color="#ffffff",thickness=2,opacity=1){
  const T=S.THREE,mid=a.clone().add(b).multiplyScalar(.5),dir=b.clone().sub(a),len=dir.length();
  const geo=new T.CylinderGeometry(lineRadius(thickness),lineRadius(thickness),len,10);
  const mat=new T.MeshBasicMaterial({color,transparent:opacity<1,opacity});
  const mesh=new T.Mesh(geo,mat);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.clone().normalize());
  S.scene.add(mesh);return mesh;
}

export function createPoint(pos,{color=0x69ff9a,surfaceNormal=null,id=null,name=null}={}){
  if(!pos||![pos.x,pos.y,pos.z].every(Number.isFinite))throw new Error("Ongeldige puntpositie.");
  const fixed=pos.clone();
  const finalName=name||pointName(S.pointCounter++);
  const p={
    id:id||"p"+crypto.randomUUID(),name:finalName,
    position:fixed.clone(),
    worldPosition:projectToWorld(fixed),
    worldLock:"pending",
    locked:Object.freeze({x:fixed.x,y:fixed.y,z:fixed.z}),
    surfaceNormal:surfaceNormal?.clone?.()||null,
    marker:makePointMarker(color),
    label:makePointLabel(finalName)
  };
  p.marker.position.copy(p.worldPosition);S.points.push(p);document.dispatchEvent(new CustomEvent("measurear:point-created",{detail:{pointId:p.id}}));return p;
}

export function enforceLocked(){
  for(const p of S.points){
    const q=p.locked;if(!q)continue;
    // Project/source coordinates remain immutable. The visible AR pose may be
    // corrected by WebXR Anchors in p.worldPosition.
    p.position.set(q.x,q.y,q.z);
    if(!p.worldPosition)p.worldPosition=p.position.clone();
    const r=renderPosition(p);
    p.marker?.position.copy(r);
  }
  syncWorldLockedGeometry();
}

function syncLineObject(line){
  const a=getPoint(line.startId),b=getPoint(line.endId);if(!a||!b||!line.object)return;
  const pa=renderPosition(a),pb=renderPosition(b),dir=pb.clone().sub(pa),len=dir.length();
  if(len<1e-8)return;
  line.object.position.copy(pa).add(pb).multiplyScalar(.5);
  line.object.quaternion.setFromUnitVectors(new S.THREE.Vector3(0,1,0),dir.clone().normalize());
  const base=Math.max(1e-8,line.distance||a.position.distanceTo(b.position));
  line.object.scale.set(1,len/base,1);
}

function syncShapeMesh(shape){
  if(!shape?.mesh?.geometry)return;
  try{
    const analysis=analyzeShapePoints(shape.pointIds);
    const arr=[];
    for(const tri of analysis.triangles)for(const idx of tri){
      const p=getPoint(shape.pointIds[idx]),q=renderPosition(p);arr.push(q.x,q.y,q.z);
    }
    const attr=shape.mesh.geometry.getAttribute("position");
    if(attr&&attr.array.length===arr.length){
      attr.array.set(arr);attr.needsUpdate=true;shape.mesh.geometry.computeVertexNormals();shape.mesh.geometry.computeBoundingSphere();
    }
  }catch{}
}

export function syncWorldLockedGeometry(){
  for(const l of S.lines)syncLineObject(l);
  for(const s of S.shapes)syncShapeMesh(s);
}

export function findLineBetween(aId,bId){
  return S.lines.find(l=>(l.startId===aId&&l.endId===bId)||(l.startId===bId&&l.endId===aId))||null;
}

export function createLine(a,b,{color="#ffffff",thickness=null,ownerType=null,ownerId=null,id=null,name=null,autoName=true,labelsVisible=true,visible=true,unit=null,createdAt=null,updatedAt=null}={}){
  if(!a||!b)throw new Error("Start- of eindpunt ontbreekt.");
  if(a.id===b.id)throw new Error("Begin- en eindpunt mogen niet hetzelfde zijn.");
  if(findLineBetween(a.id,b.id))throw new Error("Deze lijn bestaat al.");
  const distance=a.position.distanceTo(b.position);
  if(!Number.isFinite(distance)||distance<.001)throw new Error("De lijn is te kort.");
  const t=Number(thickness||S.defaults.lineThickness)||2;
  const l={
    id:id||"l"+crypto.randomUUID(),name:String(name||a.name+b.name).trim(),
    autoName:name?Boolean(autoName):true,
    startId:a.id,endId:b.id,distance,kind:"distance",unit:unit||S.defaults.unit||"cm",
    createdAt:createdAt||new Date().toISOString(),updatedAt:updatedAt||createdAt||new Date().toISOString(),
    thickness:t,color,ownerType,ownerId,visible:visible!==false,
    labelsVisible:labelsVisible!==false,
    object:makeLineMesh(renderPosition(a),renderPosition(b),color,t),
    label:null
  };
  l.label=makeLineLabel(`${l.name} · ${fmtLine(l)}`);
  l.object.visible=l.visible;
  S.lines.push(l);
  syncLineObject(l);
  return l;
}

export function ensureLineRendered(line){
  if(!line)return null;
  const a=getPoint(line.startId),b=getPoint(line.endId);
  if(!a||!b)throw new Error("Lijnpunten ontbreken.");
  if(!line.object){
    line.object=makeLineMesh(renderPosition(a),renderPosition(b),line.color||"#ffffff",line.thickness||S.defaults.lineThickness||2);
  }else if(S.scene&&line.object.parent!==S.scene){
    S.scene.add(line.object);
  }
  if(!line.label)line.label=makeLineLabel(`${line.name} · ${fmtLine(line)}`);
  line.visible=line.visible!==false;if(line.object)line.object.visible=line.visible;
  line.labelsVisible=line.labelsVisible!==false;
  line.label.style.display=line.labelsVisible&&line.visible?"block":"none";
  syncLineObject(line);
  return line;
}

export function setLineStyle(line,{color=line.color,thickness=line.thickness,labels=true,visible=line.visible}={}){
  if(!line)return;
  line.color=color;line.thickness=Number(thickness)||2;
  if(line.object)dispose(line.object);
  const a=getPoint(line.startId),b=getPoint(line.endId);
  if(a&&b)line.object=makeLineMesh(renderPosition(a),renderPosition(b),line.color,line.thickness);
  line.visible=visible!==false;if(line.object)line.object.visible=line.visible;
  line.labelsVisible=labels!==false;if(line.label)line.label.style.display=line.labelsVisible&&line.visible?"block":"none";
}


function cleanObjectName(name){return String(name||"").trim().replace(/\s+/g," ");}
export function pointNameExists(name,excludeId=null){
  const key=cleanObjectName(name).toLocaleLowerCase("nl");
  return S.points.some(p=>p.id!==excludeId&&p.name.toLocaleLowerCase("nl")===key);
}
export function lineNameExists(name,excludeId=null){
  const key=cleanObjectName(name).toLocaleLowerCase("nl");
  return S.lines.some(l=>l.id!==excludeId&&l.name.toLocaleLowerCase("nl")===key);
}
function refreshLineLabel(line){
  if(line?.label)line.label.textContent=`${line.name} · ${fmtLine(line)}`;
}
export function renamePoint(point,name){
  if(!point)throw new Error("Punt ontbreekt.");
  name=cleanObjectName(name);
  if(!name)throw new Error("Puntnaam is verplicht.");
  if(pointNameExists(name,point.id))throw new Error("Deze puntnaam bestaat al.");
  point.name=name;if(point.label)point.label.textContent=name;
  for(const line of S.lines){
    if(!line.autoName)continue;
    if(line.startId===point.id||line.endId===point.id){
      const a=getPoint(line.startId),b=getPoint(line.endId);
      if(a&&b){line.name=a.name+b.name;refreshLineLabel(line);}
    }
  }
  return point;
}
export function updateLine(line,opts={}){
  if(!line)throw new Error("Lijn ontbreekt.");
  const name=cleanObjectName(opts.name??line.name);
  if(!name)throw new Error("Lijnnaam is verplicht.");
  if(lineNameExists(name,line.id))throw new Error("Deze lijnnaam bestaat al.");
  if(name!==line.name){line.name=name;line.autoName=false;}
  const color=opts.color??line.color;
  const thickness=Number(opts.thickness??line.thickness)||2;
  const labels=opts.labels??line.labelsVisible;
  const visible=opts.visible??line.visible;
  const unit=["cm","m"].includes(opts.unit)?opts.unit:(line.unit||S.defaults.unit||"cm");
  line.unit=unit;line.updatedAt=new Date().toISOString();
  setLineStyle(line,{color,thickness,labels,visible});
  refreshLineLabel(line);
  return line;
}

export function deleteLineRaw(id){
  const i=S.lines.findIndex(l=>l.id===id);if(i<0)return;
  const l=S.lines[i];dispose(l.object);l.label?.remove();S.lines.splice(i,1);
}
export function deletePointRaw(id){
  const i=S.points.findIndex(p=>p.id===id);if(i<0)return;
  const p=S.points[i];dispose(p.marker);p.label?.remove();S.points.splice(i,1);document.dispatchEvent(new CustomEvent("measurear:point-deleted",{detail:{pointId:id}}));
}

export function lineDependencies(id){
  return {
    walls:S.walls.filter(w=>w.lineId===id),
    shapes:S.shapes.filter(s=>s.lineIds?.includes(id)),
    contours:S.contours.filter(c=>c.lineIds?.includes(id))
  };
}
export function pointDependencies(id){
  const lines=S.lines.filter(l=>l.startId===id||l.endId===id);
  return {
    lines,
    walls:S.walls.filter(w=>lines.some(l=>l.id===w.lineId)),
    shapes:S.shapes.filter(s=>s.pointIds?.includes(id)),
    contours:S.contours.filter(c=>c.pointIds?.includes(id)),
    references:(S.project?.relocalization?.references||[]).filter(r=>r.pointId===id)
  };
}
export function canDeleteLine(id){
  const d=lineDependencies(id);return !d.walls.length&&!d.shapes.length&&!d.contours.length;
}
export function canDeletePoint(id){
  const d=pointDependencies(id);return !d.walls.length&&!d.shapes.length&&!d.contours.length&&!d.references.length;
}

export function createContour(pointIds,lineIds,{closed=false,kind="polyline",id=null,name=null}={}){
  if(pointIds.length<2)throw new Error("Contour heeft te weinig punten.");
  const c={id:id||"c"+crypto.randomUUID(),name:name||`Contour ${S.contourCounter++}`,pointIds:[...pointIds],lineIds:[...lineIds],closed,kind};
  S.contours.push(c);return c;
}

function contourPlane(pointIds){
  const T=S.THREE,pts=pointIds.map(getPoint).filter(Boolean).map(p=>p.position);
  if(pts.length<3)throw new Error("Minstens 3 punten nodig.");
  const normal=new T.Vector3();
  for(let i=0;i<pts.length;i++){
    const a=pts[i],b=pts[(i+1)%pts.length];
    normal.x+=(a.y-b.y)*(a.z+b.z);
    normal.y+=(a.z-b.z)*(a.x+b.x);
    normal.z+=(a.x-b.x)*(a.y+b.y);
  }
  if(normal.lengthSq()<1e-10){
    const e1=pts[1].clone().sub(pts[0]),e2=pts[2].clone().sub(pts[0]);
    normal.crossVectors(e1,e2);
  }
  if(normal.lengthSq()<1e-10)throw new Error("De vormpunten liggen niet in een bruikbaar vlak.");
  normal.normalize();
  const origin=pts[0].clone();
  let u=null;
  for(let i=1;i<pts.length;i++){
    const e=pts[i].clone().sub(origin);
    e.sub(normal.clone().multiplyScalar(e.dot(normal)));
    if(e.lengthSq()>1e-8){u=e.normalize();break;}
  }
  if(!u)throw new Error("Kon geen tekenbasis bepalen.");
  const v=normal.clone().cross(u).normalize();
  return {origin,normal,u,v,pts};
}


const SHAPE_MIN_SEGMENT=.01,SHAPE_DUPLICATE_TOL=.005,SHAPE_PLANE_TOL=.03,SHAPE_MIN_AREA=.0001;
function orient2(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
function onSeg2(a,b,p,e=1e-8){return Math.abs(orient2(a,b,p))<=e&&p.x>=Math.min(a.x,b.x)-e&&p.x<=Math.max(a.x,b.x)+e&&p.y>=Math.min(a.y,b.y)-e&&p.y<=Math.max(a.y,b.y)+e;}
function segmentsIntersect2(a,b,c,d,e=1e-8){const o1=orient2(a,b,c),o2=orient2(a,b,d),o3=orient2(c,d,a),o4=orient2(c,d,b);if(((o1>e&&o2<-e)||(o1<-e&&o2>e))&&((o3>e&&o4<-e)||(o3<-e&&o4>e)))return true;return onSeg2(a,b,c,e)||onSeg2(a,b,d,e)||onSeg2(c,d,a,e)||onSeg2(c,d,b,e);}
export function analyzeShapePoints(pointIds){
 const T=S.THREE,plane=contourPlane(pointIds),pts=plane.pts,n=pts.length;if(n<3)throw new Error("Een vorm vereist minstens 3 punten.");
 const maxPlaneError=Math.max(...pts.map(p=>Math.abs(p.clone().sub(plane.origin).dot(plane.normal))));if(maxPlaneError>SHAPE_PLANE_TOL)throw new Error(`De vorm is niet vlak genoeg (afwijking ${(maxPlaneError*100).toFixed(1)} cm; max. 3,0 cm).`);
 const pts2=pts.map(p=>{const d=p.clone().sub(plane.origin);return new T.Vector2(d.dot(plane.u),d.dot(plane.v));});
 for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(pts[i].distanceTo(pts[j])<SHAPE_DUPLICATE_TOL)throw new Error(`Punten ${i+1} en ${j+1} vallen bijna samen (< 5 mm).`);
 let perimeter=0;for(let i=0;i<n;i++){const len=pts[i].distanceTo(pts[(i+1)%n]);if(len<SHAPE_MIN_SEGMENT)throw new Error(`Segment ${i+1} is te kort (${(len*100).toFixed(1)} cm; min. 1 cm).`);perimeter+=len;}
 for(let i=0;i<n;i++){const a=pts2[i],b=pts2[(i+1)%n];for(let j=i+1;j<n;j++){if(j===i||j===(i+1)%n||(i===0&&j===n-1))continue;const c=pts2[j],d=pts2[(j+1)%n];if(segmentsIntersect2(a,b,c,d))throw new Error(`De vorm kruist zichzelf tussen segment ${i+1} en ${j+1}.`);}}
 let twice=0;for(let i=0;i<n;i++){const a=pts2[i],b=pts2[(i+1)%n];twice+=a.x*b.y-b.x*a.y;}const signedArea=twice/2,area=Math.abs(signedArea);if(area<SHAPE_MIN_AREA)throw new Error("De vormoppervlakte is te klein.");
 const triangles=T.ShapeUtils.triangulateShape(pts2,[]);if(triangles.length!==n-2)throw new Error(`Triangulatie mislukt: ${triangles.length} driehoeken voor ${n} punten.`);if(new Set(triangles.flat()).size!==n)throw new Error("Triangulatie gebruikt niet alle hoekpunten.");
 return {plane,pts2,area,perimeter,winding:signedArea>=0?"ccw":"cw",triangles,maxPlaneError};
}
export function analyzeContour(contour){if(!contour?.closed)throw new Error("Een vorm vereist een gesloten contour.");return analyzeShapePoints(contour.pointIds);}

function shapeNameExists(name,excludeId=null){
  const k=String(name||"").trim().toLocaleLowerCase("nl");
  return S.shapes.some(s=>s.id!==excludeId&&s.name.toLocaleLowerCase("nl")===k);
}

export function createShape(contour,{name,fill="#4caf50",opacity=.30,border="#ffffff",thickness=2,labels=true,id=null}){
  name=String(name||"").trim();
  if(!name)throw new Error("Naam is verplicht.");
  if(shapeNameExists(name))throw new Error("Deze vormnaam bestaat al.");
  const T=S.THREE,analysis=analyzeContour(contour),plane=analysis.plane,area=analysis.area,perimeter=analysis.perimeter;
  const tris=analysis.triangles,arr=[];
  for(const tri of tris)for(const idx of tri){const p=plane.pts[idx];arr.push(p.x,p.y,p.z);}
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(arr,3));geo.computeVertexNormals();
  const mat=new T.MeshBasicMaterial({color:fill,transparent:true,opacity:Number(opacity),side:T.DoubleSide,depthWrite:false});
  const mesh=new T.Mesh(geo,mat);S.scene.add(mesh);
  const s={
    id:id||"s"+crypto.randomUUID(),name,contourId:contour.id,
    pointIds:[...contour.pointIds],lineIds:[...contour.lineIds],
    mesh,area,perimeter,winding:analysis.winding,maxPlaneError:analysis.maxPlaneError,fill,opacity:Number(opacity),border,thickness:Number(thickness)||2,labels:labels!==false,
    plane:{origin:plane.origin.clone(),normal:plane.normal.clone(),u:plane.u.clone(),v:plane.v.clone()}
  };
  S.shapes.push(s);
  for(const lid of s.lineIds)setLineStyle(getLine(lid),{color:border,thickness:s.thickness,labels:s.labels});
  return s;
}

export function updateShape(shape,opts={}){
  if(!shape)return;
  const newName=String(opts.name??shape.name).trim();
  if(!newName)throw new Error("Naam is verplicht.");
  if(shapeNameExists(newName,shape.id))throw new Error("Deze vormnaam bestaat al.");
  shape.name=newName;shape.fill=opts.fill??shape.fill;shape.opacity=Number(opts.opacity??shape.opacity);
  shape.border=opts.border??shape.border;shape.thickness=Number(opts.thickness??shape.thickness)||2;shape.labels=opts.labels??shape.labels;
  if(shape.mesh?.material){shape.mesh.material.color.set(shape.fill);shape.mesh.material.opacity=shape.opacity;}
  for(const lid of shape.lineIds)setLineStyle(getLine(lid),{color:shape.border,thickness:shape.thickness,labels:shape.labels});
}

export function deleteShapeOnly(id){
  const i=S.shapes.findIndex(s=>s.id===id);if(i<0)return;
  dispose(S.shapes[i].mesh);S.shapes.splice(i,1);
  if(S.selectedShapeId===id)S.selectedShapeId=null;
}
export function deleteShapeWithContour(id){
  const s=getShape(id);if(!s)return;
  const lineIds=[...s.lineIds],pointIds=[...s.pointIds],contourId=s.contourId;
  deleteShapeOnly(id);
  const ci=S.contours.findIndex(c=>c.id===contourId);if(ci>=0)S.contours.splice(ci,1);
  for(const lid of lineIds){
    const deps=lineDependencies(lid);
    if(!deps.walls.length&&!deps.shapes.length&&!deps.contours.length)deleteLineRaw(lid);
  }
  for(const pid of pointIds){
    if(!S.lines.some(l=>l.startId===pid||l.endId===pid))deletePointRaw(pid);
  }
}

export function updateLabels(){
  if(!S.renderer||!S.camera)return;
  const show=S.defaults.labels,xrCam=S.renderer.xr.getCamera(S.camera),w=innerWidth,h=innerHeight;
  for(const l of S.lines){
    if(!l.label)continue;
    if(!show||l.labelsVisible===false||l.visible===false){l.label.style.display="none";continue;}
    const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b){l.label.style.display="none";continue;}
    const pa=renderPosition(a).clone().project(xrCam),pb=renderPosition(b).clone().project(xrCam);
    if(pa.z<-1||pa.z>1||pb.z<-1||pb.z>1){l.label.style.display="none";continue;}
    l.label.style.display="block";
    l.label.style.left=((pa.x+pb.x)*.25+.5)*w+"px";
    l.label.style.top=(-(pa.y+pb.y)*.25+.5)*h-18+"px";
  }
}
export function updatePointLabels(){
  if(!S.renderer||!S.camera)return;
  const xrCam=S.renderer.xr.getCamera(S.camera),w=innerWidth,h=innerHeight;
  for(const p of S.points){
    if(!p.label)continue;
    if(!S.defaults.labels){p.label.style.display="none";continue;}
    const q=renderPosition(p).clone().project(xrCam);
    if(q.z<-1||q.z>1||Math.abs(q.x)>1.2||Math.abs(q.y)>1.2){p.label.style.display="none";continue;}
    p.label.style.display="block";p.label.style.left=(q.x*.5+.5)*w+"px";p.label.style.top=(-q.y*.5+.5)*h-20+"px";
  }
}
export function updateMarkerScale(){
  if(!S.renderer||!S.camera)return;
  const cam=S.renderer.xr.getCamera(S.camera),p=new S.THREE.Vector3();cam.getWorldPosition(p);
  for(const x of S.points){const d=Math.max(.05,renderPosition(x).distanceTo(p));x.marker.scale.setScalar(Math.min(4,Math.max(.55,.48+d*.28)));}
}

export function clearAllGeometry(){
  for(const s of S.shapes)dispose(s.mesh);
  for(const l of [...S.lines])deleteLineRaw(l.id);
  for(const p of [...S.points])deletePointRaw(p.id);
  S.shapes.length=0;S.contours.length=0;S.lines.length=0;S.points.length=0;
  S.pointCounter=0;S.contourCounter=1;
  S.selectedLineId=S.selectedPointId=S.selectedShapeId=null;
}

export function validateGeometryState(){
  const errors=[];
  const pointIds=new Set(S.points.map(p=>p.id));
  const lineIds=new Set(S.lines.map(l=>l.id));
  if(pointIds.size!==S.points.length)errors.push("Dubbele punt-ID.");
  if(lineIds.size!==S.lines.length)errors.push("Dubbele lijn-ID.");

  for(const p of S.points){
    if(!p.position||![p.position.x,p.position.y,p.position.z].every(Number.isFinite))errors.push(`Punt ${p.name||p.id} heeft ongeldige coördinaten.`);
  }
  for(const l of S.lines){
    if(!pointIds.has(l.startId)||!pointIds.has(l.endId))errors.push(`Lijn ${l.name||l.id} verwijst naar ontbrekend punt.`);
    if(l.startId===l.endId)errors.push(`Lijn ${l.name||l.id} heeft hetzelfde start- en eindpunt.`);
    if(!Number.isFinite(l.distance)||l.distance<.001)errors.push(`Lijn ${l.name||l.id} heeft ongeldige lengte.`);
  }
  for(const c of S.contours){
    for(const pid of c.pointIds||[])if(!pointIds.has(pid))errors.push(`Contour ${c.name||c.id} verwijst naar ontbrekend punt.`);
    for(const lid of c.lineIds||[])if(!lineIds.has(lid))errors.push(`Contour ${c.name||c.id} verwijst naar ontbrekende lijn.`);
  }
  for(const s of S.shapes){
    for(const pid of s.pointIds||[])if(!pointIds.has(pid))errors.push(`Vorm ${s.name||s.id} verwijst naar ontbrekend punt.`);
    for(const lid of s.lineIds||[])if(!lineIds.has(lid))errors.push(`Vorm ${s.name||s.id} verwijst naar ontbrekende lijn.`);
  }
  const wallIds=new Set(S.walls.map(w=>w.id)),openingIds=new Set(S.openings.map(o=>o.id));
  if(wallIds.size!==S.walls.length)errors.push("Dubbele muur-ID.");
  if(openingIds.size!==S.openings.length)errors.push("Dubbele opening-ID.");
  for(const w of S.walls){
    if(!lineIds.has(w.lineId))errors.push(`Muur ${w.name||w.id} verwijst naar ontbrekende basislijn.`);
    if(!(Number.isFinite(w.height)&&w.height>0&&Number.isFinite(w.thickness)&&w.thickness>0))errors.push(`Muur ${w.name||w.id} heeft ongeldige afmetingen.`);
    if(S.scene&&(!w.mesh||w.mesh.parent!==S.scene))errors.push(`Muur ${w.name||w.id} heeft geen geldige scèneweergave.`);
  }
  if(S.scene?.traverse){
    const rendered=[];S.scene.traverse(o=>{if(o?.userData?.measureArType==="wall")rendered.push(o.userData.wallId);});
    for(const id of rendered)if(!wallIds.has(id))errors.push(`Wees-muur in scène: ${id}.`);
  }
  for(const o of S.openings){
    const w=S.walls.find(x=>x.id===o.wallId);
    if(!w)errors.push(`Opening ${o.name||o.id} verwijst naar ontbrekende muur.`);
    else{
      if(!(o.width>0&&o.height>0))errors.push(`Opening ${o.name||o.id} heeft ongeldige afmetingen.`);
      if(o.x<0||o.bottom<0||o.bottom+o.height>w.height+.001)errors.push(`Opening ${o.name||o.id} valt buiten de muur.`);
    }
  }
  return {ok:errors.length===0,errors};
}
