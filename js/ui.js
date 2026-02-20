// js/ui.js – Rendering & events

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

function switchTab(tabName) {
  tabs.forEach(t => t.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

function updateDisplay() {
  document.getElementById('drops').textContent = game.formatNumber(game.drops);
  document.getElementById('total-drops').textContent = game.formatNumber(game.totalDrops);
  document.getElementById('chill').textContent = game.formatNumber(game.chill);
  document.getElementById('total-chill').textContent = game.formatNumber(game.totalChill);
  document.getElementById('insp').textContent = game.formatNumber(game.insp);
  document.getElementById('total-insp').textContent = game.formatNumber(game.totalInsp);
  document.getElementById('chillverse').textContent = game.formatNumber(game.chillverse);
  document.getElementById('chillverse-profile').textContent = game.formatNumber(game.chillverse);

  document.getElementById('buy-flake').disabled = game.drops < game.flakeCost;
  document.getElementById('buy-flake').textContent = `Flake (${game.flakes}) - ${game.formatNumber(game.flakeCost)}`;

  document.getElementById('buy-chillgen').disabled = game.chill < game.chillGenCost;
  document.getElementById('buy-chillgen').textContent = `Chill Gen (${game.chillGen}) - ${game.formatNumber(game.chillGenCost)}`;

  document.getElementById('buy-revel').disabled = game.insp < game.revelCost;
  document.getElementById('buy-revel').textContent = `Revel (${game.revel}) - ${game.formatNumber(game.revelCost)}`;

  document.getElementById('buy-verse').disabled = game.chillverse < game.verseCost;
  document.getElementById('buy-verse').textContent = `Verse (${game.verse}) - ${game.formatNumber(game.verseCost)}`;

  document.getElementById('prestige-cold').disabled = game.totalDrops < 1e21;
  document.getElementById('prestige-insp').disabled = game.totalChill < 1e30;
  document.getElementById('prestige-script').disabled = game.totalInsp < 1e40;

  document.getElementById('earn-chill').textContent = game.formatNumber(game.chill);
  document.getElementById('convert-btn').disabled = game.chill < 1000;

  document.getElementById('profile-name').textContent = game.name;
  document.getElementById('profile-phone').textContent = game.phone ? `+${game.phone}` : '';
  document.getElementById('avatar').textContent = game.name.charAt(0).toUpperCase();

  // Achievements grid
  const grid = document.getElementById('ach-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = game.achievements.has(ach.id);
    const div = document.createElement('div');
    div.className = `ach ${unlocked ? 'unlocked' : ''}`;
    div.innerHTML = `<div class="badge">\( {ach.icon}</div><div> \){ach.name}</div>`;
    grid.appendChild(div);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  game.loadProgress();
  updateDisplay();

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });

  // Login
  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('player-name').value.trim() || 'Player';
    const phone = document.getElementById('player-phone').value.trim();

    game.name = name;
    game.phone = phone.replace(/\D/g, '');

    document.getElementById('login').hidden = true;
    document.getElementById('loading').hidden = false;
    document.getElementById('logged-message').hidden = false;
    document.getElementById('logged-message').querySelector('strong').textContent = name;

    setTimeout(() => {
      document.getElementById('loading').hidden = true;
      document.getElementById('main').hidden = false;
      updateDisplay();
      game.saveProgress();
    }, 3000);
  });

  // Game actions
  document.getElementById('click-btn').onclick = () => { game.harvest(); game.checkAchievements(); updateDisplay(); game.saveProgress(); };
  document.getElementById('buy-flake').onclick = () => { game.buyFlake(); updateDisplay(); game.saveProgress(); };
  document.getElementById('buy-chillgen').onclick = () => { game.buyChillGen(); updateDisplay(); game.saveProgress(); };
  document.getElementById('buy-revel').onclick = () => { game.buyRevel(); updateDisplay(); game.saveProgress(); };
  document.getElementById('buy-verse').onclick = () => { game.buyVerse(); updateDisplay(); game.saveProgress(); };

  document.getElementById('prestige-cold').onclick = () => { game.prestigeCold(); updateDisplay(); game.saveProgress(); };
  document.getElementById('prestige-insp').onclick = () => { game.prestigeInsp(); updateDisplay(); game.saveProgress(); };
  document.getElementById('prestige-script').onclick = () => { game.prestigeScript(); updateDisplay(); game.saveProgress(); };

  document.getElementById('convert-btn').onclick = () => {
    if (game.convertChill()) updateDisplay();
  };

  document.getElementById('close-modal').onclick = () => document.getElementById('convert-modal').close();

  document.getElementById('reset-btn').onclick = () => {
    if (confirm('Reset ALL progress?')) {
      localStorage.removeItem('idleVerses');
      location.reload();
    }
  };

  // Game loop
  setInterval(() => {
    game.tick();
    updateDisplay();
    game.saveProgress();
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
