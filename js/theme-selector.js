const STORAGE_KEY="measurear.ui.theme.v1";
const DEFAULT_THEME="technical-green";
const THEMES={
  "technical-green":{name:"Technical Green",themeColor:"#0b0d0c"},
  "survey-blue":{name:"Survey Blue",themeColor:"#091019"},
  "industrial-orange":{name:"Industrial Orange",themeColor:"#11100d"},
  "precision-red":{name:"Precision Red",themeColor:"#100c0d"},
  "neutral-steel":{name:"Neutral Steel",themeColor:"#0e1113"}
};
function validTheme(id){return Object.hasOwn(THEMES,id)?id:DEFAULT_THEME;}
export function getStoredTheme(){try{return validTheme(localStorage.getItem(STORAGE_KEY)||DEFAULT_THEME);}catch{return DEFAULT_THEME;}}
export function applyTheme(id,{persist=true,announce=true}={}){
  id=validTheme(id);document.documentElement.dataset.appTheme=id;
  if(persist){try{localStorage.setItem(STORAGE_KEY,id);}catch{}}
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=THEMES[id].themeColor;
  document.querySelectorAll('[data-theme-choice]').forEach(btn=>{
    const active=btn.dataset.themeChoice===id;btn.classList.toggle('active',active);btn.setAttribute('aria-checked',active?'true':'false');
  });
  const label=document.getElementById('themeCurrentName');if(label)label.textContent=THEMES[id].name;
  if(announce)document.dispatchEvent(new CustomEvent('measurear:theme-changed',{detail:{id,name:THEMES[id].name}}));
  return id;
}
export function initThemeSelector(){
  applyTheme(getStoredTheme(),{persist:false,announce:false});
  document.querySelectorAll('[data-theme-choice]').forEach(btn=>btn.addEventListener('click',()=>applyTheme(btn.dataset.themeChoice)));
}
