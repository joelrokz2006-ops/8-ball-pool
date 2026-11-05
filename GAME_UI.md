# Premium 8-Ball Pool --- Game UI & Production Build Specification

> **Purpose:** Give this file to your coding agent as the single source
> of truth for building a polished, responsive 8-ball pool game. Build
> an original game inspired by the quality and usability of leading
> billiards games; do not copy another game's logos, assets, or exact
> screen layouts.

## 1. Product Vision

Create a premium-feeling 8-ball pool game with: - A beautiful
billiards-hall atmosphere and a clear, readable pool table. -
Responsive, satisfying aiming and shooting controls. - Credible ball
collisions, cushion rebounds, pocket detection, and turn rules. - A
complete product UI: home screen, play modes, matchmaking/lobby,
gameplay HUD, pause/settings, results, profile, progression, and shop. -
Desktop and mobile support, including touch, mouse, keyboard, and
different aspect ratios. - Strong performance, accessibility, and
graceful handling of loading/errors.

**Core principle:** Gameplay readability comes first. UI must never
obscure the cue ball, target ball, pockets, or aiming guide.

## 2. Recommended Technology

### Frontend

-   React + Vite + JavaScript.
-   React Three Fiber and Three.js for rendering the table and balls.
-   `@react-three/drei` for useful 3D helpers.
-   Rapier physics (`@react-three/rapier`) for collision simulation, if
    its integration proves stable for the chosen table setup.
-   React Router for screen navigation.
-   Framer Motion for restrained menu and panel transitions.
-   Zustand or a small well-defined React state layer for game/UI state.
-   Plain CSS with **separate CSS files per component/page**. **Do not
    use Tailwind CSS.**

### Backend (for later online features)

-   Node.js + Express using CommonJS (`require` / `module.exports`).
-   MongoDB Atlas for user profiles, progression, match records, and
    cosmetic inventory.
-   Socket.IO for realtime multiplayer.
-   JWT authentication with protected routes and server-side validation.
-   Keep the first playable version offline-first; do not block the core
    game on backend availability.

### Architecture rule

Separate the **rendering layer**, **physics/game rules**, **UI state**,
and **networking**. The UI must not be responsible for deciding whether
a shot is legal or who wins.

## 3. Visual Design System

### Art direction

A modern, premium billiards club: - Deep charcoal and midnight-green
surfaces. - Rich emerald felt with subtle fabric texture. - Warm walnut
or dark brushed-metal table rails. - Restrained champagne-gold accents
for premium highlights. - White typography with muted grey secondary
text. - Soft studio lighting, ambient occlusion where affordable, and
subtle reflections---not mirror-like plastic. - Use original, licensed,
or generated assets. Do not use unlicensed logos or ripped game assets.

### Suggested design tokens

``` css
:root {
  --color-bg: #0b1110;
  --color-panel: #121c19;
  --color-panel-raised: #1a2823;
  --color-felt: #087a50;
  --color-felt-dark: #04573a;
  --color-accent: #d9b56d;
  --color-text: #f5f5f0;
  --color-muted: #a7b2ac;
  --color-danger: #e86b65;
  --color-success: #70d6a1;
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 22px;
  --shadow-panel: 0 18px 50px rgba(0, 0, 0, .28);
}
```

Use tokens consistently. Avoid excessive gradients, glowing borders,
glassmorphism everywhere, and tiny low-contrast labels.

### Typography

-   Use a modern sans-serif family such as Inter or Manrope.
-   Clear hierarchy: large screen title, medium panel heading, concise
    body copy, compact metadata.
-   Use tabular numerals for scores, timers, currency-like virtual
    balances, and stats.
-   Never rely on color alone to communicate player turn, ball group,
    errors, or success.

### Buttons and feedback

-   Primary buttons: strong contrast, clear label, generous touch
    target.
-   Secondary buttons: quiet outlined or filled surfaces.
-   Destructive actions: reserved warning style and confirmation.
-   Hover, pressed, focused, disabled, loading, success, and error
    states must be designed.
-   Minimum touch target: approximately 44 × 44 CSS pixels.
-   Add visible keyboard focus indicators.

## 4. Required Screens

### A. Boot / Loading Screen

-   Original game mark and title.
-   Subtle animated ball or cue motif.
-   Progress indicator only when actual loading progress is available;
    otherwise use a restrained indeterminate indicator.
-   Clear retry state if loading fails.
-   Avoid a long unskippable intro.

