# 8-Ball Pool Recreation — Reference-Matched UI and Functional Gameplay

## Purpose

Rebuild the existing pool game to match the uploaded reference screenshots in layout and gameplay feel. The current implementation has a table that is too dark/oversized, balls clustered in one area, and a persistent “Shot in motion…” state. Fix the gameplay/state bugs before adding more visual effects.

Use the screenshots as visual guidance, not as permission to copy proprietary logos, exact branded assets, or another game's unique artwork. Create original visuals with a similar readable billiards layout.

## Non-negotiable requirements

- Build a working, playable 8-ball pool game—not a static mockup.
- Keep the pool table in a **landscape 2:1-ish playing area**, with all six pockets visible.
- Use a dark green felt table, visible wooden/dark rails, rounded pocket openings, and a dark atmospheric background.
- Use realistic-looking, distinct, numbered pool balls and a visible cue stick.
- Show a clear aiming guide while aiming; remove or update it immediately after the shot.
- Use a compact player HUD at the top. Do not allow the table to become a tall portrait shape on desktop.
- Fix the “Shot in motion…” state so it always transitions to the next state when balls stop.
- Keep React UI and the physics simulation separate.
- Use React + Vite + JavaScript, Three.js / React Three Fiber, and a suitable pool physics implementation.
- Use separate CSS files per component/page. **Do not use Tailwind CSS.**
- Do not claim online multiplayer, AI, or real-money features work unless implemented and tested.

## 1. Reference screenshot breakdown

### Reference A: table/gameplay
The target composition includes:
- A rectangular green table with a dark wood/bronze rail.
- Six clearly visible pockets: four corners and two side pockets.
- Cue ball, object balls, and a cue stick on the table.
- Thin aim/prediction lines.
- A narrow top strip with players, small status indicators, and controls.
- The table and balls are the focus, with minimal UI clutter.

### Reference B: current broken build
Observed issues to correct:
- The table appears extremely tall and trapezoidal on a wide screen.
- Felt is nearly black, so table details and balls lack contrast.
- Balls appear bunched near the bottom instead of using a valid rack/shot state.
- The cue stick and aiming feedback are missing or unclear.
- “Shot in motion…” stays visible even when the shot appears to have stopped.
- The HUD and table scale do not create a balanced composition.

## 2. Visual direction

Create a polished billiards-club aesthetic:
- Background: deep charcoal/green, not pure black.
- Table felt: rich emerald green with a subtle texture and gentle lighting.
- Rails: dark walnut with restrained bronze/gold details.
- Balls: glossy but readable, with correct solid/stripe distinction, numbers, and soft contact shadows.
- Pockets: dark openings with clear rims and believable depth.
- Cue: slender wood cue with a visible tip, aligned to the shot direction.
- HUD: dark green panels with subtle borders, warm accent color, clear text, and compact spacing.
- Avoid heavy glow, overly dark exposure, giant empty panels, and unnecessary visual effects.

Suggested tokens:

```css
:root {
  --page-bg: #08110f;
  --panel-bg: #111d19;
  --panel-border: #2b3a32;
  --felt: #087a4b;
  --felt-dark: #05633c;
  --rail: #352216;
  --accent: #d9b66d;
  --text: #f4f5ef;
  --muted: #a8b4ad;
  --danger: #e36e68;
  --success: #79d6a4;
}
```

## 3. Table and camera layout

### Desktop
- Center the table in the viewport.
- Use a responsive container with a landscape aspect ratio, approximately 2:1 for the playable felt.
- Keep all six pockets inside the visible canvas at all times.
- Keep the table within roughly 70–85% of the available viewport width, depending on HUD and screen size.
- Never stretch the table into a tall trapezoid.
- Use a fixed table coordinate system; scale the camera/container to the viewport rather than changing table physics dimensions.

### Mobile portrait
- Fit the full table width on screen and preserve its landscape proportions.
- Put player cards above the table and controls below it.
- If space is limited, reduce decorative UI—not the table's proportions.
- Support safe areas and touch interaction.

