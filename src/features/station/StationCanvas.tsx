import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { STATION_NPCS } from '../../data/missionData';
import type { StationNPC } from '../../data/missionData';
import { MinimapRadar } from './MinimapRadar';
import { TransitPhoneWidget } from './TransitPhoneWidget';
import { PauseMenuModal } from './PauseMenuModal';
import { SoundEffects, VoiceNarration } from '../../lib/audio';
import { buildStationEnvironment } from '../game/world/StationEnvironment';
import { createCharacterController } from '../game/world/CharacterController';
import { createPassengerActors } from '../game/world/PassengerActors';
import { RewardLedger } from '../game/state/RewardLedger';

interface StationCanvasProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  onTriggerEcho?: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsCompleted?: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
  selectedAvatarId?: 'explorer' | 'creative' | 'analyst';
  onTalkToNPC?: (npc: StationNPC) => void;
  onToggleMap?: () => void;
  onShowHint?: () => void;
  onLaunchBookingChallenge?: () => void;
  onOpenHowToPlay?: () => void;
  onOpenDuoJam?: () => void;
  onOpenDesignLab?: () => void;
  activeWaypointId?: string;
  onPlayerCoordsChange?: (coords: { x: number; z: number; angle: number }) => void;
  isFrictionVision?: boolean;
  onToggleFrictionVision?: () => void;
  isBoarding?: boolean;
}

