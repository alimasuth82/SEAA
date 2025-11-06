// ===== main.js — bootstraps modules on DOMContentLoaded =====
(function(App){
  if (!App) return;
  document.addEventListener("DOMContentLoaded", async () => {
    // Load country list (API → JSON fallback)
    if (typeof App.loadAllCountries === 'function') {
      await App.loadAllCountries();
    }
    // Initial UI state
    if (App.els.infoPanel) App.els.infoPanel.style.display = "none";
    if (App.els.genBtn) App.els.genBtn.disabled = true;
    App.toggleFlag(null);

    // Init feature modules
    App.infoPanel && App.infoPanel.init && App.infoPanel.init();
    App.checklist && App.checklist.init && App.checklist.init();
  });
})(window.App);
