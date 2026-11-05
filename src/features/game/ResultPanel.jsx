import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Home, Coins, Zap } from 'lucide-react';
import './ResultPanel.css';

export default function ResultPanel({ gameState, onRematch, onHome }) {
  const { winnerId, statusMessage, matchStats, players } = gameState;
  const isP1Win = winnerId === 'player1';

  // Fire celebration confetti if Player 1 wins
  useEffect(() => {
    if (isP1Win) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d9b56d', '#70d6a1', '#ffffff']
        });
      } catch (err) {
        // Fallback gracefully
      }
    }
  }, [isP1Win]);

  const winnerName = players[winnerId]?.name || 'Player 1';
  const formatTime = (secs = 0) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const earnedCoins = isP1Win ? 100 : 25;
  const earnedXP = isP1Win ? 150 : 40;

  return (
    <div className="result-overlay">
      <div className={`result-card ${isP1Win ? 'win' : 'loss'}`}>
        <div className={`result-badge-icon ${isP1Win ? 'win' : 'loss'}`}>
          {isP1Win ? <Trophy size={40} /> : <Frown size={40} />}
        </div>

        <h2 className={`result-title ${isP1Win ? 'win' : 'loss'}`}>
          {isP1Win ? 'VICTORY!' : 'DEFEAT'}
        </h2>

        <p className="result-subtitle">
          {statusMessage || (isP1Win ? `${winnerName} won the match!` : 'Better luck next rack!')}
        </p>

        {/* Match Statistics */}
        <div className="result-stats-grid">
          <div className="result-stat-tile">
            <span className="result-stat-label">Match Time</span>
            <span className="result-stat-val tabular-nums">{formatTime(matchStats.durationSeconds)}</span>
          </div>

          <div className="result-stat-tile">
            <span className="result-stat-label">Shots Taken</span>
            <span className="result-stat-val tabular-nums">{matchStats.shotsTaken}</span>
          </div>

          <div className="result-stat-tile">
            <span className="result-stat-label">Balls Pocketed</span>
            <span className="result-stat-val tabular-nums">{matchStats.ballsPocketed}</span>
          </div>

          <div className="result-stat-tile">
            <span className="result-stat-label">Fouls</span>
            <span className="result-stat-val tabular-nums">{matchStats.fouls}</span>
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="result-rewards-strip">
          <div className="reward-item reward-coins">
            <Coins size={18} />
            <span className="tabular-nums">+{earnedCoins} Coins</span>
          </div>
          <div className="reward-item reward-xp">
            <Zap size={18} />
            <span className="tabular-nums">+{earnedXP} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <button className="pause-btn-primary" onClick={onRematch}>
            <RotateCcw size={18} />
            <span>Rematch</span>
          </button>
          <button className="pause-btn-secondary" onClick={onHome}>
            <Home size={18} />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
