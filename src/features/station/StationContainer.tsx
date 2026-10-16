import React, { useState, useEffect } from 'react';
import { StationCanvas } from './StationCanvas';
import { StationFallback } from './StationFallback';
import { isWebGLAvailable } from '../../lib/a11y';
import type { StationNPC } from '../../data/missionData';

interface StationContainerProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  onTriggerEcho?: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
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
  onLaunchBookingChallenge?: () => void;
  onOpenHowToPlay?: () => void;
  onOpenDuoJam?: () => void;
  onOpenDesignLab?: () => void;
  activeWaypointId?: string;
  onSetWaypoint?: (wpId: string) => void;
  onPlayerCoordsChange?: (coords: { x: number; z: number; angle: number }) => void;
  isFrictionVision?: boolean;
  onToggleFrictionVision?: () => void;
  isBoarding?: boolean;
}

export const StationContainer: React.FC<StationContainerProps> = ({
  onSelectHotspot,
  onTriggerEcho,
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
  onLaunchBookingChallenge,
  onOpenHowToPlay,
  onOpenDuoJam,
  onOpenDesignLab,
  activeWaypointId = 'wp-kiosk',
  onSetWaypoint,
  onPlayerCoordsChange,
  isFrictionVision = false,
  onToggleFrictionVision,
  isBoarding = false,
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
            {show3D ? '3D STATION CONCOURSE' : '2D ACCESSIBLE CONCOURSE'}
          </span>
          <span className="station-clue-counter">
            {cluesFound.length}/3 STAMPS DISCOVERED
          </span>
          {repairsCompleted.length > 0 && (
            <span className="station-clarity-counter">
              ✨ CLARITY MODE: {repairsCompleted.length}/3 REPAIRED
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
              {show3D ? 'Accessible 2D Mode' : '3D Concourse'}
            </button>
          )}
        </div>
      </div>

      <div className="station-viewport-canvas">
        {show3D ? (
          <StationCanvas
            onSelectHotspot={onSelectHotspot}
            onTriggerEcho={onTriggerEcho}
            cluesFound={cluesFound}
            repairsCompleted={repairsCompleted}
            repairsComplete={repairsComplete}
            activeHotspot={activeHotspot}
            selectedAvatarId={selectedAvatarId}
            onTalkToNPC={onTalkToNPC}
            onToggleMap={onToggleMap}
            onShowHint={onShowHint}
            onLaunchBookingChallenge={onLaunchBookingChallenge}
            onOpenHowToPlay={onOpenHowToPlay}
            onOpenDuoJam={onOpenDuoJam}
            onOpenDesignLab={onOpenDesignLab}
            activeWaypointId={activeWaypointId}
            onPlayerCoordsChange={onPlayerCoordsChange}
            isFrictionVision={isFrictionVision}
            onToggleFrictionVision={onToggleFrictionVision}
            isBoarding={isBoarding}
          />
        ) : (
          <StationFallback
            onSelectHotspot={onSelectHotspot}
            onTriggerEcho={onTriggerEcho}
            cluesFound={cluesFound}
            repairsComplete={repairsComplete}
            activeHotspot={activeHotspot}
          />
        )}
      </div>

      {/* Enhanced Control Help Bar */}
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
            <kbd className="key-cap">Shift</kbd>
            <span className="control-label">Sprint</span>
          </span>
          <span className="control-item">
            <kbd className="key-cap">E</kbd>
            <span className="control-label">Inspect</span>
          </span>
          <span className="control-item control-item--echo">
            <kbd className="key-cap" style={{ background: '#ffd23f', color: '#17131f' }}>Q</kbd>
            <span className="control-label" style={{ fontWeight: 700, color: '#ffd23f' }}>Friction Echo</span>
          </span>
          {onToggleMap && (
            <span className="control-item">
              <kbd className="key-cap">M</kbd>
              <span className="control-label">Map</span>
            </span>
          )}
          <span className="control-item">
            <kbd className="key-cap">P</kbd>
            <span className="control-label">PDA</span>
          </span>
          {onShowHint && (
            <span className="control-item">
              <kbd className="key-cap">H</kbd>
              <span className="control-label">Hint</span>
            </span>
          )}
          <span className="control-item control-item--mobile">
            <span className="control-label">Tap any glowing landmark or NPC to inspect</span>
          </span>
        </div>
      </div>
    </div>
  );
};
