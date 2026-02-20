// js/game.js – Fixed achievements Set handling + safe loading

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
  achievements: new Set(),          // live data must be Set
  lastUpdate: Date.now()
};

export const ACHIEVEMENTS = [
  { id: 1, name: 'First 1,000 Drops', icon: '👆', check: () => window.game.totalDrops >= 1e3 },
  { id: 2, name: 'First Flake', icon: '❄️', check: () => window.game.flakes >= 1 },
  { id: 3, name: '1e12 Drops', icon: '💧', check: () => window.game.totalDrops >= 1e12 },
  { id: 4, name: 'First Cold Prestige', icon: '🧊', check: () => window.game.coldMult > 1 },
  { id: 5, name: '10 Flakes', icon: '❄️×10', check: () => window.game.flakes >= 10 },
  { id: 6, name: '1e9 Chill', icon: '🌬️', check: () => window.game.totalChill >= 1e9 },
  { id: 7, name: 'First Chill Gen', icon: '⚙️', check: () => window.game.chillGen >= 1 },
  { id: 8, name: '1e18 Chill', icon: '🌬️×∞', check: () => window.game.totalChill >= 1e18 },
  { id: 9, name: 'First Insp Prestige', icon: '💡', check: () => window.game.inspMult > 1 },
  { id: 10, name: '5 Revels', icon: '✨', check: () => window.game.revel >= 5 },
  { id: 11, name: '1e30 Insp', icon: '💡×∞', check: () => window.game.totalInsp >= 1e30 },
  { id: 12, name: '1e50 ChillVerse', icon: '🌌', check: () => window.game.chillverse >= 1e50 },
  { id: 13, name: 'Multiple Prestiges', icon: '🔄', check: () => window.game.coldMult * window.game.inspMult * window.game.scriptMult > 100 },
  { id: 14, name: 'Offline Progress', icon: '⏳', check: () => window.game.drops > 1e9 },
  { id: 15, name: 'Persistent Player', icon: '🏆', check: () => true }
];

export function loadProgress() {
  const saved = localStorage.getItem('idleVerses');
  if (saved) {
    let data;
    try {
      data = JSON.parse(saved);
    } catch (e) {
      console.error("Corrupted save data – starting fresh", e);
      return;
    }

    // Safely restore achievements as Set
    const savedAchievements = Array.isArray(data.achievements) ? data.achievements : [];
    window.game.achievements = new Set(savedAchievements);

    // Copy all other properties safely
    Object.assign(window.game, {
      name: data.name ?? 'Guest',
      phone: data.phone ?? '',
      drops: data.drops ?? 0,
      totalDrops: data.totalDrops ?? 0,
      flakes: data.flakes ?? 0,
      flakeCost: data.flakeCost ?? 10,
      chill: data.chill ?? 0,
      totalChill: data.totalChill ?? 0,
      chillGen: data.chillGen ?? 0,
      chillGenCost: data.chillGenCost ?? 100,
      insp: data.insp ?? 0,
      totalInsp: data.totalInsp ?? 0,
      revel: data.revel ?? 0,
      revelCost: data.revelCost ?? 1e6,
      verse: data.verse ?? 0,
      verseCost: data.verseCost ?? 1e12,
      chillverse: data.chillverse ?? 0,
      coldMult: data.coldMult ?? 1,
      inspMult: data.inspMult ?? 1,
      scriptMult: data.scriptMult ?? 1,
      lastUpdate: data.lastUpdate ?? Date.now()
    });

    applyOffline();
  }
}

export function saveProgress() {
  // Convert Set → Array only for saving
  const saveData = {
    ...window.game,
    achievements: Array.from(window.game.achievements)
  };
  localStorage.setItem('idleVerses', JSON.stringify(saveData));
}

function applyOffline() {
  const deltaSec = (Date.now() - window.game.lastUpdate) / 1000;
  if (deltaSec < 10) return;

  const offlineRate = 0.5;
  const mult = window.game.coldMult * window.game.inspMult * window.game.scriptMult;

  window.game.drops += window.game.flakes * mult * deltaSec * offlineRate;
  window.game.totalDrops += window.game.flakes * mult * deltaSec * offlineRate;
  window.game.chill += window.game.chillGen * mult * deltaSec * offlineRate;
  window.game.totalChill += window.game.chillGen * mult * deltaSec * offlineRate;
  window.game.insp += window.game.revel * mult * deltaSec * offlineRate;
  window.game.totalInsp += window.game.revel * mult * deltaSec * offlineRate;
  window.game.chillverse += window.game.verse * mult * deltaSec * offlineRate;

  window.game.lastUpdate = Date.now();
}

