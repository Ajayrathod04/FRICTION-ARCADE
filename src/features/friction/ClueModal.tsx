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

  const handleCollect = () => {
    onCollectClue(hotspotId);
    onClose();
    // Only launch booking drill when all 3 evidence stamps are found
    const updatedCount = cluesFound.includes(hotspotId) ? cluesFound.length : cluesFound.length + 1;
    if (updatedCount >= 3 && hotspotId === 'kiosk') {
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
          {hotspotId === 'kiosk' ? (
            <Button variant="primary" size="lg" onClick={handleCollect}>
              {isAlreadyFound ? 'Launch Booking Mission →' : 'Collect Badge & Start Challenge →'}
            </Button>
          ) : (
            <div className="clue-modal-btn-row">
              <Button variant="mint" size="md" onClick={handleCollect}>
                {isAlreadyFound ? 'Close Clue' : 'Unlock Sticker & Continue →'}
              </Button>
              <Button variant="secondary" size="md" onClick={onStartBooking}>
                Jump to Booking Mission
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
