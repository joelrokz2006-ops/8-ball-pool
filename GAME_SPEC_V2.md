# Championship 8-Ball Pool V2 — Advanced Game & UI Specification

> **Document Type:** System Architecture, Feature Expansion & Visual Effects Spec  
> **Status:** Active Target Specification  
> **Target Version:** 2.0.0

---

## 1. Executive Summary & Vision

Transform the 8-ball pool game into a **broadcast-grade, premium billiards experience** featuring:
1. **Next-Gen Visual Effects & Game Juice**:
   - Blue chalk dust particle bursts at cue impact point.
   - Collision impact shockwaves and dynamic contact pulses.
   - Pocket suction glow and floating combo praise banners (*"GREAT POT!", "BANK SHOT!", "COMBO!", "GOLDEN BREAK!"*).
   - Dynamic contact shadows under every ball on the felt.
   - Bank-shot trajectory prediction (reflecting off cushions to visualize multi-rail shots).
2. **New Championship Game Modes**:
   - **Billiards Cup Tournament**: 8-player knockout bracket (Quarter-Finals → Semi-Finals → Championship Final) with trophy ceremonies!
   - **Trickshot Academy**: 6 curated puzzle challenges (obstacles, tight bank shots, jump angle snipes) with 3-star rating systems and rewards.
   - **Enhanced vs AI**: Amateur, Club Pro, and Grandmaster Hustler with tactical thinking indicator.
   - **Local 2-Player Pass & Play** and **Solo Practice**.
3. **Advanced Cue & Ball Mechanics**:
   - Interactive chalk button to chalk cue stick with authentic acoustic crunch.
   - Cue elevation tilt and enhanced cue pull-back stroke physics.
   - Precise aim fine-tuning dial with degrees readout.
4. **Broadcast HUD & Presentation**:
   - TV-style match intro with VS badge flare.
   - Real-time shot timer bar (optional/standard for tournament play).
   - In-game floating notifications, streak multipliers, and instant celebratory victory effects.
   - Full responsive layout across desktop, tablet, and mobile portrait/landscape.

---

## 2. Technical Architecture & File Structure

```text
src/
  game/
    physics/
      constants.js          // Table, ball, cushion, pocket dimensions
      vector.js             // Fast 2D math & reflections
      cushions.js           // Segmented rails with pocket jaws
      pockets.js            // Pocket drop detection
      simulation.js         // Fixed-step sub-step physics with quaternion spin
      trajectory.js         // Bank-shot raycaster with ghost ball & multi-rail reflections
      textures.js           // Procedural high-res ball & felt textures
    particles/
      particleSystem.js     // Three.js chalk dust, impact sparks, pocket suction particles
    rules/
      eightBallRules.js     // WPA rules: open table, groups, legal contact, fouls, 8-ball win/loss
      rules.test.js         // Automated test suite
    tournament/
      tournamentData.js     // 8-player bracket generator, AI simulation & state
    challenges/
      trickshotData.js      // Challenge setups, obstacle balls, targets & star requirements
    ai/
      poolAI.js             // Smart AI with angle evaluation, cut scoring, and variance
    audio/
      audioManager.js       // Web Audio synthesis (ball clack, chalk crunch, cue strike, pocket drop, crowd cheer)
  state/
    gameStore.js            // Match state, active shot, balls, turn events, combo tracking
    playerStore.js          // Coins, level, XP, cues, felts, career stats, achievements
    settingsStore.js        // Audio volume, aim assist, hand layout, quality, haptics
    tournamentStore.js      // Tournament bracket state, round progression & rewards
  features/
    game/
      PoolCanvas.jsx        // 3D Three.js table, balls, cue, particles, shadows, bank lines
      PoolCanvas.css
      GameHUD.jsx           // Broadcast HUD, player cards, ball pips, timer, view toggle
      GameHUD.css
      AimControls.jsx       // Aim dial, chalk button, power slider, strike action
      AimControls.css
      SpinControl.jsx       // Cue ball spin / english offset picker
      SpinControl.css
      PauseMenu.jsx         // Pause overlay with quick settings & rules
      PauseMenu.css
      ResultPanel.jsx       // Match results, confetti, stats, XP/coin gains
      ResultPanel.css
    tournament/
      TournamentPage.jsx    // Interactive 8-player bracket visualizer & match kickoff
      TournamentPage.css
    challenges/
      TrickshotPage.jsx     // Trickshot level selector with star ratings & objectives
      TrickshotPage.css
    home/
      HomePage.jsx          // Hero menu with tournament & trickshot entry points
      HomePage.css
    mode-select/
      ModeSelectPage.jsx    // Visual mode cards (Tournament, AI, Practice, 2P, Trickshot)
      ModeSelectPage.css
    shop/
      ShopPage.jsx          // 3D preview, cues with stats, custom felts
      ShopPage.css
    profile/
      ProfilePage.jsx       // Career statistics, avatar picker, achievements
      ProfilePage.css
    settings/
      SettingsPage.jsx      // Volume sliders, ambient lounge toggle, graphics quality
      SettingsPage.css
    rules-guide/
      RulesGuideModal.jsx   // Illustrated 8-ball rulebook
      RulesGuideModal.css
  components/
    LoadingScreen/
      LoadingScreen.jsx     // Club intro & progress loader
      LoadingScreen.css
  styles/
    tokens.css              // Design system tokens
    global.css              // Global reset & accessibility
  app/
    App.jsx                 // App router & screen manager
  main.jsx
```

