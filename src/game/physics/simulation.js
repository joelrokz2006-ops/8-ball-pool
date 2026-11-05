import {
  BALL_RADIUS,
  BALL_DIAMETER,
  BALL_RESTITUTION,
  CUSHION_RESTITUTION,
  ROLLING_FRICTION,
  MIN_VELOCITY_THRESHOLD,
  TABLE_HALF_WIDTH,
  TABLE_HALF_LENGTH,
  HEAD_STRING_X,
  FOOT_SPOT_X
} from './constants.js';
import { vec2 } from './vector.js';
import { CUSHIONS, checkSegmentCollision } from './cushions.js';
import { checkPocketDrop } from './pockets.js';

/**
 * Initialize 16 pool balls for horizontal 2:1 table:
 * - Ball 0: Cue ball at left head string (-45, 0)
 * - Balls 1-15: Triangle rack at right foot spot (+40.5, 0) pointing left toward cue ball!
 */
export function initializeBalls() {
  const balls = [];

  // Cue ball at head string
  balls.push({
    id: 0,
    number: 0,
    type: 'cue',
    x: HEAD_STRING_X,
    z: 0,
    y: BALL_RADIUS,
    vx: 0,
    vz: 0,
    spinX: 0,
    spinZ: 0,
    pocketed: false,
    pocketProgress: 0,
    quaternion: [0, 0, 0, 1]
  });

  // Triangle rack of 15 balls
  const solids = [1, 2, 3, 4, 5, 6, 7];
  const stripes = [9, 10, 11, 12, 13, 14, 15];

  const shuffledSolids = [...solids].sort(() => Math.random() - 0.5);
  const shuffledStripes = [...stripes].sort(() => Math.random() - 0.5);

  const rackNumbers = new Array(15);
  // 8-ball in center of 3rd row (index 4)
  rackNumbers[4] = 8;
  // Rear corners have one solid and one stripe (indices 10 and 14)
  rackNumbers[10] = shuffledSolids.pop();
  rackNumbers[14] = shuffledStripes.pop();

  const remaining = [...shuffledSolids, ...shuffledStripes].sort(() => Math.random() - 0.5);
  let remIdx = 0;
  for (let i = 0; i < 15; i++) {
    if (rackNumbers[i] === undefined) {
      rackNumbers[i] = remaining[remIdx++];
    }
  }

  // Racking along horizontal X axis: apex at FOOT_SPOT_X (facing left toward cue ball)
  const spacing = BALL_DIAMETER + 0.05;
  const colWidth = spacing * Math.cos(Math.PI / 6); // 30 degrees
  let rackIndex = 0;

  for (let col = 0; col < 5; col++) {
    const ballsInCol = col + 1;
    const x = FOOT_SPOT_X + col * colWidth;
    const startZ = -((ballsInCol - 1) * spacing) / 2;

    for (let row = 0; row < ballsInCol; row++) {
      const num = rackNumbers[rackIndex++];
      const type = num === 8 ? 'eight' : num < 8 ? 'solid' : 'stripe';
      balls.push({
        id: num,
        number: num,
        type,
        x,
        z: startZ + row * spacing,
        y: BALL_RADIUS,
        vx: 0,
        vz: 0,
        spinX: 0,
        spinZ: 0,
        pocketed: false,
        pocketProgress: 0,
        quaternion: [0, 0, 0, 1]
      });
    }
  }

  balls.sort((a, b) => a.id - b.id);
  return balls;
}

export function areBallsSettled(balls) {
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (b.pocketed) continue;
    if (Math.hypot(b.vx, b.vz) > MIN_VELOCITY_THRESHOLD) {
      return false;
    }
  }
  return true;
}

