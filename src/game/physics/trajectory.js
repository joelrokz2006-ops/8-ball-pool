import { BALL_RADIUS, BALL_DIAMETER, POCKETS } from './constants.js';
import { CUSHIONS } from './cushions.js';
import { vec2 } from './vector.js';

/**
 * Advanced Trajectory Predictor with Bank-Shot cushion reflections
 */
export function calculateTrajectory(cueBall, angle, balls, maxDistance = 180) {
  if (!cueBall || cueBall.pocketed) return null;

  const origin = { x: cueBall.x, z: cueBall.z };
  const dir = { x: Math.sin(angle), z: Math.cos(angle) };

  const firstHit = castRay(origin, dir, balls, maxDistance);

  const result = {
    origin,
    contactPoint: firstHit.contactPoint,
    hitType: firstHit.hitType,
    hitBall: firstHit.hitBall,
    hitCushion: firstHit.hitCushion,
    targetBallPath: null,
    cueDeflectionPath: null,
    cushionReboundPath: null,
    secondHit: null,
    isBankShot: false,
    targetPocket: null
  };

  // Case 1: First hit is an object ball
  if (firstHit.hitType === 'ball' && firstHit.hitBall) {
    const target = firstHit.hitBall;
    const normal = vec2.normalize({
      x: target.x - firstHit.contactPoint.x,
      z: target.z - firstHit.contactPoint.z
    });

    const targetLength = 40;
    result.targetBallPath = {
      start: { x: target.x, z: target.z },
      end: { x: target.x + normal.x * targetLength, z: target.z + normal.z * targetLength },
      dir: normal
    };

    const dot = dir.x * normal.x + dir.z * normal.z;
    const tangentDir = vec2.normalize({
      x: dir.x - normal.x * dot,
      z: dir.z - normal.z * dot
    });

    result.cueDeflectionPath = {
      start: firstHit.contactPoint,
      end: {
        x: firstHit.contactPoint.x + tangentDir.x * 24,
        z: firstHit.contactPoint.z + tangentDir.z * 24
      },
      dir: tangentDir
    };

    // Pocket alignment test
    result.targetPocket = checkPocketAlignment(target, normal);
  }

  // Case 2: First hit is a cushion -> Bank Shot Raycast!
  else if (firstHit.hitType === 'cushion' && firstHit.hitCushion) {
    const refl = vec2.reflect(dir, firstHit.hitCushion.normal);
    const reboundOrigin = {
      x: firstHit.contactPoint.x + refl.x * 0.1,
      z: firstHit.contactPoint.z + refl.z * 0.1
    };

    const remainingDist = Math.max(40, maxDistance - firstHit.dist);
    const secondHit = castRay(reboundOrigin, refl, balls, remainingDist);

    result.cushionReboundPath = {
      start: firstHit.contactPoint,
      end: secondHit.contactPoint,
      dir: refl
    };

    result.secondHit = secondHit;

    // If second hit is an object ball (Clean Bank Shot!)
    if (secondHit.hitType === 'ball' && secondHit.hitBall) {
      result.isBankShot = true;
      const target = secondHit.hitBall;
      const bankNormal = vec2.normalize({
        x: target.x - secondHit.contactPoint.x,
        z: target.z - secondHit.contactPoint.z
      });

      result.targetBallPath = {
        start: { x: target.x, z: target.z },
        end: { x: target.x + bankNormal.x * 35, z: target.z + bankNormal.z * 35 },
        dir: bankNormal
      };

      result.targetPocket = checkPocketAlignment(target, bankNormal);
    }
  }

  return result;
}

/**
 * Cast a ray against balls and cushions
 */
function castRay(origin, dir, balls, maxDist) {
  let closestDist = maxDist;
  let hitType = 'none';
  let hitBall = null;
  let hitCushion = null;
  let contactPoint = {
    x: origin.x + dir.x * maxDist,
    z: origin.z + dir.z * maxDist
  };

  const targetRadius = BALL_DIAMETER;
  const targetRadiusSq = targetRadius * targetRadius;

  // Test balls
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (b.id === 0 || b.pocketed) continue;

    const ox = b.x - origin.x;
    const oz = b.z - origin.z;
    const proj = ox * dir.x + oz * dir.z;
    if (proj <= 0.1) continue;

    const perpSq = ox * ox + oz * oz - proj * proj;
    if (perpSq >= targetRadiusSq) continue;

    const distToContact = proj - Math.sqrt(targetRadiusSq - perpSq);
    if (distToContact > 0 && distToContact < closestDist) {
      closestDist = distToContact;
      hitType = 'ball';
      hitBall = b;
      contactPoint = {
        x: origin.x + dir.x * distToContact,
        z: origin.z + dir.z * distToContact
      };
    }
  }

  // Test cushions
  for (let i = 0; i < CUSHIONS.length; i++) {
    const cushion = CUSHIONS[i];
    const inter = raySegmentIntersection(origin, dir, cushion.p1, cushion.p2, cushion.normal);
    if (inter && inter.dist > 0 && inter.dist < closestDist) {
      closestDist = inter.dist;
      hitType = 'cushion';
      hitBall = null;
      hitCushion = cushion;
      contactPoint = inter.point;
    }
  }

  return {
    dist: closestDist,
    hitType,
    hitBall,
    hitCushion,
    contactPoint
  };
}

function checkPocketAlignment(target, normal) {
  for (let p = 0; p < POCKETS.length; p++) {
    const pocket = POCKETS[p];
    const toPocket = vec2.normalize({ x: pocket.x - target.x, z: pocket.z - target.z });
    const alignment = normal.x * toPocket.x + normal.z * toPocket.z;
    if (alignment > 0.96) {
      return pocket;
    }
  }
  return null;
}

function raySegmentIntersection(rayOrigin, rayDir, p1, p2, normal) {
  const offsetP1 = {
    x: p1.x + normal.x * BALL_RADIUS,
    z: p1.z + normal.z * BALL_RADIUS
  };
  const offsetP2 = {
    x: p2.x + normal.x * BALL_RADIUS,
    z: p2.z + normal.z * BALL_RADIUS
  };

  const v1 = { x: rayOrigin.x - offsetP1.x, z: rayOrigin.z - offsetP1.z };
  const v2 = { x: offsetP2.x - offsetP1.x, z: offsetP2.z - offsetP1.z };
  const v3 = { x: -rayDir.z, z: rayDir.x };

  const dot = v2.x * v3.x + v2.z * v3.z;
  if (Math.abs(dot) < 0.000001) return null;

  const t1 = (v2.x * v1.z - v2.z * v1.x) / dot;
  const t2 = (v1.x * v3.x + v1.z * v3.z) / dot;

  if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
    return {
      dist: t1,
      point: {
        x: rayOrigin.x + rayDir.x * t1,
        z: rayOrigin.z + rayDir.z * t1
      }
    };
  }

  return null;
}
