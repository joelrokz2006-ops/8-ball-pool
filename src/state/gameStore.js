/**
 * Billiards Match State Machine and Game Store
 */

import { initializeBalls, areBallsSettled } from '../game/physics/simulation.js';
import { evaluateShot, getBallGroup, BALL_GROUPS } from '../game/rules/eightBallRules.js';
import { HEAD_STRING_X, TABLE_HALF_WIDTH, TABLE_HALF_LENGTH, BALL_RADIUS } from '../game/physics/constants.js';
import { audioManager } from '../game/audio/audioManager.js';
import { playerStore } from './playerStore.js';
import { settingsStore } from './settingsStore.js';
import { tournamentStore } from './tournamentStore.js';

let gameState = createInitialState();
const listeners = new Set();
let particleCallback = null;

function createInitialState() {
  return {
    mode: 'ai', // 'practice', 'ai', 'local2p', 'challenge', 'tournament'
    difficulty: 'medium',
    activeChallenge: null,
    phase: 'aiming', // 'aiming', 'shooting', 'moving', 'ballInHand', 'gameover', 'paused'
    isBreakShot: true,
    tableOpen: true,
    cueChalked: false,
    potStreak: 0,
    comboText: null,
    currentPlayerId: 'player1',
    opponentPlayerId: 'player2',
    players: {
      player1: { id: 'player1', name: 'Player 1', avatar: '🎱', isAI: false },
      player2: { id: 'player2', name: 'AI Opponent', avatar: '🤖', isAI: true }
    },
    playerGroups: {
      player1: null,
      player2: null
    },
    balls: initializeBalls(),
    shot: {
      angle: Math.PI / 2, // Facing positive X (towards rack apex)
      power: 0.55,
      cueSpin: { x: 0, y: 0 },
      isCharging: false,
      pullBack: 0
    },
    shotEvent: {
      firstBallHit: null,
      ballsPocketed: [],
      cushionsContactedAfterBallHit: 0,
      cushionsContactedBeforeBallHit: 0,
      cueBallPocketed: false,
      eightBallPocketed: false
    },
    statusMessage: 'Break shot! Aim and release power to break the rack.',
    lastFoul: null,
    winnerId: null,
    matchStats: {
      shotsTaken: 0,
      ballsPocketed: 0,
      fouls: 0,
      startTime: Date.now(),
      durationSeconds: 0
    }
  };
}

