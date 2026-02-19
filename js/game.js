// Game Logic: State, tick, buys, prestige (2-week balance)
import { db, playerRef, isOnline } from './firebase.js';
import { formatNumber, updateUI } from './ui.js'; // Circular? No, main orchestrates

window.game = {
  // Player
  name: '',
  phone: '',
  // Resources (number for simplicity, 1e308 cap)
  drops: 0,
  totalDrops: 0,
  flakes: 0,
  flakeCost: 10,
  coldMult: 1,
  chill: 0,
  totalChill: 0,
  chillGen: 0,
  chillGenCost: 100,
  insp: 0,
  totalInsp: 0,
  inspMult: 1,
  revel: 0,
  revelCost: 1e6,
  verse: 0,
  verseCost: 1e12,
  chillverse: 0,
  scriptMult: 1,
  // Meta
  lastUpdate: Date.now(),
  lastSave: 0,
  achievements: new Set(),
  saveThrottle: 0
};

// Achievements: 15, check on update
const ACHIEVEMENTS = [
  { id: 1, name: 'Click 1k Drops', check: () => game.totalDrops >= 1000 },
  { id: 2, name: 'First Flake', check: () => game.flakes >= 1 },
  { id: 3, name: '1e12 Drops', check: () => game.totalDrops >= 1e12 },
  { id: 4, name: 'First Cold Prestige', check: () => game.coldMult > 1 },
  { id: 5, name: '10 Flakes', check: () => game.flakes >= 10 },
  { id: 6, name: '1e9 Chill', check: () => game.totalChill >= 1e9 },
  { id: 7, name: 'First Chill Gen', check: () => game.chillGen >= 1 },
  { id: 8, name: '1e18 Chill', check: () => game.totalChill >= 1e18 },
  { id: 9, name: 'First Insp Prestige', check: () => game.inspMult > 1 },
  { id: 10, name: '5 Revels', check: () => game.revel >= 5 },
  { id: 11, name: '1e30 Insp', check: () => game.totalInsp >= 1e30 },
  { id: 12, name: '1e50 ChillVerse', check: () => game.chillverse >= 1e50 },
  { id: 13, name: '5x All Prestiges', check: () => game.coldMult * game.inspMult * game.scriptMult >= 1e10 }, // Approx
  { id: 14, name: 'Big Offline Gain', check: () => game.drops >= 1e10 }, // From offline
  { id: 15, name: 'Top 3 Leaderboard', check: () => false } // Manual or query
];

export function saveGame() {
  localStorage.setItem('idleVerses', JSON.stringify(window.game));
  if (!isOnline || Date.now() - game.saveThrottle < 60000) return; // Throttle 1min
  game.saveThrottle = Date.now();
  if (playerRef) {
    set(ref(db, `/players/${game.phone}`), window.game).catch(console.error);
    // Leaderboard push (unique key)
    const lbData = { name: game.name, chillverse: game.chillverse, lastUpdate: Date.now() };
    set(ref(db, `/leaderboard/${game.phone.replace(/[^a-zA-Z0-9]/g, '')}`), lbData);
  }
}

export function loadGame(data) {
  Object.assign(window.game, data);
  applyOfflineProgress();
  updateAchievements();
  updateUI();
}

function applyOfflineProgress() {
  const now = Date.now();
  let delta = (now - game.lastUpdate) / 1000; // sec
  if (delta <= 0) return;
  const offlineMult = 0.5;
  const maxOffline = 48 * 3600; // 2 days
  delta = Math.min(delta, maxOffline);

  // Current prod rates (per sec)
  const mult = game.coldMult * game.inspMult * game.scriptMult;
  const dropProd = game.flakes * mult;
  const chillProd = game.chillGen * mult;
  const inspProd = game.revel * mult;
  const cvProd = game.verse * mult;

  // Add gains
  game.drops += dropProd * delta * offlineMult;
  game.totalDrops += dropProd * delta * offlineMult;
  game.chill += chillProd * delta * offlineMult;
  game.totalChill += chillProd * delta * offlineMult;
  game.insp += inspProd * delta * offlineMult;
  game.totalInsp += inspProd * delta * offlineMult;
  game.chillverse += cvProd * delta * offlineMult;

  game.lastUpdate = now;
}

