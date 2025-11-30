import { auth } from "./firebase-init.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { showToast } from "./toast.js";

const authModal = document.getElementById("authModal");
const openBtn   = document.getElementById("openAuthBtn");
const pIn    = document.getElementById("panelSignIn");
const pUp    = document.getElementById("panelSignUp");
const toSignInBtn = document.getElementById("toSignIn");
const toSignUpBtn = document.getElementById("toSignUp");

// User profile dropdown elements
const userProfileDropdown = document.getElementById("userProfileDropdown");
const userProfileBtn = document.getElementById("userProfileBtn");
const userNameDisplay = document.getElementById("userNameDisplay");
const userProfileMenu = document.getElementById("userProfileMenu");
const viewChecklistsFromMenu = document.getElementById("viewChecklistsFromMenu");
const accountSettingsFromMenu = document.getElementById("accountSettingsFromMenu");
const signOutFromMenu = document.getElementById("signOutFromMenu");
const openBucketBtn = document.getElementById("openBucketBtn");

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
// Panel switching (via secondary buttons only)
// =====================
function showIn() {
  if (pIn) pIn.style.display = "block";
  if (pUp) pUp.style.display = "none";
}
function showUp() {
  if (pUp) pUp.style.display = "block";
  if (pIn) pIn.style.display = "none";
}

if (toSignInBtn) toSignInBtn.onclick = showIn;
if (toSignUpBtn) toSignUpBtn.onclick = showUp;

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

  const firstName = pUp.querySelector("input[type=text]").value.trim();
  const lastNameInput = pUp.querySelectorAll("input[type=text]")[1];
  const lastName = lastNameInput ? lastNameInput.value.trim() : "";
  
  const inputs = pUp.querySelectorAll("input[type=password], input[type=email]");
  const email = inputs[0].value.trim();
  const pass  = inputs[1].value.trim();
  const confirm = inputs[2].value.trim();

  if (pass !== confirm) {
    showToast("Passwords do not match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Store first and last name in user profile
    const displayName = `${firstName} ${lastName}`.trim();
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    showToast("Account created! You can now sign in.", "success");
    showIn();
  } catch (err) {
    showToast("Sign-up failed. The email is already in use.", "error");
  }
});

// =====================
// Dropdown Menu Toggle
// =====================
function toggleProfileMenu() {
  const isOpen = userProfileMenu.style.display === "block";
  if (isOpen) {
    userProfileMenu.style.display = "none";
    userProfileBtn.classList.remove("open");
  } else {
    userProfileMenu.style.display = "block";
    userProfileBtn.classList.add("open");
  }
}

function closeProfileMenu() {
  userProfileMenu.style.display = "none";
  userProfileBtn.classList.remove("open");
}

userProfileBtn.addEventListener("click", toggleProfileMenu);

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!userProfileDropdown.contains(e.target) && userProfileDropdown.style.display !== "none") {
    closeProfileMenu();
  }
});

// (Removed) Open Bucket List menu item handler — option removed from menu

// =====================
// Menu Items: View All Checklists
// =====================
viewChecklistsFromMenu.addEventListener("click", () => {
  closeProfileMenu();
  window.location.href = "my-checklist.html";
});

// =====================
// Menu Items: Account Settings
// =====================
if (accountSettingsFromMenu) {
  accountSettingsFromMenu.addEventListener("click", () => {
    closeProfileMenu();
    window.location.href = "account-settings.html";
  });
}

// =====================
// Menu Items: Sign Out
// =====================
signOutFromMenu.addEventListener("click", () => {
  closeProfileMenu();
  const signoutModal = document.getElementById("signoutConfirm");
  const yesBtn = document.getElementById("signoutYes");
  const noBtn  = document.getElementById("signoutNo");

  signoutModal.style.display = "flex";

  yesBtn.onclick = () => {
    signOut(auth);
    signoutModal.style.display = "none";
  };

  noBtn.onclick = () => {
    signoutModal.style.display = "none";
  };
});

// =====================
// Auto UI Update on Login
// =====================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User logged in
    openBtn.style.display = "none";  // hide Sign In button
    userProfileDropdown.style.display = "inline-block";  // show profile dropdown
    
    // Display user's name from displayName or email
    const displayName = user.displayName || user.email.split("@")[0];
    // Show a friendly greeting in the button. Use full name if available;
    // fall back to first name when the greeting would be very long.
    let greeting = `Hi ${displayName}`;
    if (greeting.length > 48) {
      // shorten to first name to avoid overflow
      const first = (displayName || "").split(" ")[0] || displayName;
      greeting = `Hi ${first}`;
    }
    userNameDisplay.textContent = greeting;
    // Also set full name as tooltip for clarity
    userNameDisplay.setAttribute('title', displayName);
  } else {
    // Logged out
    openBtn.style.display = "inline-block";
    userProfileDropdown.style.display = "none";  // hide profile dropdown
    closeProfileMenu();
  }
});