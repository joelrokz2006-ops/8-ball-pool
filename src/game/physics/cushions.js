import { TABLE_HALF_WIDTH, TABLE_HALF_LENGTH } from './constants.js';
import { vec2 } from './vector.js';

const CORNER_JAW = 6.2;
const SIDE_JAW = 5.2;

export function createCushionSegments() {
  const L = TABLE_HALF_LENGTH; // 90
  const W = TABLE_HALF_WIDTH;  // 45

  const rawSegments = [
    // --- Top-Left Cushion (along Z = -W, from X = -L to 0) ---
    {
      p1: { x: -L + CORNER_JAW, z: -W },
      p2: { x: -SIDE_JAW, z: -W },
      normal: { x: 0, z: 1 },
      name: 'top_left'
    },
    // Top-left corner jaw
    {
      p1: { x: -L + CORNER_JAW, z: -W },
      p2: { x: -L + 1.2, z: -W + CORNER_JAW - 1.2 },
      name: 'top_left_corner_jaw'
    },
    // Top-center left jaw
    {
      p1: { x: -SIDE_JAW, z: -W },
      p2: { x: -SIDE_JAW + 2.0, z: -W - 1.5 },
      name: 'top_center_left_jaw'
    },

    // --- Top-Right Cushion (along Z = -W, from X = 0 to L) ---
    {
      p1: { x: SIDE_JAW, z: -W },
      p2: { x: L - CORNER_JAW, z: -W },
      normal: { x: 0, z: 1 },
      name: 'top_right'
    },
    // Top-center right jaw
    {
      p1: { x: SIDE_JAW - 2.0, z: -W - 1.5 },
      p2: { x: SIDE_JAW, z: -W },
      name: 'top_center_right_jaw'
    },
    // Top-right corner jaw
    {
      p1: { x: L - 1.2, z: -W + CORNER_JAW - 1.2 },
      p2: { x: L - CORNER_JAW, z: -W },
      name: 'top_right_corner_jaw'
    },

    // --- Bottom-Left Cushion (along Z = W, from X = -L to 0) ---
    {
      p1: { x: -SIDE_JAW, z: W },
      p2: { x: -L + CORNER_JAW, z: W },
      normal: { x: 0, z: -1 },
      name: 'bottom_left'
    },
    // Bottom-center left jaw
    {
      p1: { x: -SIDE_JAW, z: W },
      p2: { x: -SIDE_JAW + 2.0, z: W + 1.5 },
      name: 'bottom_center_left_jaw'
    },
    // Bottom-left corner jaw
    {
      p1: { x: -L + 1.2, z: W - CORNER_JAW + 1.2 },
      p2: { x: -L + CORNER_JAW, z: W },
      name: 'bottom_left_corner_jaw'
    },

    // --- Bottom-Right Cushion (along Z = W, from X = 0 to L) ---
    {
      p1: { x: L - CORNER_JAW, z: W },
      p2: { x: SIDE_JAW, z: W },
      normal: { x: 0, z: -1 },
      name: 'bottom_right'
    },
    // Bottom-right corner jaw
    {
      p1: { x: L - CORNER_JAW, z: W },
      p2: { x: L - 1.2, z: W - CORNER_JAW + 1.2 },
      name: 'bottom_right_corner_jaw'
    },
    // Bottom-center right jaw
    {
      p1: { x: SIDE_JAW, z: W },
      p2: { x: SIDE_JAW - 2.0, z: W + 1.5 },
      name: 'bottom_center_right_jaw'
    },

    // --- Left Cushion (along X = -L, from Z = -W to W) ---
    {
      p1: { x: -L, z: -W + CORNER_JAW },
      p2: { x: -L, z: W - CORNER_JAW },
      normal: { x: 1, z: 0 },
      name: 'left'
    },
    // Left top jaw
    {
      p1: { x: -L, z: -W + CORNER_JAW },
      p2: { x: -L + CORNER_JAW - 1.2, z: -W + 1.2 },
      name: 'left_top_jaw'
    },
    // Left bottom jaw
    {
      p1: { x: -L + CORNER_JAW - 1.2, z: W - 1.2 },
      p2: { x: -L, z: W - CORNER_JAW },
      name: 'left_bottom_jaw'
    },

    // --- Right Cushion (along X = L, from Z = -W to W) ---
    {
      p1: { x: L, z: W - CORNER_JAW },
      p2: { x: L, z: -W + CORNER_JAW },
      normal: { x: -1, z: 0 },
      name: 'right'
    },
    // Right bottom jaw
    {
      p1: { x: L, z: W - CORNER_JAW },
      p2: { x: L - CORNER_JAW + 1.2, z: W - 1.2 },
      name: 'right_bottom_jaw'
    },
    // Right top jaw
    {
      p1: { x: L - CORNER_JAW + 1.2, z: -W + 1.2 },
      p2: { x: L, z: -W + CORNER_JAW },
      name: 'right_top_jaw'
    }
  ];

  return rawSegments.map((seg) => {
    const dx = seg.p2.x - seg.p1.x;
    const dz = seg.p2.z - seg.p1.z;
    const len = Math.hypot(dx, dz);
    let normal = seg.normal;
    if (!normal) {
      normal = vec2.normalize({ x: -dz, z: dx });
    }
    return {
      ...seg,
      dx,
      dz,
      len,
      normal
    };
  });
}

export const CUSHIONS = createCushionSegments();

export function checkSegmentCollision(ball, segment, ballRadius) {
  const p1 = segment.p1;
  const p2 = segment.p2;

  const segX = p2.x - p1.x;
  const segZ = p2.z - p1.z;
  const segLenSq = segX * segX + segZ * segZ;

  if (segLenSq === 0) return null;

  const t = Math.max(0, Math.min(1, ((ball.x - p1.x) * segX + (ball.z - p1.z) * segZ) / segLenSq));

  const closestX = p1.x + t * segX;
  const closestZ = p1.z + t * segZ;

  const distX = ball.x - closestX;
  const distZ = ball.z - closestZ;
  const distSq = distX * distX + distZ * distZ;

  if (distSq < ballRadius * ballRadius && distSq > 0.00001) {
    const dist = Math.sqrt(distSq);
    const penetration = ballRadius - dist;
    const normal = { x: distX / dist, z: distZ / dist };

    return {
      collided: true,
      normal,
      penetration,
      closestPoint: { x: closestX, z: closestZ }
    };
  }

  return null;
}
