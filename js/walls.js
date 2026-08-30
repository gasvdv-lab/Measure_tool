
import {S,getPoint,getLine} from "./state.js?v=0.8.36.2-20260830-direction-angle-repair";
import {dispose,renderPosition} from "./geometry.js?v=0.8.36.2-20260830-direction-angle-repair";

function cleanName(name){return String(name||"").trim().replace(/\s+/g," ");}
export function wallNameExists(name,excludeId=null){
  const key=cleanName(name).toLocaleLowerCase("nl");
  return S.walls.some(w=>w.id!==excludeId && w.name.toLocaleLowerCase("nl")===key);
}
export function getWall(id){return S.walls.find(w=>w.id===id)||null;}
export function wallsUsingLine(lineId){return S.walls.filter(w=>w.lineId===lineId);}

function frameFromLine(line){
  const a=getPoint(line.startId),b=getPoint(line.endId);
  if(!a||!b)throw new Error("Basislijn is ongeldig.");
  const T=S.THREE;
  const start=renderPosition(a).clone();
  const axis=renderPosition(b).clone().sub(renderPosition(a));
  const length=axis.length();
  if(length<1e-5)throw new Error("Basislijn is te kort.");
  const x=axis.clone().normalize();
  const worldUp=new T.Vector3(0,1,0);

  // Stable wall normal. If line is near vertical, choose a fallback.
  let z=new T.Vector3().crossVectors(x,worldUp);
  if(z.lengthSq()<1e-8)z.set(0,0,1);
  z.normalize();
  let y=new T.Vector3().crossVectors(z,x).normalize();

  return {start,x,y,z,length};
}

function orientationFrame(line,orientation,angleDeg){
  const T=S.THREE;
  const base=frameFromLine(line);
  if(orientation==="vertical") return base;

  if(orientation==="perpendicular"){
    // Vertical wall rising from the line; geometrically perpendicular to the ground plane.
    return base;
  }

  if(orientation==="angle"){
    const r=T.MathUtils.degToRad(Number(angleDeg)||90);
    // Rotate wall's local up-axis around the line itself.
    const q=new T.Quaternion().setFromAxisAngle(base.x,r-Math.PI/2);
    base.y.applyQuaternion(q).normalize();
    base.z.applyQuaternion(q).normalize();
    return base;
  }

  return base;
}

function buildMesh(wall){
  const line=getLine(wall.lineId);
  if(!line)throw new Error("Basislijn ontbreekt.");
  const T=S.THREE;
  const f=orientationFrame(line,wall.orientation,wall.angle);
  const t=wall.thickness,h=wall.height;
  const sideOffset=wall.side==="left"?t/2:wall.side==="right"?-t/2:0;
  const openings=S.openings.filter(o=>o.wallId===wall.id).sort((a,b)=>a.x-b.x);

  const group=new T.Group();
  group.userData={...(group.userData||{}),measureArType:"wall",wallId:wall.id};
  const mat=new T.MeshBasicMaterial({
    color:wall.color,transparent:true,opacity:wall.opacity,
    side:T.DoubleSide,depthWrite:false
  });

  const addBox=(x0,x1,y0,y1)=>{
    const w=x1-x0,hh=y1-y0;
    if(w<=1e-5||hh<=1e-5)return;
    const geo=new T.BoxGeometry(w,hh,t);
    const mesh=new T.Mesh(geo,mat.clone());
    const basis=new T.Matrix4().makeBasis(f.x,f.y,f.z);
    mesh.quaternion.setFromRotationMatrix(basis);
    mesh.position.copy(f.start)
      .add(f.x.clone().multiplyScalar((x0+x1)/2))
      .add(f.y.clone().multiplyScalar((y0+y1)/2))
      .add(f.z.clone().multiplyScalar(sideOffset));
    group.add(mesh);
  };

  if(!openings.length){
    addBox(0,f.length,0,h);
  }else{
    const cuts=[0,f.length];
    for(const o of openings){cuts.push(o.x,o.x+o.width);}
    const xs=[...new Set(cuts.map(x=>Math.max(0,Math.min(f.length,x)).toFixed(6)))].map(Number).sort((a,b)=>a-b);
    for(let i=0;i<xs.length-1;i++){
      const x0=xs[i],x1=xs[i+1],mid=(x0+x1)/2;
      const active=openings.filter(o=>mid>o.x+1e-8&&mid<o.x+o.width-1e-8);
      if(!active.length){addBox(x0,x1,0,h);continue;}
      const ys=[0,h];
      for(const o of active){ys.push(o.bottom,o.bottom+o.height);}
      const sorted=[...new Set(ys.map(y=>Math.max(0,Math.min(h,y)).toFixed(6)))].map(Number).sort((a,b)=>a-b);
      for(let j=0;j<sorted.length-1;j++){
        const y0=sorted[j],y1=sorted[j+1],ym=(y0+y1)/2;
        const blocked=active.some(o=>ym>o.bottom+1e-8&&ym<o.bottom+o.height-1e-8);
        if(!blocked)addBox(x0,x1,y0,y1);
      }
    }
  }

  S.scene.add(group);
  wall.mesh=group;
  wall.localFrame={
    length:f.length,
    start:f.start.clone(),x:f.x.clone(),y:f.y.clone(),z:f.z.clone(),
    sideOffset
  };
}