### B. Main Menu

-   Full-screen premium billiards environment with the table as the
    visual hero.
-   Main action: **Play**.
-   Secondary actions: Practice, Friends/Online (if implemented),
    Missions, Cue Collection, Profile, Settings.
-   Profile avatar, level, XP progress, and virtual coin balance in a
    compact top area.
-   Daily reward card only if the reward system exists.
-   One focused promotional/event card at most; do not overcrowd the
    screen.
-   On mobile, use a clean bottom navigation with icons and labels; on
    desktop, use a balanced side or top navigation.
-   Every menu item must work. Do not ship dead buttons or placeholder
    screens disguised as completed features.

### C. Mode Selection

Create visually distinct cards: 1. **Practice** --- no pressure,
resettable table, optional shot hints. 2. **Play vs AI** --- selectable
difficulty, clear rules. 3. **Local 2 Player** --- turn handoff on the
same device. 4. **Online Match** --- show only when matchmaking and
networking are implemented. 5. **Private Room** --- show only when room
creation/joining works.

Each card includes a concise description, mode status, and clear CTA.
Lock unavailable features honestly rather than pretending they work.

### D. Match Lobby / Matchmaking

-   Player cards with avatar, display name, level, and connection
    status.
-   Table/venue preview and match format.
-   Ready state, searching animation, cancel action, timeout and retry
    behavior.
-   Never display fabricated opponents or claim a match is online if it
    is simulated.
-   For online play, show latency/connection status and reconnect
    behavior.

### E. Gameplay Screen --- Highest Priority

#### Table presentation

-   Table occupies the majority of the available play area.
-   Correct rectangular proportions and six pockets.
-   Felt texture should be subtle and not interfere with ball
    visibility.
-   Cushions, rails, pocket mouths, and shadows should be visually
    distinct.
-   Balls need readable numbers, realistic highlights, and distinct
    solids/stripes.
-   The cue stick should align with the actual shot direction.
-   Camera framing must keep the whole playable table visible on small
    screens.

#### HUD layout

-   Top: player names/avatars, current turn, match status, and compact
    score/ball-group indicator.
-   Near the table but outside critical play space: current player
    indicator and shot timer only if the selected mode uses a timer.
-   Bottom: shot power control, cue/spin control, call-pocket control if
    rules require it, and a compact menu button.
-   Keep important controls reachable with one thumb on mobile.
-   Never cover a pocket or a ball with a persistent panel.
-   Panels should collapse or reposition on short screens.

#### Aiming interaction

-   Aim by dragging around the cue ball or using a clear virtual
    joystick/ring.
-   Display an aim line with a visually distinct primary segment and
    optional predicted first contact.
-   Do not promise a complete bank-shot prediction unless it is actually
    calculated.
-   Shot power uses a drag-back gesture or power slider; make the chosen
    method consistent and discoverable.
-   Add subtle haptic feedback on supported devices, with a settings
    toggle.
-   Support mouse and touch without requiring hover.
-   Provide optional aiming assistance in practice mode; allow it to be
    disabled.

#### Shooting feedback

-   Cue pull-back scales with power.
-   A clear release animation and tasteful sound convey impact.
-   Balls roll, collide, spin, and settle naturally.
-   Pocketed balls animate into pockets without clipping or teleporting
    visibly.
-   Camera effects are restrained; never shake the screen so much that
    the table becomes hard to read.
-   Once all balls settle, determine fouls, legal continuation, turn
    change, and victory from the rules engine.

#### In-game menus

-   Pause/settings overlay with Resume, Restart (with confirmation),
    Sound, Music, Controls, Accessibility, and Exit.
-   Exit should explain whether the match will be forfeited.
-   For online matches, do not let the client unilaterally decide match
    outcomes.

### F. Match Results

-   Win/loss/draw state with clear visual hierarchy.
-   Short, tasteful result animation.
-   Show stats such as balls pocketed, fouls, and match duration only
    when accurately tracked.
-   Actions: Rematch, Home, and Next Match where appropriate.
-   Reward and XP changes must come from real game state, not hard-coded
    display values.
-   Avoid manipulative or misleading reward popups.

### G. Profile / Progression

-   Avatar, display name, level, XP, matches, wins, win rate, and best
    streak if tracked.
-   Cosmetic cue and table collection.
-   Achievements and missions only when implemented.
-   Use clear empty states for new users.

