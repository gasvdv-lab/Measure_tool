import {S} from "./state.js?v=0.8.37.2-20260830-cad-placement-repair";

function nowIso(){return new Date().toISOString();}
function normDeg(v){return ((v%360)+360)%360;}
function angleDiff(a,b){let d=normDeg(a)-normDeg(b);if(d>180)d-=360;if(d<-180)d+=360;return d;}
function toRad(v){return v*Math.PI/180;}

export function distanceMeters(a,b){
  const R=6371008.8, p1=toRad(a.lat),p2=toRad(b.lat),dp=toRad(b.lat-a.lat),dl=toRad(b.lon-a.lon);
  const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}
export function bearingDegrees(a,b){
  const p1=toRad(a.lat),p2=toRad(b.lat),dl=toRad(b.lon-a.lon);
  const y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return normDeg(Math.atan2(y,x)*180/Math.PI);
}
function geoOnce(){
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error("Geolocatie is niet beschikbaar."));return;}
    navigator.geolocation.getCurrentPosition(pos=>resolve({
      lat:pos.coords.latitude,lon:pos.coords.longitude,altitude:Number.isFinite(pos.coords.altitude)?pos.coords.altitude:null,
      accuracy:Number.isFinite(pos.coords.accuracy)?pos.coords.accuracy:null,capturedAt:nowIso()
    }),err=>reject(new Error("Locatie kon niet worden bepaald: "+err.message)),{enableHighAccuracy:true,maximumAge:0,timeout:15000});
  });
}

let headingStarted=false;
function onOrientation(ev){
  let h=null,source=null;
  if(Number.isFinite(ev.webkitCompassHeading)){h=ev.webkitCompassHeading;source="webkitCompassHeading";}
  else if(ev.absolute===true && Number.isFinite(ev.alpha)){h=normDeg(360-ev.alpha);source="deviceorientationabsolute";}
  if(Number.isFinite(h)){S.project.hybrid.currentHeading=normDeg(h);S.project.hybrid.headingSource=source;}
}
export async function enableHeading(){
  if(headingStarted)return Number.isFinite(S.project.hybrid.currentHeading);
  try{
    if(typeof DeviceOrientationEvent!=="undefined" && typeof DeviceOrientationEvent.requestPermission==="function"){
      const r=await DeviceOrientationEvent.requestPermission();if(r!=="granted")return false;
    }
    window.addEventListener("deviceorientationabsolute",onOrientation,true);
    window.addEventListener("deviceorientation",onOrientation,true);
    headingStarted=true;
    return true;
  }catch{return false;}
}

export async function captureHybridBaseline(){
  await enableHeading();
  const geo=await geoOnce();
  S.project.geo={...geo,heading:Number.isFinite(S.project.hybrid.currentHeading)?S.project.hybrid.currentHeading:null};
  S.project.hybrid.savedHeading=Number.isFinite(S.project.hybrid.currentHeading)?S.project.hybrid.currentHeading:null;
  return {geo:S.project.geo,heading:S.project.hybrid.savedHeading,headingSource:S.project.hybrid.headingSource};
}

export async function assessHybridLocation(){
  if(!S.project.geo)throw new Error("Dit project heeft nog geen opgeslagen GPS-locatie.");
  await enableHeading();
  const current=await geoOnce();
  const distance=distanceMeters(S.project.geo,current),bearing=bearingDegrees(S.project.geo,current);
  const savedHeading=Number.isFinite(S.project.hybrid.savedHeading)?S.project.hybrid.savedHeading:Number.isFinite(S.project.geo.heading)?S.project.geo.heading:null;
  const currentHeading=Number.isFinite(S.project.hybrid.currentHeading)?S.project.hybrid.currentHeading:null;
  const headingDelta=Number.isFinite(savedHeading)&&Number.isFinite(currentHeading)?angleDiff(currentHeading,savedHeading):null;
  const uncertainty=Math.max(Number(S.project.geo.accuracy)||0,Number(current.accuracy)||0);
  const quality=distance<=Math.max(3,uncertainty)?"op locatie":distance<=15?"dichtbij":distance<=50?"in de buurt":"ver weg";
  const a={current,distance,bearing,uncertainty,quality,savedHeading,currentHeading,headingDelta,assessedAt:nowIso()};
  S.project.hybrid.lastAssessment=a;return a;
}