export const gameStore = {
  getState() {
    return gameState;
  },

  setParticleCallback(cb) {
    particleCallback = cb;
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  notify() {
    listeners.forEach((fn) => fn(gameState));
  },

  startMatch(mode = 'ai', difficulty = 'medium', customData = null) {
    const pStore = playerStore.getState();
    const isLocal2P = mode === 'local2p';
    const isPractice = mode === 'practice';
    const isTournament = mode === 'tournament';
    const isChallenge = mode === 'challenge';

    const p1 = {
      id: 'player1',
      name: pStore.name || 'Player 1',
      avatar: pStore.avatar || '🎱',
      isAI: false
    };

    let p2;
    if (isPractice) {
      p2 = { id: 'player2', name: 'Solo Target', avatar: '🎯', isAI: false };
    } else if (isLocal2P) {
      p2 = { id: 'player2', name: 'Player 2', avatar: '👤', isAI: false };
    } else if (isTournament && customData) {
      p2 = {
        id: customData.id,
        name: customData.name,
        avatar: customData.avatar,
        isAI: true
      };
    } else if (isChallenge) {
      p2 = { id: 'player2', name: 'Academy Target', avatar: '⭐', isAI: false };
    } else {
      const aiNames = {
        easy: 'Rookie Ray',
        medium: 'Club Champ Leo',
        hard: 'Master Hustler'
      };
      p2 = {
        id: 'player2',
        name: aiNames[difficulty] || 'AI Opponent',
        avatar: difficulty === 'hard' ? '👑' : difficulty === 'medium' ? '🎩' : '🧢',
        isAI: true
      };
    }

    let initialBalls;
    if (isChallenge && customData?.balls) {
      initialBalls = customData.balls.map((b) => ({
        ...b,
        y: BALL_RADIUS,
        vx: 0,
        vz: 0,
        spinX: 0,
        spinZ: 0,
        pocketed: false,
        pocketProgress: 0,
        quaternion: [0, 0, 0, 1]
      }));
    } else {
      initialBalls = initializeBalls();
    }

    gameState = {
      ...createInitialState(),
      mode,
      difficulty,
      activeChallenge: isChallenge ? customData : null,
      players: { player1: p1, player2: p2 },
      balls: initialBalls,
      isBreakShot: !isChallenge,
      tableOpen: !isChallenge,
      statusMessage: isChallenge ? customData.description : 'Break shot! Aim and release power to break the rack.',
      matchStats: {
        shotsTaken: 0,
        ballsPocketed: 0,
        fouls: 0,
        startTime: Date.now(),
        durationSeconds: 0
      }
    };

    this.notify();
  },

  chalkCue() {
    gameState.cueChalked = true;
    audioManager.playChalk();
    settingsStore.triggerHaptic(20);
    gameState.statusMessage = 'Cue chalked! Optimal contact grip.';
    this.notify();
  },

  setAimAngle(angle) {
    if (gameState.phase !== 'aiming') return;
    gameState.shot.angle = angle;
    this.notify();
  },

  setShotPower(power) {
    if (gameState.phase !== 'aiming') return;
    gameState.shot.power = Math.max(0.05, Math.min(1.0, power));
    gameState.shot.pullBack = gameState.shot.power;
    this.notify();
  },

  setCueSpin(x, y) {
    gameState.shot.cueSpin = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y))
    };
    this.notify();
  },

  executeShot() {
    if (gameState.phase !== 'aiming') return;

    const cueBall = gameState.balls.find((b) => b.id === 0);
    if (!cueBall || cueBall.pocketed) return;

    const power = gameState.shot.power;
    const speed = 12 + power * 46;

    const angle = gameState.shot.angle;
    cueBall.vx = Math.sin(angle) * speed;
    cueBall.vz = Math.cos(angle) * speed;

    // Apply spin english
    cueBall.spinX = gameState.shot.cueSpin.x * 6;
    cueBall.spinZ = gameState.shot.cueSpin.y * 6;

    // Play strike sound and trigger subtle vibration
    audioManager.playCueHit(power);
    settingsStore.triggerHaptic(30);

    // Trigger chalk dust particle burst at strike point
    if (particleCallback) {
      particleCallback('chalk', {
        x: cueBall.x,
        y: BALL_RADIUS,
        z: cueBall.z,
        angle,
        power
      });
    }

    gameState.cueChalked = false;

    // Reset shot event tracking
    gameState.shotEvent = {
      firstBallHit: null,
      ballsPocketed: [],
      cushionsContactedAfterBallHit: 0,
      cushionsContactedBeforeBallHit: 0,
      cueBallPocketed: false,
      eightBallPocketed: false
    };

    gameState.comboText = null;
    gameState.matchStats.shotsTaken += 1;
    gameState.phase = 'moving';
    gameState.statusMessage = 'Shot in motion...';

    this.notify();
  },

  recordBallCollision(ballA, ballB, relativeSpeed) {
    audioManager.playBallClack(relativeSpeed);
    settingsStore.triggerHaptic(15);

    // Trigger golden collision sparks
    if (relativeSpeed > 10 && particleCallback) {
      const midX = (ballA.x + ballB.x) * 0.5;
      const midZ = (ballA.z + ballB.z) * 0.5;
      particleCallback('collision', { x: midX, y: BALL_RADIUS, z: midZ, speed: relativeSpeed });
    }

    if (gameState.phase === 'moving' && !gameState.shotEvent.firstBallHit) {
      if (ballA.id === 0) {
        gameState.shotEvent.firstBallHit = ballB;
      } else if (ballB.id === 0) {
        gameState.shotEvent.firstBallHit = ballA;
      }
    }
  },

  recordCushionCollision(ball, cushion, speed) {
    audioManager.playCushion(speed);

    if (gameState.phase === 'moving') {
      if (gameState.shotEvent.firstBallHit) {
        gameState.shotEvent.cushionsContactedAfterBallHit += 1;
      } else {
        gameState.shotEvent.cushionsContactedBeforeBallHit += 1;
      }
    }
  },

  recordBallPocketed(ball, pocket) {
    audioManager.playPocket();
    settingsStore.triggerHaptic(40);

    // Trigger emerald/gold celebratory pocket sparkles
    if (particleCallback) {
      particleCallback('pocket', { x: pocket.x, y: 0.5, z: pocket.z });
    }

    if (ball.id === 0) {
      gameState.shotEvent.cueBallPocketed = true;
    } else if (ball.id === 8) {
      gameState.shotEvent.eightBallPocketed = true;
    } else {
      gameState.shotEvent.ballsPocketed.push(ball);
      gameState.matchStats.ballsPocketed += 1;
    }
  },

  onBallsSettled() {
    if (gameState.phase !== 'moving') return;

    // 1. Challenge Mode Evaluation
    if (gameState.mode === 'challenge' && gameState.activeChallenge) {
      const ch = gameState.activeChallenge;
      const cueBall = gameState.balls.find((b) => b.id === 0);
      const isCueScratched = cueBall ? cueBall.pocketed : true;

      // Check if all target balls pocketed
      const allTargetsPocketed = ch.targetBallIds.every((id) => {
        const b = gameState.balls.find((ball) => ball.id === id);
        return b && b.pocketed;
      });

      if (allTargetsPocketed && !isCueScratched) {
        // Challenge Complete!
        audioManager.playWin();
        audioManager.playCheer();
        playerStore.addCoins(ch.coinReward);
        playerStore.addXP(250);

        gameState.phase = 'gameover';
        gameState.winnerId = 'player1';
        gameState.statusMessage = `Challenge Completed! 3 Stars earned! (+${ch.coinReward} Coins)`;
        this.notify();
        return;
      }

      if (gameState.matchStats.shotsTaken >= ch.maxShots || isCueScratched) {
        // Challenge Failed
        audioManager.playFoul();
        gameState.phase = 'gameover';
        gameState.winnerId = 'player2';
        gameState.statusMessage = isCueScratched ? 'Scratch! Challenge failed.' : 'Out of shots! Challenge failed.';
        this.notify();
        return;
      }

      // Next shot in challenge
      gameState.phase = 'aiming';
      gameState.statusMessage = `${ch.maxShots - gameState.matchStats.shotsTaken} shot(s) remaining!`;
      this.notify();
      return;
    }

    // 2. Practice Mode Evaluation
    if (gameState.mode === 'practice') {
      const cueBall = gameState.balls.find((b) => b.id === 0);
      if (cueBall.pocketed) {
        cueBall.pocketed = false;
        cueBall.pocketProgress = 0;
        cueBall.x = HEAD_STRING_X;
        cueBall.z = 0;
        cueBall.vx = 0;
        cueBall.vz = 0;
        gameState.statusMessage = 'Cue ball scratched. Re-spotted at head string.';
      } else {
        gameState.statusMessage = 'Practice shot complete. Keep practicing!';
      }
      gameState.phase = 'aiming';
      gameState.isBreakShot = false;
      this.notify();
      return;
    }

    // 3. Official 8-Ball WPA Rules Evaluation
    const result = evaluateShot(gameState.shotEvent, gameState);

    gameState.isBreakShot = false;
    gameState.tableOpen = result.newTableOpen;
    gameState.playerGroups = result.newPlayerGroups;
    gameState.lastFoul = result.foul;

    if (result.winnerId) {
      // Game Over!
      gameState.phase = 'gameover';
      gameState.winnerId = result.winnerId;
      gameState.statusMessage = result.message;
      gameState.matchStats.durationSeconds = Math.round((Date.now() - gameState.matchStats.startTime) / 1000);

      const isP1Win = result.winnerId === 'player1';
      playerStore.recordMatchEnd(isP1Win, gameState.matchStats.ballsPocketed, gameState.matchStats.fouls);

      if (isP1Win) {
        audioManager.playWin();
        audioManager.playCheer();
        if (gameState.mode === 'tournament') {
          tournamentStore.advancePlayerVictory();
        }
      } else {
        audioManager.playFoul();
      }
    } else if (result.foul) {
      audioManager.playFoul();
      gameState.potStreak = 0;
      gameState.matchStats.fouls += 1;
      gameState.currentPlayerId = result.nextPlayerId;
      gameState.opponentPlayerId = result.nextPlayerId === 'player1' ? 'player2' : 'player1';
      gameState.statusMessage = `${result.message} - Ball in Hand!`;

      // Respawn cue ball for placement
      const cueBall = gameState.balls.find((b) => b.id === 0);
      cueBall.pocketed = false;
      cueBall.pocketProgress = 0;
      cueBall.x = HEAD_STRING_X;
      cueBall.z = 0;
      cueBall.vx = 0;
      cueBall.vz = 0;

      gameState.phase = 'ballInHand';
    } else {
      // Clean shot outcome
      if (result.continuesTurn) {
        gameState.potStreak += 1;
        if (gameState.potStreak >= 2) {
          gameState.comboText = `${gameState.potStreak} IN A ROW!`;
          audioManager.playCombo(gameState.potStreak);
        } else if (gameState.shotEvent.cushionsContactedBeforeBallHit > 0) {
          gameState.comboText = 'BANK SHOT!';
          audioManager.playCombo(1);
        } else {
          gameState.comboText = 'GREAT POT!';
        }
      } else {
        gameState.potStreak = 0;
      }

      gameState.currentPlayerId = result.nextPlayerId;
      gameState.opponentPlayerId = result.nextPlayerId === 'player1' ? 'player2' : 'player1';
      gameState.statusMessage = result.message;
      gameState.phase = 'aiming';
    }

    this.notify();
  },

  placeCueBall(x, z) {
    const cueBall = gameState.balls.find((b) => b.id === 0);
    if (!cueBall) return;

    const margin = BALL_RADIUS * 1.5;
    const clampedX = Math.max(-TABLE_HALF_WIDTH + margin, Math.min(TABLE_HALF_WIDTH - margin, x));
    const clampedZ = Math.max(-TABLE_HALF_LENGTH + margin, Math.min(TABLE_HALF_LENGTH - margin, z));

    cueBall.x = clampedX;
    cueBall.z = clampedZ;
    cueBall.y = BALL_RADIUS;
    cueBall.vx = 0;
    cueBall.vz = 0;
    cueBall.pocketed = false;
    cueBall.pocketProgress = 0;

    gameState.phase = 'aiming';
    gameState.statusMessage = `${gameState.players[gameState.currentPlayerId].name}'s turn. Aim and shoot.`;
    this.notify();
  },

  resetRack() {
    gameState.balls = initializeBalls();
    gameState.isBreakShot = true;
    gameState.tableOpen = true;
    gameState.playerGroups = { player1: null, player2: null };
    gameState.phase = 'aiming';
    gameState.shot.angle = Math.PI / 2;
    gameState.statusMessage = 'Table reset. Break shot ready!';
    gameState.winnerId = null;
    gameState.lastFoul = null;
    gameState.potStreak = 0;
    gameState.comboText = null;
    this.notify();
  },

  pauseMatch() {
    if (gameState.phase !== 'gameover') {
      gameState.previousPhase = gameState.phase;
      gameState.phase = 'paused';
      this.notify();
    }
  },

  resumeMatch() {
    if (gameState.phase === 'paused') {
      gameState.phase = gameState.previousPhase || 'aiming';
      this.notify();
    }
  }
};