---

## 3. Visual Effects & 3D Polish Specification

### A. Dynamic Particle Engine (`particleSystem.js`)
- **Chalk Dust Burst**: When cue strikes the cue ball, emit 15–25 blue-tinted micro-particles that radiate along the strike vector and fade with gravity.
- **Ball Collision Sparks**: On high-speed impacts ($v > 15$), emit subtle golden flash particles at the contact point.
- **Pocket Entry Vortex**: When a ball falls into a pocket, trigger an inward suction ring and celebratory upward sparkles.

### B. Dynamic Contact Shadows
- Beneath each ball, render a realistic soft contact shadow disc on the felt bed that scales and fades dynamically if the ball drops into a pocket.

### C. Bank-Shot & Cushion Trajectory Raycasting
- Trajectory guide projects:
  1. Primary line to first object ball or cushion.
  2. If hitting cushion first, calculates specular reflection ray to show bank-shot path!
  3. Ghost ball with target ball potting direction and cue ball tangent deflection.
  4. Pocket glow indicator when the trajectory aligns with a pocket mouth.

### D. Chalking Cue Interaction
- Dedicated chalk button on HUD: clicks trigger a chalk animation and crisp chalking sound, applying a 5% accuracy boost or visual cue tip glow!

---

## 4. Game Modes Specification

### A. Billiards Cup Tournament
- 8-Player single elimination bracket.
- AI matches simulate realistically based on assigned seed ratings.
- Player advances through Quarter-Finals, Semi-Finals, to the Grand Final.
- Championship trophy and grand coin prize awarded to the tournament winner!

### B. Trickshot Academy
- 6 Unique curated billiards puzzles:
  1. **Corner Pocket Snipe**: Pot the 8-ball past a barrier ball.
  2. **Double Bank Delight**: Pot an object ball by banking off two cushions.
  3. **Cluster Split**: Break a cluster and pot 2 target balls.
  4. **The Rail Hugger**: Pot a frozen ball along the long rail.
  5. **Kick Shot Mastery**: Cue ball must hit cushion before striking target ball into side pocket.
  6. **Golden Break Challenge**: Pot 3 balls in a single shot.
- 3-Star rating system (Shots taken, clean potting, no fouls).

### C. Play vs AI, Local 2-Player & Solo Practice
- Enhanced AI with human-like aim variance, cut angle evaluation, and animated cue aiming.
- Pass & Play with turn swap alerts and Ball-in-Hand overlay.
- Solo practice with instant table re-rack.

---

## 5. Audio Synthesizer 2.0 (`audioManager.js`)

Synthesize realistic physical acoustics via Web Audio API:
- `playChalk()`: Crisp textured frictional chalking noise.
- `playCueHit(power)`: Punchy wooden cue stroke with leather snap.
- `playBallClack(speed)`: Crisp phenolic resonance with velocity scaling.
- `playCushion(speed)`: Damped rubber cushion impact.
- `playPocket()`: Leather pocket cup drop and channel rattle.
- `playCheer()`: Stadium crowd cheer / applause on great pots and wins!
- `playFoul()`: Warning tone.
- `playWin()`: Triumphant fanfare.
- `ambientMusic`: Warm jazz lounge chord progressions.

---

## 6. Implementation Plan & Steps

1. **Step 1**: Create particle system module (`particleSystem.js`) and dynamic ball contact shadows in Three.js scene.
2. **Step 2**: Enhance trajectory raycaster (`trajectory.js`) with bank-shot cushion reflections.
3. **Step 3**: Enhance audio synthesizer with chalk sound, crowd applause, and combo audio.
4. **Step 4**: Implement Trickshot Academy engine (`trickshotData.js`, `TrickshotPage.jsx`, `TrickshotPage.css`).
5. **Step 5**: Implement Billiards Cup Tournament engine (`tournamentData.js`, `tournamentStore.js`, `TournamentPage.jsx`, `TournamentPage.css`).
6. **Step 6**: Upgrade `PoolCanvas.jsx`, `GameHUD.jsx`, `AimControls.jsx`, and `gameStore.js` with chalking, combo banners (*"GREAT POT!", "BANK SHOT!"*), and particle rendering.
7. **Step 7**: Update `HomePage.jsx` and `ModeSelectPage.jsx` to feature all enhanced modes.
8. **Step 8**: Run automated tests, verify builds, and validate responsive performance.
