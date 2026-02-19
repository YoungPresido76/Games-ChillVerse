// Firebase Init (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { getDatabase, ref, set, onValue, query, orderByChild, limitToLast, goOffline, goOnline } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOyREKMNxq2hyoR44VOVzQKTwXJo944TU",
  authDomain: "games-chillverse.firebaseapp.com",
  projectId: "games-chillverse",
  storageBucket: "games-chillverse.firebasestorage.app",
  messagingSenderId: "505706463284",
  appId: "1:505706463284:web:0242bfc389ba8278780a61"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Exports for main
export let playerRef = null;
export let leaderboardQuery = null;
export let isOnline = true; // For offline fallback
