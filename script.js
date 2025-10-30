// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const byId = (id) => document.getElementById(id);

const els = {
  country: byId("country"),
  showInfo: byId("showInfoBtn"),
  genBtn: byId("genBtn"),
  infoPanel: byId("info"),
  countryName: byId("countryName"),
  capital: byId("capital"),
  currency: byId("currency"),
  bestTime: byId("bestTime"),
  highlight: byId("highlight"),
  food: byId("food"),
  region: byId("region"),
  languages: byId("languages"),
  population: byId("population"),

  tasksList: byId("tasksList"),
  newTask: byId("newTask"),
  addTaskBtn: byId("addTaskBtn"),
  resetBtn: byId("resetBtn"),
  progressBar: byId("progressBar"),
  progressText: byId("progressText"),
  heroPhoto: byId("heroPhoto"),
  photoCredit: byId("photoCredit"),

  // header visual
  brandLogo: byId("brandLogo"),
  flagImg: byId("flagImg"),
};



const NAME_MAP = {
  japan: "Japan", italy: "Italy", canada: "Canada", brazil: "Brazil",
  spain: "Spain", australia: "Australia", turkey: "Turkey",
  mexico: "Mexico", egypt: "Egypt", usa: "United States",
};




// Simple tips (editable)
const TIPS = {
  japan:{best:"Mar–May, Oct–Nov", food:"Ramen, sushi, okonomiyaki"},
  italy:{best:"Apr–Jun, Sep–Oct", food:"Pasta, gelato, espresso"},
  canada:{best:"Jun–Sep", food:"Poutine, maple treats"},
  brazil:{best:"May–Sep (drier)", food:"Feijoada, pão de queijo"},
  spain:{best:"Apr–Jun, Sep–Oct", food:"Tapas, paella, churros"},
  australia:{best:"Oct–Mar (south), Jun–Aug (north)", food:"Meat pies, flat white"},
  turkey:{best:"Apr–Jun, Sep–Oct", food:"Kebabs, baklava, simit"},
  mexico:{best:"Nov–Apr (drier)", food:"Tacos, mole, tamales"},
  egypt:{best:"Oct–Apr", food:"Koshari, ful medames"},
  usa:{best:"Varies by region", food:"BBQ, burgers, regional specials"},
};

const CHECKLIST = [
  "Check passport validity (6+ months)",
  "Book flights & stays",
  "Buy travel insurance",
  "Plan 2–3 highlights",
  "Set up mobile data/eSIM",
  "Currency & cards ready",
  "Pack list finalized",
];



function setLoadingState() {
  ["capital","currency","bestTime","highlight","food","region","languages","population"].forEach(id=>{
    els[id].textContent = "Loading...";
  });
  toggleFlag(null);
}




// ---------- Data fetchers ----------
async function fetchCountryBasics(countryName) {
  const fields = "name,capital,currencies,region,languages,population,flags";
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("REST Countries error");
  const data = await res.json();
  const c = data[0];

  const capital = Array.isArray(c.capital) ? c.capital[0] : (c.capital || "—");

  let currency = "—";
  if (c.currencies && typeof c.currencies === "object") {
    const code = Object.keys(c.currencies)[0];
    const obj = c.currencies[code];
    currency = code + (obj?.name ? ` (${obj.name})` : "");
  }

  const region = c.region || "—";

  let languages = "—";
  if (c.languages && typeof c.languages === "object") {
    languages = Object.values(c.languages).slice(0,3).join(", ");
  }

  const population = typeof c.population === "number"
    ? c.population.toLocaleString()
    : "—";

  const flagUrl = c?.flags?.svg || c?.flags?.png || null;

  return { capital, currency, region, languages, population, flagUrl };
}




// Wikipedia short highlight (first sentence, ~140 chars)
async function fetchWikiHighlightShort(countryName) {
  const api = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`;
  const res = await fetch(api);
  if (!res.ok) throw new Error("Wikipedia error");
  const data = await res.json();

  const firstSentence = (data.extract || "").split(". ")[0] || "";
  let short = firstSentence.trim();
  if (short.length > 140) {
    short = short.slice(0, 140).replace(/\W+\w*$/, "") + "…";
  }
  return short || "Iconic sights, culture, and food.";
}





// Unsplash keyword fallback (no key)
function loadPhoto(keyword) {
  const src = `https://source.unsplash.com/featured/800x400/?${encodeURIComponent(keyword)}`;
  els.heroPhoto.src = src;
  els.heroPhoto.onload = () => {
    els.heroPhoto.style.display = "block";
    els.photoCredit.textContent = `Photo: Unsplash — “${keyword}”`;
    els.photoCredit.style.display = "block";
  };
  els.heroPhoto.onerror = () => {
    els.heroPhoto.style.display = "none";
    els.photoCredit.style.display = "none";
  };
}




