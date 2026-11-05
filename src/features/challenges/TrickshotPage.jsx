import React from 'react';
import { ArrowLeft, Star, Coins, Play, Sparkles } from 'lucide-react';
import { TRICKSHOT_CHALLENGES } from '../../game/challenges/trickshotData.js';
import './TrickshotPage.css';

export default function TrickshotPage({ onBack, onStartTrickshot }) {
  return (
    <div className="trickshot-page-container">
      <header className="trickshot-header">
        <div className="shop-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Trickshot Academy</h2>
        </div>
      </header>

      <div className="trickshot-content">
        <div className="tournament-round-banner">
          <h2 className="tournament-round-title">Billiards Puzzle Challenges</h2>
          <p className="tournament-round-subtitle">
            Master rail cuts, bank combinations, and precision cue English to earn 3-star ratings!
          </p>
        </div>

        <div className="trickshot-grid">
          {TRICKSHOT_CHALLENGES.map((challenge) => (
            <div key={challenge.id} className="trickshot-card">
              <div>
                <div className="trickshot-card-header">
                  <span className={`trickshot-diff-badge ${challenge.difficulty}`}>
                    {challenge.difficulty}
                  </span>
                  <div className="trickshot-stars-row">
                    {[1, 2, 3].map((s) => (
                      <Star key={s} size={15} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <h3 className="trickshot-title">{challenge.title}</h3>
                <p className="trickshot-desc">{challenge.description}</p>
                <div className="trickshot-hint-box">
                  <strong>Coach Tip:</strong> {challenge.hint}
                </div>
              </div>

              <div className="trickshot-footer">
                <div className="trickshot-reward">
                  <Coins size={16} />
                  <span className="tabular-nums">+{challenge.coinReward} Coins</span>
                </div>

                <button
                  className="trickshot-start-btn"
                  onClick={() => onStartTrickshot(challenge)}
                >
                  <Play size={16} fill="currentColor" />
                  <span>START</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
