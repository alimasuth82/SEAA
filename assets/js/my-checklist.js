import { auth, db } from "./firebase-init.js";
import { 
  collection, 
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { showToast } from "./toast.js";

const container = document.getElementById("checklistContainer");
let countriesCache = null;

/* ===== Helpers ===== */
function calculateProgress(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  const done = tasks.filter(t => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

/* Formatting Date */
function formatDate(value) {
  if (!value) return "Unknown";

  let date;

  // Firestore Timestamp
  if (value.toDate) {
    date = value.toDate();
  }
  // numeric timestamp
  else if (typeof value === "number") {
    date = new Date(value);
  }
  // string ISO date
  else if (typeof value === "string") {
    date = new Date(value);
  }
  else {
    return "Unknown";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function resolveFlagUrl(countryCode) {
  const code = String(countryCode || "").toUpperCase();
  if (/^[a-z]{2}$/i.test(code)) {
    return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  }
  return null;
}

/* ===== Logic to Create the "Tile" ===== */
function createChecklistCard(id, data, countryCode, countryName) {
  const progress = calculateProgress(data.tasks);
  const updatedDate = formatDate(data.lastUpdated);
  const flagUrl = resolveFlagUrl(countryCode);

  const card = document.createElement("article");
  // Use 'tile checklist-tile' to match the CSS
  card.className = "tile checklist-tile";
  card.setAttribute("data-id", id);
  card.style.animationDelay = `${Math.random() * 0.15}s`;

  // Tasks Preview (Show up to 5 items)
  const allTasks = data.tasks || [];
  const taskPreviewHtml = allTasks
    .slice(0, 5)
    .map(task => `
      <li class="tile-task-item ${task.done ? 'completed' : ''}">
        <span>${task.done ? '✓' : '○'}</span>
        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${task.text}</span>
      </li>
    `)
    .join("");

  const remaining = Math.max(0, allTasks.length - 5);
  const showMoreBtn = remaining > 0;

  card.innerHTML = `
    <div class="tile-header">
      ${flagUrl 
        ? `<img src="${flagUrl}" alt="${countryName}" class="tile-flag" />` 
        : '<div class="tile-flag" style="background:#334155; display:grid; place-items:center;">🌍</div>'}
      <div class="tile-title">
        <h3>${countryName}</h3>
        <span class="tile-date">Saved: ${updatedDate}</span>
      </div>
    </div>

    <div class="tile-progress">
      <div class="progress-meta">
        <span>Progress</span>
        <span>${progress}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="width: ${progress}%"></div>
      </div>
    </div>

    <ul class="tile-tasks">
      ${taskPreviewHtml || '<li class="tile-task-item" style="color:#64748b;">No tasks yet...</li>'}
      <li class="task-more" data-index="5" style="display: ${showMoreBtn ? 'list-item' : 'none'};">+ ${remaining} more items</li>
    </ul>

    <div class="tile-actions">
      <button class="btn-cta open-checklist-btn" data-country="${id}">Open Checklist</button>
      <button class="btn-delete delete-btn" data-id="${id}" aria-label="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      </button>
    </div>
  `;

  // Store all tasks as JSON for reference
  card.dataset.tasks = JSON.stringify(allTasks);

  return card;
}

/* ===== State Renderers (Dark Theme) ===== */
function renderSignInPrompt() {
  container.innerHTML = `
    <div class="signin-prompt">
      <h2>Sign In Required</h2>
      <p>Log in to view and manage your saved travel checklists.</p>
      <button class="btn-cta" onclick="document.getElementById('openAuthBtn').click()">
        Sign In / Sign Up
      </button>
    </div>
  `;
}

function renderEmptyState() {
  container.innerHTML = `
    <div class="empty-state">
      <h2>No Checklists Yet</h2>
      <p>You haven't saved any trips. Create your checklist now!</p>
      <button id="createFirstBtn" class="btn-cta">Create First Checklist</button>
    </div>
  `;
}

function renderLoadingState() {
  container.innerHTML = `
    <div class="loading-state-container">
      <div class="spinner"></div>
      <p>Loading your adventures...</p>
    </div>
  `;
}

/* ===== Data Logic (Same as before) ===== */
async function fetchCountryData() {
  if (countriesCache) return countriesCache;
  try {
    const resp = await fetch('countries.json'); // Ensure this file exists in root
    if (resp.ok) {
      const list = await resp.json();
      const codeMap = {};
      const nameToCodeMap = {};
      list.forEach(c => {
        if (c.code && c.name) {
          codeMap[c.code.toUpperCase()] = c.name;
          nameToCodeMap[c.name.toLowerCase()] = c.code;
        }
      });
      countriesCache = { codeMap, nameToCodeMap };
      return countriesCache;
    }
  } catch (e) {
    console.warn('Failed to load countries.json', e);
  }
  return { codeMap: {}, nameToCodeMap: {} };
}

async function handleDelete(btn, user) {
  const idToDelete = btn.dataset.id;
  const card = btn.closest(".tile");
  
  // Show confirmation modal
  const confirmModal = document.getElementById('deleteChecklistConfirm');
  const yesBtn = document.getElementById('deleteChecklistYes');
  const noBtn = document.getElementById('deleteChecklistNo');
  
  if (!confirmModal) {
    console.warn('Delete confirmation modal not found');
    return;
  }
  
  confirmModal.classList.add('show');
  
  // Handle yes
  const handleYes = async () => {
    confirmModal.classList.remove('show');
    yesBtn.removeEventListener('click', handleYes);
    noBtn.removeEventListener('click', handleNo);
    
    const originalContent = btn.innerHTML;
    try {
      btn.disabled = true;
      btn.innerHTML = `...`;
      
      await deleteDoc(doc(db, "users", user.uid, "checklists", idToDelete));
      
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";
      
      setTimeout(() => {
        card.remove();
        showToast('Checklist deleted', 'success');
        if (container.children.length === 0) renderEmptyState();
      }, 300);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete', 'error');
      btn.disabled = false;
      btn.innerHTML = originalContent;
    }
  };
  
  // Handle no
  const handleNo = () => {
    confirmModal.classList.remove('show');
    yesBtn.removeEventListener('click', handleYes);
    noBtn.removeEventListener('click', handleNo);
  };
  
  yesBtn.addEventListener('click', handleYes);
  noBtn.addEventListener('click', handleNo);
}

async function loadChecklists(user) {
  try {
    const { codeMap, nameToCodeMap } = await fetchCountryData();
    const colRef = collection(db, "users", user.uid, "checklists");
    
    // Set up real-time listener
    onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        renderEmptyState();
        return;
      }

      container.innerHTML = "";

      snap.forEach((docSnap) => {
        const id = docSnap.id;
        const data = docSnap.data();

        let countryCode = null;
        let countryName = data.countryName || id;

        if (/^[a-z]{2}$/i.test(id)) {
          countryCode = id;
          countryName = codeMap[id.toUpperCase()] || countryName;
        } else {
          countryCode = nameToCodeMap[id.toLowerCase()] || null;
        }
        
        if (countryName === id && window.App?.NAME_MAP?.[id.toLowerCase()]) {
          countryName = window.App.NAME_MAP[id.toLowerCase()];
        }

        // Normalize to a friendly short name (e.g. "South Korea")
        if (window.App && typeof window.App.shortenCountryName === 'function') {
          countryName = window.App.shortenCountryName(countryName, countryCode);
        }

        container.appendChild(createChecklistCard(id, data, countryCode, countryName));
      });

      // Re-attach event listeners after DOM update
      attachEventListeners(user);
    }, (err) => {
      console.error('Firestore listener error:', err);
      container.innerHTML = `<div class="empty-state"><p>Error loading data.</p></div>`;
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="empty-state"><p>Error loading data.</p></div>`;
  }
}

function attachEventListeners(user) {
  // Remove old listener if exists
  const oldListener = container.dataset.listenerAttached;
  if (oldListener === 'true') {
    container.removeEventListener('click', handleContainerClick);
  }

  // Attach new listener
  const handleContainerClick = (e) => {
    const delBtn = e.target.closest('.delete-btn');
    if (delBtn) {
      e.preventDefault();
      handleDelete(delBtn, user);
      return;
    }

    const openBtn = e.target.closest('.open-checklist-btn');
    if (openBtn) {
      e.preventDefault();
      const countryKey = openBtn.dataset.country;
      // open the embedded modal and load saved checklist
      try {
        if (typeof openModal === 'function') openModal();
        const sel = document.getElementById('country');
        if (sel && countryKey) sel.value = countryKey;
        const showBtn = document.getElementById('showInfoBtn');
        if (showBtn) showBtn.click();
        // attempt to load saved checklist via exposed API
        if (window.App && window.App.checklist && typeof window.App.checklist.loadSavedChecklist === 'function') {
          window.App.checklist.loadSavedChecklist(countryKey);
        } else {
          const loadBtn = document.getElementById('loadChecklistBtn');
          if (loadBtn) loadBtn.click();
        }
      } catch (err) {
        console.warn('Open checklist failed', err);
      }
      return;
    }

    const moreBtn = e.target.closest('.task-more');
    if (moreBtn) {
      e.preventDefault();
      const card = moreBtn.closest('.tile');
      if (!card) return;
      const dataStr = card.dataset.tasks || '[]';
      let tasks = [];
      try { tasks = JSON.parse(dataStr); } catch (e) { tasks = []; }
      
      // Check if we're expanding or collapsing
      const isExpanded = moreBtn.classList.contains('expanded');
      
      if (isExpanded) {
        // Collapse: remove all items after the first 5
        const ul = card.querySelector('.tile-tasks');
        const itemsToRemove = ul.querySelectorAll('.tile-task-item:nth-child(n+6)');
        itemsToRemove.forEach(item => item.remove());
        
        // Update button back to "+N more items"
        const remaining = Math.max(0, tasks.length - 5);
        moreBtn.classList.remove('expanded');
        moreBtn.textContent = `+ ${remaining} more items`;
        moreBtn.dataset.index = '5';
      } else {
        // Expand: show all remaining items
        const ul = card.querySelector('.tile-tasks');
        let idx = parseInt(moreBtn.dataset.index || '5', 10);
        const toShow = tasks.slice(idx);
        
        toShow.forEach(t => {
          const li = document.createElement('li');
          li.className = 'tile-task-item' + (t.done ? ' completed' : '');
          li.innerHTML = `<span>${t.done ? '✓' : '○'}</span><span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.text}</span>`;
          ul.insertBefore(li, moreBtn);
        });
        
        // Update button to "Show fewer items"
        moreBtn.classList.add('expanded');
        moreBtn.textContent = 'Show fewer items';
      }
      return;
    }
  };

  container.addEventListener('click', handleContainerClick);
  container.dataset.listenerAttached = 'true';
}

auth.onAuthStateChanged((user) => {
  if (user) {
    renderLoadingState();
    loadChecklists(user);
  } else {
    // Add a brief delay to prevent jarring transition on sign out
    renderLoadingState();
    setTimeout(() => {
      renderSignInPrompt();
    }, 500);
  }
});

// Delegate create-first button (rendered in empty state)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#createFirstBtn');
  if (btn) {
    e.preventDefault();
    try {
      if (typeof openModal === 'function') openModal();
      const sel = document.getElementById('country');
      if (sel) sel.value = '';
      const showBtn = document.getElementById('showInfoBtn');
      if (showBtn) showBtn.click();
    } catch (err) { console.warn('createFirstBtn open failed', err); }
  }
});