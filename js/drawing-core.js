import {S,$,fmt,getPoint,getLine} from "./state.js?v=0.8.21.7-20260829-1415";
import {createPoint,createLine,ensureLineRendered,deleteLineRaw,deletePointRaw,createContour,dispose,analyzeShapePoints} from "./geometry.js?v=0.8.21.7-20260829-1415";
import {snapshotProject,commitSnapshot,undoHistory} from "./history.js?v=0.8.21.7-20260829-1415";
import {createWall,nextWallName} from "./walls.js?v=0.8.21.7-20260829-1415";

const REF_MODES=new Set(["parallel","perpendicular","angle"]);
const TOOL_NAMES={line:"LIJN",polyline:"POLYLIJN",shape:"VORM",stake:"UITZETTEN",wall:"MUUR"};

function copyPlane(p){
  if(!p)return null;
  return {origin:p.origin.clone(),normal:p.normal.clone(),u:p.u.clone(),v:p.v.clone()};
}
function makePlane(origin,normal,preferred=null){
  const T=S.THREE,n=(normal?.clone?.()||new T.Vector3(0,1,0)).normalize();
  let u=(preferred?.clone?.()||new T.Vector3(1,0,0));
  u.sub(n.clone().multiplyScalar(u.dot(n)));
  if(u.lengthSq()<1e-8){
    u=Math.abs(n.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0);
    u.sub(n.clone().multiplyScalar(u.dot(n)));
  }
  u.normalize();const v=n.clone().cross(u).normalize();
  return {origin:origin.clone(),normal:n,u,v};
}
function worldHorizontalPlane(origin){
  return makePlane(origin,new S.THREE.Vector3(0,1,0),new S.THREE.Vector3(1,0,0));
}
function planeFromPoint(p,rayDir=null){
  const n=p.surfaceNormal?.clone?.()||new S.THREE.Vector3(0,1,0);
  return makePlane(p.position,n,rayDir);
}
function linePlaneVector(line,plane){
  if(!line||!plane)return null;
  const a=getPoint(line.startId),b=getPoint(line.endId);if(!a||!b)return null;
  const d=b.position.clone().sub(a.position);
  d.sub(plane.normal.clone().multiplyScalar(d.dot(plane.normal)));
  return d.lengthSq()>1e-8?d.normalize():null;
}
function rotateInPlane(vec,plane,deg){
  return vec.clone().applyAxisAngle(plane.normal,S.THREE.MathUtils.degToRad(deg)).normalize();
}
function intersectRayPlane(ray,plane){
  if(!ray||!plane)return null;
  const den=plane.normal.dot(ray.dir);if(Math.abs(den)<.01)return null;
  const t=plane.normal.dot(plane.origin.clone().sub(ray.origin))/den;
  if(t<=0||t>50)return null;
  return ray.origin.clone().add(ray.dir.clone().multiplyScalar(t));
}
function closestPointVertical(ray,origin){
  if(!ray)return null;
  const T=S.THREE,v=new T.Vector3(0,1,0),w0=ray.origin.clone().sub(origin);
  const a=ray.dir.dot(ray.dir),b=ray.dir.dot(v),c=1,d=ray.dir.dot(w0),e=v.dot(w0);
  const den=a*c-b*b;if(Math.abs(den)<1e-8)return null;
  const t=(b*e-c*d)/den,s=(a*e-b*d)/den;
  if(t<=0)return null;
  return origin.clone().add(v.multiplyScalar(s));
}
function requireReference(plane){
  const line=getLine(S.tool.referenceLineId);
  if(!line)throw new Error("Kies eerst een referentielijn.");
  const dir=linePlaneVector(line,plane);
  if(!dir)throw new Error("Referentielijn ligt niet bruikbaar in het actieve tekenvlak.");
  return dir;
}
function directionForExact(ray,hit=null){
  const active=getActivePoint();if(!active)throw new Error("Geen actief vertrekpunt.");
  const kind=S.tool.constraint;
  const activePlane=S.tool.activePlane||planeFromPoint(active,ray?.dir);
  let dir=null;

  // Belangrijk: bij een exacte afstand moet de richting vertrekken vanuit het
  // actieve punt naar de plek waar de gebruiker mikt. De oude implementatie
  // gebruikte rechtstreeks de camera-ray als richting. Daardoor liep de
  // exacte lijn parallel aan de kijkrichting, in plaats van van het actieve
  // punt naar het vizier te wijzen (vooral zichtbaar bij Horizontaal).
  if(kind==="free"){
    const aim=S.tool.kind==="shape"
      ? intersectRayPlane(ray,activePlane)
      : (hit?.clone?.()||intersectRayPlane(ray,activePlane));
    if(aim)dir=aim.clone().sub(active.position);
    else dir=ray?.dir?.clone?.()||activePlane.u.clone();
    if(S.tool.kind==="shape"){
      dir.sub(activePlane.normal.clone().multiplyScalar(dir.dot(activePlane.normal)));
    }
  }else if(kind==="horizontal"){
    const aim=intersectRayPlane(ray,worldHorizontalPlane(active.position));
    if(!aim)throw new Error("Richt het vizier duidelijker naar het horizontale vlak vanaf het vertrekpunt.");
    dir=aim.sub(active.position);
    dir.y=0;
  }else if(kind==="vertical"){
    // Exact verticaal moet stabiel zijn: de camera bepaalt niet continu de
    // eindpositie. De gekozen richting (omhoog/omlaag) bepaalt uitsluitend
    // het teken; de ingestelde afstand bepaalt de positie.
    dir=new S.THREE.Vector3(0,S.tool.side>=0?1:-1,0);
  }else if(kind==="surface"){
    const aim=intersectRayPlane(ray,activePlane);
    if(!aim)throw new Error("Richt het vizier duidelijker naar het actieve tekenvlak.");
    dir=aim.sub(active.position);
    dir.sub(activePlane.normal.clone().multiplyScalar(dir.dot(activePlane.normal)));
  }else if(kind==="parallel"){
    dir=requireReference(activePlane).multiplyScalar(S.tool.side);
  }else if(kind==="perpendicular"){
    const ref=requireReference(activePlane);
    dir=activePlane.normal.clone().cross(ref).normalize().multiplyScalar(S.tool.side);
  }else if(kind==="angle"){
    const ref=requireReference(activePlane);
    dir=rotateInPlane(ref,activePlane,S.tool.angleDeg*S.tool.side);
  }
  if(!dir||dir.lengthSq()<1e-8)throw new Error("Kon geen geldige richting bepalen. Richt het vizier verder van het vertrekpunt.");
  return dir.normalize();
}
function manualCandidate(active,hit,ray){
  const kind=S.tool.constraint;
  const activePlane=S.tool.activePlane||planeFromPoint(active,ray?.dir);
  if(kind==="free"){
    if(S.tool.kind==="shape")return intersectRayPlane(ray,activePlane);
    return hit?.clone?.()||intersectRayPlane(ray,activePlane);
  }
  if(kind==="horizontal"){
    return intersectRayPlane(ray,worldHorizontalPlane(active.position));
  }
  if(kind==="vertical"){
    const q=closestPointVertical(ray,active.position);if(!q)return null;
    const dy=Math.abs(q.y-active.position.y);
    return active.position.clone().add(new S.THREE.Vector3(0,(S.tool.side>=0?1:-1)*dy,0));
  }
  if(kind==="surface"){
    return intersectRayPlane(ray,activePlane);
  }
  let raw=intersectRayPlane(ray,activePlane)||hit?.clone?.();
  if(!raw)return null;
  let dir;
  if(kind==="parallel")dir=requireReference(activePlane).multiplyScalar(S.tool.side);
  else if(kind==="perpendicular"){
    const ref=requireReference(activePlane);dir=activePlane.normal.clone().cross(ref).normalize().multiplyScalar(S.tool.side);
  }else if(kind==="angle"){
    const ref=requireReference(activePlane);dir=rotateInPlane(ref,activePlane,S.tool.angleDeg*S.tool.side);
  }
  const delta=raw.clone().sub(active.position);
  // De gekozen zijde/richting moet ook in AUTO een werkelijk effect hebben.
  // Voorheen veranderde `side` zowel dir als de projectiescalar van teken,
  // waardoor beide tekens elkaar ophieven en links/rechts identiek waren.
  const scalar=Math.abs(delta.dot(dir));
  return active.position.clone().add(dir.clone().multiplyScalar(scalar));
}

