import React, { useState, useEffect } from 'react';
import LoadingScreen from '../components/LoadingScreen/LoadingScreen.jsx';
import HomePage from '../features/home/HomePage.jsx';
import ModeSelectPage from '../features/mode-select/ModeSelectPage.jsx';
import TournamentPage from '../features/tournament/TournamentPage.jsx';
import TrickshotPage from '../features/challenges/TrickshotPage.jsx';
import GamePage from '../features/game/GamePage.jsx';
import ShopPage from '../features/shop/ShopPage.jsx';
import ProfilePage from '../features/profile/ProfilePage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import { gameStore } from '../state/gameStore.js';
import { audioManager } from '../game/audio/audioManager.js';
import '../styles/global.css';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('loading');

  useEffect(() => {
    const handleFirstInteraction = () => {
      audioManager.init();
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('pointerdown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('pointerdown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const handleStartMode = (mode, difficulty = 'medium', customData = null) => {
    gameStore.startMatch(mode, difficulty, customData);
    setCurrentScreen('game');
  };

  const handleStartTournamentMatch = (opponent, difficulty) => {
    gameStore.startMatch('tournament', difficulty, opponent);
    setCurrentScreen('game');
  };

  const handleStartTrickshot = (challenge) => {
    gameStore.startMatch('challenge', 'medium', challenge);
    setCurrentScreen('game');
  };

  return (
    <div className="app-container">
      {currentScreen === 'loading' && (
        <LoadingScreen onLoaded={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'home' && (
        <HomePage
          onNavigate={(screen) => setCurrentScreen(screen)}
          onStartMode={handleStartMode}
        />
      )}

      {currentScreen === 'mode-select' && (
        <ModeSelectPage
          onBack={() => setCurrentScreen('home')}
          onStartMatch={handleStartMode}
          onNavigateTournament={() => setCurrentScreen('tournament')}
          onNavigateTrickshots={() => setCurrentScreen('trickshots')}
        />
      )}

      {currentScreen === 'tournament' && (
        <TournamentPage
          onBack={() => setCurrentScreen('home')}
          onStartTournamentMatch={handleStartTournamentMatch}
        />
      )}

      {currentScreen === 'trickshots' && (
        <TrickshotPage
          onBack={() => setCurrentScreen('home')}
          onStartTrickshot={handleStartTrickshot}
        />
      )}

      {currentScreen === 'game' && (
        <GamePage onNavigate={(screen) => setCurrentScreen(screen)} />
      )}

      {currentScreen === 'shop' && (
        <ShopPage onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'profile' && (
        <ProfilePage onBack={() => setCurrentScreen('home')} />
      )}

      {currentScreen === 'settings' && (
        <SettingsPage onBack={() => setCurrentScreen('home')} />
      )}
    </div>
  );
}
