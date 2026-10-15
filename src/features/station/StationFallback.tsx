import React from 'react';
import { Icons } from '../../components/ui/Icons';
import { Badge } from '../../components/ui/Badge';

interface StationFallbackProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
}

export const StationFallback: React.FC<StationFallbackProps> = ({
  onSelectHotspot,
  cluesFound,
  repairsComplete,
}) => {
  return (
    <div className="station-fallback" role="region" aria-label="Accessible 2D Station Map">
      <div className="station-fallback__header">
        <Badge variant="sticker" color="#FFD23F">ACCESSIBLE 2D TRANSIT STATION</Badge>
        <p className="station-fallback__subtitle">
          Select any station hotspot below to inspect the design clues or launch the booking mission.
        </p>
      </div>

      <div className="station-fallback__grid">
        {/* Hotspot 1: Kiosk */}
        <div
          className={`station-card ${cluesFound.includes('kiosk') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="button"
          onClick={() => onSelectHotspot('kiosk')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectHotspot('kiosk');
            }
          }}
          aria-label="Hotspot 1: Central Ticket Kiosk"
        >
          <div className="station-card__header">
            <span className="station-card__num">1</span>
            {cluesFound.includes('kiosk') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Clue Found
              </span>
            ) : (
              <span className="station-card__status">Friction Point</span>
            )}
          </div>
          <div className="station-card__icon station-card__icon--orange">
            <Icons.Ticket size={36} color="#FF8A1F" />
          </div>
          <h3 className="station-card__title">Central Ticket Kiosk</h3>
          <p className="station-card__desc">
            Primary passenger kiosk. The form fields have vanishing placeholder text and no persistent labels.
          </p>
          <button className="station-card__btn" type="button" tabIndex={-1}>
            Inspect Kiosk →
          </button>
        </div>

        {/* Hotspot 2: Departure Board */}
        <div
          className={`station-card ${cluesFound.includes('board') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="button"
          onClick={() => onSelectHotspot('board')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectHotspot('board');
            }
          }}
          aria-label="Hotspot 2: Overhead Departure Board"
        >
          <div className="station-card__header">
            <span className="station-card__num">2</span>
            {cluesFound.includes('board') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Clue Found
              </span>
            ) : (
              <span className="station-card__status">Friction Point</span>
            )}
          </div>
          <div className="station-card__icon station-card__icon--red">
            <Icons.Train size={36} color="#FF3B30" />
          </div>
          <h3 className="station-card__title">Departure Board</h3>
          <p className="station-card__desc">
            Overhead LED schedule. Error alerts rely purely on red color without descriptive guidance.
          </p>
          <button className="station-card__btn" type="button" tabIndex={-1}>
            Inspect Board →
          </button>
        </div>

        {/* Hotspot 3: Help Desk */}
        <div
          className={`station-card ${cluesFound.includes('desk') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="button"
          onClick={() => onSelectHotspot('desk')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectHotspot('desk');
            }
          }}
          aria-label="Hotspot 3: Station Help Desk"
        >
          <div className="station-card__header">
            <span className="station-card__num">3</span>
            {cluesFound.includes('desk') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Clue Found
              </span>
            ) : (
              <span className="station-card__status">Friction Point</span>
            )}
          </div>
          <div className="station-card__icon station-card__icon--blue">
            <Icons.Alert size={36} color="#8DDCFF" />
          </div>
          <h3 className="station-card__title">Station Help Desk</h3>
          <p className="station-card__desc">
            Customer counter. Destructive and primary actions compete with identical visual weights.
          </p>
          <button className="station-card__btn" type="button" tabIndex={-1}>
            Inspect Desk →
          </button>
        </div>
      </div>

      {/* Collectible dimensional ticket preview */}
      <div className="station-fallback__ticket">
        <div className="mini-ticket">
          <div className="mini-ticket__notch-l" />
          <div className="mini-ticket__notch-r" />
          <div className="mini-ticket__content">
            <div className="mini-ticket__route">MUMBAI → PUNE</div>
            <div className="mini-ticket__meta">SAT 18 OCT 2026 · 2 SEATS · FRICTION ARCADE</div>
          </div>
          <div className="mini-ticket__status">
            {repairsComplete ? 'STAMPED · COMPLETE ✓' : `${cluesFound.length}/3 CLUES FOUND`}
          </div>
        </div>
      </div>
    </div>
  );
};
