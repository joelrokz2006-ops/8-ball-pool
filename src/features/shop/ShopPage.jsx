import React, { useEffect, useState } from 'react';
import { ArrowLeft, Coins, Check, Lock, Sparkles } from 'lucide-react';
import { playerStore, CUES_CATALOG, FELT_CATALOG } from '../../state/playerStore.js';
import { audioManager } from '../../game/audio/audioManager.js';
import './ShopPage.css';

export default function ShopPage({ onBack }) {
  const [playerData, setPlayerData] = useState(playerStore.getState());
  const [activeTab, setActiveTab] = useState('cues'); // 'cues' or 'felts'

  useEffect(() => {
    return playerStore.subscribe((data) => setPlayerData({ ...data }));
  }, []);

  const handleBuyCue = (cue) => {
    if (playerData.coins >= cue.price) {
      const ok = playerStore.buyCue(cue.id);
      if (ok) {
        audioManager.playPurchase();
      }
    } else {
      audioManager.playFoul();
    }
  };

  const handleEquipCue = (cueId) => {
    playerStore.equipCue(cueId);
    audioManager.playClick();
  };

  const handleBuyFelt = (felt) => {
    if (playerData.coins >= felt.price) {
      const ok = playerStore.buyFelt(felt.id);
      if (ok) {
        audioManager.playPurchase();
      }
    } else {
      audioManager.playFoul();
    }
  };

  const handleEquipFelt = (feltId) => {
    playerStore.equipFelt(feltId);
    audioManager.playClick();
  };

  return (
    <div className="shop-page-container">
      <header className="shop-header">
        <div className="shop-title-group">
          <button className="mode-back-btn" onClick={onBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <h2 className="mode-select-page-title">Pro Shop & Equipment</h2>
        </div>

        <div className="home-coins-badge">
          <Coins size={16} />
          <span className="tabular-nums">{playerData.coins.toLocaleString()} Coins</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="shop-tabs">
        <button
          className={`shop-tab-btn ${activeTab === 'cues' ? 'active' : ''}`}
          onClick={() => setActiveTab('cues')}
        >
          Cue Sticks
        </button>
        <button
          className={`shop-tab-btn ${activeTab === 'felts' ? 'active' : ''}`}
          onClick={() => setActiveTab('felts')}
        >
          Table Felt Colors
        </button>
      </div>

      {/* Catalog Grid */}
      <div className="shop-items-grid">
        {activeTab === 'cues' &&
          CUES_CATALOG.map((cue) => {
            const isOwned = playerData.ownedCueIds.includes(cue.id);
            const isEquipped = playerData.equippedCueId === cue.id;
            const canAfford = playerData.coins >= cue.price;

            return (
              <div
                key={cue.id}
                className={`shop-item-card ${isEquipped ? 'equipped' : ''}`}
              >
                <div>
                  <div className="shop-preview-box">
                    <div
                      className="shop-cue-preview-bar"
                      style={{
                        background: `linear-gradient(90deg, ${cue.colors[0]} 0%, ${cue.colors[1]} 70%, ${cue.colors[2] || '#d9b56d'} 100%)`
                      }}
                    />
                  </div>

                  <h3 className="shop-item-title">{cue.name}</h3>
                  <p className="shop-item-desc">{cue.description}</p>

                  <div className="shop-item-stats">
                    <div className="stat-row">
                      <span>Power Bonus</span>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${(cue.powerBonus - 1) * 300 + 40}%` }}
                        />
                      </div>
                    </div>
                    <div className="stat-row">
                      <span>Aim Guide</span>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${(cue.aimBonus - 1) * 300 + 40}%` }}
                        />
                      </div>
                    </div>
                    <div className="stat-row">
                      <span>Spin English</span>
                      <div className="stat-bar-bg">
                        <div
                          className="stat-bar-fill"
                          style={{ width: `${(cue.spinBonus - 1) * 300 + 40}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  {isEquipped ? (
                    <button className="shop-action-btn equipped-btn" disabled>
                      <Check size={18} />
                      <span>EQUIPPED</span>
                    </button>
                  ) : isOwned ? (
                    <button
                      className="shop-action-btn equip-btn"
                      onClick={() => handleEquipCue(cue.id)}
                    >
                      <span>EQUIP CUE</span>
                    </button>
                  ) : (
                    <button
                      className="shop-action-btn buy-btn"
                      onClick={() => handleBuyCue(cue)}
                      disabled={!canAfford}
                      style={{ opacity: canAfford ? 1 : 0.6 }}
                    >
                      <Coins size={16} />
                      <span className="tabular-nums">
                        {cue.price === 0 ? 'FREE' : `${cue.price.toLocaleString()} Coins`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

        {activeTab === 'felts' &&
          FELT_CATALOG.map((felt) => {
            const isOwned = playerData.ownedFeltIds.includes(felt.id);
            const isEquipped = playerData.equippedFeltId === felt.id;
            const canAfford = playerData.coins >= felt.price;

            return (
              <div
                key={felt.id}
                className={`shop-item-card ${isEquipped ? 'equipped' : ''}`}
              >
                <div>
                  <div className="shop-preview-box">
                    <div
                      className="shop-felt-preview-swatch"
                      style={{ backgroundColor: felt.color }}
                    />
                  </div>

                  <h3 className="shop-item-title">{felt.name}</h3>
                  <p className="shop-item-desc">{felt.description}</p>
                </div>

                <div>
                  {isEquipped ? (
                    <button className="shop-action-btn equipped-btn" disabled>
                      <Check size={18} />
                      <span>EQUIPPED</span>
                    </button>
                  ) : isOwned ? (
                    <button
                      className="shop-action-btn equip-btn"
                      onClick={() => handleEquipFelt(felt.id)}
                    >
                      <span>EQUIP FELT</span>
                    </button>
                  ) : (
                    <button
                      className="shop-action-btn buy-btn"
                      onClick={() => handleBuyFelt(felt)}
                      disabled={!canAfford}
                      style={{ opacity: canAfford ? 1 : 0.6 }}
                    >
                      <Coins size={16} />
                      <span className="tabular-nums">
                        {felt.price === 0 ? 'FREE' : `${felt.price.toLocaleString()} Coins`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
