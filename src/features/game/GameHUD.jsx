import React from 'react';
import { Menu, Camera, Volume2, VolumeX, Eye, Trophy } from 'lucide-react';
import { settingsStore } from '../../state/settingsStore.js';
import { BALL_GROUPS } from '../../game/rules/eightBallRules.js';
import './GameHUD.css';

const BALL_COLORS = {
  1: '#eab308', 2: '#2563eb', 3: '#dc2626', 4: '#7c3aed',
  5: '#ea580c', 6: '#16a34a', 7: '#851a1a', 8: '#111827',
  9: '#eab308', 10: '#2563eb', 11: '#dc2626', 12: '#7c3aed',
  13: '#ea580c', 14: '#16a34a', 15: '#851a1a'
};

export default function GameHUD({ gameState, onPause }) {
  const {
    currentPlayerId,
    players,
    playerGroups,
    balls,
    statusMessage,
    lastFoul,
    phase,
    mode,
    comboText,
    activeChallenge
  } = gameState;

  const settings = settingsStore.getState();

  const p1 = players.player1;
  const p2 = players.player2;

  const p1Group = playerGroups.player1;
  const p2Group = playerGroups.player2;

  const toggleMute = () => {
    settingsStore.updateSetting('muted', !settings.muted);
  };

  const toggleCamera = () => {
    const nextMode = settings.cameraMode === '3d' ? 'topdown' : '3d';
    settingsStore.updateSetting('cameraMode', nextMode);
  };

  const renderBallPips = (group) => {
    if (!group) return null;

    const ballIds = group === BALL_GROUPS.SOLIDS ? [1, 2, 3, 4, 5, 6, 7] : [9, 10, 11, 12, 13, 14, 15];
    const remainingBalls = balls.filter((b) => !b.pocketed && ballIds.includes(b.id));

    if (remainingBalls.length === 0) {
      const eightBall = balls.find((b) => b.id === 8);
      const isPocketed = eightBall ? eightBall.pocketed : false;
      return (
        <div className="hud-balls-strip">
          <div
            className={`hud-ball-pip ${isPocketed ? 'pocketed' : ''}`}
            style={{ backgroundColor: '#111827', border: '1px solid #d9b56d' }}
            title="Target: 8-Ball"
          >
            8
          </div>
        </div>
      );
    }

    return (
      <div className="hud-balls-strip">
        {ballIds.map((id) => {
          const ball = balls.find((b) => b.id === id);
          const isPocketed = ball ? ball.pocketed : false;
          return (
            <div
              key={id}
              className={`hud-ball-pip ${isPocketed ? 'pocketed' : ''}`}
              style={{
                backgroundColor: BALL_COLORS[id],
                border: id >= 9 ? '1px dashed #ffffff' : 'none'
              }}
              title={`Ball ${id} (${id <= 7 ? 'Solid' : 'Stripe'})`}
            />
          );
        })}
      </div>
    );
  };

  const isP1Turn = currentPlayerId === 'player1';
  const isP2Turn = currentPlayerId === 'player2';
  const isFoulMessage = !!lastFoul || statusMessage.toLowerCase().includes('foul');

  return (
    <div className="game-hud-overlay">
      <div className="hud-top-bar">
        {/* Left actions: Pause/Menu */}
        <div className="hud-actions-left">
          <button className="hud-icon-btn" onClick={onPause} title="Pause / Menu">
            <Menu size={20} />
          </button>
        </div>

        {/* Center: Matchup Scoreboard */}
        <div className="hud-matchup">
          {/* Player 1 Card */}
          <div className={`hud-player-card ${isP1Turn ? 'active-turn' : ''}`}>
            <div className="hud-player-avatar">{p1.avatar}</div>
            <div className="hud-player-info">
              <span className="hud-player-name">{p1.name}</span>
              <span className="hud-player-group">
                {activeChallenge ? 'CHALLENGE' : p1Group ? p1Group.toUpperCase() : 'OPEN'}
              </span>
              {!activeChallenge && renderBallPips(p1Group)}
            </div>
          </div>

          {/* Turn / Status Pill */}
          <div className="hud-center-vs">
            <div className="hud-turn-pill">
              {phase === 'moving'
                ? 'IN MOTION'
                : mode === 'tournament'
                ? 'TOURNAMENT'
                : activeChallenge
                ? 'TRICKSHOT'
                : isP1Turn
                ? `${p1.name.toUpperCase()}'S SHOT`
                : `${p2.name.toUpperCase()}'S SHOT`}
            </div>
          </div>

          {/* Player 2 Card */}
          <div className={`hud-player-card ${isP2Turn ? 'active-turn' : ''}`}>
            <div className="hud-player-avatar">{p2.avatar}</div>
            <div className="hud-player-info">
              <span className="hud-player-name">{p2.name}</span>
              <span className="hud-player-group">
                {activeChallenge ? 'GOAL' : p2Group ? p2Group.toUpperCase() : 'OPEN'}
              </span>
              {!activeChallenge && renderBallPips(p2Group)}
            </div>
          </div>
        </div>

        {/* Right actions: Camera View & Mute */}
        <div className="hud-actions-right">
          <button
            className="hud-icon-btn"
            onClick={toggleCamera}
            title={settings.cameraMode === '3d' ? 'Switch to Top-Down 2D' : 'Switch to 3D Angled'}
          >
            {settings.cameraMode === '3d' ? <Camera size={20} /> : <Eye size={20} />}
          </button>
          <button className="hud-icon-btn" onClick={toggleMute} title={settings.muted ? 'Unmute' : 'Mute'}>
            {settings.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Floating Combo / Praise Banner */}
      {comboText && (
        <div className="hud-combo-banner">
          {comboText}
        </div>
      )}

      {/* Animated Status Message Banner */}
      {statusMessage && (
        <div className={`hud-toast-banner ${isFoulMessage ? 'foul' : ''}`}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}
