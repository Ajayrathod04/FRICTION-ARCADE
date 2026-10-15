import React from 'react';
import { Icons } from './ui/Icons';
import { Button } from './ui/Button';

interface HeaderProps {
  onStartMission: () => void;
  is2D: boolean;
  onToggle2D: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onStartMission,
  is2D,
  onToggle2D,
}) => {
  return (
    <header className="site-header" role="banner">
      <div className="header-inner">
        {/* Brand */}
        <a href="#hero" className="header-brand">
          <div className="brand-icon-box">
            <Icons.Gamepad size={22} color="#FFFFFF" />
          </div>
          <span className="brand-text">FRICTION ARCADE</span>
        </a>

        {/* Navigation */}
        <nav className="header-nav" aria-label="Main Navigation">
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <a href="#meet-station" className="nav-link">Meet Station</a>
          <a href="#design-rules" className="nav-link">Design Rules</a>
          <a href="#design-lab" className="nav-link">Design Lab</a>
        </nav>

        {/* Action Controls */}
        <div className="header-actions">
          <button
            type="button"
            className="a11y-pill-btn"
            onClick={onToggle2D}
            aria-label={is2D ? 'Switch to 3D station simulation' : 'Switch to accessible 2D view'}
          >
            <span className="a11y-pill-icon">{is2D ? '2D' : '3D'}</span>
            <span className="a11y-pill-text">{is2D ? 'Accessible 2D' : '3D Mode'}</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={onStartMission}
            className="btn-header-play"
          >
            PLAY NOW →
          </Button>
        </div>
      </div>
    </header>
  );
};
