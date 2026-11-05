/**
 * Fast 2D Vector utilities for billiards simulation
 */

export const vec2 = {
  create: (x = 0, z = 0) => ({ x, z }),
  
  clone: (v) => ({ x: v.x, z: v.z }),

  set: (v, x, z) => {
    v.x = x;
    v.z = z;
    return v;
  },

  add: (a, b) => ({ x: a.x + b.x, z: a.z + b.z }),

  sub: (a, b) => ({ x: a.x - b.x, z: a.z - b.z }),

  scale: (v, s) => ({ x: v.x * s, z: v.z * s }),

  dot: (a, b) => a.x * b.x + a.z * b.z,

  cross: (a, b) => a.x * b.z - a.z * b.x,

  lenSq: (v) => v.x * v.x + v.z * v.z,

  len: (v) => Math.hypot(v.x, v.z),

  distSq: (a, b) => {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return dx * dx + dz * dz;
  },

  dist: (a, b) => Math.hypot(a.x - b.x, a.z - b.z),

  normalize: (v) => {
    const l = Math.hypot(v.x, v.z);
    if (l === 0) return { x: 0, z: 0 };
    return { x: v.x / l, z: v.z / l };
  },

  reflect: (v, normal) => {
    const d = 2 * (v.x * normal.x + v.z * normal.z);
    return {
      x: v.x - d * normal.x,
      z: v.z - d * normal.z
    };
  }
};