### H. Cue / Cosmetic Shop

-   Preview cues and table cosmetics in a 3D viewer where practical.
-   Clearly label owned, selected, and locked items.
-   Use virtual coins only unless a legally compliant real-money feature
    is deliberately developed.
-   Confirm purchases and persist inventory.
-   Do not make paid items affect competitive physics unless the rules
    explicitly support fair, transparent stat differences.

### I. Settings

-   Music and sound effect volume.
-   Graphics quality: Low / Medium / High / Auto.
-   Camera and aiming sensitivity.
-   Haptics toggle where supported.
-   Left/right-handed control layout.
-   Aim assist and color/contrast options.
-   Language option only if translations exist.
-   Persist settings locally; synchronize to account only when
    authentication exists.

## 5. Gameplay Rules: 8-Ball

Implement a deterministic rules module and test it independently from
rendering.

### Standard match flow

-   Use one cue ball and fifteen object balls: solids 1--7, 8-ball,
    stripes 9--15.
-   At the break, apply the chosen published ruleset consistently.
-   After groups are assigned, players aim to pocket their group.
-   A legal shot must hit the appropriate first object ball and satisfy
    the chosen ruleset's pocket/rail requirements.
-   Fouls can include cue-ball scratch, wrong first contact, and other
    rule violations according to the selected ruleset.
-   After a scratch, apply the correct ball-in-hand behavior for the
    selected ruleset.
-   A player must clear their group before legally pocketing the 8-ball.
-   Pocketing the 8-ball early or scratching while pocketing it must be
    handled according to the selected ruleset.
-   Display a concise foul explanation and next-player status.

**Important:** 8-ball rules vary by league and game variant. Document
the selected ruleset, implement it consistently, and do not mix rules
from different variants.

## 6. Physics and Simulation Requirements

-   Use a fixed physics timestep for stable simulation.
-   Implement sphere collisions, cushion collisions, pocket detection,
    friction, rolling slowdown, and collision restitution.
-   Tune parameters so balls do not feel weightless, sticky, or
    excessively bouncy.
-   Ensure balls settle reliably and do not jitter forever.
-   Prevent balls from clipping through rails, overlapping permanently,
    or falling through the table.
-   Use continuous collision detection or appropriate substeps if fast
    shots tunnel through objects.
-   Keep simulation and rendering synchronized without tying physics
    accuracy to frame rate.
-   Test edge cases: simultaneous collisions, pocket-mouth rebounds,
    cue-ball scratches, clustered balls, and shots at maximum power.
-   Do not rely on generic 3D rigid-body defaults without pool-specific
    tuning.
-   For a top-down/2.5D game, consider a custom 2D billiards simulation
    if it gives more reliable and controllable gameplay than a full 3D
    rigid-body setup.

## 7. Sound, Animation, and Micro-Interactions

-   Separate sound effects for cue strike, ball collision, cushion hit,
    pocket drop, UI click, and result state.
-   Sound should be spatially or dynamically mixed only when it improves
    clarity.
-   Provide independent music and effects volume.
-   Use short transitions (roughly 150--300 ms for common UI changes)
    and respect reduced-motion preferences.
-   Use animation for feedback, not decoration alone.
-   Avoid excessive particles, flashing, or persistent pulsing.
-   Never let animation delay essential input or make controls feel
    unresponsive.

## 8. Responsive Layout

### Mobile portrait

-   Keep the entire table visible and large enough to aim.
-   Place controls below the table or in a compact overlay that avoids
    ball/pocket occlusion.
-   Use thumb-friendly buttons and avoid tiny sliders.
-   Support device safe areas and notches.
-   Reflow player cards and hide nonessential metadata.

### Mobile landscape

-   Give most space to the table.
-   Place compact player information along the top and controls along
    one side or bottom edge.
-   Keep the cue-ball and aiming controls reachable.

### Desktop

-   Center the table with generous breathing room.
-   Use a side panel for match details or chat only if it does not
    reduce table readability.
-   Support mouse precision and keyboard shortcuts.
-   Do not stretch the table unnaturally to fill ultrawide displays.

Test at 360×640, 390×844, 844×390, 1280×720, 1440×900, and 1920×1080.

## 9. Accessibility and UX Quality

-   Keyboard navigation for menus and settings.
-   Visible focus states and semantic buttons.
-   Text contrast suitable for dark environments.
-   Do not communicate team/group state through color alone; use labels,
    patterns, and numbers.
