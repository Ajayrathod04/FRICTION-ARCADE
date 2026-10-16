import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/ui/Icons';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { STATION_ECHOES, CLUES } from '../../../data/missionData';
import type { FrictionEchoData } from '../../../data/missionData';
import { SoundEffects } from '../../../lib/audio';
import { announce } from '../../../lib/a11y';

interface FrictionVisionOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
  cluesFound: string[];
  repairsComplete: boolean;
  onCollectClue: (hotspotId: string) => void;
  onStartBookingChallenge: () => void;
}

export const FrictionVisionOverlay: React.FC<FrictionVisionOverlayProps> = ({
  isOpen,
  onClose,
  activeHotspot,
  cluesFound,
  repairsComplete,
  onCollectClue,
  onStartBookingChallenge,
}) => {
  if (!isOpen) return null;

  // Default to first undiscovered checkpoint if none directly nearby
  const targetHotspot: 'kiosk' | 'board' | 'desk' =
    activeHotspot ||
    (!cluesFound.includes('kiosk') ? 'kiosk' : !cluesFound.includes('board') ? 'board' : 'desk');

  const echo: FrictionEchoData = STATION_ECHOES[targetHotspot];
  const clue = CLUES[targetHotspot];
  const isAlreadyFound = cluesFound.includes(targetHotspot);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(isAlreadyFound);
  const [isCorrect, setIsCorrect] = useState<boolean>(isAlreadyFound);
  const [feedback, setFeedback] = useState<string | null>(
    isAlreadyFound ? echo.options.find((o) => o.isCorrect)?.explanation || null : null
  );
  const [replayMode, setReplayMode] = useState<'before' | 'after'>('before');

  useEffect(() => {
    if (isAlreadyFound) {
      setHasSubmitted(true);
      setIsCorrect(true);
      const c = echo.options.find((o) => o.isCorrect);
      setFeedback(c?.explanation || null);
    } else {
      setSelectedOptionId(null);
      setHasSubmitted(false);
      setIsCorrect(false);
      setFeedback(null);
    }
  }, [targetHotspot, isAlreadyFound, echo.options]);

  const handleSubmitDiagnosis = () => {
    if (!selectedOptionId) return;
    const opt = echo.options.find((o) => o.id === selectedOptionId);
    if (!opt) return;

    setHasSubmitted(true);
    if (opt.isCorrect) {
      setIsCorrect(true);
      setFeedback(opt.explanation);
      SoundEffects.playCollect();
      announce(`Friction Vision: Diagnosis verified! Evidence collected for ${echo.passengerName}.`);
      onCollectClue(targetHotspot);
    } else {
      setIsCorrect(false);
      setFeedback(opt.explanation);
      SoundEffects.playBlip();
      announce(`Friction Vision: Diagnosis incomplete. ${opt.explanation}.`);
    }
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setIsCorrect(false);
    setFeedback(null);
  };

  return (
    <div className="friction-vision-overlay" role="dialog" aria-modal="true" aria-label="Friction Vision Forensic HUD">
      {/* Forensic Vignette & Scanline HUD border */}
      <div className="vision-scanline-backdrop" />

      {/* Top Forensic HUD Status Bar */}
      <div className="vision-hud-bar">
        <div className="vision-hud-title">
          <span className="vision-hud-blip" />
          <span className="vision-title-text">FRICTION VISION · FORENSIC INSPECTION</span>
          <span className="vision-badge-pill">KEY Q</span>
        </div>

        <div className="vision-hud-actions">
          <span className="vision-hotspot-label">
            TARGET: <strong>{echo.locationName.toUpperCase()}</strong>
          </span>
          <button
            type="button"
            className="vision-close-btn"
            onClick={onClose}
            aria-label="Exit Friction Vision"
            title="Exit Friction Vision (Q or Esc)"
          >
            ✕ EXIT VISION
          </button>
        </div>
      </div>

      {/* Main Diagnostic Drawer (Centered readable modal) */}
      <div className="vision-drawer-panel">
        {/* Passenger Profile Strip */}
        <div className="vision-passenger-strip">
          <div className="vision-passenger-badge">
            <span className="vision-passenger-avatar" style={{ backgroundColor: echo.avatarColor }} />
            <div>
              <div className="vision-passenger-name">{echo.passengerName}</div>
              <div className="vision-passenger-meta">{echo.passengerRole} · {echo.locationName}</div>
            </div>
          </div>

          {repairsComplete && (
            <div className="vision-replay-toggle" role="group" aria-label="Replay Mode">
              <button
                type="button"
                className={`vision-toggle-btn ${replayMode === 'before' ? 'is-active' : ''}`}
                onClick={() => setReplayMode('before')}
              >
                BEFORE (Friction)
              </button>
              <button
                type="button"
                className={`vision-toggle-btn ${replayMode === 'after' ? 'is-active' : ''}`}
                onClick={() => setReplayMode('after')}
              >
                AFTER (Clarity)
              </button>
            </div>
          )}
        </div>

        {/* Authored Journey Simulation Breakdown */}
        <div className="vision-evidence-box">
          <div className="vision-box-header">
            <span className="vision-step-chip">EVIDENCE OBSERVATION</span>
            <span className="vision-status-note">
              {isAlreadyFound ? 'EVIDENCE CATALOGUED IN CASE FILE ✓' : 'OBSERVING REPLAYED GHOST TRAIL'}
            </span>
          </div>

          {replayMode === 'before' ? (
            <div className="vision-box-body">
              <p className="vision-narrative-p">{echo.observationNarrative}</p>
              <div className="vision-hesitation-alert">
                <Icons.Alert size={18} color="#FF3B30" />
                <div>
                  <strong>POINT OF COGNITIVE FRICTION:</strong>
                  <span>{echo.hesitationAction}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="vision-box-body vision-box-body--clarity">
              <div className="vision-hesitation-alert vision-hesitation-alert--clarity">
                <Icons.Sparkle size={18} color="#059669" />
                <div>
                  <strong>REPAIRED ACCESSIBLE FLOW:</strong>
                  <span>{echo.afterRepairResolution}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis Question & Radios */}
        <div className="vision-diagnosis-area">
          <h3 className="vision-question-title">{echo.diagnosisPrompt}</h3>

          <div className="vision-radio-group" role="radiogroup" aria-label="Select diagnosis">
            {echo.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`vision-radio-card ${isSelected ? 'is-selected' : ''} ${
                    hasSubmitted && opt.isCorrect ? 'is-correct' : ''
                  } ${hasSubmitted && isSelected && !opt.isCorrect ? 'is-incorrect' : ''}`}
                  onClick={() => {
                    if (!hasSubmitted || !isCorrect) {
                      setSelectedOptionId(opt.id);
                    }
                  }}
                  disabled={hasSubmitted && isCorrect}
                >
                  <span className="vision-radio-glyph">{isSelected ? '●' : '○'}</span>
                  <span className="vision-radio-text">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Card */}
          {feedback && (
            <div className={`vision-feedback-alert ${isCorrect ? 'is-success' : 'is-error'}`} role="alert">
              <div className="vision-feedback-title">
                {isCorrect ? (
                  <>
                    <Icons.Sparkle size={18} color="#059669" />
                    <span>DIAGNOSIS ACCURATE · EVIDENCE CONFIRMED</span>
                  </>
                ) : (
                  <>
                    <Icons.Alert size={18} color="#DC2626" />
                    <span>DIAGNOSIS INCOMPLETE</span>
                  </>
                )}
              </div>
              <p className="vision-feedback-desc">{feedback}</p>

              {isCorrect && (
                <div className="vision-stamp-reward">
                  <Badge variant="sticker" color={clue.badgeColor} rotate={-1}>
                    ★ EVIDENCE STAMP: {clue.badgeName.toUpperCase()}
                  </Badge>
                  <span className="vision-principle-badge">
                    Principle: <strong>{clue.principle}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="vision-footer">
          {!hasSubmitted ? (
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedOptionId}
              onClick={handleSubmitDiagnosis}
            >
              Verify Diagnosis →
            </Button>
          ) : !isCorrect ? (
            <div className="vision-btn-row">
              <Button variant="secondary" size="md" onClick={handleRetry}>
                ↻ Try Different Diagnosis
              </Button>
              <Button variant="ghost" size="md" onClick={onClose}>
                Resume Search
              </Button>
            </div>
          ) : (
            <div className="vision-btn-row">
              {targetHotspot === 'kiosk' && (
                <Button variant="primary" size="md" onClick={onStartBookingChallenge}>
                  Proceed to Booking Mission →
                </Button>
              )}
              <Button variant="mint" size="md" onClick={onClose}>
                {cluesFound.length === 3 ? 'Review Friction Trail ✓' : 'Continue Concourse Search →'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