export function tick() {
  const mult = game.coldMult * game.inspMult * game.scriptMult;
  const deltaT = 0.1; // 100ms = 0.1s

  // Productions
  const dropDelta = game.flakes * mult * deltaT;
  game.drops += dropDelta;
  game.totalDrops += dropDelta;

  const chillDelta = game.chillGen * mult * deltaT;
  game.chill += chillDelta;
  game.totalChill += chillDelta;

  const inspDelta = game.revel * mult * deltaT;
  game.insp += inspDelta;
  game.totalInsp += inspDelta;

  const cvDelta = game.verse * mult * deltaT;
  game.chillverse += cvDelta;

  game.lastUpdate = Date.now();

  if (!isFinite(game.drops)) game.drops = 1e100; // Safety cap

  updateUI();
  checkSave();
}

function checkSave() {
  if (Date.now() - game.lastSave > 10000) { // Save every 10s
    saveGame();
    game.lastSave = Date.now();
  }
}

export function clickHarvest() {
  game.drops += 1 * game.coldMult * game.inspMult * game.scriptMult;
  game.totalDrops += 1 * game.coldMult * game.inspMult * game.scriptMult;
  updateUI();
}

export function buyFlake() {
  if (game.drops >= game.flakeCost) {
    game.drops -= game.flakeCost;
    game.flakes++;
    game.flakeCost = Math.floor(game.flakeCost * 1.6);
    updateUI();
  }
}

export function buyChillGen() {
  if (game.chill >= game.chillGenCost) {
    game.chill -= game.chillGenCost;
    game.chillGen++;
    game.chillGenCost = Math.floor(game.chillGenCost * 1.8);
    updateUI();
  }
}

export function buyRevel() {
  if (game.insp >= game.revelCost) {
    game.insp -= game.revelCost;
    game.revel++;
    game.revelCost *= 2.1;
    updateUI();
  }
}

export function buyVerse() {
  if (game.chillverse >= game.verseCost) {
    game.chillverse -= game.verseCost;
    game.verse++;
    game.verseCost *= 2.5;
    updateUI();
  }
}

export function prestigeCold() {
  if (game.totalDrops < 1e21) return;
  const gain = Math.pow(game.totalDrops / 1e15, 0.25);
  game.coldMult *= (1 + gain * 0.1); // 2-week: \~2-5x per prestige early
  resetTo('cold');
  updateUI();
}

export function prestigeInsp() {
  if (game.totalChill < 1e30) return;
  const gain = Math.pow(game.totalChill / 1e20, 0.22);
  game.inspMult *= (1 + gain * 0.08);
  resetTo('insp');
  updateUI();
}

export function prestigeScript() {
  if (game.totalInsp < 1e40) return;
  const gain = Math.pow(game.totalInsp / 1e25, 0.2);
  game.scriptMult *= (1 + gain * 0.06);
  resetTo('script');
  updateUI();
}

function resetTo(layer) {
  // Soft reset lower layers
  if (layer === 'cold') {
    game.drops = 0;
    game.flakes = 0;
    game.flakeCost = 10;
    game.totalDrops = 0;
  } else if (layer === 'insp') {
    game.drops = 0; game.flakes = 0; game.flakeCost = 10;
    game.chill = 0; game.chillGen = 0; game.chillGenCost = 100;
    game.totalDrops = 0; game.totalChill = 0;
  } else if (layer === 'script') {
    // Full reset below Verse
    Object.assign(game, {
      drops: 0, flakes: 0, flakeCost: 10,
      chill: 0, chillGen: 0, chillGenCost: 100,
      insp: 0, revel: 0, revelCost: 1e6,
      totalDrops: 0, totalChill: 0, totalInsp: 0,
      coldMult: 1, inspMult: 1
    });
  }
}

export function convertChill() {
  if (game.chill < 1000) return;
  const amtChill = 1000;
  const diamonds = 100;
  game.chill -= amtChill;
  const msg = `${game.name}, you have converted ${formatNumber(amtChill)} Chill to ${diamonds} Diamonds.`;
  document.getElementById('convert-msg').textContent = msg;
  document.getElementById('screenshot-modal').showModal();
  updateUI();
}

export function updateAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (ach.check() && !game.achievements.has(ach.id)) {
      game.achievements.add(ach.id);
    }
  });
  saveGame();
}

// Exposed for UI
export function canBuyFlake() { return game.drops >= game.flakeCost; }
export function canBuyChillGen() { return game.chill >= game.chillGenCost; }
export function canBuyRevel() { return game.insp >= game.revelCost; }
export function canBuyVerse() { return game.chillverse >= game.verseCost; }
export function canPrestigeCold() { return game.totalDrops >= 1e21; }
export function canPrestigeInsp() { return game.totalChill >= 1e30; }
export function canPrestigeScript() { return game.totalInsp >= 1e40; }
