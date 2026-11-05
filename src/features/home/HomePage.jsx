import React, { useEffect, useState } from 'react';
import { Play, ShoppingBag, User, Settings, BookOpen, Target, Bot, Users, Coins, Trophy, Sparkles } from 'lucide-react';
import { playerStore } from '../../state/playerStore.js';
import RulesGuideModal from '../rules-guide/RulesGuideModal.jsx';
import './HomePage.css';

export default function HomePage({ onNavigate, onStartMode }) {
  const [playerData, setPlayerData] = useState(playerStore.getState());
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    return playerStore.subscribe((data) => setPlayerData({ ...data }));
  }, []);

  return (
    <div className="home-page-container">
      {/* Top Header */}
      <header className="home-top-header">
        <div className="home-brand-logo">
          <div className="home-mini-ball">
            <div className="home-mini-ball-inner">8</div>
          </div>
          <span className="home-brand-title">Billiards Club</span>
        </div>

        <div className="home-header-right">
          {/* Player Profile Chip */}
          <div className="home-player-chip" onClick={() => onNavigate('profile')}>
            <div className="home-player-avatar-circle">{playerData.avatar}</div>
            <div className="home-player-meta">
              <span className="home-player-name">{playerData.name}</span>
              <span className="home-player-level">Level {playerData.level}</span>
            </div>
          </div>

          {/* Virtual Coins Badge */}
          <div className="home-coins-badge" onClick={() => onNavigate('shop')}>
            <Coins size={16} />
            <span className="tabular-nums">{playerData.coins.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Hero Center Section */}
      <main className="home-hero-scroll">
        <div className="home-hero-title-box">
          <div className="home-hero-tag">Championship Billiards V2</div>
          <h1 className="home-hero-heading">Master the Table</h1>
          <p className="home-hero-desc">
            Experience authentic cue chalking, bank-shot reflections, dynamic particle bursts, and 8-player tournament cups.
          </p>
        </div>

        {/* Big Primary Play Button */}
        <button className="home-big-play-btn" onClick={() => onNavigate('mode-select')}>
          <Play size={24} fill="currentColor" />
          <span>START MATCH</span>
        </button>

        {/* Quick Mode Cards */}
        <div className="home-modes-grid">
          {/* Billiards Cup Tournament */}
          <div className="home-mode-card" onClick={() => onNavigate('tournament')} style={{ borderColor: 'var(--color-accent)' }}>
            <div className="home-mode-icon-circle" style={{ background: 'rgba(217, 181, 109, 0.2)' }}>
              <Trophy size={24} />
            </div>
            <h3 className="home-mode-title" style={{ color: 'var(--color-accent)' }}>Billiards Cup</h3>
            <p className="home-mode-desc">
              Compete in an 8-player single elimination championship bracket for the grand trophy & 2,500 coins!
            </p>
          </div>

          {/* Trickshot Academy */}
          <div className="home-mode-card" onClick={() => onNavigate('trickshots')}>
            <div className="home-mode-icon-circle">
              <Sparkles size={24} />
            </div>
            <h3 className="home-mode-title">Trickshot Academy</h3>
            <p className="home-mode-desc">
              Solve 6 curated billiards puzzle setups including rail huggers, double banks, and obstacle corridors.
            </p>
          </div>

          {/* vs AI */}
          <div className="home-mode-card" onClick={() => onStartMode('ai', 'medium')}>
            <div className="home-mode-icon-circle">
              <Bot size={24} />
            </div>
            <h3 className="home-mode-title">Play vs AI</h3>
            <p className="home-mode-desc">
              Test your skills against computer opponents with authentic aim variance across 3 tiers.
            </p>
          </div>

          {/* Solo Practice */}
          <div className="home-mode-card" onClick={() => onStartMode('practice')}>
            <div className="home-mode-icon-circle">
              <Target size={24} />
            </div>
            <h3 className="home-mode-title">Solo Practice</h3>
            <p className="home-mode-desc">
              Free play on an open table. Test bank angles, cue spin english, and ball trajectory physics.
            </p>
          </div>

          {/* Local 2 Player */}
          <div className="home-mode-card" onClick={() => onStartMode('local2p')}>
            <div className="home-mode-icon-circle">
              <Users size={24} />
            </div>
            <h3 className="home-mode-title">Pass & Play 2P</h3>
            <p className="home-mode-desc">
              Two players alternate turns on the same device with standard official WPA rules.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="home-bottom-nav">
        <button className="home-nav-item active" onClick={() => onNavigate('home')}>
          <Play size={20} />
          <span>Play</span>
        </button>
        <button className="home-nav-item" onClick={() => onNavigate('tournament')}>
          <Trophy size={20} />
          <span>Cup</span>
        </button>
        <button className="home-nav-item" onClick={() => onNavigate('shop')}>
          <ShoppingBag size={20} />
          <span>Shop</span>
        </button>
        <button className="home-nav-item" onClick={() => onNavigate('profile')}>
          <User size={20} />
          <span>Profile</span>
        </button>
        <button className="home-nav-item" onClick={() => onNavigate('settings')}>
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="home-nav-item" onClick={() => setShowRules(true)}>
          <BookOpen size={20} />
          <span>Rules</span>
        </button>
      </nav>

      {showRules && <RulesGuideModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