export const StationCanvas: React.FC<StationCanvasProps> = ({
  onSelectHotspot,
  onTriggerEcho,
  cluesFound,
  repairsCompleted = [],
  repairsComplete,
  activeHotspot,
  selectedAvatarId = 'explorer',
  onTalkToNPC,
  onToggleMap,
  onShowHint,
  onLaunchBookingChallenge,
  onOpenHowToPlay,
  onOpenDuoJam,
  onOpenDesignLab,
  activeWaypointId = 'wp-kiosk',
  onPlayerCoordsChange,
  isFrictionVision = false,
  onToggleFrictionVision,
  isBoarding = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearbyHotspot, setNearbyHotspot] = useState<'kiosk' | 'board' | 'desk' | null>(null);
  const [nearbyNPC, setNearbyNPC] = useState<StationNPC | null>(null);

  // Campus & SF Quest HUD states
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [cameraMode, setCameraMode] = useState<'over_the_shoulder' | 'isometric'>('isometric');
  const [voiceNarration, setVoiceNarration] = useState<boolean>(true);
  const [graphicsMode, setGraphicsMode] = useState<'fast' | 'high'>('high');
  const [activeRoleView, setActiveRoleView] = useState<'traveler' | 'designer' | 'evidence'>('traveler');
  const [playerCoords, setPlayerCoords] = useState({ x: 0.0, z: 8.5, angle: Math.PI });
  const [rewardState, setRewardState] = useState(RewardLedger.getState());

  useEffect(() => {
    return RewardLedger.subscribe((state) => {
      setRewardState(state);
    });
  }, []);

  // Unlock badges on core mission progress
  useEffect(() => {
    if (cluesFound.includes('kiosk')) RewardLedger.unlockBadge('badge-context');
    if (cluesFound.includes('board')) RewardLedger.unlockBadge('badge-error');
    if (cluesFound.includes('desk')) RewardLedger.unlockBadge('badge-flow');
  }, [cluesFound]);

  useEffect(() => {
    if (repairsComplete) {
      RewardLedger.unlockBadge('badge-champion');
    }
  }, [repairsComplete]);

  useEffect(() => {
    if (isBoarding) {
      RewardLedger.unlockBadge('badge-boarding');
    }
  }, [isBoarding]);

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;
  const voiceNarrationRef = useRef(voiceNarration);
  voiceNarrationRef.current = voiceNarration;
  const isFrictionVisionRef = useRef(isFrictionVision);
  isFrictionVisionRef.current = isFrictionVision;

  const keysDown = useRef<{ [key: string]: boolean }>({});
  const pointerPos = useRef({ x: 0, y: 0 });

  // Landmark coordinates in world (Room 1, Room 2, Room 3)
  const hotspotPositions = {
    kiosk: new THREE.Vector3(0, 0, 0.2),
    board: new THREE.Vector3(5.4, 0, -1.25),
    desk: new THREE.Vector3(-5.6, 0, 0.2),
  };

  const handleInteract = useCallback(() => {
    if (nearbyHotspot) {
      if (voiceNarrationRef.current) {
        VoiceNarration.speak(
          nearbyHotspot === 'kiosk'
            ? 'Inspecting Ticket Kiosk'
            : nearbyHotspot === 'board'
            ? 'Reading Departure Board'
            : 'Visiting Help Desk'
        );
      }
      onSelectHotspot(nearbyHotspot);
    } else if (nearbyNPC) {
      if (voiceNarrationRef.current) {
        VoiceNarration.speak(`Speaking with ${nearbyNPC.name}`);
      }
      if (nearbyNPC.id === 'rohan') {
        RewardLedger.completeSideQuest('sq-rohan-wayfinding', 15);
      }
      onTalkToNPC?.(nearbyNPC);
    }
  }, [nearbyHotspot, nearbyNPC, onSelectHotspot, onTalkToNPC]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keysDown.current[e.key.toLowerCase()] = true;
      if (e.key === 'Escape') {
        e.preventDefault();
        SoundEffects.playBlip();
        setIsPaused((prev) => !prev);
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        SoundEffects.playBlip();
        setIsPhoneOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        SoundEffects.playCollect();
        if (onToggleFrictionVision) {
          onToggleFrictionVision();
        } else {
          const target =
            nearbyHotspot ||
            (!cluesFound.includes('kiosk') ? 'kiosk' : !cluesFound.includes('board') ? 'board' : 'desk');
          onTriggerEcho?.(target);
        }
      } else if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        if (nearbyHotspot || nearbyNPC) {
          e.preventDefault();
          SoundEffects.playBlip();
          handleInteract();
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        SoundEffects.playBlip();
        onToggleMap?.();
      } else if (e.key.toLowerCase() === 'h') {
        e.preventDefault();
        SoundEffects.playBlip();
        onShowHint?.();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      const container = mountRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerPos.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointermove', handlePointerMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [nearbyHotspot, nearbyNPC, handleInteract, onToggleMap, onShowHint, onTriggerEcho, onToggleFrictionVision, cluesFound]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    const isClarity = repairsComplete || repairsCompleted.length === 3;

    // Background responds to Clarity and Friction Vision
    scene.background = new THREE.Color(
      isFrictionVisionRef.current ? 0x0f0b18 : isClarity ? 0x221838 : 0x181226
    );

    // --- 2. CAMERA ---
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0.0, 3.8, 12.2);
    camera.lookAt(0.0, 0.85, 8.0);

    // --- 3. RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isFrictionVisionRef.current ? 1.05 : 1.35;
    container.appendChild(renderer.domElement);

    // --- 4. LIGHTING SYSTEM ---
    const ambientLight = new THREE.AmbientLight(
      isFrictionVisionRef.current ? 0x8ddcff : isClarity ? 0xfff3e0 : 0xffecd2,
      isFrictionVisionRef.current ? 0.9 : isClarity ? 1.5 : 1.2
    );
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffe2b8, 0x584478, isClarity ? 1.2 : 0.95);
    scene.add(hemiLight);

    // Main Sun/Canopy Light
    const sunLight = new THREE.DirectionalLight(0xffbe60, isClarity ? 2.6 : 2.2);
    sunLight.position.set(5, 9, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Dynamic Neon Accent Lights
    const neonPink = new THREE.PointLight(0xff3d8b, 3.0, 14);
    neonPink.position.set(0, 3.2, 0.4);
    scene.add(neonPink);

    const cyanRim = new THREE.DirectionalLight(0x8ddcff, 1.4);
    cyanRim.position.set(-6, 5, -2);
    scene.add(cyanRim);

    // --- 5. BUILD COMPLETE PROCEDURAL STATION LEVEL ---
    const envHandles = buildStationEnvironment({
      scene,
      isClarity,
      clarityRepairs: repairsCompleted,
      isFrictionVision: isFrictionVisionRef.current,
    });

    // --- 6. BUILD ARTICULATED PROTAGONIST CONTROLLER ---
    const charController = createCharacterController({
      scene,
      avatarId: selectedAvatarId,
      initialX: 0.0,
      initialZ: 8.5,
    });

    // --- 7. BUILD SCRIPTED PASSENGER NPCS & GHOST TRAILS ---
    const passengerHandles = createPassengerActors({
      scene,
      cluesFound,
      repairsComplete,
      isFrictionVision: isFrictionVisionRef.current,
    });

    // Trigger boarding sequence if active
    if (isBoarding) {
      passengerHandles.triggerBoardingWalk();
      envHandles.triggerTrainDeparture();
    }

    // --- 8. ANIMATION & GAMEPLAY TICK LOOP ---
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Tick Character Controller with active keys
      charController.update(delta, time, keysDown.current);
      const playerPos = charController.getPosition();
      const playerAngle = charController.getAngle();

      // Tick Station Environment, Collectibles & Train
      const { collectedTokenId } = envHandles.update(charController.group.position, time, delta);
      if (collectedTokenId) {
        SoundEffects.playCollect();
      }

      // Record Visited Zone for Station Explorer Badge
      if (playerPos.z > 4.4) {
        RewardLedger.recordZoneVisit('city');
      } else if (playerPos.z > 1.8 && Math.abs(playerPos.x) <= 2.8) {
        RewardLedger.recordZoneVisit('atrium');
      } else if (Math.abs(playerPos.x) <= 2.8 && playerPos.z >= -1.4 && playerPos.z <= 1.8) {
        RewardLedger.recordZoneVisit('concourse');
      } else if (playerPos.x > 2.8 && playerPos.z <= 1.8 && playerPos.z >= -1.4) {
        RewardLedger.recordZoneVisit('board');
      } else if (playerPos.x < -2.8 && playerPos.z <= 1.8 && playerPos.z >= -1.4) {
        RewardLedger.recordZoneVisit('desk');
      } else if (playerPos.x < -2.8 && playerPos.z > 1.8) {
        RewardLedger.recordZoneVisit('lounge');
      } else if (playerPos.x > 2.8 && playerPos.z > 1.8) {
        RewardLedger.recordZoneVisit('lab');
      } else if (playerPos.z < -1.8) {
        RewardLedger.recordZoneVisit('platform');
      }

      // Tick Scripted Passengers
      passengerHandles.update(time, delta, isFrictionVisionRef.current, isBoarding);

      // PROXIMITY DETECTION TO HOTSPOTS & NPCS ACROSS ALL 5 ROOMS
      const playerVec = new THREE.Vector2(playerPos.x, playerPos.z);
      const kioskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.kiosk.x, hotspotPositions.kiosk.z));
      const boardDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.board.x, hotspotPositions.board.z));
      const deskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.desk.x, hotspotPositions.desk.z));

      const arjunDist = playerVec.distanceTo(new THREE.Vector2(0.0, 0.65));
      const meeraDist = playerVec.distanceTo(new THREE.Vector2(5.4, -0.4));
      const kabirDist = playerVec.distanceTo(new THREE.Vector2(-5.0, 0.55));
      const priyaDist = playerVec.distanceTo(new THREE.Vector2(-5.6, 0.1));
      const rajivDist = playerVec.distanceTo(new THREE.Vector2(-0.8, -2.9));
      const rohanDist = playerVec.distanceTo(new THREE.Vector2(-5.4, 3.2));

      const PROX_THRESHOLD = 1.45;
      if (kioskDist < PROX_THRESHOLD || arjunDist < PROX_THRESHOLD) {
        setNearbyHotspot('kiosk');
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'arjun') || null);
      } else if (boardDist < PROX_THRESHOLD || meeraDist < PROX_THRESHOLD) {
        setNearbyHotspot('board');
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'meera') || null);
      } else if (deskDist < PROX_THRESHOLD || priyaDist < PROX_THRESHOLD) {
        setNearbyHotspot('desk');
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'priya') || null);
      } else if (kabirDist < PROX_THRESHOLD) {
        setNearbyHotspot('desk');
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'kabir') || null);
      } else if (rajivDist < PROX_THRESHOLD) {
        setNearbyHotspot(null);
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'rajiv') || null);
      } else if (rohanDist < PROX_THRESHOLD) {
        setNearbyHotspot(null);
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'rohan') || null);
      } else {
        setNearbyHotspot(null);
        setNearbyNPC(null);
      }

      // Synchronize player coords with Minimap Radar & Map (throttled to ~15fps)
      frameCount++;
      if (frameCount % 4 === 0) {
        const coords = { x: playerPos.x, z: playerPos.z, angle: playerAngle };
        setPlayerCoords(coords);
        onPlayerCoordsChange?.(coords);
      }

      // Camera handling: 3/4 Isometric Follow Camera framing traveler, landmarks, and Platform 1
      if (cameraModeRef.current === 'over_the_shoulder') {
        const camTargetX = playerPos.x - Math.sin(playerAngle) * 0.35;
        const camTargetZ = playerPos.z + Math.cos(playerAngle) * 2.6;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.09);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.09);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2, 0.09);
        camera.lookAt(playerPos.x, 0.9, playerPos.z - 1.2);
      } else {
        // High-clarity 3/4 isometric follow camera centered behind player
        const camTargetX = THREE.MathUtils.clamp(playerPos.x * 0.82 + pointerPos.current.x * 0.2, -7.2, 7.2);
        const camTargetY = 3.65;
        const camTargetZ = Math.min(playerPos.z + 3.8 + pointerPos.current.y * 0.15, 11.8);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
        camera.lookAt(playerPos.x * 0.82, 0.85, playerPos.z - 0.9);
      }

      renderer.render(scene, camera);
    };

    animate();

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      envHandles.dispose();
      charController.dispose();
      passengerHandles.dispose();
    };
  }, [cluesFound, repairsCompleted, repairsComplete, selectedAvatarId, isBoarding]);

  return (
    <div className="station-canvas-container" ref={mountRef}>
      {/* Interactive In-World Hotspot Badges */}
      <div className="station-hotspot-pins" aria-hidden="true">
        {/* Checkpoint 1: Kiosk */}
        <button
          className={`hotspot-pin hotspot-pin--kiosk ${activeHotspot === 'kiosk' ? 'is-active' : ''} ${
            cluesFound.includes('kiosk') ? 'is-completed' : ''
          }`}
          onClick={() => onSelectHotspot('kiosk')}
          title="Zone C: Ticket Kiosk"
          id="hotspot-kiosk-btn"
        >
          <span className="hotspot-pin__badge">1</span>
          <span className="hotspot-pin__label">Ticket Kiosk</span>
        </button>

        {/* Checkpoint 2: Departure Board */}
        <button
          className={`hotspot-pin hotspot-pin--board ${activeHotspot === 'board' ? 'is-active' : ''} ${
            cluesFound.includes('board') ? 'is-completed' : ''
          }`}
          onClick={() => onSelectHotspot('board')}
          title="Zone D: Departure Board"
          id="hotspot-board-btn"
        >
          <span className="hotspot-pin__badge">2</span>
          <span className="hotspot-pin__label">Departure Board</span>
        </button>

        {/* Checkpoint 3: Help Desk */}
        <button
          className={`hotspot-pin hotspot-pin--desk ${activeHotspot === 'desk' ? 'is-active' : ''} ${
            cluesFound.includes('desk') ? 'is-completed' : ''
          }`}
          onClick={() => onSelectHotspot('desk')}
          title="Zone E: Help Desk"
          id="hotspot-desk-btn"
        >
          <span className="hotspot-pin__badge">3</span>
          <span className="hotspot-pin__label">Help Desk</span>
        </button>
      </div>

      {/* Top Concourse Objective Banner */}
      <div className="campus-concourse-hud" aria-label="Station Concourse HUD">
        <div className="campus-hud-left">
          <div className="campus-hud-badge">
            <span className="campus-live-dot" />
            <span className="campus-hud-title">THE LAST TRAIN: FLOW RESCUE</span>
          </div>
          <div className="campus-hud-breadcrumb">MUMBAI CENTRAL · PLATFORM 1</div>
          <div className="campus-hud-target">
            Next Objective:{' '}
            <strong>
              {playerCoords.z > 4.2
                ? 'Reach Friction Central — enter the station through the grand gate'
                : !cluesFound.includes('kiosk')
                ? 'Ticket Concourse: Investigate Arjun at Ticket Kiosk'
                : !cluesFound.includes('board')
                ? 'Departure Gallery: Investigate Meera at Departure Board'
                : !cluesFound.includes('desk')
                ? 'Passenger Services: Investigate Kabir at Help Desk'
                : 'Ticket Concourse: Launch Ticket Booking Drill'}
            </strong>
          </div>
          <div
            className="campus-hud-tokens"
            title="Collected Friction Tokens · Discover across the station and platform"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffd23f',
              color: '#17131f',
              padding: '2px 10px',
              borderRadius: '20px',
              border: '2px solid #17131f',
              fontWeight: 800,
              fontSize: '12px',
              boxShadow: '2px 2px 0 #17131f',
              marginTop: '4px',
              width: 'fit-content',
            }}
          >
            <span>🪙</span>
            <span>{rewardState.tokenBalance} TOKENS</span>
            <span style={{ opacity: 0.6 }}>·</span>
            <span>{rewardState.unlockedBadgeIds.length}/6 BADGES</span>
          </div>
        </div>

        {/* Dynamic Token / Badge Toast Notice */}
        {rewardState.lastEarnedNotice && Date.now() - rewardState.lastEarnedNotice.time < 3500 && (
          <div
            className="token-hud-toast animate-pop-in"
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              top: '68px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#ff3d8b',
              color: '#ffffff',
              padding: '6px 18px',
              borderRadius: '24px',
              border: '3px solid #17131f',
              fontWeight: 800,
              fontSize: '13px',
              boxShadow: '0 4px 0 #17131f',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              pointerEvents: 'none',
            }}
          >
            <span>✨</span>
            <span>{rewardState.lastEarnedNotice.title}</span>
          </div>
        )}

        <div className="campus-hud-right">
          {/* Friction Vision Toggle Button */}
          <button
            type="button"
            className={`campus-hud-btn ${isFrictionVision ? 'campus-hud-btn--active' : ''}`}
            onClick={() => {
              SoundEffects.playCollect();
              if (onToggleFrictionVision) onToggleFrictionVision();
              else {
                const target =
                  nearbyHotspot ||
                  (!cluesFound.includes('kiosk') ? 'kiosk' : !cluesFound.includes('board') ? 'board' : 'desk');
                onTriggerEcho?.(target);
              }
            }}
            title="Toggle Friction Vision forensic inspection (Q)"
            style={{
              background: isFrictionVision ? '#b6ffb2' : '#ffd23f',
              color: '#17131f',
              fontWeight: 800,
            }}
          >
            ⚡ Vision (Q)
          </button>

          <button
            type="button"
            className="campus-hud-btn"
            onClick={() => {
              SoundEffects.playBlip();
              setIsPhoneOpen(true);
            }}
            title="Open Transit Phone PDA (P)"
          >
            📱 PDA (P)
          </button>

          {onToggleMap && (
            <button
              type="button"
              className="campus-hud-btn"
              onClick={() => {
                SoundEffects.playBlip();
                onToggleMap();
              }}
              title="Open Concourse Map (M)"
            >
              🗺 Map (M)
            </button>
          )}

          {onShowHint && (
            <button
              type="button"
              className="campus-hud-btn campus-hud-btn--hint"
              onClick={() => {
                SoundEffects.playBlip();
                onShowHint();
              }}
              title="Show Objective Hint (H)"
            >
              💡 Hint (H)
            </button>
          )}

          <button
            type="button"
            className="campus-hud-btn campus-hud-btn--menu"
            onClick={() => {
              SoundEffects.playBlip();
              setIsPaused(true);
            }}
            title="Open Pause Menu (Esc)"
          >
            ⏸ MENU (Esc)
          </button>
        </div>
      </div>

      {/* Persistent Mini Route Map HUD */}
      <div className="route-map-hud" aria-label="Station Route Trail">
        <div className="route-map-hud__title">
          <span className="hud-pulse" />
          <span>ROUTE TRAIL</span>
        </div>
        <div className="route-map-hud__checkpoints">
          <span className={`hud-ckpt ${cluesFound.includes('kiosk') ? 'is-done' : 'is-next'}`}>
            1 Kiosk {cluesFound.includes('kiosk') ? '✓' : '●'}
          </span>
          <span className="hud-arrow">→</span>
          <span
            className={`hud-ckpt ${
              cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-next' : ''
            }`}
          >
            2 Board {cluesFound.includes('board') ? '✓' : '○'}
          </span>
          <span className="hud-arrow">→</span>
          <span
            className={`hud-ckpt ${
              cluesFound.includes('desk') ? 'is-done' : cluesFound.includes('board') ? 'is-next' : ''
            }`}
          >
            3 Desk {cluesFound.includes('desk') ? '✓' : '○'}
          </span>
        </div>
      </div>

      {/* SF Quest / CampusEvac Minimap Radar */}
      <MinimapRadar
        playerX={playerCoords.x}
        playerZ={playerCoords.z}
        playerAngle={playerCoords.angle}
        cluesFound={cluesFound}
        onExpandMap={onToggleMap || (() => {})}
        activeWaypointId={activeWaypointId}
      />

      {/* Proximity Interaction Prompt when standing near a hotspot */}
      {nearbyHotspot && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill">
            <span className="key-cap" style={{ background: '#ffd23f', color: '#17131f' }}>
              Q
            </span>
            <span style={{ fontWeight: 700, color: '#ffd23f' }}>Friction Vision</span>
            <span>•</span>
            <span className="key-cap">E</span>
            <span>
              <strong>
                {nearbyHotspot === 'kiosk'
                  ? 'Ticket Kiosk (Arjun) 📋'
                  : nearbyHotspot === 'board'
                  ? 'Departure Board (Meera) 🚉'
                  : 'Help Desk (Kabir & Priya) 💁'}
              </strong>
            </span>
            <button
              className="proximity-prompt__btn"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => {
                if (onToggleFrictionVision) onToggleFrictionVision();
                else onTriggerEcho?.(nearbyHotspot);
              }}
              aria-label="Activate Friction Vision"
            >
              Vision (Q) →
            </button>
            <button className="proximity-prompt__btn" onClick={handleInteract} aria-label="Inspect landmark">
              Inspect (E)
            </button>
          </div>
        </div>
      )}

      {/* Proximity Interaction Prompt when standing near an NPC */}
      {nearbyNPC && !nearbyHotspot && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill">
            <span className="key-cap">E</span>
            <span>
              Talk to <strong>{nearbyNPC.name}</strong> ({nearbyNPC.role}) 💬
            </span>
            <button className="proximity-prompt__btn" onClick={handleInteract} aria-label={`Talk to ${nearbyNPC.name}`}>
              Talk →
            </button>
          </div>
        </div>
      )}

      {/* Transit Phone PDA Widget (P) */}
      <TransitPhoneWidget
        isOpen={isPhoneOpen}
        onClose={() => setIsPhoneOpen(false)}
        cluesFound={cluesFound}
        repairsCompleted={repairsCompleted}
        onLaunchBooking={() => {
          setIsPhoneOpen(false);
          if (onLaunchBookingChallenge) {
            onLaunchBookingChallenge();
          } else {
            onSelectHotspot('kiosk');
          }
        }}
        onOpenMap={() => {
          setIsPhoneOpen(false);
          onToggleMap?.();
        }}
        onOpenDesignLab={() => {
          setIsPhoneOpen(false);
          onOpenDesignLab?.();
        }}
      />

      {/* Pause Menu Modal (Esc) */}
      <PauseMenuModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestartDrill={() => {
          setIsPaused(false);
        }}
        onExitHome={() => {
          setIsPaused(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cameraMode={cameraMode}
        onToggleCamera={() => setCameraMode((m) => (m === 'over_the_shoulder' ? 'isometric' : 'over_the_shoulder'))}
        voiceNarration={voiceNarration}
        onToggleVoice={() => setVoiceNarration((v) => !v)}
        graphicsMode={graphicsMode}
        onToggleGraphics={() => setGraphicsMode((g) => (g === 'fast' ? 'high' : 'fast'))}
        activeRoleView={activeRoleView}
        onSelectRoleView={(r) => {
          setActiveRoleView(r);
          setIsPaused(false);
          if (r === 'designer') {
            onOpenDuoJam?.();
          } else if (r === 'evidence') {
            onOpenHowToPlay?.();
          }
        }}
        onOpenHowToPlay={() => {
          setIsPaused(false);
          onOpenHowToPlay?.();
        }}
      />
    </div>
  );
};
