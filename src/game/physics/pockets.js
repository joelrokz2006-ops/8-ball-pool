import { POCKETS } from './constants.js';
import { vec2 } from './vector.js';

/**
 * Check if a ball has entered any of the 6 pockets.
 * Returns the pocket object if captured, else null.
 */
export function checkPocketDrop(ball) {
  if (ball.pocketed) return null;

  for (let i = 0; i < POCKETS.length; i++) {
    const pocket = POCKETS[i];
    const dSq = vec2.distSq(ball, pocket);
    const captureRadius = pocket.radius * 0.95;

    if (dSq <= captureRadius * captureRadius) {
      return pocket;
    }
  }

  return null;
}