### Mobile landscape
- Let the table occupy most of the viewport.
- Keep player indicators and controls compact.
- Avoid placing controls over pockets or balls.

### Coordinate system
Use a single table coordinate system for:
- felt boundaries,
- rails,
- pocket centers/radii,
- ball positions,
- cue direction,
- aiming guides,
- collision boundaries.

The visual and physics table dimensions must match exactly. Do not calculate physics in CSS pixels while rendering balls in unrelated world coordinates.

## 4. Required UI

### Top HUD
- Left: menu button.
- Center/left and center/right: player cards with avatar, player name, and turn indicator.
- Middle status pill: “Your turn”, “Opponent’s turn”, “Balls moving”, or a specific foul/result message.
- Right: sound and settings/camera buttons.
- Use clear active-player styling; do not depend only on color.

### Gameplay area
- Landscape table as the main visual focus.
- Cue ball and object balls rendered with correct size and perspective.
- Cue stick visible while aiming.
- Aiming line visible only in the appropriate phase.
- Optional first-contact marker and predicted path, but only if actually computed.
- No persistent panel may cover the playable table.

### Bottom controls
- Shot power slider or pull-back control.
- Optional spin control.
- Optional cue-ball placement control after a foul.
- Clear “Shoot” affordance on touch devices.
- Reset/practice controls only in the modes where they are valid.

### Menus
- Pause overlay: Resume, Restart (confirm first), Sound, Settings, Exit.
- Result overlay: Winner, concise match stats, Rematch, Home.
- Keep overlays compact and never leave a transparent blocker covering the table after closing.

## 5. Correct 8-ball rack and starting state

Use 16 balls total: one cue ball and fifteen object balls.
- Rack object balls in a tight triangle near the foot spot.
- Use a conventional 8-ball rack: the 8-ball in the center of the triangle, one solid and one stripe at the two rear corners, and the remaining balls shuffled legally.
- Place the cue ball near the head area for the break.
- Use deterministic rack positions with small, physically safe spacing.
- Do not initialize all balls at the bottom of the table.
- Make sure balls are inside the playable region and not overlapping rails or pockets.
- Reset/restart must restore exactly one cue ball and the correct object-ball count.

## 6. Gameplay phases — fix the stuck state

Use an explicit finite-state machine:

```text
READY
  -> AIMING
  -> SHOT_STARTED
  -> BALLS_MOVING
  -> SETTLING
  -> EVALUATE_SHOT
  -> TURN_CONTINUES or TURN_CHANGES
  -> AIMING
  -> MATCH_FINISHED
```

### Required state rules
- The player can aim only during `READY` / `AIMING`.
- On shoot, validate the shot, lock input, clear stale aiming UI, and transition to `SHOT_STARTED`.
- Advance to `BALLS_MOVING` only when the physics simulation has actually received the shot.
- Detect settled balls using both linear and angular velocity thresholds for a continuous settling window, not one frame.
- Ignore pocketed/inactive balls during settling checks.
- Add a maximum safety timeout. If the simulation becomes numerically stuck, stop the simulation safely, log a diagnostic, and recover to a valid state instead of showing “Shot in motion…” forever.
- Once settled, transition exactly once to `EVALUATE_SHOT`.
- Evaluate pocketed balls, fouls, group assignment, next player, and match result.
- Transition to the next valid aiming state or `MATCH_FINISHED`.
- Clear shot-specific data after evaluation.
- Every transition must be idempotent: React rerenders must not evaluate a shot twice.

Example pseudocode:

```js
const isSettled = balls.every(ball => {
  if (!ball.active || ball.pocketed) return true;
  return ball.speed < LINEAR_SLEEP_THRESHOLD &&
         ball.angularSpeed < ANGULAR_SLEEP_THRESHOLD;
});

if (phase === "BALLS_MOVING" && isSettledForLongEnough) {
  setPhase("EVALUATE_SHOT");
}
```

Do not copy the pseudocode blindly; implement a continuous settling timer using the simulation clock and make sure it cannot be reset every React render.

### Debugging requirements
In development mode, display a small debug panel with:
- current phase,
- active ball count,
- maximum ball speed,
- time since shot started,
- pocketed balls this shot,
- settling timer,
- last transition reason.

