
import {S,getPoint,getLine} from "./state.js?v=0.8.8.2-20260822-1625";
import {dispose} from "./geometry.js?v=0.8.8.2-20260822-1625";

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
  const start=a.position.clone();
  const axis=b.position.clone().sub(a.position);
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
  const t=wall.thickness, h=wall.height;

  const geo=new T.BoxGeometry(f.length,h,t);
  const mat=new T.MeshBasicMaterial({
    color:wall.color,
    transparent:true,
    opacity:wall.opacity,
    side:T.DoubleSide,
    depthWrite:false
  });
  const mesh=new T.Mesh(geo,mat);

  const basis=new T.Matrix4().makeBasis(f.x,f.y,f.z);
  mesh.quaternion.setFromRotationMatrix(basis);

  let sideOffset=0;
  if(wall.side==="left") sideOffset=t/2;
  if(wall.side==="right") sideOffset=-t/2;

  mesh.position.copy(f.start)
    .add(f.x.clone().multiplyScalar(f.length/2))
    .add(f.y.clone().multiplyScalar(h/2))
    .add(f.z.clone().multiplyScalar(sideOffset));

  S.scene.add(mesh);
  wall.mesh=mesh;
}

export function createWall(line,opts){
  const name=cleanName(opts.name);
  if(!name)throw new Error("Naam is verplicht.");
  if(wallNameExists(name))throw new Error("Deze muurnaam bestaat al.");
  const height=Number(opts.height),thickness=Number(opts.thickness),opacity=Number(opts.opacity);
  if(!Number.isFinite(height)||height<=0)throw new Error("Ongeldige hoogte.");
  if(!Number.isFinite(thickness)||thickness<=0)throw new Error("Ongeldige dikte.");
  if(!Number.isFinite(opacity)||opacity<=0||opacity>1)throw new Error("Ongeldige transparantie.");

  const wall={
    id:"w"+crypto.randomUUID(),
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
  S.undo.push({type:"createdWall",wallId:wall.id});
  return wall;
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
  S.walls.splice(i,1);
  if(S.selectedWallId===id)S.selectedWallId=null;
}

export function clearWalls(){
  for(const w of S.walls)if(w.mesh)dispose(w.mesh);
  S.walls.length=0;
}
