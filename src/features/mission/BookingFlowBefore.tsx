import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { formatSeconds } from '../../lib/storage';
import { Modal } from '../../components/ui/Modal';

interface BookingFlowBeforeProps {
  onComplete: (elapsedSec: number, errorCount: number) => void;
  onCancel: () => void;
}

export const BookingFlowBefore: React.FC<BookingFlowBeforeProps> = ({
  onComplete,
  onCancel,
}) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('2');
  const [seatType, setSeatType] = useState('AC');

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorsCount, setErrorsCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showCaseFile, setShowCaseFile] = useState(false);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check intentional friction checks
    const cleanOrigin = origin.trim().toLowerCase();
    const cleanDest = destination.trim().toLowerCase();
    const cleanDate = date.trim();

    const isOriginValid = cleanOrigin.includes('mumbai') || cleanOrigin === 'bom';
    const isDestValid = cleanDest.includes('pune') || cleanDest === 'pnq';
    // Accepts formats like 17-10-2026, 17/10/2026, 2026-10-17, or Saturday
    const isDateValid =
      cleanDate.includes('17') ||
      cleanDate.toLowerCase().includes('sat') ||
      cleanDate.includes('2026-10-17') ||
      cleanDate.includes('17-10-2026');

    if (!isOriginValid || !isDestValid || !isDateValid) {
      setErrorsCount((prev) => prev + 1);
      // Flaw 2: Cryptic uninformative feedback
      setErrorMessage('Invalid input. Please correct the fields to continue.');
      return;
    }

    // Success!
    if (timerRef.current) clearInterval(timerRef.current);
    setShowCaseFile(true);
  };

  const handleProceedToDesignerMode = () => {
    setShowCaseFile(false);
    onComplete(secondsElapsed, errorsCount);
  };

  return (
    <div className="booking-challenge-container">
      {/* Top Mission Indicator */}
      <div className="booking-challenge-header">
        <div className="booking-challenge-meta">
          <Badge variant="pill" color="#FF3B30">
            STAGE 1 · BEFORE (FRUSTRATING FLOW)
          </Badge>
          <div className="live-telemetry">
            <span className="telemetry-item">
              ⏱ <strong>{formatSeconds(secondsElapsed)}</strong>
            </span>
            <span className="telemetry-item">
              ⚠ <strong>{errorsCount}</strong> errors
            </span>
          </div>
        </div>

        <div className="task-objective-card">
          <div className="task-objective-card__icon">
            <Icons.Target size={24} color="#FF8A1F" />
          </div>
          <div className="task-objective-card__content">
            <span className="task-objective-label">YOUR MISSION</span>
            <p className="task-objective-text">
              Book <strong>2 seats</strong> from <strong>Mumbai</strong> to <strong>Pune</strong> for <strong>Saturday (17 Oct 2026)</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* The Flawed Form Interface */}
      <form onSubmit={handleSubmit} className="flawed-form" noValidate>
        <div className="form-legend-banner">
          <span>CENTRAL TICKET KIOSK #04 — BOOKING INTERFACE</span>
        </div>

        {/* Cryptic Error Banner if triggered */}
        {errorMessage && (
          <div className="cryptic-error-banner" role="alert">
            <span className="cryptic-error-dot" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flawed-grid">
          {/* Flaw 1: NO visible label, only vanishing placeholder */}
          <div className="flawed-field">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="departure city (e.g. mumbai)"
              className="flawed-input"
              aria-label="Departure city"
            />
          </div>

          <div className="flawed-field">
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="arrival city (e.g. pune)"
              className="flawed-input"
              aria-label="Arrival city"
            />
          </div>

          {/* Date with strict unhelpful placeholder */}
          <div className="flawed-field">
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="dd-mm-yyyy"
              className="flawed-input"
              aria-label="Travel date"
            />
          </div>

          {/* Passengers count */}
          <div className="flawed-field">
            <input
              type="number"
              min="1"
              max="6"
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              placeholder="passengers"
              className="flawed-input"
              aria-label="Number of passengers"
            />
          </div>

          {/* Seat selection with tiny unlabelled buttons */}
          <div className="flawed-field flawed-field--full">
            <div className="flawed-seats-row">
              {['Regular', 'AC', 'Sleeper'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSeatType(type)}
                  className={`flawed-seat-btn ${seatType === type ? 'is-selected' : ''}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Flaw 3: Competing visual weight between submit and cancel */}
        <div className="flawed-actions">
          <button
            type="button"
            className="flawed-cancel-btn"
            onClick={() => {
              setErrorsCount((prev) => prev + 1);
              onCancel();
            }}
          >
            Cancel Order
          </button>
          <button type="submit" className="flawed-submit-btn">
            Continue
          </button>
        </div>

        {/* Escape hatch & Hint button so user is never frustrated */}
        <div className="booking-help-row">
          <button
            type="button"
            className="hint-text-btn"
            onClick={() => setShowHint(!showHint)}
          >
            {showHint ? 'Hide Hint' : 'Stuck? Reveal a Hint 💡'}
          </button>

          <button
            type="button"
            className="skip-challenge-btn"
            onClick={() => {
              if (timerRef.current) clearInterval(timerRef.current);
              setShowCaseFile(true);
            }}
          >
            Skip to Case File & Fix It →
          </button>
        </div>

        {showHint && (
          <div className="hint-callout">
            <p>
              💡 <strong>Hint:</strong> Type <code>Mumbai</code> in the first box, <code>Pune</code> in the second box, and <code>18-10-2026</code> in the date box!
            </p>
          </div>
        )}
      </form>

      {/* Case File Dialog upon completion */}
      <Modal
        isOpen={showCaseFile}
        onClose={handleProceedToDesignerMode}
        title="CASE FILE: 3 DESIGN FLAWS DETECTED"
        badge="ANALYSIS REPORT"
      >
        <div className="case-file-content">
          <div className="case-file-intro">
            <p>
              You experienced the booking flow with intentional design friction. Here is the forensic UX analysis of why this was frustrating:
            </p>
          </div>

          <div className="case-file-list">
            <div className="case-file-item">
              <span className="case-file-item__num">1</span>
              <div>
                <h4>Missing Persistent Labels</h4>
                <p>
                  Inputs relied on placeholder text that vanished when typing. If you paused, you had to delete your input to check what was asked.
                </p>
              </div>
            </div>

            <div className="case-file-item">
              <span className="case-file-item__num">2</span>
              <div>
                <h4>Ambiguous Error Feedback</h4>
                <p>
                  The system showed a generic "Invalid input" banner without identifying which field failed or what format was expected.
                </p>
              </div>
            </div>

            <div className="case-file-item">
              <span className="case-file-item__num">3</span>
              <div>
                <h4>Confusing Action Hierarchy</h4>
                <p>
                  "Continue" and "Cancel Order" competed for attention with low contrast, making the next step hesitant and risky.
                </p>
              </div>
            </div>
          </div>

          <div className="case-file-telemetry">
            <span>Your recorded attempt:</span>
            <strong>{formatSeconds(secondsElapsed)} elapsed</strong> · <strong>{errorsCount} error(s)</strong>
          </div>

          <div className="case-file-action">
            <Button variant="primary" size="lg" onClick={handleProceedToDesignerMode}>
              Enter Designer Mode & Fix The Flow 🛠️
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
