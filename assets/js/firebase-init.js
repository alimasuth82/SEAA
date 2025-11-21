// ===== Firebase Initialization =====
// Load Firebase modules (via CDN is easiest)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyASHlnJH6YkF1a6tmSMP41Wj1-Tpf9Dh_A",
  authDomain: "smart-bucket-list-a6761.firebaseapp.com",
  projectId: "smart-bucket-list-a6761",
  storageBucket: "smart-bucket-list-a6761.firebasestorage.app",
  messagingSenderId: "1039766242159",
  appId: "1:1039766242159:web:a65a5a505e026d19c05e9a",
  measurementId: "G-6CQ0N256S4"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Expose Firebase globally for debugging
window.auth = auth;
window.db = db;