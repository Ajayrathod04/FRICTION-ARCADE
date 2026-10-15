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
}

export const RepairModal: React.FC<RepairModalProps> = ({
  isOpen,
  onClose,
  onAllRepairsComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);

  const currentPuzzle: RepairPuzzle = REPAIR_PUZZLES[currentStepIndex];

  const handleSelectOption = (option: RepairOption) => {
    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      setFeedback({
        isCorrect: true,
        text: option.explanation,
      });
      if (!solvedPuzzles.includes(currentPuzzle.id)) {
        setSolvedPuzzles([...solvedPuzzles, currentPuzzle.id]);
      }
    } else {
      setFeedback({
        isCorrect: false,
        text: option.explanation,
      });
    }
  };

  const handleNextPuzzle = () => {
    setSelectedOptionId(null);
    setFeedback(null);
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
      maxWidth="640px"
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

        <div className="repair-card">
          <h3 className="repair-title">{currentPuzzle.title}</h3>
          <p className="repair-prompt">{currentPuzzle.prompt}</p>

          <div className="repair-options-list" role="radiogroup" aria-label={currentPuzzle.prompt}>
            {currentPuzzle.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              const optionClass = isSelected
                ? opt.isCorrect
                  ? 'repair-option--correct'
                  : 'repair-option--wrong'
                : '';

              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`repair-option-btn ${optionClass}`}
                  onClick={() => handleSelectOption(opt)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="repair-option-radio">
                    {isSelected && opt.isCorrect && <Icons.Check size={16} color="#ffffff" />}
                    {isSelected && !opt.isCorrect && <Icons.Close size={16} color="#ffffff" />}
                    {!isSelected && <span className="radio-dot" />}
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
          <Button
            variant={feedback?.isCorrect ? 'mint' : 'secondary'}
            size="lg"
            onClick={handleNextPuzzle}
            disabled={!feedback?.isCorrect}
          >
            {currentStepIndex < REPAIR_PUZZLES.length - 1
              ? 'Apply Fix & Next Puzzle →'
              : 'Complete All Repairs & Test Improved Flow →'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
