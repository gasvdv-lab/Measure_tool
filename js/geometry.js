
import {S,$,fmt,pointName,getPoint,getLine,getContour} from "./state.js";

export function dispose(obj){
  if(!obj||!S.scene)return; S.scene.remove(obj);
  obj.traverse?.(c=>{c.geometry?.dispose?.();c.material?.dispose?.();});
}
function marker(color){
  const T=S.THREE,g=new T.Group();
  const s=new T.Mesh(new T.SphereGeometry(.011,18,12),new T.MeshBasicMaterial({color}));
  const r=new T.Mesh(new T.RingGeometry(.017,.022,32),new T.MeshBasicMaterial({color,side:T.DoubleSide}));r.rotation.x=-Math.PI/2;
  g.add(s,r);S.scene.add(g);return g;
}
export function createPoint(pos,color=0x69ff9a){
  const fixed=pos.clone(),p={id:"p"+crypto.randomUUID(),name:pointName(S.pointCounter++),position:fixed.clone(),locked:{x:fixed.x,y:fixed.y,z:fixed.z},marker:marker(color)};
  p.marker.position.copy(fixed);S.points.push(p);return p;
}
export function enforceLocked(){
  for(const p of S.points){const q=p.locked;p.position.set(q.x,q.y,q.z);p.marker?.position.set(q.x,q.y,q.z);}
}
function makeLabel(text){const el=document.createElement("div");el.className="lineLabel";el.textContent=text;$("lineLabels").appendChild(el);return el;}
export function createLine(a,b,{undo=true}={}){
  const d=a.position.distanceTo(b.position);if(!Number.isFinite(d)||d<1e-4)throw new Error("Lijn te kort.");
  const T=S.THREE,geo=new T.BufferGeometry().setFromPoints([a.position,b.position]),mat=new T.LineBasicMaterial({color:0xffffff}),obj=new T.Line(geo,mat);S.scene.add(obj);
  const l={id:"l"+crypto.randomUUID(),name:a.name+b.name,startId:a.id,endId:b.id,distance:d,object:obj,label:makeLabel(`${a.name+b.name} · ${fmt(d)}`)};
  S.lines.push(l);if(undo)S.undo.push({type:"createdLine",lineId:l.id,endId:b.id});return l;
}
export function deleteLineRaw(id){
  const i=S.lines.findIndex(l=>l.id===id);if(i<0)return;const l=S.lines[i];dispose(l.object);l.label?.remove();S.lines.splice(i,1);
}
export function deletePointRaw(id){
  const i=S.points.findIndex(p=>p.id===id);if(i<0)return;dispose(S.points[i].marker);S.points.splice(i,1);
}
export function updateLabels(){
  if(!S.renderer||!S.camera)return;
  const show=$("defaultLabels").checked,xrCam=S.renderer.xr.getCamera(S.camera),w=innerWidth,h=innerHeight;
  for(const l of S.lines){
    if(!show){l.label.style.display="none";continue;}
    const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b){l.label.style.display="none";continue;}
    const pa=a.position.clone().project(xrCam),pb=b.position.clone().project(xrCam);
    if(pa.z<-1||pa.z>1||pb.z<-1||pb.z>1){l.label.style.display="none";continue;}
    l.label.style.display="block";
    l.label.style.left=((pa.x+pb.x)*.25+.5)*w+"px";
    l.label.style.top=(-(pa.y+pb.y)*.25+.5)*h-18+"px";
  }
}
export function updateMarkerScale(){
  if(!S.renderer||!S.camera)return;const cam=S.renderer.xr.getCamera(S.camera),p=new S.THREE.Vector3();cam.getWorldPosition(p);
  for(const x of S.points){const d=Math.max(.05,x.position.distanceTo(p));x.marker.scale.setScalar(Math.min(4,Math.max(.55,.48+d*.28)));}
}
export function closeContour(){
  if(S.draw.pointIds.length<3)throw new Error("Minstens 3 punten nodig.");
  const first=getPoint(S.draw.startId),last=getPoint(S.draw.lastId),closing=createLine(last,first,{undo:false});
  S.draw.lineIds.push(closing.id);
  const c={id:"c"+crypto.randomUUID(),name:`Contour ${S.contourCounter++}`,pointIds:[...S.draw.pointIds],lineIds:[...S.draw.lineIds],closed:true};
  S.contours.push(c);return {contour:c,closing};
}
function shapeNameExists(name){const k=name.trim().toLowerCase();return S.shapes.some(s=>s.name.toLowerCase()===k);}
export function createShape(contour,{name,fill,opacity,border}){
  name=name.trim();if(!name)throw new Error("Naam is verplicht.");if(shapeNameExists(name))throw new Error("Deze vormnaam bestaat al.");
  const T=S.THREE,pts=contour.pointIds.map(getPoint).map(p=>p.position);
  const origin=pts[0].clone(),normal=new T.Vector3(0,1,0);
  let u=pts[1].clone().sub(origin).normalize();if(Math.abs(u.dot(normal))>.98)u=new T.Vector3(1,0,0);
  let v=normal.clone().cross(u).normalize();u=v.clone().cross(normal).normalize();
  const pts2=pts.map(p=>{const d=p.clone().sub(origin);return new T.Vector2(d.dot(u),d.dot(v));});
  let area=0;for(let i=0;i<pts2.length;i++){const a=pts2[i],b=pts2[(i+1)%pts2.length];area+=a.x*b.y-b.x*a.y;}area=Math.abs(area)/2;
  const tris=T.ShapeUtils.triangulateShape(pts2,[]),arr=[];for(const tri of tris)for(const i of tri){const p=pts[i];arr.push(p.x,p.y,p.z);}
  const geo=new T.BufferGeometry();geo.setAttribute("position",new T.Float32BufferAttribute(arr,3));
  const mat=new T.MeshBasicMaterial({color:fill,transparent:true,opacity:Number(opacity),side:T.DoubleSide,depthWrite:false}),mesh=new T.Mesh(geo,mat);S.scene.add(mesh);
  const s={id:"s"+crypto.randomUUID(),name,contourId:contour.id,mesh,area,fill,border};S.shapes.push(s);
  for(const lid of contour.lineIds){const l=getLine(lid);l?.object?.material?.color?.set(border);}
  return s;
}
export function clearAllGeometry(){
  for(const s of S.shapes)dispose(s.mesh);for(const l of [...S.lines])deleteLineRaw(l.id);for(const p of [...S.points])deletePointRaw(p.id);
  S.shapes.length=S.contours.length=S.undo.length=0;S.pointCounter=0;S.contourCounter=1;
}
