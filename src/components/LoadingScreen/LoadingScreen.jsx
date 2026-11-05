import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

export default function LoadingScreen({ onLoaded }) {
  const [progress, setProgress] = useState(15);
  const [status, setStatus] = useState('Initializing physics simulation...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setStatus('Generating high-res phenolic ball textures...');
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(75);
      setStatus('Tuning cushion rebound coefficients...');
    }, 600);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatus('Welcome to the Billiards Club!');
    }, 900);

    const t4 = setTimeout(() => {
      if (onLoaded) onLoaded();
    }, 1150);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onLoaded]);

  return (
    <div className="loading-screen-container">
      <div className="loading-logo-box">
        <div className="loading-ball-icon">
          <div className="loading-ball-center">8</div>
        </div>
        <h1 className="loading-brand-title">Billiards Club</h1>
        <p className="loading-brand-tagline">Premium 8-Ball Pool</p>
      </div>

      <div className="loading-progress-container">
        <div className="loading-progress-bar-bg">
          <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="loading-status-text">{status}</span>
      </div>
    </div>
  );
}
