// js/game.js – Core logic & state (local only)

window.game = {
  name: 'Guest',
  phone: '',
  drops: 0,
  totalDrops: 0,
  flakes: 0,
  flakeCost: 10,
  chill: 0,
  totalChill: 0,
  chillGen: 0,
  chillGenCost: 100,
  insp: 0,
  totalInsp: 0,
  revel: 0,
  revelCost: 1e6,
  verse: 0,
  verseCost: 1e12,
  chillverse: 0,
  coldMult: 1,
  inspMult: 1,
  scriptMult: 1,
  achievements: new Set(),
  lastUpdate: Date.now()
};

const ACHIEVEMENTS = [
  { id: 1, name: 'First 1,000 Drops', icon: '👆', check: () => game.totalDrops >= 1e3 },
  { id: 2, name: 'First Flake', icon: '❄️', check: () => game.flakes >= 1 },
  { id: 3, name: '1e12 Drops', icon: '💧', check: () => game.totalDrops >= 1e12 },
  { id: 4, name: 'First Cold Prestige', icon: '🧊', check: () => game.coldMult > 1 },
  { id: 5, name: '10 Flakes', icon: '❄️×10', check: () => game.flakes >= 10 },
  { id: 6, name: '1e9 Chill', icon: '🌬️', check: () => game.totalChill >= 1e9 },
  { id: 7, name: 'First Chill Gen', icon: '⚙️', check: () => game.chillGen >= 1 },
  { id: 8, name: '1e18 Chill', icon: '🌬️×∞', check: () => game.totalChill >= 1e18 },
  { id: 9, name: 'First Insp Prestige', icon: '💡', check: () => game.inspMult > 1 },
  { id: 10, name: '5 Revels', icon: '✨', check: () => game.revel >= 5 },
  { id: 11, name: '1e30 Insp', icon: '💡×∞', check: () => game.totalInsp >= 1e30 },
  { id: 12, name: '1e50 ChillVerse', icon: '🌌', check: () => game.chillverse >= 1e50 },
  { id: 13, name: 'Multiple Prestiges', icon: '🔄', check: () => game.coldMult * game.inspMult * game.scriptMult > 100 },
  { id: 14, name: 'Offline Progress', icon: '⏳', check: () => game.drops > 1e9 },
  { id: 15, name: 'Persistent Player', icon: '🏆', check: () => true } // placeholder
];

export function loadProgress() {
  const saved = localStorage.getItem('idleVerses');
  if (saved) {
    Object.assign(game, JSON.parse(saved));
    applyOffline();
  }
}

export function saveProgress() {
  localStorage.setItem('idleVerses', JSON.stringify(game));
}

function applyOffline() {
  const deltaSec = (Date.now() - game.lastUpdate) / 1000;
  if (deltaSec < 10) return;

  const offlineRate = 0.5;
  const mult = game.coldMult * game.inspMult * game.scriptMult;

  const dropGain = game.flakes * mult * deltaSec * offlineRate;
  game.drops += dropGain;
  game.totalDrops += dropGain;

  const chillGain = game.chillGen * mult * deltaSec * offlineRate;
  game.chill += chillGain;
  game.totalChill += chillGain;

  const inspGain = game.revel * mult * deltaSec * offlineRate;
  game.insp += inspGain;
  game.totalInsp += inspGain;

  const cvGain = game.verse * mult * deltaSec * offlineRate;
  game.chillverse += cvGain;

  game.lastUpdate = Date.now();
}

export function tick() {
  const mult = game.coldMult * game.inspMult * game.scriptMult;
  const dt = 0.1;

  game.drops += game.flakes * mult * dt;
  game.totalDrops += game.flakes * mult * dt;

  game.chill += game.chillGen * mult * dt;
  game.totalChill += game.chillGen * mult * dt;

  game.insp += game.revel * mult * dt;
  game.totalInsp += game.revel * mult * dt;

  game.chillverse += game.verse * mult * dt;

  game.lastUpdate = Date.now();

  checkAchievements();
}

function checkAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (ach.check() && !game.achievements.has(ach.id)) {
      game.achievements.add(ach.id);
    }
  });
}

export function harvest() {
  const mult = game.coldMult * game.inspMult * game.scriptMult;
  game.drops += 1 * mult;
  game.totalDrops += 1 * mult;
}

export function buyFlake() {
  if (game.drops >= game.flakeCost) {
    game.drops -= game.flakeCost;
    game.flakes++;
    game.flakeCost = Math.floor(game.flakeCost * 1.6);
  }
}

export function buyChillGen() {
  if (game.chill >= game.chillGenCost) {
    game.chill -= game.chillGenCost;
    game.chillGen++;
    game.chillGenCost = Math.floor(game.chillGenCost * 1.8);
  }
}

export function buyRevel() {
  if (game.insp >= game.revelCost) {
    game.insp -= game.revelCost;
    game.revel++;
    game.revelCost *= 2.1;
  }
}

export function buyVerse() {
  if (game.chillverse >= game.verseCost) {
    game.chillverse -= game.verseCost;
    game.verse++;
    game.verseCost *= 2.5;
  }
}

export function prestigeCold() {
  if (game.totalDrops < 1e21) return;
  const gain = Math.pow(game.totalDrops / 1e18, 0.3);
  game.coldMult *= 1 + gain;
  resetLower('cold');
}

export function prestigeInsp() {
  if (game.totalChill < 1e30) return;
  const gain = Math.pow(game.totalChill / 1e24, 0.25);
  game.inspMult *= 1 + gain;
  resetLower('insp');
}

export function prestigeScript() {
  if (game.totalInsp < 1e40) return;
  const gain = Math.pow(game.totalInsp / 1e32, 0.2);
  game.scriptMult *= 1 + gain;
  resetLower('script');
}

function resetLower(level) {
  if (level === 'cold' || level === 'insp' || level === 'script') {
    game.drops = 0;
    game.totalDrops = 0;
    game.flakes = 0;
    game.flakeCost = 10;
  }
  if (level === 'insp' || level === 'script') {
    game.chill = 0;
    game.totalChill = 0;
    game.chillGen = 0;
    game.chillGenCost = 100;
  }
  if (level === 'script') {
    game.insp = 0;
    game.totalInsp = 0;
    game.revel = 0;
    game.revelCost = 1e6;
    game.coldMult = 1;
    game.inspMult = 1;
  }
}

export function convertChill() {
  if (game.chill < 1000) return false;
  game.chill -= 1000;
  const msg = `${game.name}, you converted 1,000 Chill → 100 Diamonds.\nScreenshot this and send to Vicbot!`;
  document.getElementById('convert-text').textContent = msg;
  document.getElementById('convert-modal').showModal();
  return true;
}

export function formatNumber(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1e4) return Math.floor(n).toLocaleString();
  return n.toExponential(2).replace('e+', 'e');
}
