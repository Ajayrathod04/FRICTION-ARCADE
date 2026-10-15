import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { SoundEffects } from '../../lib/audio';

interface PauseMenuModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestartDrill: () => void;
  onExitHome: () => void;
  cameraMode: 'over_the_shoulder' | 'isometric';
  onToggleCamera: () => void;
  voiceNarration: boolean;
  onToggleVoice: () => void;
  graphicsMode: 'fast' | 'high';
  onToggleGraphics: () => void;
  activeRoleView: 'traveler' | 'designer' | 'evidence';
  onSelectRoleView: (role: 'traveler' | 'designer' | 'evidence') => void;
  onOpenHowToPlay: () => void;
}

export const PauseMenuModal: React.FC<PauseMenuModalProps> = ({
  isOpen,
  onResume,
  onRestartDrill,
  onExitHome,
  cameraMode,
  onToggleCamera,
  voiceNarration,
  onToggleVoice,
  graphicsMode,
  onToggleGraphics,
  activeRoleView,
  onSelectRoleView,
  onOpenHowToPlay,
}) => {
  const [showHowToPlayDrawer, setShowHowToPlayDrawer] = useState(false);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onResume}
      title="TAKE A BREATH."
      badge="PAUSED · ESC TO RESUME"
      maxWidth="500px"
    >
      <div className="campus-pause-menu">
        {/* Primary Resume Action */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--primary"
          onClick={() => {
            SoundEffects.playBlip();
            onResume();
          }}
          autoFocus
        >
          RESUME
        </button>

        {/* Restart from Entrance */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--secondary"
          onClick={() => {
            SoundEffects.playBlip();
            onRestartDrill();
          }}
        >
          <span>RESTART MISSION</span>
          <span className="campus-btn-sub">FROM THE ENTRANCE</span>
        </button>

        {/* Camera Setting */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--setting"
          onClick={() => {
            SoundEffects.playBlip();
            onToggleCamera();
          }}
        >
          <span className="setting-label">CAMERA</span>
          <span className="setting-value">
            {cameraMode === 'over_the_shoulder' ? 'OVER THE SHOULDER' : 'ISOMETRIC CONCOURSE'}
          </span>
        </button>

        {/* Voice Narration Setting */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--setting"
          onClick={() => {
            SoundEffects.playBlip();
            onToggleVoice();
          }}
        >
          <span className="setting-label">VOICE NARRATION</span>
          <span className={`setting-value ${voiceNarration ? 'is-active' : ''}`}>
            {voiceNarration ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Graphics Performance Setting */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--setting"
          onClick={() => {
            SoundEffects.playBlip();
            onToggleGraphics();
          }}
        >
          <span className="setting-label">GRAPHICS</span>
          <span className="setting-value">
            {graphicsMode === 'fast' ? 'FAST' : 'HIGH FIDELITY'}
          </span>
        </button>

        {/* Role View Tabs (CampusEvac Inspiration) */}
        <div className="campus-role-tabs">
          <button
            type="button"
            className={`role-tab-btn ${activeRoleView === 'traveler' ? 'is-selected' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              onSelectRoleView('traveler');
            }}
          >
            TRAVELER VIEW
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleView === 'designer' ? 'is-selected' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              onSelectRoleView('designer');
            }}
          >
            DESIGN STATION
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleView === 'evidence' ? 'is-selected' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              onSelectRoleView('evidence');
            }}
          >
            EVIDENCE REVIEW
          </button>
        </div>

        {/* How to Play Accordion */}
        <div className="campus-accordion">
          <button
            type="button"
            className="campus-accordion-trigger"
            onClick={() => setShowHowToPlayDrawer(!showHowToPlayDrawer)}
          >
            <span>▶ HOW TO PLAY</span>
            <span>{showHowToPlayDrawer ? '▲' : '▼'}</span>
          </button>
          {showHowToPlayDrawer && (
            <div className="campus-accordion-content">
              <p>• <strong>W/A/S/D:</strong> Move avatar across the station platform.</p>
              <p>• <strong>Shift:</strong> Sprint.</p>
              <p>• <strong>E:</strong> Inspect Ticket Kiosk, Departure Board, or talk to NPCs.</p>
              <p>• <strong>M:</strong> View overhead concourse map & radar pins.</p>
              <p>• <strong>H:</strong> Trigger contextual mission objective hint.</p>
              <p>• <strong>P:</strong> Toggle Transit Phone PDA.</p>
            </div>
          )}
        </div>

        {/* Exit to Home Action */}
        <button
          type="button"
          className="campus-pause-btn campus-pause-btn--exit"
          onClick={() => {
            SoundEffects.playBlip();
            onExitHome();
          }}
        >
          EXIT TO HOME
        </button>
      </div>
    </Modal>
  );
};
