import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit2, Check, Trophy, Zap, Target, ShieldCheck, Flame, Coins } from 'lucide-react';
import { playerStore, ACHIEVEMENTS } from '../../state/playerStore.js';
import './ProfilePage.css';

const AVATARS = ['🎱', '👑', '🎩', '🦅', '🦁', '⚡', '🎯', '🔥'];

export default function ProfilePage({ onBack }) {
  const [playerData, setPlayerData] = useState(playerStore.getState());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerData.name);

  useEffect(() => {
    return playerStore.subscribe((data) => {
      setPlayerData({ ...data });
      setNameInput(data.name);
    });
  }, []);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      playerStore.updateProfile(nameInput.trim(), playerData.avatar);
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (av) => {
    playerStore.updateProfile(playerData.name, av);
  };

  const stats = playerData.stats || {};
  const winRate =
    stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;

  // Next level XP threshold
  const nextLevelXP = Math.pow(playerData.level, 2) * 100;
  const currentLevelBaseXP = Math.pow(playerData.level - 1, 2) * 100;
  const xpInCurrentLevel = Math.max(0, playerData.xp - currentLevelBaseXP);
  const xpNeededForNext = Math.max(1, nextLevelXP - currentLevelBaseXP);
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'Trophy': return <Trophy size={20} />;
      case 'Zap': return <Zap size={20} />;
      case 'Target': return <Target size={20} />;
      case 'ShieldCheck': return <ShieldCheck size={20} />;
      case 'Flame': return <Flame size={20} />;
      default: return <Trophy size={20} />;
    }
  };

  return (
    <div className="profile-page-container">
      <header className="profile-header">
        <div className="shop-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Player Career & Stats</h2>
        </div>

        <div className="home-coins-badge">
          <Coins size={16} />
          <span className="tabular-nums">{playerData.coins.toLocaleString()} Coins</span>
        </div>
      </header>

      <div className="profile-content">
        {/* User Identity Card */}
        <div className="profile-card">
          <div className="profile-avatar-large">{playerData.avatar}</div>

          <div className="profile-identity-info">
            <div className="profile-name-row">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    className="profile-name-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={18}
                    autoFocus
                  />
                  <button className="hud-icon-btn" onClick={handleSaveName} style={{ width: 32, height: 32 }}>
                    <Check size={16} />
                  </button>
                </>
              ) : (
                <>
                  <h3 className="profile-display-name">{playerData.name}</h3>
                  <button
                    className="hud-icon-btn"
                    onClick={() => setIsEditingName(true)}
                    style={{ width: 30, height: 30 }}
                    title="Edit player name"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
              <span className="profile-level-badge">Level {playerData.level}</span>
            </div>

            {/* Choose avatar */}
            <div className="avatar-selection-grid">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  className={`avatar-option-btn ${playerData.avatar === av ? 'selected' : ''}`}
                  onClick={() => handleSelectAvatar(av)}
                >
                  {av}
                </button>
              ))}
            </div>

            {/* XP progress */}
            <div className="profile-xp-bar-container">
              <div className="profile-xp-track">
                <div className="profile-xp-fill" style={{ width: `${xpProgressPercent}%` }} />
              </div>
              <span className="profile-xp-label tabular-nums">
                {playerData.xp} XP total • {xpNeededForNext - xpInCurrentLevel} XP to Level {playerData.level + 1}
              </span>
            </div>
          </div>
        </div>

        {/* Career Statistics */}
        <div className="profile-stats-grid">
          <div className="profile-stat-box">
            <span className="profile-stat-title">Matches Played</span>
            <span className="profile-stat-value tabular-nums">{stats.matchesPlayed}</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-title">Victories</span>
            <span className="profile-stat-value tabular-nums">{stats.matchesWon}</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-title">Win Rate</span>
            <span className="profile-stat-value tabular-nums">{winRate}%</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-title">Best Win Streak</span>
            <span className="profile-stat-value tabular-nums">{stats.bestStreak}</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-title">Balls Pocketed</span>
            <span className="profile-stat-value tabular-nums">{stats.ballsPocketed}</span>
          </div>
          <div className="profile-stat-box">
            <span className="profile-stat-title">Fouls</span>
            <span className="profile-stat-value tabular-nums">{stats.foulsCommitted}</span>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="achievements-section">
          <h3 className="achievements-heading">
            <Trophy size={20} color="var(--color-accent)" />
            <span>Career Achievements</span>
          </h3>

          <div className="achievements-list">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = playerData.unlockedAchievements.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`achievement-tile ${isUnlocked ? 'unlocked' : ''}`}
                >
                  <div className="achievement-left">
                    <div className="achievement-icon-circle">
                      {getAchievementIcon(ach.icon)}
                    </div>
                    <div className="achievement-info">
                      <span className="achievement-title">{ach.title}</span>
                      <span className="achievement-desc">{ach.desc}</span>
                    </div>
                  </div>

                  <div className="achievement-reward">
                    {isUnlocked ? (
                      <span style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Check size={16} /> Completed
                      </span>
                    ) : (
                      <>
                        <Coins size={16} />
                        <span className="tabular-nums">+{ach.reward}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
