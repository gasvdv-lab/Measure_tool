let deferredInstallPrompt=null;

export function initPwaInstall(){
  const btn=document.getElementById("installPwaBtn");
  if("serviceWorker" in navigator){
    window.addEventListener("load",()=>{
      navigator.serviceWorker.register("./service-worker.js?v=0.8.36.4.2",{scope:"./"}).catch(err=>console.warn("Service worker registratie mislukt",err));
    },{once:true});
  }
  window.addEventListener("beforeinstallprompt",event=>{
    event.preventDefault();
    deferredInstallPrompt=event;
    if(btn) btn.hidden=false;
  });
  window.addEventListener("appinstalled",()=>{
    deferredInstallPrompt=null;
    if(btn) btn.hidden=true;
  });
  if(btn){
    btn.addEventListener("click",async()=>{
      if(!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try{ await deferredInstallPrompt.userChoice; }finally{ deferredInstallPrompt=null; btn.hidden=true; }
    });
  }
}
