// ===== checklist.js — checklist UI (create, add, reset, progress, save/load) =====
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
      const cName = (opt?.dataset?.name) || (App.NAME_MAP[key]) || key || "";
      if (cName) items.unshift(`Download an offline map of ${cName}`);
      renderChecklist(items);
    });

    // Manual save/load (demo alerts preserved)
    const saveBtn = document.getElementById("saveChecklistBtn");
    const loadBtn = document.getElementById("loadChecklistBtn");

    if (saveBtn) saveBtn.addEventListener("click", () => {
      const country = App.byId("country")?.value || "";
      const tasks = [...document.querySelectorAll("#tasksList li")].map(li => ({
        text: li.textContent.replace("×","").trim(),
        done: !!li.querySelector('input[type="checkbox"]')?.checked
      }));
      localStorage.setItem(`checklist-${country}`, JSON.stringify(tasks));
      alert(`Checklist saved for ${country}!`);
    });

    if (loadBtn) loadBtn.addEventListener("click", () => {
      const country = App.byId("country")?.value || "";
      const saved = localStorage.getItem(`checklist-${country}`);
      if (!saved) return alert("No saved checklist found for this country.");
      const tasks = JSON.parse(saved);
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
      alert(`Loaded saved checklist for ${country}!`);
    });
  }

  function init(){
    wireButtons();
  }

  App.checklist = { init, updateProgress };
})(window.App);
