import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface StationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluesFound: string[];
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
}

export const StationMapModal: React.FC<StationMapModalProps> = ({
  isOpen,
  onClose,
  cluesFound,
  onSelectHotspot,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="STATION CONCOURSE MAP"
      badge="OVERHEAD NAVIGATION · PRESS M"
      maxWidth="700px"
    >
      <div className="station-map-modal-content">
        <div className="station-map-meta-strip">
          <span>Explore all 3 landmark checkpoints along the <strong>Friction Trail</strong> to unlock the booking mission.</span>
          <Badge variant="sticker" color="#FFD23F">
            {cluesFound.length}/3 CHECKPOINTS
          </Badge>
        </div>

        {/* 2D Overhead Schematic Plan */}
        <div className="schematic-map">
          {/* Train track zone */}
          <div className="schematic-track-zone">
            <span className="track-label">PLATFORM 01 · DECCAN EXPRESS (TO PUNE)</span>
            <div className="track-rails" />
          </div>

          {/* Platform Floor Area */}
          <div className="schematic-concourse">
            {/* Hotspot 1: Kiosk */}
            <button
              type="button"
              className={`schematic-pin schematic-pin--kiosk ${cluesFound.includes('kiosk') ? 'is-done' : 'is-active'}`}
              onClick={() => {
                onClose();
                onSelectHotspot('kiosk');
              }}
              title="Ticket Kiosk"
            >
              <span className="pin-num">1</span>
              <div className="pin-tooltip">
                <strong>Ticket Kiosk</strong>
                <span>{cluesFound.includes('kiosk') ? 'Clue Found ✓' : 'Inspect Kiosk →'}</span>
              </div>
            </button>

            {/* Connecting Trail Lines */}
            <svg className="schematic-trail-lines" viewBox="0 0 400 200" aria-hidden="true">
              <path
                d="M 200 130 L 290 80"
                stroke={cluesFound.includes('kiosk') ? '#059669' : '#FFD23F'}
                strokeWidth="4"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M 290 80 L 110 90"
                stroke={cluesFound.includes('board') ? '#059669' : '#C7B5FF'}
                strokeWidth="4"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Hotspot 2: Departure Board */}
            <button
              type="button"
              className={`schematic-pin schematic-pin--board ${cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-active' : ''}`}
              onClick={() => {
                onClose();
                onSelectHotspot('board');
              }}
              title="Departure Board"
            >
              <span className="pin-num">2</span>
              <div className="pin-tooltip">
                <strong>Departure Board</strong>
                <span>{cluesFound.includes('board') ? 'Clue Found ✓' : 'Inspect Board →'}</span>
              </div>
            </button>

            {/* Hotspot 3: Help Desk */}
            <button
              type="button"
              className={`schematic-pin schematic-pin--desk ${cluesFound.includes('desk') ? 'is-done' : cluesFound.includes('board') ? 'is-active' : ''}`}
              onClick={() => {
                onClose();
                onSelectHotspot('desk');
              }}
              title="Help Desk"
            >
              <span className="pin-num">3</span>
              <div className="pin-tooltip">
                <strong>Help Desk</strong>
                <span>{cluesFound.includes('desk') ? 'Clue Found ✓' : 'Inspect Desk →'}</span>
              </div>
            </button>

            {/* Decorative station elements in schematic */}
            <div className="schematic-landmark schematic-landmark--bench" style={{ left: '60%', top: '65%' }}>
              <span>Bench</span>
            </div>
            <div className="schematic-landmark schematic-landmark--planter" style={{ left: '15%', top: '65%' }}>
              <span>Planter</span>
            </div>
          </div>
        </div>

        <div className="station-map-legend">
          <div className="legend-item">
            <span className="legend-dot legend-dot--done" />
            <span>Discovered Clue</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-dot--active" />
            <span>Next Target Checkpoint</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot legend-dot--upcoming" />
            <span>Upcoming Node</span>
          </div>
        </div>

        <div className="station-map-footer">
          <Button variant="primary" size="md" onClick={onClose}>
            Resume Game (Esc)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
