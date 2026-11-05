import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy, Play, Check, RotateCcw } from 'lucide-react';
import { tournamentStore } from '../../state/tournamentStore.js';
import './TournamentPage.css';

export default function TournamentPage({ onBack, onStartTournamentMatch }) {
  const [tournament, setTournament] = useState(tournamentStore.getState());

  useEffect(() => {
    return tournamentStore.subscribe((t) => setTournament({ ...t }));
  }, []);

  const handlePlayNextMatch = () => {
    const opp = tournamentStore.getCurrentOpponent();
    const diff = tournament.round === 'final' ? 'hard' : tournament.round === 'semi' ? 'medium' : 'easy';
    onStartTournamentMatch(opp, diff);
  };

  const handleReset = () => {
    tournamentStore.resetTournament();
  };

  const currentRoundName =
    tournament.round === 'quarter'
      ? 'Quarter-Finals'
      : tournament.round === 'semi'
      ? 'Semi-Finals'
      : tournament.round === 'final'
      ? 'Grand Championship Final'
      : 'Tournament Completed';

  const opponent = tournamentStore.getCurrentOpponent();

  return (
    <div className="tournament-page-container">
      <header className="tournament-header">
        <div className="shop-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Billiards Cup Championship</h2>
        </div>

        <div className="tournament-prize-chip">
          <Trophy size={18} />
          <span className="tabular-nums">Prize: {tournament.prizePool.toLocaleString()} Coins</span>
        </div>
      </header>

      <div className="tournament-content">
        <div className="tournament-round-banner">
          <h2 className="tournament-round-title">{currentRoundName}</h2>
          <p className="tournament-round-subtitle">
            {tournament.round === 'completed'
              ? 'Congratulations! You are the Billiards Cup Champion!'
              : `Win 3 consecutive knockout matches to claim the golden trophy!`}
          </p>
        </div>

        {/* 8-Player Tournament Bracket */}
        <div className="bracket-tree-container">
          {/* Quarter Finals */}
          <div className="bracket-column">
            <h4 style={{ color: 'var(--color-accent)', textAlign: 'center', fontSize: '0.85rem' }}>QUARTER-FINALS</h4>
            {tournament.matches.quarter.map((m) => {
              const isActive = tournament.round === 'quarter' && m.isPlayerMatch;
              return (
                <div key={m.id} className={`bracket-match-card ${isActive ? 'active-match' : ''}`}>
                  <div className={`bracket-player-row ${m.winner?.id === m.playerA?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerA?.avatar}</span>
                      <span className="bracket-player-name">{m.playerA?.name}</span>
                    </div>
                    {m.winner?.id === m.playerA?.id && <Check size={14} color="var(--color-success)" />}
                  </div>

                  <div className={`bracket-player-row ${m.winner?.id === m.playerB?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerB?.avatar}</span>
                      <span className="bracket-player-name">{m.playerB?.name}</span>
                    </div>
                    {m.winner?.id === m.playerB?.id && <Check size={14} color="var(--color-success)" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Semi Finals */}
          <div className="bracket-column">
            <h4 style={{ color: 'var(--color-accent)', textAlign: 'center', fontSize: '0.85rem' }}>SEMI-FINALS</h4>
            {tournament.matches.semi.map((m) => {
              const isActive = tournament.round === 'semi' && m.isPlayerMatch;
              return (
                <div key={m.id} className={`bracket-match-card ${isActive ? 'active-match' : ''}`}>
                  <div className={`bracket-player-row ${m.winner?.id === m.playerA?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerA?.avatar || '❓'}</span>
                      <span className="bracket-player-name">{m.playerA?.name || 'TBD'}</span>
                    </div>
                    {m.winner && m.winner?.id === m.playerA?.id && <Check size={14} color="var(--color-success)" />}
                  </div>

                  <div className={`bracket-player-row ${m.winner?.id === m.playerB?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerB?.avatar || '❓'}</span>
                      <span className="bracket-player-name">{m.playerB?.name || 'TBD'}</span>
                    </div>
                    {m.winner && m.winner?.id === m.playerB?.id && <Check size={14} color="var(--color-success)" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grand Final */}
          <div className="bracket-column">
            <h4 style={{ color: 'var(--color-accent)', textAlign: 'center', fontSize: '0.85rem' }}>CHAMPIONSHIP FINAL</h4>
            {tournament.matches.final.map((m) => {
              const isActive = tournament.round === 'final';
              return (
                <div key={m.id} className={`bracket-match-card ${isActive ? 'active-match' : ''}`}>
                  <div className={`bracket-player-row ${m.winner?.id === m.playerA?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerA?.avatar || '❓'}</span>
                      <span className="bracket-player-name">{m.playerA?.name || 'TBD'}</span>
                    </div>
                    {m.winner && m.winner?.id === m.playerA?.id && <Check size={14} color="var(--color-success)" />}
                  </div>

                  <div className={`bracket-player-row ${m.winner?.id === m.playerB?.id ? 'winner' : ''}`}>
                    <div className="bracket-player-info">
                      <span className="bracket-avatar">{m.playerB?.avatar || '❓'}</span>
                      <span className="bracket-player-name">{m.playerB?.name || 'TBD'}</span>
                    </div>
                    {m.winner && m.winner?.id === m.playerB?.id && <Check size={14} color="var(--color-success)" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button */}
        <div className="bracket-action-bar">
          {tournament.round !== 'completed' && opponent ? (
            <button className="tournament-play-btn" onClick={handlePlayNextMatch}>
              <Play size={22} fill="currentColor" />
              <span>PLAY MATCH VS {opponent.name.toUpperCase()}</span>
            </button>
          ) : (
            <button className="pause-btn-secondary" onClick={handleReset}>
              <RotateCcw size={18} />
              <span>Start New Tournament</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
