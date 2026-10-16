import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { STATION_WAYPOINTS, STATION_NPCS, calculateWalkableRoute } from '../../data/missionData';
import type { StationWaypoint } from '../../data/missionData';
import { SoundEffects } from '../../lib/audio';

interface StationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  cluesFound: string[];
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  playerX?: number;
  playerZ?: number;
  playerAngle?: number;
  activeWaypointId?: string;
  onSetWaypoint?: (waypointId: string) => void;
}

export const StationMapModal: React.FC<StationMapModalProps> = ({
  isOpen,
  onClose,
  cluesFound,
  onSelectHotspot,
  playerX = 0.2,
  playerZ = 2.2,
  playerAngle = 0,
  activeWaypointId = 'wp-kiosk',
  onSetWaypoint,
}) => {
  const [selectedWpId, setSelectedWpId] = useState<string>(activeWaypointId);

  // World coordinates [-4.2, 4.2] -> [5, 95] % X
  const toSvgX = (x: number) => {
    return Math.max(6, Math.min(94, ((x + 4.2) / 8.4) * 100));
  };

  // World coordinates [-3.8, 3.8] -> [8, 92] % Y
  const toSvgY = (z: number) => {
    return Math.max(8, Math.min(92, ((z + 3.8) / 7.6) * 100));
  };

  const pSvgX = toSvgX(playerX);
  const pSvgY = toSvgY(playerZ);
  const pDeg = (playerAngle * 180) / Math.PI;

  const currentWp = STATION_WAYPOINTS.find((w) => w.id === selectedWpId) || STATION_WAYPOINTS[2];

  // Calculate live route from player to selected waypoint
  const routePoints = calculateWalkableRoute(playerX, playerZ, currentWp.id);
  const svgPathD = routePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x)} ${toSvgY(pt.z)}`)
    .join(' ');

  const handleSelectWp = (wp: StationWaypoint) => {
    setSelectedWpId(wp.id);
    onSetWaypoint?.(wp.id);
    SoundEffects.playBlip();
  };

  const handleGoToHotspot = () => {
    if (currentWp.hotspotId) {
      onClose();
      onSelectHotspot(currentWp.hotspotId);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="STATION CONCOURSE TOP-DOWN MAP"
      badge="OVERHEAD NAVIGATION · KEY M"
      maxWidth="780px"
    >
      <div className="station-map-modal-content">
        <div className="station-map-meta-strip">
          <span>
            Click any landmark to set it as your <strong>Active Waypoint</strong>. Route guidance displays along safe walkable paths.
          </span>
          <Badge variant="sticker" color="#FFD23F">
            {cluesFound.length}/3 STAMPS COLLECTED
          </Badge>
        </div>

        {/* 2D Overhead Schematic Plan matching 3D world geometry */}
        <div className="schematic-map" style={{ position: 'relative', height: '360px', background: '#1c1729', borderRadius: '12px', border: '3px solid #17131f', overflow: 'hidden' }}>
          <svg className="schematic-svg-grid" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Background platform floor */}
            <rect x="5" y="8" width="90" height="84" fill="#261d36" rx="4" />

            {/* Platform 1 Track Bed and Rails (Top area: z = -4.6 to -3.0) */}
            <rect x="5" y="8" width="90" height="18" fill="#14101e" />
            <line x1="5" y1="12" x2="95" y2="12" stroke="#4a4060" strokeWidth="0.8" />
            <line x1="5" y1="17" x2="95" y2="17" stroke="#4a4060" strokeWidth="0.8" />
            <line x1="5" y1="24" x2="95" y2="24" stroke="#ffd23f" strokeWidth="1.2" strokeDasharray="3 2" />

            {/* Train representation on Platform 1 */}
            <rect x="8" y="9.5" width="84" height="6" fill="#ff8a1f" rx="1.5" />
            <text x="50" y="14" fill="#17131f" fontSize="3" fontWeight="bold" textAnchor="middle">
              PLATFORM 01 · DECCAN EXPRESS (TO PUNE)
            </text>

            {/* Walking Path Connectors (Graph edges) */}
            {STATION_WAYPOINTS.map((wp) =>
              wp.connectedIds.map((cId) => {
                const target = STATION_WAYPOINTS.find((t) => t.id === cId);
                if (!target || wp.id > target.id) return null;
                return (
                  <line
                    key={`${wp.id}-${target.id}`}
                    x1={toSvgX(wp.x)}
                    y1={toSvgY(wp.z)}
                    x2={toSvgX(target.x)}
                    y2={toSvgY(target.z)}
                    stroke="#382e4f"
                    strokeWidth="1.2"
                    strokeDasharray="2 1.5"
                  />
                );
              })
            )}

            {/* Active Walkable Route Line */}
            {svgPathD && (
              <path
                d={svgPathD}
                fill="none"
                stroke="#ffd23f"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                className="schematic-route-line"
              />
            )}

            {/* In-World NPCs Markers */}
            {/* Waypoints / Landmarks (Rendered first with crisp pill labels) */}
            {STATION_WAYPOINTS.map((wp) => {
              const wx = toSvgX(wp.x);
              const wy = toSvgY(wp.z);
              const isSelected = selectedWpId === wp.id;
              const isClueDone = wp.hotspotId && cluesFound.includes(wp.hotspotId);
              const isCheckpoint = !!wp.hotspotId;

              const pinColor = isClueDone
                ? '#059669'
                : isSelected
                ? '#ffd23f'
                : isCheckpoint
                ? '#ff3d8b'
                : '#c7b5ff';

              // Dynamic label offset based on landmark location to prevent overlapping
              let labelOffsetX = 0;
              let labelOffsetY = isCheckpoint ? 7.0 : 5.5;
              let textAnchor: 'middle' | 'start' | 'end' = 'middle';

              if (wp.id === 'wp-desk') {
                labelOffsetX = -2;
                labelOffsetY = 6.5;
              } else if (wp.id === 'wp-board') {
                labelOffsetX = 2;
                labelOffsetY = 6.5;
              } else if (wp.id === 'wp-gate' || wp.id === 'wp-train') {
                labelOffsetY = -5.0;
              }

              return (
                <g
                  key={wp.id}
                  transform={`translate(${wx}, ${wy})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectWp(wp)}
                >
                  {/* Pin Circle */}
                  <circle
                    r={isSelected ? 4.2 : isCheckpoint ? 3.4 : 2.2}
                    fill={pinColor}
                    stroke="#17131f"
                    strokeWidth={isSelected ? 1.6 : 1.0}
                  />
                  {isCheckpoint && (
                    <text y="1.2" fontSize="2.6" fill="#17131f" fontWeight="bold" textAnchor="middle">
                      {wp.hotspotId === 'kiosk' ? '1' : wp.hotspotId === 'board' ? '2' : '3'}
                    </text>
                  )}

                  {/* High-Contrast Pill Background for Text (prevents overlapping clutter) */}
                  <g transform={`translate(${labelOffsetX}, ${labelOffsetY})`}>
                    <rect
                      x={-wp.name.length * 1.3}
                      y="-2.8"
                      width={wp.name.length * 2.6}
                      height="4.2"
                      rx="2.1"
                      fill="#17131f"
                      stroke={isSelected ? '#ffd23f' : isCheckpoint ? pinColor : '#4a4060'}
                      strokeWidth={isSelected ? '0.9' : '0.5'}
                    />
                    <text
                      y="0.3"
                      fontSize="2.2"
                      fill={isSelected ? '#ffd23f' : isCheckpoint ? '#fff6e5' : '#c7b5ff'}
                      fontWeight="700"
                      textAnchor={textAnchor}
                    >
                      {wp.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* In-World NPCs Markers (Placed with distinct cyan badges and non-overlapping tags) */}
            {STATION_NPCS.map((npc) => {
              const nx = toSvgX(npc.position.x);
              const ny = toSvgY(npc.position.z);
              return (
                <g key={npc.id} transform={`translate(${nx}, ${ny})`}>
                  <circle r="2.0" fill="#8ddcff" stroke="#17131f" strokeWidth="0.8" />
                  <text y="0.8" fontSize="1.8" fill="#17131f" fontWeight="bold" textAnchor="middle">
                    👤
                  </text>
                  <rect
                    x={-npc.name.length * 1.1}
                    y="-5.4"
                    width={npc.name.length * 2.2}
                    height="3.6"
                    rx="1.8"
                    fill="#17131f"
                    stroke="#8ddcff"
                    strokeWidth="0.5"
                  />
                  <text y="-3.0" fontSize="1.8" fill="#8ddcff" fontWeight="bold" textAnchor="middle">
                    {npc.name}
                  </text>
                </g>
              );
            })}

            {/* Player Blip with Direction Cone */}
            <g transform={`translate(${pSvgX}, ${pSvgY})`}>
              {/* Outer pulse */}
              <circle r="4.2" fill="none" stroke="#ff8a1f" strokeWidth="0.6" opacity="0.6" />
              {/* Direction Pointer */}
              <polygon
                points="0,-3.2 2.2,2.4 -2.2,2.4"
                fill="#ff8a1f"
                stroke="#17131f"
                strokeWidth="0.8"
                transform={`rotate(${pDeg})`}
              />
              <circle r="1.4" fill="#fff6e5" />
            </g>
          </svg>
        </div>

        {/* Selected Waypoint Info Strip */}
        <div className="station-waypoint-info-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#fff6e5', border: '3px solid #17131f', borderRadius: '10px', marginTop: '12px', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, background: '#ffd23f', padding: '2px 8px', borderRadius: '4px', border: '1.5px solid #17131f' }}>
                WAYPOINT
              </span>
              <strong style={{ fontSize: '16px', color: '#17131f' }}>{currentWp.name}</strong>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#4a4060' }}>{currentWp.description}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {currentWp.hotspotId && (
              <Button variant="primary" size="sm" onClick={handleGoToHotspot}>
                Inspect Landmark →
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Resume Exploring
            </Button>
          </div>
        </div>

        <div className="station-map-legend" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#17131f', fontWeight: 600 }}>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff8a1f', border: '2px solid #17131f', display: 'inline-block' }} />
            <span>Player Location</span>
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff3d8b', border: '2px solid #17131f', display: 'inline-block' }} />
            <span>Mission Checkpoint (1, 2, 3)</span>
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#059669', border: '2px solid #17131f', display: 'inline-block' }} />
            <span>Evidence Diagnosed ✓</span>
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8ddcff', border: '2px solid #17131f', display: 'inline-block' }} />
            <span>Station NPC</span>
          </div>
          <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '20px', height: '4px', background: '#ffd23f', display: 'inline-block', border: '1px solid #17131f' }} />
            <span>Active Walkable Route Line</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
