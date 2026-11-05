/**
 * Player Progression, Inventory, and Achievements Store
 * Persisted to localStorage
 */

const STORAGE_KEY = 'billiards_player_data_v1';

export const CUES_CATALOG = [
  {
    id: 'cue_walnut',
    name: 'Classic Walnut',
    price: 0,
    powerBonus: 1.0,
    aimBonus: 1.0,
    spinBonus: 1.0,
    colors: ['#4a2e1b', '#26160e', '#d9b56d'],
    description: 'Traditional solid American walnut with polished brass joint.'
  },
  {
    id: 'cue_emerald',
    name: 'Emerald Prestige',
    price: 500,
    powerBonus: 1.08,
    aimBonus: 1.12,
    spinBonus: 1.1,
    colors: ['#087a50', '#04573a', '#d9b56d'],
    description: 'Hand-crafted green pearlescent inlays with gold trims.'
  },
  {
    id: 'cue_carbon',
    name: 'Midnight Carbon',
    price: 1200,
    powerBonus: 1.15,
    aimBonus: 1.18,
    spinBonus: 1.2,
    colors: ['#1e252b', '#0d1114', '#00f0ff'],
    description: 'Ultra-light aerospace carbon fiber shaft with electric cyan rings.'
  },
  {
    id: 'cue_royal_gold',
    name: 'Royal Sovereign',
    price: 2500,
    powerBonus: 1.22,
    aimBonus: 1.25,
    spinBonus: 1.25,
    colors: ['#d9b56d', '#875d1f', '#ffffff'],
    description: 'Pure 24k gold leaf filigree with ivory grip.'
  },
  {
    id: 'cue_cyber_neon',
    name: 'Cyberpunk Neon',
    price: 5000,
    powerBonus: 1.3,
    aimBonus: 1.3,
    spinBonus: 1.35,
    colors: ['#ff0055', '#7a00ff', '#00ffee'],
    description: 'Futuristic fiber-optic glow stick with reactive LED pulse.'
  }
];

export const FELT_CATALOG = [
  {
    id: 'felt_classic_emerald',
    name: 'Classic Emerald',
    price: 0,
    color: '#087a50',
    darkColor: '#04573a',
    description: 'Standard tournament Simonis worsted green felt.'
  },
  {
    id: 'felt_royal_navy',
    name: 'Royal Navy',
    price: 400,
    color: '#1a3a60',
    darkColor: '#0f223a',
    description: 'Deep championship electric blue felt with high contrast.'
  },
  {
    id: 'felt_burgundy_wine',
    name: 'Burgundy Velvet',
    price: 800,
    color: '#6e1d24',
    darkColor: '#441015',
    description: 'Rich wine red felt favored in classic vintage halls.'
  },
  {
    id: 'felt_midnight_charcoal',
    name: 'Midnight Slate',
    price: 1500,
    color: '#222827',
    darkColor: '#141817',
    description: 'Stealth charcoal felt for modern minimalist clubs.'
  },
  {
    id: 'felt_violet_luxury',
    name: 'Imperial Violet',
    price: 2200,
    color: '#491b6d',
    darkColor: '#2b0f42',
    description: 'Regal royal purple felt with smooth napless glide.'
  }
];

export const ACHIEVEMENTS = [
  {
    id: 'first_win',
    title: 'First Victory',
    desc: 'Win your first 8-ball match',
    reward: 200,
    target: 1,
    icon: 'Trophy'
  },
  {
    id: 'break_master',
    title: 'Break Master',
    desc: 'Pocket at least one ball on the break shot',
    reward: 150,
    target: 1,
    icon: 'Zap'
  },
  {
    id: 'pot_50',
    title: 'Sharpshooter',
    desc: 'Pocket 50 balls total',
    reward: 500,
    target: 50,
    icon: 'Target'
  },
  {
    id: 'clean_sheet',
    title: 'Clean Run',
    desc: 'Win a match without committing a single foul',
    reward: 350,
    target: 1,
    icon: 'ShieldCheck'
  },
  {
    id: 'win_streak_3',
    title: 'On Fire',
    desc: 'Achieve a 3-match win streak',
    reward: 600,
    target: 3,
    icon: 'Flame'
  }
];

