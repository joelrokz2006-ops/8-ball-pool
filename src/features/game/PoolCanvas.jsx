import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gameStore } from '../../state/gameStore.js';
import { playerStore, FELT_CATALOG, CUES_CATALOG } from '../../state/playerStore.js';
import { settingsStore } from '../../state/settingsStore.js';
import {
  TABLE_WIDTH,
  TABLE_LENGTH,
  TABLE_HALF_WIDTH,
  TABLE_HALF_LENGTH,
  BALL_RADIUS,
  POCKETS,
  HEAD_STRING_X,
  FOOT_SPOT_X
} from '../../game/physics/constants.js';
import { updatePhysics, areBallsSettled } from '../../game/physics/simulation.js';
import { calculateTrajectory } from '../../game/physics/trajectory.js';
import { calculateAIShot, calculateAIBallInHandPlacement } from '../../game/ai/poolAI.js';
import { getBallTexture, getFeltTexture } from '../../game/physics/textures.js';
import { ParticleSystem } from '../../game/particles/particleSystem.js';
import { Move } from 'lucide-react';
import './PoolCanvas.css';

export default function PoolCanvas() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState(gameStore.getState());
  const [playerData, setPlayerData] = useState(playerStore.getState());
  const [settings, setSettings] = useState(settingsStore.getState());

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const ballMeshesRef = useRef([]);
  const ballShadowsRef = useRef([]);
  const cueMeshRef = useRef(null);
  const trajectoryGroupRef = useRef(null);
  const feltMaterialRef = useRef(null);
  const cueMaterialRef = useRef(null);
  const particleSystemRef = useRef(null);
  const isPointerDownRef = useRef(false);
  const aiAnimationRef = useRef({ active: false, targetAngle: 0, currentAngle: 0, targetPower: 0, progress: 0 });

  // Continuous settling timer and safety timeout refs
  const settlingSecondsRef = useRef(0);
  const shotElapsedSecondsRef = useRef(0);

  useEffect(() => {
    const unsubGame = gameStore.subscribe((state) => setGameState({ ...state }));
    const unsubPlayer = playerStore.subscribe((p) => setPlayerData({ ...p }));
    const unsubSettings = settingsStore.subscribe((s) => setSettings({ ...s }));
    return () => {
      unsubGame();
      unsubPlayer();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    if (feltMaterialRef.current) {
      const equippedFelt = FELT_CATALOG.find((f) => f.id === playerData.equippedFeltId) || FELT_CATALOG[0];
      feltMaterialRef.current.map = getFeltTexture(equippedFelt.color);
      feltMaterialRef.current.color.set(equippedFelt.color);
      feltMaterialRef.current.needsUpdate = true;
    }
  }, [playerData.equippedFeltId]);

  useEffect(() => {
    if (cueMaterialRef.current) {
      const equippedCue = CUES_CATALOG.find((c) => c.id === playerData.equippedCueId) || CUES_CATALOG[0];
      cueMaterialRef.current.color.set(equippedCue.colors[0] || '#4a2e1b');
    }
  }, [playerData.equippedCueId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x08110f);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 1, 1000);
    cameraRef.current = camera;
    updateCameraPosition(camera, settings.cameraMode, width, height);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: settings.quality !== 'low',
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, settings.quality === 'high' ? 2 : 1.2));
    renderer.shadowMap.enabled = settings.quality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Balanced Studio Lighting for high contrast
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Overhead pool table lamps
    const lamp1 = new THREE.SpotLight(0xfff5e6, 2.0, 320, Math.PI / 3.5, 0.35, 1.2);
    lamp1.position.set(-45, 100, 0);
    lamp1.castShadow = settings.quality !== 'low';
    lamp1.shadow.mapSize.width = 1024;
    lamp1.shadow.mapSize.height = 1024;
    lamp1.shadow.bias = -0.001;
    scene.add(lamp1);

    const lamp2 = new THREE.SpotLight(0xfff5e6, 2.0, 320, Math.PI / 3.5, 0.35, 1.2);
    lamp2.position.set(45, 100, 0);
    lamp2.castShadow = settings.quality !== 'low';
    lamp2.shadow.mapSize.width = 1024;
    lamp2.shadow.mapSize.height = 1024;
    lamp2.shadow.bias = -0.001;
    scene.add(lamp2);

    const fillLight = new THREE.DirectionalLight(0xd9b56d, 0.4);
    fillLight.position.set(0, 80, 80);
    scene.add(fillLight);

    // 5. Build Horizontal 2:1 Table
    const tableGroup = buildTableMesh();
    scene.add(tableGroup);

    // 6. 16 Balls + Contact Shadows
    const ballMeshes = [];
    const ballShadows = [];
    const sphereGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 24);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    sGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.35)');
    sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 64, 64);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const shadowGeo = new THREE.PlaneGeometry(BALL_RADIUS * 2.5, BALL_RADIUS * 2.5);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    for (let i = 0; i < 16; i++) {
      const tex = getBallTexture(i);
      const ballMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.12,
        metalness: 0.05
      });
      const mesh = new THREE.Mesh(sphereGeo, ballMat);
      mesh.castShadow = settings.quality !== 'low';
      mesh.position.set(0, BALL_RADIUS, 0);
      scene.add(mesh);
      ballMeshes.push(mesh);

      const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      shadowMesh.position.set(0, 0.05, 0);
      scene.add(shadowMesh);
      ballShadows.push(shadowMesh);
    }
    ballMeshesRef.current = ballMeshes;
    ballShadowsRef.current = ballShadows;

    // 7. Cue Stick
    const cueStick = buildCueStickMesh();
    scene.add(cueStick);
    cueMeshRef.current = cueStick;

    // 8. Trajectory Guide
    const trajGroup = buildTrajectoryGuideGroup();
    scene.add(trajGroup);
    trajectoryGroupRef.current = trajGroup;

    // 9. Particle System
    const particleSys = new ParticleSystem(scene);
    particleSystemRef.current = particleSys;

    gameStore.setParticleCallback((type, data) => {
      if (type === 'chalk') {
        particleSys.emitChalkDust(data.x, data.y, data.z, data.angle, data.power);
      } else if (type === 'collision') {
        particleSys.emitCollisionSparks(data.x, data.y, data.z, data.speed);
      } else if (type === 'pocket') {
        particleSys.emitPocketCelebration(data.x, data.y, data.z);
      }
    });

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateCameraPosition(camera, settingsStore.getState().cameraMode, w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Animation & Physics Lifecycle with Safety Timeout
    let lastTime = performance.now();
    let animId;

    const animate = (time) => {
      animId = requestAnimationFrame(animate);

      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const state = gameStore.getState();

      if (state.phase === 'moving') {
        shotElapsedSecondsRef.current += dt;

        updatePhysics(state.balls, dt, {
          onBallCollision: (b1, b2, speed) => gameStore.recordBallCollision(b1, b2, speed),
          onCushionCollision: (b, cushion, speed) => gameStore.recordCushionCollision(b, cushion, speed),
          onBallPocketed: (b, pocket) => gameStore.recordBallPocketed(b, pocket)
        });

        // Continuous settling window verification
        const stationary = areBallsSettled(state.balls);
        if (stationary) {
          settlingSecondsRef.current += dt;
          if (settlingSecondsRef.current >= 0.35) {
            settlingSecondsRef.current = 0;
            shotElapsedSecondsRef.current = 0;
            gameStore.onBallsSettled();
          }
        } else {
          settlingSecondsRef.current = 0;
        }

        // Safety maximum shot timeout (12 seconds)
        if (shotElapsedSecondsRef.current > 12.0) {
          console.warn('Safety shot timeout reached (12s). Forcing balls to settle.');
          state.balls.forEach((b) => {
            b.vx = 0;
            b.vz = 0;
          });
          settlingSecondsRef.current = 0;
          shotElapsedSecondsRef.current = 0;
          gameStore.onBallsSettled();
        }
      } else {
        settlingSecondsRef.current = 0;
        shotElapsedSecondsRef.current = 0;
      }

      particleSys.update(dt);
      handleAIThinkingAndAiming(dt);
      syncMeshesWithState(state);

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      sphereGeo.dispose();
      shadowGeo.dispose();
      particleSys.dispose();
    };
  }, []);

  useEffect(() => {
    if (cameraRef.current && containerRef.current) {
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      updateCameraPosition(cameraRef.current, settings.cameraMode, w, h);
    }
  }, [settings.cameraMode]);

  useEffect(() => {
    const isCurrentPlayerAI = gameState.players[gameState.currentPlayerId]?.isAI;

    if (isCurrentPlayerAI && gameState.phase === 'ballInHand') {
      const timer = setTimeout(() => {
        const spot = calculateAIBallInHandPlacement(gameState.balls, gameState.playerGroups, gameState.currentPlayerId);
        gameStore.placeCueBall(spot.x, spot.z);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (isCurrentPlayerAI && gameState.phase === 'aiming') {
      const shotPlan = calculateAIShot(gameState, gameState.difficulty);
      if (shotPlan) {
        aiAnimationRef.current = {
          active: true,
          startAngle: gameState.shot.angle,
          targetAngle: shotPlan.angle,
          targetPower: shotPlan.power,
          elapsed: 0,
          duration: 1.4
        };
      }
    }
  }, [gameState.currentPlayerId, gameState.phase]);

  function handleAIThinkingAndAiming(dt) {
    const ai = aiAnimationRef.current;
    if (!ai.active) return;

    ai.elapsed += dt;
    const t = Math.min(1, ai.elapsed / ai.duration);
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const angle = ai.startAngle + (ai.targetAngle - ai.startAngle) * ease;
    gameStore.setAimAngle(angle);

    if (t >= 0.5) {
      const powerProgress = (t - 0.5) / 0.5;
      gameStore.setShotPower(ai.targetPower * powerProgress);
    }

    if (t >= 1) {
      ai.active = false;
      setTimeout(() => {
        gameStore.executeShot();
      }, 200);
    }
  }

  // Camera framing for horizontal 2:1 landscape table (180 x 90)
  function updateCameraPosition(cam, mode, width, height) {
    const isPortrait = height > width;

    if (mode === 'topdown') {
      if (isPortrait) {
        cam.position.set(0, 290, 0);
      } else {
        cam.position.set(0, 180, 0);
      }
      cam.lookAt(0, 0, 0);
      cam.up.set(0, 0, -1);
    } else {
      // 3D Angled view: looking from front edge slightly tilted
      if (isPortrait) {
        cam.position.set(0, 240, 110);
      } else {
        cam.position.set(0, 145, 68);
      }
      cam.lookAt(0, -6, -4);
      cam.up.set(0, 1, 0);
    }
  }

  // Table geometry for horizontal 2:1 landscape table
  function buildTableMesh() {
    const tableGroup = new THREE.Group();

    // 1. Felt bed: 180 x 90
    const equippedFelt = FELT_CATALOG.find((f) => f.id === playerData.equippedFeltId) || FELT_CATALOG[0];
    const feltColor = equippedFelt.color || '#087a4b';

    const feltMat = new THREE.MeshStandardMaterial({
      map: getFeltTexture(feltColor),
      color: feltColor,
      roughness: 0.55,
      metalness: 0.02
    });
    feltMaterialRef.current = feltMat;

    const feltGeo = new THREE.BoxGeometry(TABLE_LENGTH, 4, TABLE_WIDTH);
    const feltMesh = new THREE.Mesh(feltGeo, feltMat);
    feltMesh.position.set(0, -2, 0);
    feltMesh.receiveShadow = settings.quality !== 'low';
    tableGroup.add(feltMesh);

    // 2. Wooden Frame Rails with Bevel
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x352216,
      roughness: 0.35,
      metalness: 0.1
    });

    const railThickness = 12;
    const railHeight = 6;

    // Top & Bottom Rails (horizontal along X)
    const tbRailGeo = new THREE.BoxGeometry(TABLE_LENGTH + railThickness * 2, railHeight, railThickness);
    const topRail = new THREE.Mesh(tbRailGeo, woodMat);
    topRail.position.set(0, railHeight / 2 - 2, -TABLE_HALF_WIDTH - railThickness / 2);
    topRail.receiveShadow = true;
    tableGroup.add(topRail);

    const bottomRail = new THREE.Mesh(tbRailGeo, woodMat);
    bottomRail.position.set(0, railHeight / 2 - 2, TABLE_HALF_WIDTH + railThickness / 2);
    bottomRail.receiveShadow = true;
    tableGroup.add(bottomRail);

    // Left & Right Rails (along Z)
    const lrRailGeo = new THREE.BoxGeometry(railThickness, railHeight, TABLE_WIDTH);
    const leftRail = new THREE.Mesh(lrRailGeo, woodMat);
    leftRail.position.set(-TABLE_HALF_LENGTH - railThickness / 2, railHeight / 2 - 2, 0);
    leftRail.receiveShadow = true;
    tableGroup.add(leftRail);

    const rightRail = new THREE.Mesh(lrRailGeo, woodMat);
    rightRail.position.set(TABLE_HALF_LENGTH + railThickness / 2, railHeight / 2 - 2, 0);
    rightRail.receiveShadow = true;
    tableGroup.add(rightRail);

    // Pearl Diamond Sights along rails
    const sightMat = new THREE.MeshStandardMaterial({
      color: 0xd9b56d,
      roughness: 0.2,
      metalness: 0.6
    });
    const sightGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.2, 16);

    // Sights along long rails (X axis)
    [-60, -30, 30, 60].forEach((x) => {
      const sT = new THREE.Mesh(sightGeo, sightMat);
      sT.position.set(x, railHeight - 1.9, -TABLE_HALF_WIDTH - railThickness / 2);
      tableGroup.add(sT);

      const sB = new THREE.Mesh(sightGeo, sightMat);
      sB.position.set(x, railHeight - 1.9, TABLE_HALF_WIDTH + railThickness / 2);
      tableGroup.add(sB);
    });

    // 3. Pockets & Metallic Rims
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd9b56d,
      roughness: 0.25,
      metalness: 0.85
    });

    const pocketWellMat = new THREE.MeshBasicMaterial({ color: 0x050505 });

    POCKETS.forEach((p) => {
      const holeGeo = new THREE.CylinderGeometry(p.radius, p.radius, 8, 24);
      const holeMesh = new THREE.Mesh(holeGeo, pocketWellMat);
      holeMesh.position.set(p.x, -3, p.z);
      tableGroup.add(holeMesh);

      const rimGeo = new THREE.TorusGeometry(p.radius + 0.5, 1.0, 12, 24);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, metalMat);
      rimMesh.position.set(p.x, 0.2, p.z);
      tableGroup.add(rimMesh);
    });

    // 4. Floor Drop Shadow
    const shadowGeo = new THREE.PlaneGeometry(TABLE_LENGTH + 40, TABLE_WIDTH + 40);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotateX(-Math.PI / 2);
    shadowMesh.position.set(0, -6, 0);
    tableGroup.add(shadowMesh);

    return tableGroup;
  }

  function buildCueStickMesh() {
    const cueGroup = new THREE.Group();
    const equippedCue = CUES_CATALOG.find((c) => c.id === playerData.equippedCueId) || CUES_CATALOG[0];

    const shaftGeo = new THREE.CylinderGeometry(0.7, 1.4, 90, 16);
    shaftGeo.rotateX(Math.PI / 2);
    shaftGeo.translate(0, 0, -45);

    const shaftMat = new THREE.MeshStandardMaterial({
      color: equippedCue.colors[0] || 0x4a2e1b,
      roughness: 0.35,
      metalness: 0.15
    });
    cueMaterialRef.current = shaftMat;
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat);
    cueGroup.add(shaftMesh);

    const gripGeo = new THREE.CylinderGeometry(1.2, 1.42, 30, 16);
    gripGeo.rotateX(Math.PI / 2);
    gripGeo.translate(0, 0, -70);
    const gripMat = new THREE.MeshStandardMaterial({
      color: equippedCue.colors[1] || 0x1a1a1a,
      roughness: 0.6
    });
    const gripMesh = new THREE.Mesh(gripGeo, gripMat);
    cueGroup.add(gripMesh);

    const ferruleGeo = new THREE.CylinderGeometry(0.7, 0.72, 2.5, 16);
    ferruleGeo.rotateX(Math.PI / 2);
    ferruleGeo.translate(0, 0, -1.25);
    const ferruleMat = new THREE.MeshStandardMaterial({
      color: 0xd9b56d,
      roughness: 0.2,
      metalness: 0.8
    });
    const ferruleMesh = new THREE.Mesh(ferruleGeo, ferruleMat);
    cueGroup.add(ferruleMesh);

    const tipGeo = new THREE.CylinderGeometry(0.68, 0.7, 1.0, 16);
    tipGeo.rotateX(Math.PI / 2);
    tipGeo.translate(0, 0, 0.5);
    const tipMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.8
    });
    const tipMesh = new THREE.Mesh(tipGeo, tipMat);
    cueGroup.add(tipMesh);

    return cueGroup;
  }

  function buildTrajectoryGuideGroup() {
    const group = new THREE.Group();

    // Primary laser line
    const primaryLineGeo = new THREE.BufferGeometry();
    const primaryPositions = new Float32Array(6);
    primaryLineGeo.setAttribute('position', new THREE.BufferAttribute(primaryPositions, 3));
    const primaryLine = new THREE.Line(primaryLineGeo, new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    }));
    group.add(primaryLine);

    // Bank-shot rebound line
    const bankLineGeo = new THREE.BufferGeometry();
    const bankPositions = new Float32Array(6);
    bankLineGeo.setAttribute('position', new THREE.BufferAttribute(bankPositions, 3));
    const bankLine = new THREE.Line(bankLineGeo, new THREE.LineBasicMaterial({
      color: 0xeab308,
      linewidth: 2,
      transparent: true,
      opacity: 0.85
    }));
    group.add(bankLine);

    // Ghost ball ring at contact
    const ghostRingGeo = new THREE.RingGeometry(BALL_RADIUS * 0.9, BALL_RADIUS, 32);
    ghostRingGeo.rotateX(-Math.PI / 2);
    const ghostRing = new THREE.Mesh(ghostRingGeo, new THREE.MeshBasicMaterial({
      color: 0xd9b56d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    }));
    group.add(ghostRing);

    // Target ball deflection line
    const targetLineGeo = new THREE.BufferGeometry();
    const targetPositions = new Float32Array(6);
    targetLineGeo.setAttribute('position', new THREE.BufferAttribute(targetPositions, 3));
    const targetLine = new THREE.Line(targetLineGeo, new THREE.LineBasicMaterial({
      color: 0x70d6a1,
      linewidth: 2,
      transparent: true,
      opacity: 0.9
    }));
    group.add(targetLine);

    // Cue ball deflection line
    const cueLineGeo = new THREE.BufferGeometry();
    const cuePositions = new Float32Array(6);
    cueLineGeo.setAttribute('position', new THREE.BufferAttribute(cuePositions, 3));
    const cueLine = new THREE.Line(cueLineGeo, new THREE.LineBasicMaterial({
      color: 0xffffff,
      linewidth: 1,
      transparent: true,
      opacity: 0.5
    }));
    group.add(cueLine);

    // Pocket highlight
    const pocketHighlightGeo = new THREE.RingGeometry(4.8, 6.2, 32);
    pocketHighlightGeo.rotateX(-Math.PI / 2);
    const pocketHighlight = new THREE.Mesh(pocketHighlightGeo, new THREE.MeshBasicMaterial({
      color: 0x70d6a1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    }));
    pocketHighlight.visible = false;
    group.add(pocketHighlight);

    group.userData = {
      primaryLine,
      bankLine,
      ghostRing,
      targetLine,
      cueLine,
      pocketHighlight
    };

    return group;
  }

  function syncMeshesWithState(state) {
    const ballMeshes = ballMeshesRef.current;
    const ballShadows = ballShadowsRef.current;
    const cue = cueMeshRef.current;
    const traj = trajectoryGroupRef.current;
    if (!ballMeshes.length) return;

    // Update Balls & Contact Shadows
    for (let i = 0; i < state.balls.length; i++) {
      const b = state.balls[i];
      const mesh = ballMeshes[i];
      const shadow = ballShadows[i];
      if (!mesh) continue;

      mesh.position.set(b.x, b.y, b.z);

      if (b.pocketed) {
        const scale = Math.max(0.01, 1 - (b.pocketProgress || 0));
        mesh.scale.set(scale, scale, scale);
        mesh.visible = (b.pocketProgress || 0) < 0.95;
        if (shadow) shadow.visible = false;
      } else {
        mesh.scale.set(1, 1, 1);
        mesh.visible = true;

        if (shadow) {
          shadow.visible = true;
          shadow.position.set(b.x, 0.05, b.z);
        }

        if (b.quaternion) {
          mesh.quaternion.set(b.quaternion[0], b.quaternion[1], b.quaternion[2], b.quaternion[3]);
        }
      }
    }

    const cueBall = state.balls.find((b) => b.id === 0);
    const isAimingPhase = state.phase === 'aiming';

    // Update Cue Stick (visible only while aiming)
    if (cue && cueBall) {
      if (isAimingPhase && !cueBall.pocketed) {
        cue.visible = true;
        const angle = state.shot.angle;
        const pullBackDist = 3.5 + (state.shot.power || 0) * 16;
        cue.position.set(
          cueBall.x - Math.sin(angle) * pullBackDist,
          BALL_RADIUS + 0.8,
          cueBall.z - Math.cos(angle) * pullBackDist
        );
        cue.rotation.set(0, angle, 0);
        cue.rotateX(0.08);
      } else {
        cue.visible = false;
      }
    }

    // Update Trajectory Guide (visible only while aiming)
    if (traj && cueBall && settings.aimAssist !== 'off') {
      if (isAimingPhase && !cueBall.pocketed) {
        traj.visible = true;
        const maxDist = settings.aimAssist === 'extended' ? 240 : 130;
        const trajData = calculateTrajectory(cueBall, state.shot.angle, state.balls, maxDist);

        if (trajData) {
          const { primaryLine, bankLine, ghostRing, targetLine, cueLine, pocketHighlight } = traj.userData;

          const pPos = primaryLine.geometry.attributes.position.array;
          pPos[0] = trajData.origin.x;
          pPos[1] = BALL_RADIUS;
          pPos[2] = trajData.origin.z;
          pPos[3] = trajData.contactPoint.x;
          pPos[4] = BALL_RADIUS;
          pPos[5] = trajData.contactPoint.z;
          primaryLine.geometry.attributes.position.needsUpdate = true;

          if (trajData.cushionReboundPath) {
            bankLine.visible = true;
            const bPos = bankLine.geometry.attributes.position.array;
            bPos[0] = trajData.cushionReboundPath.start.x;
            bPos[1] = BALL_RADIUS;
            bPos[2] = trajData.cushionReboundPath.start.z;
            bPos[3] = trajData.cushionReboundPath.end.x;
            bPos[4] = BALL_RADIUS;
            bPos[5] = trajData.cushionReboundPath.end.z;
            bankLine.geometry.attributes.position.needsUpdate = true;
          } else {
            bankLine.visible = false;
          }

          if (trajData.hitType === 'ball' || (trajData.isBankShot && trajData.targetBallPath)) {
            const hitPos = trajData.isBankShot ? trajData.secondHit.contactPoint : trajData.contactPoint;
            ghostRing.visible = true;
            ghostRing.position.set(hitPos.x, BALL_RADIUS + 0.1, hitPos.z);

            if (trajData.targetBallPath) {
              targetLine.visible = true;
              const tPos = targetLine.geometry.attributes.position.array;
              tPos[0] = trajData.targetBallPath.start.x;
              tPos[1] = BALL_RADIUS;
              tPos[2] = trajData.targetBallPath.start.z;
              tPos[3] = trajData.targetBallPath.end.x;
              tPos[4] = BALL_RADIUS;
              tPos[5] = trajData.targetBallPath.end.z;
              targetLine.geometry.attributes.position.needsUpdate = true;
            } else {
              targetLine.visible = false;
            }

            if (trajData.cueDeflectionPath) {
              cueLine.visible = true;
              const cPos = cueLine.geometry.attributes.position.array;
              cPos[0] = trajData.cueDeflectionPath.start.x;
              cPos[1] = BALL_RADIUS;
              cPos[2] = trajData.cueDeflectionPath.start.z;
              cPos[3] = trajData.cueDeflectionPath.end.x;
              cPos[4] = BALL_RADIUS;
              cPos[5] = trajData.cueDeflectionPath.end.z;
              cueLine.geometry.attributes.position.needsUpdate = true;
            } else {
              cueLine.visible = false;
            }
          } else {
            ghostRing.visible = false;
            targetLine.visible = false;
            cueLine.visible = false;
          }

          if (trajData.targetPocket) {
            pocketHighlight.visible = true;
            pocketHighlight.position.set(trajData.targetPocket.x, 0.4, trajData.targetPocket.z);
          } else {
            pocketHighlight.visible = false;
          }
        }
      } else {
        traj.visible = false;
      }
    }
  }

  const handlePointerDown = (e) => {
    if (gameState.players[gameState.currentPlayerId]?.isAI) return;
    isPointerDownRef.current = true;

    if (gameState.phase === 'ballInHand') {
      placeBallFromPointer(e);
      return;
    }

    if (gameState.phase === 'aiming') {
      updateAimFromPointer(e);
    }
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return;
    if (gameState.players[gameState.currentPlayerId]?.isAI) return;

    if (gameState.phase === 'ballInHand') {
      placeBallFromPointer(e);
      return;
    }

    if (gameState.phase === 'aiming') {
      updateAimFromPointer(e);
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  function updateAimFromPointer(e) {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;

    const rect = canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BALL_RADIUS);
    const targetPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, targetPoint);

    if (targetPoint) {
      const cueBall = gameState.balls.find((b) => b.id === 0);
      if (cueBall) {
        const dx = targetPoint.x - cueBall.x;
        const dz = targetPoint.z - cueBall.z;
        if (Math.hypot(dx, dz) > 2) {
          const angle = Math.atan2(dx, dz);
          gameStore.setAimAngle(angle);
        }
      }
    }
  }

  function placeBallFromPointer(e) {
    const canvas = canvasRef.current;
    const camera = cameraRef.current;
    if (!canvas || !camera) return;

    const rect = canvas.getBoundingClientRect();
    const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -BALL_RADIUS);
    const point = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, point);

    if (point) {
      gameStore.placeCueBall(point.x, point.z);
    }
  }

  return (
    <div
      ref={containerRef}
      className="pool-canvas-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="pool-canvas-element" />

      {gameState.phase === 'ballInHand' && (
        <div className="ball-in-hand-overlay">
          <Move size={18} />
          <span>BALL IN HAND: Tap or drag anywhere on table to place Cue Ball</span>
        </div>
      )}
    </div>
  );
}