-   Reduced-motion option.
-   Adjustable sound and haptics.
-   Clear error messages with recovery actions.
-   Avoid flashing effects and unnecessary sensory overload.
-   Keep language short and understandable.

## 10. Suggested Project Structure

``` text
src/
  app/
    App.jsx
    router.jsx
  assets/
    images/
    models/
    audio/
    fonts/
  components/
    Button/
      Button.jsx
      Button.css
    Modal/
      Modal.jsx
      Modal.css
    PlayerCard/
      PlayerCard.jsx
      PlayerCard.css
    ProgressBar/
      ProgressBar.jsx
      ProgressBar.css
    LoadingScreen/
      LoadingScreen.jsx
      LoadingScreen.css
  features/
    home/
      HomePage.jsx
      HomePage.css
    mode-select/
      ModeSelectPage.jsx
      ModeSelectPage.css
    game/
      GamePage.jsx
      GamePage.css
      PoolCanvas.jsx
      PoolCanvas.css
      GameHUD.jsx
      GameHUD.css
      AimControls.jsx
      AimControls.css
      PauseMenu.jsx
      PauseMenu.css
      ResultPanel.jsx
      ResultPanel.css
    profile/
      ProfilePage.jsx
      ProfilePage.css
    shop/
      ShopPage.jsx
      ShopPage.css
    settings/
      SettingsPage.jsx
      SettingsPage.css
  game/
    physics/
      simulation.js
      constants.js
      collisions.js
      pockets.js
    rules/
      eightBallRules.js
      fouls.js
      matchState.js
      rules.test.js
    input/
      pointerControls.js
      touchControls.js
      keyboardControls.js
    audio/
      audioManager.js
  state/
    gameStore.js
    settingsStore.js
  services/
    api.js
    socket.js
  styles/
    tokens.css
    global.css
  utils/
    formatters.js
    validation.js
  main.jsx
```

Use a folder structure that reflects actual implemented features. Avoid
empty files and unnecessary abstractions.

## 11. State Model

Represent match state explicitly, for example: - `phase`: loading,
ready, aiming, shooting, ballsMoving, evaluating, turnChange, paused,
finished. - `currentPlayerId`. - `playerGroups`: unassigned, solids,
stripes. - `balls`: positions, velocities, spin state, active/pocketed
state. - `shot`: aim angle, power, cue-ball placement, optional called
pocket. - `fouls`: structured foul codes and readable messages. -
`winnerId` and match result. - `settings`: sound, sensitivity, quality,
accessibility.

Use validated transitions. Prevent a new shot while balls are moving.
Prevent duplicate shot submission and stale input after a match ends.

## 12. Online Multiplayer --- Only After Offline Quality

-   Server-authoritative match rules and outcomes.
-   Validate shot inputs and turn ownership on the server.
-   Reconnect support and clear connection state.
-   Room lifecycle, match timeout, player disconnect handling, and
    rematch flow.
-   Avoid trusting client-reported coin balances, wins, or match
    results.
-   Add rate limiting and input validation.
-   Use secure authentication and protect private user data.
-   Test latency, packet loss, reconnection, and simultaneous requests.
-   Do not market multiplayer as available until real end-to-end testing
    passes.

## 13. Performance Targets

-   Aim for smooth 60 FPS on common modern devices, with scalable
    quality settings.
-   Keep input response immediate and aiming movement fluid.
-   Reuse materials, geometry, and audio resources where possible.
-   Limit expensive shadows and post-processing on mobile.
-   Dispose of GPU resources and event listeners correctly.
-   Avoid unnecessary React re-renders during every physics frame; keep
    high-frequency simulation updates outside the main UI render loop.
-   Show loading and fallback UI when WebGL is unavailable.
-   Profile before adding expensive visual effects.

## 14. Testing Checklist

### Gameplay

-   [ ] Rack layout is correct and repeatable.
-   [ ] Aim direction matches the pointer/touch direction.
-   [ ] Power changes shot speed predictably.
-   [ ] Balls collide and rebound plausibly.
-   [ ] Pockets detect balls reliably.
-   [ ] Ball motion settles without endless jitter.
-   [ ] Foul logic covers scratches and wrong first contact.
-   [ ] Groups are assigned correctly.
-   [ ] 8-ball win/loss conditions are correct.
-   [ ] A shot cannot be taken while balls are moving.
-   [ ] Restart and rematch reset all relevant state.