Remove or hide the debug panel in production builds. Add logs for each state transition, with a unique shot ID to detect duplicate evaluation.

## 7. Physics and collision requirements

Use a stable physics simulation appropriate for a pool table. A 2D top-down physics model with 3D-looking rendering is acceptable and may be more predictable than full 3D rigid-body simulation.

Required behavior:
- Sphere-to-sphere collisions with tuned restitution.
- Cushion collisions with realistic energy loss.
- Rolling friction that smoothly slows balls down.
- Pocket detection with capture behavior and a short pocket animation.
- Cue-ball scratch detection.
- No ball tunneling at high shot speeds.
- No permanent jitter or endless low-speed rolling.
- No balls passing through rails.
- No duplicate pocket events.
- Balls that are pocketed are removed from collision/settling checks.
- Fixed timestep or stable substeps independent of render frame rate.
- Physics must continue correctly when the browser frame rate fluctuates.

Tune the simulation based on repeated shots rather than relying on default physics values.

## 8. Aiming and shooting

### Aiming
- Pointer/touch drag determines cue angle.
- Render the cue stick in the same coordinate system as the cue ball.
- Draw the aim line from the cue ball along the calculated shot direction.
- Limit line length to table boundaries or a calculated first collision.
- If collision prediction is not implemented, label the line as a simple direction guide rather than a guaranteed trajectory.
- Keep aiming responsive; do not update the whole React app on every animation frame.

### Power
- Provide a clear power meter from low to high.
- Clamp shot power to a known safe range.
- Use one consistent mapping from gesture/slider to impulse.
- Display a small visual response as power changes.
- Lock the power input after the shot begins.

### Shoot
- On shoot, apply a single impulse to the cue ball.
- Prevent repeated clicks/taps from firing multiple shots.
- Disable aim/power input while balls move.
- Release controls only after the shot has been evaluated and the next player is determined.

## 9. Rules engine

Keep the rules in pure functions separate from the renderer. Implement and document one consistent 8-ball ruleset.

Track:
- current player,
- solids/stripes assignment,
- first ball contacted,
- pocketed balls during the shot,
- cue-ball scratch,
- illegal first contact,
- turn continuation,
- ball-in-hand,
- 8-ball victory/loss condition.

Do not assign groups or declare a winner from UI animation callbacks. Rules are evaluated only after all balls settle. Cover the break-shot rules explicitly and test edge cases.

## 10. Suggested project structure

```text
src/
  app/
    App.jsx
    router.jsx
  components/
    PlayerCard/
      PlayerCard.jsx
      PlayerCard.css
    GameStatus/
      GameStatus.jsx
      GameStatus.css
    IconButton/
      IconButton.jsx
      IconButton.css
    PowerControl/
      PowerControl.jsx
      PowerControl.css
    Modal/
      Modal.jsx
      Modal.css
  features/
    pool/
      PoolPage.jsx
      PoolPage.css
      PoolCanvas.jsx
      PoolCanvas.css
      TableScene.jsx
      TableScene.css
      PoolHUD.jsx
      PoolHUD.css
      AimOverlay.jsx
      AimOverlay.css
      PauseMenu.jsx
      PauseMenu.css
      ResultsPanel.jsx
      ResultsPanel.css
  game/
    physics/
      simulation.js
      constants.js
      collisions.js
      pockets.js
      settling.js
    rules/
      eightBallRules.js
      shotEvaluator.js
      matchState.js
    input/
      pointerInput.js
      touchInput.js
    debug/
      debugState.js
  state/
    poolStore.js
    settingsStore.js
  styles/
    tokens.css
    global.css
  main.jsx
```

Adapt this structure to the existing project. Do not delete working code or replace configuration wholesale without a reason.

## 11. State data

Use a clear model, for example:

```js
{
  phase: "READY",
  currentPlayerId: "player-1",
  shotId: 0,
  shotStartedAt: null,
  balls: [],
  pocketedThisShot: [],
  firstContactBallId: null,
  cueBallScratch: false,
  playerGroups: {
    "player-1": null,
    "player-2": null
  },
  winnerId: null,
  foulMessage: null
}
```

