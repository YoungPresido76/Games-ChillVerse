// js/ui.js – UI rendering & event binding helpers
import { formatNumber } from './ui.js';  // self-reference ok for helpers
import {
  clickHarvest, buyFlake, buyChillGen, buyRevel, buyVerse,
  prestigeCold, prestigeInsp, prestigeScript, convertChill,
  updateAchievements, saveGame, canBuyFlake, canBuyChillGen,
  canBuyRevel, canBuyVerse, canPrestigeCold, canPrestigeInsp, canPrestigeScript
} from './game.js';

const ACHIEVEMENTS = [
  { id: 1, name: 'Click 1k Drops', icon: '👆' },
  { id: 2, name: 'First Flake', icon: '❄️' },
  { id: 3, name: '1e12 Drops', icon: '💧' },
  { id: 4, name: 'First Cold Prestige', icon: '🧊' },
  { id: 5, name: '10 Flakes', icon: '❄️×10' },
  { id: 6, name: '1e9 Chill', icon: '🌬️' },
  { id: 7, name: 'First Chill Gen', icon: '⚙️' },
  { id: 8, name: '1e18 Chill', icon: '🌬️×∞' },
  { id: 9, name: 'First Insp Prestige', icon: '💡' },
  { id: 10, name: '5 Revels', icon: '✨' },
  { id: 11, name: '1e30 Insp', icon: '💡×∞' },
  { id: 12, name: '1e50 ChillVerse', icon: '🌌' },
  { id: 13, name: '5x All Prestiges', icon: '🔄' },
  { id: 14, name: 'Big Offline Gain', icon: '⏳' },
  { id: 15, name: 'Top 3 Leaderboard', icon: '🏆' }
];

export function formatNumber(n) {
  if (n == null || !isFinite(n)) return '∞';
  if (n < 1000) return Math.floor(n).toLocaleString();
  const exp = n.toExponential(2);
  return exp.replace(/e\+?/, 'e');
}

export function updateUI() {
  // Resources
  document.getElementById('drops').textContent = formatNumber(game.drops);
  document.getElementById('total-drops').textContent = formatNumber(game.totalDrops);
  document.getElementById('chill').textContent = formatNumber(game.chill);
  document.getElementById('total-chill').textContent = formatNumber(game.totalChill);
  document.getElementById('insp').textContent = formatNumber(game.insp);
  document.getElementById('total-insp').textContent = formatNumber(game.totalInsp);
  document.getElementById('chillverse-game').textContent = formatNumber(game.chillverse);
  document.getElementById('chillverse-profile').textContent = formatNumber(game.chillverse);

  // Buyers enabled state & text
  document.getElementById('buy-flake').disabled = !canBuyFlake();
  document.getElementById('buy-flake').textContent = `Flake (${game.flakes}) - ${formatNumber(game.flakeCost)} Drops`;

  document.getElementById('buy-chillgen').disabled = !canBuyChillGen();
  document.getElementById('buy-chillgen').textContent = `Chill Gen (${game.chillGen}) - ${formatNumber(game.chillGenCost)} Chill`;

  document.getElementById('buy-revel').disabled = !canBuyRevel();
  document.getElementById('buy-revel').textContent = `Revel (${game.revel}) - ${formatNumber(game.revelCost)} Insp`;

  document.getElementById('buy-verse').disabled = !canBuyVerse();
  document.getElementById('buy-verse').textContent = `Verse (${game.verse}) - ${formatNumber(game.verseCost)} ChillVerse`;

  // Prestige buttons
  document.getElementById('prestige-cold').disabled = !canPrestigeCold();
  document.getElementById('prestige-insp').disabled = !canPrestigeInsp();
  document.getElementById('prestige-script').disabled = !canPrestigeScript();

  // Earn tab
  document.getElementById('earn-chill').textContent = formatNumber(game.chill);
  document.getElementById('convert-btn').disabled = game.chill < 1000;

  // Profile
  document.getElementById('profile-name').textContent = game.name;
  document.getElementById('profile-phone').textContent = game.phone.replace(/(\+\d{3})(\d{4})(\d{4})(\d+)/, '$1 $2 $3 $4'); // masked example
  document.getElementById('avatar').textContent = game.name.charAt(0).toUpperCase();

  updateAchievementsGrid();
}

function updateAchievementsGrid() {
  const grid = document.getElementById('achievements-grid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    const unlocked = game.achievements.has(ach.id);
    const el = document.createElement('div');
    el.className = `ach ${unlocked ? 'unlocked' : ''}`;
    el.innerHTML = `
      <div class="badge">${ach.icon}</div>
      <div>${ach.name}</div>
    `;
    grid.appendChild(el);
  });
}

export function initEventListeners() {
  // Click harvest
  document.getElementById('click-btn').addEventListener('click', () => {
    clickHarvest();
    updateAchievements();
    updateUI();
  });

  // Buy buttons
  document.getElementById('buy-flake').onclick = () => { buyFlake(); updateAchievements(); updateUI(); };
  document.getElementById('buy-chillgen').onclick = () => { buyChillGen(); updateAchievements(); updateUI(); };
  document.getElementById('buy-revel').onclick = () => { buyRevel(); updateAchievements(); updateUI(); };
  document.getElementById('buy-verse').onclick = () => { buyVerse(); updateAchievements(); updateUI(); };

  // Prestige
  document.getElementById('prestige-cold').onclick = () => { prestigeCold(); updateAchievements(); updateUI(); };
  document.getElementById('prestige-insp').onclick = () => { prestigeInsp(); updateAchievements(); updateUI(); };
  document.getElementById('prestige-script').onclick = () => { prestigeScript(); updateAchievements(); updateUI(); };

  // Convert
  document.getElementById('convert-btn').onclick = () => { convertChill(); updateUI(); };

  // Modal close
  document.getElementById('close-modal').onclick = () => document.getElementById('screenshot-modal').close();

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
    });
  });

  // Logout
  document.getElementById('logout-btn').onclick = () => {
    if (confirm('Logout? Progress is saved.')) {
      // signOut(auth) handled in main.js
      location.reload();
    }
  };
    }
