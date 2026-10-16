import React from 'react';
import { Icons } from '../../components/ui/Icons';
import { SoundEffects } from '../../lib/audio';

interface TransitPhoneWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  cluesFound: string[];
  repairsCompleted: string[];
  onLaunchBooking: () => void;
  onOpenMap: () => void;
  onOpenDesignLab: () => void;
}

export const TransitPhoneWidget: React.FC<TransitPhoneWidgetProps> = ({
  isOpen,
  onClose,
  cluesFound,
  repairsCompleted,
  onLaunchBooking,
  onOpenMap,
  onOpenDesignLab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="transit-phone-overlay" role="dialog" aria-modal="true" aria-label="Transit Phone PDA">
      <div className="transit-phone-chassis">
        {/* Phone Notch & Status Bar */}
        <div className="phone-status-bar">
          <span className="phone-time">10:42</span>
          <div className="phone-notch" />
          <div className="phone-signals">
            <span className="signal-bar">5G</span>
            <span className="battery-icon">100%</span>
            <button
              type="button"
              className="phone-close-btn"
              onClick={onClose}
              aria-label="Close Transit Phone"
            >
              ✕
            </button>
          </div>
        </div>

        {/* App Content */}
        <div className="phone-screen-content">
          <div className="phone-app-header">
            <div className="phone-app-icon">
              <Icons.Train size={18} color="#FFD23F" />
            </div>
            <div>
              <h3 className="phone-app-name">FrictionPass</h3>
              <p className="phone-app-subtitle">MUMBAI TRANSIT NETWORK</p>
            </div>
          </div>

          {/* Current Mission Card */}
          <div className="phone-mission-card">
            <div className="phone-card-meta">
              <span className="phone-loc-pin">📍 Concourse Entrance</span>
              <span className="phone-thou-art">Thou art here</span>
            </div>
            <div className="phone-route-summary">
              <span className="route-city">MUMBAI</span>
              <span className="route-arrow">➔</span>
              <span className="route-city">PUNE</span>
            </div>
            <div className="phone-mission-details">
              <span>2 Passengers</span>
              <span>•</span>
              <span>Sat, 18 Oct 2026</span>
            </div>
          </div>

          {/* Clues & Stamps Ledger */}
          <div className="phone-stamps-section">
            <h4 className="phone-section-title">COLLECTED TICKET STAMPS</h4>
            <div className="phone-stamps-grid">
              <div className={`phone-stamp-pill ${cluesFound.includes('kiosk') ? 'is-collected' : ''}`}>
                <span className="stamp-status">{cluesFound.includes('kiosk') ? '✓' : '○'}</span>
                <span>1. Kiosk Label</span>
              </div>
              <div className={`phone-stamp-pill ${cluesFound.includes('board') ? 'is-collected' : ''}`}>
                <span className="stamp-status">{cluesFound.includes('board') ? '✓' : '○'}</span>
                <span>2. Board Status</span>
              </div>
              <div className={`phone-stamp-pill ${cluesFound.includes('desk') ? 'is-collected' : ''}`}>
                <span className="stamp-status">{cluesFound.includes('desk') ? '✓' : '○'}</span>
                <span>3. Help Actions</span>
              </div>
            </div>
          </div>

          {/* Clarity Repairs Status */}
          {repairsCompleted.length > 0 && (
            <div className="phone-repairs-banner">
              <span className="repairs-icon">✨</span>
              <span><strong>{repairsCompleted.length}/3 UX Repairs</strong> Applied</span>
            </div>
          )}

          {/* Quick Action Button */}
          <div className="phone-action-container">
            <button
              type="button"
              className="phone-primary-cta"
              onClick={() => {
                SoundEffects.playBlip();
                onClose();
                if (cluesFound.length === 3) {
                  onLaunchBooking();
                } else {
                  onOpenMap();
                }
              }}
            >
              {cluesFound.length === 3
                ? 'START BOOKING CHALLENGE ➔'
                : `FIND ALL CLUES (${cluesFound.length}/3 STAMPS) ➔`}
            </button>
            <div className="phone-secondary-row">
              <button
                type="button"
                className="phone-sec-btn"
                onClick={() => {
                  SoundEffects.playBlip();
                  onClose();
                  onOpenMap();
                }}
              >
                🗺 View Map (M)
              </button>
              <button
                type="button"
                className="phone-sec-btn"
                onClick={() => {
                  SoundEffects.playBlip();
                  onClose();
                  onOpenDesignLab();
                }}
              >
                🧪 Design Lab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
