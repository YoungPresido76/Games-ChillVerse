// js/main.js – Entry point, auth, game loop, particles
import { auth, db, playerRef, isOnline } from './firebase.js';
import { loadGame, saveGame, tick, updateAchievements } from './game.js';
import { updateUI, initEventListeners, formatNumber } from './ui.js';

// Particles background (simple version – can replace with particles.js later)
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Auth & player flow
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    console.log('User signed in:', user.uid);
    document.getElementById('login').classList.remove('active');
    document.getElementById('loading').classList.add('active');

    // Dynamic ref (no exported ref function needed)
    playerRef = firebase.database().ref(`players/${game.phone || 'new'}`);

    playerRef.on('value', (snap) => {
      const data = snap.val();
      if (data) {
        loadGame(data);
      } else {
        saveGame(); // creates initial data
      }
      document.getElementById('logged-as').hidden = false;
      document.getElementById('logged-as').querySelector('strong').textContent = game.name;
      setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('main').classList.add('active');
        updateUI();
      }, 3000);
    });
    
    // Leaderboard (namespaced query style – simpler)
    const lbRef = firebase.database().ref('leaderboard');
    lbRef.orderByChild('chillverse').limitToLast(3).on('value', (snap) => {
      const tbody = document.querySelector('#leaderboard tbody');
      tbody.innerHTML = '';
      const entries = [];
      snap.forEach(child => entries.push(child.val()));
      entries.sort((a, b) => b.chillverse - a.chillverse);
      entries.forEach((entry, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i+1}</td>
          <td>${entry.name}</td>
          <td>${formatNumber(entry.chillverse)}</td>
          <td>${new Date(entry.lastUpdate).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      });
    });
  } else {
    console.log('No user signed in');
  }
});

// Login form handler (namespaced signInAnonymously)
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('player-name').value.trim();
  const phone = document.getElementById('player-phone').value.trim();

  if (!name || !phone.match(/^\+?\d{10,15}$/)) {
    alert('Please enter a valid name and phone number.');
    return;
  }

  game.name = name;
  game.phone = phone.replace(/\D/g, '');

  try {
    console.log('Attempting anonymous sign-in...');
    await firebase.auth().signInAnonymously();
    console.log('Anonymous sign-in successful');
  } catch (err) {
    console.error('Sign-in failed:', err.code, err.message);
    alert('Login error: ' + (err.message || 'Unknown error'));
  }
});

// Logout (update if you have logout logic)
document.getElementById('logout-btn').onclick = () => {
  if (confirm('Logout? Progress is saved.')) {
    firebase.auth().signOut().then(() => location.reload());
  }
};

// Game loop
setInterval(() => {
  tick();
  updateAchievements();
  updateUI();
}, 100);

// Init
initParticles();
initEventListeners();

// Try load from localStorage as fallback
const saved = localStorage.getItem('idleVerses');
if (saved) {
  try {
    loadGame(JSON.parse(saved));
    updateUI();
  } catch {}
    }
