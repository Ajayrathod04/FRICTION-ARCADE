import React from 'react';

interface MinimapRadarProps {
  playerX: number; // world x: [-3.5, 3.5]
  playerZ: number; // world z: [-2.5, 3.5]
  playerAngle: number; // player rotation in radians
  cluesFound: string[];
  onExpandMap: () => void;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  playerX,
  playerZ,
  playerAngle,
  cluesFound,
  onExpandMap,
}) => {
  // Map world coordinates [-3.5, 3.5] -> [10, 90] % in SVG
  const toSvgX = (x: number) => {
    return Math.max(8, Math.min(92, ((x + 3.5) / 7.0) * 100));
  };

  const toSvgY = (z: number) => {
    return Math.max(8, Math.min(92, ((z + 2.5) / 6.0) * 100));
  };

  // Hotspots
  const kioskX = toSvgX(0);
  const kioskY = toSvgY(0);

  const boardX = toSvgX(2.4);
  const boardY = toSvgY(-1.2);

  const deskX = toSvgX(-2.4);
  const deskY = toSvgY(0.4);

  const pX = toSvgX(playerX);
  const pY = toSvgY(playerZ);

  // Rotation in degrees for player pointer
  const deg = (playerAngle * 180) / Math.PI;

  return (
    <div
      className="station-minimap-radar"
      onClick={onExpandMap}
      title="Click to expand concourse schematic (M)"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpandMap();
        }
      }}
      aria-label="Minimap radar: click to open full map"
    >
      <div className="radar-header">
        <span className="radar-live-blip" />
        <span className="radar-title">CONCOURSE RADAR</span>
      </div>

      <svg className="radar-svg" viewBox="0 0 100 100">
        {/* Radar background grid */}
        <circle cx="50" cy="50" r="46" className="radar-ring radar-ring--outer" />
        <circle cx="50" cy="50" r="30" className="radar-ring" />
        <circle cx="50" cy="50" r="15" className="radar-ring" />
        <line x1="50" y1="4" x2="50" y2="96" className="radar-grid-line" />
        <line x1="4" y1="50" x2="96" y2="50" className="radar-grid-line" />

        {/* Station platform track border */}
        <line x1="10" y1="88" x2="90" y2="88" className="radar-track-line" />
        <line x1="10" y1="92" x2="90" y2="92" className="radar-track-line" />

        {/* Hotspots */}
        {/* 1. Kiosk */}
        <circle
          cx={kioskX}
          cy={kioskY}
          r="4.5"
          className={`radar-pin radar-pin--kiosk ${cluesFound.includes('kiosk') ? 'is-done' : 'is-active'}`}
        />
        <text x={kioskX} y={kioskY + 1.5} className="radar-pin-text">1</text>

        {/* 2. Departure Board */}
        <circle
          cx={boardX}
          cy={boardY}
          r="4.5"
          className={`radar-pin radar-pin--board ${cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-active' : ''}`}
        />
        <text x={boardX} y={boardY + 1.5} className="radar-pin-text">2</text>

        {/* 3. Help Desk */}
        <circle
          cx={deskX}
          cy={deskY}
          r="4.5"
          className={`radar-pin radar-pin--desk ${cluesFound.includes('desk') ? 'is-done' : cluesFound.includes('board') ? 'is-active' : ''}`}
        />
        <text x={deskX} y={deskY + 1.5} className="radar-pin-text">3</text>

        {/* Player Blip with Direction Arrow */}
        <g transform={`translate(${pX}, ${pY}) rotate(${deg})`}>
          <circle cx="0" cy="0" r="4" className="radar-player-dot" />
          <polygon points="0,-7 3,-3 -3,-3" className="radar-player-arrow" />
        </g>
      </svg>

      <div className="radar-legend">
        <span className="legend-item"><span className="legend-symbol is-player">▲</span> YOU</span>
        <span className="legend-item"><span className="legend-symbol is-target">◆</span> CHECKPOINT</span>
      </div>
    </div>
  );
};
