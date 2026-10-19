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
  // Map world coordinates [-8.8, 8.8] X -> [6, 94] % in SVG
  const toSvgX = (x: number) => {
    return Math.max(6, Math.min(94, ((x + 8.8) / 17.6) * 84 + 8));
  };

  // Map world coordinates [-8.2, 11.4] Z -> [4, 96] % in SVG (including Platform 2)
  const toSvgY = (z: number) => {
    return Math.max(4, Math.min(96, ((z + 8.2) / 19.6) * 88 + 6));
  };

  // Hotspots: Kiosk (R1), Board (R2), Desk (R3)
  const kioskX = toSvgX(0);
  const kioskY = toSvgY(0.2);

  const boardX = toSvgX(5.4);
  const boardY = toSvgY(-0.4);

  const deskX = toSvgX(-5.4);
  const deskY = toSvgY(0.2);

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
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.z).toFixed(1)}`)
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
        <span className="radar-title">WORLD RADAR · M</span>
      </div>

      <svg className="radar-svg" viewBox="0 0 100 100">
        {/* Background container */}
        <rect x="0" y="0" width="100" height="100" fill="#14101e" rx="4" />

        {/* Platform 2 (Opposite North Platform: z = -8.2 to -6.6) */}
        <rect x={toSvgX(-8.4)} y={toSvgY(-8.2)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(-6.6) - toSvgY(-8.2)} fill="#0f2924" stroke="#0d9488" strokeWidth="0.8" />
        <line x1={toSvgX(-8.4)} y1={toSvgY(-6.65)} x2={toSvgX(8.4)} y2={toSvgY(-6.65)} stroke="#ffd23f" strokeWidth="0.9" strokeDasharray="2 1.5" />
        <text x={toSvgX(-7.4)} y={toSvgY(-7.2)} fill="#2dd4bf" fontSize="2.8" fontWeight="bold">P2</text>

        {/* Track 2 & Rajdhani Express (z = -5.8) */}
        <line x1={toSvgX(-8.4)} y1={toSvgY(-5.8)} x2={toSvgX(8.4)} y2={toSvgY(-5.8)} stroke="#38bdf8" strokeWidth="0.9" strokeDasharray="3 2" />

        {/* West Level Crossing (x in [-7.2, -5.2], z in [-6.6, -3.8]) */}
        <rect x={toSvgX(-7.2)} y={toSvgY(-6.6)} width={toSvgX(-5.2) - toSvgX(-7.2)} height={toSvgY(-3.8) - toSvgY(-6.6)} fill="#422006" stroke="#ffd23f" strokeWidth="0.6" strokeDasharray="1.5 1" />

        {/* East Covered Footbridge (x in [5.2, 7.2], z in [-6.6, -3.8]) */}
        <rect x={toSvgX(5.2)} y={toSvgY(-6.6)} width={toSvgX(7.2) - toSvgX(5.2)} height={toSvgY(-3.8) - toSvgY(-6.6)} fill="#2e1065" stroke="#c084fc" strokeWidth="0.6" />

        {/* Track 1 & Deccan Express (z = -4.6) */}
        <line x1={toSvgX(-8.4)} y1={toSvgY(-4.6)} x2={toSvgX(8.4)} y2={toSvgY(-4.6)} stroke="#ffd23f" strokeWidth="0.9" strokeDasharray="3 2" />

        {/* Platform 1 (Main South Platform: z = -3.8 to -1.8) */}
        <rect x={toSvgX(-8.4)} y={toSvgY(-3.8)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(-1.8) - toSvgY(-3.8)} fill="#1a1524" stroke="#4a4060" strokeWidth="0.8" />
        <line x1={toSvgX(-8.4)} y1={toSvgY(-3.75)} x2={toSvgX(8.4)} y2={toSvgY(-3.75)} stroke="#ffd23f" strokeWidth="0.9" strokeDasharray="2 1.5" />
        <text x={toSvgX(-7.4)} y={toSvgY(-2.6)} fill="#fbbf24" fontSize="2.8" fontWeight="bold">P1</text>

        {/* 5 Physical Rooms schematic outlines */}
        {/* Room 3: Passenger Services */}
        <rect x={toSvgX(-8.4)} y={toSvgY(-1.6)} width={toSvgX(-3.0) - toSvgX(-8.4)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#281a24" stroke="#ec4899" strokeWidth="0.8" />
        {/* Room 1: Ticket Concourse */}
        <rect x={toSvgX(-2.8)} y={toSvgY(-1.6)} width={toSvgX(2.8) - toSvgX(-2.8)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#1c1b30" stroke="#ffd23f" strokeWidth="1.0" />
        {/* Room 2: Departure Gallery */}
        <rect x={toSvgX(3.0)} y={toSvgY(-1.6)} width={toSvgX(8.4) - toSvgX(3.0)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#162238" stroke="#3b82f6" strokeWidth="0.8" />
        {/* Grand Atrium */}
        <rect x={toSvgX(-2.8)} y={toSvgY(1.8)} width={toSvgX(2.8) - toSvgX(-2.8)} height={toSvgY(4.4) - toSvgY(1.8)} fill="#192c27" stroke="#10b981" strokeWidth="0.8" />
        {/* Crimson Ceremonial Carpet Runner */}
        <rect x={toSvgX(-0.75)} y={toSvgY(2.0)} width={toSvgX(0.75) - toSvgX(-0.75)} height={toSvgY(4.4) - toSvgY(2.0)} fill="#8f152b" stroke="#ffd23f" strokeWidth="0.6" rx="0.5" />
        {/* Two Feature Benches */}
        <rect x={toSvgX(-2.05)} y={toSvgY(2.7)} width={toSvgX(-1.65) - toSvgX(-2.05)} height={toSvgY(3.9) - toSvgY(2.7)} fill="#78350f" stroke="#a7f3d0" strokeWidth="0.5" />
        <rect x={toSvgX(1.65)} y={toSvgY(2.7)} width={toSvgX(2.05) - toSvgX(1.65)} height={toSvgY(3.9) - toSvgY(2.7)} fill="#78350f" stroke="#a7f3d0" strokeWidth="0.5" />
        {/* Room 4: Waiting Lounge */}
        <rect x={toSvgX(-8.4)} y={toSvgY(1.8)} width={toSvgX(-3.0) - toSvgX(-8.4)} height={toSvgY(5.0) - toSvgY(1.8)} fill="#2a1f18" stroke="#f97316" strokeWidth="0.8" />
        {/* Room 5: Designer Workshop */}
        <rect x={toSvgX(3.0)} y={toSvgY(1.8)} width={toSvgX(8.4) - toSvgX(3.0)} height={toSvgY(5.0) - toSvgY(1.8)} fill="#2a1832" stroke="#a855f7" strokeWidth="0.8" />
        {/* Arrival Plaza */}
        <rect x={toSvgX(-8.4)} y={toSvgY(4.4)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(8.8) - toSvgY(4.4)} fill="#201b2a" stroke="#3d3356" strokeWidth="0.6" />
        {/* City Street */}
        <rect x={toSvgX(-8.4)} y={toSvgY(8.8)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(11.4) - toSvgY(8.8)} fill="#16131c" stroke="#ffd23f" strokeWidth="0.6" strokeDasharray="2 2" />

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

        {/* Checkpoint 1: Kiosk (Room 1) */}
        <circle
          cx={kioskX}
          cy={kioskY}
          r="4.0"
          className={`radar-pin radar-pin--kiosk ${cluesFound.includes('kiosk') ? 'is-done' : 'is-active'}`}
        />
        <text x={kioskX} y={kioskY + 1.2} className="radar-pin-text">
          1
        </text>

        {/* Checkpoint 2: Departure Board (Room 2) */}
        <circle
          cx={boardX}
          cy={boardY}
          r="4.0"
          className={`radar-pin radar-pin--board ${
            cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-active' : ''
          }`}
        />
        <text x={boardX} y={boardY + 1.2} className="radar-pin-text">
          2
        </text>

        {/* Checkpoint 3: Help Desk (Room 3) */}
        <circle
          cx={deskX}
          cy={deskY}
          r="4.0"
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