// Toggle flag vs brand logo
function toggleFlag(url){
  if (url) {
    els.flagImg.src = url;
    els.flagImg.style.display = "block";
    if (els.brandLogo) els.brandLogo.style.display = "none";
  } else {
    els.flagImg.style.display = "none";
    if (els.brandLogo) els.brandLogo.style.display = "block";
  }
}




// ---------- Checklist UI ----------
// Create one LI with checkbox, label, and delete
function createTaskLi(text) {
  const li = document.createElement("li");

  const cb = document.createElement("input");
  cb.type = "checkbox";
  cb.addEventListener("change", updateProgress);

  const span = document.createElement("span");
  span.textContent = text;

  const del = document.createElement("button");
  del.className = "task-del";
  del.type = "button";
  del.setAttribute("aria-label", `Delete "${text}"`);
  del.title = "Delete";
  del.textContent = "×";
  del.addEventListener("click", () => {
    li.remove();
    updateProgress();
  });

  li.appendChild(cb);
  li.appendChild(span);
  li.appendChild(del);
  return li;
}




function renderChecklist(items) {
  els.tasksList.innerHTML = "";
  items.forEach((text) => {
    els.tasksList.appendChild(createTaskLi(text));
  });
  updateProgress();
}




function updateProgress() {
  const cbs = els.tasksList.querySelectorAll('input[type="checkbox"]');
  const total = cbs.length || 1;
  const done = Array.from(cbs).filter((c) => c.checked).length;
  const pct = Math.round((done * 100) / total);
  els.progressBar.style.width = pct + "%";
  els.progressText.textContent = `${pct}% ready`;
}





// Add custom task
els.addTaskBtn?.addEventListener("click", () => {
  const v = (els.newTask.value || "").trim();
  if (!v) return;
  els.tasksList.appendChild(createTaskLi(v));
  els.newTask.value = "";
  updateProgress();
});




// Reset checklist (uncheck all, keep items)
els.resetBtn?.addEventListener("click", () => {
  const cbs = els.tasksList.querySelectorAll('input[type="checkbox"]');
  cbs.forEach(cb => cb.checked = false);
  updateProgress();
});




// ---------- Main flow ----------
els.showInfo?.addEventListener("click", async () => {
  const key = els.country.value;
  if (!key) return;

  const countryName = NAME_MAP[key] || key;
  els.infoPanel.style.display = "block";
  els.countryName.textContent = countryName;
  setLoadingState();

  try {
    const [basics, highlight] = await Promise.all([
      fetchCountryBasics(countryName),
      fetchWikiHighlightShort(countryName),
    ]);

    els.capital.textContent    = basics.capital || "—";
    els.currency.textContent   = basics.currency || "—";
    els.region.textContent     = basics.region || "—";
    els.languages.textContent  = basics.languages || "—";
    els.population.textContent = basics.population || "—";
    els.highlight.textContent  = highlight || "—";
    els.bestTime.textContent   = (TIPS[key]?.best || "See local weather");
    els.food.textContent       = (TIPS[key]?.food || "Local specialties");

    toggleFlag(basics.flagUrl || null);
    loadPhoto(countryName);
    els.genBtn.disabled = false;
  } catch (e) {
    console.error(e);
    ["capital","currency","region","languages","population","highlight","bestTime","food"]
      .forEach(id => els[id].textContent = "Error");
    toggleFlag(null);
    els.photoCredit.style.display = "none";
  }
});

els.genBtn?.addEventListener("click", () => {
  const items = [...CHECKLIST];
  const key = els.country.value;
  const cName = NAME_MAP[key] || "";
  if (cName) items.unshift(`Download an offline map of ${cName}`);
  renderChecklist(items);
});

document.addEventListener("DOMContentLoaded", () => {
  els.infoPanel.style.display = "none";
  els.genBtn.disabled = true;
  toggleFlag(null);
});





