import { initializeBalls } from '../physics/simulation.js';
import { evaluateShot, getBallGroup, BALL_GROUPS, FOUL_REASONS } from './eightBallRules.js';
import { calculateTrajectory } from '../physics/trajectory.js';
import { HEAD_STRING_X, FOOT_SPOT_X } from '../physics/constants.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ ${message}`);
}

console.log('\n--- RUNNING 8-BALL BILLIARDS ENGINE TESTS (2:1 LANDSCAPE) ---\n');

// 1. Rack Layout Verification
const balls = initializeBalls();
assert(balls.length === 16, 'Rack initializes exactly 16 balls');
assert(balls[0].id === 0 && balls[0].type === 'cue', 'Ball 0 is Cue Ball');
assert(balls[8].id === 8 && balls[8].type === 'eight', 'Ball 8 is Eight Ball');
assert(balls[0].x === HEAD_STRING_X && balls[0].z === 0, 'Cue Ball is at head string (-45, 0)');

const solids = balls.filter((b) => b.type === 'solid');
const stripes = balls.filter((b) => b.type === 'stripe');
assert(solids.length === 7, 'Rack has exactly 7 solids (1-7)');
assert(stripes.length === 7, 'Rack has exactly 7 stripes (9-15)');

// 2. Open Table Group Assignment
const matchState = {
  currentPlayerId: 'player1',
  opponentPlayerId: 'player2',
  playerGroups: { player1: null, player2: null },
  isBreakShot: false,
  tableOpen: true,
  balls
};

const openShotEvent = {
  firstBallHit: balls[3], // Solid 3
  ballsPocketed: [balls[3]],
  cushionsContactedAfterBallHit: 1,
  cueBallPocketed: false,
  eightBallPocketed: false
};

const openResult = evaluateShot(openShotEvent, matchState);
assert(!openResult.foul, 'Legal open shot has no fouls');
assert(openResult.continuesTurn === true, 'Player continues turn on legal pocket');
assert(openResult.newPlayerGroups.player1 === BALL_GROUPS.SOLIDS, 'Player 1 assigned SOLIDS');
assert(openResult.newPlayerGroups.player2 === BALL_GROUPS.STRIPES, 'Player 2 assigned STRIPES');
assert(openResult.newTableOpen === false, 'Table is closed after group assignment');

// 3. Scratch Foul
const scratchEvent = {
  firstBallHit: balls[3],
  ballsPocketed: [balls[3]],
  cushionsContactedAfterBallHit: 1,
  cueBallPocketed: true,
  eightBallPocketed: false
};
const scratchResult = evaluateShot(scratchEvent, matchState);
assert(scratchResult.foul === FOUL_REASONS.SCRATCH, 'Cue ball scratch detected as foul');
assert(scratchResult.ballInHand === true, 'Incoming player receives Ball-in-Hand on scratch');
assert(scratchResult.nextPlayerId === 'player2', 'Turn passes to opponent on foul');

// 4. Wrong First Hit Foul
const assignedState = {
  currentPlayerId: 'player1',
  opponentPlayerId: 'player2',
  playerGroups: { player1: BALL_GROUPS.SOLIDS, player2: BALL_GROUPS.STRIPES },
  isBreakShot: false,
  tableOpen: false,
  balls
};

const wrongHitEvent = {
  firstBallHit: balls[11], // Stripe 11 (opponent ball!)
  ballsPocketed: [],
  cushionsContactedAfterBallHit: 1,
  cueBallPocketed: false,
  eightBallPocketed: false
};
const wrongHitResult = evaluateShot(wrongHitEvent, assignedState);
assert(wrongHitResult.foul === FOUL_REASONS.WRONG_FIRST_HIT, 'Hitting opponent ball first is a foul');

// 5. Premature 8-Ball Pocketing = Instant Loss
const earlyEightEvent = {
  firstBallHit: balls[8],
  ballsPocketed: [balls[8]],
  cushionsContactedAfterBallHit: 0,
  cueBallPocketed: false,
  eightBallPocketed: true
};
const earlyEightResult = evaluateShot(earlyEightEvent, assignedState);
assert(earlyEightResult.winnerId === 'player2', 'Pocketing 8-ball early awards instant win to opponent');

// 6. Legal 8-Ball Pocketing = Instant Win
const clearedBalls = balls.map((b) => {
  if (b.type === 'solid') return { ...b, pocketed: true };
  return b;
});
const clearedState = {
  ...assignedState,
  balls: clearedBalls
};
const legalEightEvent = {
  firstBallHit: clearedBalls[8],
  ballsPocketed: [clearedBalls[8]],
  cushionsContactedAfterBallHit: 1,
  cueBallPocketed: false,
  eightBallPocketed: true
};
const legalEightResult = evaluateShot(legalEightEvent, clearedState);
assert(legalEightResult.winnerId === 'player1', 'Pocketing 8-ball legally after clearing solids awards victory to player 1');

// 7. Trajectory Prediction Math (aiming towards positive X rack apex)
const cueBall = balls[0];
const breakAngle = Math.PI / 2; // Facing positive X
const traj = calculateTrajectory(cueBall, breakAngle, balls);
assert(traj !== null, 'Trajectory calculated successfully');
assert(traj.hitType === 'ball', 'Break trajectory intersects rack apex ball');
assert(traj.contactPoint.x !== undefined && traj.contactPoint.z !== undefined, 'Contact point calculated');

// 8. Bank-Shot Cushion Trajectory Math (aiming towards top cushion: Z = -45)
const cushionAngle = -Math.PI / 4; // Angle towards top cushion
const bankTraj = calculateTrajectory(cueBall, cushionAngle, balls);
assert(bankTraj !== null, 'Bank trajectory calculated');
assert(bankTraj.hitType === 'cushion', 'Ray hits cushion first');
assert(bankTraj.cushionReboundPath !== null, 'Cushion rebound ray calculated for bank-shot');

console.log('\n🌟 ALL 8-BALL ENGINE TESTS PASSED PERFECTLY!\n');