export function tick() {
  const g = window.game;
  const mult = g.coldMult * g.inspMult * g.scriptMult;
  const dt = 0.1;

  g.drops += g.flakes * mult * dt;
  g.totalDrops += g.flakes * mult * dt;
  g.chill += g.chillGen * mult * dt;
  g.totalChill += g.chillGen * mult * dt;
  g.insp += g.revel * mult * dt;
  g.totalInsp += g.revel * mult * dt;
  g.chillverse += g.verse * mult * dt;

  g.lastUpdate = Date.now();

  ACHIEVEMENTS.forEach(ach => {
    if (ach.check && ach.check() && !g.achievements.has(ach.id)) {
      g.achievements.add(ach.id);
    }
  });
}

export function harvest() {
  const mult = window.game.coldMult * window.game.inspMult * window.game.scriptMult;
  window.game.drops += 1 * mult;
  window.game.totalDrops += 1 * mult;
}

export function buyFlake() {
  if (window.game.drops >= window.game.flakeCost) {
    window.game.drops -= window.game.flakeCost;
    window.game.flakes++;
    window.game.flakeCost = Math.floor(window.game.flakeCost * 1.6);
  }
}

export function buyChillGen() {
  if (window.game.chill >= window.game.chillGenCost) {
    window.game.chill -= window.game.chillGenCost;
    window.game.chillGen++;
    window.game.chillGenCost = Math.floor(window.game.chillGenCost * 1.8);
  }
}

export function buyRevel() {
  if (window.game.insp >= window.game.revelCost) {
    window.game.insp -= window.game.revelCost;
    window.game.revel++;
    window.game.revelCost *= 2.1;
  }
}

export function buyVerse() {
  if (window.game.chillverse >= window.game.verseCost) {
    window.game.chillverse -= window.game.verseCost;
    window.game.verse++;
    window.game.verseCost *= 2.5;
  }
}

export function prestigeCold() {
  if (window.game.totalDrops < 1e21) return;
  const gain = Math.pow(window.game.totalDrops / 1e18, 0.3);
  window.game.coldMult *= 1 + gain;
  resetLower('cold');
}

export function prestigeInsp() {
  if (window.game.totalChill < 1e30) return;
  const gain = Math.pow(window.game.totalChill / 1e24, 0.25);
  window.game.inspMult *= 1 + gain;
  resetLower('insp');
}

export function prestigeScript() {
  if (window.game.totalInsp < 1e40) return;
  const gain = Math.pow(window.game.totalInsp / 1e32, 0.2);
  window.game.scriptMult *= 1 + gain;
  resetLower('script');
}

function resetLower(level) {
  const g = window.game;
  if (level === 'cold' || level === 'insp' || level === 'script') {
    g.drops = 0; g.totalDrops = 0; g.flakes = 0; g.flakeCost = 10;
  }
  if (level === 'insp' || level === 'script') {
    g.chill = 0; g.totalChill = 0; g.chillGen = 0; g.chillGenCost = 100;
  }
  if (level === 'script') {
    g.insp = 0; g.totalInsp = 0; g.revel = 0; g.revelCost = 1e6;
    g.coldMult = 1; g.inspMult = 1;
  }
}

export function convertChill() {
  if (window.game.chill < 1000) return false;
  window.game.chill -= 1000;
  const msg = `${window.game.name}, you converted 1,000 Chill → 100 Diamonds.\nScreenshot this and send to Vicbot!`;
  document.getElementById('convert-text').textContent = msg;
  document.getElementById('convert-modal').showModal();
  return true;
}

export function formatNumber(n) {
  if (!isFinite(n)) return '∞';
  if (n < 1e4) return Math.floor(n).toLocaleString();
  return n.toExponential(2).replace('e+', 'e');
}
