
import {initUI} from "./ui.js";
window.addEventListener("error",e=>console.error("Measure AR error",e.error||e.message));
window.addEventListener("unhandledrejection",e=>console.error("Measure AR promise error",e.reason));
initUI();

