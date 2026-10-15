import React, { useState, useEffect } from 'react';
import { StationCanvas } from './StationCanvas';
import { StationFallback } from './StationFallback';
import { isWebGLAvailable } from '../../lib/a11y';
import type { StationNPC } from '../../data/missionData';

interface StationContainerProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsCompleted?: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
  force2D?: boolean;
  onToggle2D?: () => void;
  selectedAvatarId?: 'explorer' | 'creative' | 'analyst';
  onTalkToNPC?: (npc: StationNPC) => void;
  onToggleMap?: () => void;
  onShowHint?: () => void;
}

export const StationContainer: React.FC<StationContainerProps> = ({
  onSelectHotspot,
  cluesFound,
  repairsCompleted = [],
  repairsComplete,
  activeHotspot,
  force2D = false,
  onToggle2D,
  selectedAvatarId = 'explorer',
  onTalkToNPC,
  onToggleMap,
  onShowHint,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setHasWebGL(isWebGLAvailable());
  }, []);

  const show3D = hasWebGL && !force2D;

  return (
    <div className="station-viewport-wrapper">
      <div className="station-viewport-header">
        <div className="station-viewport-meta">
          <span className="station-live-dot" />
          <span className="station-live-title">
            {show3D ? '3D STATION SIMULATION' : '2D ACCESSIBLE VIEW'}
          </span>
          <span className="station-clue-counter">
            {cluesFound.length}/3 FRICTION CLUES
          </span>
          {repairsCompleted.length > 0 && (
            <span className="station-clarity-counter">
              ✨ CLARITY: {repairsCompleted.length}/3 FIXED
            </span>
          )}
        </div>

        <div className="station-viewport-actions">
          {hasWebGL && onToggle2D && (
            <button
              className="view-mode-toggle-btn"
              onClick={onToggle2D}
              aria-label={show3D ? 'Switch to accessible 2D view' : 'Switch to 3D world'}
            >
              {show3D ? 'View 2D Map' : 'View 3D Station'}
            </button>
          )}
        </div>
      </div>

      <div className="station-viewport-canvas">
        {show3D ? (
          <StationCanvas
            onSelectHotspot={onSelectHotspot}
            cluesFound={cluesFound}
            repairsCompleted={repairsCompleted}
            repairsComplete={repairsComplete}
            activeHotspot={activeHotspot}
            selectedAvatarId={selectedAvatarId}
            onTalkToNPC={onTalkToNPC}
            onToggleMap={onToggleMap}
            onShowHint={onShowHint}
          />
        ) : (
          <StationFallback
            onSelectHotspot={onSelectHotspot}
            cluesFound={cluesFound}
            repairsComplete={repairsComplete}
            activeHotspot={activeHotspot}
          />
        )}
      </div>

      {/* Control Help Bar */}
      <div className="station-viewport-footer">
        <div className="control-strip">
          <span className="control-item">
            <kbd className="key-cap">W</kbd>
            <kbd className="key-cap">A</kbd>
            <kbd className="key-cap">S</kbd>
            <kbd className="key-cap">D</kbd>
            <span className="control-label">Move</span>
          </span>
          <span className="control-item">
            <kbd className="key-cap">E</kbd>
            <span className="control-label">Interact</span>
          </span>
          <span className="control-item">
            <kbd className="key-cap">Shift</kbd>
            <span className="control-label">Sprint</span>
          </span>
          {onToggleMap && (
            <span className="control-item">
              <kbd className="key-cap">M</kbd>
              <span className="control-label">Map</span>
            </span>
          )}
          {onShowHint && (
            <span className="control-item">
              <kbd className="key-cap">H</kbd>
              <span className="control-label">Hint</span>
            </span>
          )}
          <span className="control-item control-item--mobile">
            <span className="control-label">Tap any glowing hotspot or character to inspect</span>
          </span>
        </div>
      </div>
    </div>
  );
};