### UI

-   [ ] All buttons and navigation actions work.
-   [ ] Loading, empty, disabled, error, and success states exist.
-   [ ] No modal traps the player without a way out.
-   [ ] HUD does not cover important balls or pockets.
-   [ ] Text remains readable on small screens.
-   [ ] Touch controls work without hover.
-   [ ] Keyboard focus is visible.
-   [ ] Sound settings are respected.
-   [ ] Reduced motion is respected.

### Reliability

-   [ ] No console errors during a complete match.
-   [ ] No broken asset paths.
-   [ ] No state corruption after repeated matches.
-   [ ] Browser refresh recovers safely.
-   [ ] Online disconnects do not create false wins.
-   [ ] No fake stats, fake matchmaking, or nonfunctional buttons.

## 15. Implementation Workflow

Build in vertical slices. Keep the app runnable after each stage.

### Phase 1 --- Foundation

-   Create the Vite React app and install selected dependencies.
-   Establish global design tokens, typography, responsive layout,
    routing, and reusable buttons/panels.
-   Implement the loading and home screens.
-   Verify all navigation and viewport sizes.

### Phase 2 --- Table Prototype

-   Build table geometry, rails, pockets, cue ball, and object balls.
-   Add camera framing and responsive scaling.
-   Confirm ball and pocket visibility on mobile and desktop.

### Phase 3 --- Physics

-   Implement ball motion, collisions, cushions, friction, and pockets.
-   Add aiming, power, and shot settling detection.
-   Write repeatable physics tests and tune parameters.

### Phase 4 --- Rules

-   Implement the selected 8-ball ruleset as pure functions.
-   Add fouls, turn changes, ball-in-hand, group assignment, and
    win/loss evaluation.
-   Test edge cases independently from the UI.

### Phase 5 --- Complete Match UX

-   Add HUD, player turn indicator, aiming assistance, pause menu,
    sound, result panel, and restart.
-   Ensure all state transitions are correct.
-   Complete a full match against a simple AI.

### Phase 6 --- Polish

-   Add lighting, materials, restrained particles, sound design,
    responsive controls, accessibility, and loading/error states.
-   Profile on mobile and reduce expensive effects as needed.

### Phase 7 --- Progression

-   Add profile, XP, achievements, and cosmetic collection only after
    the core game is stable.
-   Persist data locally first, then add backend storage if needed.

### Phase 8 --- Multiplayer

-   Add server-authoritative matchmaking and realtime synchronization.
-   Test reconnects and malicious/stale client inputs.
-   Do not add real-money wagering by default.

## 16. AI Coding Agent Instructions

Follow these instructions throughout implementation:

1.  Inspect the existing repository before changing files. Preserve
    working code and report the current stack.
2.  Create a short implementation plan and identify dependencies before
    coding.
3.  Build the actual application---not just a design mockup or static
    screenshot.
4.  Use React + Vite, JavaScript, and separate CSS files. Do not use
    Tailwind.
5.  Make every visible control functional. If a feature is not
    implemented, hide it or label it as unavailable.
6.  Keep game rules separate from rendering and UI.
7.  Do not invent asset paths, API endpoints, credentials, or completed
    features.
8.  Use original/appropriately licensed assets and include graceful
    fallbacks.
9.  Test each phase before moving to the next. Run the available
    lint/build/test commands and fix errors.
10. Avoid dumping the entire application into one component. Keep
    components small and responsibility-focused.
11. Do not replace project configuration wholesale unless necessary;
    explain important changes.
12. After each phase, report files created/changed, commands run, tests
    passed, known issues, and the next step.
13. Prioritize a complete, playable offline game over half-built online
    features.
14. Never claim the game is production-ready until the build, gameplay,
    responsiveness, and tests have actually been verified.

## 17. Definition of Done

The first release is ready for review when: - A player can open the app,
start a match, aim, shoot, play a complete 8-ball game, and see a
correct result. - The table and balls look polished and stay readable
across supported screen sizes. - Physics and rules behave consistently
in tested scenarios. - All visible controls work and all error/loading
states are handled. - The app builds successfully without console errors
during the core flow. - Keyboard and touch interaction are usable. - The
project has clear setup instructions and no embedded secrets. - Known
limitations are documented honestly.

**Final priority order:** playable mechanics → correct rules →
responsive controls → premium visual polish → progression → online
multiplayer.
