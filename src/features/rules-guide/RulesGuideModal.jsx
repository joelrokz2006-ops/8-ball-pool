import React from 'react';
import { BookOpen, X, CheckCircle2, AlertTriangle, Trophy } from 'lucide-react';
import './RulesGuideModal.css';

export default function RulesGuideModal({ onClose }) {
  return (
    <div className="rules-overlay" onClick={onClose}>
      <div className="rules-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rules-modal-header">
          <div className="rules-modal-title">
            <BookOpen size={22} color="var(--color-accent)" />
            <span>Official 8-Ball Rules Guide</span>
          </div>
          <button className="hud-icon-btn" onClick={onClose} aria-label="Close rules guide">
            <X size={20} />
          </button>
        </div>

        <div className="rules-content-scroll">
          <div className="rules-section">
            <div className="rules-section-title">
              <CheckCircle2 size={16} />
              1. The Object of the Game
            </div>
            <p>
              8-Ball is played with 1 Cue Ball and 15 Object Balls numbered 1 to 15:
            </p>
            <ul>
              <li><strong>Solids (1 to 7)</strong>: Pure solid colors.</li>
              <li><strong>Stripes (9 to 15)</strong>: White poles with colored center band.</li>
              <li><strong>8-Ball (Black)</strong>: Must be legally pocketed last to win!</li>
            </ul>
          </div>

          <div className="rules-section">
            <div className="rules-section-title">
              <CheckCircle2 size={16} />
              2. Open Table & Group Assignment
            </div>
            <p>
              At the start (including the break shot), the table is <strong>OPEN</strong>. Groups are not determined by the break, even if balls are pocketed.
            </p>
            <p style={{ marginTop: 6 }}>
              The first player to legally pocket an object ball after the break establishes their group (Solids or Stripes). The other player gets the remaining group.
            </p>
          </div>

          <div className="rules-section">
            <div className="rules-section-title">
              <CheckCircle2 size={16} />
              3. Legal Shots & Cushion Requirement
            </div>
            <p>
              On every shot, the cue ball must first strike a ball of the player's assigned group. If all group balls are pocketed, the player must strike the 8-ball first.
            </p>
            <p style={{ marginTop: 6 }}>
              Additionally, <strong>after ball contact</strong>, at least one ball (the cue ball or any object ball) must be pocketed OR contact a cushion rail.
            </p>
          </div>

          <div className="rules-section">
            <div className="rules-section-title">
              <AlertTriangle size={16} color="var(--color-danger)" />
              4. Fouls & Ball-in-Hand
            </div>
            <p>
              When a foul occurs, the incoming player receives <strong>Ball-in-Hand</strong>, allowing them to place the cue ball anywhere on the entire table surface:
            </p>
            <ul>
              <li><strong>Scratch</strong>: Cue ball pocketed.</li>
              <li><strong>No Hit</strong>: Cue ball fails to touch any object ball.</li>
              <li><strong>Wrong First Ball</strong>: Cue ball strikes opponent's ball or 8-ball before own group ball.</li>
              <li><strong>No Cushion</strong>: No ball was pocketed and no ball reached a cushion after contact.</li>
            </ul>
          </div>

          <div className="rules-section">
            <div className="rules-section-title">
              <Trophy size={16} />
              5. Winning vs. Losing on the 8-Ball
            </div>
            <p>
              <strong>To Win:</strong> A player must clear all balls in their group, then legally pocket the 8-Ball without scratching.
            </p>
            <p style={{ marginTop: 6, color: 'var(--color-danger)' }}>
              <strong>Instant Loss occurs if:</strong>
            </p>
            <ul style={{ color: 'var(--color-danger)' }}>
              <li>The 8-Ball is pocketed prematurely (before clearing your group).</li>
              <li>The cue ball scratches on the same shot the 8-Ball is pocketed.</li>
              <li>The 8-Ball is pocketed on an illegal shot.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