Use immutable state for React UI, but keep high-frequency physics state in a simulation/store/ref that does not trigger a full React rerender every frame. Define a single source of truth for ball positions and match phase.

## 12. Implementation order

### Phase 1: inspect and diagnose
- Inspect the existing repository and run it.
- Find the current table renderer, physics code, state management, and the exact reason “Shot in motion…” never clears.
- Check browser console and network errors.
- Write a short diagnosis before rewriting code.
- Preserve working parts.

### Phase 2: correct table composition
- Fix the aspect ratio and camera.
- Make all six pockets visible.
- Improve felt brightness, rails, ball visibility, cue stick, and HUD spacing.
- Confirm layout at 360×640, 390×844, 844×390, 1280×720, 1440×900, and 1920×1080.

### Phase 3: repair simulation lifecycle
- Fix ball initialization and rack placement.
- Implement stable friction, collision, pocketing, and settling.
- Fix state transitions and add a maximum shot timeout.
- Verify that every shot eventually exits the moving state.

### Phase 4: aiming and controls
- Add pointer/touch aiming, cue alignment, aim line, power control, and a single-shot guard.
- Verify controls are disabled during ball movement.

### Phase 5: rules and results
- Evaluate fouls and turn changes only after settling.
- Add restart, pause, rematch, and win/loss handling.
- Test break shots, scratches, legal pots, wrong first contact, and 8-ball outcomes.

### Phase 6: polish and regression tests
- Add sound, transitions, shadows, responsive controls, and accessibility.
- Run the production build and tests.
- Fix all runtime errors and broken asset references.

## 13. Acceptance tests — do not call it complete until these pass

### Table
- [ ] The table is landscape on desktop and not a tall trapezoid.
- [ ] All six pockets remain visible at supported sizes.
- [ ] Felt is bright enough to distinguish every ball.
- [ ] Cue stick points in the actual shot direction.
- [ ] Aim guide is visible while aiming and cleared after shooting.

### Balls and physics
- [ ] The rack is a tight triangle near the foot spot.
- [ ] Exactly one cue ball and fifteen object balls are initialized.
- [ ] Balls collide with each other and the cushions.
- [ ] Balls enter pockets correctly and trigger one pocket event.
- [ ] Pocketed balls are removed from active simulation.
- [ ] Balls eventually come to rest.
- [ ] No balls remain permanently jittering or moving at tiny speeds.

### State machine
- [ ] A shot changes phase from aiming to moving.
- [ ] A settled shot is evaluated exactly once.
- [ ] “Shot in motion…” cannot persist after all balls have settled.
- [ ] A safety timeout recovers from a stalled simulation.
- [ ] Players cannot shoot twice during one moving phase.
- [ ] The next player is selected only after rules evaluation.
- [ ] Restart restores the rack and clears all shot/result state.

### UI
- [ ] Player cards and turn status are legible.
- [ ] No panel obscures the table.
- [ ] Touch and mouse controls work.
- [ ] Menu, sound, pause, restart, and result buttons work.
- [ ] No console errors during a complete match.
- [ ] Production build succeeds.

## 14. Instructions to the coding agent

1. Start by inspecting the current repository; do not assume the existing architecture.
2. Reproduce the issue and identify the specific cause of the stuck “Shot in motion…” state.
3. Fix the actual cause before visual polish.
4. Match the reference composition: landscape table, six pockets, cue stick, numbered balls, compact player HUD, aiming line.
5. Use React + Vite + JavaScript, separate CSS files, and no Tailwind.
6. Keep rendering, physics, rules, and UI state separate.
7. Make changes in small, testable phases and keep the app runnable.
8. Run tests and the production build after changes. Fix errors rather than hiding them.
9. Do not replace a broken feature with a static visual imitation.
10. At the end, report the root cause, changed files, commands run, tests passed, and remaining limitations.

**Priority:** fix state/physics correctness → correct rack and table geometry → aiming/shooting → rules → visual polish → progression/multiplayer.