export function nextWallName(prefix="Muur"){
  const base=cleanName(prefix)||"Muur";
  let i=1,name=`${base} ${i}`;
  while(wallNameExists(name)){i++;name=`${base} ${i}`;}
  return name;
}

export function createWall(line,opts){
  const name=cleanName(opts.name)||nextWallName(opts.namePrefix||"Muur");
  if(wallNameExists(name))throw new Error("Deze muurnaam bestaat al.");
  const height=Number(opts.height),thickness=Number(opts.thickness),opacity=Number(opts.opacity);
  if(!Number.isFinite(height)||height<=0)throw new Error("Ongeldige hoogte.");
  if(!Number.isFinite(thickness)||thickness<=0)throw new Error("Ongeldige dikte.");
  if(!Number.isFinite(opacity)||opacity<=0||opacity>1)throw new Error("Ongeldige transparantie.");

  const wall={
    id:opts.id||"w"+crypto.randomUUID(),
    name,
    lineId:line.id,
    height,
    thickness,
    side:opts.side||"center",
    orientation:opts.orientation||"vertical",
    angle:Number(opts.angle)||90,
    color:opts.color||"#d7d2c8",
    opacity,
    visible:true,
    mesh:null
  };
  buildMesh(wall);
  S.walls.push(wall);
  if(opts.visible===false){wall.visible=false;if(wall.mesh)wall.mesh.visible=false;}
  return wall;
}



function cleanOpeningName(name){return String(name||"").trim().replace(/\s+/g," ");}
export function getOpening(id){return S.openings.find(o=>o.id===id)||null;}
export function openingsForWall(wallId){return S.openings.filter(o=>o.wallId===wallId);}
export function openingNameExists(name,excludeId=null){
  const key=cleanOpeningName(name).toLocaleLowerCase("nl");
  return S.openings.some(o=>o.id!==excludeId&&o.name.toLocaleLowerCase("nl")===key);
}
export function nextOpeningName(type="opening"){
  const base=type==="door"?"Deur":type==="window"?"Raam":"Opening";
  let i=1,name=`${base} ${i}`;while(openingNameExists(name)){i++;name=`${base} ${i}`;}return name;
}
function rectsOverlap(a,b,margin=.001){
  return a.x < b.x+b.width-margin && a.x+a.width > b.x+margin &&
         a.bottom < b.bottom+b.height-margin && a.bottom+a.height > b.bottom+margin;
}
export function validateOpening(wall,opts,excludeId=null){
  if(!wall)throw new Error("Muur ontbreekt.");
  const line=getLine(wall.lineId);if(!line)throw new Error("Basislijn ontbreekt.");
  const a=getPoint(line.startId),b=getPoint(line.endId);if(!a||!b)throw new Error("Basislijnpunten ontbreken.");
  const length=a.position.distanceTo(b.position);
  const x=Number(opts.x),bottom=Number(opts.bottom),width=Number(opts.width),height=Number(opts.height);
  if(![x,bottom,width,height].every(Number.isFinite))throw new Error("Opening heeft ongeldige maten.");
  if(width<=.01||height<=.01)throw new Error("Opening moet breder en hoger dan 1 cm zijn.");
  if(x<0||bottom<0)throw new Error("Opening mag niet vóór/buiten de muur starten.");
  if(x+width>length+.0005)throw new Error(`Opening steekt voorbij het einde van de muur (${length.toFixed(2)} m).`);
  if(bottom+height>wall.height+.0005)throw new Error(`Opening steekt boven de muur (${wall.height.toFixed(2)} m).`);
  const probe={x,bottom,width,height};
  for(const o of openingsForWall(wall.id)){
    if(o.id===excludeId)continue;
    if(rectsOverlap(probe,o))throw new Error(`Opening overlapt met ${o.name}.`);
  }
  return {x,bottom,width,height,length};
}
export function createOpening(wall,opts={}){
  const type=["door","window","free"].includes(opts.type)?opts.type:"free";
  const name=cleanOpeningName(opts.name)||nextOpeningName(type);
  if(openingNameExists(name))throw new Error("Deze openingnaam bestaat al.");
  const v=validateOpening(wall,opts);
  const o={id:opts.id||"o"+crypto.randomUUID(),name,wallId:wall.id,type,x:v.x,bottom:v.bottom,width:v.width,height:v.height};
  S.openings.push(o);rebuildWall(wall);return o;
}
export function updateOpening(opening,opts={}){
  if(!opening)throw new Error("Opening ontbreekt.");
  const wall=S.walls.find(w=>w.id===opening.wallId);if(!wall)throw new Error("Muur van opening ontbreekt.");
  const name=cleanOpeningName(opts.name??opening.name);if(!name)throw new Error("Naam is verplicht.");
  if(openingNameExists(name,opening.id))throw new Error("Deze openingnaam bestaat al.");
  const v=validateOpening(wall,{
    x:opts.x??opening.x,bottom:opts.bottom??opening.bottom,width:opts.width??opening.width,height:opts.height??opening.height
  },opening.id);
  opening.name=name;opening.type=["door","window","free"].includes(opts.type)?opts.type:opening.type;
  opening.x=v.x;opening.bottom=v.bottom;opening.width=v.width;opening.height=v.height;
  rebuildWall(wall);return opening;
}
export function deleteOpening(id){
  const i=S.openings.findIndex(o=>o.id===id);if(i<0)return;
  const wallId=S.openings[i].wallId;S.openings.splice(i,1);
  if(S.selectedOpeningId===id)S.selectedOpeningId=null;
  const wall=S.walls.find(w=>w.id===wallId);if(wall)rebuildWall(wall);
}

