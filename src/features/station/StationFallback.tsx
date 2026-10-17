import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RewardLedger } from '../game/state/RewardLedger';
import { FRICTION_TOKENS, STATION_NPCS, GAME_BADGES } from '../../data/missionData';
import type { StationNPC } from '../../data/missionData';

interface StationFallbackProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  onTriggerEcho?: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
  onLaunchBookingChallenge?: () => void;
  onOpenDesignLab?: () => void;
  onTalkToNPC?: (npc: StationNPC) => void;
  isBoarding?: boolean;
}

type StationZoneId = 'city' | 'atrium' | 'concourse' | 'board' | 'desk' | 'lounge' | 'lab' | 'platform';

interface ZoneDetail {
  id: StationZoneId;
  name: string;
  category: string;
  badgeNum?: number;
  description: string;
  associatedClue?: 'kiosk' | 'board' | 'desk';
  npcId?: string;
  tokenId?: string;
}

const STATION_ZONES: ZoneDetail[] = [
  {
    id: 'city',
    name: 'City Arrival Plaza',
    category: 'Exterior Approach',
    description: 'Pastel Victorian city streets, arrival plaza, streetlights, and travelers walking with rolling luggage toward the station facade.',
    tokenId: 'tok-city',
  },
  {
    id: 'atrium',
    name: 'Grand Station Entrance & Atrium',
    category: 'Architectural Centerpiece',
    description: 'Cathedral glass skylights, turquoise walls, warm cream stone colonnades, central clock, and brass wayfinding arches.',
    tokenId: 'tok-atrium',
  },
  {
    id: 'concourse',
    name: 'Existing Ticket Concourse & Kiosk',
    category: 'Area 1 · Core Mission',
    badgeNum: 1,
    description: 'Self-service ticketing terminal. Commuter Arjun is stranded because input placeholder labels disappeared upon typing.',
    associatedClue: 'kiosk',
    npcId: 'arjun',
    tokenId: 'tok-kiosk',
  },
  {
    id: 'board',
    name: 'Departure Gallery',
    category: 'Area 2 · Core Mission',
    badgeNum: 2,
    description: 'Overhead Solari departures display. Passenger Meera froze at a red color-only alert with no plain-text explanation.',
    associatedClue: 'board',
    npcId: 'meera',
    tokenId: 'tok-board',
  },
  {
    id: 'desk',
    name: 'Passenger Services & Help Desk Wing',
    category: 'Area 3 · Core Mission',
    badgeNum: 3,
    description: 'Customer service desk. Kabir was terrified of hitting "Cancel Booking" because it looked identical to "Confirm Assistance".',
    associatedClue: 'desk',
    npcId: 'priya',
    tokenId: 'tok-desk',
  },
  {
    id: 'lounge',
    name: 'Waiting Lounge & Transit Arcade',
    category: 'Area 4 · Side Exploration',
    description: 'Spacious lounge with seating clusters, plants, and commuter Rohan asking for help with ambiguous wayfinding.',
    npcId: 'rohan',
    tokenId: 'tok-lounge',
  },
  {
    id: 'lab',
    name: 'Designer Workshop & Clarity Lab',
    category: 'Area 5 · Repair Workbench',
    description: 'Physical workshop space for testing interface solutions: floating persistent labels, actionable error text, and clear button hierarchy.',
    tokenId: 'tok-lab',
  },
  {
    id: 'platform',
    name: 'Grand Platform 1',
    category: 'Rail Destination',
    description: 'Dual railway tracks with safety tactile line, multi-coach Deccan Express train, conductor Rajiv, and scheduled passenger boarding.',
    npcId: 'rajiv',
    tokenId: 'tok-platform',
  },
];

