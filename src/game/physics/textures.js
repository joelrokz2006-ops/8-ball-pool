import * as THREE from 'three';

const BALL_COLORS = {
  1: '#eab308', // Yellow
  2: '#2563eb', // Blue
  3: '#dc2626', // Red
  4: '#7c3aed', // Purple
  5: '#ea580c', // Orange
  6: '#16a34a', // Green
  7: '#851a1a', // Maroon
  8: '#111827', // Black
  9: '#eab308', // Stripe Yellow
  10: '#2563eb', // Stripe Blue
  11: '#dc2626', // Stripe Red
  12: '#7c3aed', // Stripe Purple
  13: '#ea580c', // Stripe Orange
  14: '#16a34a', // Stripe Green
  15: '#851a1a'  // Stripe Maroon
};

const textureCache = new Map();

/**
 * Generate high-definition equirectangular texture for pool balls
 */
export function getBallTexture(ballNumber) {
  if (textureCache.has(ballNumber)) {
    return textureCache.get(ballNumber);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ballNumber === 0) {
    // Cue Ball: pristine ivory with subtle gloss gradient & red spin indicators
    const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 200);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, '#eae6df');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Red spin marker dots
    ctx.fillStyle = '#dc2626';
    const dots = [
      { x: 256, y: 128, r: 6 },
      { x: 128, y: 128, r: 4 },
      { x: 384, y: 128, r: 4 }
    ];
    dots.forEach((d) => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    const isStripe = ballNumber >= 9;
    const baseColor = BALL_COLORS[ballNumber] || '#999999';

    if (isStripe) {
      // White top and bottom polar caps
      ctx.fillStyle = '#f8f8f5';
      ctx.fillRect(0, 0, 512, 256);

      // Central colored stripe band
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 60, 512, 136);

      // Subtle seam shading along stripe edge
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 58, 512, 4);
      ctx.fillRect(0, 194, 512, 4);
    } else {
      // Pure solid color
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 512, 256);
    }

    // Number plates on both sides (front and back of sphere: x = 128 and x = 384)
    [128, 384].forEach((cx) => {
      // White number disc
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, 128, 36, 0, Math.PI * 2);
      ctx.fill();

      // Number text
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ballNumber.toString(), cx, 129);

      // Underline on balls 6 and 9 to distinguish orientation
      if (ballNumber === 6 || ballNumber === 9) {
        ctx.fillRect(cx - 14, 146, 28, 4);
      }
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(ballNumber, texture);

  return texture;
}

/**
 * Generate realistic procedural woven pool felt texture
 */
export function getFeltTexture(feltHex = '#087a50') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = feltHex;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle woven fiber noise
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 16);
  texture.needsUpdate = true;
  return texture;
}
