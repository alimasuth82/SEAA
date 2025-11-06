// ===== countries.js — load country list into <select id="country"> =====
(function(App){
  if (!App) return;

  async function fromAPI() {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flags');
    if (!res.ok) throw new Error('api-fail');
    const data = await res.json();
    return data.map(c => ({
      name: c?.name?.common || "",
      code: c?.cca2 || "",
      flag: (c?.flags && (c.flags.svg || c.flags.png)) || ""
    })).filter(c => c.name && c.code);
  }

  async function fromJSON() {
    const res = await fetch('countries.json');
    if (!res.ok) throw new Error('json-missing');
    const data = await res.json();
    return data.map(c => ({
      name: c.name,
      code: c.code,
      flag: c.flag || `https://flagcdn.com/w320/${c.code.toLowerCase()}.png`
    })).filter(c => c.name && c.code);
  }

  function renderCountryOptions(countries, sel) {
    countries.sort((a, b) => a.name.localeCompare(b.name));
    sel.innerHTML =
      '<option value="">-- Select --</option>' +
      countries.map(c =>
        `<option value="${c.code}" data-name="${c.name}" data-flag="${c.flag}">${c.name}</option>`
      ).join('');
  }

  async function loadAllCountries() {
    const sel = App.byId("country");
    if (!sel) return;
    try {
      let list = await fromAPI();
      if (!Array.isArray(list) || list.length < 50) throw new Error('too-few');
      renderCountryOptions(list, sel);
    } catch (e) {
      console.warn('API failed; using countries.json fallback:', e.message || e);
      try {
        const list = await fromJSON();
        renderCountryOptions(list, sel);
      } catch (err) {
        console.error('countries.json also failed:', err.message || err);
      }
    }
  }

  App.loadAllCountries = loadAllCountries;
})(window.App);
