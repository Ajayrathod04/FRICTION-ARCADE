import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { formatSeconds } from '../../lib/storage';

interface BookingFlowAfterProps {
  onComplete: (elapsedSec: number, errorCount: number) => void;
  onBackToStation: () => void;
}

export const BookingFlowAfter: React.FC<BookingFlowAfterProps> = ({
  onComplete,
  onBackToStation,
}) => {
  const [origin, setOrigin] = useState('Mumbai CST');
  const [destination, setDestination] = useState('Pune Junction');
  const [date, setDate] = useState('2026-10-18');
  const [passengers, setPassengers] = useState(2);
  const [seatType, setSeatType] = useState<'AC' | 'Sleeper' | 'Regular'>('AC');

  // Inline validation & state
  const [originTouched, setOriginTouched] = useState(false);
  const [destTouched, setDestTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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

  const isOriginValid = origin.trim().length >= 2;
  const isDestValid = destination.trim().length >= 2 && destination.toLowerCase() !== origin.toLowerCase();
  const isDateValid = date.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOriginTouched(true);
    setDestTouched(true);
    setDateTouched(true);

    if (!isOriginValid || !isDestValid || !isDateValid) {
      setErrorCount((prev) => prev + 1);
      return;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setBookingSuccess(true);
  };

  const handleFinish = () => {
    onComplete(secondsElapsed, errorCount);
  };

  return (
    <div className="booking-challenge-container booking-challenge-container--improved">
      {/* Top Header */}
      <div className="booking-challenge-header">
        <div className="booking-challenge-meta">
          <Badge variant="pill" color="#B6FFB2">
            STAGE 2 · AFTER (IMPROVED ACCESSIBLE FLOW)
          </Badge>
          <div className="live-telemetry">
            <span className="telemetry-item">
              ⏱ <strong>{formatSeconds(secondsElapsed)}</strong>
            </span>
            <span className="telemetry-item">
              {errorCount === 0 ? (
                <span className="telemetry-item--zero-errors">✓ 0 errors</span>
              ) : (
                <span>⚠ {errorCount} errors</span>
              )}
            </span>
          </div>
        </div>

        <div className="task-objective-card task-objective-card--improved">
          <div className="task-objective-card__icon">
            <Icons.Check size={24} color="#17131F" />
          </div>
          <div className="task-objective-card__content">
            <span className="task-objective-label">SAME OBJECTIVE · BETTER FLOW</span>
            <p className="task-objective-text">
              Book <strong>2 seats</strong> from <strong>Mumbai</strong> to <strong>Pune</strong> for <strong>Saturday (18 Oct 2026)</strong>.
            </p>
          </div>
        </div>
      </div>

      {!bookingSuccess ? (
        <form onSubmit={handleSubmit} className="improved-form" noValidate>
          <div className="form-legend-banner form-legend-banner--improved">
            <span>CENTRAL TICKET KIOSK · OPTIMIZED EXPERIENCE</span>
            <span className="a11y-badge">WCAG AA Compliant</span>
          </div>

          <div className="improved-grid">
            {/* Field 1: Departure city with persistent label, icon, inline validation */}
            <div className="form-field-group">
              <label htmlFor="dep-city" className="form-field-label">
                Departure City <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <Icons.Train size={18} color="#FF8A1F" />
                </span>
                <input
                  id="dep-city"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  onBlur={() => setOriginTouched(true)}
                  className={`improved-input ${originTouched && !isOriginValid ? 'improved-input--error' : ''} ${originTouched && isOriginValid ? 'improved-input--valid' : ''}`}
                  placeholder="e.g. Mumbai CST"
                  required
                />
                {originTouched && isOriginValid && (
                  <span className="valid-icon" aria-label="Valid entry">
                    <Icons.Check size={18} color="#059669" />
                  </span>
                )}
              </div>
              {originTouched && !isOriginValid && (
                <p className="field-error-msg" role="alert">
                  <Icons.Alert size={14} /> Please enter a valid departure station.
                </p>
              )}
            </div>

            {/* Field 2: Arrival city */}
            <div className="form-field-group">
              <label htmlFor="arr-city" className="form-field-label">
                Arrival City <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <Icons.Target size={18} color="#FF3D8B" />
                </span>
                <input
                  id="arr-city"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onBlur={() => setDestTouched(true)}
                  className={`improved-input ${destTouched && !isDestValid ? 'improved-input--error' : ''} ${destTouched && isDestValid ? 'improved-input--valid' : ''}`}
                  placeholder="e.g. Pune Jn"
                  required
                />
                {destTouched && isDestValid && (
                  <span className="valid-icon" aria-label="Valid entry">
                    <Icons.Check size={18} color="#059669" />
                  </span>
                )}
              </div>
              {destTouched && !isDestValid && (
                <p className="field-error-msg" role="alert">
                  <Icons.Alert size={14} /> Destination must differ from departure station.
                </p>
              )}
            </div>

            {/* Field 3: Travel Date with picker and helper */}
            <div className="form-field-group">
              <label htmlFor="travel-date" className="form-field-label">
                Travel Date <span className="req">*</span>
              </label>
              <input
                id="travel-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setDateTouched(true)}
                className={`improved-input ${dateTouched && !isDateValid ? 'improved-input--error' : ''}`}
                required
              />
              <span className="field-helper-text">Selected: Saturday, 18 Oct 2026</span>
            </div>

            {/* Field 4: Passenger Counter with tactile 48px buttons */}
            <div className="form-field-group">
              <label htmlFor="passengers-count" className="form-field-label">
                Passengers
              </label>
              <div className="passenger-stepper" id="passengers-count">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  aria-label="Decrease passenger count"
                  disabled={passengers <= 1}
                >
                  −
                </button>
                <span className="stepper-value" aria-live="polite">
                  {passengers} {passengers === 1 ? 'Traveler' : 'Travelers'}
                </span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setPassengers(Math.min(6, passengers + 1))}
                  aria-label="Increase passenger count"
                  disabled={passengers >= 6}
                >
                  +
                </button>
              </div>
            </div>

            {/* Field 5: Seat selection with clear cards & pricing */}
            <div className="form-field-group form-field-group--full">
              <fieldset className="seat-fieldset">
                <legend className="form-field-label">Select Seating Tier</legend>
                <div className="seat-tier-row">
                  {[
                    { id: 'Regular', name: 'Regular Chair', price: '₹350' },
                    { id: 'AC', name: 'AC Executive Chair', price: '₹620' },
                    { id: 'Sleeper', name: 'First AC Sleeper', price: '₹950' },
                  ].map((tier) => (
                    <label
                      key={tier.id}
                      className={`seat-tier-card ${seatType === tier.id ? 'is-active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="seatTier"
                        value={tier.id}
                        checked={seatType === tier.id}
                        onChange={() => setSeatType(tier.id as any)}
                        className="sr-only"
                      />
                      <div className="seat-tier-card__header">
                        <span className="seat-tier-name">{tier.name}</span>
                        {seatType === tier.id && <Icons.Check size={16} color="#059669" />}
                      </div>
                      <span className="seat-tier-price">{tier.price}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          {/* Predictable primary CTA with generous size */}
          <div className="improved-actions">
            <button
              type="button"
              className="btn-back-link"
              onClick={onBackToStation}
            >
              ← Back to Station
            </button>
            <Button
              type="submit"
              variant="mint"
              size="lg"
              className="btn-confirm-booking"
              icon={<Icons.Ticket size={22} color="#17131F" />}
            >
              Confirm & Book Tickets →
            </Button>
          </div>
        </form>
      ) : (
        /* Readable Success State with Collectible Boarding Pass */
        <div className="booking-success-view">
          <div className="success-badge-banner">
            <Badge variant="sticker" color="#B6FFB2">
              ✓ BOOKING CONFIRMED · SUCCESSFUL FLOW
            </Badge>
          </div>

          <div className="boarding-pass">
            <div className="boarding-pass__left">
              <div className="boarding-pass__brand">FRICTION ARCADE · TRANSIT EXPRESS</div>
              <div className="boarding-pass__route">
                <div className="route-city">
                  <span className="route-code">MUM</span>
                  <span className="route-name">{origin}</span>
                </div>
                <div className="route-arrow">
                  <Icons.ArrowRight size={24} color="#FF3D8B" />
                </div>
                <div className="route-city">
                  <span className="route-code">PUN</span>
                  <span className="route-name">{destination}</span>
                </div>
              </div>

              <div className="boarding-pass__grid">
                <div>
                  <span className="pass-label">DATE</span>
                  <span className="pass-val">Sat, 18 Oct 2026</span>
                </div>
                <div>
                  <span className="pass-label">PASSENGERS</span>
                  <span className="pass-val">{passengers} Seats</span>
                </div>
                <div>
                  <span className="pass-label">TIER</span>
                  <span className="pass-val">{seatType}</span>
                </div>
                <div>
                  <span className="pass-label">STATUS</span>
                  <span className="pass-val pass-val--green">CONFIRMED ✓</span>
                </div>
              </div>
            </div>

            <div className="boarding-pass__divider">
              <span className="pass-punch-hole top" />
              <span className="pass-punch-hole bottom" />
            </div>

            <div className="boarding-pass__right">
              <span className="pass-stamp">MISSION COMPLETED</span>
              <div className="fake-barcode" aria-hidden="true">
                ||||| | |||| ||| ||||| || |
              </div>
            </div>
          </div>

          <div className="success-actions-row">
            <Button
              variant="secondary"
              onClick={() => setBookingSuccess(false)}
            >
              Edit Details
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleFinish}
            >
              View Your Personal Results & Comparison →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
