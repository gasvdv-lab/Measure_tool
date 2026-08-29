import {startAR,resumeARFromGesture} from "./ar.js?v=0.8.28.5-20260829-2205";
import {$} from "./state.js?v=0.8.28.5-20260829-2205";
const VERSION="0.8.28.5",BUILD="20260829-2205";
const pendingCadId=sessionStorage.getItem("measurear.pendingCadPlacement");
let uiReadyPromise;

function showFatal(message){
  const status=$("launchStatus"),error=$("error"),btn=$("startArBtn");
  if(status)status.textContent="App kon niet volledig laden.";
  if(error){error.style.display="block";error.textContent=message;}
  if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}
}
async function lazyInitUI(){
  try{const mod=await import("./ui.js?v=0.8.28.5-20260829-2205");mod.initUI();if(document.documentElement.dataset.uiReady!=="1")throw new Error("UI-binding niet voltooid.");return true;}
  catch(err){console.error("UI init failed",err);showFatal(`UI-fout · v${VERSION} build ${BUILD}\n${err.message||err}`);return false;}
}
async function finishPendingCad(id){
  const [{restoreRecovery},{restoreCadRuntime,selectCad,beginCadPlacement}]=await Promise.all([
    import("./project-storage.js?v=0.8.28.5-20260829-2205"),
    import("./cad.js?v=0.8.28.5-20260829-2205")
  ]);
  restoreRecovery();
  await restoreCadRuntime();
  selectCad(id);beginCadPlacement(id);
  sessionStorage.removeItem("measurear.pendingCadPlacement");
  history.replaceState(null,"","./index.html");
  document.dispatchEvent(new CustomEvent("measurear:cad-return-ready",{detail:{id}}));
  const hint=$("hint");if(hint)hint.textContent="CAD geladen. Richt het vizier op de gewenste positie; open ☰ → CAD om te bevestigen.";
}
async function startFromUserGesture(){
  const status=$("launchStatus"),btn=$("startArBtn"),error=$("error");
  if(btn){btn.disabled=true;btn.textContent=pendingCadId?"CAD wordt gestart…":"AR starten…";}if(status)status.textContent="AR wordt gestart…";if(error){error.style.display="none";error.textContent="";}
  try{
    // Bij terugkeer van de externe import geen preflight-await vóór requestSession.
    if(pendingCadId)await resumeARFromGesture();else await startAR();
    const uiOk=await uiReadyPromise;if(!uiOk)throw new Error("UI kon niet worden geladen.");
    if(pendingCadId)await finishPendingCad(pendingCadId);
  }catch(err){console.error(err);if(status)status.textContent="AR kon niet starten.";if(error){error.style.display="block";error.textContent=`v${VERSION} · build ${BUILD}\n${err.message||err}`;}if(btn){btn.disabled=false;btn.textContent=pendingCadId?"Opnieuw: AR starten en CAD plaatsen":"Opnieuw proberen";}}
}
if(pendingCadId){
  const status=$("launchStatus"),btn=$("startArBtn"),build=$("buildInfo");
  if(status)status.textContent="CAD-bestand is klaar. Start een nieuwe AR-sessie om het model te plaatsen.";
  if(btn)btn.textContent="AR starten en CAD plaatsen";
  if(build)build.textContent=`v${VERSION} · CAD klaar voor plaatsing`;
}
$("startArBtn")?.addEventListener("click",startFromUserGesture);
window.addEventListener("error",e=>console.error(e.error||e.message));window.addEventListener("unhandledrejection",e=>console.error(e.reason));
uiReadyPromise=lazyInitUI();
