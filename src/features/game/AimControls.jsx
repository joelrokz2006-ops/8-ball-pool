import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { gameStore } from '../../state/gameStore.js';
import { settingsStore } from '../../state/settingsStore.js';
import SpinControl from './SpinControl.jsx';
import './AimControls.css';

export default function AimControls({ shot, phase, isCurrentPlayerAI, cueChalked }) {
  const [showSpinModal, setShowSpinModal] = useState(false);
  const powerTrackRef = useRef(null);
  const isDraggingPowerRef = useRef(false);
  const settings = settingsStore.getState();

  const handleFineAim = (degrees) => {
    if (phase !== 'aiming' || isCurrentPlayerAI) return;
    const rad = (degrees * Math.PI) / 180;
    gameStore.setAimAngle(shot.angle + rad);
    settingsStore.triggerHaptic(10);
  };

  const handleChalk = () => {
    if (phase !== 'aiming' || isCurrentPlayerAI) return;
    gameStore.chalkCue();
  };

  const handlePowerPointerDown = (e) => {
    if (phase !== 'aiming' || isCurrentPlayerAI) return;
    isDraggingPowerRef.current = true;
    updatePowerFromEvent(e);

    const onMove = (moveEvt) => {
      if (isDraggingPowerRef.current) updatePowerFromEvent(moveEvt);
    };

    const onUp = () => {
      isDraggingPowerRef.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const updatePowerFromEvent = (e) => {
    const track = powerTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const yFromBottom = rect.bottom - e.clientY;
    const rawRatio = yFromBottom / rect.height;
    const power = Math.max(0.08, Math.min(1.0, rawRatio));
    gameStore.setShotPower(power);
  };

  const handleShoot = () => {
    if (phase !== 'aiming' || isCurrentPlayerAI) return;
    gameStore.executeShot();
  };

  if (phase !== 'aiming' && phase !== 'shooting') {
    return null;
  }

  const isLeftHanded = settings.handMode === 'left';
  const powerPercent = Math.round((shot.power || 0.45) * 100);

  // Degrees in 0-360 format
  let deg = Math.round((shot.angle * 180) / Math.PI) % 360;
  if (deg < 0) deg += 360;

  const spinDotX = 50 + (shot.cueSpin?.x || 0) * 36;
  const spinDotY = 50 - (shot.cueSpin?.y || 0) * 36;

  return (
    <>
      <div
        className="aim-controls-overlay"
        style={{ flexDirection: isLeftHanded ? 'row-reverse' : 'row' }}
      >
        {/* Left cluster: Spin, Chalk, and Fine-Aim */}
        <div className="aim-left-cluster">
          <div className="aim-tools-row">
            <button
              className="spin-trigger-btn"
              onClick={() => setShowSpinModal(true)}
              disabled={isCurrentPlayerAI}
              title="Set cue ball spin / english"
            >
              <div className="spin-mini-icon">
                <div
                  className="spin-mini-dot"
                  style={{ left: `${spinDotX}%`, top: `${spinDotY}%` }}
                />
              </div>
              <span>Spin</span>
            </button>

            <button
              className={`chalk-trigger-btn ${cueChalked ? 'chalked' : ''}`}
              onClick={handleChalk}
              disabled={isCurrentPlayerAI || cueChalked}
              title={cueChalked ? 'Cue is freshly chalked' : 'Chalk cue tip for maximum grip'}
            >
              <Sparkles size={16} />
              <span>{cueChalked ? 'Chalked ✨' : 'Chalk Cue'}</span>
            </button>
          </div>

          <div className="fine-aim-bar">
            <button
              className="fine-btn"
              onClick={() => handleFineAim(-5)}
              disabled={isCurrentPlayerAI}
              title="Rotate Left 5°"
            >
              «
            </button>
            <button
              className="fine-btn"
              onClick={() => handleFineAim(-0.5)}
              disabled={isCurrentPlayerAI}
              title="Rotate Left 0.5°"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="fine-degrees-box">
              <span className="fine-degrees-val tabular-nums">{deg}°</span>
              <span className="fine-label">Aim Angle</span>
            </div>

            <button
              className="fine-btn"
              onClick={() => handleFineAim(0.5)}
              disabled={isCurrentPlayerAI}
              title="Rotate Right 0.5°"
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="fine-btn"
              onClick={() => handleFineAim(5)}
              disabled={isCurrentPlayerAI}
              title="Rotate Right 5°"
            >
              »
            </button>
          </div>
        </div>

        {/* Right cluster: Power meter and Shoot */}
        <div className="aim-right-cluster">
          <div className="power-meter-container">
            <div className="power-label tabular-nums">{powerPercent}%</div>
            <div
              ref={powerTrackRef}
              className="power-track-wrapper"
              onPointerDown={handlePowerPointerDown}
              title="Drag or click to adjust shot power"
            >
              <div
                className="power-track-fill"
                style={{ height: `calc(${powerPercent}% - 8px)` }}
              />
              <div
                className="power-track-thumb"
                style={{ bottom: `calc(${powerPercent}% - 9px)` }}
              />
            </div>
            <div className="power-label">POWER</div>
          </div>

          <button
            className="shoot-action-btn"
            onClick={handleShoot}
            disabled={isCurrentPlayerAI}
            title="Fire shot"
          >
            <Zap size={20} />
            <span>STRIKE</span>
          </button>
        </div>
      </div>

      {showSpinModal && (
        <SpinControl
          cueSpin={shot.cueSpin}
          onClose={() => setShowSpinModal(false)}
        />
      )}
    </>
  );
}
