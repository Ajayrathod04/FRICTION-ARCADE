import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { formatSeconds } from '../../lib/storage';
import type { GameResults } from '../../lib/storage';
import { DESIGN_RULES } from '../../data/missionData';
import { SoundEffects } from '../../lib/audio';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: GameResults | null;
  onPlayAgain: () => void;
  onOpenDesignLab: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  results,
  onPlayAgain,
  onOpenDesignLab,
}) => {
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      SoundEffects.playRepairSuccess();
    }
  }, [isOpen]);

  if (!results) return null;

  const handleCopyChecklist = () => {
    const checklistText = `FRICTION ARCADE — 8 INTERFACE DESIGN FIXES
Recorded Journey: Mumbai to Pune
- Before: ${formatSeconds(results.beforeTimeSec)} (${results.beforeErrors} errors)
- After: ${formatSeconds(results.afterTimeSec)} (${results.afterErrors} errors)

8 Core Principles Learned:
1. Persistent Labels: Never rely solely on vanishing placeholders.
2. 4.5:1 Contrast: Meet WCAG AA contrast standards for readability.
3. Multimodal Errors: Combine icons, borders, and clear explanatory text.
4. Large Targets: Maintain minimum 44px-48px touch targets.
5. Visible Focus: High-contrast focus indicators for keyboard navigation.
6. Helpful Guidance: State the exact format and how to fix errors.
7. Predictable Hierarchy: One distinct, high-contrast primary CTA.
8. Plain Language: Clear travel terminology without cognitive fatigue.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(checklistText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MISSION 01: RESULTS & CASE REPORT"
      badge="QUEST COMPLETE!"
      maxWidth="760px"
    >
      <div className="results-modal-content">
        {/* Japanese Arcade Style Quest Complete Fanfare Banner */}
        <div className="quest-complete-banner" style={{ background: 'linear-gradient(135deg, #ffd23f, #ff8a1f)', border: '3px solid #17131f', borderRadius: '12px', padding: '16px 20px', textAlign: 'center', boxShadow: '0 6px 0 #17131f', marginBottom: '18px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#17131f', color: '#ffd23f', padding: '4px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
            ★ QUEST CLEAR · クエストクリア ★
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, margin: '8px 0 4px', color: '#17131f', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>
            QUEST COMPLETE!
          </h2>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#2c1e40' }}>
            The Deccan Express has successfully departed with all passengers aboard!
          </p>

          {/* Cheering Passenger Cast Lineup */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
            {[
              { name: 'Explorer', role: 'You (Traveler)', color: '#ff8a1f', emoji: '🎒' },
              { name: 'Arjun', role: 'Commuter', color: '#3b6e47', emoji: '🧑‍💻' },
              { name: 'Meera', role: 'Passenger', color: '#d946ef', emoji: '👩‍💼' },
              { name: 'Kabir', role: 'Visitor', color: '#0ea5e9', emoji: '🙋‍♂️' },
              { name: 'Rajiv', role: 'Conductor', color: '#1e3a8a', emoji: '👮‍♂️' },
            ].map((char) => (
              <div key={char.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff6e5', border: '2px solid #17131f', borderRadius: '8px', padding: '6px 10px', boxShadow: '0 3px 0 #17131f', minWidth: '76px' }}>
                <span style={{ fontSize: '22px' }}>{char.emoji}</span>
                <strong style={{ fontSize: '12px', color: '#17131f', marginTop: '2px' }}>{char.name}</strong>
                <span style={{ fontSize: '10px', color: '#6b7280' }}>{char.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Header Celebration */}
        <div className="results-header-banner">
          <Badge variant="sticker" color="#059669" rotate={-1}>
            🏆 YOU SPOTTED THE FRICTION & FIXED THE FLOW
          </Badge>
          <h3 className="results-title">Your Actual Recorded Performance</h3>
        </div>

        {/* Side-by-Side Comparison of ACTUAL Recorded Values */}
        <div className="telemetry-comparison-grid">
          {/* Before */}
          <div className="telemetry-card telemetry-card--before">
            <div className="telemetry-card__tag">BEFORE · FLAWED FLOW</div>
            <div className="telemetry-card__stat">
              <span className="stat-num">{formatSeconds(results.beforeTimeSec)}</span>
              <span className="stat-unit">elapsed time</span>
            </div>
            <div className="telemetry-card__sub">
              <span className="telemetry-pill telemetry-pill--error">
                ⚠ {results.beforeErrors} friction errors
              </span>
            </div>
            <p className="telemetry-card__notes">
              Vanishing placeholders, cryptic error alert, ambiguous action buttons.
            </p>
          </div>

          <div className="telemetry-arrow" aria-hidden="true">
            <Icons.ArrowRight size={32} color="#FF3D8B" />
          </div>

          {/* After */}
          <div className="telemetry-card telemetry-card--after">
            <div className="telemetry-card__tag">AFTER · FIXED FLOW</div>
            <div className="telemetry-card__stat">
              <span className="stat-num">{formatSeconds(results.afterTimeSec)}</span>
              <span className="stat-unit">elapsed time</span>
            </div>
            <div className="telemetry-card__sub">
              <span className="telemetry-pill telemetry-pill--success">
                ✓ {results.afterErrors} errors
              </span>
            </div>
            <p className="telemetry-card__notes">
              Persistent labels, inline validation, high-contrast focus rings, clear primary CTA.
            </p>
          </div>
        </div>

        {/* Honest Disclaimer */}
        <div className="honest-disclaimer-box">
          <Icons.Alert size={18} color="#FF8A1F" />
          <p>
            <strong>Evidence Disclaimer:</strong> Second-attempt familiarity naturally improves speed and lowers errors. These personal metrics showcase your hands-on journey, not universal scientific proof of identical gains for all individuals.
          </p>
        </div>

        {/* Badges Collected */}
        <div className="results-badges-section">
          <h4 className="results-subheading">Badges Unlocked</h4>
          <div className="badges-row">
            <Badge variant="sticker" color="#FFD23F" rotate={-2}>
              🔍 Context Finder
            </Badge>
            <Badge variant="sticker" color="#FF3B30" rotate={1}>
              ⚡ Error Hunter
            </Badge>
            <Badge variant="sticker" color="#8DDCFF" rotate={-1}>
              🛠 Flow Fixer
            </Badge>
          </div>
        </div>

        {/* 8 Rules Recap */}
        <div className="results-rules-summary">
          <div className="results-rules-header">
            <h4 className="results-subheading">8 Practical Design Fixes to Keep</h4>
            <button
              type="button"
              className="btn-copy-checklist"
              onClick={handleCopyChecklist}
            >
              <Icons.Copy size={16} />
              {copied ? 'Copied to Clipboard!' : 'Copy Design Checklist'}
            </button>
          </div>
          <div className="mini-rules-grid">
            {DESIGN_RULES.map((rule) => (
              <div key={rule.id} className="mini-rule-card">
                <span className="mini-rule-num">{rule.id}</span>
                <div className="mini-rule-body">
                  <span className="mini-rule-title">{rule.title}</span>
                  <span className="mini-rule-desc">{rule.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions-row">
          <Button variant="secondary" size="md" onClick={onPlayAgain}>
            <Icons.Refresh size={18} /> Play Mission Again
          </Button>
          <Button variant="primary" size="md" onClick={onOpenDesignLab}>
            Explore the Interactive Design Lab →
          </Button>
        </div>
      </div>
    </Modal>
  );
};
