import React from 'react';
import { Icons } from '../../components/ui/Icons';
import { Badge } from '../../components/ui/Badge';

interface StationFallbackProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  onTriggerEcho?: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
}

export const StationFallback: React.FC<StationFallbackProps> = ({
  onSelectHotspot,
  onTriggerEcho,
  cluesFound,
  repairsComplete,
}) => {
  return (
    <div className="station-fallback" role="region" aria-label="Accessible 2D Station Map">
      <div className="station-fallback__header">
        <Badge variant="sticker" color="#FFD23F">ACCESSIBLE 2D TRANSIT CONCOURSE</Badge>
        <p className="station-fallback__subtitle">
          Observe passenger journeys, activate <strong>Friction Echo</strong> to diagnose usability problems, and collect all 3 evidence stamps.
        </p>
      </div>

      <div className="station-fallback__grid">
        {/* Hotspot 1: Kiosk */}
        <div
          className={`station-card ${cluesFound.includes('kiosk') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="region"
          aria-label="Hotspot 1: Central Ticket Kiosk"
        >
          <div className="station-card__header">
            <span className="station-card__num">1</span>
            {cluesFound.includes('kiosk') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Stamp Collected ✓
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
            Primary passenger kiosk. Commuter Arjun froze and erased his inputs because placeholder labels vanished upon typing.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="station-card__btn"
              type="button"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => (onTriggerEcho ? onTriggerEcho('kiosk') : onSelectHotspot('kiosk'))}
            >
              ⚡ Friction Echo (Q) →
            </button>
            <button
              className="station-card__btn"
              type="button"
              onClick={() => onSelectHotspot('kiosk')}
            >
              Inspect Kiosk
            </button>
          </div>
        </div>

        {/* Hotspot 2: Departure Board */}
        <div
          className={`station-card ${cluesFound.includes('board') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="region"
          aria-label="Hotspot 2: Overhead Departure Board"
        >
          <div className="station-card__header">
            <span className="station-card__num">2</span>
            {cluesFound.includes('board') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Stamp Collected ✓
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
            Overhead LED schedule. Commuter Meera was stranded by a color-only red alert with no plain-text next steps.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="station-card__btn"
              type="button"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => (onTriggerEcho ? onTriggerEcho('board') : onSelectHotspot('board'))}
            >
              ⚡ Friction Echo (Q) →
            </button>
            <button
              className="station-card__btn"
              type="button"
              onClick={() => onSelectHotspot('board')}
            >
              Inspect Board
            </button>
          </div>
        </div>

        {/* Hotspot 3: Help Desk */}
        <div
          className={`station-card ${cluesFound.includes('desk') ? 'station-card--done' : ''}`}
          tabIndex={0}
          role="region"
          aria-label="Hotspot 3: Station Help Desk"
        >
          <div className="station-card__header">
            <span className="station-card__num">3</span>
            {cluesFound.includes('desk') ? (
              <span className="station-card__status station-card__status--done">
                <Icons.Check size={16} /> Stamp Collected ✓
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
            Customer service counter. Passenger Kabir hovered between two identical gray buttons, terrified of cancelling his ticket.
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button
              className="station-card__btn"
              type="button"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => (onTriggerEcho ? onTriggerEcho('desk') : onSelectHotspot('desk'))}
            >
              ⚡ Friction Echo (Q) →
            </button>
            <button
              className="station-card__btn"
              type="button"
              onClick={() => onSelectHotspot('desk')}
            >
              Inspect Desk
            </button>
          </div>
        </div>
      </div>

      {/* Collectible dimensional ticket preview */}
      <div className="station-fallback__ticket">
        <div className="mini-ticket">
          <div className="mini-ticket__notch-l" />
          <div className="mini-ticket__notch-r" />
          <div className="mini-ticket__content">
            <div className="mini-ticket__route">MUMBAI → PUNE</div>
            <div className="mini-ticket__meta">SAT 17 OCT 2026 · 2 SEATS · FRICTION ARCADE</div>
          </div>
          <div className="mini-ticket__status">
            {repairsComplete ? 'STAMPED · COMPLETE ✓' : `${cluesFound.length}/3 STAMPS COLLECTED`}
          </div>
        </div>
      </div>
    </div>
  );
};