export const StationFallback: React.FC<StationFallbackProps> = ({
  onSelectHotspot,
  onTriggerEcho,
  cluesFound,
  repairsComplete,
  onLaunchBookingChallenge,
  onOpenDesignLab,
  onTalkToNPC,
  isBoarding = false,
}) => {
  const [activeZoneId, setActiveZoneId] = useState<StationZoneId>('concourse');
  const [rewardState, setRewardState] = useState(RewardLedger.getState());

  useEffect(() => {
    return RewardLedger.subscribe((state) => {
      setRewardState(state);
    });
  }, []);

  // Record zone visit for 2D users
  useEffect(() => {
    RewardLedger.recordZoneVisit(activeZoneId);
  }, [activeZoneId]);

  const activeZone = STATION_ZONES.find((z) => z.id === activeZoneId) || STATION_ZONES[2];
  const activeNPC = activeZone.npcId ? STATION_NPCS.find((n) => n.id === activeZone.npcId) : null;
  const isClueDone = activeZone.associatedClue ? cluesFound.includes(activeZone.associatedClue) : false;
  const activeToken = activeZone.tokenId ? FRICTION_TOKENS.find((t) => t.id === activeZone.tokenId) : null;
  const isTokenCollected = activeZone.tokenId ? rewardState.collectedTokenIds.includes(activeZone.tokenId) : false;

  const handleCollectToken = (tokenId: string) => {
    RewardLedger.collectToken(tokenId);
  };

  const handleTalkToNPC = (npc: StationNPC) => {
    if (npc.id === 'rohan') {
      RewardLedger.completeSideQuest('sq-rohan-wayfinding', 15);
    }
    onTalkToNPC?.(npc);
  };

  return (
    <div className="station-fallback" role="region" aria-label="Accessible 2D Transit Concourse">
      {/* 2D Header Summary Banner */}
      <div className="station-fallback__header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <Badge variant="sticker" color="#FFD23F">ACCESSIBLE 2D TRANSIT CONCOURSE</Badge>
            <h2 style={{ margin: '6px 0 2px 0', fontSize: '20px', color: '#17131f' }}>
              Mumbai Central · All 8 Zones & Living Railway
            </h2>
            <p className="station-fallback__subtitle" style={{ margin: 0 }}>
              Full gameplay parity: navigate the 5 interior areas, explore city & platform, discover forensic clues, collect tokens, and solve repair drills.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: '#ffd23f',
                color: '#17131f',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '2px solid #17131f',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '2px 2px 0 #17131f',
              }}
            >
              🪙 {rewardState.tokenBalance} TOKENS
            </div>
            <div
              style={{
                background: '#8ddcff',
                color: '#17131f',
                padding: '6px 14px',
                borderRadius: '20px',
                border: '2px solid #17131f',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '2px 2px 0 #17131f',
              }}
            >
              ★ {rewardState.unlockedBadgeIds.length}/{GAME_BADGES.length} BADGES
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all tokens and badges back to 0 for a fresh playthrough?')) {
                  RewardLedger.resetLifetimeRewards();
                }
              }}
              style={{
                background: '#fff0f0',
                color: '#e11d48',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1.5px dashed #e11d48',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
              }}
              title="Reset earned tokens, visited zones, and badges to start fresh"
            >
              🔄 Reset (0 Tokens)
            </button>
          </div>
        </div>
      </div>

      {/* 8-Zone Navigation Bar */}
      <div
        className="station-2d-zone-nav"
        role="tablist"
        aria-label="Station Zones"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '8px 4px',
          margin: '12px 0',
          scrollbarWidth: 'thin',
        }}
      >
        {STATION_ZONES.map((zone) => {
          const isSelected = zone.id === activeZoneId;
          const isDone = zone.associatedClue && cluesFound.includes(zone.associatedClue);
          return (
            <button
              key={zone.id}
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveZoneId(zone.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '2px solid #17131f',
                background: isSelected ? '#ff3d8b' : isDone ? '#b6ffb2' : '#ffffff',
                color: isSelected ? '#ffffff' : '#17131f',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: isSelected ? '3px 3px 0 #17131f' : '1px 1px 0 #17131f',
                transition: 'all 0.15s ease',
              }}
            >
              {zone.badgeNum && <span style={{ marginRight: '6px', opacity: 0.8 }}>#{zone.badgeNum}</span>}
              {zone.name}
              {isDone && <span style={{ marginLeft: '6px' }}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* Active Zone Detail Card */}
      <div
        className="station-2d-zone-card"
        style={{
          background: '#fff6e5',
          border: '3px solid #17131f',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '4px 4px 0 #17131f',
          marginTop: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#ffd23f', padding: '3px 8px', borderRadius: '4px', border: '1.5px solid #17131f' }}>
              {activeZone.category}
            </span>
            <h3 style={{ margin: '8px 0 4px 0', fontSize: '22px', color: '#17131f' }}>{activeZone.name}</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#4a4060', maxWidth: '640px', lineHeight: 1.5 }}>
              {activeZone.description}
            </p>
          </div>

          {activeZone.associatedClue && (
            <div style={{ textAlign: 'right' }}>
              <Badge variant="sticker" color={isClueDone ? '#b6ffb2' : '#ff3d8b'}>
                {isClueDone ? 'EVIDENCE COLLECTED ✓' : 'CORE UX FRICTION POINT'}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Controls in Active Zone */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed #e2d4c0' }}>
          {activeZone.associatedClue && (
            <>
              <Button
                variant="primary"
                size="md"
                onClick={() => (onTriggerEcho ? onTriggerEcho(activeZone.associatedClue!) : onSelectHotspot(activeZone.associatedClue!))}
              >
                ⚡ Activate Friction Echo (Q)
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => onSelectHotspot(activeZone.associatedClue!)}
              >
                Inspect Landmark
              </Button>
            </>
          )}

          {activeNPC && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => handleTalkToNPC(activeNPC)}
            >
              👤 Talk to {activeNPC.name} ({activeNPC.role})
            </Button>
          )}

          {activeToken && !isTokenCollected && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleCollectToken(activeToken.id)}
              style={{ background: '#ffd23f', color: '#17131f' }}
            >
              🪙 Collect {activeToken.name} (+{activeToken.value})
            </Button>
          )}

          {activeZone.id === 'lab' && (
            <Button
              variant="primary"
              size="md"
              onClick={onOpenDesignLab}
            >
              🛠 Open Designer Workshop & Repair Workbench
            </Button>
          )}

          {activeZone.id === 'platform' && repairsComplete && (
            <Button
              variant="primary"
              size="md"
              onClick={onLaunchBookingChallenge}
              style={{ background: '#059669', color: '#ffffff' }}
            >
              🚆 Board Deccan Express to Pune →
            </Button>
          )}
        </div>
      </div>

      {/* Global Mission Quick-Action Strip */}
      <div
        className="station-2d-mission-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#241b34',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '14px 20px',
          marginTop: '16px',
          border: '2px solid #17131f',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: '#ffd23f', fontWeight: 800 }}>MISSION STATUS</div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            {cluesFound.length < 3
              ? `Collect all 3 evidence stamps (${cluesFound.length}/3 collected)`
              : !repairsComplete
              ? 'All 3 clues found! Solve the 3 design repairs in the Clarity Lab'
              : isBoarding
              ? 'All repairs complete! Train boarding underway.'
              : 'Repairs complete! Proceed to Grand Platform 1 to board'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {cluesFound.length === 3 && !repairsComplete && onOpenDesignLab && (
            <Button variant="primary" size="sm" onClick={onOpenDesignLab}>
              Solve 3 Repairs →
            </Button>
          )}
          {onLaunchBookingChallenge && (
            <Button variant="secondary" size="sm" onClick={onLaunchBookingChallenge}>
              {repairsComplete ? 'Complete After-Repair Booking' : 'Practice Booking Drill'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
