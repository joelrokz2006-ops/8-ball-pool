import React, { useEffect, useState } from 'react';
import { ArrowLeft, Volume2, Music, Monitor, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import { settingsStore } from '../../state/settingsStore.js';
import { playerStore } from '../../state/playerStore.js';
import { audioManager } from '../../game/audio/audioManager.js';
import './SettingsPage.css';

export default function SettingsPage({ onBack }) {
  const [settings, setSettings] = useState(settingsStore.getState());
  const [ambientActive, setAmbientActive] = useState(audioManager.isMusicPlaying);

  useEffect(() => {
    return settingsStore.subscribe((s) => setSettings({ ...s }));
  }, []);

  const handleUpdate = (key, val) => {
    settingsStore.updateSetting(key, val);
  };

  const toggleAmbientMusic = () => {
    if (audioManager.isMusicPlaying) {
      audioManager.stopAmbientMusic();
      setAmbientActive(false);
    } else {
      audioManager.startAmbientMusic();
      setAmbientActive(true);
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your career progress, coins, and unlocks? This cannot be undone.')) {
      playerStore.resetProgress();
      alert('Career progress reset to defaults.');
    }
  };

  return (
    <div className="settings-page-container">
      <header className="settings-header">
        <div className="shop-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Game Settings</h2>
        </div>
      </header>

      <div className="settings-content">
        {/* Audio Group */}
        <div className="settings-group">
          <div className="settings-group-title">
            <Volume2 size={18} />
            <span>Audio & Atmosphere</span>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Sound Effects Volume</span>
              <span className="setting-sublabel">Ball clacks, cushion hits, cue strikes</span>
            </div>
            <input
              type="range"
              className="setting-slider"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleUpdate('sfxVolume', parseFloat(e.target.value))}
            />
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Music Volume</span>
              <span className="setting-sublabel">Fanfare and ambient soundtrack</span>
            </div>
            <input
              type="range"
              className="setting-slider"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleUpdate('musicVolume', parseFloat(e.target.value))}
            />
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Lounge Jazz Ambience</span>
              <span className="setting-sublabel">Chill generative pool hall chords</span>
            </div>
            <button
              className={`setting-toggle-btn ${ambientActive ? 'active' : ''}`}
              onClick={toggleAmbientMusic}
            >
              {ambientActive ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>

        {/* Gameplay & Controls Group */}
        <div className="settings-group">
          <div className="settings-group-title">
            <Smartphone size={18} />
            <span>Controls & Assistance</span>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Aim Trajectory Assistance</span>
              <span className="setting-sublabel">Laser path projection and deflection guides</span>
            </div>
            <select
              className="setting-select"
              value={settings.aimAssist}
              onChange={(e) => handleUpdate('aimAssist', e.target.value)}
            >
              <option value="extended">Extended Laser</option>
              <option value="standard">Standard Guide</option>
              <option value="off">Pro Mode (Off)</option>
            </select>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Control Layout</span>
              <span className="setting-sublabel">Position power meter for left/right hand</span>
            </div>
            <select
              className="setting-select"
              value={settings.handMode}
              onChange={(e) => handleUpdate('handMode', e.target.value)}
            >
              <option value="right">Right-Handed</option>
              <option value="left">Left-Handed</option>
            </select>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Haptic Feedback</span>
              <span className="setting-sublabel">Vibration pulses on cue strike and pocket drop</span>
            </div>
            <button
              className={`setting-toggle-btn ${settings.haptics ? 'active' : ''}`}
              onClick={() => handleUpdate('haptics', !settings.haptics)}
            >
              {settings.haptics ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Graphics Group */}
        <div className="settings-group">
          <div className="settings-group-title">
            <Monitor size={18} />
            <span>Visual Quality & Camera</span>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Default Camera Perspective</span>
              <span className="setting-sublabel">3D Angled club view or Top-Down 2D</span>
            </div>
            <select
              className="setting-select"
              value={settings.cameraMode}
              onChange={(e) => handleUpdate('cameraMode', e.target.value)}
            >
              <option value="3d">3D Perspective</option>
              <option value="topdown">Top-Down 2D</option>
            </select>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Graphics Quality</span>
              <span className="setting-sublabel">Shadow fidelity and pixel sampling</span>
            </div>
            <select
              className="setting-select"
              value={settings.quality}
              onChange={(e) => handleUpdate('quality', e.target.value)}
            >
              <option value="high">High (Soft Shadows, 60fps)</option>
              <option value="medium">Medium</option>
              <option value="low">Low (Performance)</option>
            </select>
          </div>
        </div>

        {/* Data Reset */}
        <div className="settings-group" style={{ borderColor: 'rgba(232, 107, 101, 0.3)' }}>
          <div className="settings-group-title" style={{ color: 'var(--color-danger)' }}>
            <AlertCircle size={18} />
            <span>Danger Zone</span>
          </div>

          <div className="setting-item-row">
            <div className="setting-item-info">
              <span className="setting-label">Reset Career Progress</span>
              <span className="setting-sublabel">Clear all matches, coins, and unlocks</span>
            </div>
            <button
              className="pause-btn-danger"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={handleResetProgress}
            >
              <RefreshCw size={14} />
              <span>Reset All</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
