import {startAR} from "./ar.js?v=0.8.15-20260822-2215";
import {$} from "./state.js?v=0.8.15-20260822-2215";
const VERSION="0.8.15",BUILD="20260822-2215";

function showFatal(message){
  const status=$("launchStatus"),error=$("error"),btn=$("startArBtn");
  if(status)status.textContent="App kon niet volledig laden.";
  if(error){error.style.display="block";error.textContent=message;}
  if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}
}
async function lazyInitUI(){
  try{const mod=await import("./ui.js?v=0.8.15-20260822-2215");mod.initUI();if(document.documentElement.dataset.uiReady!=="1")throw new Error("UI-binding niet voltooid.");return true;}
  catch(err){console.error("UI init failed",err);showFatal(`UI-fout · v${VERSION} build ${BUILD}\n${err.message||err}`);return false;}
}
async function startFromUserGesture(){
  const status=$("launchStatus"),btn=$("startArBtn"),error=$("error");
  if(btn){btn.disabled=true;btn.textContent="AR starten…";}if(status)status.textContent="AR wordt gestart…";if(error){error.style.display="none";error.textContent="";}
  try{await startAR();}catch(err){console.error(err);if(status)status.textContent="AR kon niet starten.";if(error){error.style.display="block";error.textContent=`v${VERSION} · build ${BUILD}\n${err.message||err}`;}if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}}
}
$("startArBtn")?.addEventListener("click",startFromUserGesture);
window.addEventListener("error",e=>console.error(e.error||e.message));window.addEventListener("unhandledrejection",e=>console.error(e.reason));
lazyInitUI();
