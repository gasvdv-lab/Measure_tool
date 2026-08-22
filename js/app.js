import {startAR} from "./ar.js";
import {S,$} from "./state.js";

import {initUI} from "./ui.js";
window.addEventListener("error",e=>console.error("Measure AR error",e.error||e.message));
window.addEventListener("unhandledrejection",e=>console.error("Measure AR promise error",e.reason));
initUI();





// Start direct after UI initialization.
// Browsers that require a user gesture for immersive-ar will show the retry button.


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
    if(error){error.style.display="block";error.textContent=err.message||String(err);}
    if(btn){btn.disabled=false;btn.textContent="Opnieuw proberen";}
  }
}
$("startArBtn")?.addEventListener("click",startFromUserGesture);
