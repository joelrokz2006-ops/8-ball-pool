import React, { useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { gameStore } from '../../state/gameStore.js';
import './SpinControl.css';

export default function SpinControl({ cueSpin, onClose }) {
  const ballRef = useRef(null);

  const handlePointerAction = (e) => {
    const ball = ballRef.current;
    if (!ball) return;

    const rect = ball.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const radius = rect.width / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const dist = Math.hypot(dx, dy);
    // Clamp to 85% of cue ball radius to prevent miscue
    const maxRadius = radius * 0.82;
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    // normY is inverted: negative is top spin, positive is back spin
    gameStore.setCueSpin(normX, -normY);
  };

  const handlePointerDown = (e) => {
    handlePointerAction(e);
    const onMove = (moveEvent) => handlePointerAction(moveEvent);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const resetSpin = () => {
    gameStore.setCueSpin(0, 0);
  };

  // Convert cueSpin to visual percentage position
  const dotX = 50 + (cueSpin.x || 0) * 41;
  const dotY = 50 - (cueSpin.y || 0) * 41;

  let spinLabel = 'Center Strike (Stun)';
  if (cueSpin.y > 0.2) spinLabel = 'Top Spin (Follow)';
  else if (cueSpin.y < -0.2) spinLabel = 'Back Spin (Draw)';
  if (cueSpin.x > 0.2) spinLabel += ' + Right English';
  else if (cueSpin.x < -0.2) spinLabel += ' + Left English';

  return (
    <div className="spin-modal-backdrop" onClick={onClose}>
      <div className="spin-card" onClick={(e) => e.stopPropagation()}>
        <div className="spin-card-header">
          <span className="spin-card-title">Cue Ball English / Spin</span>
          <button className="spin-close-btn" onClick={onClose} aria-label="Close spin dialog">
            <X size={20} />
          </button>
        </div>

        <div
          ref={ballRef}
          className="spin-cue-ball"
          onPointerDown={handlePointerDown}
        >
          <div className="spin-crosshair-h" />
          <div className="spin-crosshair-v" />
          <div
            className="spin-contact-dot"
            style={{ left: `${dotX}%`, top: `${dotY}%` }}
          />
        </div>

        <div className="spin-info">{spinLabel}</div>

        <button className="spin-reset-btn" onClick={resetSpin}>
          <RotateCcw size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          Reset to Center
        </button>
      </div>
    </div>
  );
}
