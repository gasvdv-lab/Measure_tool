const STORAGE_KEY="measurear.colorpicker.recents.v1";
const MAX_RECENTS=12;

const THEME=[
  "#FFFFFF","#E7E9E8","#B7BDBA","#7D8782","#4B5550","#252B28","#111513","#000000",
  "#E74856","#FF8C42","#FFC83D","#55B96B","#2BB7A9","#3B82F6","#5267D9","#8B5CF6","#C05ACB","#E65F9E"
];
const MATRIX=[
  ["#FCE8EA","#FBE5D6","#FFF2CC","#E2F0D9","#DDEBF7","#D9EAF7","#E4DFEC","#F4D7E8"],
  ["#F4B7BD","#F4B183","#FFE699","#A9D18E","#9DC3E6","#8FAADC","#B4A7D6","#E6A4C4"],
  ["#E74856","#ED7D31","#FFD54F","#70AD47","#32A89D","#4472C4","#5B5FC7","#C05ACB"],
  ["#B32834","#C65911","#BF9000","#548235","#207D74","#2F5597","#403C93","#8E3C96"],
  ["#741D24","#833C0C","#7F6000","#375623","#14534D","#203864","#29265F","#5D2862"]
];

let picker=null,target=null,original="#ffffff",working="#ffffff",hue=0,sat=0,val=100;
const triggers=new Map();
const $=(s,r=document)=>r.querySelector(s);

