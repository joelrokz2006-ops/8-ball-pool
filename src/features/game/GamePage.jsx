import React, { useEffect, useState } from 'react';
import PoolCanvas from './PoolCanvas.jsx';
import GameHUD from './GameHUD.jsx';
import AimControls from './AimControls.jsx';
import PauseMenu from './PauseMenu.jsx';
import ResultPanel from './ResultPanel.jsx';
import RulesGuideModal from '../rules-guide/RulesGuideModal.jsx';
import { gameStore } from '../../state/gameStore.js';
import './GamePage.css';

export default function GamePage({ onNavigate }) {
  const [gameState, setGameState] = useState(gameStore.getState());
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const unsub = gameStore.subscribe((state) => {
      setGameState({ ...state });
    });
    return unsub;
  }, []);

  // Keyboard shortcut listener for desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = gameStore.getState();
      const isAI = state.players[state.currentPlayerId]?.isAI;

      if (e.key === 'Escape') {
        if (state.phase === 'paused') {
          gameStore.resumeMatch();
        } else if (state.phase === 'aiming' || state.phase === 'moving') {
          gameStore.pauseMatch();
        }
        return;
      }

      if (state.phase !== 'aiming' || isAI) return;

      if (e.key === 'ArrowLeft') {
        gameStore.setAimAngle(state.shot.angle - (e.shiftKey ? 0.08 : 0.02));
      } else if (e.key === 'ArrowRight') {
        gameStore.setAimAngle(state.shot.angle + (e.shiftKey ? 0.08 : 0.02));
      } else if (e.key === 'ArrowUp') {
        gameStore.setShotPower(Math.min(1.0, state.shot.power + 0.05));
      } else if (e.key === 'ArrowDown') {
        gameStore.setShotPower(Math.max(0.05, state.shot.power - 0.05));
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        gameStore.executeShot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePause = () => {
    gameStore.pauseMatch();
  };

  const handleResume = () => {
    gameStore.resumeMatch();
  };

  const handleRestart = () => {
    gameStore.resetRack();
  };

  const handleExitToMenu = () => {
    onNavigate('home');
  };

  const handleRematch = () => {
    gameStore.startMatch(gameState.mode, gameState.difficulty);
  };

  const isCurrentPlayerAI = gameState.players[gameState.currentPlayerId]?.isAI;

  return (
    <div className="game-page-container">
      {/* 3D Pool Table Canvas */}
      <PoolCanvas />

      {/* Top HUD */}
      <GameHUD gameState={gameState} onPause={handlePause} />

      {/* Aim & Power Controls */}
      <AimControls
        shot={gameState.shot}
        phase={gameState.phase}
        isCurrentPlayerAI={isCurrentPlayerAI}
        cueChalked={gameState.cueChalked}
      />

      {/* Pause Menu Modal */}
      {gameState.phase === 'paused' && (
        <PauseMenu
          onResume={handleResume}
          onRestart={handleRestart}
          onExit={handleExitToMenu}
          onOpenRules={() => setShowRules(true)}
        />
      )}

      {/* Match Results Modal */}
      {gameState.phase === 'gameover' && (
        <ResultPanel
          gameState={gameState}
          onRematch={handleRematch}
          onHome={handleExitToMenu}
        />
      )}

      {/* Rules Guide Modal */}
      {showRules && <RulesGuideModal onClose={() => setShowRules(false)} />}
    </div>
  );
}
