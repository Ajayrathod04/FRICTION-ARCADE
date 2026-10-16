import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Icons } from '../../components/ui/Icons';
import { REPAIR_PUZZLES } from '../../data/missionData';
import type { RepairPuzzle, RepairOption } from '../../data/missionData';

interface RepairModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllRepairsComplete: () => void;
  onRepairApplied?: (repairId: string) => void;
}

export const RepairModal: React.FC<RepairModalProps> = ({
  isOpen,
  onClose,
  onAllRepairsComplete,
  onRepairApplied,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);

  const currentPuzzle: RepairPuzzle = REPAIR_PUZZLES[currentStepIndex];
  const isCurrentSolved = solvedPuzzles.includes(currentPuzzle.id);

  const handleSelectOption = (option: RepairOption) => {
    if (isCurrentSolved) return;
    setSelectedOptionId(option.id);
    if (!isSubmitted) {
      setFeedback(null);
    }
  };

  const handleSubmitOption = () => {
    if (!selectedOptionId) return;
    const option = currentPuzzle.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    setIsSubmitted(true);
    if (option.isCorrect) {
      setFeedback({
        isCorrect: true,
        text: option.explanation,
      });
      if (!solvedPuzzles.includes(currentPuzzle.id)) {
        const nextSolved = [...solvedPuzzles, currentPuzzle.id];
        setSolvedPuzzles(nextSolved);
        onRepairApplied?.(currentPuzzle.id);
      }
    } else {
      setFeedback({
        isCorrect: false,
        text: option.explanation,
      });
    }
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    setIsSubmitted(false);
  };

  const handleNextPuzzle = () => {
    setSelectedOptionId(null);
    setFeedback(null);
    setIsSubmitted(false);
    if (currentStepIndex < REPAIR_PUZZLES.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onAllRepairsComplete();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DESIGNER MODE: REPAIR THE FLOW"
      badge={`REPAIR ${currentStepIndex + 1} OF 3`}
      maxWidth="680px"
    >
      <div className="repair-modal-content">
        {/* Progress tracker */}
        <div className="repair-progress-track">
          {REPAIR_PUZZLES.map((puzzle, idx) => (
            <div
              key={puzzle.id}
              className={`repair-step-pip ${idx === currentStepIndex ? 'is-active' : ''} ${solvedPuzzles.includes(puzzle.id) ? 'is-solved' : ''}`}
            >
              <span className="pip-num">{idx + 1}</span>
              <span className="pip-label">{puzzle.id}</span>
            </div>
          ))}
        </div>

        {/* Live Shared Form Preview (Transforms when fix is chosen) */}
        <div className="repair-preview-card">
          <div className="repair-preview-card__header">
            <span className="repair-preview-card__title">
              {isCurrentSolved ? '✨ SHARED FORM UPDATED (CLARITY ACTIVE)' : '⚡ LIVE SHARED FORM PREVIEW (BEFORE FIX)'}
            </span>
            <span className={`preview-state-badge ${isCurrentSolved ? 'preview-state-badge--fixed' : 'preview-state-badge--flawed'}`}>
              {isCurrentSolved ? 'FIX APPLIED ✓' : 'NEEDS REPAIR ⚠'}
            </span>
          </div>

          <div className="repair-preview-card__body">
            {currentPuzzle.id === 'labels' && (
              <div className="preview-component">
                {isCurrentSolved ? (
                  <div className="preview-field-fixed">
                    <label className="preview-label" htmlFor="preview-city">
                      Departure City <span style={{ color: '#FF3B30' }}>*</span>
                    </label>
                    <input
                      id="preview-city"
                      type="text"
                      className="preview-input preview-input--fixed"
                      value="Mumbai CST"
                      readOnly
                    />
                    <span className="preview-hint">Persistent label keeps context visible at all times</span>
                  </div>
                ) : (
                  <div className="preview-field-flawed">
                    <input
                      type="text"
                      className="preview-input preview-input--flawed"
                      placeholder="departure city (e.g. mumbai)"
                      readOnly
                    />
                    <span className="preview-warning">Vanishing placeholder: context disappears upon typing!</span>
                  </div>
                )}
              </div>
            )}

            {currentPuzzle.id === 'errors' && (
              <div className="preview-component">
                {isCurrentSolved ? (
                  <div className="preview-error-fixed">
                    <div className="preview-guidance-box">
                      <Icons.Check size={18} color="#059669" />
                      <span><strong>Saturday, 17 Oct 2026</strong> · Deccan Express available (2 AC seats)</span>
                    </div>
                  </div>
                ) : (
                  <div className="preview-error-flawed">
                    <div className="preview-cryptic-box">
                      <Icons.Alert size={18} color="#FF3B30" />
                      <span>Invalid input. Please correct fields.</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentPuzzle.id === 'actions' && (
              <div className="preview-component">
                {isCurrentSolved ? (
                  <div className="preview-actions-fixed">
                    <button type="button" className="btn-arcade btn-primary btn-preview-cta">
                      BOOK 2 SEATS (₹750) →
                    </button>
                    <button type="button" className="btn-preview-cancel">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="preview-actions-flawed">
                    <button type="button" className="btn-preview-ambiguous">
                      Cancel
                    </button>
                    <button type="button" className="btn-preview-ambiguous">
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="repair-card">
          <h3 className="repair-title">{currentPuzzle.title}</h3>
          <p className="repair-prompt">{currentPuzzle.prompt}</p>

          <div className="repair-options-list" role="radiogroup" aria-label={currentPuzzle.prompt}>
            {currentPuzzle.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const optionClass = isSubmitted
                ? opt.isCorrect
                  ? 'repair-option--correct'
                  : isSelected
                  ? 'repair-option--wrong'
                  : ''
                : isSelected
                ? 'repair-option--selected'
                : '';

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`repair-option-btn ${optionClass}`}
                  onClick={() => handleSelectOption(opt)}
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isCurrentSolved}
                >
                  <div className="repair-option-radio">
                    {isSubmitted && opt.isCorrect && <Icons.Check size={16} color="#ffffff" />}
                    {isSubmitted && isSelected && !opt.isCorrect && <Icons.Close size={16} color="#ffffff" />}
                    {(!isSubmitted || (!opt.isCorrect && !isSelected)) && (
                      <span className={`radio-dot ${isSelected ? 'radio-dot--active' : ''}`} />
                    )}
                  </div>
                  <div className="repair-option-details">
                    <span className="repair-option-label">{opt.label}</span>
                    <span className="repair-option-desc">{opt.description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback announcement */}
          {feedback && (
            <div
              className={`repair-feedback ${feedback.isCorrect ? 'repair-feedback--success' : 'repair-feedback--error'}`}
              role="alert"
            >
              <div className="repair-feedback__header">
                {feedback.isCorrect ? (
                  <>
                    <Icons.Check size={20} color="#17131F" />
                    <strong>EXCELLENT CHOICE!</strong>
                  </>
                ) : (
                  <>
                    <Icons.Alert size={20} color="#FF3B30" />
                    <strong>NOT QUITE — TRY AGAIN</strong>
                  </>
                )}
              </div>
              <p className="repair-feedback__text">{feedback.text}</p>
            </div>
          )}
        </div>

        <div className="repair-modal-footer">
          {!isSubmitted || !feedback?.isCorrect ? (
            <div className="repair-actions-row">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitOption}
                disabled={!selectedOptionId || isCurrentSolved}
              >
                Submit Design Repair →
              </Button>
              {isSubmitted && !feedback?.isCorrect && (
                <Button variant="secondary" size="lg" onClick={handleRetry}>
                  ↻ Try Another Solution
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="mint"
              size="lg"
              onClick={handleNextPuzzle}
            >
              {currentStepIndex < REPAIR_PUZZLES.length - 1
                ? 'Apply Fix & Next Puzzle →'
                : 'Complete All Repairs & Test Improved Flow →'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
