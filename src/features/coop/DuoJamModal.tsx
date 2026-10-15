import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';

interface DuoJamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCoop: () => void;
}

export const DuoJamModal: React.FC<DuoJamModalProps> = ({
  isOpen,
  onClose,
  onStartCoop,
}) => {
  const [player1Name, setPlayer1Name] = useState('Player 1 (Traveler)');
  const [player2Name, setPlayer2Name] = useState('Player 2 (Designer)');

  const handleLaunch = () => {
    onStartCoop();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="DUO DESIGN JAM · COOPERATIVE MODE"
      badge="2-PLAYER SAME-DEVICE CO-OP"
      maxWidth="720px"
    >
      <div className="coop-modal-content">
        <div className="coop-intro-banner">
          <Badge variant="sticker" color="#FF3D8B" rotate={-1}>
            INSPIRED BY CAMPUS EVAC & SF QUEST
          </Badge>
          <h3 className="coop-headline">Team Up: One Explores, One Redesigns!</h3>
          <p className="coop-desc">
            Complete the Mumbai-to-Pune transit booking through complementary roles. No network required—play together on this same device!
          </p>
        </div>

        <div className="coop-roles-grid">
          {/* Role 1 */}
          <div className="coop-role-card coop-role-card--traveler">
            <div className="role-tag">ROLE 01 · IN THE FIELD</div>
            <div className="role-icon-box">
              <Icons.Compass size={28} color="#FF6B00" />
            </div>
            <h4 className="role-title">The Field Traveler</h4>
            <p className="role-responsibilities">
              Controls the 3D character with WASD, moves through the concourse, interacts with the kiosk, and experiences the frustrating booking flaws first-hand.
            </p>
            <div className="role-input-box">
              <label htmlFor="p1-name" className="role-label">Traveler Name:</label>
              <input
                id="p1-name"
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                className="role-input"
              />
            </div>
          </div>

          {/* Role 2 */}
          <div className="coop-role-card coop-role-card--designer">
            <div className="role-tag">ROLE 02 · AT MISSION CONTROL</div>
            <div className="role-icon-box">
              <Icons.Wrench size={28} color="#059669" />
            </div>
            <h4 className="role-title">The Lead Designer</h4>
            <p className="role-responsibilities">
              Studies the collected friction clues, reviews the Case File, applies the three interface repairs in Designer Mode, and triggers station Clarity Mode!
            </p>
            <div className="role-input-box">
              <label htmlFor="p2-name" className="role-label">Designer Name:</label>
              <input
                id="p2-name"
                type="text"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                className="role-input"
              />
            </div>
          </div>
        </div>

        <div className="coop-handshake-steps">
          <span className="handshake-step">1. Traveler navigates station & finds 3 clues</span>
          <span className="handshake-arrow">➔</span>
          <span className="handshake-step">2. Designer solves repair puzzles</span>
          <span className="handshake-arrow">➔</span>
          <span className="handshake-step">3. Joint victory in Clarity Mode!</span>
        </div>

        <div className="coop-modal-footer">
          <Button variant="secondary" size="md" onClick={onClose}>
            Back to Solo
          </Button>
          <Button
            variant="mint"
            size="lg"
            onClick={handleLaunch}
            icon={<Icons.Sparkle size={20} color="#17131F" />}
          >
            START DUO JAM MISSION →
          </Button>
        </div>
      </div>
    </Modal>
  );
};