const DEFAULT_DATA = {
  name: 'Billiards Pro',
  avatar: '🎱',
  level: 1,
  xp: 0,
  coins: 500,
  equippedCueId: 'cue_walnut',
  equippedFeltId: 'felt_classic_emerald',
  ownedCueIds: ['cue_walnut'],
  ownedFeltIds: ['felt_classic_emerald'],
  stats: {
    matchesPlayed: 0,
    matchesWon: 0,
    currentStreak: 0,
    bestStreak: 0,
    ballsPocketed: 0,
    foulsCommitted: 0,
    breaksMade: 0
  },
  unlockedAchievements: []
};

function loadPlayerData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_DATA, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Could not load player data from storage:', err);
  }
  return { ...DEFAULT_DATA };
}

function savePlayerData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save player data to storage:', err);
  }
}

let currentPlayerData = loadPlayerData();
const listeners = new Set();

export const playerStore = {
  getState() {
    return currentPlayerData;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    savePlayerData(currentPlayerData);
    listeners.forEach((fn) => fn(currentPlayerData));
  },

  updateProfile(name, avatar) {
    if (name) currentPlayerData.name = name.trim().slice(0, 18);
    if (avatar) currentPlayerData.avatar = avatar;
    this.notify();
  },

  addCoins(amount) {
    currentPlayerData.coins = Math.max(0, currentPlayerData.coins + amount);
    this.notify();
  },

  addXP(amount) {
    currentPlayerData.xp += amount;
    // Level up formula: Level = 1 + floor(sqrt(xp / 100))
    const newLevel = 1 + Math.floor(Math.sqrt(currentPlayerData.xp / 100));
    if (newLevel > currentPlayerData.level) {
      const levelDiff = newLevel - currentPlayerData.level;
      currentPlayerData.level = newLevel;
      // Level up reward
      currentPlayerData.coins += levelDiff * 250;
    }
    this.notify();
  },

  buyCue(cueId) {
    const cue = CUES_CATALOG.find((c) => c.id === cueId);
    if (!cue || currentPlayerData.ownedCueIds.includes(cueId)) return false;
    if (currentPlayerData.coins < cue.price) return false;

    currentPlayerData.coins -= cue.price;
    currentPlayerData.ownedCueIds.push(cueId);
    currentPlayerData.equippedCueId = cueId;
    this.notify();
    return true;
  },

  equipCue(cueId) {
    if (currentPlayerData.ownedCueIds.includes(cueId)) {
      currentPlayerData.equippedCueId = cueId;
      this.notify();
    }
  },

  buyFelt(feltId) {
    const felt = FELT_CATALOG.find((f) => f.id === feltId);
    if (!felt || currentPlayerData.ownedFeltIds.includes(feltId)) return false;
    if (currentPlayerData.coins < felt.price) return false;

    currentPlayerData.coins -= felt.price;
    currentPlayerData.ownedFeltIds.push(feltId);
    currentPlayerData.equippedFeltId = feltId;
    this.notify();
    return true;
  },

  equipFelt(feltId) {
    if (currentPlayerData.ownedFeltIds.includes(feltId)) {
      currentPlayerData.equippedFeltId = feltId;
      this.notify();
    }
  },

  recordMatchEnd(isWin, ballsPocketedCount, foulsCount) {
    const s = currentPlayerData.stats;
    s.matchesPlayed += 1;
    s.ballsPocketed += ballsPocketedCount;
    s.foulsCommitted += foulsCount;

    if (isWin) {
      s.matchesWon += 1;
      s.currentStreak += 1;
      if (s.currentStreak > s.bestStreak) {
        s.bestStreak = s.currentStreak;
      }
      this.addCoins(100);
      this.addXP(150);
    } else {
      s.currentStreak = 0;
      this.addCoins(25);
      this.addXP(40);
    }

    // Check achievements
    this.checkAchievements();
    this.notify();
  },

  checkAchievements() {
    const s = currentPlayerData.stats;
    const unlocked = new Set(currentPlayerData.unlockedAchievements);

    ACHIEVEMENTS.forEach((ach) => {
      if (unlocked.has(ach.id)) return;

      let achieved = false;
      if (ach.id === 'first_win' && s.matchesWon >= 1) achieved = true;
      if (ach.id === 'pot_50' && s.ballsPocketed >= 50) achieved = true;
      if (ach.id === 'win_streak_3' && s.bestStreak >= 3) achieved = true;
      if (ach.id === 'clean_sheet' && s.matchesWon >= 1 && s.foulsCommitted === 0) achieved = true;

      if (achieved) {
        currentPlayerData.unlockedAchievements.push(ach.id);
        currentPlayerData.coins += ach.reward;
      }
    });
  },

  resetProgress() {
    currentPlayerData = { ...DEFAULT_DATA };
    this.notify();
  }
};