export function updateWall(wall,opts={}){
  if(!wall)throw new Error("Muur ontbreekt.");
  const name=cleanName(opts.name??wall.name);
  if(!name)throw new Error("Naam is verplicht.");
  if(wallNameExists(name,wall.id))throw new Error("Deze muurnaam bestaat al.");
  const height=Number(opts.height??wall.height),thickness=Number(opts.thickness??wall.thickness),opacity=Number(opts.opacity??wall.opacity);
  if(!Number.isFinite(height)||height<=0)throw new Error("Ongeldige hoogte.");
  if(!Number.isFinite(thickness)||thickness<=0)throw new Error("Ongeldige dikte.");
  if(!Number.isFinite(opacity)||opacity<=0||opacity>1)throw new Error("Ongeldige transparantie.");
  wall.name=name;wall.height=height;wall.thickness=thickness;
  wall.side=opts.side??wall.side;wall.orientation=opts.orientation??wall.orientation;
  wall.angle=Number(opts.angle??wall.angle)||90;wall.color=opts.color??wall.color;wall.opacity=opacity;
  rebuildWall(wall);return wall;
}

export function rebuildWall(wall){
  if(wall.mesh)dispose(wall.mesh);
  buildMesh(wall);
  wall.mesh.visible=wall.visible!==false;
}

export function toggleWall(id){
  const w=getWall(id);if(!w)return;
  w.visible=!w.visible;
  if(w.mesh)w.mesh.visible=w.visible;
}

export function deleteWall(id){
  const i=S.walls.findIndex(w=>w.id===id);if(i<0)return;
  if(S.walls[i].mesh)dispose(S.walls[i].mesh);
  S.openings=S.openings.filter(o=>o.wallId!==id);
  S.walls.splice(i,1);
  if(S.selectedWallId===id)S.selectedWallId=null;
  if(S.selectedOpeningId&&!S.openings.some(o=>o.id===S.selectedOpeningId))S.selectedOpeningId=null;
}


export function syncWorldLockedWalls(){
  // Rebuild only when the anchored base line changed enough to matter.
  for(const wall of S.walls){
    const line=getLine(wall.lineId),a=line&&getPoint(line.startId),b=line&&getPoint(line.endId);if(!a||!b)continue;
    const pa=renderPosition(a),pb=renderPosition(b);
    const key=[pa.x,pa.y,pa.z,pb.x,pb.y,pb.z].map(v=>Math.round(v*2000)/2000).join(",");
    if(wall._worldLockKey===key)continue;
    wall._worldLockKey=key;rebuildWall(wall);
  }
}
export function clearWalls(){
  for(const w of S.walls)if(w.mesh)dispose(w.mesh);
  S.openings.length=0;S.walls.length=0;S.selectedOpeningId=null;
}
