import React from 'react';
import { Play, RotateCcw, HelpCircle, LogOut, X, Volume2, Music } from 'lucide-react';
import { settingsStore } from '../../state/settingsStore.js';
import './PauseMenu.css';

export default function PauseMenu({ onResume, onRestart, onExit, onOpenRules }) {
  const settings = settingsStore.getState();

  const handleSFXChange = (e) => {
    settingsStore.updateSetting('sfxVolume', parseFloat(e.target.value));
  };

  const handleMusicChange = (e) => {
    settingsStore.updateSetting('musicVolume', parseFloat(e.target.value));
  };

  const handleAimAssistChange = (e) => {
    settingsStore.updateSetting('aimAssist', e.target.value);
  };

  return (
    <div className="pause-overlay" onClick={onResume}>
      <div className="pause-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pause-header">
          <div className="pause-title">
            <span>Match Paused</span>
          </div>
          <button className="hud-icon-btn" onClick={onResume} aria-label="Close pause menu">
            <X size={20} />
          </button>
        </div>

        {/* Quick Settings */}
        <div className="pause-settings-box">
          <div className="pause-setting-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Volume2 size={16} /> Sound Effects
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={handleSFXChange}
            />
          </div>

          <div className="pause-setting-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Music size={16} /> Music Volume
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={handleMusicChange}
            />
          </div>

          <div className="pause-setting-row">
            <span>Aim Assistance</span>
            <select
              value={settings.aimAssist}
              onChange={handleAimAssistChange}
              style={{
                background: 'var(--color-panel-raised)',
                border: '1px solid var(--color-panel-border)',
                color: 'var(--color-text)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.85rem'
              }}
            >
              <option value="extended">Extended Laser</option>
              <option value="standard">Standard</option>
              <option value="off">Pro (Off)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pause-actions">
          <button className="pause-btn-primary" onClick={onResume}>
            <Play size={18} />
            <span>Resume Match</span>
          </button>

          <button className="pause-btn-secondary" onClick={onRestart}>
            <RotateCcw size={18} />
            <span>Restart Table</span>
          </button>

          <button className="pause-btn-secondary" onClick={onOpenRules}>
            <HelpCircle size={18} />
            <span>8-Ball Rules & Guide</span>
          </button>

          <button className="pause-btn-danger" onClick={onExit}>
            <LogOut size={18} />
            <span>Exit to Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
