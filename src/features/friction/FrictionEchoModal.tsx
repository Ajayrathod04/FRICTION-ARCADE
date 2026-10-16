import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { CLUES, STATION_ECHOES } from '../../data/missionData';
import type { FrictionEchoData } from '../../data/missionData';
import { SoundEffects } from '../../lib/audio';
import { announce } from '../../lib/a11y';

interface FrictionEchoModalProps {
  hotspotId: 'kiosk' | 'board' | 'desk' | null;
  isOpen: boolean;
  onClose: () => void;
  onCollectClue: (id: string) => void;
  onStartBooking: () => void;
  cluesFound: string[];
  isRepaired?: boolean;
}

export const FrictionEchoModal: React.FC<FrictionEchoModalProps> = ({
  hotspotId,
  isOpen,
  onClose,
  onCollectClue,
  onStartBooking,
  cluesFound,
  isRepaired = false,
}) => {
  if (!hotspotId) return null;
  const echo: FrictionEchoData = STATION_ECHOES[hotspotId];
  const clue = CLUES[hotspotId];
  const isAlreadyFound = cluesFound.includes(hotspotId);

  // Diagnosis interaction state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(isAlreadyFound);
  const [isCorrect, setIsCorrect] = useState<boolean>(isAlreadyFound);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(
    isAlreadyFound ? echo.options.find((o) => o.isCorrect)?.explanation || null : null
  );

  // Clarity replay mode: compare Before vs After
  const [replayMode, setReplayMode] = useState<'before' | 'after'>('before');

  useEffect(() => {
    if (isOpen) {
      if (isAlreadyFound) {
        setHasSubmitted(true);
        setIsCorrect(true);
        const correctOpt = echo.options.find((o) => o.isCorrect);
        setFeedbackMessage(correctOpt?.explanation || null);
      } else {
        setSelectedOptionId(null);
        setHasSubmitted(false);
        setIsCorrect(false);
        setFeedbackMessage(null);
      }
    }
  }, [isOpen, hotspotId, isAlreadyFound, echo.options]);

  const handleSubmitDiagnosis = () => {
    if (!selectedOptionId) return;
    const chosen = echo.options.find((o) => o.id === selectedOptionId);
    if (!chosen) return;

    setHasSubmitted(true);
    if (chosen.isCorrect) {
      setIsCorrect(true);
      setFeedbackMessage(chosen.explanation);
      SoundEffects.playCollect();
      announce(`Diagnosis correct! ${echo.passengerName}'s friction diagnosed. Badge awarded.`);
      onCollectClue(hotspotId);
    } else {
      setIsCorrect(false);
      setFeedbackMessage(chosen.explanation);
      SoundEffects.playBlip();
      announce(`Diagnosis incorrect: ${chosen.explanation}. Try again.`);
    }
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setIsCorrect(false);
    setFeedbackMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`FRICTION ECHO · ${echo.locationName.toUpperCase()}`}
      badge="SIGNATURE MECHANIC · OBSERVE & DIAGNOSE"
      maxWidth="720px"
    >
      <div className="friction-echo-modal-content">
        {/* Top Passenger Header Strip */}
        <div className="echo-passenger-banner">
          <div className="echo-avatar-pill" style={{ borderColor: echo.avatarColor }}>
            <span className="echo-avatar-icon" style={{ backgroundColor: echo.avatarColor }} />
            <div>
              <div className="echo-passenger-name">{echo.passengerName}</div>
              <div className="echo-passenger-role">{echo.passengerRole}</div>
            </div>
          </div>

          <div className="echo-status-pill">
            <span className="radar-live-blip" />
            <span>{isAlreadyFound ? 'EVIDENCE CATALOGUED ✓' : 'OBSERVING PASSENGER ECHO...'}</span>
          </div>
        </div>

        {/* Narrative & Visual Replay Simulator */}
        <div className="echo-replay-box">
          <div className="echo-replay-header">
            <span className="echo-badge-chip">JOURNEY OBSERVATION</span>
            {isRepaired && (
              <div className="echo-mode-switch" role="group" aria-label="Replay Mode">
                <button
                  type="button"
                  className={`echo-tab-btn ${replayMode === 'before' ? 'is-active' : ''}`}
                  onClick={() => setReplayMode('before')}
                >
                  BEFORE (Friction Echo)
                </button>
                <button
                  type="button"
                  className={`echo-tab-btn ${replayMode === 'after' ? 'is-active' : ''}`}
                  onClick={() => setReplayMode('after')}
                >
                  AFTER (Clarity Replay)
                </button>
              </div>
            )}
          </div>

          {replayMode === 'before' ? (
            <div className="echo-replay-body">
              <p className="echo-narrative-text">{echo.observationNarrative}</p>
              <div className="echo-freeze-callout">
                <Icons.Alert size={18} color="#FF3B30" />
                <div>
                  <strong>Cognitive Friction Moment:</strong>
                  <span>{echo.hesitationAction}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="echo-replay-body echo-replay-body--clarity">
              <div className="echo-freeze-callout echo-freeze-callout--clarity">
                <Icons.Sparkle size={18} color="#059669" />
                <div>
                  <strong>Repaired UX Flow:</strong>
                  <span>{echo.afterRepairResolution}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis Question & Options */}
        <div className="echo-diagnosis-section">
          <h3 className="echo-prompt-title">{echo.diagnosisPrompt}</h3>

          <div className="echo-options-list" role="radiogroup" aria-label="Diagnosis choices">
            {echo.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`echo-option-card ${isSelected ? 'is-selected' : ''} ${
                    hasSubmitted && opt.isCorrect ? 'is-correct' : ''
                  } ${hasSubmitted && isSelected && !opt.isCorrect ? 'is-incorrect' : ''}`}
                  onClick={() => {
                    if (!hasSubmitted || !isCorrect) {
                      setSelectedOptionId(opt.id);
                    }
                  }}
                  disabled={hasSubmitted && isCorrect}
                >
                  <span className="echo-option-radio">
                    {isSelected ? '●' : '○'}
                  </span>
                  <span className="echo-option-label">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Area */}
          {feedbackMessage && (
            <div
              className={`echo-feedback-box ${isCorrect ? 'is-correct' : 'is-error'}`}
              role="alert"
            >
              <div className="echo-feedback-header">
                {isCorrect ? (
                  <>
                    <Icons.Sparkle size={18} color="#059669" />
                    <strong>DIAGNOSIS ACCURATE</strong>
                  </>
                ) : (
                  <>
                    <Icons.Alert size={18} color="#FF3B30" />
                    <strong>DIAGNOSIS INCOMPLETE</strong>
                  </>
                )}
              </div>
              <p className="echo-feedback-text">{feedbackMessage}</p>

              {isCorrect && (
                <div className="echo-unlocked-badge">
                  <Badge variant="sticker" color={clue.badgeColor} rotate={-1}>
                    ★ EVIDENCE STAMP: {clue.badgeName.toUpperCase()}
                  </Badge>
                  <div className="echo-principle-tag">
                    <span>Principle: </span>
                    <strong>{clue.principle}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="echo-footer-actions">
          {!hasSubmitted ? (
            <Button
              variant="primary"
              size="lg"
              disabled={!selectedOptionId}
              onClick={handleSubmitDiagnosis}
            >
              Submit Diagnosis →
            </Button>
          ) : !isCorrect ? (
            <div className="echo-action-row">
              <Button variant="secondary" size="md" onClick={handleRetry}>
                ↻ Try Another Diagnosis
              </Button>
              <Button variant="ghost" size="md" onClick={onClose}>
                Resume Exploring
              </Button>
            </div>
          ) : (
            <div className="echo-action-row">
              {hotspotId === 'kiosk' && (
                <Button variant="primary" size="md" onClick={onStartBooking}>
                  Launch Booking Mission →
                </Button>
              )}
              <Button variant="mint" size="md" onClick={onClose}>
                {cluesFound.length === 3 ? 'Review Friction Trail ✓' : 'Continue Concourse Search →'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
