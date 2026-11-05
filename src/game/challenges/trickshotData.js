import { BALL_RADIUS, TABLE_HALF_WIDTH, TABLE_HALF_LENGTH } from '../physics/constants.js';

export const TRICKSHOT_CHALLENGES = [
  {
    id: 'ts_corner_snipe',
    title: 'Corner Snipe',
    difficulty: 'Easy',
    starsReward: 3,
    coinReward: 300,
    description: 'Cut the 8-ball smoothly around the barrier ball into the top-right corner pocket.',
    hint: 'Aim with a slight cut angle and moderate power (40%).',
    targetBallIds: [8],
    maxShots: 1,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -20, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 8, number: 8, type: 'eight', x: 45, z: -25, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      // Barrier obstacle
      { id: 3, number: 3, type: 'solid', x: 15, z: -12, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  },
  {
    id: 'ts_rail_hugger',
    title: 'The Rail Hugger',
    difficulty: 'Medium',
    starsReward: 3,
    coinReward: 450,
    description: 'The solid 1-ball is frozen against the top cushion. Guide it straight down into the top-right corner pocket.',
    hint: 'Hit the target ball thin with low power so it slides cleanly along the rail.',
    targetBallIds: [1],
    maxShots: 1,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -15, z: 15, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 1, number: 1, type: 'solid', x: 30, z: -TABLE_HALF_WIDTH + BALL_RADIUS + 0.2, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  },
  {
    id: 'ts_double_bank',
    title: 'Bank Shot Mastery',
    difficulty: 'Hard',
    starsReward: 3,
    coinReward: 600,
    description: 'Rebound the cue ball off the top cushion to strike and pot the 8-ball into the bottom-right corner pocket!',
    hint: 'Use the bank-shot trajectory guideline to align the cushion rebound vector.',
    targetBallIds: [8],
    maxShots: 1,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -10, z: 10, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 8, number: 8, type: 'eight', x: 40, z: 15, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  },
  {
    id: 'ts_combo_strike',
    title: 'The Combination',
    difficulty: 'Medium',
    starsReward: 3,
    coinReward: 500,
    description: 'Strike Ball 2 into Ball 8 to pot Ball 8 into the bottom-right pocket.',
    hint: 'Line up the center of Ball 2 directly through Ball 8 towards the pocket.',
    targetBallIds: [8],
    maxShots: 1,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -40, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 2, number: 2, type: 'solid', x: 0, z: 10, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 8, number: 8, type: 'eight', x: 45, z: 22, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  },
  {
    id: 'ts_through_needle',
    title: 'Through the Needle',
    difficulty: 'Expert',
    starsReward: 3,
    coinReward: 800,
    description: 'Thread the cue ball through a tight gate between two obstacle balls to sink the 8-ball.',
    hint: 'Use fine-aiming micro adjustments to avoid touching either obstacle ball.',
    targetBallIds: [8],
    maxShots: 1,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -50, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      // Needle gate
      { id: 4, number: 4, type: 'solid', x: 0, z: -5.5, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 5, number: 5, type: 'solid', x: 0, z: 5.5, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      // Target
      { id: 8, number: 8, type: 'eight', x: 50, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  },
  {
    id: 'ts_cluster_clear',
    title: 'Triple Pot Rush',
    difficulty: 'Master',
    starsReward: 3,
    coinReward: 1200,
    description: 'A tight triangle cluster. Pot all 3 balls in no more than 3 shots!',
    hint: 'Break hard on shot 1 to spread the cluster towards opposite pockets.',
    targetBallIds: [1, 2, 8],
    maxShots: 3,
    balls: [
      { id: 0, number: 0, type: 'cue', x: -35, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 1, number: 1, type: 'solid', x: 25, z: -3, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 2, number: 2, type: 'solid', x: 25, z: 3, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false },
      { id: 8, number: 8, type: 'eight', x: 30.5, z: 0, y: BALL_RADIUS, vx: 0, vz: 0, pocketed: false }
    ]
  }
];
