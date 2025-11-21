import { auth, db } from "./firebase-init.js";
import { 
  collection, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { showToast } from "./toast.js";

const container = document.getElementById("checklistContainer");

/* ================================
   Helpers
================================ */

function calculateProgress(tasks = []) {
  if (!Array.isArray(tasks) || tasks.length === 0) return 0;
  const done = tasks.filter(t => t.done).length;
  return Math.round((done / tasks.length) * 100);
}

function formatDate(timestamp) {
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString();
  }
  return "N/A";
}

/* ================================
   Load Checklists
================================ */

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    container.innerHTML = `
      <article class="tile" style="grid-column: 1 / -1; text-align:center;">
        <h3>Please Sign In</h3>
        <p>You must sign in to view your saved checklists.</p>
        <button class="btn-cta" onclick="document.getElementById('openAuthBtn').click()">Sign In / Sign Up</button>
      </article>
    `;
    return;
  }

  // Clear initial loading
  container.innerHTML = "";

  try {
    const colRef = collection(db, "users", user.uid, "checklists");
    const snap = await getDocs(colRef);

    if (snap.empty) {
      container.innerHTML = `
        <article class="tile" style="grid-column: 1 / -1; text-align:center;">
            <h3>No Checklists Saved</h3>
            <p>Start a new one on the <a href="index.html" class="link">Home Page</a>.</p>
        </article>
      `;
      return;
    }

    snap.forEach((docSnap) => {
      const id = docSnap.id;
      const data = docSnap.data();

      const name = data.countryName || id;
      const progress = calculateProgress(data.tasks);
      const updated = formatDate(data.lastUpdated);

      /* ===============================
         Build tile card (matches index)
      ================================ */

      const card = document.createElement("article");
      card.className = "tile tile-checklist";  

      card.innerHTML = `
        <h3>${name}</h3>
        <p class="saved-date"><b>Saved:</b> ${updated}</p>

        <p><b>Status:</b> ${progress}% Complete</p>
        <div class="progress">
          <div class="bar" style="width:${progress}%;"></div>
        </div>

        <ul class="task-preview">
          ${
            (data.tasks || [])
              .slice(0, 5)
              .map(
                (t) => `
                  <li class="task-preview-item">
                    <span>${t.text}</span>
                    <span>${t.done ? "✅" : "❌"}</span>
                  </li>
                `
              )
              .join("")
          }
          ${
            data.tasks && data.tasks.length > 5
              ? `<li class="task-preview-more">+ ${data.tasks.length - 5} more tasks...</li>`
              : ""
          }
        </ul>

        <div class="checklist-actions">
          <a href="index.html?country=${id}" class="btn-cta secondary">View / Edit</a>
          <button class="btn-reset delete-btn" data-id="${id}">Delete</button>
        </div>
      `;

      container.appendChild(card);
    });

    /* ===============================
       Event Listeners: Delete buttons
    ================================ */
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        alert(`Delete functionality for "${btn.dataset.id}" will be added.`);
      });
    });

  } catch (err) {
    console.error(err);
    showToast("Error loading checklists.", "error");
    container.innerHTML = `
      <article class="tile" style="grid-column: 1 / -1; text-align:center; color:#e11d48;">
        <p>Failed to load checklists. Try again later.</p>
      </article>
    `;
  }
});