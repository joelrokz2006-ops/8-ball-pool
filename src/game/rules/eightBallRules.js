/**
 * Standard World Pool-Billiard Association (WPA) 8-Ball Rules Engine
 * Pure deterministic functions to evaluate legal shots, fouls, group assignments,
 * turn transitions, and match winners.
 */

export const BALL_GROUPS = {
  SOLIDS: 'solid',
  STRIPES: 'stripe',
  EIGHT: 'eight',
  CUE: 'cue'
};

export const FOUL_REASONS = {
  SCRATCH: 'Scratch: Cue ball was pocketed',
  NO_BALL_HIT: 'Foul: Cue ball did not contact any ball',
  WRONG_FIRST_HIT: 'Foul: Wrong first ball contacted',
  NO_CUSHION_AFTER_HIT: 'Foul: No ball reached a cushion after contact',
  EIGHT_BALL_EARLY: 'Foul & Loss: 8-Ball pocketed prematurely',
  EIGHT_BALL_SCRATCH: 'Foul & Loss: Scratch while pocketing 8-Ball'
};

export function getBallGroup(ballId) {
  if (ballId === 0) return BALL_GROUPS.CUE;
  if (ballId === 8) return BALL_GROUPS.EIGHT;
  if (ballId >= 1 && ballId <= 7) return BALL_GROUPS.SOLIDS;
  if (ballId >= 9 && ballId <= 15) return BALL_GROUPS.STRIPES;
  return null;
}

/**
 * Check remaining balls on table for a specific group
 */
export function getRemainingBallsForGroup(balls, group) {
  return balls.filter((b) => !b.pocketed && getBallGroup(b.id) === group);
}

/**
 * Evaluate shot outcome based on recorded shot events
 * @param {Object} shotEvent - Details recorded during shot physics
 * @param {Object} matchState - Current match state
 * @returns {Object} evaluation - outcome, nextPlayerId, foul, winner, reason
 */
