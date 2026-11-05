import * as THREE from 'three';

/**
 * High-performance Three.js particle system for pool table visual effects:
 * - Chalk dust burst on cue strike
 * - Golden impact flash on hard ball-to-ball collisions
 * - Emerald/gold pocket drop celebratory sparkles
 */

const MAX_PARTICLES = 250;

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Create pooled particle data
    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 3);
    this.sizes = new Float32Array(MAX_PARTICLES);

    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        active: false,
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        color: [1, 1, 1],
        size: 1.5,
        gravity: -15,
        drag: 0.94
      });
      this.sizes[i] = 0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Particle texture (soft circular glow)
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 2.2,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  // 1. Blue Chalk Dust burst on cue strike
  emitChalkDust(x, y, z, angle, power = 0.5) {
    const count = 18 + Math.floor(power * 14);
    // Strike direction vector
    const dirX = Math.sin(angle);
    const dirZ = Math.cos(angle);

    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;

      p.active = true;
      p.x = x - dirX * 1.5 + (Math.random() - 0.5) * 1.2;
      p.y = y + (Math.random() - 0.5) * 1.0;
      p.z = z - dirZ * 1.5 + (Math.random() - 0.5) * 1.2;

      // Cone spread forward along strike direction
      const spread = 0.6;
      const speed = 12 + power * 28 + Math.random() * 8;
      p.vx = (dirX + (Math.random() - 0.5) * spread) * speed;
      p.vy = (Math.random() * 0.8 + 0.2) * (10 + power * 15);
      p.vz = (dirZ + (Math.random() - 0.5) * spread) * speed;

      p.life = 0;
      p.maxLife = 0.45 + Math.random() * 0.35;
      p.color = [0.35 + Math.random() * 0.2, 0.65 + Math.random() * 0.3, 1.0]; // Chalk blue
      p.size = 2.0 + Math.random() * 1.5;
      p.gravity = -8;
      p.drag = 0.91;
    }
  }

  // 2. Golden Impact Flash on hard ball-to-ball collisions
  emitCollisionSparks(x, y, z, relativeSpeed) {
    const count = Math.min(16, 6 + Math.floor(relativeSpeed * 0.4));

    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;

      p.active = true;
      p.x = x + (Math.random() - 0.5) * 0.8;
      p.y = y + (Math.random() - 0.5) * 0.8;
      p.z = z + (Math.random() - 0.5) * 0.8;

      const angle = Math.random() * Math.PI * 2;
      const speed = 8 + Math.random() * relativeSpeed * 0.8;
      p.vx = Math.cos(angle) * speed;
      p.vy = (Math.random() * 0.7 + 0.3) * speed * 0.9;
      p.vz = Math.sin(angle) * speed;

      p.life = 0;
      p.maxLife = 0.3 + Math.random() * 0.2;
      p.color = [1.0, 0.88, 0.4]; // Gold spark
      p.size = 1.8 + Math.random() * 1.2;
      p.gravity = -18;
      p.drag = 0.93;
    }
  }

  // 3. Celebratory upward sparkles on pocket drop
  emitPocketCelebration(x, y, z) {
    const count = 24;

    for (let i = 0; i < count; i++) {
      const p = this.getAvailableParticle();
      if (!p) break;

      p.active = true;
      p.x = x + (Math.random() - 0.5) * 3;
      p.y = y + 0.5;
      p.z = z + (Math.random() - 0.5) * 3;

      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 8;
      p.vx = Math.cos(angle) * speed;
      p.vy = 12 + Math.random() * 18; // shoot upward
      p.vz = Math.sin(angle) * speed;

      p.life = 0;
      p.maxLife = 0.65 + Math.random() * 0.4;
      // Alternate emerald green and champagne gold
      p.color = Math.random() > 0.4 ? [0.44, 0.84, 0.63] : [0.95, 0.82, 0.45];
      p.size = 2.4 + Math.random() * 1.6;
      p.gravity = -12;
      p.drag = 0.95;
    }
  }

  getAvailableParticle() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.particles[i].active) return this.particles[i];
    }
    return null;
  }

  update(dt) {
    let activeCount = 0;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      const idx = i * 3;

      if (!p.active) {
        this.sizes[i] = 0;
        continue;
      }

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        this.sizes[i] = 0;
        continue;
      }

      // Physics integration
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      p.vy += p.gravity * dt;
      p.vx *= p.drag;
      p.vz *= p.drag;

      // Felt collision (stay above table felt Y = 0)
      if (p.y < 0.2) {
        p.y = 0.2;
        p.vy = -p.vy * 0.3;
      }

      const alpha = 1 - p.life / p.maxLife;

      this.positions[idx] = p.x;
      this.positions[idx + 1] = p.y;
      this.positions[idx + 2] = p.z;

      this.colors[idx] = p.color[0] * alpha;
      this.colors[idx + 1] = p.color[1] * alpha;
      this.colors[idx + 2] = p.color[2] * alpha;

      this.sizes[i] = p.size * alpha;
      activeCount++;
    }

    if (activeCount > 0 || this.geometry.attributes.position.needsUpdate) {
      this.geometry.attributes.position.needsUpdate = true;
      this.geometry.attributes.color.needsUpdate = true;
      this.geometry.attributes.size.needsUpdate = true;
    }
  }

  dispose() {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
