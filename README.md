# Championship 8-Ball Pool V2 — Broadcast-Grade Billiards

A broadcast-grade, responsive 8-ball pool game crafted with React, Three.js, deterministic vector physics, and Web Audio synthesis. Built according to [`GAME_UI.md`](./GAME_UI.md) and expanded in [`GAME_SPEC_V2.md`](./GAME_SPEC_V2.md).

---

## ✨ What's New in V2

- **Next-Gen Visual Effects & Game Juice**:
  - **Dynamic Chalk Dust Particles**: Realistic blue chalk bursts radiating from the cue tip on impact.
  - **Golden Impact Sparks**: Collision sparks triggered on high-velocity ball-to-ball impacts.
  - **Pocket Suction Sparkles**: Celebratory upward emerald and gold sparkles on pocket drops.
  - **Dynamic Contact Shadows**: Soft ambient contact shadows beneath every ball that dynamically track position and drop state.
  - **Bank-Shot Cushion Trajectory Guide**: Raycasts multi-rail cushion rebounds, projecting bank-shot angles and target ball trajectories.
  - **Floating Combo Praise Banners**: Real-time visual feedback (*"GREAT POT!"*, *"BANK SHOT!"*, *"2 IN A ROW!"*, *"COMBO!"*).

- **Championship Game Modes**:
  - **Billiards Cup Tournament**: 8-player single elimination bracket (Quarter-Finals → Semi-Finals → Championship Final) with prize purse and golden trophy cup.
  - **Trickshot Academy**: 6 curated billiards puzzle challenges (Corner Snipe, Rail Hugger, Double Bank, Combination, Needle Gate, Cluster Clear) with a 3-star rating system.
  - **Enhanced vs AI**: Amateur, Club Pro, and Grandmaster Hustler with tactical thinking indicator.
  - **Pass & Play Local 2-Player**: Alternating turns on one device with WPA foul and ball-in-hand rules.
  - **Solo Practice**: Free play with instant table re-rack.

- **Audio Synthesizer 2.0**:
  - Added authentic cue tip chalking acoustic crunch.
  - Crowd cheers and applause on great pots and tournament victories.
  - Ascending chime arpeggios for potting streaks and combos.
  - Velocity-responsive phenolic resin ball clacks, rubber cushion thuds, and pocket drops.

- **Tactical Controls**:
  - Interactive **Chalk Cue** button with tactile sound and grip boost.
  - Fine-aiming micro adjustments (`-5°`, `-0.5°`, `+0.5°`, `+5°`) with exact aim degree display.
  - Interactive 2D Cue Ball English/Spin widget (topspin/follow, backspin/draw, side english).
  - Drag-back vertical power bar with percentage readout.
  - One-tap toggle between **3D Angled Perspective** and **Top-Down 2D**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Run Automated Physics & Rules Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎮 Controls

### Mouse / Touch
- **Aim**: Drag anywhere on the table to point the cue stick.
- **Micro Aim**: Tap `«`, `<`, `>`, `»` for sub-degree angle precision.
- **Power**: Drag down the vertical power meter to set stroke strength.
- **Shoot**: Tap the **STRIKE** button.
- **Chalk**: Tap **Chalk Cue** to chalk the tip before shooting.
- **Spin**: Tap **Spin** to set cue ball contact offset (follow, draw, english).
- **Ball-in-Hand**: Tap or drag anywhere on the table to place the cue ball after an opponent foul.

### Desktop Keyboard Shortcuts
- `Arrow Left` / `Arrow Right`: Rotate aim (`Shift` for 5° increments).
- `Arrow Up` / `Arrow Down`: Increase / decrease shot power.
- `Space` or `Enter`: Strike cue ball.
- `Escape`: Pause / Resume match.
