import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { CLUES } from '../../data/missionData';
import type { ClueItem } from '../../data/missionData';

interface ClueModalProps {
  hotspotId: 'kiosk' | 'board' | 'desk' | null;
  isOpen: boolean;
  onClose: () => void;
  onCollectClue: (id: string) => void;
  onStartBooking: () => void;
  cluesFound: string[];
}

export const ClueModal: React.FC<ClueModalProps> = ({
  hotspotId,
  isOpen,
  onClose,
  onCollectClue,
  onStartBooking,
  cluesFound,
}) => {
  if (!hotspotId) return null;
  const clue: ClueItem = CLUES[hotspotId];
  const isAlreadyFound = cluesFound.includes(hotspotId);

  const isAllStampsFound = (cluesFound.includes(hotspotId) ? cluesFound.length : cluesFound.length + 1) >= 3;

  const handleCollect = () => {
    onCollectClue(hotspotId);
    onClose();
    if (isAllStampsFound) {
      onStartBooking();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clue.title}
      badge="FRICTION FOUND!"
    >
      <div className="clue-modal-content">
        <div className="clue-badge-spotlight">
          <Badge
            variant="sticker"
            color={clue.badgeColor}
            rotate={-2}
            className="clue-sticker-large"
          >
            ★ BADGE: {clue.badgeName.toUpperCase()}
          </Badge>
        </div>

        <div className="clue-card-body">
          <div className="clue-section">
            <h3 className="clue-subtitle">Interface Flaw</h3>
            <p className="clue-flaw-tag">{clue.flawName}</p>
            <p className="clue-text">{clue.description}</p>
          </div>

          <div className="clue-section">
            <h3 className="clue-subtitle">Why It Creates Friction</h3>
            <p className="clue-text">{clue.frictionExplanation}</p>
          </div>

          <div className="clue-section clue-section--principle">
            <h3 className="clue-subtitle">Design Principle Applied</h3>
            <div className="principle-pill">
              <Icons.Sparkle size={18} color="#FF8A1F" />
              <span>{clue.principle}</span>
            </div>
          </div>
        </div>

        <div className="clue-modal-actions">
          {isAllStampsFound ? (
            <Button variant="primary" size="lg" onClick={handleCollect}>
              All 3 Stamps Found! Launch Booking Challenge (BEFORE Flow) →
            </Button>
          ) : (
            <Button variant="mint" size="lg" onClick={handleCollect}>
              {isAlreadyFound
                ? `Evidence Stamp Collected (${cluesFound.length}/3) · Continue →`
                : `Collect Stamp & Continue (${cluesFound.length + 1}/3) →`}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
