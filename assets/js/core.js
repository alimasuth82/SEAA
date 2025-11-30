// ===== core.js — shared helpers, state, and constants =====
(function(){
  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  // Shared element refs (optional; modules also query as needed)
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
    brandLogo: byId("brandLogo"),
    flagImg: byId("flagImg"),
  };

  const NAME_MAP = {
    japan: "Japan", italy: "Italy", canada: "Canada", brazil: "Brazil",
    spain: "Spain", australia: "Australia", turkey: "Turkey",
    mexico: "Mexico", egypt: "Egypt", usa: "United States",
  };

  // Add a few common short-name mappings for keys/codes not covered above
  Object.assign(NAME_MAP, {
    kr: 'South Korea', kp: 'North Korea', ru: 'Russia', vn: 'Vietnam',
    ir: 'Iran', la: 'Laos', md: 'Moldova', tr: 'Turkey', uk: 'United Kingdom'
  });

  // Short name overrides for official names from countries.json
  const SHORT_NAME_OVERRIDES = {
    "Korea, Republic of": "South Korea",
    "Korea, Democratic People's Republic of": "North Korea",
    "Russian Federation": "Russia",
    "Viet Nam": "Vietnam",
    "Iran, Islamic Republic of": "Iran",
    "Lao People's Democratic Republic": "Laos",
    "Moldova, Republic of": "Moldova",
    "Côte d’Ivoire": "Ivory Coast",
    "Türkiye": "Turkey",
  };

  function shortenCountryName(name, code) {
    if (!name && !code) return '';
    // Prefer explicit overrides by exact name
    if (name && SHORT_NAME_OVERRIDES[name]) return SHORT_NAME_OVERRIDES[name];
    // If code provided, try NAME_MAP by lowercase key or uppercase code
    if (code) {
      const low = String(code).toLowerCase();
      if (NAME_MAP[low]) return NAME_MAP[low];
      const up = String(code).toUpperCase();
      // Some callers may pass ISO codes; try to match common cases
      if (up === 'US') return 'United States';
    }
    if (!name) return '';

    // Try simple canonicalizations
    const cleaned = String(name)
      .replace(/^Republic of /i, '')
      .replace(/, Republic of$/i, '')
      .replace(/,? Democratic People's Republic of$/i, '')
      .replace(/,? of the$/i, '')
      .replace(/^Russian Federation$/i, 'Russia')
      .replace(/^Viet Nam$/i, 'Vietnam')
      .replace(/^Iran,?/i, 'Iran')
      .replace(/^Lao People's Democratic Republic$/i, 'Laos')
      .replace(/^Moldova,?/i, 'Moldova')
      .replace(/^Côte d’Ivoire$/i, 'Ivory Coast')
      .trim();

    return cleaned;
  }

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

  const TIPS_BY_CODE = {
    JP: TIPS.japan, IT: TIPS.italy, CA: TIPS.canada, BR: TIPS.brazil, ES: TIPS.spain,
    AU: TIPS.australia, TR: TIPS.turkey, MX: TIPS.mexico, EG: TIPS.egypt, US: TIPS.usa
  };
  const TIPS_BY_NAME = {
    "japan": TIPS.japan, "italy": TIPS.italy, "canada": TIPS.canada, "brazil": TIPS.brazil,
    "spain": TIPS.spain, "australia": TIPS.australia, "turkey": TIPS.turkey, "mexico": TIPS.mexico,
    "egypt": TIPS.egypt, "united states": TIPS.usa, "united states of america": TIPS.usa, "usa": TIPS.usa
  };

  function pickTips(code, name) {
    if (code && TIPS_BY_CODE[code.toUpperCase()]) return TIPS_BY_CODE[code.toUpperCase()];
    const norm = (name || "").toLowerCase().trim();
    return TIPS_BY_NAME[norm] || null;
  }

  function bestTimeFromLat(lat) {
    if (typeof lat !== "number") return "See local weather";
    if (Math.abs(lat) < 25) return "Dry season varies (often Nov–Apr)";
    return lat > 0 ? "Apr–Jun, Sep–Oct" : "Oct–Mar";
  }

  async function fetchCuisineSnippet(countryName) {
    async function tryTitle(title) {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const first = (data.extract || "").split(". ")[0].trim();
      if (!first) return null;
      return (first.length > 140) ? first.slice(0,140).replace(/\W+\w*$/, "") + "…" : first;
    }
    return (await tryTitle(`${countryName} cuisine`))
        || (await tryTitle(`Cuisine of ${countryName}`))
        || null;
  }

  function toggleFlag(url){
    const flagImg = els.flagImg;
    const brandLogo = els.brandLogo;
    if (url) {
      if (flagImg){ flagImg.src = url; flagImg.style.display = "block"; }
      if (brandLogo) brandLogo.style.display = "none";
    } else {
      if (flagImg) flagImg.style.display = "none";
      if (brandLogo) brandLogo.style.display = "block";
    }
  }

  function loadPhoto(keyword) {
    const img = els.heroPhoto;
    const credit = els.photoCredit;
    if (!img || !credit) return;
    const src = `https://source.unsplash.com/featured/800x400/?${encodeURIComponent(keyword)}`;
    img.src = src;
    img.onload = () => {
      img.style.display = "block";
      credit.textContent = `Photo: Unsplash — “${keyword}”`;
      credit.style.display = "block";
    };
    img.onerror = () => {
      img.style.display = "none";
      credit.style.display = "none";
    };
  }

  function setLoadingState() {
    ["capital","currency","bestTime","highlight","food","region","languages","population"].forEach(id=>{
      const el = document.getElementById(id);
      if (el) el.textContent = "Loading...";
    });
    toggleFlag(null);
  }

  // Expose shared namespace
  window.App = {
    $, byId, els,
    NAME_MAP, TIPS, CHECKLIST,
    TIPS_BY_CODE, TIPS_BY_NAME, pickTips,
    bestTimeFromLat, fetchCuisineSnippet,
    shortenCountryName,
    toggleFlag, loadPhoto, setLoadingState,
  };
})();
