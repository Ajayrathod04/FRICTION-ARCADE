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

export type CameraPreset = 'isometric' | 'orbit' | 'top_down' | 'front' | 'side';

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
  const [isCutawayView, setIsCutawayView] = useState<boolean>(false);
  const [isGateOpened, setIsGateOpened] = useState<boolean>(false);
  const [nearbyGate, setNearbyGate] = useState<boolean>(false);
  const [nearbyLab, setNearbyLab] = useState<boolean>(false);

  // Camera & Architectural View States
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('isometric');
  const cameraPresetRef = useRef<CameraPreset>('isometric');
  cameraPresetRef.current = cameraPreset;

  const [isXRayMode, setIsXRayMode] = useState<boolean>(false);
  const isXRayModeRef = useRef<boolean>(false);
  isXRayModeRef.current = isXRayMode;

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const zoomLevelRef = useRef<number>(1.0);
  zoomLevelRef.current = zoomLevel;

  const orbitAngles = useRef({ yaw: 0, pitch: 0 });
  const isPointerDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const [nearbyDoor, setNearbyDoor] = useState<string | null>(null);
  const nearbyDoorRef = useRef<string | null>(null);
  nearbyDoorRef.current = nearbyDoor;

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
  const isCutawayViewRef = useRef(isCutawayView);
  isCutawayViewRef.current = isCutawayView;
  const isGateOpenedRef = useRef(isGateOpened);
  isGateOpenedRef.current = isGateOpened;
  const envHandlesRef = useRef<any>(null);
  const charControllerRef = useRef<any>(null);

  const keysDown = useRef<{ [key: string]: boolean }>({});
  const pointerPos = useRef({ x: 0, y: 0 });

  // Landmark coordinates in world (Room 1, Room 2, Room 3)
  const hotspotPositions = {
    kiosk: new THREE.Vector3(0, 0, 0.2),
    board: new THREE.Vector3(5.4, 0, -1.25),
    desk: new THREE.Vector3(-5.6, 0, 0.2),
  };

  const handleResetCamera = useCallback(() => {
    SoundEffects.playBlip();
    setCameraPreset('isometric');
    setZoomLevel(1.0);
    zoomLevelRef.current = 1.0;
    orbitAngles.current = { yaw: 0, pitch: 0 };
  }, []);

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
      } else if (e.key === '1') {
        e.preventDefault();
        SoundEffects.playBlip();
        setCameraPreset('isometric');
      } else if (e.key === '2') {
        e.preventDefault();
        SoundEffects.playBlip();
        setCameraPreset('orbit');
      } else if (e.key === '3') {
        e.preventDefault();
        SoundEffects.playBlip();
        setCameraPreset('top_down');
      } else if (e.key === '4') {
        e.preventDefault();
        SoundEffects.playBlip();
        setCameraPreset('front');
      } else if (e.key === '5') {
        e.preventDefault();
        SoundEffects.playBlip();
        setCameraPreset('side');
      } else if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        SoundEffects.playBlip();
        setIsXRayMode((prev) => !prev);
      } else if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleResetCamera();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        SoundEffects.playBlip();
        setIsPhoneOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        SoundEffects.playBlip();
        setIsCutawayView((prev) => !prev);
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
        if (nearbyGate && !isGateOpenedRef.current) {
          e.preventDefault();
          SoundEffects.playCollect();
          envHandlesRef.current?.openEntranceGate();
          charControllerRef.current?.setGateOpen(true);
          setIsGateOpened(true);
          RewardLedger.recordZoneVisit('atrium');
          if (voiceNarrationRef.current) {
            VoiceNarration.speak('Station entrance gate opened. Welcome to Friction Central.');
          }
        } else if (nearbyLab) {
          e.preventDefault();
          SoundEffects.playBlip();
          if (voiceNarrationRef.current) {
            VoiceNarration.speak('Entering Designer Workshop');
          }
          onOpenDesignLab?.();
        } else if (nearbyDoor) {
          e.preventDefault();
          SoundEffects.playBlip();
          if (voiceNarrationRef.current) {
            VoiceNarration.speak(`Entering ${nearbyDoor}`);
          }
        } else if (nearbyHotspot || nearbyNPC) {
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
  }, [nearbyHotspot, nearbyNPC, nearbyGate, nearbyLab, handleInteract, handleResetCamera, onToggleMap, onShowHint, onTriggerEcho, onToggleFrictionVision, onOpenDesignLab, cluesFound]);

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
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    camera.position.set(0.0, 3.8, 12.2);
    camera.lookAt(0.0, 1.8, 6.0);

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
    envHandlesRef.current = envHandles;

    // --- 6. BUILD ARTICULATED PROTAGONIST CONTROLLER ---
    const charController = createCharacterController({
      scene,
      avatarId: selectedAvatarId,
      initialX: 0.0,
      initialZ: 8.5,
    });
    charControllerRef.current = charController;

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
    const camRaycaster = new THREE.Raycaster();

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
      const playerPosY = charController.group.position.y;
      const playerAngle = charController.getAngle();

      // Apply Architectural Cutaway & Full X-Ray Walls States
      envHandles.setCutawayMode(isCutawayViewRef.current);
      envHandles.setXRayMode(isXRayModeRef.current);

      // Dynamic Camera Line-of-Sight Raycasting Obstruction Fading (when not in full X-Ray)
      if (!isXRayModeRef.current && !isCutawayViewRef.current) {
        const rayOrigin = camera.position.clone();
        const rayTarget = new THREE.Vector3(playerPos.x, 1.0, playerPos.z);
        const rayDir = rayTarget.clone().sub(rayOrigin).normalize();
        camRaycaster.set(rayOrigin, rayDir);
        const occluders = envHandles.getOccluderMeshes();
        const intersects = camRaycaster.intersectObjects(occluders, false);
        const hitMeshUuidSet = new Set(intersects.map((i) => i.object.uuid));

        for (const occ of occluders) {
          const mat = occ.material as THREE.MeshStandardMaterial;
          if (mat) {
            const isBlocked = hitMeshUuidSet.has(occ.uuid);
            const targetOp = isBlocked ? 0.22 : 1.0;
            mat.transparent = true;
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOp, 0.15);
            mat.depthWrite = mat.opacity > 0.85;
          }
        }
      }

      // Tick Station Environment, Collectibles, 5 Room Doors & Dual Trains
      const { collectedTokenId, nearbyDoorName } = envHandles.update(charController.group.position, time, delta);
      if (collectedTokenId) {
        SoundEffects.playCollect();
      }
      if (nearbyDoorName !== nearbyDoorRef.current) {
        setNearbyDoor(nearbyDoorName);
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

      // PROXIMITY DETECTION TO HOTSPOTS, ENTRANCE GATE, LAB & NPCS
      const playerVec = new THREE.Vector2(playerPos.x, playerPos.z);
      const kioskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.kiosk.x, hotspotPositions.kiosk.z));
      const boardDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.board.x, hotspotPositions.board.z));
      const deskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.desk.x, hotspotPositions.desk.z));

      // Proximity check to Entrance Gate (z = 4.4, x in [-2.2, 2.2])
      const inGateZone = playerPos.z >= 4.1 && playerPos.z <= 5.8 && Math.abs(playerPos.x) <= 2.2;
      setNearbyGate(inGateZone && !isGateOpenedRef.current);

      // Proximity check to Room 5 Designer Workshop Repair Stations
      const inLabZone = playerPos.x >= 3.8 && playerPos.x <= 7.6 && playerPos.z >= 2.8 && playerPos.z <= 4.8;
      setNearbyLab(inLabZone);

      const arjunDist = playerVec.distanceTo(new THREE.Vector2(0.0, 0.65));
      const meeraDist = playerVec.distanceTo(new THREE.Vector2(5.4, -0.4));
      const kabirDist = playerVec.distanceTo(new THREE.Vector2(-5.0, 0.55));
      const priyaDist = playerVec.distanceTo(new THREE.Vector2(-5.6, 0.1));
      const rajivDist = playerVec.distanceTo(new THREE.Vector2(-0.8, -2.9));
      const rohanDist = playerVec.distanceTo(new THREE.Vector2(-5.4, 3.2));
      const devDist = playerVec.distanceTo(new THREE.Vector2(2.2, 6.8));

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
      } else if (devDist < PROX_THRESHOLD) {
        setNearbyHotspot(null);
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'dev') || null);
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

      // Camera handling: Multi-Angle Camera Presets & Smooth Lerping
      const zoom = zoomLevelRef.current;
      const preset = cameraPresetRef.current;

      if (preset === 'top_down') {
        // High-angle architectural top-down view showing city, entrance, 5 rooms and both platforms
        const targetX = playerPos.x * 0.35;
        const targetY = 16.5 * zoom;
        const targetZ = playerPos.z * 0.35 - 1.2;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
        camera.lookAt(playerPos.x * 0.35, 0.4, playerPos.z * 0.35 - 2.0);
      } else if (preset === 'orbit') {
        // Free orbital camera rotating around player
        const dist = 5.6 * zoom;
        const yaw = orbitAngles.current.yaw;
        const pitch = 0.42 + orbitAngles.current.pitch;
        const targetX = playerPos.x + Math.sin(yaw) * Math.cos(pitch) * dist;
        const targetY = Math.max(1.2, playerPosY + 1.1 + Math.sin(pitch) * dist);
        const targetZ = playerPos.z + Math.cos(yaw) * Math.cos(pitch) * dist;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.14);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.14);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.14);
        camera.lookAt(playerPos.x, playerPosY + 0.9, playerPos.z);
      } else if (preset === 'front') {
        // Front view facing the traveler and environment ahead
        const targetX = playerPos.x;
        const targetY = playerPosY + 1.8 * zoom;
        const targetZ = playerPos.z - 3.8 * zoom;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
        camera.lookAt(playerPos.x, playerPosY + 0.95, playerPos.z + 0.5);
      } else if (preset === 'side') {
        // Lateral side view useful for inspecting architecture and platform alignment
        const targetX = playerPos.x + 6.2 * zoom;
        const targetY = playerPosY + 2.8 * zoom;
        const targetZ = playerPos.z;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
        camera.lookAt(playerPos.x, playerPosY + 0.9, playerPos.z);
      } else {
        // High-clarity 3/4 isometric follow camera centered behind player (Default)
        const isOutdoor = playerPos.z > 4.4;
        const camTargetX = THREE.MathUtils.clamp(playerPos.x * 0.82 + pointerPos.current.x * 0.2, -7.2, 7.2);
        const camTargetY = (isOutdoor ? 3.4 : 3.65) * zoom;
        const camTargetZ = Math.min(playerPos.z + (isOutdoor ? 4.2 : 3.8) * zoom + pointerPos.current.y * 0.15, 13.2);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, camTargetY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
        const targetLookY = isOutdoor ? 2.1 : 0.95;
        const targetLookZ = isOutdoor ? playerPos.z - 2.8 : playerPos.z - 1.0;
        camera.lookAt(playerPos.x * 0.82, targetLookY, targetLookZ);
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

    // MOUSE DRAG ROTATION & WHEEL ZOOM
    const onContainerPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('button, input, select, .proximity-prompt, .campus-concourse-hud, .camera-view-toolbar, .route-map-hud')) {
        return;
      }
      isPointerDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const onContainerPointerMove = (e: PointerEvent) => {
      if (!isPointerDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };

      orbitAngles.current.yaw -= dx * 0.007;
      orbitAngles.current.pitch = THREE.MathUtils.clamp(orbitAngles.current.pitch + dy * 0.005, -0.45, 0.75);

      if (cameraPresetRef.current !== 'orbit' && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        setCameraPreset('orbit');
      }
    };

    const onContainerPointerUp = () => {
      isPointerDragging.current = false;
    };

    const onContainerWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.08 : -0.08;
      const nextZoom = THREE.MathUtils.clamp(zoomLevelRef.current + delta, 0.55, 2.2);
      zoomLevelRef.current = nextZoom;
      setZoomLevel(Number(nextZoom.toFixed(2)));
    };

    container.addEventListener('pointerdown', onContainerPointerDown);
    window.addEventListener('pointermove', onContainerPointerMove);
    window.addEventListener('pointerup', onContainerPointerUp);
    container.addEventListener('wheel', onContainerWheel, { passive: false });

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onContainerPointerDown);
      window.removeEventListener('pointermove', onContainerPointerMove);
      window.removeEventListener('pointerup', onContainerPointerUp);
      container.removeEventListener('wheel', onContainerWheel);
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

          {/* Full X-Ray Walls Transparency Toggle */}
          <button
            type="button"
            className={`campus-hud-btn ${isXRayMode ? 'campus-hud-btn--active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setIsXRayMode((v) => !v);
            }}
            title="Toggle Complete X-Ray Wall Transparency (X)"
            style={{
              background: isXRayMode ? '#10b981' : '#ffffff',
              color: isXRayMode ? '#ffffff' : '#17131f',
              fontWeight: 800,
              boxShadow: isXRayMode ? '0 0 10px rgba(16, 185, 129, 0.7)' : undefined,
            }}
          >
            👓 {isXRayMode ? 'X-Ray ON (X)' : 'X-Ray (X)'}
          </button>

          {/* Architectural Cutaway View Toggle */}
          <button
            type="button"
            className={`campus-hud-btn ${isCutawayView ? 'campus-hud-btn--active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setIsCutawayView((v) => !v);
            }}
            title="Toggle Architectural Cutaway View (V)"
            style={{
              background: isCutawayView ? '#b6ffb2' : '#ffffff',
              color: '#17131f',
              fontWeight: 700,
            }}
          >
            🏛 {isCutawayView ? 'Cutaway ON (V)' : 'Cutaway (V)'}
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

      {/* Multi-Angle Camera & Architectural View Toolbar */}
      <div className="camera-view-toolbar" role="toolbar" aria-label="Camera and Architecture Controls">
        <div className="camera-preset-group">
          <span className="cam-tool-label">CAMERA:</span>
          <button
            type="button"
            className={`cam-preset-btn ${cameraPreset === 'isometric' ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setCameraPreset('isometric');
            }}
            title="3/4 Follow / Isometric Third-Person View (1)"
          >
            FOLLOW
          </button>
          <button
            type="button"
            className={`cam-preset-btn ${cameraPreset === 'orbit' ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setCameraPreset('orbit');
            }}
            title="Free Orbit Camera (2) · Drag scene to rotate"
          >
            ORBIT
          </button>
          <button
            type="button"
            className={`cam-preset-btn ${cameraPreset === 'top_down' ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setCameraPreset('top_down');
            }}
            title="Top-Down Concourse & Platforms View (3)"
          >
            TOP-DOWN
          </button>
          <button
            type="button"
            className={`cam-preset-btn ${cameraPreset === 'front' ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setCameraPreset('front');
            }}
            title="Front Facing View (4)"
          >
            FRONT
          </button>
          <button
            type="button"
            className={`cam-preset-btn ${cameraPreset === 'side' ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setCameraPreset('side');
            }}
            title="Lateral Side View (5)"
          >
            SIDE
          </button>
        </div>

        <div className="camera-action-group">
          {/* X-Ray Walls Toggle */}
          <button
            type="button"
            className={`cam-action-btn cam-action-btn--xray ${isXRayMode ? 'is-active' : ''}`}
            onClick={() => {
              SoundEffects.playBlip();
              setIsXRayMode((v) => !v);
            }}
            title="Toggle Complete X-Ray Wall Transparency (X)"
          >
            <span className="cam-icon">👓</span>
            <span>{isXRayMode ? 'X-RAY ON (X)' : 'X-RAY WALLS (X)'}</span>
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            className="cam-action-btn cam-action-btn--reset"
            onClick={handleResetCamera}
            title="Reset Camera View to Default Isometric (R)"
          >
            ↺ RESET CAMERA
          </button>

          {/* Zoom In / Out Controls */}
          <div className="cam-zoom-group">
            <button
              type="button"
              className="cam-zoom-btn"
              onClick={() => {
                const nz = Math.min(2.2, zoomLevel + 0.15);
                setZoomLevel(Number(nz.toFixed(2)));
                zoomLevelRef.current = nz;
              }}
              title="Zoom Out"
            >
              −
            </button>
            <span className="cam-zoom-val">{Math.round(zoomLevel * 100)}%</span>
            <button
              type="button"
              className="cam-zoom-btn"
              onClick={() => {
                const nz = Math.max(0.55, zoomLevel - 0.15);
                setZoomLevel(Number(nz.toFixed(2)));
                zoomLevelRef.current = nz;
              }}
              title="Zoom In"
            >
              +
            </button>
          </div>
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

      {/* Proximity Interaction Prompt for Entrance Gate */}
      {nearbyGate && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill" style={{ background: '#17131f', border: '3px solid #ffd23f' }}>
            <span className="key-cap" style={{ background: '#ffd23f', color: '#17131f' }}>
              E
            </span>
            <span>
              <strong>Station Entrance Gate · Press E to Open 🏛</strong>
            </span>
            <button
              className="proximity-prompt__btn"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => {
                SoundEffects.playCollect();
                envHandlesRef.current?.openEntranceGate();
                charControllerRef.current?.setGateOpen(true);
                setIsGateOpened(true);
                RewardLedger.recordZoneVisit('atrium');
              }}
              aria-label="Open Station Gate"
            >
              Open Gate (E) →
            </button>
          </div>
        </div>
      )}

      {/* Proximity Interaction Prompt for Room 5 Designer Workshop Repair Stations */}
      {nearbyLab && !nearbyHotspot && !nearbyNPC && !nearbyGate && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill" style={{ background: '#2e1065', border: '3px solid #c084fc' }}>
            <span className="key-cap" style={{ background: '#c084fc', color: '#17131f' }}>
              E
            </span>
            <span style={{ color: '#ffffff' }}>
              <strong>Designer Workshop: Open Repair Lab Stations ⚡</strong>
            </span>
            <button
              className="proximity-prompt__btn"
              style={{ background: '#c084fc', color: '#17131f', fontWeight: 800 }}
              onClick={() => {
                SoundEffects.playBlip();
                onOpenDesignLab?.();
              }}
              aria-label="Open Repair Lab"
            >
              Repair Lab (E) →
            </button>
          </div>
        </div>
      )}

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
      {nearbyNPC && !nearbyHotspot && !nearbyGate && (
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

      {/* Proximity Interaction Prompt for Room Doors */}
      {nearbyDoor && !nearbyHotspot && !nearbyNPC && !nearbyGate && !nearbyLab && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill" style={{ background: '#0f172a', border: '3px solid #38bdf8' }}>
            <span style={{ fontSize: '16px' }}>🚪</span>
            <span style={{ color: '#ffffff' }}>
              <strong>E — Enter {nearbyDoor}</strong>
            </span>
            <button
              type="button"
              className="proximity-prompt__btn"
              onClick={() => {
                if (voiceNarrationRef.current) {
                  VoiceNarration.speak(`Entering ${nearbyDoor}`);
                }
                SoundEffects.playBlip();
              }}
              aria-label={`Enter ${nearbyDoor}`}
            >
              Enter →
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
