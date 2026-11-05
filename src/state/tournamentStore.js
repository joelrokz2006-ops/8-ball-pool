import { createTournamentBracket } from '../game/tournament/tournamentData.js';
import { playerStore } from './playerStore.js';

const STORAGE_KEY = 'billiards_tournament_data_v1';

function loadTournament() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not load tournament data:', err);
  }
  return createTournamentBracket();
}

function saveTournament(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Could not save tournament data:', err);
  }
}

let tournamentState = loadTournament();
const listeners = new Set();

export const tournamentStore = {
  getState() {
    return tournamentState;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    saveTournament(tournamentState);
    listeners.forEach((fn) => fn(tournamentState));
  },

  resetTournament() {
    tournamentState = createTournamentBracket();
    this.notify();
  },

  // Record player match victory and simulate other bracket matches in the round
  advancePlayerVictory() {
    const round = tournamentState.round;

    if (round === 'quarter') {
      // Player won Q1
      tournamentState.matches.quarter[0].winner = tournamentState.matches.quarter[0].playerA;

      // Simulate other 3 quarter-final bot matches
      for (let i = 1; i < 4; i++) {
        const m = tournamentState.matches.quarter[i];
        const winner = Math.random() < 0.5 ? m.playerA : m.playerB;
        m.winner = winner;
      }

      // Populate Semi-Finals
      tournamentState.matches.semi[0].playerA = tournamentState.matches.quarter[0].winner;
      tournamentState.matches.semi[0].playerB = tournamentState.matches.quarter[1].winner;

      tournamentState.matches.semi[1].playerA = tournamentState.matches.quarter[2].winner;
      tournamentState.matches.semi[1].playerB = tournamentState.matches.quarter[3].winner;

      tournamentState.round = 'semi';
      playerStore.addCoins(300);
      playerStore.addXP(200);
    } else if (round === 'semi') {
      // Player won Semi 1
      tournamentState.matches.semi[0].winner = tournamentState.matches.semi[0].playerA;

      // Simulate Semi 2
      const m2 = tournamentState.matches.semi[1];
      m2.winner = Math.random() < 0.5 ? m2.playerA : m2.playerB;

      // Populate Final
      tournamentState.matches.final[0].playerA = tournamentState.matches.semi[0].winner;
      tournamentState.matches.final[0].playerB = tournamentState.matches.semi[1].winner;

      tournamentState.round = 'final';
      playerStore.addCoins(600);
      playerStore.addXP(400);
    } else if (round === 'final') {
      // Player won Championship!
      tournamentState.matches.final[0].winner = tournamentState.matches.final[0].playerA;
      tournamentState.champion = tournamentState.matches.final[0].playerA;
      tournamentState.round = 'completed';

      playerStore.addCoins(tournamentState.prizePool);
      playerStore.addXP(1000);
    }

    this.notify();
  },

  getCurrentOpponent() {
    const round = tournamentState.round;
    if (round === 'quarter') return tournamentState.matches.quarter[0].playerB;
    if (round === 'semi') return tournamentState.matches.semi[0].playerB;
    if (round === 'final') return tournamentState.matches.final[0].playerB;
    return null;
  }
};
