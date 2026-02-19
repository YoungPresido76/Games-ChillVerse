// js/firebase.js – Full compat / namespaced style (v10 compat)

import firebase from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth-compat.js";
import "https://www.gstatic.com/firebasejs/10.14.1/firebase-database-compat.js";

const firebaseConfig = {
  apiKey: "AIzaSyCOyREKMNxq2hyoR44VOVzQKTwXJo944TU",
  authDomain: "games-chillverse.firebaseapp.com",
  projectId: "games-chillverse",
  storageBucket: "games-chillverse.firebasestorage.app",
  messagingSenderId: "505706463284",
  appId: "1:505706463284:web:0242bfc389ba8278780a61"
};

// Initialize Firebase (namespaced style)
firebase.initializeApp(firebaseConfig);

// Exports using legacy namespace
export const auth = firebase.auth();
export const db = firebase.database();

// No playerRef here – we'll create it dynamically in main.js
export let playerRef = null;
export let isOnline = true;
