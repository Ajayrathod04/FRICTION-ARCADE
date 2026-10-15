import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { formatSeconds } from '../../lib/storage';
import type { GameResults } from '../../lib/storage';
import { DESIGN_RULES } from '../../data/missionData';

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
      badge="MISSION COMPLETE"
      maxWidth="720px"
    >
      <div className="results-modal-content">
        {/* Header Celebration */}
        <div className="results-header-banner">
          <Badge variant="sticker" color="#FFD23F" rotate={-1}>
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
