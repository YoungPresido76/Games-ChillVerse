// js/main.js – Entry point, auth, game loop, particles
import { auth, db, playerRef, signInAnonymously, onAuthStateChanged, ref, onValue, set, query, orderByChild, limitToLast } from './firebase.js';
import { loadGame, saveGame, tick, updateAchievements } from './game.js';
import { updateUI, initEventListeners } from './ui.js';

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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Already signed in or just signed in
    document.getElementById('login').classList.remove('active');
    document.getElementById('loading').classList.add('active');

    // Load or create player data
    playerRef = ref(db, `players/${game.phone || 'new'}`);
    onValue(playerRef, (snap) => {
      const data = snap.val();
      if (data) {
        loadGame(data);
      } else {
        // New player – already set name/phone in login
        saveGame();
      }
      document.getElementById('logged-as').hidden = false;
      document.getElementById('logged-as').querySelector('strong').textContent = game.name;
      setTimeout(() => {
        document.getElementById('loading').classList.remove('active');
        document.getElementById('main').classList.add('active');
        updateUI();
      }, 3000); // fake 3s remaining of 5s
    });

    // Leaderboard realtime
    const lbQuery = query(ref(db, 'leaderboard'), orderByChild('chillverse'), limitToLast(3));
    onValue(lbQuery, (snap) => {
      const tbody = document.querySelector('#leaderboard tbody');
      tbody.innerHTML = '';
      const entries = [];
      snap.forEach(child => entries.push(child.val()));
      entries.sort((a,b) => b.chillverse - a.chillverse);
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
  }
});

// Login form
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('player-name').value.trim();
  const phone = document.getElementById('player-phone').value.trim();

  if (!name || !phone.match(/^\+?\d{10,15}$/)) {
    alert('Please enter a valid name and phone number.');
    return;
  }

  game.name = name;
  game.phone = phone.replace(/\D/g, ''); // normalize

  try {
    await signInAnonymously(auth);
    // onAuthStateChanged will handle the rest
  } catch (err) {
    console.error(err);
    alert('Login failed. Try again.');
  }
});

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
