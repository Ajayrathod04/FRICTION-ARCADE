import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { AVATAR_CHOICES, STATION_NPCS, STATION_ECHOES } from '../../data/missionData';
import type { StationNPC } from '../../data/missionData';
import { MinimapRadar } from './MinimapRadar';
import { TransitPhoneWidget } from './TransitPhoneWidget';
import { PauseMenuModal } from './PauseMenuModal';
import { SoundEffects, VoiceNarration } from '../../lib/audio';

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
  const [playerCoords, setPlayerCoords] = useState({ x: 0.2, z: 2.2, angle: 0 });

  const isPausedRef = useRef(false);
  isPausedRef.current = isPaused;
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;
  const voiceNarrationRef = useRef(voiceNarration);
  voiceNarrationRef.current = voiceNarration;

  // Character world position (approaching ticket kiosk)
  const playerPos = useRef({ x: 0.2, z: 2.2 });
  const playerAngle = useRef(0);
  const keysDown = useRef<{ [key: string]: boolean }>({});
  const pointerPos = useRef({ x: 0, y: 0 });

  const hotspotPositions = {
    kiosk: new THREE.Vector3(0, 0, 0),
    board: new THREE.Vector3(2.4, 0, -1.2),
    desk: new THREE.Vector3(-2.4, 0, 0.4),
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
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        SoundEffects.playCollect();
        const target = nearbyHotspot || (!cluesFound.includes('kiosk') ? 'kiosk' : !cluesFound.includes('board') ? 'board' : 'desk');
        onTriggerEcho?.(target);
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
  }, [nearbyHotspot, nearbyNPC, handleInteract, onToggleMap, onShowHint]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // --- 1. SCENE SETUP ---
    const scene = new THREE.Scene();
    const isClarity = repairsComplete || repairsCompleted.length === 3;
    const clarityLevel = repairsCompleted.length;

    // Background responds to Clarity Mode
    scene.background = new THREE.Color(isClarity ? 0x221838 : 0x181226);

    // --- 2. CAMERA ---
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(3.4, 4.0, 5.2);
    camera.lookAt(0, 0.6, 0);

    // --- 3. RENDERER ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3 + clarityLevel * 0.05;
    container.appendChild(renderer.domElement);

    // --- 4. LIGHTING SYSTEM ---
    const ambientLight = new THREE.AmbientLight(
      isClarity ? 0xfff3e0 : 0xffecd2,
      isClarity ? 1.5 : 1.2
    );
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffe2b8, 0x584478, isClarity ? 1.2 : 0.95);
    scene.add(hemiLight);

    // Main Warm Sun/Canopy Light
    const sunLight = new THREE.DirectionalLight(0xffbe60, isClarity ? 2.6 : 2.2);
    sunLight.position.set(5, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Dynamic Neon Accent Light
    const neonPink = new THREE.PointLight(0xff3d8b, 3.2, 12);
    neonPink.position.set(0, 2.8, 0.4);
    scene.add(neonPink);

    const cyanRim = new THREE.DirectionalLight(0x8ddcff, 1.4);
    cyanRim.position.set(-5, 4, -2);
    scene.add(cyanRim);

    // Station Root Group
    const stationGroup = new THREE.Group();
    scene.add(stationGroup);

    // --- 5. PLATFORM (Warm Stone Pavers with Tactile Borders) ---
    const platformGeo = new THREE.BoxGeometry(8.8, 0.4, 7.2);
    const platformMat = new THREE.MeshStandardMaterial({
      color: isClarity ? 0xf2e8d8 : 0xdfd2bf,
      roughness: 0.35,
      metalness: 0.05,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -0.2, 0);
    platform.receiveShadow = true;
    stationGroup.add(platform);

    // Platform edge safety border (yellow tactile stripe)
    const safetyStripeGeo = new THREE.BoxGeometry(8.8, 0.02, 0.35);
    const safetyStripeMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 });
    const safetyStripe = new THREE.Mesh(safetyStripeGeo, safetyStripeMat);
    safetyStripe.position.set(0, 0.01, -3.4);
    stationGroup.add(safetyStripe);

    // Track Bed and Rails
    const trackBedGeo = new THREE.BoxGeometry(9.0, 0.25, 2.2);
    const trackBedMat = new THREE.MeshStandardMaterial({ color: 0x14101e, roughness: 0.85 });
    const trackBed = new THREE.Mesh(trackBedGeo, trackBedMat);
    trackBed.position.set(0, -0.2, -4.6);
    stationGroup.add(trackBed);

    for (const rz of [-4.2, -5.0]) {
      const railGeo = new THREE.BoxGeometry(9.0, 0.06, 0.08);
      const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(0, -0.05, rz);
      stationGroup.add(rail);
    }

    // Stylized Passenger Train Car on Tracks
    const trainGroup = new THREE.Group();
    trainGroup.position.set(0, 0.65, -4.6);

    const trainBodyGeo = new THREE.BoxGeometry(8.6, 1.4, 1.5);
    const trainBodyMat = new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.25, metalness: 0.15 });
    const trainBody = new THREE.Mesh(trainBodyGeo, trainBodyMat);
    trainBody.castShadow = true;
    trainGroup.add(trainBody);

    const trainRoofGeo = new THREE.BoxGeometry(8.7, 0.2, 1.6);
    const trainRoofMat = new THREE.MeshStandardMaterial({ color: 0x1c1729, roughness: 0.3 });
    const trainRoof = new THREE.Mesh(trainRoofGeo, trainRoofMat);
    trainRoof.position.y = 0.8;
    trainGroup.add(trainRoof);

    // Glowing train windows
    for (let i = -3.2; i <= 3.2; i += 1.3) {
      const winGeo = new THREE.BoxGeometry(0.75, 0.5, 0.06);
      const winMat = new THREE.MeshStandardMaterial({ color: 0xfff6e5, emissive: 0xffd23f, emissiveIntensity: 0.6 });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(i, 0.15, 0.76);
      trainGroup.add(win);
    }
    stationGroup.add(trainGroup);

    // Back Arched Canopy Architecture (Positioned at negative Z behind platform)
    const backWallGeo = new THREE.BoxGeometry(8.8, 3.8, 0.4);
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x2e2444, roughness: 0.6 });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 1.9, -3.6);
    stationGroup.add(backWall);

    // Station Canopy Arches
    for (const px of [-3.5, 3.5]) {
      const archPillarGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.6, 12);
      const archPillarMat = new THREE.MeshStandardMaterial({ color: 0x1c1729, roughness: 0.4 });
      const pillar = new THREE.Mesh(archPillarGeo, archPillarMat);
      pillar.position.set(px, 1.8, -1.8);
      stationGroup.add(pillar);
    }

    // Overhead Station Marquee Sign "FRICTION ARCADE · TRANSIT"
    const marqueeGeo = new THREE.BoxGeometry(4.2, 0.55, 0.15);
    const marqueeMat = new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: isClarity ? 0xb6ffb2 : 0xffd23f,
      emissiveIntensity: 0.4,
    });
    const marquee = new THREE.Mesh(marqueeGeo, marqueeMat);
    marquee.position.set(0, 3.4, -1.8);
    stationGroup.add(marquee);

    // --- 6. FRICTION TRAIL (Interactive Animated Floor Stepping Stones) ---
    const trailPoints = [
      new THREE.Vector3(0, 0.02, 1.8),
      new THREE.Vector3(0, 0.02, 0.9),
      new THREE.Vector3(0, 0.02, 0), // Kiosk
      new THREE.Vector3(0.8, 0.02, -0.4),
      new THREE.Vector3(1.6, 0.02, -0.8),
      new THREE.Vector3(2.4, 0.02, -1.2), // Departure Board
      new THREE.Vector3(1.2, 0.02, -0.2),
      new THREE.Vector3(-0.6, 0.02, 0.2),
      new THREE.Vector3(-1.6, 0.02, 0.3),
      new THREE.Vector3(-2.4, 0.02, 0.4), // Help Desk
    ];

    const trailDiscs: THREE.Mesh[] = [];
    trailPoints.forEach((pt, idx) => {
      const discGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.02, 16);
      const discMat = new THREE.MeshStandardMaterial({
        color: 0xffd23f,
        emissive: 0xffd23f,
        emissiveIntensity: 0.4,
        roughness: 0.3,
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(pt);
      stationGroup.add(disc);
      trailDiscs.push(disc);
    });

    // Floor Target Ring around Kiosk
    const kioskRingGeo = new THREE.RingGeometry(0.85, 1.05, 32);
    const kioskRingMat = new THREE.MeshBasicMaterial({
      color: cluesFound.includes('kiosk') ? 0xb6ffb2 : 0xff8a1f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const kioskRing = new THREE.Mesh(kioskRingGeo, kioskRingMat);
    kioskRing.rotation.x = -Math.PI / 2;
    kioskRing.position.set(0, 0.02, 0);
    stationGroup.add(kioskRing);

    // Floor Target Ring around Departure Board
    const boardRingGeo = new THREE.RingGeometry(0.85, 1.05, 32);
    const boardRingMat = new THREE.MeshBasicMaterial({
      color: cluesFound.includes('board') ? 0xb6ffb2 : 0xff3b30,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const boardRing = new THREE.Mesh(boardRingGeo, boardRingMat);
    boardRing.rotation.x = -Math.PI / 2;
    boardRing.position.set(2.4, 0.02, -1.2);
    stationGroup.add(boardRing);

    // Floor Target Ring around Help Desk
    const deskRingGeo = new THREE.RingGeometry(0.85, 1.05, 32);
    const deskRingMat = new THREE.MeshBasicMaterial({
      color: cluesFound.includes('desk') ? 0xb6ffb2 : 0x8ddcff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const deskRing = new THREE.Mesh(deskRingGeo, deskRingMat);
    deskRing.rotation.x = -Math.PI / 2;
    deskRing.position.set(-2.4, 0.02, 0.4);
    stationGroup.add(deskRing);

    // --- 7. TICKET KIOSK (Checkpoint 1 — Clarity Transforms) ---
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(0, 0, 0);

    const kioskCabinetGeo = new THREE.BoxGeometry(0.85, 1.75, 0.65);
    const kioskCabinetMat = new THREE.MeshStandardMaterial({
      color: 0xff8a1f,
      roughness: 0.25,
      metalness: 0.1,
    });
    const kioskCabinet = new THREE.Mesh(kioskCabinetGeo, kioskCabinetMat);
    kioskCabinet.position.y = 0.875;
    kioskCabinet.castShadow = true;
    kioskGroup.add(kioskCabinet);

    // Kiosk Top Persistent Banner (Transforms in Clarity Mode)
    const kioskBannerGeo = new THREE.BoxGeometry(0.78, 0.22, 0.06);
    const isLabelsRepaired = repairsCompleted.includes('labels');
    const kioskBannerMat = new THREE.MeshStandardMaterial({
      color: isLabelsRepaired ? 0xb6ffb2 : 0xffd23f,
      emissive: isLabelsRepaired ? 0x059669 : 0xffa550,
      emissiveIntensity: 0.5,
    });
    const kioskBanner = new THREE.Mesh(kioskBannerGeo, kioskBannerMat);
    kioskBanner.position.set(0, 1.58, 0.33);
    kioskGroup.add(kioskBanner);

    // Kiosk Screen (Transforms: From Cryptic Red Warning to Crisp Blue/Green)
    const kioskScreenGeo = new THREE.PlaneGeometry(0.62, 0.62);
    const screenColor = isLabelsRepaired ? 0x8ddcff : cluesFound.includes('kiosk') ? 0xb6ffb2 : 0xffe5ec;
    const kioskScreenMat = new THREE.MeshStandardMaterial({
      color: screenColor,
      emissive: screenColor,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    });
    const kioskScreen = new THREE.Mesh(kioskScreenGeo, kioskScreenMat);
    kioskScreen.position.set(0, 1.05, 0.33);
    kioskGroup.add(kioskScreen);

    // Ticket Output Mouth
    const kioskSlotGeo = new THREE.BoxGeometry(0.38, 0.04, 0.05);
    const kioskSlotMat = new THREE.MeshStandardMaterial({ color: 0x17131f });
    const kioskSlot = new THREE.Mesh(kioskSlotGeo, kioskSlotMat);
    kioskSlot.position.set(0, 0.55, 0.33);
    kioskGroup.add(kioskSlot);

    stationGroup.add(kioskGroup);

    // --- 8. DEPARTURE BOARD (Checkpoint 2 — Clarity Transforms) ---
    const boardGroup = new THREE.Group();
    boardGroup.position.copy(hotspotPositions.board);

    const boardPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.7, 8);
    const boardPostMat = new THREE.MeshStandardMaterial({ color: 0x1c1729, roughness: 0.4 });
    const boardPost = new THREE.Mesh(boardPostGeo, boardPostMat);
    boardPost.position.y = 1.35;
    boardPost.castShadow = true;
    boardGroup.add(boardPost);

    const boardHousingGeo = new THREE.BoxGeometry(1.65, 1.05, 0.25);
    const boardHousingMat = new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.3 });
    const boardHousing = new THREE.Mesh(boardHousingGeo, boardHousingMat);
    boardHousing.position.y = 2.2;
    boardHousing.castShadow = true;
    boardGroup.add(boardHousing);

    // LED Schedule Display (Transforms in Clarity Mode from red error to green ON TIME)
    const isErrorsRepaired = repairsCompleted.includes('errors');
    const boardScreenGeo = new THREE.PlaneGeometry(1.5, 0.9);
    const boardLedColor = isErrorsRepaired ? 0x22c55e : cluesFound.includes('board') ? 0xb6ffb2 : 0xff3b30;
    const boardScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0c0a14,
      emissive: boardLedColor,
      emissiveIntensity: 0.5,
    });
    const boardScreen = new THREE.Mesh(boardScreenGeo, boardScreenMat);
    boardScreen.position.set(0, 2.2, 0.13);
    boardGroup.add(boardScreen);

    stationGroup.add(boardGroup);

    // --- 9. HELP DESK (Checkpoint 3 — Clarity Transforms) ---
    const deskGroup = new THREE.Group();
    deskGroup.position.copy(hotspotPositions.desk);

    const deskCounterGeo = new THREE.BoxGeometry(1.55, 0.95, 0.8);
    const isActionsRepaired = repairsCompleted.includes('actions');
    const deskCounterMat = new THREE.MeshStandardMaterial({
      color: isActionsRepaired ? 0xc7b5ff : 0xaa98df,
      roughness: 0.35,
    });
    const deskCounter = new THREE.Mesh(deskCounterGeo, deskCounterMat);
    deskCounter.position.y = 0.475;
    deskCounter.castShadow = true;
    deskGroup.add(deskCounter);

    // Overhead Help Sign
    const deskSignGeo = new THREE.BoxGeometry(0.95, 0.3, 0.1);
    const deskSignMat = new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: isActionsRepaired ? 0xb6ffb2 : 0xffd23f,
      emissiveIntensity: isActionsRepaired ? 0.6 : 0.35,
    });
    const deskSign = new THREE.Mesh(deskSignGeo, deskSignMat);
    deskSign.position.set(0, 1.85, 0);
    deskGroup.add(deskSign);

    const deskPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
    const deskPole = new THREE.Mesh(deskPoleGeo, boardPostMat);
    deskPole.position.set(0, 1.4, 0);
    deskGroup.add(deskPole);

    // Desk Lamp with Warm Light Cone
    const deskLampBaseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8);
    const deskLampBase = new THREE.Mesh(deskLampBaseGeo, boardPostMat);
    deskLampBase.position.set(-0.45, 1.05, 0.15);
    deskGroup.add(deskLampBase);

    const deskLampConeGeo = new THREE.ConeGeometry(0.12, 0.14, 8);
    const deskLampConeMat = new THREE.MeshStandardMaterial({
      color: 0xffbe60,
      emissive: 0xffbe60,
      emissiveIntensity: isActionsRepaired ? 0.8 : 0.4,
    });
    const deskLampCone = new THREE.Mesh(deskLampConeGeo, deskLampConeMat);
    deskLampCone.position.set(-0.45, 1.2, 0.15);
    deskLampCone.rotation.x = Math.PI;
    deskGroup.add(deskLampCone);

    stationGroup.add(deskGroup);

    // --- 9.5 STATION NPCS (Screen 04 — In-world Characters) ---
    // NPC 1: Agent Priya (behind Help Desk counter)
    const priyaGroup = new THREE.Group();
    priyaGroup.position.set(-2.4, 0.48, 0.1);
    const priyaBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x8a63d2, roughness: 0.4 }));
    priyaBody.position.y = 0.25;
    const priyaHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf8d7b8 }));
    priyaHead.position.y = 0.62;
    const priyaHair = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: 0x1f140e }));
    priyaHair.position.set(0, 0.66, 0);
    priyaGroup.add(priyaBody, priyaHead, priyaHair);
    stationGroup.add(priyaGroup);

    // NPC 2: Commuter Arjun (sitting on platform bench)
    const arjunGroup = new THREE.Group();
    arjunGroup.position.set(1.6, 0.28, 1.6);
    const arjunBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.48, 12), new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 }));
    arjunBody.position.y = 0.24;
    const arjunHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshStandardMaterial({ color: 0xe0b696 }));
    arjunHead.position.y = 0.58;
    const arjunHair = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    arjunHair.position.set(0, 0.66, 0);
    arjunGroup.add(arjunBody, arjunHead, arjunHair);
    stationGroup.add(arjunGroup);

    // NPC 3: Conductor Rajiv (standing near train doors)
    const rajivGroup = new THREE.Group();
    rajivGroup.position.set(-0.8, 0, -2.8);
    const rajivBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.62, 12), new THREE.MeshStandardMaterial({ color: 0x1a237e, roughness: 0.3 }));
    rajivBody.position.y = 0.6;
    const rajivHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), new THREE.MeshStandardMaterial({ color: 0xf0cbb0 }));
    rajivHead.position.y = 1.05;
    const rajivCap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 12), new THREE.MeshStandardMaterial({ color: 0x1a237e }));
    rajivCap.position.set(0, 1.16, 0);
    const rajivBrim = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.02, 0.1), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    rajivBrim.position.set(0, 1.13, 0.1);
    rajivGroup.add(rajivBody, rajivHead, rajivCap, rajivBrim);
    stationGroup.add(rajivGroup);

    // --- 9.8 FRICTION ECHO GHOST PASSENGER (Signature Mechanic Visualizer) ---
    const ghostGroup = new THREE.Group();
    const ghostMat = new THREE.MeshStandardMaterial({
      color: 0x8ddcff,
      emissive: 0x8ddcff,
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.72,
      roughness: 0.2,
    });
    const ghostBody = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.55, 12), ghostMat);
    ghostBody.position.y = 0.55;
    const ghostHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), ghostMat);
    ghostHead.position.y = 0.95;
    // Glowing floating beacon badge over ghost's head
    const beaconGeo = new THREE.RingGeometry(0.12, 0.18, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.y = 1.35;
    ghostGroup.add(ghostBody, ghostHead, beacon);

    // Position ghost near current active target checkpoint or hesitation point
    const activeHotspotTarget = !cluesFound.includes('kiosk') ? 'kiosk' : !cluesFound.includes('board') ? 'board' : 'desk';
    const activeEchoData = STATION_ECHOES[activeHotspotTarget];
    ghostGroup.position.set(activeEchoData.hesitationPoint.x, 0, activeEchoData.hesitationPoint.z);
    stationGroup.add(ghostGroup);

    // --- 10. REFINED PROTAGONIST TRAVELER CHARACTER ---
    // Configured by selectedAvatarId
    const activeAvatar = AVATAR_CHOICES.find((a) => a.id === selectedAvatarId) || AVATAR_CHOICES[0];
    const playerGroup = new THREE.Group();
    playerGroup.position.set(playerPos.current.x, 0, playerPos.current.z);

    // Torso (Jacket / Hoodie)
    const hoodieGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.65, 16);
    const hoodieMat = new THREE.MeshStandardMaterial({ color: activeAvatar.jacketColor, roughness: 0.45 });
    const hoodie = new THREE.Mesh(hoodieGeo, hoodieMat);
    hoodie.position.y = 0.62;
    hoodie.castShadow = true;
    playerGroup.add(hoodie);

    // Hood / Collar trim
    const hoodTrimGeo = new THREE.TorusGeometry(0.16, 0.05, 8, 16);
    const hoodTrim = new THREE.Mesh(hoodTrimGeo, hoodieMat);
    hoodTrim.rotation.x = Math.PI / 2.2;
    hoodTrim.position.set(0, 0.88, -0.06);
    playerGroup.add(hoodTrim);

    // Head with warm skin tone
    const headGeo = new THREE.SphereGeometry(0.17, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf8d7b8, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.08;
    head.castShadow = true;
    playerGroup.add(head);

    // Custom Hairstyle
    const hairMat = new THREE.MeshStandardMaterial({ color: activeAvatar.hairColor, roughness: 0.7 });
    if (activeAvatar.hairStyle === 'topknot') {
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairCrown.position.set(0, 1.13, 0);
      const topknot = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), hairMat);
      topknot.position.set(0, 1.32, -0.04);
      playerGroup.add(hairCrown, topknot);
    } else if (activeAvatar.hairStyle === 'parted') {
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairCrown.position.set(0, 1.13, 0);
      const sideLock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.22), hairMat);
      sideLock.position.set(0.08, 1.22, 0);
      sideLock.rotation.z = -0.25;
      playerGroup.add(hairCrown, sideLock);
    } else {
      // Tousled Dark Hair with natural tufts
      const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      hairCrown.position.set(0, 1.13, 0);
      playerGroup.add(hairCrown);

      const tuftGeo = new THREE.ConeGeometry(0.06, 0.12, 6);
      for (const tx of [-0.07, 0, 0.07]) {
        const tuft = new THREE.Mesh(tuftGeo, hairMat);
        tuft.rotation.x = -Math.PI / 2.8;
        tuft.rotation.z = tx * 2;
        tuft.position.set(tx, 1.18, 0.13);
        playerGroup.add(tuft);
      }
    }

    // Backpack
    const backpackGeo = new THREE.BoxGeometry(0.26, 0.34, 0.18);
    const backpackMat = new THREE.MeshStandardMaterial({ color: activeAvatar.backpackColor, roughness: 0.4 });
    const backpack = new THREE.Mesh(backpackGeo, backpackMat);
    backpack.position.set(0, 0.64, -0.22);
    backpack.castShadow = true;
    playerGroup.add(backpack);

    // Backpack front badge patches
    const patch1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), new THREE.MeshStandardMaterial({ color: 0xff3d8b }));
    patch1.position.set(-0.06, 0.68, -0.32);
    playerGroup.add(patch1);
    const patch2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.02), new THREE.MeshStandardMaterial({ color: 0x8ddcff }));
    patch2.position.set(0.06, 0.62, -0.32);
    playerGroup.add(patch2);

    // Articulated Arms (Orange sleeves + hands)
    const armMat = hoodieMat;
    const handMat = headMat;

    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.28, 0.85, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.36, 8), armMat);
    leftArmMesh.position.y = -0.18;
    leftArmMesh.castShadow = true;
    const leftHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), handMat);
    leftHandMesh.position.y = -0.38;
    leftArmGroup.add(leftArmMesh, leftHandMesh);
    playerGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.28, 0.85, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.36, 8), armMat);
    rightArmMesh.position.y = -0.18;
    rightArmMesh.castShadow = true;
    const rightHandMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), handMat);
    rightHandMesh.position.y = -0.38;
    rightArmGroup.add(rightArmMesh, rightHandMesh);
    playerGroup.add(rightArmGroup);

    // Articulated Legs (Dark Trousers + White-soled Sneakers)
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x221c30, roughness: 0.6 });
    const sneakerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.11, 0.36, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.36, 8), pantsMat);
    leftLegMesh.position.y = -0.16;
    leftLegMesh.castShadow = true;
    const leftShoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), sneakerMat);
    leftShoeMesh.position.set(0, -0.34, 0.04);
    leftShoeMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh, leftShoeMesh);
    playerGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.11, 0.36, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.36, 8), pantsMat);
    rightLegMesh.position.y = -0.16;
    rightLegMesh.castShadow = true;
    const rightShoeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.18), sneakerMat);
    rightShoeMesh.position.set(0, -0.34, 0.04);
    rightShoeMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh, rightShoeMesh);
    playerGroup.add(rightLegGroup);

    // Small Rolling Suitcase Beside Traveler
    const suitcaseGroup = new THREE.Group();
    suitcaseGroup.position.set(0.38, 0, -0.12);

    const suitcaseBodyGeo = new THREE.BoxGeometry(0.24, 0.44, 0.28);
    const suitcaseBodyMat = new THREE.MeshStandardMaterial({ color: 0xff3d8b, roughness: 0.35 });
    const suitcaseBody = new THREE.Mesh(suitcaseBodyGeo, suitcaseBodyMat);
    suitcaseBody.position.y = 0.24;
    suitcaseBody.castShadow = true;
    suitcaseGroup.add(suitcaseBody);

    // Chrome handle
    const handleGeo = new THREE.TorusGeometry(0.07, 0.015, 6, 12, Math.PI);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 });
    const suitcaseHandle = new THREE.Mesh(handleGeo, handleMat);
    suitcaseHandle.position.set(0, 0.52, 0);
    suitcaseGroup.add(suitcaseHandle);

    playerGroup.add(suitcaseGroup);

    // Soft Contact Shadow
    const shadowGeo = new THREE.RingGeometry(0.05, 0.38, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
    const shadowRing = new THREE.Mesh(shadowGeo, shadowMat);
    shadowRing.rotation.x = -Math.PI / 2;
    shadowRing.position.y = 0.01;
    playerGroup.add(shadowRing);

    stationGroup.add(playerGroup);

    // --- 11. PLAYFUL GLOSSY MOVING 3D OBJECTS (Inspired by 4 ui(1).jpeg) ---
    const movingObjectsGroup = new THREE.Group();
    stationGroup.add(movingObjectsGroup);

    // 1. Floating Dimensional Train Ticket
    const ticketGroup = new THREE.Group();
    ticketGroup.position.set(0, 2.7, 0);

    const ticketGeo = new THREE.BoxGeometry(0.85, 0.44, 0.05);
    const ticketMat = new THREE.MeshStandardMaterial({
      color: isClarity ? 0xb6ffb2 : 0xfff6e5,
      emissive: isClarity ? 0x059669 : 0xffd23f,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.1,
    });
    const ticketMesh = new THREE.Mesh(ticketGeo, ticketMat);
    ticketMesh.castShadow = true;
    ticketGroup.add(ticketMesh);

    // Gold/Red collectible stamp on ticket
    const stampGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    const stampMat = new THREE.MeshStandardMaterial({
      color: isClarity ? 0xffd23f : 0xff3b30,
      emissive: isClarity ? 0xffd23f : 0xff3b30,
      emissiveIntensity: 0.6,
    });
    const ticketStamp = new THREE.Mesh(stampGeo, stampMat);
    ticketStamp.rotation.x = Math.PI / 2;
    ticketStamp.position.set(0.24, 0, 0.035);
    ticketGroup.add(ticketStamp);
    movingObjectsGroup.add(ticketGroup);

    // 2. Glossy 4-Point Sparkle / Sunburst
    const sparkleGroup = new THREE.Group();
    sparkleGroup.position.set(2.2, 3.2, -0.6);
    const starCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa550, emissiveIntensity: 0.6, roughness: 0.2 })
    );
    sparkleGroup.add(starCore);

    for (let r = 0; r < 4; r++) {
      const ray = new THREE.Mesh(
        new THREE.ConeGeometry(0.07, 0.28, 8),
        new THREE.MeshStandardMaterial({ color: 0xff3d8b, emissive: 0xff3d8b, emissiveIntensity: 0.5, roughness: 0.2 })
      );
      ray.rotation.z = (r * Math.PI) / 2;
      ray.position.set(Math.cos((r * Math.PI) / 2) * 0.18, Math.sin((r * Math.PI) / 2) * 0.18, 0);
      sparkleGroup.add(ray);
    }
    movingObjectsGroup.add(sparkleGroup);

    // 3. Glossy Route Marker Pin
    const pinGroup = new THREE.Group();
    pinGroup.position.set(-2.0, 2.9, 0.8);
    const pinHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.2, metalness: 0.2 })
    );
    const pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffd23f, emissiveIntensity: 0.5 })
    );
    pinDot.position.z = 0.1;
    const pinTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.2 })
    );
    pinTip.rotation.x = Math.PI;
    pinTip.position.y = -0.14;
    pinGroup.add(pinHead, pinDot, pinTip);
    movingObjectsGroup.add(pinGroup);

    // 4. Glossy Magnifying Glass (Context Finder)
    const magnifierGroup = new THREE.Group();
    magnifierGroup.position.set(-1.2, 2.5, 1.6);
    const magRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.03, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.7, roughness: 0.2 })
    );
    const magLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x8ddcff, transparent: true, opacity: 0.6, roughness: 0.1 })
    );
    magLens.rotation.x = Math.PI / 2;
    const magHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.3 })
    );
    magHandle.position.set(0.14, -0.14, 0);
    magHandle.rotation.z = -Math.PI / 4;
    magnifierGroup.add(magRim, magLens, magHandle);
    movingObjectsGroup.add(magnifierGroup);

    // 5. Glossy Warning Badge (Error Feedback Checkpoint Object)
    const warningBadgeGroup = new THREE.Group();
    warningBadgeGroup.position.set(3.0, 3.0, -1.0);
    const badgeShieldGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.06, 6);
    const badgeShieldMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff3d8b,
      emissiveIntensity: 0.4,
      roughness: 0.2,
      metalness: 0.15,
    });
    const badgeShield = new THREE.Mesh(badgeShieldGeo, badgeShieldMat);
    badgeShield.rotation.x = Math.PI / 2;
    // Exclamation mark bar & dot
    const exclBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.016, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    exclBar.position.set(0, 0.02, 0.04);
    const exclDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    exclDot.position.set(0, -0.09, 0.04);
    warningBadgeGroup.add(badgeShield, exclBar, exclDot);
    movingObjectsGroup.add(warningBadgeGroup);

    // 6. Glossy Repair Token (Action Hierarchy Checkpoint Object)
    const repairTokenGroup = new THREE.Group();
    repairTokenGroup.position.set(-2.6, 2.7, 0.3);
    const tokenRimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.05, 24);
    const isDeskRepaired = repairsCompleted.includes('actions');
    const tokenRimMat = new THREE.MeshStandardMaterial({
      color: isDeskRepaired ? 0xb6ffb2 : 0xffd23f,
      emissive: isDeskRepaired ? 0x059669 : 0xff8a1f,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.4,
    });
    const tokenRim = new THREE.Mesh(tokenRimGeo, tokenRimMat);
    tokenRim.rotation.x = Math.PI / 2;
    // Miniature embossed 3D wrench emblem on token face
    const wrenchShaft = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.14, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.3 })
    );
    wrenchShaft.position.set(0, 0, 0.035);
    wrenchShaft.rotation.z = Math.PI / 4;
    repairTokenGroup.add(tokenRim, wrenchShaft);
    movingObjectsGroup.add(repairTokenGroup);

    // --- 12. ANIMATION & GAME LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let frameCount = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isPausedRef.current) {
        renderer.render(scene, camera);
        return;
      }

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Floating ticket animation (bounces higher on clarity)
      ticketGroup.position.y = 2.65 + Math.sin(time * 2.4) * 0.12;
      ticketGroup.rotation.y = time * 0.75 + pointerPos.current.x * 0.3;
      ticketGroup.rotation.z = Math.sin(time * 1.6) * 0.06;

      // 2. Sparkle gentle floating & spinning
      sparkleGroup.position.y = 3.2 + Math.sin(time * 3.0 + 1) * 0.14;
      sparkleGroup.rotation.z = time * 1.2;
      sparkleGroup.rotation.x = pointerPos.current.y * 0.2;

      // 3. Route Pin
      pinGroup.position.y = 2.9 + Math.sin(time * 2.2 + 2) * 0.1;
      pinGroup.rotation.y = time * 0.8;

      // 4. Magnifying Glass
      magnifierGroup.position.y = 2.5 + Math.sin(time * 2.0 + 3) * 0.12;
      magnifierGroup.rotation.z = Math.sin(time * 1.5) * 0.15;

      // 5. Warning Badge (spins when errors fixed or board clue collected)
      const boardActive = cluesFound.includes('board') || repairsCompleted.includes('errors');
      warningBadgeGroup.position.y = 3.0 + Math.sin(time * 2.6 + 1.5) * 0.12;
      warningBadgeGroup.rotation.y = boardActive ? time * 2.2 : Math.sin(time * 1.8) * 0.4;
      warningBadgeGroup.rotation.z = Math.sin(time * 2.0) * 0.1;

      // 6. Repair Token (celebratory spin when action repair is applied)
      const deskActive = cluesFound.includes('desk') || repairsCompleted.includes('actions');
      repairTokenGroup.position.y = 2.7 + Math.sin(time * 2.4 + 2.5) * 0.11;
      repairTokenGroup.rotation.y = deskActive ? time * 2.5 : time * 0.9;
      repairTokenGroup.rotation.x = Math.sin(time * 1.4) * 0.15;

      // Friction Trail progressive path illumination along route
      trailDiscs.forEach((disc, idx) => {
        let isPathActive = false;
        let activeColor = 0xffd23f;

        if (idx <= 2) {
          // Kiosk segment: always active
          isPathActive = true;
          activeColor = cluesFound.includes('kiosk') ? 0xb6ffb2 : 0xffd23f;
        } else if (idx <= 5) {
          // Board segment: active when kiosk visited
          isPathActive = cluesFound.includes('kiosk');
          activeColor = cluesFound.includes('board') ? 0xb6ffb2 : 0xff3b30;
        } else {
          // Desk segment: active when board visited
          isPathActive = cluesFound.includes('board');
          activeColor = cluesFound.includes('desk') ? 0xb6ffb2 : 0x8ddcff;
        }

        const pulse = Math.sin(time * 4 - idx * 0.5) * 0.5 + 0.5;
        const mat = disc.material as THREE.MeshStandardMaterial;
        mat.color.setHex(activeColor);
        mat.emissive.setHex(activeColor);
        mat.emissiveIntensity = isPathActive ? 0.35 + pulse * 0.55 : 0.08;
      });

      // Kiosk Screen Glow Pulse
      kioskScreenMat.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;

      // Friction Echo Ghost Passenger gentle hesitation sway
      beacon.rotation.y = time * 2.2;
      beacon.position.y = 1.35 + Math.sin(time * 3.5) * 0.08;
      ghostGroup.position.y = Math.sin(time * 2.4) * 0.03;

      // PLAYER WASD MOVEMENT & COLLISION BOUNDARIES
      const moveSpeed = keysDown.current['shift'] ? 4.0 : 2.4;
      let dx = 0;
      let dz = 0;

      if (keysDown.current['w'] || keysDown.current['arrowup']) dz -= 1;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) dz += 1;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) dx -= 1;
      if (keysDown.current['d'] || keysDown.current['arrowright']) dx -= 1;

      const isMoving = dx !== 0 || dz !== 0;

      if (isMoving) {
        const len = Math.hypot(dx, dz);
        const stepX = (dx / len) * moveSpeed * delta;
        const stepZ = (dz / len) * moveSpeed * delta;
        const nextX = THREE.MathUtils.clamp(playerPos.current.x + stepX, -3.7, 3.7);
        const nextZ = THREE.MathUtils.clamp(playerPos.current.z + stepZ, -2.4, 2.7);

        // Simple Level Collisions (cannot step through central kiosk or desk)
        const inKiosk = Math.abs(nextX) < 0.65 && Math.abs(nextZ) < 0.55;
        const inDesk = nextX > -3.1 && nextX < -1.7 && nextZ > 0.0 && nextZ < 0.85;

        if (!inKiosk && !inDesk) {
          playerPos.current.x = nextX;
          playerPos.current.z = nextZ;
        }

        // Turn smoothly toward movement direction
        const targetAngle = Math.atan2(dx, dz);
        playerAngle.current = THREE.MathUtils.lerp(playerAngle.current, targetAngle, 0.2);
        playerGroup.rotation.y = playerAngle.current;

        // Walking Leg & Arm Swing Cycle
        const walkCycle = Math.sin(time * 12);
        leftLegGroup.rotation.x = walkCycle * 0.6;
        rightLegGroup.rotation.x = -walkCycle * 0.6;

        leftArmGroup.rotation.x = -walkCycle * 0.5;
        rightArmGroup.rotation.x = walkCycle * 0.5;

        // Natural walking vertical bounce
        playerGroup.position.y = Math.abs(Math.sin(time * 12)) * 0.06;
      } else {
        // Idle Animation (Gentle breathing and arm sway)
        const idleCycle = Math.sin(time * 2.2);
        leftLegGroup.rotation.x = 0;
        rightLegGroup.rotation.x = 0;
        leftArmGroup.rotation.x = idleCycle * 0.08;
        rightArmGroup.rotation.x = -idleCycle * 0.08;
        playerGroup.position.y = Math.sin(time * 2.0) * 0.02;

        // Face slightly toward ticket kiosk when idle near starting point
        if (Math.hypot(playerPos.current.x, playerPos.current.z) > 1.2) {
          const toCenterAngle = Math.atan2(-playerPos.current.x, -playerPos.current.z);
          playerAngle.current = THREE.MathUtils.lerp(playerAngle.current, toCenterAngle, 0.05);
          playerGroup.rotation.y = playerAngle.current;
        }
      }

      playerGroup.position.x = playerPos.current.x;
      playerGroup.position.z = playerPos.current.z;

      // PROXIMITY DETECTION TO HOTSPOTS & NPCS
      const playerVec = new THREE.Vector2(playerPos.current.x, playerPos.current.z);
      const kioskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.kiosk.x, hotspotPositions.kiosk.z));
      const boardDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.board.x, hotspotPositions.board.z));
      const deskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.desk.x, hotspotPositions.desk.z));

      const arjunDist = playerVec.distanceTo(new THREE.Vector2(1.6, 1.6));
      const rajivDist = playerVec.distanceTo(new THREE.Vector2(-0.8, -2.8));

      const PROXIMITY_RADIUS = 1.35;
      if (kioskDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('kiosk');
        setNearbyNPC(null);
        rightArmGroup.rotation.x = -Math.PI / 3;
      } else if (boardDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('board');
        setNearbyNPC(null);
        rightArmGroup.rotation.x = -Math.PI / 3;
      } else if (deskDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('desk');
        setNearbyNPC(null);
        leftArmGroup.rotation.x = -Math.PI / 3;
      } else if (arjunDist < 1.35) {
        setNearbyHotspot(null);
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'arjun') || null);
      } else if (rajivDist < 1.35) {
        setNearbyHotspot(null);
        setNearbyNPC(STATION_NPCS.find((n) => n.id === 'rajiv') || null);
      } else {
        setNearbyHotspot(null);
        setNearbyNPC(null);
      }

      // Synchronize player position with Minimap Radar (throttled to ~15fps)
      frameCount++;
      if (frameCount % 4 === 0) {
        const coords = {
          x: playerPos.current.x,
          z: playerPos.current.z,
          angle: playerAngle.current,
        };
        setPlayerCoords(coords);
        onPlayerCoordsChange?.(coords);
      }

      // Camera handling: Over-the-Shoulder vs Isometric Concourse
      if (cameraModeRef.current === 'over_the_shoulder') {
        const camTargetX = playerPos.current.x - Math.sin(playerAngle.current) * 0.4;
        const camTargetZ = playerPos.current.z + 2.2;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.3, 0.08);
        camera.lookAt(playerPos.current.x, 0.85, playerPos.current.z - 1.5);
      } else {
        // Smooth Isometric Camera Position with subtle pointer parallax
        const camTargetX = playerPos.current.x * 0.4 + 3.2 + pointerPos.current.x * 0.25;
        const camTargetZ = playerPos.current.z * 0.3 + 4.8 + pointerPos.current.y * 0.2;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, camTargetX, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, camTargetZ, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.8, 0.08);
        camera.lookAt(playerPos.current.x * 0.3, 0.65, playerPos.current.z * 0.2);
      }

      renderer.render(scene, camera);
    };

    // Synchronous initial frame render
    camera.position.set(playerPos.current.x * 0.4 + 3.2, 3.8, playerPos.current.z * 0.3 + 4.8);
    camera.lookAt(playerPos.current.x * 0.3, 0.65, playerPos.current.z * 0.2);
    renderer.render(scene, camera);

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
      platformGeo.dispose();
      platformMat.dispose();
      kioskCabinetGeo.dispose();
      kioskCabinetMat.dispose();
    };
  }, [cluesFound, repairsCompleted, repairsComplete]);

  return (
    <div className="station-canvas-container" ref={mountRef}>
      {/* 3D Interactive Hotspot Overlays */}
      <div className="station-hotspot-pins" aria-hidden="true">
        {/* Hotspot 1: Kiosk */}
        <button
          className={`hotspot-pin hotspot-pin--kiosk ${activeHotspot === 'kiosk' ? 'is-active' : ''} ${cluesFound.includes('kiosk') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('kiosk')}
          title="Click to interact with Ticket Kiosk"
          id="hotspot-kiosk-btn"
        >
          <span className="hotspot-pin__badge">1</span>
          <span className="hotspot-pin__label">Ticket Kiosk</span>
        </button>

        {/* Hotspot 2: Departure Board */}
        <button
          className={`hotspot-pin hotspot-pin--board ${activeHotspot === 'board' ? 'is-active' : ''} ${cluesFound.includes('board') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('board')}
          title="Click to inspect Departure Board"
          id="hotspot-board-btn"
        >
          <span className="hotspot-pin__badge">2</span>
          <span className="hotspot-pin__label">Departure Board</span>
        </button>

        {/* Hotspot 3: Help Desk */}
        <button
          className={`hotspot-pin hotspot-pin--desk ${activeHotspot === 'desk' ? 'is-active' : ''} ${cluesFound.includes('desk') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('desk')}
          title="Click to check Help Desk"
          id="hotspot-desk-btn"
        >
          <span className="hotspot-pin__badge">3</span>
          <span className="hotspot-pin__label">Help Desk</span>
        </button>
      </div>

      {/* Campus-Grade Top Concourse HUD */}
      <div className="campus-concourse-hud" aria-label="Station Concourse HUD">
        <div className="campus-hud-left">
          <div className="campus-hud-badge">
            <span className="campus-live-dot" />
            <span className="campus-hud-title">FA FRICTION ARCADE · SOLO SANDBOX</span>
          </div>
          <div className="campus-hud-breadcrumb">
            STATION CONCOURSE · PLATFORM 1
          </div>
          <div className="campus-hud-target">
            Heading for{' '}
            <strong>
              {!cluesFound.includes('kiosk')
                ? 'Ticket Kiosk (Missing Context)'
                : !cluesFound.includes('board')
                ? 'Departure Board (Confusing Feedback)'
                : !cluesFound.includes('desk')
                ? 'Help Desk (Unclear Actions)'
                : 'Booking Challenge Flow'}
            </strong>
          </div>
        </div>

        <div className="campus-hud-right">
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

      {/* Persistent Mini Route Map HUD (Section 4 — Friction Trail) */}
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
          <span className={`hud-ckpt ${cluesFound.includes('board') ? 'is-done' : cluesFound.includes('kiosk') ? 'is-next' : ''}`}>
            2 Board {cluesFound.includes('board') ? '✓' : '○'}
          </span>
          <span className="hud-arrow">→</span>
          <span className={`hud-ckpt ${cluesFound.includes('desk') ? 'is-done' : cluesFound.includes('board') ? 'is-next' : ''}`}>
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
            <span className="key-cap" style={{ background: '#ffd23f', color: '#17131f' }}>Q</span>
            <span style={{ fontWeight: 700, color: '#ffd23f' }}>Echo</span>
            <span>•</span>
            <span className="key-cap">E</span>
            <span>
              <strong>
                {nearbyHotspot === 'kiosk'
                  ? 'Ticket Kiosk 📋'
                  : nearbyHotspot === 'board'
                  ? 'Departure Board 🚉'
                  : 'Help Desk 💁'}
              </strong>
            </span>
            <button
              className="proximity-prompt__btn"
              style={{ background: '#ffd23f', color: '#17131f', fontWeight: 800 }}
              onClick={() => onTriggerEcho?.(nearbyHotspot)}
              aria-label="Activate Friction Echo"
            >
              Echo (Q) →
            </button>
            <button
              className="proximity-prompt__btn"
              onClick={handleInteract}
              aria-label="Inspect landmark"
            >
              Inspect (E)
            </button>
          </div>
        </div>
      )}

      {/* Proximity Interaction Prompt when standing near an NPC */}
      {nearbyNPC && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill">
            <span className="key-cap">E</span>
            <span>
              Talk to <strong>{nearbyNPC.name}</strong> ({nearbyNPC.role}) 💬
            </span>
            <button
              className="proximity-prompt__btn"
              onClick={handleInteract}
              aria-label={`Talk to ${nearbyNPC.name}`}
            >
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

      {/* Campus-grade Pause Menu Overlay (Esc) */}
      <PauseMenuModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onRestartDrill={() => {
          playerPos.current = { x: 0.2, z: 2.2 };
          setIsPaused(false);
        }}
        onExitHome={() => {
          setIsPaused(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cameraMode={cameraMode}
        onToggleCamera={() =>
          setCameraMode((m) => (m === 'over_the_shoulder' ? 'isometric' : 'over_the_shoulder'))
        }
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
