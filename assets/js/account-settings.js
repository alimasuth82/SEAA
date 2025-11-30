import { auth } from "./firebase-init.js";
import { 
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

import { showToast } from "./toast.js";

// =====================
// DOM Elements
// =====================
const firstNameInput = document.getElementById("firstNameInput");
const lastNameInput = document.getElementById("lastNameInput");
const emailInput = document.getElementById("emailInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const currentPasswordInput = document.getElementById("currentPasswordInput");
const newPasswordInput = document.getElementById("newPasswordInput");
const confirmPasswordInput = document.getElementById("confirmPasswordInput");
const updatePasswordBtn = document.getElementById("updatePasswordBtn");

const deleteAccountBtn = document.getElementById("deleteAccountBtn");

// =====================
// Load User Data
// =====================
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Populate email field (disabled)
    emailInput.value = user.email;

    // Parse displayName to get first and last name
    const displayName = user.displayName || "";
    const nameParts = displayName.trim().split(" ");
    
    if (nameParts.length >= 2) {
      firstNameInput.value = nameParts[0];
      lastNameInput.value = nameParts.slice(1).join(" ");
    } else if (nameParts.length === 1) {
      firstNameInput.value = nameParts[0];
      lastNameInput.value = "";
    }
  } else {
    // Check if user just deleted their account
    const accountDeleted = sessionStorage.getItem("accountDeleted");
    
    if (accountDeleted) {
      // Clear the flag and don't show error message
      sessionStorage.removeItem("accountDeleted");
      // Allow the success message to show, then redirect happens automatically
      return;
    }
    
    // User not logged in (and didn't just delete account), redirect to home
    showToast("Please sign in to access account settings.", "error");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
});

// =====================
// Save Profile Changes
// =====================
saveProfileBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  
  if (!user) {
    showToast("You must be signed in to update your profile.", "error");
    return;
  }

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();

  if (!firstName) {
    showToast("First name is required.", "error");
    return;
  }

  const displayName = `${firstName} ${lastName}`.trim();

  try {
    await updateProfile(user, {
      displayName: displayName
    });
    
    showToast("Profile updated successfully!", "success");
    
    // Update the user name display in the header if it exists
    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) {
      userNameDisplay.textContent = displayName;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    showToast("Failed to update profile. Please try again.", "error");
  }
});

// =====================
// Update Password
// =====================
updatePasswordBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  
  if (!user) {
    showToast("You must be signed in to change your password.", "error");
    return;
  }

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  // Validation
  if (!currentPassword) {
    showToast("Please enter your current password.", "error");
    return;
  }

  if (!newPassword) {
    showToast("Please enter a new password.", "error");
    return;
  }

  if (newPassword.length < 6) {
    showToast("New password must be at least 6 characters.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast("New passwords do not match.", "error");
    return;
  }

  if (currentPassword === newPassword) {
    showToast("New password must be different from current password.", "error");
    return;
  }

  try {
    // Re-authenticate user before changing password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await updatePassword(user, newPassword);
    
    showToast("Password updated successfully!", "success");
    
    // Clear password fields
    currentPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
  } catch (error) {
    console.error("Error updating password:", error);
    
    if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
      showToast("Current password is incorrect.", "error");
    } else if (error.code === "auth/weak-password") {
      showToast("Password is too weak. Please choose a stronger password.", "error");
    } else {
      showToast("Failed to update password. Please try again.", "error");
    }
  }
});

// =====================
// Delete Account
// =====================
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", async () => {
    const user = auth.currentUser;
    
    if (!user) {
      showToast("You must be signed in to delete your account.", "error");
      return;
    }

    // Get modal elements
    const deleteConfirm1 = document.getElementById("deleteConfirm1");
    const deleteConfirm2 = document.getElementById("deleteConfirm2");
    const deleteYes1 = document.getElementById("deleteYes1");
    const deleteNo1 = document.getElementById("deleteNo1");
    const deleteYes2 = document.getElementById("deleteYes2");
    const deleteNo2 = document.getElementById("deleteNo2");

    // Show first confirmation modal
    deleteConfirm1.style.display = "flex";

    // First confirmation - No button
    deleteNo1.onclick = () => {
      deleteConfirm1.style.display = "none";
    };

    // First confirmation - Yes button
    deleteYes1.onclick = () => {
      deleteConfirm1.style.display = "none";
      // Show second confirmation modal
      deleteConfirm2.style.display = "flex";
    };

    // Second confirmation - No button
    deleteNo2.onclick = () => {
      deleteConfirm2.style.display = "none";
    };

    // Second confirmation - Yes button (final deletion)
    deleteYes2.onclick = async () => {
      deleteConfirm2.style.display = "none";

      try {
        // Set a flag to indicate account deletion is in progress
        sessionStorage.setItem("accountDeleted", "true");
        
        // Delete the user account
        await deleteUser(user);
        
        showToast("Account deleted successfully.", "success");
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } catch (error) {
        // Remove the flag if deletion failed
        sessionStorage.removeItem("accountDeleted");
        console.error("Error deleting account:", error);
        
        if (error.code === "auth/requires-recent-login") {
          showToast(
            "For security reasons, please sign out and sign in again before deleting your account.",
            "error"
          );
        } else {
          showToast("Failed to delete account. Please try again.", "error");
        }
      }
    };
  });
}