/* ============================
   HERO BACKGROUND SLIDESHOW
   - cycles through 10 images
   - 5s per slide, no repeats until all shown
   - crossfade between two layers
============================ */

(function heroSlideshow(){
  const heroImages = [
    'images/hero-1.jpg','images/hero-2.jpg','images/hero-3.jpg','images/hero-4.jpg','images/hero-5.jpg',
    'images/hero-6.jpg','images/hero-7.jpg','images/hero-8.jpg','images/hero-9.jpg','images/hero-10.jpg'
  ];

  // Fisher–Yates shuffle
  function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Preload images (optional but nice)
  heroImages.forEach(src => { const img = new Image(); img.src = src; });

  const a = document.querySelector('.hero-bg-a');
  const b = document.querySelector('.hero-bg-b');
  if(!a || !b) return;

  let order = shuffle(heroImages.slice());
  let idx = 0;
  let showingA = true;

  // Initialize first image immediately
  a.style.backgroundImage = `url("${order[idx]}")`;
  a.classList.add('is-active');



  
  function nextImage(){
    idx++;
    if(idx >= order.length){
      order = shuffle(heroImages.slice()); // new non-repeating order
      idx = 0;
    }
    const nextSrc = order[idx];

    if(showingA){
      // put next on layer B
      b.style.backgroundImage = `url("${nextSrc}")`;
      b.classList.add('is-active');
      a.classList.remove('is-active');
    }else{
      a.style.backgroundImage = `url("${nextSrc}")`;
      a.classList.add('is-active');
      b.classList.remove('is-active');
    }
    showingA = !showingA;
  }

  // advance every 5 seconds
  setInterval(nextImage, 5000);
})();







// ===== Auth modal 
(function(){
  const authModal = document.getElementById('authModal');
  const openBtn   = document.getElementById('openAuthBtn');
  const closeBtn  = document.getElementById('closeAuthBtn') || document.getElementById('closeAuthBtn'); // fallback if id reused
  const tabIn  = document.getElementById('tabSignIn');
  const tabUp  = document.getElementById('tabSignUp');
  const pIn    = document.getElementById('panelSignIn');
  const pUp    = document.getElementById('panelSignUp');
  const toUp   = document.getElementById('toSignUp');
  const toIn   = document.getElementById('toSignIn');

  function openAuth(){ if(authModal){ authModal.classList.add('show'); document.body.style.overflow='hidden'; } }
  function closeAuth(){ if(authModal){ authModal.classList.remove('show'); document.body.style.overflow=''; } }

  if (openBtn) openBtn.addEventListener('click', openAuth);
  if (authModal) {
    const x = authModal.querySelector('.auth-close');
    if (x) x.addEventListener('click', closeAuth);
    authModal.addEventListener('click', (e)=>{ if(e.target===authModal) closeAuth(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && authModal.classList.contains('show')) closeAuth(); });
  }

  function showIn(){ if(!tabIn||!tabUp||!pIn||!pUp) return;
    tabIn.classList.add('active'); tabIn.setAttribute('aria-selected','true');
    tabUp.classList.remove('active'); tabUp.setAttribute('aria-selected','false');
    pIn.style.display='block'; pUp.style.display='none';
  }
  function showUp(){ if(!tabIn||!tabUp||!pIn||!pUp) return;
    tabUp.classList.add('active'); tabUp.setAttribute('aria-selected','true');
    tabIn.classList.remove('active'); tabIn.setAttribute('aria-selected','false');
    pUp.style.display='block'; pIn.style.display='none';
  }
  if (tabIn && tabUp){ tabIn.onclick = showIn; tabUp.onclick = showUp; }
  if (toUp) toUp.onclick = showUp;
  if (toIn) toIn.onclick = showIn;

  // Demo submit handlers
  if (pIn) pIn.addEventListener('submit', e => { e.preventDefault(); alert('Signed in (demo)'); closeAuth(); });
  if (pUp) pUp.addEventListener('submit', e => {
    e.preventDefault();
    const [pwd, confirm] = Array.from(pUp.querySelectorAll('input[type="password"]')).map(i=>i.value);
    if (pwd !== confirm) { alert('Passwords do not match.'); return; }
    alert('Account created (demo)'); showIn();
  });
})();










