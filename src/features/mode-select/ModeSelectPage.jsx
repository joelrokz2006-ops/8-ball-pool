import React, { useState } from 'react';
import { ArrowLeft, Target, Bot, Users, Globe, Lock, Play, Trophy, Sparkles } from 'lucide-react';
import './ModeSelectPage.css';

export default function ModeSelectPage({ onBack, onStartMatch, onNavigateTournament, onNavigateTrickshots }) {
  const [aiDifficulty, setAiDifficulty] = useState('medium');

  return (
    <div className="mode-select-page">
      <header className="mode-select-header">
        <div className="mode-select-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Select Game Mode</h2>
        </div>
      </header>

      <div className="mode-cards-container">
        {/* 1. Billiards Cup Tournament */}
        <div className="mode-large-card" style={{ borderColor: 'var(--color-accent)' }}>
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box" style={{ background: 'rgba(217, 181, 109, 0.2)' }}>
                <Trophy size={28} />
              </div>
              <span className="mode-badge-pill available" style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
                Championship
              </span>
            </div>
            <h3 className="mode-card-heading">Billiards Cup</h3>
            <p className="mode-card-description">
              Enter an 8-player knockout bracket. Win Quarter, Semi, and Grand Finals to claim the 2,500 coin purse!
            </p>
          </div>

          <button
            className="mode-card-cta-btn"
            onClick={onNavigateTournament}
          >
            <Trophy size={18} fill="currentColor" />
            <span>ENTER CUP BRACKET</span>
          </button>
        </div>

        {/* 2. Trickshot Academy */}
        <div className="mode-large-card">
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box">
                <Sparkles size={28} />
              </div>
              <span className="mode-badge-pill available">Academy</span>
            </div>
            <h3 className="mode-card-heading">Trickshot Academy</h3>
            <p className="mode-card-description">
              6 Curated billiards puzzles: rail huggers, double bank shots, combo strikes, and obstacle needle gates.
            </p>
          </div>

          <button
            className="mode-card-cta-btn"
            onClick={onNavigateTrickshots}
          >
            <Sparkles size={18} />
            <span>OPEN ACADEMY</span>
          </button>
        </div>

        {/* 3. Play vs AI */}
        <div className="mode-large-card">
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box">
                <Bot size={28} />
              </div>
              <span className="mode-badge-pill available">Quick Play</span>
            </div>
            <h3 className="mode-card-heading">Play vs AI</h3>
            <p className="mode-card-description">
              Sharpen your tactical play against responsive computer opponents with authentic aim variance.
            </p>

            <div className="ai-difficulty-options">
              <button
                className={`diff-btn ${aiDifficulty === 'easy' ? 'selected' : ''}`}
                onClick={() => setAiDifficulty('easy')}
              >
                Amateur
              </button>
              <button
                className={`diff-btn ${aiDifficulty === 'medium' ? 'selected' : ''}`}
                onClick={() => setAiDifficulty('medium')}
              >
                Club Player
              </button>
              <button
                className={`diff-btn ${aiDifficulty === 'hard' ? 'selected' : ''}`}
                onClick={() => setAiDifficulty('hard')}
              >
                Master
              </button>
            </div>
          </div>

          <button
            className="mode-card-cta-btn"
            onClick={() => onStartMatch('ai', aiDifficulty)}
          >
            <Play size={18} fill="currentColor" />
            <span>PLAY MATCH</span>
          </button>
        </div>

        {/* 4. Solo Practice */}
        <div className="mode-large-card">
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box">
                <Target size={28} />
              </div>
              <span className="mode-badge-pill available">Free Play</span>
            </div>
            <h3 className="mode-card-heading">Solo Practice</h3>
            <p className="mode-card-description">
              No turn limits, no foul penalties. Freely shoot, test bank angles, study spin physics, and re-rack anytime.
            </p>
          </div>

          <button
            className="mode-card-cta-btn"
            onClick={() => onStartMatch('practice')}
          >
            <Play size={18} fill="currentColor" />
            <span>ENTER PRACTICE</span>
          </button>
        </div>

        {/* 5. Pass & Play 2 Player */}
        <div className="mode-large-card">
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box">
                <Users size={28} />
              </div>
              <span className="mode-badge-pill available">Local 2P</span>
            </div>
            <h3 className="mode-card-heading">Pass & Play 2P</h3>
            <p className="mode-card-description">
              Compete side-by-side with a friend on the same screen with automatic turn handoff and ball-in-hand rules.
            </p>
          </div>

          <button
            className="mode-card-cta-btn"
            onClick={() => onStartMatch('local2p')}
          >
            <Play size={18} fill="currentColor" />
            <span>START 2P GAME</span>
          </button>
        </div>

        {/* 6. Online Multiplayer (Honest Lock) */}
        <div className="mode-large-card locked">
          <div>
            <div className="mode-card-top">
              <div className="mode-card-icon-box">
                <Globe size={28} />
              </div>
              <span className="mode-badge-pill locked-badge">Phase 8 Roadmap</span>
            </div>
            <h3 className="mode-card-heading">Online Multiplayer</h3>
            <p className="mode-card-description">
              Server-authoritative Socket.IO matchmaking and private 1v1 lobbies are scheduled for Phase 8.
            </p>
          </div>

          <button className="mode-card-cta-btn disabled" disabled>
            <Lock size={16} />
            <span>COMING SOON</span>
          </button>
        </div>
      </div>
    </div>
  );
}
