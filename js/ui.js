// js/ui.js
import {
  loadProgress,
  saveProgress,
  tick,
  harvest,
  buyFlake,
  buyChillGen,
  buyRevel,
  buyVerse,
  prestigeCold,
  prestigeInsp,
  prestigeScript,
  convertChill,
  formatNumber,
  ACHIEVEMENTS          // ← added this line
} from './game.js';

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateDisplay() {
  const g = window.game;

  document.getElementById('drops').textContent = formatNumber(g.drops);
  document.getElementById('total-drops').textContent = formatNumber(g.totalDrops);
  document.getElementById('chill').textContent = formatNumber(g.chill);
  document.getElementById('total-chill').textContent = formatNumber(g.totalChill);
  document.getElementById('insp').textContent = formatNumber(g.insp);
  document.getElementById('total-insp').textContent = formatNumber(g.totalInsp);
  document.getElementById('chillverse').textContent = formatNumber(g.chillverse);
  document.getElementById('chillverse-profile').textContent = formatNumber(g.chillverse);

  document.getElementById('buy-flake').disabled = g.drops < g.flakeCost;
  document.getElementById('buy-flake').textContent = `Flake (${g.flakes}) - ${formatNumber(g.flakeCost)}`;

  document.getElementById('buy-chillgen').disabled = g.chill < g.chillGenCost;
  document.getElementById('buy-chillgen').textContent = `Chill Gen (${g.chillGen}) - ${formatNumber(g.chillGenCost)}`;

  document.getElementById('buy-revel').disabled = g.insp < g.revelCost;
  document.getElementById('buy-revel').textContent = `Revel (${g.revel}) - ${formatNumber(g.revelCost)}`;

  document.getElementById('buy-verse').disabled = g.chillverse < g.verseCost;
  document.getElementById('buy-verse').textContent = `Verse (${g.verse}) - ${formatNumber(g.verseCost)}`;

  document.getElementById('prestige-cold').disabled = g.totalDrops < 1e21;
  document.getElementById('prestige-insp').disabled = g.totalChill < 1e30;
  document.getElementById('prestige-script').disabled = g.totalInsp < 1e40;

  document.getElementById('earn-chill').textContent = formatNumber(g.chill);
  document.getElementById('convert-btn').disabled = g.chill < 1000;

  document.getElementById('profile-name').textContent = g.name;
  document.getElementById('profile-phone').textContent = g.phone ? `+${g.phone}` : '';
  document.getElementById('avatar').textContent = g.name.charAt(0).toUpperCase();

  // Achievements grid
  const grid = document.getElementById('ach-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {  // ← now imported, no error
    const unlocked = g.achievements.has(ach.id);
    const div = document.createElement('div');
    div.className = `ach ${unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `<div class="badge">\( {ach.icon}</div><div> \){ach.name}</div>`;
    grid.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  updateDisplay();

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('player-name').value.trim() || 'Player';
    const phone = document.getElementById('player-phone').value.trim();

    window.game.name = name;
    window.game.phone = phone.replace(/\D/g, '');

    document.getElementById('login').hidden = true;
    document.getElementById('loading').hidden = false;
    document.getElementById('logged-message').hidden = false;
    document.getElementById('logged-message').querySelector('strong').textContent = name;

    setTimeout(() => {
      document.getElementById('loading').hidden = true;
      document.getElementById('main').hidden = false;
      updateDisplay();
      saveProgress();
    }, 3000);
  });

  document.getElementById('click-btn').onclick = () => {
    harvest();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('buy-flake').onclick = () => {
    buyFlake();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('buy-chillgen').onclick = () => {
    buyChillGen();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('buy-revel').onclick = () => {
    buyRevel();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('buy-verse').onclick = () => {
    buyVerse();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('prestige-cold').onclick = () => {
    prestigeCold();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('prestige-insp').onclick = () => {
    prestigeInsp();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('prestige-script').onclick = () => {
    prestigeScript();
    updateDisplay();
    saveProgress();
  };

  document.getElementById('convert-btn').onclick = () => {
    if (convertChill()) updateDisplay();
  };

  document.getElementById('close-modal').onclick = () => {
    document.getElementById('convert-modal').close();
  };

  document.getElementById('reset-btn').onclick = () => {
    if (confirm('Reset ALL progress?')) {
      localStorage.removeItem('idleVerses');
      location.reload();
    }
  };

  // Game loop
  setInterval(() => {
    tick();
    updateDisplay();
    saveProgress();
  }, 100);

  // Particles background
  const canvas = document.getElementById('particles');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const particles = Array.from({length: 60}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 0.5
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});