function clamp(v,min,max){return Math.min(max,Math.max(min,v));}
function normalizeHex(v){
  v=String(v||"").trim().replace(/^#/ ,"");
  if(v.length===3)v=v.split("").map(x=>x+x).join("");
  if(!/^[0-9a-fA-F]{6}$/.test(v))return null;
  return "#"+v.toUpperCase();
}
function hexToRgb(hex){const h=normalizeHex(hex)||"#FFFFFF";return {r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16)};}
function rgbToHex(r,g,b){return "#"+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,"0")).join("").toUpperCase();}
function rgbToHsv(r,g,b){
  r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;
  if(d){if(max===r)h=60*(((g-b)/d)%6);else if(max===g)h=60*((b-r)/d+2);else h=60*((r-g)/d+4);}
  if(h<0)h+=360;return {h,s:max?d/max*100:0,v:max*100};
}
function hsvToRgb(h,s,v){
  s/=100;v/=100;const c=v*s,x=c*(1-Math.abs((h/60)%2-1)),m=v-c;let r=0,g=0,b=0;
  if(h<60)[r,g,b]=[c,x,0];else if(h<120)[r,g,b]=[x,c,0];else if(h<180)[r,g,b]=[0,c,x];else if(h<240)[r,g,b]=[0,x,c];else if(h<300)[r,g,b]=[x,0,c];else [r,g,b]=[c,0,x];
  return {r:(r+m)*255,g:(g+m)*255,b:(b+m)*255};
}
function readRecents(){try{return (JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")||[]).map(normalizeHex).filter(Boolean).slice(0,MAX_RECENTS);}catch{return [];}}
function pushRecent(hex){const h=normalizeHex(hex);if(!h)return;const next=[h,...readRecents().filter(x=>x!==h)].slice(0,MAX_RECENTS);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(next));}catch{} renderRecents();}
function swatch(hex,title=""){const b=document.createElement("button");b.type="button";b.className="proColorSwatch";b.style.setProperty("--swatch",hex);b.title=title||hex;b.setAttribute("aria-label",title||hex);b.dataset.color=hex;return b;}
function renderSwatches(node,colors){node.replaceChildren(...colors.map(c=>swatch(c)))}
function renderMatrix(node){node.replaceChildren(...MATRIX.flat().map(c=>swatch(c)))}
function renderRecents(){if(!picker)return;const node=$("[data-color-recents]",picker),colors=readRecents();if(!colors.length){node.innerHTML='<span class="proColorEmpty">Nog geen recente kleuren</span>';return;}renderSwatches(node,colors);}

function ensurePicker(){
  if(picker)return picker;
  picker=document.createElement("div");picker.id="professionalColorPicker";picker.className="proColorOverlay";picker.setAttribute("aria-hidden","true");
  picker.innerHTML=`<section class="proColorSheet" role="dialog" aria-modal="true" aria-labelledby="proColorTitle">
    <header class="proColorHead"><div><strong id="proColorTitle">Kleur</strong><small>Professionele kleurkiezer</small></div><button type="button" class="proColorClose" data-color-cancel aria-label="Sluiten">×</button></header>
    <div class="proColorBody">
      <div class="proColorSection"><div class="proColorSectionTitle">Themakleuren</div><div class="proColorTheme" data-color-theme></div></div>
      <div class="proColorSection"><div class="proColorSectionTitle">Kleuren</div><div class="proColorMatrix" data-color-matrix></div></div>
      <div class="proColorSection"><div class="proColorSectionTitle">Recent gebruikt</div><div class="proColorRecent" data-color-recents></div></div>
      <div class="proColorQuickActions"><button type="button" class="secondary" data-color-default>Standaard</button><button type="button" class="secondary" data-color-more>Meer kleuren…</button></div>
      <div class="proColorAdvanced" data-color-advanced hidden>
        <div class="proColorSV" data-color-sv><i data-color-marker></i></div>
        <input class="proHue" data-color-hue type="range" min="0" max="359" step="1" value="0" aria-label="Kleurtint">
        <div class="proColorCompare"><div><span>Huidig</span><i data-color-current></i></div><div><span>Nieuw</span><i data-color-new></i></div></div>
        <div class="proColorFields"><label>HEX<input data-color-hex inputmode="text" maxlength="7" spellcheck="false"></label><label>R<input data-color-r type="number" min="0" max="255"></label><label>G<input data-color-g type="number" min="0" max="255"></label><label>B<input data-color-b type="number" min="0" max="255"></label></div>
        <div class="proColorMeta" data-color-meta>RGB 255, 255, 255</div>
      </div>
    </div>
    <footer class="proColorFoot"><button type="button" class="secondary" data-color-cancel>Annuleren</button><button type="button" class="primary" data-color-apply>Toepassen</button></footer>
  </section>`;
  document.body.appendChild(picker);
  renderSwatches($("[data-color-theme]",picker),THEME);renderMatrix($("[data-color-matrix]",picker));renderRecents();
  picker.addEventListener("click",e=>{
    const s=e.target.closest(".proColorSwatch");if(s){setWorking(s.dataset.color);commit(true);return;}
    if(e.target.closest("[data-color-cancel]")){cancel();return;}
    if(e.target.closest("[data-color-apply]")){commit(false);return;}
    if(e.target.closest("[data-color-default]")){setWorking(target?.defaultValue||"#FFFFFF");return;}
    if(e.target.closest("[data-color-more]")){const a=$("[data-color-advanced]",picker);a.hidden=!a.hidden;e.target.textContent=a.hidden?"Meer kleuren…":"Minder kleuren";if(!a.hidden)requestAnimationFrame(updateSVMarker);return;}
    if(e.target===picker)cancel();
  });
  $("[data-color-hue]",picker).addEventListener("input",e=>{hue=Number(e.target.value);working=rgbToHex(...Object.values(hsvToRgb(hue,sat,val)));syncAdvanced(false);});
  const sv=$("[data-color-sv]",picker);
  const moveSV=e=>{const r=sv.getBoundingClientRect();sat=clamp((e.clientX-r.left)/r.width*100,0,100);val=clamp((1-(e.clientY-r.top)/r.height)*100,0,100);const rgb=hsvToRgb(hue,sat,val);working=rgbToHex(rgb.r,rgb.g,rgb.b);syncAdvanced(false);};
  sv.addEventListener("pointerdown",e=>{sv.setPointerCapture?.(e.pointerId);moveSV(e);});sv.addEventListener("pointermove",e=>{if(e.buttons)moveSV(e);});
  $("[data-color-hex]",picker).addEventListener("change",e=>{const h=normalizeHex(e.target.value);if(h)setWorking(h);else e.target.value=working;});
  ["r","g","b"].forEach(k=>$("[data-color-"+k+"]",picker).addEventListener("input",()=>{const r=Number($("[data-color-r]",picker).value),g=Number($("[data-color-g]",picker).value),b=Number($("[data-color-b]",picker).value);setWorking(rgbToHex(r,g,b));}));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&picker.classList.contains("open"))cancel();});
  return picker;
}

