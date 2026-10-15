import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';

interface IntroTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExploring: () => void;
}

export const IntroTutorialModal: React.FC<IntroTutorialModalProps> = ({
  isOpen,
  onClose,
  onStartExploring,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="MISSION 01: THE LAST TICKET"
      badge="SCREEN 03 · BRIEFING & CONTROLS"
      maxWidth="720px"
    >
      <div className="tutorial-modal-content">
        {/* Mission Objectives Banner */}
        <div className="tutorial-brief-banner">
          <div className="brief-flag">
            <Icons.Target size={26} color="#FF8A1F" />
            <div className="brief-titles">
              <span className="brief-eyebrow">YOUR OBJECTIVE</span>
              <h3 className="brief-headline">Book two seats from Mumbai to Pune for Saturday.</h3>
            </div>
          </div>
          <p className="brief-instructions">
            Explore the vibrant 3D transit station. Discover three confusing interface friction points across the <strong>Ticket Kiosk</strong>, <strong>Departure Board</strong>, and <strong>Help Desk</strong>, then redesign the booking flow.
          </p>
        </div>

        {/* 3 Step Mission Flow Indicator */}
        <div className="tutorial-steps-strip">
          <div className="tutorial-step">
            <span className="t-step-num">1</span>
            <div className="t-step-text">
              <strong>Explore Station</strong>
              <span>WASD to move & interact</span>
            </div>
          </div>
          <span className="t-step-arrow">→</span>
          <div className="tutorial-step">
            <span className="t-step-num">2</span>
            <div className="t-step-text">
              <strong>Spot Friction</strong>
              <span>Collect 3 Clue Stamps</span>
            </div>
          </div>
          <span className="t-step-arrow">→</span>
          <div className="tutorial-step">
            <span className="t-step-num">3</span>
            <div className="t-step-text">
              <strong>Fix the Flow</strong>
              <span>Apply UX repairs</span>
            </div>
          </div>
        </div>

        {/* Controls Card */}
        <div className="tutorial-controls-card">
          <h4 className="controls-card-title">
            <Icons.Gamepad size={20} color="#17131F" />
            <span>STATION CONTROLS GUIDE</span>
          </h4>

          <div className="controls-grid">
            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">W</kbd>
                <kbd className="key-cap">A</kbd>
                <kbd className="key-cap">S</kbd>
                <kbd className="key-cap">D</kbd>
              </div>
              <span className="control-desc">Walk around the concourse</span>
            </div>

            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">Shift</kbd>
              </div>
              <span className="control-desc">Sprint / Walk faster</span>
            </div>

            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">E</kbd>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>or</span>
                <kbd className="key-cap">Enter</kbd>
              </div>
              <span className="control-desc">Interact with nearby objects</span>
            </div>

            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">M</kbd>
              </div>
              <span className="control-desc">Toggle Station Route Map</span>
            </div>

            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">H</kbd>
              </div>
              <span className="control-desc">Show helpful mission hint</span>
            </div>

            <div className="control-cell">
              <div className="key-cap-group">
                <kbd className="key-cap">Esc</kbd>
              </div>
              <span className="control-desc">Close dialogs or pause</span>
            </div>
          </div>

          <div className="mobile-touch-note">
            <Badge variant="sticker" color="#B6FFB2" rotate={-1}>
              TOUCH FRIENDLY
            </Badge>
            <span>On mobile or tablet, simply tap any glowing station pin or hotspot to explore!</span>
          </div>
        </div>

        <div className="tutorial-actions-row">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Skip Tutorial
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              onStartExploring();
              onClose();
            }}
            icon={<Icons.Sparkle size={20} color="#FFFFFF" />}
          >
            START EXPLORING STATION →
          </Button>
        </div>
      </div>
    </Modal>
  );
};
