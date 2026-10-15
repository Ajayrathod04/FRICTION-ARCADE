import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

interface StationCanvasProps {
  onSelectHotspot: (hotspotId: 'kiosk' | 'board' | 'desk') => void;
  cluesFound: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
}

export const StationCanvas: React.FC<StationCanvasProps> = ({
  onSelectHotspot,
  cluesFound,
  repairsComplete,
  activeHotspot,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [nearbyHotspot, setNearbyHotspot] = useState<'kiosk' | 'board' | 'desk' | null>(null);

  // Position of player in world coordinates
  const playerPos = useRef({ x: 0, z: 2.4 });
  const keysDown = useRef<{ [key: string]: boolean }>({});

  const hotspotPositions = {
    kiosk: new THREE.Vector3(0, 0, 0),
    board: new THREE.Vector3(2.4, 0, -1.2),
    desk: new THREE.Vector3(-2.4, 0, 0.4),
  };

  const handleInteract = useCallback(() => {
    if (nearbyHotspot) {
      onSelectHotspot(nearbyHotspot);
    }
  }, [nearbyHotspot, onSelectHotspot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when filling forms
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      keysDown.current[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e' || e.key === 'Enter') {
        if (nearbyHotspot) {
          e.preventDefault();
          handleInteract();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [nearbyHotspot, handleInteract]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181226); // Deep atmospheric indigo

    // CAMERA (Isometric viewpoint showing kiosk, board, train, platform)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // LIGHTING (Vibrant arcade warm & neon illumination)
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.4);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffe2b8, 0x584478, 1.2);
    scene.add(hemiLight);

    // Main Warm Station Light
    const sunLight = new THREE.DirectionalLight(0xffbe60, 2.5);
    sunLight.position.set(5, 8, 5);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Neon station accent light (magenta/cyan)
    const neonPink = new THREE.PointLight(0xff3d8b, 3.5, 10);
    neonPink.position.set(0, 2.6, 0.4);
    scene.add(neonPink);

    const cyanRim = new THREE.DirectionalLight(0x8ddcff, 1.8);
    cyanRim.position.set(-5, 4, -2);
    scene.add(cyanRim);

    // ENVIRONMENT GROUP
    const stationGroup = new THREE.Group();
    scene.add(stationGroup);

    // --- 1. FLOOR & PLATFORM (Warm stone pavers) ---
    const platformGeo = new THREE.BoxGeometry(8.5, 0.4, 7);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0xe5d8c3, // Light warm station paving stone
      roughness: 0.4,
      metalness: 0.05,
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -0.2, 0);
    platform.receiveShadow = true;
    stationGroup.add(platform);

    // Checkered platform accent border
    const borderGeo = new THREE.BoxGeometry(8.6, 0.02, 0.2);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xff3b30, roughness: 0.3 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 0.01, 3.4);
    stationGroup.add(border);

    // Platform edge tactile yellow stripe
    const stripeGeo = new THREE.BoxGeometry(10, 0.02, 0.4);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.4 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0.01, -3.4);
    stripe.receiveShadow = true;
    stationGroup.add(stripe);

    // Train Track Bed
    const trackBedGeo = new THREE.BoxGeometry(10, 0.3, 2.5);
    const trackBedMat = new THREE.MeshStandardMaterial({ color: 0x141120, roughness: 0.9 });
    const trackBed = new THREE.Mesh(trackBedGeo, trackBedMat);
    trackBed.position.set(0, -0.25, -4.8);
    stationGroup.add(trackBed);

    // Rails
    const railGeo = new THREE.BoxGeometry(10, 0.08, 0.08);
    const railMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(0, -0.05, -4.3);
    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(0, -0.05, -5.3);
    stationGroup.add(rail1, rail2);

    // Stylized Train Car on tracks
    const trainGroup = new THREE.Group();
    trainGroup.position.set(0, 0.6, -4.8);

    const trainBodyGeo = new THREE.BoxGeometry(9, 1.4, 1.6);
    const trainBodyMat = new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.3, metalness: 0.2 });
    const trainBody = new THREE.Mesh(trainBodyGeo, trainBodyMat);
    trainBody.castShadow = true;
    trainGroup.add(trainBody);

    const trainRoofGeo = new THREE.BoxGeometry(9.1, 0.2, 1.7);
    const trainRoofMat = new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.4 });
    const trainRoof = new THREE.Mesh(trainRoofGeo, trainRoofMat);
    trainRoof.position.y = 0.8;
    trainGroup.add(trainRoof);

    // Glowing train windows
    for (let i = -3.5; i <= 3.5; i += 1.4) {
      const winGeo = new THREE.BoxGeometry(0.8, 0.5, 0.05);
      const winMat = new THREE.MeshStandardMaterial({ color: 0xfff6e5, emissive: 0xffd23f, emissiveIntensity: 0.6 });
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(i, 0.2, 0.81);
      trainGroup.add(win);
    }
    stationGroup.add(trainGroup);

    // --- 2. STATION ARCHED CANOPY & BACK WALL (Behind platform) ---
    const wallGeo = new THREE.BoxGeometry(10, 4, 0.5);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x362c4f, roughness: 0.6 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 2, -3.6);
    wall.receiveShadow = true;
    stationGroup.add(wall);

    // Station Canopy Pillars & Curved Roof
    for (const px of [-3.8, 3.8]) {
      const pillarGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 12);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x17131f, metalness: 0.5, roughness: 0.3 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 1.9, 0);
      pillar.castShadow = true;
      stationGroup.add(pillar);
    }

    // Overhead Arch Sign "FRICTION STATION"
    const signBarGeo = new THREE.BoxGeometry(4.8, 0.6, 0.15);
    const signBarMat = new THREE.MeshStandardMaterial({
      color: 0x17131f,
      roughness: 0.4,
    });
    const signBar = new THREE.Mesh(signBarGeo, signBarMat);
    signBar.position.set(0, 3.8, 1.2);
    stationGroup.add(signBar);

    // Floor Interactive Circle around Kiosk
    const circleGeo = new THREE.RingGeometry(0.9, 1.1, 32);
    const circleMat = new THREE.MeshBasicMaterial({
      color: cluesFound.includes('kiosk') ? 0xb6ffb2 : 0xffd23f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const floorCircle = new THREE.Mesh(circleGeo, circleMat);
    floorCircle.rotation.x = -Math.PI / 2;
    floorCircle.position.set(0, 0.02, 0);
    stationGroup.add(floorCircle);

    // --- 3. CENTRAL TICKET KIOSK (Hotspot 1) ---
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(0, 0, 0);

    // Cabinet
    const kioskBodyGeo = new THREE.BoxGeometry(0.9, 1.7, 0.7);
    const kioskBodyMat = new THREE.MeshStandardMaterial({
      color: 0xff8a1f,
      roughness: 0.3,
      metalness: 0.1,
    });
    const kioskBody = new THREE.Mesh(kioskBodyGeo, kioskBodyMat);
    kioskBody.position.y = 0.85;
    kioskBody.castShadow = true;
    kioskGroup.add(kioskBody);

    // Top Header Banner ("BOOK YOUR TICKET")
    const kioskHeaderGeo = new THREE.BoxGeometry(0.82, 0.25, 0.05);
    const kioskHeaderMat = new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      emissive: 0xffd23f,
      emissiveIntensity: 0.2,
    });
    const kioskHeader = new THREE.Mesh(kioskHeaderGeo, kioskHeaderMat);
    kioskHeader.position.set(0, 1.55, 0.36);
    kioskGroup.add(kioskHeader);

    // Glowing Screen
    const screenGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const screenColor = cluesFound.includes('kiosk') ? 0x8ddcff : 0xffffff;
    const screenMat = new THREE.MeshStandardMaterial({
      color: screenColor,
      emissive: screenColor,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(0, 1.05, 0.36);
    kioskGroup.add(screen);

    // Keypad & ticket slot
    const slotGeo = new THREE.BoxGeometry(0.4, 0.05, 0.05);
    const slotMat = new THREE.MeshStandardMaterial({ color: 0x17131f });
    const slot = new THREE.Mesh(slotGeo, slotMat);
    slot.position.set(0, 0.55, 0.36);
    kioskGroup.add(slot);

    // Suitcase beside kiosk
    const suitcaseGeo = new THREE.BoxGeometry(0.35, 0.5, 0.25);
    const suitcaseMat = new THREE.MeshStandardMaterial({ color: 0xff3d8b, roughness: 0.5 });
    const suitcase = new THREE.Mesh(suitcaseGeo, suitcaseMat);
    suitcase.position.set(0.65, 0.25, 0.15);
    suitcase.rotation.y = 0.2;
    suitcase.castShadow = true;
    kioskGroup.add(suitcase);

    stationGroup.add(kioskGroup);

    // --- 4. DEPARTURE BOARD (Hotspot 2) ---
    const boardGroup = new THREE.Group();
    boardGroup.position.copy(hotspotPositions.board);

    // Support Post
    const boardPostGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8);
    const boardPostMat = new THREE.MeshStandardMaterial({ color: 0x17131f });
    const boardPost = new THREE.Mesh(boardPostGeo, boardPostMat);
    boardPost.position.y = 1.3;
    boardPost.castShadow = true;
    boardGroup.add(boardPost);

    // Big Board Housing
    const boardHousingGeo = new THREE.BoxGeometry(1.6, 1.0, 0.25);
    const boardHousingMat = new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.3 });
    const boardHousing = new THREE.Mesh(boardHousingGeo, boardHousingMat);
    boardHousing.position.y = 2.1;
    boardHousing.castShadow = true;
    boardGroup.add(boardHousing);

    // LED Screen rows
    const ledScreenGeo = new THREE.PlaneGeometry(1.45, 0.85);
    const ledColor = cluesFound.includes('board') ? 0xb6ffb2 : 0xff3b30;
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a10,
      emissive: ledColor,
      emissiveIntensity: 0.45,
    });
    const ledScreen = new THREE.Mesh(ledScreenGeo, ledMat);
    ledScreen.position.set(0, 2.1, 0.13);
    boardGroup.add(ledScreen);

    stationGroup.add(boardGroup);

    // --- 5. HELP DESK (Hotspot 3) ---
    const deskGroup = new THREE.Group();
    deskGroup.position.copy(hotspotPositions.desk);

    // Counter table
    const deskCounterGeo = new THREE.BoxGeometry(1.5, 0.95, 0.8);
    const deskCounterMat = new THREE.MeshStandardMaterial({ color: 0xc7b5ff, roughness: 0.4 });
    const deskCounter = new THREE.Mesh(deskCounterGeo, deskCounterMat);
    deskCounter.position.y = 0.475;
    deskCounter.castShadow = true;
    deskGroup.add(deskCounter);

    // Desk overhead "HELP" Sign
    const helpSignGeo = new THREE.BoxGeometry(0.9, 0.3, 0.1);
    const helpSignMat = new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: cluesFound.includes('desk') ? 0xb6ffb2 : 0xffd23f,
      emissiveIntensity: 0.4,
    });
    const helpSign = new THREE.Mesh(helpSignGeo, helpSignMat);
    helpSign.position.set(0, 1.8, 0);
    deskGroup.add(helpSign);

    // Sign pole
    const helpPoleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 8);
    const helpPole = new THREE.Mesh(helpPoleGeo, boardPostMat);
    helpPole.position.set(0, 1.35, 0);
    deskGroup.add(helpPole);

    // Desk lamp
    const lampBaseGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.25, 8);
    const lampBase = new THREE.Mesh(lampBaseGeo, boardPostMat);
    lampBase.position.set(-0.45, 1.05, 0.15);
    deskGroup.add(lampBase);

    stationGroup.add(deskGroup);

    // --- 6. FLOATING COLLECTIBLE TICKET ---
    const ticketGroup = new THREE.Group();
    ticketGroup.position.set(0, 2.7, 0);

    const ticketGeo = new THREE.BoxGeometry(0.8, 0.42, 0.04);
    const ticketMat = new THREE.MeshStandardMaterial({
      color: repairsComplete ? 0xb6ffb2 : 0xfff6e5,
      emissive: repairsComplete ? 0xb6ffb2 : 0xffd23f,
      emissiveIntensity: 0.3,
      roughness: 0.3,
    });
    const ticketMesh = new THREE.Mesh(ticketGeo, ticketMat);
    ticketMesh.castShadow = true;
    ticketGroup.add(ticketMesh);

    // Little ticket stamp
    const stampGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
    const stampMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff3b30,
      emissiveIntensity: 0.5,
    });
    const stamp = new THREE.Mesh(stampGeo, stampMat);
    stamp.rotation.x = Math.PI / 2;
    stamp.position.set(0.22, 0, 0.03);
    ticketGroup.add(stamp);

    stationGroup.add(ticketGroup);

    // --- 7. PLAYER TRAVELER AVATAR ---
    const playerGroup = new THREE.Group();
    playerGroup.position.set(playerPos.current.x, 0, playerPos.current.z);

    // Body (stylized capsule)
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.7, 12);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.55;
    body.castShadow = true;
    playerGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xfff6e5, roughness: 0.6 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.05;
    head.castShadow = true;
    playerGroup.add(head);

    // Backpack
    const backpackGeo = new THREE.BoxGeometry(0.22, 0.32, 0.16);
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0x17131f });
    const backpack = new THREE.Mesh(backpackGeo, backpackMat);
    backpack.position.set(0, 0.6, -0.2);
    playerGroup.add(backpack);

    // Ground shadow ring
    const shadowGeo = new THREE.RingGeometry(0.05, 0.3, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const shadowRing = new THREE.Mesh(shadowGeo, shadowMat);
    shadowRing.rotation.x = -Math.PI / 2;
    shadowRing.position.y = 0.01;
    playerGroup.add(shadowRing);

    stationGroup.add(playerGroup);

    // --- ANIMATION & GAME LOOP ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Floating ticket animation
      ticketGroup.position.y = 2.6 + Math.sin(time * 2.2) * 0.15;
      ticketGroup.rotation.y = time * 0.8;
      ticketGroup.rotation.z = Math.sin(time * 1.5) * 0.08;

      // Kiosk glow pulse
      screenMat.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.2;

      // PLAYER MOVEMENT (WASD / Arrows)
      const moveSpeed = keysDown.current['shift'] ? 4.2 : 2.5;
      let dx = 0;
      let dz = 0;

      if (keysDown.current['w'] || keysDown.current['arrowup']) dz -= 1;
      if (keysDown.current['s'] || keysDown.current['arrowdown']) dz += 1;
      if (keysDown.current['a'] || keysDown.current['arrowleft']) dx -= 1;
      if (keysDown.current['d'] || keysDown.current['arrowright']) dx += 1;

      // Normalize diagonal
      const len = Math.hypot(dx, dz);
      if (len > 0) {
        dx = (dx / len) * moveSpeed * delta;
        dz = (dz / len) * moveSpeed * delta;

        playerPos.current.x = THREE.MathUtils.clamp(playerPos.current.x + dx, -4.2, 4.2);
        playerPos.current.z = THREE.MathUtils.clamp(playerPos.current.z + dz, -2.8, 3.2);

        // Player face direction
        const targetRot = Math.atan2(dx, dz);
        playerGroup.rotation.y = targetRot;

        // Walking bob
        playerGroup.position.y = Math.abs(Math.sin(time * 10)) * 0.08;
      } else {
        playerGroup.position.y = 0;
      }

      playerGroup.position.x = playerPos.current.x;
      playerGroup.position.z = playerPos.current.z;

      // PROXIMITY DETECTION
      const playerVec = new THREE.Vector2(playerPos.current.x, playerPos.current.z);
      const kioskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.kiosk.x, hotspotPositions.kiosk.z));
      const boardDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.board.x, hotspotPositions.board.z));
      const deskDist = playerVec.distanceTo(new THREE.Vector2(hotspotPositions.desk.x, hotspotPositions.desk.z));

      const PROXIMITY_RADIUS = 1.35;
      if (kioskDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('kiosk');
      } else if (boardDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('board');
      } else if (deskDist < PROXIMITY_RADIUS) {
        setNearbyHotspot('desk');
      } else {
        setNearbyHotspot(null);
      }

      // Smooth camera position following player
      camera.position.set(playerPos.current.x + 3.0, 3.6, playerPos.current.z + 4.6);
      camera.lookAt(playerPos.current.x * 0.5, 0.7, playerPos.current.z * 0.5);

      renderer.render(scene, camera);
    };

    // Immediate initial render
    camera.position.set(playerPos.current.x + 3.0, 3.6, playerPos.current.z + 4.6);
    camera.lookAt(playerPos.current.x * 0.5, 0.7, playerPos.current.z * 0.5);
    renderer.render(scene, camera);

    animate();

    // RESIZE LISTENER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      kioskBodyGeo.dispose();
      kioskBodyMat.dispose();
    };
  }, [cluesFound, repairsComplete]);

  return (
    <div className="station-canvas-container" ref={mountRef}>
      {/* 3D Interactive Hotspot Overlays */}
      <div className="station-hotspot-pins" aria-hidden="true">
        {/* Hotspot 1: Kiosk */}
        <button
          className={`hotspot-pin hotspot-pin--kiosk ${activeHotspot === 'kiosk' ? 'is-active' : ''} ${cluesFound.includes('kiosk') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('kiosk')}
          title="Click to interact with Ticket Kiosk"
        >
          <span className="hotspot-pin__badge">1</span>
          <span className="hotspot-pin__label">Ticket Kiosk</span>
        </button>

        {/* Hotspot 2: Departure Board */}
        <button
          className={`hotspot-pin hotspot-pin--board ${activeHotspot === 'board' ? 'is-active' : ''} ${cluesFound.includes('board') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('board')}
          title="Click to inspect Departure Board"
        >
          <span className="hotspot-pin__badge">2</span>
          <span className="hotspot-pin__label">Departure Board</span>
        </button>

        {/* Hotspot 3: Help Desk */}
        <button
          className={`hotspot-pin hotspot-pin--desk ${activeHotspot === 'desk' ? 'is-active' : ''} ${cluesFound.includes('desk') ? 'is-completed' : ''}`}
          onClick={() => onSelectHotspot('desk')}
          title="Click to check Help Desk"
        >
          <span className="hotspot-pin__badge">3</span>
          <span className="hotspot-pin__label">Help Desk</span>
        </button>
      </div>

      {/* Floating proximity notification when player stands near a hotspot */}
      {nearbyHotspot && (
        <div className="proximity-prompt">
          <div className="proximity-prompt__pill">
            <span className="key-cap">E</span>
            <span>
              Interact with{' '}
              <strong>
                {nearbyHotspot === 'kiosk'
                  ? 'Ticket Kiosk'
                  : nearbyHotspot === 'board'
                  ? 'Departure Board'
                  : 'Help Desk'}
              </strong>
            </span>
            <button
              className="proximity-prompt__btn"
              onClick={handleInteract}
              aria-label="Open interaction"
            >
              Open →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