function setWorking(hex){working=normalizeHex(hex)||"#FFFFFF";const rgb=hexToRgb(working),hsv=rgbToHsv(rgb.r,rgb.g,rgb.b);hue=hsv.h;sat=hsv.s;val=hsv.v;syncAdvanced(true);}
function syncAdvanced(setHue=true){if(!picker)return;const rgb=hexToRgb(working);if(setHue)$("[data-color-hue]",picker).value=String(Math.round(hue));$("[data-color-hex]",picker).value=working;$("[data-color-r]",picker).value=rgb.r;$("[data-color-g]",picker).value=rgb.g;$("[data-color-b]",picker).value=rgb.b;$("[data-color-new]",picker).style.background=working;$("[data-color-meta]",picker).textContent=`RGB ${rgb.r}, ${rgb.g}, ${rgb.b} · H ${Math.round(hue)}° · S ${Math.round(sat)}% · V ${Math.round(val)}%`;$("[data-color-sv]",picker).style.setProperty("--hue",`hsl(${hue} 100% 50%)`);updateSVMarker();}
function updateSVMarker(){if(!picker)return;const m=$("[data-color-marker]",picker);m.style.left=sat+"%";m.style.top=(100-val)+"%";}
function updateTrigger(input){const t=triggers.get(input);if(!t)return;const h=normalizeHex(input.value)||normalizeHex(input.defaultValue)||"#FFFFFF";t.style.setProperty("--current-color",h);const code=$(".proColorCode",t);if(code)code.textContent=h;}
function open(input){ensurePicker();target=input;original=normalizeHex(input.value)||"#FFFFFF";working=original;$("[data-color-current]",picker).style.background=original;const adv=$("[data-color-advanced]",picker);adv.hidden=true;$("[data-color-more]",picker).textContent="Meer kleuren…";setWorking(original);renderRecents();picker.classList.add("open");picker.setAttribute("aria-hidden","false");document.body.classList.add("color-picker-open");}
function close(){picker?.classList.remove("open");picker?.setAttribute("aria-hidden","true");document.body.classList.remove("color-picker-open");target=null;}
function commit(quick){if(!target)return;target.value=working;target.dispatchEvent(new Event("input",{bubbles:true}));target.dispatchEvent(new Event("change",{bubbles:true}));updateTrigger(target);pushRecent(working);close();}
function cancel(){if(target){target.value=original;updateTrigger(target);}close();}

export function refreshProfessionalColorPickers(){document.querySelectorAll('input[type="color"].proColorSource').forEach(updateTrigger);}
export function initProfessionalColorPickers(){
  ensurePicker();
  document.querySelectorAll('input[type="color"]').forEach(input=>{
    if(input.classList.contains("proColorSource"))return;
    input.classList.add("proColorSource");
    const b=document.createElement("button");b.type="button";b.className="proColorTrigger";b.innerHTML='<span class="proColorTriggerSwatch"></span><span class="proColorCode"></span><span class="proColorChevron">⌄</span>';b.setAttribute("aria-label","Kleur kiezen");
    input.before(b);triggers.set(input,b);input.tabIndex=-1;input.setAttribute("aria-hidden","true");updateTrigger(input);b.addEventListener("click",()=>{updateTrigger(input);open(input);});input.addEventListener("click",e=>e.preventDefault());input.addEventListener("input",()=>updateTrigger(input));input.addEventListener("change",()=>updateTrigger(input));
  });
}
