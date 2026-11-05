import { BALL_RADIUS, BALL_DIAMETER, POCKETS, TABLE_HALF_WIDTH, TABLE_HALF_LENGTH } from '../physics/constants.js';
import { vec2 } from '../physics/vector.js';
import { getBallGroup, BALL_GROUPS } from '../rules/eightBallRules.js';

/**
 * Intelligent 8-Ball AI player with 3 selectable difficulties.
 * Compatible with horizontal 2:1 table layout.
 */
export function calculateAIShot(matchState, difficulty = 'medium') {
  const { balls, playerGroups, currentPlayerId, tableOpen, isBreakShot } = matchState;

  const cueBall = balls.find((b) => b.id === 0);
  if (!cueBall || cueBall.pocketed) return null;

  // 1. Break shot: Aim towards triangle apex with power!
  if (isBreakShot) {
    const apex = balls.find((b) => b.id === 1) || balls[1];
    const dx = apex.x - cueBall.x;
    const dz = apex.z - cueBall.z;
    const baseAngle = Math.atan2(dx, dz);
    const jitter = (Math.random() - 0.5) * 0.04;
    return {
      angle: baseAngle + jitter,
      power: 0.95 + Math.random() * 0.05,
      cueSpin: { x: 0, y: 0.2 }
    };
  }

  // 2. Identify AI legal target balls
  const aiGroup = playerGroups[currentPlayerId];
  let legalBalls = [];

  const activeBalls = balls.filter((b) => !b.pocketed && b.id !== 0);

  if (tableOpen || !aiGroup) {
    legalBalls = activeBalls.filter((b) => b.id !== 8);
  } else {
    const myGroupBalls = activeBalls.filter((b) => getBallGroup(b.id) === aiGroup);
    if (myGroupBalls.length > 0) {
      legalBalls = myGroupBalls;
    } else {
      const eightBall = activeBalls.find((b) => b.id === 8);
      if (eightBall) legalBalls = [eightBall];
    }
  }

  if (legalBalls.length === 0) {
    legalBalls = activeBalls;
  }

  // 3. Evaluate candidate shots
  const candidateShots = [];

  for (let i = 0; i < legalBalls.length; i++) {
    const target = legalBalls[i];

    for (let p = 0; p < POCKETS.length; p++) {
      const pocket = POCKETS[p];

      const targetToPocket = { x: pocket.x - target.x, z: pocket.z - target.z };
      const distToPocket = vec2.len(targetToPocket);
      if (distToPocket === 0) continue;

      const pocketDir = { x: targetToPocket.x / distToPocket, z: targetToPocket.z / distToPocket };

      const ghost = {
        x: target.x - pocketDir.x * BALL_DIAMETER,
        z: target.z - pocketDir.z * BALL_DIAMETER
      };

      const cueToGhost = { x: ghost.x - cueBall.x, z: ghost.z - cueBall.z };
      const distToGhost = vec2.len(cueToGhost);
      if (distToGhost === 0) continue;

      const cueDir = { x: cueToGhost.x / distToGhost, z: cueToGhost.z / distToGhost };

      const cutAlignment = cueDir.x * pocketDir.x + cueDir.z * pocketDir.z;
      if (cutAlignment < 0.2) continue;

      const cueBlocked = isPathObstructed(cueBall, ghost, balls, [0, target.id]);
      if (cueBlocked) continue;

      const targetBlocked = isPathObstructed(target, pocket, balls, [0, target.id]);
      if (targetBlocked) continue;

      const score = cutAlignment * 120 - distToPocket * 0.4 - distToGhost * 0.25;

      candidateShots.push({
        target,
        pocket,
        ghost,
        distToGhost,
        distToPocket,
        cutAlignment,
        score,
        baseAngle: Math.atan2(cueToGhost.x, cueToGhost.z)
      });
    }
  }

  candidateShots.sort((a, b) => b.score - a.score);
  let chosenShot = candidateShots[0];

  if (!chosenShot) {
    const closestTarget = legalBalls[0] || activeBalls[0];
    const dx = closestTarget.x - cueBall.x;
    const dz = closestTarget.z - cueBall.z;
    chosenShot = {
      baseAngle: Math.atan2(dx, dz),
      distToGhost: vec2.len({ x: dx, z: dz }),
      cutAlignment: 1.0,
      score: 10
    };
  }

  let errorMargin = 0.02;
  let power = 0.55;

  if (difficulty === 'easy') {
    errorMargin = 0.08;
    power = 0.4 + Math.random() * 0.35;
  } else if (difficulty === 'medium') {
    errorMargin = 0.035;
    power = 0.5 + Math.random() * 0.25;
  } else {
    errorMargin = 0.008;
    const totalDist = (chosenShot.distToGhost || 50) + (chosenShot.distToPocket || 40);
    power = Math.min(0.85, Math.max(0.35, totalDist / 180));
  }

  const finalAngle = chosenShot.baseAngle + (Math.random() - 0.5) * errorMargin;

  return {
    angle: finalAngle,
    power: Math.min(1.0, Math.max(0.2, power)),
    targetBall: chosenShot.target,
    pocket: chosenShot.pocket,
    cueSpin: { x: 0, y: 0 }
  };
}

function isPathObstructed(pointA, pointB, balls, ignoreIds = []) {
  const lineVec = { x: pointB.x - pointA.x, z: pointB.z - pointA.z };
  const lineLen = vec2.len(lineVec);
  if (lineLen < 0.1) return false;

  const lineDir = { x: lineVec.x / lineLen, z: lineVec.z / lineLen };
  const checkRadius = BALL_DIAMETER * 0.9;
  const checkRadiusSq = checkRadius * checkRadius;

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (b.pocketed || ignoreIds.includes(b.id)) continue;

    const toBall = { x: b.x - pointA.x, z: b.z - pointA.z };
    const proj = toBall.x * lineDir.x + toBall.z * lineDir.z;

    if (proj > BALL_RADIUS && proj < lineLen - BALL_RADIUS) {
      const perpSq = toBall.x * toBall.x + toBall.z * toBall.z - proj * proj;
      if (perpSq < checkRadiusSq) {
        return true;
      }
    }
  }

  return false;
}

export function calculateAIBallInHandPlacement(balls, playerGroups, currentPlayerId) {
  const activeBalls = balls.filter((b) => !b.pocketed && b.id !== 0);
  if (activeBalls.length === 0) return { x: -40, z: 0 };

  const target = activeBalls[0];
  const targetX = target.x;
  const targetZ = target.z;

  const testX = Math.max(-TABLE_HALF_LENGTH + 10, Math.min(TABLE_HALF_LENGTH - 10, targetX - 30));
  const testZ = Math.max(-TABLE_HALF_WIDTH + 10, Math.min(TABLE_HALF_WIDTH - 10, targetZ * 0.6));

  return { x: testX, z: testZ };
}
