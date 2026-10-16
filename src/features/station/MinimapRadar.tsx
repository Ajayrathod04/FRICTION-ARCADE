import React from 'react';
import { calculateWalkableRoute, STATION_WAYPOINTS } from '../../data/missionData';

interface MinimapRadarProps {
  playerX: number; // world x: [-4.2, 4.2]
  playerZ: number; // world z: [-3.8, 3.8]
  playerAngle: number; // player rotation in radians
  cluesFound: string[];
  onExpandMap: () => void;
  activeWaypointId?: string;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  playerX,
  playerZ,
  playerAngle,
  cluesFound,
  onExpandMap,
  activeWaypointId = 'wp-kiosk',
}) => {
  // Map world coordinates [-4.2, 4.2] -> [8, 92] % in SVG
  const toSvgX = (x: number) => {
    return Math.max(6, Math.min(94, ((x + 4.2) / 8.4) * 100));
  };

  const toSvgY = (z: number) => {
    return Math.max(8, Math.min(92, ((z + 3.8) / 7.6) * 100));
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

  // Calculate live route to active waypoint
  const currentTargetWp =
    STATION_WAYPOINTS.find((w) => w.id === activeWaypointId) ||
    STATION_WAYPOINTS.find((w) => w.hotspotId === (cluesFound.includes('kiosk') ? (cluesFound.includes('board') ? 'desk' : 'board') : 'kiosk')) ||
    STATION_WAYPOINTS[2];

  const routePoints = calculateWalkableRoute(playerX, playerZ, currentTargetWp.id);
  const routePathD = routePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(pt.z)}`)
    .join(' ');

  return (
    <div
      className="station-minimap-radar"
      onClick={onExpandMap}
      title="Click to open full station map (M)"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpandMap();
        }
      }}
      aria-label="Minimap: click to open full station map"
    >
      <div className="radar-header">
        <span className="radar-live-blip" />
        <span className="radar-title">CONCOURSE MAP · M</span>
      </div>

      <svg className="radar-svg" viewBox="0 0 100 100">
        {/* Background platform floor */}
        <rect x="5" y="8" width="90" height="84" fill="#241b34" rx="4" />

        {/* Platform 1 track & train area at top */}
        <rect x="5" y="8" width="90" height="16" fill="#14101e" />
        <line x1="5" y1="24" x2="95" y2="24" stroke="#ffd23f" strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Live Route Guide Line */}
        {routePathD && (
          <path
            d={routePathD}
            fill="none"
            stroke="#ffd23f"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
        )}

        {/* Checkpoint 1: Kiosk */}
        <circle
          cx={kioskX}
          cy={kioskY}
          r="4.2"
          className={`radar-pin radar-pin--kiosk ${cluesFound.includes('kiosk') ? 'is-done' : 'is-active'}`}
        />
        <text x={kioskX} y={kioskY + 1.2} className="radar-pin-text">
          1
        </text>

        {/* Checkpoint 2: Departure Board */}
        <circle
          cx={boardX}
          cy={boardY}
          r="4.2"
          className={`radar-pin radar-pin--board ${
            cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-active' : ''
          }`}
        />
        <text x={boardX} y={boardY + 1.2} className="radar-pin-text">
          2
        </text>

        {/* Checkpoint 3: Help Desk */}
        <circle
          cx={deskX}
          cy={deskY}
          r="4.2"
          className={`radar-pin radar-pin--desk ${
            cluesFound.includes('desk') ? 'is-done' : cluesFound.includes('board') ? 'is-active' : ''
          }`}
        />
        <text x={deskX} y={deskY + 1.2} className="radar-pin-text">
          3
        </text>

        {/* Player Blip with Direction Pointer */}
        <g transform={`translate(${pX}, ${pY})`}>
          <circle r="4" fill="none" stroke="#ff8a1f" strokeWidth="0.8" opacity="0.7" />
          <polygon
            points="0,-3.2 2.2,2.4 -2.2,2.4"
            fill="#ff8a1f"
            stroke="#17131f"
            strokeWidth="0.8"
            transform={`rotate(${deg})`}
          />
          <circle r="1.3" fill="#fff6e5" />
        </g>
      </svg>

      <div className="radar-footer">
        <span className="radar-target-name">{currentTargetWp.name}</span>
      </div>
    </div>
  );
};