function constraintExpectedDirection(active,rawPos){
  const kind=S.tool.constraint;
  if(kind==="free")return null;
  const plane=S.tool.activePlane||planeFromPoint(active);
  if(kind==="horizontal"){
    const d=rawPos.clone().sub(active.position);d.y=0;
    return d.lengthSq()>1e-10?d.normalize():null;
  }
  if(kind==="vertical")return new S.THREE.Vector3(0,rawPos.y>=active.position.y?1:-1,0);
  if(kind==="surface"){
    const d=rawPos.clone().sub(active.position);
    d.sub(plane.normal.clone().multiplyScalar(d.dot(plane.normal)));
    return d.lengthSq()>1e-10?d.normalize():null;
  }
  if(kind==="parallel")return requireReference(plane).multiplyScalar(S.tool.side).normalize();
  if(kind==="perpendicular"){
    const ref=requireReference(plane);
    return plane.normal.clone().cross(ref).normalize().multiplyScalar(S.tool.side);
  }
  if(kind==="angle"){
    const ref=requireReference(plane);
    return rotateInPlane(ref,plane,S.tool.angleDeg*S.tool.side).normalize();
  }
  return null;
}

function positionSatisfiesConstraint(pos,active,tolerance=.025){
  if(!active||S.tool.constraint==="free")return true;
  const kind=S.tool.constraint,plane=S.tool.activePlane||planeFromPoint(active);
  const d=pos.clone().sub(active.position);

  if(kind==="horizontal")return Math.abs(d.y)<=tolerance;
  if(kind==="vertical")return Math.hypot(d.x,d.z)<=tolerance;
  if(kind==="surface")return Math.abs(d.dot(plane.normal))<=tolerance;

  const expected=constraintExpectedDirection(active,pos);
  if(!expected||d.lengthSq()<1e-10)return false;
  const axial=expected.clone().multiplyScalar(d.dot(expected));
  const lateral=d.clone().sub(axial).length();
  return lateral<=tolerance;
}

