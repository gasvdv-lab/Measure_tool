import {startAR} from "./ar.js?v=0.8.6-20260822-1506";
import {$} from "./state.js?v=0.8.6-20260822-1506";

const VERSION="0.8.6";
const BUILD="20260822-1506";

function showFatal(message){
  const status=$("launchStatus");
  const error=$("error");
  const btn=$("startArBtn");
  if(status)status.textContent="App kon niet volledig laden.";
  if(error){error.style.display="block";error.textContent=message;}
  if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}
}

async function lazyInitUI(){
  try{
    const mod=await import("./ui.js?v=0.8.6-20260822-1506");
    mod.initUI();
    return true;
  }catch(err){
    console.error("UI init failed",err);
    showFatal(`UI-fout · v${VERSION} build ${BUILD}\n${err.message||err}`);
    return false;
  }
}

async function startFromUserGesture(){
  const status=$("launchStatus");
  const btn=$("startArBtn");
  const error=$("error");

  if(btn){btn.disabled=true;btn.textContent="AR starten…";}
  if(status)status.textContent="AR wordt gestart…";
  if(error){error.style.display="none";error.textContent="";}

  try{
    await startAR();
  }catch(err){
    console.error("AR start failed",err);
    if(status)status.textContent="AR kon niet starten.";
    if(error){
      error.style.display="block";
      error.textContent=`v${VERSION} · build ${BUILD}\n${err.message||err}`;
    }
    if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}
  }
}

window.addEventListener("error",e=>{
  console.error("Global error",e.error||e.message);
});
window.addEventListener("unhandledrejection",e=>{
  console.error("Unhandled rejection",e.reason);
});

// Critical order: attach the AR button BEFORE optional UI initialization.
$("startArBtn")?.addEventListener("click",startFromUserGesture);
lazyInitUI();
