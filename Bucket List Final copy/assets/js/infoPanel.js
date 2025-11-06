// ===== infoPanel.js — fetch basics + wikipedia highlight, update UI =====
(function(App){
  if (!App) return;

  async function fetchCountryBasics(countryName) {
    const fields = "name,capital,currencies,region,subregion,languages,population,flags,latlng";
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fields=${fields}&fullText=true`;
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
    const lat = Array.isArray(c.latlng) ? (c.latlng[0] ?? null) : null;
    const subregion = c.subregion || "";

    return { capital, currency, region, languages, population, flagUrl, lat, subregion };
  }

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

  async function onShowInfo(){
    const els = App.els;
    const key = els.country?.value;
    if (!key) return;

    const opt = els.country.options[els.country.selectedIndex];
    const selectedName = opt?.dataset?.name;
    const selectedFlag = opt?.dataset?.flag || null;
    const countryName = selectedName || App.NAME_MAP[key] || key;

    if (els.infoPanel) els.infoPanel.style.display = "block";
    if (els.countryName) els.countryName.textContent = countryName;
    App.setLoadingState();

    try {
      const [basics, highlight] = await Promise.all([
        fetchCountryBasics(countryName),
        fetchWikiHighlightShort(countryName),
      ]);

      if (App.byId("capital"))    App.byId("capital").textContent    = basics.capital || "—";
      if (App.byId("currency"))   App.byId("currency").textContent   = basics.currency || "—";
      if (App.byId("region"))     App.byId("region").textContent     = basics.region || "—";
      if (App.byId("languages"))  App.byId("languages").textContent  = basics.languages || "—";
      if (App.byId("population")) App.byId("population").textContent = basics.population || "—";
      if (App.byId("highlight"))  App.byId("highlight").textContent  = highlight || "—";

      const tips = App.pickTips(key, countryName);
      App.byId("bestTime").textContent = tips?.best || App.bestTimeFromLat(basics.lat);

      if (tips?.food) {
        App.byId("food").textContent = tips.food;
      } else {
        const cuisine = await App.fetchCuisineSnippet(countryName).catch(() => null);
        App.byId("food").textContent = cuisine || "Local specialties";
      }

      App.toggleFlag(basics.flagUrl || selectedFlag || null);
      App.loadPhoto(countryName);
      if (els.genBtn) els.genBtn.disabled = false;
    } catch (e) {
      console.error(e);
      ["capital","currency","region","languages","population","highlight","bestTime","food"]
        .forEach(id => { const el = App.byId(id); if (el) el.textContent = "Error"; });
      App.toggleFlag(null);
      if (App.els.photoCredit) App.els.photoCredit.style.display = "none";
    }
  }

  function init(){
    const btn = App.els.showInfo;
    if (btn) btn.addEventListener("click", onShowInfo);
  }

  App.infoPanel = { init };
})(window.App);