function closestPointOnSegment(pos,a,b){
  const ab=b.clone().sub(a),den=ab.lengthSq();
  if(den<1e-12)return a.clone();
  const t=Math.max(0,Math.min(1,pos.clone().sub(a).dot(ab)/den));
  return a.clone().add(ab.multiplyScalar(t));
}


function closestPointsOnSegments3D(a0,a1,b0,b1){
  const T=S.THREE,u=a1.clone().sub(a0),v=b1.clone().sub(b0),w=a0.clone().sub(b0);
  const A=u.dot(u),B=u.dot(v),C=v.dot(v),D=u.dot(w),E=v.dot(w),den=A*C-B*B;
  if(A<1e-12||C<1e-12)return null;
  let s=den<1e-10?0:(B*E-C*D)/den,t=den<1e-10?E/C:(A*E-B*D)/den;
  s=Math.max(0,Math.min(1,s));t=Math.max(0,Math.min(1,t));
  const p=a0.clone().add(u.multiplyScalar(s)),q=b0.clone().add(v.multiplyScalar(t));
  return {p,q,s,t,distance:p.distanceTo(q),mid:p.clone().add(q).multiplyScalar(.5)};
}
function lineIntersections(pos,active,tol){
  const out=[];
  for(let i=0;i<S.lines.length;i++)for(let j=i+1;j<S.lines.length;j++){
    const l1=S.lines[i],l2=S.lines[j];
    if(l1.startId===l2.startId||l1.startId===l2.endId||l1.endId===l2.startId||l1.endId===l2.endId)continue;
    const a=getPoint(l1.startId),b=getPoint(l1.endId),c=getPoint(l2.startId),d=getPoint(l2.endId);if(!a||!b||!c||!d)continue;
    const hit=closestPointsOnSegments3D(a.position,b.position,c.position,d.position);if(!hit||hit.distance>.025||hit.mid.distanceTo(pos)>tol)continue;
    if(!positionSatisfiesConstraint(hit.mid,active))continue;
    out.push({type:"intersection",priority:1,distance:hit.mid.distanceTo(pos),position:hit.mid,lineId:l1.id,pointId:null,label:`Snijpunt ${l1.name} × ${l2.name}`});
  }
  return out;
}
function openingSnapOptions(pos,active,tol){
  const out=[];
  for(const o of S.openings){
    const wall=S.walls.find(w=>w.id===o.wallId);if(!wall?.localFrame)continue;
    const f=wall.localFrame,pts=[
      [o.x,o.bottom,"linksonder"],[o.x+o.width,o.bottom,"rechtsonder"],
      [o.x,o.bottom+o.height,"linksboven"],[o.x+o.width,o.bottom+o.height,"rechtsboven"],
      [o.x+o.width/2,o.bottom+o.height/2,"midden"]
    ];
    for(const [x,y,label] of pts){
      const q=f.start.clone().add(f.x.clone().multiplyScalar(x)).add(f.y.clone().multiplyScalar(y)).add(f.z.clone().multiplyScalar(f.sideOffset||0));
      const d=q.distanceTo(pos);if(d<=tol&&positionSatisfiesConstraint(q,active))out.push({type:"opening",priority:4,distance:d,position:q,lineId:wall.lineId,pointId:null,label:`${o.name} · ${label}`});
    }
  }
  return out;
}
function wallSnapOptions(pos,active,tol){
  const out=[];
  for(const w of S.walls){
    const l=getLine(w.lineId);if(!l)continue;const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)continue;
    const mid=a.position.clone().add(b.position).multiplyScalar(.5),d=mid.distanceTo(pos);
    if(d<=tol&&positionSatisfiesConstraint(mid,active))out.push({type:"wall",priority:5,distance:d,position:mid,lineId:l.id,pointId:null,label:`Midden muur ${w.name}`});
  }
  return out;
}
function candidateSnapOptions(pos,active){
  const options=[],pointTol=S.tool.snapTolerance||.08,lineTol=S.tool.snapLineTolerance||.06;
  if(["smart","points"].includes(S.tool.snapMode))for(const p of S.points){
    if(active&&p.id===active.id)continue;const dist=p.position.distanceTo(pos);
    if(dist<=pointTol&&positionSatisfiesConstraint(p.position,active))options.push({type:"point",priority:0,distance:dist,position:p.position.clone(),pointId:p.id,lineId:null,label:`Punt ${p.name}`});
  }
  if(S.tool.snapMode==="smart")options.push(...lineIntersections(pos,active,S.tool.snapIntersectionTolerance||.08));
  if(["smart","midpoints"].includes(S.tool.snapMode))for(const l of S.lines){
    const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)continue;const mid=a.position.clone().add(b.position).multiplyScalar(.5),dist=mid.distanceTo(pos);
    if(dist<=pointTol&&positionSatisfiesConstraint(mid,active))options.push({type:"midpoint",priority:2,distance:dist,position:mid,lineId:l.id,pointId:null,label:`Midden ${l.name}`});
  }
  if(["smart","lines"].includes(S.tool.snapMode))for(const l of S.lines){
    const a=getPoint(l.startId),b=getPoint(l.endId);if(!a||!b)continue;const q=closestPointOnSegment(pos,a.position,b.position),dist=q.distanceTo(pos);
    if(dist<=lineTol&&positionSatisfiesConstraint(q,active))options.push({type:"line",priority:3,distance:dist,position:q,lineId:l.id,pointId:null,label:`Op ${l.name}`});
  }
  if(S.tool.snapMode==="smart"){options.push(...openingSnapOptions(pos,active,S.tool.snapOpeningTolerance||.07));options.push(...wallSnapOptions(pos,active,pointTol));}
  return options.sort((x,y)=>x.priority-y.priority||x.distance-y.distance);
}

