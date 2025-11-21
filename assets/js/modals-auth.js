import { auth } from "./firebase-init.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { showToast } from "./toast.js";

const authModal = document.getElementById("authModal");
const openBtn   = document.getElementById("openAuthBtn");
const tabIn  = document.getElementById("tabSignIn");
const tabUp  = document.getElementById("tabSignUp");
const pIn    = document.getElementById("panelSignIn");
const pUp    = document.getElementById("panelSignUp");
const toSignInBtn = document.getElementById("toSignIn");
const toSignUpBtn = document.getElementById("toSignUp");

// =====================
// Modal Open/Close
// =====================
function openAuth() {
  authModal.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeAuth() {
  authModal.classList.remove("show");
  document.body.style.overflow = "";
}
if (openBtn) openBtn.addEventListener("click", openAuth);

// Close modal via X or click background
authModal.querySelector(".auth-close").onclick = closeAuth;
authModal.onclick = (e) => { if (e.target === authModal) closeAuth(); };
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAuth();
});

// =====================
// Tabs
// =====================
function showIn() {
  tabIn.classList.add("active");
  tabUp.classList.remove("active");
  pIn.style.display = "block";
  pUp.style.display = "none";
}
function showUp() {
  tabUp.classList.add("active");
  tabIn.classList.remove("active");
  pUp.style.display = "block";
  pIn.style.display = "none";
}
tabIn.onclick = showIn;
tabUp.onclick = showUp;

toSignInBtn.onclick = showIn;
toSignUpBtn.onclick = showUp;

// =====================
// Firebase: SIGN IN
// =====================
pIn.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = pIn.querySelector("input[type=email]").value.trim();
  const pass  = pIn.querySelector("input[type=password]").value.trim();

  try {
    await signInWithEmailAndPassword(auth, email, pass);
    closeAuth();
    showToast("Signed in successfully!", "success");
  } catch (err) {
    showToast("Sign-in failed. Check your credentials.", "error");
  }
});

// =====================
// Firebase: SIGN UP
// =====================
pUp.addEventListener("submit", async (e) => {
  e.preventDefault();

  const inputs = pUp.querySelectorAll("input[type=password], input[type=email]");
  const email = inputs[0].value.trim();
  const pass  = inputs[1].value.trim();
  const confirm = inputs[2].value.trim();

  if (pass !== confirm) {
    showToast("Passwords do not match!");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, pass);
    showToast("Account created! You can now sign in.", "success");
    showIn();
  } catch (err) {
    showToast("Sign-up failed. The email is already in use.", "error");
  }
});

// =====================
// Firebase: sign out
// =====================
const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Sign Out";
  logoutBtn.className = "btn-cta secondary";
  logoutBtn.style.marginLeft = "12px";

  logoutBtn.onclick = () => {
  const signoutModal = document.getElementById("signoutConfirm");
  const yesBtn = document.getElementById("signoutYes");
  const noBtn  = document.getElementById("signoutNo");

  logoutBtn.onclick = () => {
    signoutModal.style.display = "flex";
  };

  yesBtn.onclick = () => {
    signOut(auth);
    signoutModal.style.display = "none";
  };

  noBtn.onclick = () => {
    signoutModal.style.display = "none";
  };
};

// =====================
// Auto UI Update on Login
// =====================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User logged in
    openBtn.style.display = "none";  // hide Sign In button

    // Add logout button to nav if not added
    if (!document.getElementById("logoutButtonInjected")) {
      logoutBtn.id = "logoutButtonInjected";
      document.querySelector(".nav-actions").appendChild(logoutBtn);
    }
  } else {
    // Logged out
    openBtn.style.display = "inline-block";
    const injected = document.getElementById("logoutButtonInjected");
    if (injected) injected.remove();
  }
});