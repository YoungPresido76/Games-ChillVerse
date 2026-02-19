// js/firebase.js – Compat (v8-style) for easier compatibility

// Use compat libraries (older syntax)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js";
import { getAuth, signInAnonymously, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js";
import { getDatabase, ref, set, onValue, query, orderByChild, limitToLast } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js";

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

// No change needed for these exports
export let playerRef = null;
export let leaderboardQuery = null;
export let isOnline = true;