function snapCandidate(pos,active){
  if(!pos||S.tool.snapMode==="off")return {position:pos,snappedPointId:null,snappedLineId:null,snapType:null,snapLabel:""};

  // Exact-distance placement must remain exact. It may only reuse an existing point
  // if that point is effectively at the exact computed location (<= 5 mm).
  if(S.tool.placement==="metric"){
    let best=null,bestD=.005;
    for(const p of S.points){
      if(active&&p.id===active.id)continue;
      const d=p.position.distanceTo(pos);
      if(d<=bestD&&positionSatisfiesConstraint(p.position,active,.006)){best=p;bestD=d;}
    }
    return best
      ? {position:best.position.clone(),snappedPointId:best.id,snappedLineId:null,snapType:"point",snapLabel:`Punt ${best.name}`}
      : {position:pos,snappedPointId:null,snappedLineId:null,snapType:null,snapLabel:""};
  }

  const best=candidateSnapOptions(pos,active)[0];
  return best
    ? {position:best.position,snappedPointId:best.pointId,snappedLineId:best.lineId,snapType:best.type,snapLabel:best.label}
    : {position:pos,snappedPointId:null,snappedLineId:null,snapType:null,snapLabel:""};
}


function previewObjects(){
  if(S.preview.point&&S.preview.line)return;
  const T=S.THREE;
  const p=new T.Group();
  const sphere=new T.Mesh(new T.SphereGeometry(.018,16,10),new T.MeshBasicMaterial({color:0xffd166,transparent:true,opacity:.8}));
  const ring=new T.Mesh(new T.RingGeometry(.027,.034,32),new T.MeshBasicMaterial({color:0xffd166,side:T.DoubleSide,transparent:true,opacity:.85}));
  ring.rotation.x=-Math.PI/2;p.add(sphere,ring);S.scene.add(p);p.visible=false;
  const geo=new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3()]);
  const mat=new T.LineDashedMaterial({color:0xffd166,dashSize:.05,gapSize:.035,transparent:true,opacity:.9});
  const l=new T.Line(geo,mat);l.computeLineDistances();S.scene.add(l);l.visible=false;
  const label=document.createElement("div");label.className="previewLabel";label.style.display="none";$("lineLabels").appendChild(label);
  S.preview={point:p,line:l,label};
}
function updatePreviewVisual(){
  if(!S.THREE||!S.scene)return;
  previewObjects();
  const c=S.tool.candidate,active=getActivePoint();
  if(!c?.valid){
    S.preview.point.visible=false;S.preview.line.visible=false;S.preview.label.style.display="none";return;
  }
  S.preview.point.visible=true;S.preview.point.position.copy(c.position);
  if(active){
    const pos=S.preview.line.geometry.getAttribute("position");
    pos.setXYZ(0,active.position.x,active.position.y,active.position.z);
    pos.setXYZ(1,c.position.x,c.position.y,c.position.z);pos.needsUpdate=true;
    S.preview.line.computeLineDistances();S.preview.line.visible=true;
    S.preview.label.textContent=`${fmt(active.position.distanceTo(c.position))} · ${constraintLabel()}${c.snapLabel?` · ${c.snapLabel}`:""}`;
  }else{
    S.preview.line.visible=false;S.preview.label.textContent="Punt A";
  }
}
export function updatePreviewScreen(){
  const c=S.tool.candidate;if(!S.preview.label||!c?.valid||!S.renderer||!S.camera){if(S.preview.label)S.preview.label.style.display="none";return;}
  const q=c.position.clone().project(S.renderer.xr.getCamera(S.camera));
  if(q.z<-1||q.z>1||Math.abs(q.x)>1.2||Math.abs(q.y)>1.2){S.preview.label.style.display="none";return;}
  S.preview.label.style.display="block";S.preview.label.style.left=(q.x*.5+.5)*innerWidth+"px";S.preview.label.style.top=(-q.y*.5+.5)*innerHeight-34+"px";
}
function hidePreview(){
  if(S.preview.point)S.preview.point.visible=false;
  if(S.preview.line)S.preview.line.visible=false;
  if(S.preview.label)S.preview.label.style.display="none";
}
function resetSession(keepSettings=true){
  S.tool.status="idle";S.tool.activePointId=null;S.tool.firstPointId=null;S.tool.pointIds=[];S.tool.lineIds=[];S.tool.transactions=[];S.tool.activePlane=null;S.tool.candidate=null;
  if(!keepSettings){
    S.tool.placement="manual";S.tool.distanceM=1;S.tool.constraint="free";S.tool.referenceLineId=null;S.tool.angleDeg=45;S.tool.side=1;
  }
  hidePreview();
}
export function toolLabel(){return TOOL_NAMES[S.tool.kind]||"TEKENEN";}
export function constraintLabel(){
  return ({free:"Vrij",horizontal:"Horizontaal",vertical:"Verticaal",surface:"Op oppervlak",parallel:"Parallel",perpendicular:"Loodrecht",angle:"Eigen hoek"})[S.tool.constraint]||"Vrij";
}
export function getActivePoint(){return getPoint(S.tool.activePointId);}
export function startTool(kind,{startPointId=null}={}){
  if(!TOOL_NAMES[kind])throw new Error("Onbekend tekengereedschap.");
  resetSession(true);S.tool.kind=kind;S.tool.status="drawing";
  if(startPointId){
    const p=getPoint(startPointId);if(!p)throw new Error("Vertrekpunt niet gevonden.");
    S.tool.activePointId=p.id;S.tool.firstPointId=p.id;S.tool.pointIds=[p.id];S.tool.activePlane=planeFromPoint(p);
  }
  document.dispatchEvent(new CustomEvent("measurear:tool-changed"));
  return kind;
}
export function cancelTool(){
  if(S.tool.kind==="polyline"&&S.tool.lineIds.length)createContour(S.tool.pointIds,S.tool.lineIds,{closed:false,kind:"polyline"});
  const old=S.tool.kind;resetSession(true);S.tool.kind=null;document.dispatchEvent(new CustomEvent("measurear:tool-changed"));return old;
}
export function setPlacement(mode){S.tool.placement=mode==="metric"?"metric":"manual";document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setDistance(value,unit="cm"){
  const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new Error("Geef een geldige afstand.");
  S.tool.distanceM=unit==="m"?n:n/100;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));
}
export function setConstraint(mode){
  const valid=new Set(["free","horizontal","vertical","surface","parallel","perpendicular","angle"]);
  S.tool.constraint=valid.has(mode)?mode:"free";
  document.dispatchEvent(new CustomEvent("measurear:tool-settings"));
}
export function setAngle(deg){const n=Number(deg);if(!Number.isFinite(n))throw new Error("Ongeldige hoek.");S.tool.angleDeg=n;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function flipSide(){S.tool.side*=-1;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setReferenceLine(id){S.tool.referenceLineId=id||null;document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function setSnapMode(mode){const valid=new Set(["smart","points","midpoints","lines","off"]);S.tool.snapMode=valid.has(mode)?mode:"smart";document.dispatchEvent(new CustomEvent("measurear:tool-settings"));}
export function referenceRequired(){return REF_MODES.has(S.tool.constraint);}
export function isCaptureAllowed(){return S.tool.kind&&S.tool.status==="drawing"&&Boolean(S.tool.candidate?.valid);}

export function updateCandidate({hit=null,hitNormal=null,ray=null}={}){
  S.tool.hoverSurfaceNormal=hitNormal?.clone?.()||S.tool.hoverSurfaceNormal;
  if(!S.tool.kind||S.tool.status!=="drawing"){S.tool.candidate=null;hidePreview();return;}
  const active=getActivePoint();
  try{
    let pos=null,planeNormal=hitNormal?.clone?.()||null;
    if(!active){
      if(!hit)throw new Error("Zoek eerst een herkenbaar oppervlak voor punt A.");
      pos=hit.clone();
    }else if(S.tool.placement==="metric"){
      const dir=directionForExact(ray,hit);pos=active.position.clone().add(dir.multiplyScalar(S.tool.distanceM));
      planeNormal=S.tool.activePlane?.normal?.clone?.()||active.surfaceNormal?.clone?.()||null;
    }else{
      pos=manualCandidate(active,hit,ray);
      planeNormal=S.tool.activePlane?.normal?.clone?.()||active.surfaceNormal?.clone?.()||hitNormal?.clone?.()||null;
      if(!pos)throw new Error("Geen geldig kandidaatpunt in deze richting.");
    }
    const snapped=snapCandidate(pos,active);
    if(active&&!positionSatisfiesConstraint(snapped.position,active,.006))throw new Error("Interne controle: kandidaat voldoet niet aan de gekozen richting.");
    if(active&&S.tool.placement==="metric"&&Math.abs(active.position.distanceTo(snapped.position)-S.tool.distanceM)>.006)throw new Error("Interne controle: kandidaat wijkt af van de ingestelde afstand.");
    S.tool.candidate={valid:true,position:snapped.position,snappedPointId:snapped.snappedPointId,snappedLineId:snapped.snappedLineId,snapType:snapped.snapType,snapLabel:snapped.snapLabel,surfaceNormal:planeNormal,reason:""};
  }catch(err){
    S.tool.candidate={valid:false,position:null,snappedPointId:null,snappedLineId:null,snapType:null,snapLabel:"",surfaceNormal:null,reason:err.message||String(err)};
  }
  updatePreviewVisual();
  document.dispatchEvent(new CustomEvent("measurear:candidate-changed"));
}

function transaction(tx){
  S.tool.transactions.push(tx);
}
export function confirmCandidate(){
  if(S.diagnostics.confirmBusy)throw new Error("Punt wordt al bevestigd.");
  S.diagnostics.confirmBusy=true;
  const before=snapshotProject();
  try{
    if(!isCaptureAllowed())throw new Error(S.tool.candidate?.reason||"Geen geldig punt om te plaatsen.");
    const c=S.tool.candidate,active=getActivePoint();

    if(!active){
      let p,created=false;
      if(c.snappedPointId)p=getPoint(c.snappedPointId);
      else{p=createPoint(c.position,{surfaceNormal:c.surfaceNormal||S.tool.hoverSurfaceNormal});created=true;}
      S.tool.activePointId=p.id;S.tool.firstPointId=p.id;S.tool.pointIds=[p.id];S.tool.activePlane=planeFromPoint(p);
      transaction({type:"start",tool:S.tool.kind,pointId:p.id,createdPoint:created});
      S.tool.candidate=null;hidePreview();
      commitSnapshot(`Punt ${p.name} plaatsen`,before);
      document.dispatchEvent(new CustomEvent("measurear:reset-tracking"));
      return {type:"point",point:p};
    }

    let end,created=false;
    if(c.snappedPointId)end=getPoint(c.snappedPointId);
    else{end=createPoint(c.position,{color:0xffd166,surfaceNormal:c.surfaceNormal});created=true;}
    if(!end||end.id===active.id)throw new Error("Het eindpunt valt samen met het vertrekpunt.");

    let line;
    try{
      line=createLine(active,end,S.tool.kind==="wall"?{ownerType:"wallbase",labelsVisible:false,color:"#9aa0a6"}:{});
    }
    catch(err){
      if(created&&!S.lines.some(l=>l.startId===end.id||l.endId===end.id))deletePointRaw(end.id);
      throw err;
    }

    S.tool.lineIds.push(line.id);
    if(!S.tool.pointIds.includes(end.id))S.tool.pointIds.push(end.id);
    transaction({type:"segment",tool:S.tool.kind,lineId:line.id,createdPoint:created?end.id:null,previousActiveId:active.id,endId:end.id});
    let wall=null;
    if(S.tool.kind==="wall"){
      wall=createWall(line,{
        name:nextWallName(S.wallTool.namePrefix),height:S.wallTool.height,thickness:S.wallTool.thickness,
        side:S.wallTool.side,orientation:S.wallTool.orientation,angle:S.wallTool.angle,
        color:S.wallTool.color,opacity:S.wallTool.opacity
      });
    }
    S.tool.activePointId=end.id;
    if(end.surfaceNormal&&S.tool.kind!=="shape")S.tool.activePlane=planeFromPoint(end);
    S.tool.candidate=null;hidePreview();
    if(S.tool.kind==="line"||S.tool.kind==="stake")S.tool.status="complete";
    commitSnapshot(S.tool.kind==="wall"?`Muur ${wall?.name||line.name} tekenen`:`Lijn ${line.name} plaatsen`,before);
    document.dispatchEvent(new CustomEvent("measurear:reset-tracking"));
    return {type:"segment",point:end,line,wall,complete:S.tool.status==="complete"};
  }finally{
    S.diagnostics.confirmBusy=false;
  }
}

export function undoToolStep(){
  return undoHistory();
}

export function finishTool(){
  const before=snapshotProject();
  if(S.tool.kind==="polyline"){
    if(!S.tool.lineIds.length)throw new Error("Teken eerst minstens één segment.");
    const contour=createContour(S.tool.pointIds,S.tool.lineIds,{closed:false,kind:"polyline"});
    S.tool.status="complete";S.tool.transactions=[];hidePreview();
    commitSnapshot("Doorlopende lijn voltooien",before);
    return {type:"polyline",contour};
  }
  if(S.tool.kind==="shape"){
    if(S.tool.pointIds.length<3)throw new Error("Een vorm vereist minstens 3 punten.");
    analyzeShapePoints(S.tool.pointIds);
    const first=getPoint(S.tool.firstPointId),last=getActivePoint();if(!first||!last)throw new Error("Vormpunten ontbreken.");
    if(last.id!==first.id){
      const existing=S.lines.find(l=>(l.startId===last.id&&l.endId===first.id)||(l.startId===first.id&&l.endId===last.id));
      if(existing){
        ensureLineRendered(existing);
        if(!S.tool.lineIds.includes(existing.id))S.tool.lineIds.push(existing.id);
      }else{
        // A shape is geometrically complete only when its final edge exists as
        // a normal, visible line. For A-B-C this explicitly creates C-A.
        const closing=createLine(last,first,{ownerType:"shapeclose"});
        ensureLineRendered(closing);
        S.tool.lineIds.push(closing.id);
        transaction({type:"closing",tool:"shape",lineId:closing.id,previousActiveId:last.id,endId:first.id});
      }
    }
    const contour=createContour(S.tool.pointIds,S.tool.lineIds,{closed:true,kind:"shape"});
    S.pendingContourId=contour.id;S.tool.status="complete";S.tool.transactions=[];hidePreview();
    commitSnapshot("Vormcontour sluiten",before);
    return {type:"shape",contour};
  }
  if(S.tool.kind==="wall"){
    if(!S.tool.lineIds.length)throw new Error("Teken eerst minstens één muursegment.");
    const contour=createContour(S.tool.pointIds,S.tool.lineIds,{closed:false,kind:"wallpath"});
    S.tool.status="complete";S.tool.transactions=[];hidePreview();
    commitSnapshot("Muurpad voltooien",before);
    return {type:"wall",contour};
  }
  throw new Error("Dit gereedschap heeft geen Voltooien-functie.");
}

export function resetDrawingCore(){
  resetSession(false);S.tool.kind=null;S.history.undo.length=0;S.history.redo.length=0;document.dispatchEvent(new CustomEvent("measurear:tool-changed"));
}
