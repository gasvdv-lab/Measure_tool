import {startAR} from "./ar.js";
import {S,$} from "./state.js";

import {initUI} from "./ui.js";
window.addEventListener("error",e=>console.error("Measure AR error",e.error||e.message));
window.addEventListener("unhandledrejection",e=>console.error("Measure AR promise error",e.reason));
initUI();



async function launchDirectAR(){
  const status=$("launchStatus");
  const retry=$("retryArBtn");
  const error=$("error");
  try{
    if(status)status.textContent="AR wordt gestart…";
    if(retry)retry.style.display="none";
    if(error){error.style.display="none";error.textContent="";}
    await startAR();
  }catch(err){
    console.error("Direct AR launch failed",err);
    if(status)status.textContent="AR kon niet automatisch starten.";
    if(error){error.style.display="block";error.textContent=err.message||String(err);}
    if(retry)retry.style.display="block";
  }
}
$("retryArBtn")?.addEventListener("click",launchDirectAR);

// Start direct after UI initialization.
// Browsers that require a user gesture for immersive-ar will show the retry button.
queueMicrotask(launchDirectAR);
