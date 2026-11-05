/**
 * Table, Ball, and Physics Constants — Horizontal 2:1 Landscape Orientation
 * Playing surface:
 * X: -TABLE_HALF_LENGTH to +TABLE_HALF_LENGTH (-90 to +90, horizontal across screen)
 * Z: -TABLE_HALF_WIDTH to +TABLE_HALF_WIDTH (-45 to +45, vertical up-down on screen)
 * Aspect ratio: 180 : 90 = 2 : 1
 */

export const TABLE_LENGTH = 180; // Horizontal length across screen
export const TABLE_WIDTH = 90;   // Vertical width across screen
export const TABLE_HALF_LENGTH = TABLE_LENGTH / 2; // 90
export const TABLE_HALF_WIDTH = TABLE_WIDTH / 2;   // 45

export const BALL_RADIUS = 2.65;
export const BALL_DIAMETER = BALL_RADIUS * 2;
export const BALL_MASS = 0.17;

// Physics friction and restitution
export const ROLLING_FRICTION = 0.988;
export const SLIDING_FRICTION = 0.96;
export const BALL_RESTITUTION = 0.95;
export const CUSHION_RESTITUTION = 0.82;
export const MIN_VELOCITY_THRESHOLD = 0.04;
export const SETTLING_REQUIRED_SECONDS = 0.35; // Must remain stationary for 0.35s to confirm settled
export const MAX_SHOT_TIMEOUT_SECONDS = 12.0;  // Absolute safety timeout against stuck simulation

// Pocket radii
export const CORNER_POCKET_RADIUS = 5.2;
export const SIDE_POCKET_RADIUS = 4.8;

// Pockets in horizontal 2:1 coordinates:
// 4 corners at (±90, ±45), 2 side pockets at (0, ±45)
export const POCKETS = [
  // Top-left corner
  { id: 'TL', x: -TABLE_HALF_LENGTH, z: -TABLE_HALF_WIDTH, radius: CORNER_POCKET_RADIUS, isCorner: true },
  // Top-center side
  { id: 'TC', x: 0, z: -TABLE_HALF_WIDTH - 1.2, radius: SIDE_POCKET_RADIUS, isCorner: false },
  // Top-right corner
  { id: 'TR', x: TABLE_HALF_LENGTH, z: -TABLE_HALF_WIDTH, radius: CORNER_POCKET_RADIUS, isCorner: true },
  // Bottom-left corner
  { id: 'BL', x: -TABLE_HALF_LENGTH, z: TABLE_HALF_WIDTH, radius: CORNER_POCKET_RADIUS, isCorner: true },
  // Bottom-center side
  { id: 'BC', x: 0, z: TABLE_HALF_WIDTH + 1.2, radius: SIDE_POCKET_RADIUS, isCorner: false },
  // Bottom-right corner
  { id: 'BR', x: TABLE_HALF_LENGTH, z: TABLE_HALF_WIDTH, radius: CORNER_POCKET_RADIUS, isCorner: true },
];

// Head string (break line on left side)
export const HEAD_STRING_X = -TABLE_HALF_LENGTH * 0.5; // X = -45
// Foot spot (rack apex on right side)
export const FOOT_SPOT_X = TABLE_HALF_LENGTH * 0.45;   // X = +40.5