export function updatePhysics(balls, deltaSeconds, callbacks = {}) {
  const substeps = 12;
  const dt = (deltaSeconds || 1 / 60) / substeps;

  for (let step = 0; step < substeps; step++) {
    // 1. Move balls & apply friction
    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      if (ball.pocketed) {
        if (ball.pocketProgress < 1) {
          ball.pocketProgress = Math.min(1, ball.pocketProgress + dt * 2.5);
          ball.y = BALL_RADIUS - ball.pocketProgress * 6;
        }
        continue;
      }

      const speed = Math.hypot(ball.vx, ball.vz);
      if (speed > 0) {
        ball.x += ball.vx * dt;
        ball.z += ball.vz * dt;

        const frictionFactor = Math.pow(ROLLING_FRICTION, dt * 60);
        ball.vx *= frictionFactor;
        ball.vz *= frictionFactor;

        if (ball.id === 0 && (Math.abs(ball.spinX) > 0.05 || Math.abs(ball.spinZ) > 0.05)) {
          ball.vx += ball.spinX * dt * 4.5;
          ball.vz += ball.spinZ * dt * 4.5;
          ball.spinX *= 0.94;
          ball.spinZ *= 0.94;
        }

        if (speed < MIN_VELOCITY_THRESHOLD) {
          ball.vx = 0;
          ball.vz = 0;
        }

        integrateBallRotation(ball, dt);
      }

      const pocket = checkPocketDrop(ball);
      if (pocket) {
        ball.pocketed = true;
        ball.pocketId = pocket.id;
        ball.pocketProgress = 0.01;
        ball.vx = 0;
        ball.vz = 0;
        if (callbacks.onBallPocketed) {
          callbacks.onBallPocketed(ball, pocket);
        }
      }
    }

    // 2. Ball-to-ball collisions
    const activeBalls = balls.filter((b) => !b.pocketed);
    const n = activeBalls.length;

    for (let i = 0; i < n; i++) {
      const b1 = activeBalls[i];

      for (let j = i + 1; j < n; j++) {
        const b2 = activeBalls[j];

        const dx = b2.x - b1.x;
        const dz = b2.z - b1.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < BALL_DIAMETER * BALL_DIAMETER && distSq > 0.000001) {
          const dist = Math.sqrt(distSq);
          const overlap = BALL_DIAMETER - dist;

          const nx = dx / dist;
          const nz = dz / dist;

          const sep = overlap * 0.5;
          b1.x -= nx * sep;
          b1.z -= nz * sep;
          b2.x += nx * sep;
          b2.z += nz * sep;

          const rvx = b1.vx - b2.vx;
          const rvz = b1.vz - b2.vz;

          const velAlongNormal = rvx * nx + rvz * nz;

          if (velAlongNormal > 0) {
            const impulse = ((1 + BALL_RESTITUTION) * velAlongNormal) / 2;

            b1.vx -= impulse * nx;
            b1.vz -= impulse * nz;
            b2.vx += impulse * nx;
            b2.vz += impulse * nz;

            if (callbacks.onBallCollision) {
              callbacks.onBallCollision(b1, b2, velAlongNormal);
            }
          }
        }
      }
    }

    // 3. Ball-to-cushion collisions
    for (let i = 0; i < activeBalls.length; i++) {
      const ball = activeBalls[i];

      for (let c = 0; c < CUSHIONS.length; c++) {
        const cushion = CUSHIONS[c];
        const hit = checkSegmentCollision(ball, cushion, BALL_RADIUS);

        if (hit) {
          ball.x += hit.normal.x * hit.penetration;
          ball.z += hit.normal.z * hit.penetration;

          const vDotN = ball.vx * hit.normal.x + ball.vz * hit.normal.z;

          if (vDotN < 0) {
            const impulse = -(1 + CUSHION_RESTITUTION) * vDotN;
            ball.vx += impulse * hit.normal.x;
            ball.vz += impulse * hit.normal.z;

            if (ball.id === 0 && Math.abs(ball.spinX) > 0.1) {
              const tangentX = -hit.normal.z;
              const tangentZ = hit.normal.x;
              ball.vx += tangentX * ball.spinX * 0.4;
              ball.vz += tangentZ * ball.spinX * 0.4;
            }

            if (callbacks.onCushionCollision) {
              callbacks.onCushionCollision(ball, cushion, Math.abs(vDotN));
            }
          }
        }
      }

      // Safe clamp inside table limits
      const safeLimitX = TABLE_HALF_LENGTH + 2;
      const safeLimitZ = TABLE_HALF_WIDTH + 2;
      if (Math.abs(ball.x) > safeLimitX || Math.abs(ball.z) > safeLimitZ) {
        ball.x = Math.max(-TABLE_HALF_LENGTH + BALL_RADIUS, Math.min(TABLE_HALF_LENGTH - BALL_RADIUS, ball.x));
        ball.z = Math.max(-TABLE_HALF_WIDTH + BALL_RADIUS, Math.min(TABLE_HALF_WIDTH - BALL_RADIUS, ball.z));
        ball.vx = -ball.vx * 0.5;
        ball.vz = -ball.vz * 0.5;
      }
    }
  }
}

function integrateBallRotation(ball, dt) {
  const speed = Math.hypot(ball.vx, ball.vz);
  if (speed === 0) return;

  const angle = (speed * dt) / BALL_RADIUS;
  const axisX = -ball.vz / speed;
  const axisZ = ball.vx / speed;

  const halfAngle = angle * 0.5;
  const sin = Math.sin(halfAngle);
  const cos = Math.cos(halfAngle);

  const dq = [axisX * sin, 0, axisZ * sin, cos];
  ball.quaternion = multiplyQuaternions(dq, ball.quaternion || [0, 0, 0, 1]);
}

function multiplyQuaternions(a, b) {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz
  ];
}
