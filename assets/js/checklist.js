// ===== checklist.js — checklist UI (create, add, reset, progress, save/load) =====
import { auth, db } from "./firebase-init.js";
import { doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { showToast } from "./toast.js";


(function(App){
  if (!App) return;

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
    const list = App.els.tasksList;
    if (!list) return;
    list.innerHTML = "";
    items.forEach((text) => list.appendChild(createTaskLi(text)));
    updateProgress();
  }

  function updateProgress() {
    const list = App.els.tasksList;
    if (!list) return;
    const cbs = list.querySelectorAll('input[type="checkbox"]');
    const total = cbs.length || 1;
    const done = Array.from(cbs).filter((c) => c.checked).length;
    const pct = Math.round((done * 100) / total);
    if (App.els.progressBar) App.els.progressBar.style.width = pct + "%";
    if (App.els.progressText) App.els.progressText.textContent = `${pct}% ready`;
  }

  function wireButtons(){
    const { addTaskBtn, newTask, resetBtn, genBtn } = App.els;
    if (addTaskBtn) addTaskBtn.addEventListener("click", () => {
      const v = (newTask?.value || "").trim();
      if (!v) return;
      App.els.tasksList.appendChild(createTaskLi(v));
      newTask.value = "";
      updateProgress();
    });

    if (resetBtn) resetBtn.addEventListener("click", () => {
      const cbs = App.els.tasksList?.querySelectorAll('input[type="checkbox"]');
      cbs?.forEach(cb => cb.checked = false);
      updateProgress();
    });

    if (genBtn) genBtn.addEventListener("click", () => {
      const items = [...App.CHECKLIST];
      const sel = App.els.country;
      const key = sel?.value;
      const opt = sel?.options[sel.selectedIndex];
      const rawLabel = (opt?.dataset?.name) || (opt?.textContent) || key || "";
      const cName = (App && typeof App.shortenCountryName === 'function')
        ? App.shortenCountryName(rawLabel, key)
        : rawLabel;
      if (cName) items.unshift(`Download an offline map of ${cName}`);
      renderChecklist(items);
    });

    // Manual save/load (demo alerts preserved)
    const saveBtn = document.getElementById("saveChecklistBtn");
    const loadBtn = document.getElementById("loadChecklistBtn");

        // ===== Firestore Save =====
    if (saveBtn) saveBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        showToast("You must be signed in to save.", "error");
        return;
      }

      const country = App.byId("country")?.value || "";
      if (!country) {
        showToast("Choose a country before saving.", "error");
        return;
      }

      const tasks = [...document.querySelectorAll("#tasksList li")].map(li => ({
        text: li.querySelector("span")?.textContent.trim(),
        done: !!li.querySelector('input[type="checkbox"]')?.checked
      }));

      try {
        await setDoc(
          doc(db, "users", user.uid, "checklists", country),
          { 
            tasks,
            lastUpdated: serverTimestamp()
          },
          { merge: true }
        );

        // Compute a friendly display name for the country
        const sel = App.byId("country");
        const opt = sel?.options[sel.selectedIndex];
        const rawLabel = opt?.dataset?.name || opt?.textContent || country;
        const displayName = (App && typeof App.shortenCountryName === 'function')
          ? App.shortenCountryName(rawLabel, country)
          : rawLabel;

        showToast(`Checklist saved for ${displayName}!`, "success");
      } catch (err) {
        showToast("Save failed: " + err.message, "error");
      }
    });

        // ===== Firestore Load =====
          async function loadSavedChecklist(countryKey) {
            const user = auth.currentUser;
            if (!user) {
              showToast("You must be signed in to load.", "error");
              return;
            }

            const country = countryKey || App.byId("country")?.value || "";
            if (!country) {
              showToast("Choose a country before loading.", "error");
              return;
            }

            try {
              const snap = await getDoc(
                doc(db, "users", user.uid, "checklists", country)
              );

              if (!snap.exists()) {
                showToast("No saved checklist for this country.", "error");
                return;
              }

              const data = snap.data();
              const tasks = data.tasks || [];

              const list = App.byId("tasksList");
              if (!list) return;

              list.innerHTML = "";
              tasks.forEach(t => {
                const li = document.createElement("li");

                const cb = document.createElement("input");
                cb.type = "checkbox";
                cb.checked = !!t.done;
                cb.addEventListener("change", updateProgress);

                const span = document.createElement("span");
                span.textContent = t.text;

                const del = document.createElement("button");
                del.className = "task-del";
                del.type = "button";
                del.textContent = "×";
                del.addEventListener("click", () => { li.remove(); updateProgress(); });

                li.append(cb, span, del);
                list.appendChild(li);
              });

              updateProgress();
              // Get the friendly display name from the select option or normalize the code
              const sel = App.byId("country");
              let displayName = country;
              
              if (sel && sel.value === country) {
                // If the select currently has this country selected, use its text
                const opt = sel.options[sel.selectedIndex];
                displayName = opt?.dataset?.name || opt?.textContent || country;
              } else {
                // Otherwise find the option by value
                const opt = sel?.querySelector(`option[value="${country}"]`);
                displayName = opt?.dataset?.name || opt?.textContent || country;
              }
              
              // Apply short name normalization
              if (App && typeof App.shortenCountryName === 'function') {
                displayName = App.shortenCountryName(displayName, country);
              }
              
              showToast(`Loaded saved checklist for ${displayName}!`, "success");
            } catch (err) {
              showToast("Load failed: " + err.message, "error");
            }
          }

          if (loadBtn) loadBtn.addEventListener("click", () => loadSavedChecklist());

          // Expose for other scripts to call (e.g. index auto-open)
          if (!App.checklist) App.checklist = {};
          App.checklist.loadSavedChecklist = loadSavedChecklist;
  }

  function init(){
    wireButtons();
  }

  App.checklist = { init, updateProgress };
})(window.App);
