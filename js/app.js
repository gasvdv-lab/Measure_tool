import {togglePlacementMode,updatePlacementUI,placeParametricNext} from "./placement.js";

import {initUI} from "./ui.js";
window.addEventListener("error",e=>console.error("Measure AR error",e.error||e.message));
window.addEventListener("unhandledrejection",e=>console.error("Measure AR promise error",e.reason));
initUI();

$("placementModeBtn")?.addEventListener("click",togglePlacementMode);
$("placementConstraint")?.addEventListener("change",updatePlacementUI);
$("placementApplyBtn")?.addEventListener("click",()=>{try{placeParametricNext();}catch(err){$("stage").textContent="Op maat plaatsen mislukt";$("detail").textContent=err.message||String(err);}});
updatePlacementUI();
