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
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleZoomIn = () => {
    SoundEffects.playBlip();
    setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    SoundEffects.playBlip();
    setZoom((z) => {
      const next = Math.max(1.0, +(z - 0.25).toFixed(2));
      if (next === 1.0) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    SoundEffects.playBlip();
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1.0) {
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1.0) {
      const maxPan = (zoom - 1.0) * 160;
      const nextX = Math.max(-maxPan, Math.min(maxPan, e.clientX - dragStartRef.current.x));
      const nextY = Math.max(-maxPan, Math.min(maxPan, e.clientY - dragStartRef.current.y));
      setPan({ x: nextX, y: nextY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // World coordinates [-8.8, 8.8] X -> [6, 94] % X
  const toSvgX = (x: number) => {
    return Math.max(6, Math.min(94, ((x + 8.8) / 17.6) * 84 + 8));
  };

  // World coordinates [-8.2, 11.4] Z -> [4, 96] % Y (accommodating Platform 2 and dual tracks)
  const toSvgY = (z: number) => {
    return Math.max(4, Math.min(96, ((z + 8.2) / 19.6) * 88 + 6));
  };

  const pSvgX = toSvgX(playerX);
  const pSvgY = toSvgY(playerZ);
  const pDeg = (playerAngle * 180) / Math.PI;

  const currentWp = STATION_WAYPOINTS.find((w) => w.id === selectedWpId) || STATION_WAYPOINTS[2];

  // Calculate live route from player to selected waypoint
  const routePoints = calculateWalkableRoute(playerX, playerZ, currentWp.id);
  const svgPathD = routePoints
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(pt.x).toFixed(1)} ${toSvgY(pt.z).toFixed(1)}`)
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
      title="FRICTION CENTRAL · 5-ROOM WORLD MAP"
      badge="OVERHEAD NAVIGATION · KEY M"
      maxWidth="840px"
    >
      <div className="station-map-modal-content">
        <div className="station-map-meta-strip">
          <span>
            Click any landmark to set <strong>Active Waypoint</strong>. Walk through open doors between the 5 physical rooms, plaza and platform.
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="sticker" color="#FFD23F">
              {cluesFound.length}/3 STAMPS COLLECTED
            </Badge>
          </div>
        </div>

        {/* 2D Overhead Schematic Plan matching the 5-room 3D world geometry */}
        <div
          className="schematic-map"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'relative',
            height: '420px',
            background: '#120f1b',
            borderRadius: '12px',
            border: '3px solid #17131f',
            overflow: 'hidden',
            cursor: zoom > 1.0 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {/* Floating Zoom & Pan Controls */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              display: 'flex',
              gap: '6px',
              background: 'rgba(23, 19, 31, 0.88)',
              padding: '4px',
              borderRadius: '8px',
              border: '2px solid #ffd23f',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            <button
              type="button"
              onClick={handleZoomIn}
              style={{
                width: '32px',
                height: '32px',
                background: '#ffd23f',
                color: '#17131f',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 900,
                fontSize: '18px',
                cursor: 'pointer',
              }}
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              style={{
                width: '32px',
                height: '32px',
                background: '#ffd23f',
                color: '#17131f',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 900,
                fontSize: '18px',
                cursor: 'pointer',
              }}
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              style={{
                padding: '0 10px',
                height: '32px',
                background: '#1e293b',
                color: '#ffd23f',
                border: '1px solid #ffd23f',
                borderRadius: '6px',
                fontWeight: 800,
                fontSize: '11px',
                cursor: 'pointer',
              }}
              title="Reset Zoom"
            >
              {(zoom * 100).toFixed(0)}%
            </button>
          </div>

          <svg
            className="schematic-svg-grid"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* Base Background */}
            <rect x="0" y="0" width="100" height="100" fill="#120f1b" />

            {/* Zone 0: Mumbai City Street (Bottom: z = 8.8 to 11.4) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(8.8)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(11.4) - toSvgY(8.8)} fill="#1a1824" stroke="#2e273f" strokeWidth="0.8" />
            <line x1={toSvgX(-8.4)} y1={toSvgY(10.1)} x2={toSvgX(8.4)} y2={toSvgY(10.1)} stroke="#ffd23f" strokeWidth="0.7" strokeDasharray="3 2" />
            {/* Zebra Crossing */}
            <rect x={toSvgX(-1.5)} y={toSvgY(8.8)} width={toSvgX(1.5) - toSvgX(-1.5)} height={toSvgY(10.8) - toSvgY(8.8)} fill="#252136" />
            <line x1={toSvgX(-1.2)} y1={toSvgY(9.2)} x2={toSvgX(1.2)} y2={toSvgY(9.2)} stroke="#ffffff" strokeWidth="1.0" />
            <line x1={toSvgX(-1.2)} y1={toSvgY(9.8)} x2={toSvgX(1.2)} y2={toSvgY(9.8)} stroke="#ffffff" strokeWidth="1.0" />
            <line x1={toSvgX(-1.2)} y1={toSvgY(10.4)} x2={toSvgX(1.2)} y2={toSvgY(10.4)} stroke="#ffffff" strokeWidth="1.0" />
            <text x={toSvgX(0)} y={toSvgY(11.0)} fill="#8c829e" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              CITY STREET · VEHICLE ROUTE & START SPAWN
            </text>

            {/* Zone 1: Arrival Plaza (z = 4.4 to 8.8) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(4.4)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(8.8) - toSvgY(4.4)} fill="#221c30" stroke="#3d3356" strokeWidth="0.8" />
            <text x={toSvgX(0)} y={toSvgY(6.8)} fill="#a79ac0" fontSize="2.4" fontWeight="bold" textAnchor="middle">
              ARRIVAL FORECOURT & GARDEN PLAZA
            </text>

            {/* Entrance Facade Gate (z = 4.4, open gate at x = -2.4 to 2.4) */}
            <line x1={toSvgX(-8.4)} y1={toSvgY(4.4)} x2={toSvgX(-2.4)} y2={toSvgY(4.4)} stroke="#ffaa33" strokeWidth="1.8" />
            <line x1={toSvgX(2.4)} y1={toSvgY(4.4)} x2={toSvgX(8.4)} y2={toSvgY(4.4)} stroke="#ffaa33" strokeWidth="1.8" />
            {/* Open Gate Doorway Indicator */}
            <rect x={toSvgX(-2.4)} y={toSvgY(4.2)} width={toSvgX(2.4) - toSvgX(-2.4)} height={toSvgY(4.6) - toSvgY(4.2)} fill="#059669" opacity="0.4" />
            <text x={toSvgX(0)} y={toSvgY(4.3)} fill="#10b981" fontSize="2.0" fontWeight="bold" textAnchor="middle">
              OPEN GATE: FRICTION CENTRAL
            </text>

            {/* Zone 2: Grand Victorian Atrium (Center Hub: x = -2.8 to 2.8, z = 1.8 to 4.4) */}
            <rect x={toSvgX(-2.8)} y={toSvgY(1.8)} width={toSvgX(2.8) - toSvgX(-2.8)} height={toSvgY(4.4) - toSvgY(1.8)} fill="#192c27" stroke="#10b981" strokeWidth="1.0" />
            <text x={toSvgX(0)} y={toSvgY(2.2)} fill="#34d399" fontSize="2.3" fontWeight="bold" textAnchor="middle">
              GRAND ATRIUM (HUB)
            </text>
            <text x={toSvgX(1.8)} y={toSvgY(2.5)} fill="#ffd23f" fontSize="1.8" fontWeight="bold">
              CLOCK
            </text>

            {/* Deep-Crimson Ceremonial Carpet Runner with Gold Border (z = 2.0 to 4.4) */}
            <rect
              x={toSvgX(-0.75)}
              y={toSvgY(2.0)}
              width={toSvgX(0.75) - toSvgX(-0.75)}
              height={toSvgY(4.4) - toSvgY(2.0)}
              fill="#8f152b"
              stroke="#ffd23f"
              strokeWidth="0.9"
              rx="0.5"
            />
            <text x={toSvgX(0)} y={toSvgY(3.3)} fill="#ffd23f" fontSize="1.7" fontWeight="bold" textAnchor="middle">
              CRIMSON RUNNER
            </text>

            {/* Exactly Two Premium Feature Benches Flanking the Crimson Runner */}
            <rect
              x={toSvgX(-2.05)}
              y={toSvgY(2.7)}
              width={toSvgX(-1.65) - toSvgX(-2.05)}
              height={toSvgY(3.9) - toSvgY(2.7)}
              fill="#78350f"
              stroke="#10b981"
              strokeWidth="0.8"
              rx="0.5"
            />
            <text x={toSvgX(-1.85)} y={toSvgY(4.1)} fill="#a7f3d0" fontSize="1.5" fontWeight="bold" textAnchor="middle">
              BENCH W
            </text>

            <rect
              x={toSvgX(1.65)}
              y={toSvgY(2.7)}
              width={toSvgX(2.05) - toSvgX(1.65)}
              height={toSvgY(3.9) - toSvgY(2.7)}
              fill="#78350f"
              stroke="#10b981"
              strokeWidth="0.8"
              rx="0.5"
            />
            <text x={toSvgX(1.85)} y={toSvgY(4.1)} fill="#a7f3d0" fontSize="1.5" fontWeight="bold" textAnchor="middle">
              BENCH E
            </text>

            {/* Room 4: Waiting Lounge & Transit Arcade (SW: x = -8.4 to -3.0, z = 1.8 to 5.0) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(1.8)} width={toSvgX(-3.0) - toSvgX(-8.4)} height={toSvgY(5.0) - toSvgY(1.8)} fill="#2a1f18" stroke="#f97316" strokeWidth="1.0" />
            <text x={toSvgX(-5.7)} y={toSvgY(2.6)} fill="#fb923c" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              ROOM 4: WAITING LOUNGE
            </text>
            <text x={toSvgX(-5.7)} y={toSvgY(4.2)} fill="#e2d9cc" fontSize="1.8" textAnchor="middle">
              Chai Counter · Rohan · Benches
            </text>
            {/* Doorway R4 <-> Atrium (x = -3.0, z = 2.8 to 4.0) */}
            <rect x={toSvgX(-3.1)} y={toSvgY(2.8)} width={toSvgX(-2.7) - toSvgX(-3.1)} height={toSvgY(4.0) - toSvgY(2.8)} fill="#f97316" opacity="0.5" />

            {/* Room 5: Designer Workshop & Clarity Lab (SE: x = 3.0 to 8.4, z = 1.8 to 5.0) */}
            <rect x={toSvgX(3.0)} y={toSvgY(1.8)} width={toSvgX(8.4) - toSvgX(3.0)} height={toSvgY(5.0) - toSvgY(1.8)} fill="#2a1832" stroke="#a855f7" strokeWidth="1.0" />
            <text x={toSvgX(5.7)} y={toSvgY(2.6)} fill="#c084fc" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              ROOM 5: DESIGNER LAB
            </text>
            <text x={toSvgX(5.7)} y={toSvgY(4.2)} fill="#e2d9cc" fontSize="1.8" textAnchor="middle">
              Repair Pedestals · Clarity Lab
            </text>
            {/* Doorway R5 <-> Atrium (x = 3.0, z = 2.8 to 4.0) */}
            <rect x={toSvgX(2.7)} y={toSvgY(2.8)} width={toSvgX(3.1) - toSvgX(2.7)} height={toSvgY(4.0) - toSvgY(2.8)} fill="#a855f7" opacity="0.5" />

            {/* Room 3: Passenger Services Wing (NW: x = -8.4 to -3.0, z = -1.6 to 1.8) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(-1.6)} width={toSvgX(-3.0) - toSvgX(-8.4)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#281a24" stroke="#ec4899" strokeWidth="1.0" />
            <text x={toSvgX(-5.7)} y={toSvgY(-0.8)} fill="#f472b6" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              ROOM 3: PASSENGER SERVICES
            </text>
            <text x={toSvgX(-5.7)} y={toSvgY(1.1)} fill="#e2d9cc" fontSize="1.8" textAnchor="middle">
              Agent Priya · Kabir · Desk (CP 3)
            </text>
            {/* Doorway R3 <-> Room 1 (x = -3.0, z = -0.6 to 0.6) */}
            <rect x={toSvgX(-3.1)} y={toSvgY(-0.6)} width={toSvgX(-2.7) - toSvgX(-3.1)} height={toSvgY(0.6) - toSvgY(-0.6)} fill="#ec4899" opacity="0.5" />
            {/* Doorway R3 <-> Room 4 (z = 1.8, x = -6.2 to -5.0) */}
            <rect x={toSvgX(-6.2)} y={toSvgY(1.6)} width={toSvgX(-5.0) - toSvgX(-6.2)} height={toSvgY(2.0) - toSvgY(1.6)} fill="#fb923c" opacity="0.5" />

            {/* Room 1: Ticket Concourse (Center: x = -2.8 to 2.8, z = -1.6 to 1.8) */}
            <rect x={toSvgX(-2.8)} y={toSvgY(-1.6)} width={toSvgX(2.8) - toSvgX(-2.8)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#1c1b30" stroke="#ffd23f" strokeWidth="1.2" />
            {/* Royal blue carpet runner */}
            <rect x={toSvgX(-0.8)} y={toSvgY(-0.8)} width={toSvgX(0.8) - toSvgX(-0.8)} height={toSvgY(1.8) - toSvgY(-0.8)} fill="#1e3a8a" opacity="0.7" />
            <text x={toSvgX(0)} y={toSvgY(-1.0)} fill="#ffd23f" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              ROOM 1: TICKET CONCOURSE
            </text>
            <text x={toSvgX(0)} y={toSvgY(1.2)} fill="#e2d9cc" fontSize="1.8" textAnchor="middle">
              Kiosk (CP 1) · Arjun · Blue Carpet
            </text>
            {/* Opening Room 1 <-> Atrium (z = 1.8, x = -1.6 to 1.6) */}
            <rect x={toSvgX(-1.6)} y={toSvgY(1.6)} width={toSvgX(1.6) - toSvgX(-1.6)} height={toSvgY(2.0) - toSvgY(1.6)} fill="#10b981" opacity="0.4" />

            {/* Room 2: Departure Gallery (NE: x = 3.0 to 8.4, z = -1.6 to 1.8) */}
            <rect x={toSvgX(3.0)} y={toSvgY(-1.6)} width={toSvgX(8.4) - toSvgX(3.0)} height={toSvgY(1.8) - toSvgY(-1.6)} fill="#162238" stroke="#3b82f6" strokeWidth="1.0" />
            <text x={toSvgX(5.7)} y={toSvgY(-0.8)} fill="#60a5fa" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              ROOM 2: DEPARTURE GALLERY
            </text>
            <text x={toSvgX(5.7)} y={toSvgY(1.1)} fill="#e2d9cc" fontSize="1.8" textAnchor="middle">
              Solari Board (CP 2) · Meera
            </text>
            {/* Doorway R2 <-> Room 1 (x = 3.0, z = -0.6 to 0.6) */}
            <rect x={toSvgX(2.7)} y={toSvgY(-0.6)} width={toSvgX(3.1) - toSvgX(2.7)} height={toSvgY(0.6) - toSvgY(-0.6)} fill="#3b82f6" opacity="0.5" />
            {/* Doorway R2 <-> Room 5 (z = 1.8, x = 5.0 to 6.2) */}
            <rect x={toSvgX(5.0)} y={toSvgY(1.6)} width={toSvgX(6.2) - toSvgX(5.0)} height={toSvgY(2.0) - toSvgY(1.6)} fill="#a855f7" opacity="0.5" />

            {/* Platform 2 (Opposite North Platform: z = -8.2 to -6.6) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(-8.2)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(-6.6) - toSvgY(-8.2)} fill="#0f2924" stroke="#0d9488" strokeWidth="1.0" />
            {/* Platform 2 Yellow Safety Line */}
            <line x1={toSvgX(-8.4)} y1={toSvgY(-6.65)} x2={toSvgX(8.4)} y2={toSvgY(-6.65)} stroke="#ffd23f" strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Train 2: Rajdhani Express Carriage */}
            <rect x={toSvgX(-7.2)} y={toSvgY(-6.2)} width={toSvgX(7.2) - toSvgX(-7.2)} height={toSvgY(-5.4) - toSvgY(-6.2)} fill="#dc2626" rx="1.5" />
            <text x={toSvgX(0)} y={toSvgY(-7.4)} fill="#2dd4bf" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              PLATFORM 02 · OPPOSITE CONCOURSE & RAJDHANI EXPRESS
            </text>
            <text x={toSvgX(0)} y={toSvgY(-5.7)} fill="#ffffff" fontSize="1.8" fontWeight="bold" textAnchor="middle">
              RAJDHANI EXP · TRACK 2 (SIMULATED SERVICE)
            </text>

            {/* West Level Crossing (x in [-7.2, -5.2], z in [-6.6, -3.8]) */}
            <rect x={toSvgX(-7.2)} y={toSvgY(-6.6)} width={toSvgX(-5.2) - toSvgX(-7.2)} height={toSvgY(-3.8) - toSvgY(-6.6)} fill="#422006" stroke="#ffd23f" strokeWidth="0.8" strokeDasharray="2 1.5" />
            <text x={toSvgX(-6.2)} y={toSvgY(-5.1)} fill="#ffd23f" fontSize="1.4" fontWeight="bold" textAnchor="middle">
              WEST LEVEL CROSSING
            </text>

            {/* East Covered Footbridge (x in [5.2, 7.2], z in [-6.6, -3.8]) */}
            <rect x={toSvgX(5.2)} y={toSvgY(-6.6)} width={toSvgX(7.2) - toSvgX(5.2)} height={toSvgY(-3.8) - toSvgY(-6.6)} fill="#2e1065" stroke="#c084fc" strokeWidth="0.8" />
            <text x={toSvgX(6.2)} y={toSvgY(-5.1)} fill="#e9d5ff" fontSize="1.4" fontWeight="bold" textAnchor="middle">
              EAST OVERHEAD FOOTBRIDGE
            </text>

            {/* Track 1 Rails & Sleepers (z = -4.6) */}
            <line x1={toSvgX(-8.4)} y1={toSvgY(-4.6)} x2={toSvgX(8.4)} y2={toSvgY(-4.6)} stroke="#ffd23f" strokeWidth="0.8" strokeDasharray="3 2" />

            {/* Grand Platform 1 (Main South Platform: z = -3.8 to -1.8) */}
            <rect x={toSvgX(-8.4)} y={toSvgY(-3.8)} width={toSvgX(8.4) - toSvgX(-8.4)} height={toSvgY(-1.8) - toSvgY(-3.8)} fill="#120e1a" stroke="#4a4060" strokeWidth="0.8" />
            {/* Platform 1 Yellow Safety Tactile Edge */}
            <line x1={toSvgX(-8.4)} y1={toSvgY(-3.75)} x2={toSvgX(8.4)} y2={toSvgY(-3.75)} stroke="#ffd23f" strokeWidth="1.2" strokeDasharray="3 2" />
            {/* Train 1 Carriage: Deccan Express */}
            <rect x={toSvgX(-7.5)} y={toSvgY(-4.5)} width={toSvgX(7.5) - toSvgX(-7.5)} height={toSvgY(-3.9) - toSvgY(-4.5)} fill="#ff8a1f" rx="1.2" />
            <text x={toSvgX(0)} y={toSvgY(-3.0)} fill="#fbbf24" fontSize="2.2" fontWeight="bold" textAnchor="middle">
              PLATFORM 01 · DECCAN EXPRESS (SIMULATED SERVICE)
            </text>
            <text x={toSvgX(0)} y={toSvgY(-2.1)} fill="#c7b5ff" fontSize="1.8" textAnchor="middle">
              PASSENGER BOARDING PLATFORM · CONDUCTOR RAJIV
            </text>
            {/* Turnstile Passage Room 1 -> Platform (z = -1.6, x = -1.2 to 1.2) */}
            <rect x={toSvgX(-1.2)} y={toSvgY(-1.8)} width={toSvgX(1.2) - toSvgX(-1.2)} height={toSvgY(-1.4) - toSvgY(-1.8)} fill="#ffd23f" opacity="0.6" />

            {/* Architectural Doorway & Stair Icons */}
            <g aria-label="Doorways and Stairs" opacity="0.95">
              {/* Grand Entrance Gate */}
              <text x={toSvgX(0)} y={toSvgY(4.55)} fontSize="2.8" textAnchor="middle">🚪</text>
              {/* Room 1 Door */}
              <text x={toSvgX(0)} y={toSvgY(1.85)} fontSize="2.8" textAnchor="middle">🚪</text>
              {/* Room 2 Door */}
              <text x={toSvgX(2.95)} y={toSvgY(0.05)} fontSize="2.6" textAnchor="middle">🚪</text>
              {/* Room 3 Door */}
              <text x={toSvgX(-2.95)} y={toSvgY(0.05)} fontSize="2.6" textAnchor="middle">🚪</text>
              {/* Room 4 Door */}
              <text x={toSvgX(-2.95)} y={toSvgY(3.25)} fontSize="2.6" textAnchor="middle">🚪</text>
              {/* Room 5 Door */}
              <text x={toSvgX(2.95)} y={toSvgY(3.25)} fontSize="2.6" textAnchor="middle">🚪</text>
              {/* Footbridge Stairs on Platform 1 & Platform 2 */}
              <text x={toSvgX(6.2)} y={toSvgY(-3.3)} fontSize="2.4" textAnchor="middle">🪜</text>
              <text x={toSvgX(6.2)} y={toSvgY(-6.3)} fontSize="2.4" textAnchor="middle">🪜</text>
            </g>

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
                    stroke="#44395d"
                    strokeWidth="1.0"
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
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 2"
                className="schematic-route-line"
              />
            )}

            {/* Collectible Tokens in R4 & R5 */}
            <g transform={`translate(${toSvgX(-6.2)}, ${toSvgY(3.6)})`}>
              <circle r="2.2" fill="#ffd23f" stroke="#17131f" strokeWidth="0.8" />
              <text y="0.8" fontSize="2.0" fill="#17131f" fontWeight="bold" textAnchor="middle">🪙</text>
            </g>
            <g transform={`translate(${toSvgX(6.4)}, ${toSvgY(3.6)})`}>
              <circle r="2.2" fill="#ffd23f" stroke="#17131f" strokeWidth="0.8" />
              <text y="0.8" fontSize="2.0" fill="#17131f" fontWeight="bold" textAnchor="middle">🪙</text>
            </g>

            {/* Waypoints / Landmarks */}
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
              let labelOffsetY = isCheckpoint ? 6.5 : 5.0;

              if (wp.id === 'wp-desk') {
                labelOffsetX = -2;
                labelOffsetY = 5.5;
              } else if (wp.id === 'wp-board') {
                labelOffsetX = 2;
                labelOffsetY = 5.5;
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
                    r={isSelected ? 4.0 : isCheckpoint ? 3.2 : 2.0}
                    fill={pinColor}
                    stroke="#17131f"
                    strokeWidth={isSelected ? 1.6 : 1.0}
                  />
                  {isCheckpoint && (
                    <text y="1.2" fontSize="2.4" fill="#17131f" fontWeight="bold" textAnchor="middle">
                      {wp.hotspotId === 'kiosk' ? '1' : wp.hotspotId === 'board' ? '2' : '3'}
                    </text>
                  )}

                  {/* Pill Background for Text */}
                  <g transform={`translate(${labelOffsetX}, ${labelOffsetY})`}>
                    <rect
                      x={-wp.name.length * 1.1}
                      y="-2.5"
                      width={wp.name.length * 2.2}
                      height="3.8"
                      rx="1.9"
                      fill="#17131f"
                      stroke={isSelected ? '#ffd23f' : isCheckpoint ? pinColor : '#4a4060'}
                      strokeWidth={isSelected ? '0.9' : '0.5'}
                    />
                    <text
                      y="0.3"
                      fontSize="1.9"
                      fill={isSelected ? '#ffd23f' : isCheckpoint ? '#fff6e5' : '#c7b5ff'}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {wp.name}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* In-World NPCs Markers */}
            {STATION_NPCS.map((npc) => {
              const nx = toSvgX(npc.position.x);
              const ny = toSvgY(npc.position.z);
              return (
                <g key={npc.id} transform={`translate(${nx}, ${ny})`}>
                  <circle r="1.8" fill="#8ddcff" stroke="#17131f" strokeWidth="0.8" />
                  <text y="0.8" fontSize="1.6" fill="#17131f" fontWeight="bold" textAnchor="middle">
                    👤
                  </text>
                  <rect
                    x={-npc.name.length * 0.9}
                    y="-4.8"
                    width={npc.name.length * 1.8}
                    height="3.2"
                    rx="1.6"
                    fill="#17131f"
                    stroke="#8ddcff"
                    strokeWidth="0.5"
                  />
                  <text y="-2.7" fontSize="1.6" fill="#8ddcff" fontWeight="bold" textAnchor="middle">
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