export function evaluateShot(shotEvent, matchState) {
  const {
    currentPlayerId,
    opponentPlayerId,
    playerGroups,
    isBreakShot,
    tableOpen,
    balls
  } = matchState;

  const {
    firstBallHit,
    ballsPocketed = [],
    cushionsContactedAfterBallHit = 0,
    cueBallPocketed = false,
    eightBallPocketed = false
  } = shotEvent;

  const currentGroup = playerGroups[currentPlayerId]; // 'solid', 'stripe', or null
  const opponentGroup = playerGroups[opponentPlayerId];

  // Number of balls remaining in current player's group
  const myRemainingBalls = currentGroup ? getRemainingBallsForGroup(balls, currentGroup).length : 7;

  let foul = null;
  let winnerId = null;
  let newTableOpen = tableOpen;
  let newPlayerGroups = { ...playerGroups };
  let continuesTurn = false;
  let ballInHand = false;
  let message = '';

  // 1. Check Scratch
  if (cueBallPocketed) {
    foul = FOUL_REASONS.SCRATCH;
  }

  // 2. Check 8-Ball outcomes
  if (eightBallPocketed) {
    if (isBreakShot) {
      // 8-Ball pocketed on break: re-spot or instant win depending on preference.
      // Standard: shooter wins or re-spots. We award break master win!
      if (!cueBallPocketed) {
        winnerId = currentPlayerId;
        message = 'Golden Break! 8-Ball pocketed on the break!';
        return { winnerId, message, newTableOpen, newPlayerGroups, foul: null };
      } else {
        // Scratch while 8-ball on break: opponent gets ball-in-hand
        foul = FOUL_REASONS.SCRATCH;
      }
    } else {
      // Normal play 8-ball pocketed
      if (cueBallPocketed) {
        // Scratch on 8-ball = Instant Loss!
        winnerId = opponentPlayerId;
        message = FOUL_REASONS.EIGHT_BALL_SCRATCH;
        return { winnerId, message, newTableOpen, newPlayerGroups, foul: FOUL_REASONS.EIGHT_BALL_SCRATCH };
      }

      if (myRemainingBalls > 0) {
        // 8-ball pocketed while still having own balls = Instant Loss!
        winnerId = opponentPlayerId;
        message = FOUL_REASONS.EIGHT_BALL_EARLY;
        return { winnerId, message, newTableOpen, newPlayerGroups, foul: FOUL_REASONS.EIGHT_BALL_EARLY };
      }

      // Legal 8-Ball win!
      if (firstBallHit && firstBallHit.id === 8) {
        winnerId = currentPlayerId;
        message = 'Victory! 8-Ball pocketed legally!';
        return { winnerId, message, newTableOpen, newPlayerGroups, foul: null };
      } else {
        // 8-Ball was not hit first = Loss!
        winnerId = opponentPlayerId;
        message = 'Loss: 8-Ball was not contacted first!';
        return { winnerId, message, newTableOpen, newPlayerGroups, foul: FOUL_REASONS.WRONG_FIRST_HIT };
      }
    }
  }

  // 3. Check first ball hit foul (if no scratch yet)
  if (!foul) {
    if (!firstBallHit) {
      foul = FOUL_REASONS.NO_BALL_HIT;
    } else {
      const firstHitGroup = getBallGroup(firstBallHit.id);

      if (tableOpen || !currentGroup) {
        // Open table: can hit any ball EXCEPT the 8-ball first
        if (firstHitGroup === BALL_GROUPS.EIGHT && !isBreakShot) {
          foul = FOUL_REASONS.WRONG_FIRST_HIT;
        }
      } else {
        // Closed table:
        if (myRemainingBalls > 0) {
          // Must hit own group ball first
          if (firstHitGroup !== currentGroup) {
            foul = FOUL_REASONS.WRONG_FIRST_HIT;
          }
        } else {
          // All own group cleared: must hit 8-ball first
          if (firstHitGroup !== BALL_GROUPS.EIGHT) {
            foul = FOUL_REASONS.WRONG_FIRST_HIT;
          }
        }
      }
    }
  }

  // 4. Check cushion requirement: if no ball was pocketed, at least one ball must hit cushion after contact
  if (!foul && ballsPocketed.length === 0) {
    if (cushionsContactedAfterBallHit === 0) {
      foul = FOUL_REASONS.NO_CUSHION_AFTER_HIT;
    }
  }

  // 5. Group assignment (if table was open and no foul)
  if (!foul && tableOpen && !isBreakShot && ballsPocketed.length > 0) {
    // Find first legally pocketed object ball (excluding 8-ball)
    const validPocketed = ballsPocketed.find((b) => b.id !== 8 && b.id !== 0);
    if (validPocketed) {
      const pocketedGroup = getBallGroup(validPocketed.id);
      if (pocketedGroup === BALL_GROUPS.SOLIDS) {
        newPlayerGroups[currentPlayerId] = BALL_GROUPS.SOLIDS;
        newPlayerGroups[opponentPlayerId] = BALL_GROUPS.STRIPES;
        newTableOpen = false;
        message = `Player assigned: SOLIDS (1-7)`;
      } else if (pocketedGroup === BALL_GROUPS.STRIPES) {
        newPlayerGroups[currentPlayerId] = BALL_GROUPS.STRIPES;
        newPlayerGroups[opponentPlayerId] = BALL_GROUPS.SOLIDS;
        newTableOpen = false;
        message = `Player assigned: STRIPES (9-15)`;
      }
    }
  }

  // 6. Turn continuation check
  if (foul) {
    // Foul occurred: opponent gets ball-in-hand
    ballInHand = true;
    continuesTurn = false;
    message = foul;
  } else {
    // No foul: check if player legally pocketed any ball that allows continuation
    if (newTableOpen || !newPlayerGroups[currentPlayerId]) {
      // Open table: pocketing any object ball continues turn
      const objectBallsPocketed = ballsPocketed.filter((b) => b.id !== 0 && b.id !== 8);
      continuesTurn = objectBallsPocketed.length > 0;
    } else {
      // Assigned table: must have pocketed at least one of their own group balls
      const myGroupPocketed = ballsPocketed.filter(
        (b) => getBallGroup(b.id) === newPlayerGroups[currentPlayerId]
      );
      continuesTurn = myGroupPocketed.length > 0;
    }

    if (continuesTurn) {
      message = 'Good shot! Continue turn.';
    } else {
      message = 'No ball pocketed. Turn passes to opponent.';
    }
  }

  const nextPlayerId = continuesTurn ? currentPlayerId : opponentPlayerId;

  return {
    winnerId,
    foul,
    message,
    nextPlayerId,
    continuesTurn,
    ballInHand,
    newTableOpen,
    newPlayerGroups
  };
}
