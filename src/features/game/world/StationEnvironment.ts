import * as THREE from 'three';

/**
 * Procedural station environment builder for FRICTION ARCADE V3: THE LAST TRAIN: FLOW RESCUE.
 * Replaces the primitive blockout with an architecturally coherent, walkable railway station
 * containing 6 distinct connected zones:
 * - Zone A: Arrival Plaza & Grand Entryway
 * - Zone B: Central Concourse (vaulted steel arches, skylight canopy, fluted columns)
 * - Zone C: Ticket Hall (ergonomic kiosk cabinet, luminous interface screen, queue stanchions)
 * - Zone D: Departure Concourse (monumental Solari board suspended on gantry truss)
 * - Zone E: Staffed Customer Help Desk (curved counter, monitor, concierge Agent Priya)
 * - Zone F: Platform 1 & Deccan Express Passenger Train (tracks, ballast, tactile edge, multi-coach train)
 */

export interface StationEnvironmentBuildOptions {
  scene: THREE.Scene;
  isClarity: boolean;
  clarityRepairs: string[];
  isFrictionVision: boolean;
}

export interface StationEnvironmentHandles {
  stationGroup: THREE.Group;
  trainGroup: THREE.Group;
  departureBoardLed: THREE.Mesh;
  kioskScreenMesh: THREE.Mesh;
  kioskBannerMesh: THREE.Mesh;
  deskSignMesh: THREE.Mesh;
  deskMonitorMesh: THREE.Mesh;
  clockHandMesh: THREE.Mesh;
  update: (time: number, delta: number) => void;
  triggerTrainDeparture: () => void;
  dispose: () => void;
}

function createBoardCanvasTexture(isErrorsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#0f0c18';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = '#2b233d';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 1016, 504);

  // Golden Header Banner
  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(8, 8, 1008, 64);
  ctx.fillStyle = '#17131f';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('MUMBAI CENTRAL · TRAIN DEPARTURES', 24, 52);

  // Table Column Headers
  ctx.fillStyle = '#221a36';
  ctx.fillRect(8, 76, 1008, 44);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('TRAIN NO.', 28, 106);
  ctx.fillText('DESTINATION', 230, 106);
  ctx.fillText('TIME', 450, 106);
  ctx.fillText('PLATFORM', 560, 106);
  ctx.fillText('STATUS / ACTION', 730, 106);

  // Row 1: 12127 DECCAN EXP (Mission Train)
  ctx.fillStyle = '#191328';
  ctx.fillRect(8, 126, 1008, 76);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('12127 DECCAN EXP', 28, 172);
  ctx.fillStyle = '#8ddcff';
  ctx.fillText('PUNE JN', 230, 172);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('07:15', 450, 172);

  if (!isErrorsRepaired) {
    ctx.fillStyle = '#ff3b30';
    ctx.fillText('???', 580, 172);
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(720, 142, 270, 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⚠ ALERT 404', 740, 174);
  } else {
    ctx.fillStyle = '#b6ffb2';
    ctx.fillText('PL 1', 580, 172);
    ctx.fillStyle = '#059669';
    ctx.fillRect(720, 142, 270, 46);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('✓ BOARDING · TRACK 1A', 735, 172);
  }

  // Row 2: 12951 RAJDHANI EXP
  ctx.fillStyle = '#140f20';
  ctx.fillRect(8, 206, 1008, 64);
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '22px monospace';
  ctx.fillText('12951 RAJDHANI EXP', 28, 246);
  ctx.fillStyle = '#8ddcff';
  ctx.fillText('NEW DELHI', 230, 246);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('07:45', 450, 246);
  ctx.fillText('PL 2', 580, 246);
  ctx.fillStyle = '#059669';
  ctx.fillText('ON TIME', 740, 246);

  // Row 3: 12009 SHATABDI EXP
  ctx.fillStyle = '#191328';
  ctx.fillRect(8, 274, 1008, 64);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillText('12009 SHATABDI EXP', 28, 314);
  ctx.fillStyle = '#8ddcff';
  ctx.fillText('AHMEDABAD', 230, 314);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('08:10', 450, 314);
  ctx.fillText('PL 3', 580, 314);
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('EXP 08:15', 740, 314);

  // Row 4: 22105 INDRAYANI EXP
  ctx.fillStyle = '#140f20';
  ctx.fillRect(8, 342, 1008, 64);
  ctx.fillStyle = '#e4e4e7';
  ctx.fillText('22105 INDRAYANI EXP', 28, 382);
  ctx.fillStyle = '#8ddcff';
  ctx.fillText('PUNE JN', 230, 382);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('08:40', 450, 382);
  ctx.fillText('PL 1', 580, 382);
  ctx.fillStyle = '#059669';
  ctx.fillText('ON TIME', 740, 382);

  // Footer Wayfinding Marquee
  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(8, 420, 1008, 80);
  ctx.fillStyle = '#17131f';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('WAYFINDING: PLATFORM 1 ACCESS VIA CENTRAL CONCOURSE · DECCAN EXP DEPARTS 07:15', 24, 468);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createKioskCanvasTexture(isLabelsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#17131f';
  ctx.fillRect(0, 0, 512, 512);

  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(0, 0, 512, 60);
  ctx.fillStyle = '#17131f';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('KIOSK #04 · TICKET BOOKING', 20, 42);

  if (!isLabelsRepaired) {
    ctx.fillStyle = '#261f36';
    ctx.fillRect(30, 90, 452, 90);
    ctx.strokeStyle = '#4a3d66';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 90, 452, 90);

    ctx.fillStyle = '#6b5e85';
    ctx.font = 'italic 24px sans-serif';
    ctx.fillText('Type departure city here...', 50, 145);

    ctx.fillStyle = '#ff3b30';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('⚠ FLAW: Disappearing placeholder loses context', 30, 220);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '16px sans-serif';
    ctx.fillText('Passenger hesitates when typing replaces prompt.', 30, 250);
  } else {
    ctx.fillStyle = '#ffd23f';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('DEPARTURE CITY *', 30, 110);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, 125, 452, 70);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 125, 452, 70);

    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Mumbai CST', 50, 170);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('✓ Persistent Label Active · High Contrast', 30, 230);
  }

  ctx.fillStyle = '#a1a1aa';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('DESTINATION: Pune Junction (PNQ)', 30, 290);

  ctx.fillStyle = '#2a223e';
  ctx.fillRect(30, 315, 452, 80);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('12127 DECCAN EXPRESS', 50, 350);
  ctx.fillStyle = '#8ddcff';
  ctx.font = '18px sans-serif';
  ctx.fillText('07:15 AM · 2 Seats · AC Chair Car', 50, 378);

  ctx.fillStyle = '#059669';
  ctx.fillRect(30, 420, 452, 60);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('TAP [E] OR [Q] TO INVESTIGATE', 80, 458);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createHelpDeskCanvasTexture(isActionsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#17131f';
  ctx.fillRect(0, 0, 512, 320);

  ctx.fillStyle = '#c7b5ff';
  ctx.fillRect(0, 0, 512, 50);
  ctx.fillStyle = '#17131f';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('AGENT DESK · RESERVATION ACTIONS', 20, 35);

  if (!isActionsRepaired) {
    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(25, 90, 220, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('CANCEL BOOKING', 45, 140);

    ctx.fillStyle = '#ff3b30';
    ctx.fillRect(265, 90, 220, 80);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CONFIRM TICKET', 285, 140);

    ctx.fillStyle = '#ff857f';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚠ Competing visual weights confuse users', 25, 220);
  } else {
    ctx.fillStyle = '#059669';
    ctx.fillRect(25, 80, 460, 85);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('★ CONFIRM & PRINT (PRIMARY)', 55, 135);

    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 190, 460, 55);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Cancel reservation (Secondary)', 120, 225);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export function buildStationEnvironment(options: StationEnvironmentBuildOptions): StationEnvironmentHandles {
  const { scene, isClarity, clarityRepairs } = options;
  const disposables: Array<{ dispose: () => void }> = [];

  const registerGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
    disposables.push(geo);
    return geo;
  };
  const registerMat = <T extends THREE.Material>(mat: T): T => {
    disposables.push(mat);
    return mat;
  };

  const stationGroup = new THREE.Group();
  scene.add(stationGroup);

  // =========================================================================
  // 1. FLOOR & PAVING SYSTEM (Terrazzo Walkways + Stone Pavers)
  // =========================================================================
  // Main Concourse Floor Slab
  const floorGeo = registerGeo(new THREE.BoxGeometry(9.6, 0.4, 8.8));
  const floorMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: isClarity ? 0xf4ebe1 : 0xe8ddd0,
      roughness: 0.32,
      metalness: 0.08,
    })
  );
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.set(0, -0.2, 0.2);
  floor.receiveShadow = true;
  stationGroup.add(floor);

  // Central Polished Walkway (contrasting dark terrazzo strip running north-south)
  const terrazzoGeo = registerGeo(new THREE.BoxGeometry(2.4, 0.01, 8.4));
  const terrazzoMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x302742,
      roughness: 0.2,
      metalness: 0.15,
    })
  );
  const terrazzoStrip = new THREE.Mesh(terrazzoGeo, terrazzoMat);
  terrazzoStrip.position.set(0, 0.005, 0.2);
  terrazzoStrip.receiveShadow = true;
  stationGroup.add(terrazzoStrip);

  // Royal Blue Carpet Queue Runner (Leading towards Ticket Kiosk, as in station reference art)
  const carpetGeo = registerGeo(new THREE.BoxGeometry(1.4, 0.015, 1.8));
  const carpetMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, // Royal cobalt blue
      roughness: 0.7,
      metalness: 0.05,
    })
  );
  const queueCarpet = new THREE.Mesh(carpetGeo, carpetMat);
  queueCarpet.position.set(0, 0.012, 1.25);
  queueCarpet.receiveShadow = true;
  stationGroup.add(queueCarpet);

  // Polished Brass Stanchion Posts with Crimson Velvet Ropes (bordering queue carpet)
  const stanchionPoleGeo = registerGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 12));
  const stanchionBaseGeo = registerGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16));
  const stanchionBallGeo = registerGeo(new THREE.SphereGeometry(0.045, 12, 12));
  const brassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished brass
      metalness: 0.85,
      roughness: 0.18,
    })
  );
  const velvetRopeMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Rich crimson velvet
      roughness: 0.6,
    })
  );

  for (const sx of [-0.75, 0.75]) {
    for (const sz of [0.6, 1.3, 2.0]) {
      const sGroup = new THREE.Group();
      sGroup.position.set(sx, 0, sz);

      const base = new THREE.Mesh(stanchionBaseGeo, brassMat);
      base.position.y = 0.015;
      const pole = new THREE.Mesh(stanchionPoleGeo, brassMat);
      pole.position.y = 0.38;
      const ball = new THREE.Mesh(stanchionBallGeo, brassMat);
      ball.position.y = 0.76;

      sGroup.add(base, pole, ball);
      stationGroup.add(sGroup);
    }

    // Velvet connecting rope
    const ropeGeo = registerGeo(new THREE.BoxGeometry(0.03, 0.03, 1.4));
    const rope = new THREE.Mesh(ropeGeo, velvetRopeMat);
    rope.position.set(sx, 0.62, 1.3);
    stationGroup.add(rope);
  }

  // Freestanding Vintage Cast-Iron Pedestal Clock Tower (at x: 1.6, z: 1.4)
  const clockTowerGroup = new THREE.Group();
  clockTowerGroup.position.set(1.6, 0, 1.4);

  const ctBaseGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.5, 0.42));
  const ctIronMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }));
  const ctBase = new THREE.Mesh(ctBaseGeo, ctIronMat);
  ctBase.position.y = 0.25;
  clockTowerGroup.add(ctBase);

  const ctShaftGeo = registerGeo(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 12));
  const ctShaft = new THREE.Mesh(ctShaftGeo, ctIronMat);
  ctShaft.position.y = 1.3;
  clockTowerGroup.add(ctShaft);

  const ctHeadGeo = registerGeo(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 24));
  const ctHead = new THREE.Mesh(ctHeadGeo, ctIronMat);
  ctHead.rotation.x = Math.PI / 2;
  ctHead.position.y = 2.2;
  clockTowerGroup.add(ctHead);

  const ctDialGeo = registerGeo(new THREE.CircleGeometry(0.24, 24));
  const ctDialMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xfffbee }));
  const ctDialNorth = new THREE.Mesh(ctDialGeo, ctDialMat);
  ctDialNorth.position.set(0, 2.2, 0.13);
  const ctDialSouth = new THREE.Mesh(ctDialGeo, ctDialMat);
  ctDialSouth.rotation.y = Math.PI;
  ctDialSouth.position.set(0, 2.2, -0.13);
  clockTowerGroup.add(ctDialNorth, ctDialSouth);

  const ctSpireGeo = registerGeo(new THREE.ConeGeometry(0.12, 0.35, 8));
  const ctSpire = new THREE.Mesh(ctSpireGeo, brassMat);
  ctSpire.position.y = 2.62;
  clockTowerGroup.add(ctSpire);

  stationGroup.add(clockTowerGroup);

  // Directional Tactile Paving Lines (high-contrast sun-yellow guide lines)
  for (const tx of [-1.15, 1.15]) {
    const tactileGeo = registerGeo(new THREE.BoxGeometry(0.08, 0.015, 7.6));
    const tactileMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd23f,
        roughness: 0.35,
        emissive: 0xff8a1f,
        emissiveIntensity: 0.15,
      })
    );
    const tactileLine = new THREE.Mesh(tactileGeo, tactileMat);
    tactileLine.position.set(tx, 0.01, 0.3);
    stationGroup.add(tactileLine);
  }

  // =========================================================================
  // 2. ZONE A: ARRIVAL PLAZA (Welcoming South Gateway Terrace)
  // Low-profile architectural boundary: zero overhead beams obstructing camera!
  // =========================================================================
  const plazaGroup = new THREE.Group();
  plazaGroup.position.set(0, 0, 4.4);

  // Grand Flank Entrance Pylons with warm globe lanterns (placed wide at x: -3.8 and 3.8)
  const pPillarGeo = registerGeo(new THREE.BoxGeometry(0.55, 2.4, 0.55));
  const pStoneMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x241b34, roughness: 0.5, metalness: 0.1 })
  );
  const lanternGlobeGeo = registerGeo(new THREE.SphereGeometry(0.2, 16, 16));
  const lanternGlobeMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xffe2b8,
      emissive: 0xffa040,
      emissiveIntensity: 0.9,
      roughness: 0.2,
    })
  );

  for (const px of [-3.8, 3.8]) {
    const pPillar = new THREE.Mesh(pPillarGeo, pStoneMat);
    pPillar.position.set(px, 1.2, 0);
    pPillar.castShadow = true;
    plazaGroup.add(pPillar);

    const globe = new THREE.Mesh(lanternGlobeGeo, lanternGlobeMat);
    globe.position.set(px, 2.55, 0);
    plazaGroup.add(globe);
  }

  // Arrival Welcome Signboards on side pylons
  const welcomeSignGeo = registerGeo(new THREE.BoxGeometry(1.6, 0.35, 0.06));
  const welcomeSignMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: 0xffd23f,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    })
  );
  for (const sx of [-3.8, 3.8]) {
    const sign = new THREE.Mesh(welcomeSignGeo, welcomeSignMat);
    sign.position.set(sx > 0 ? sx - 0.7 : sx + 0.7, 1.6, 0);
    plazaGroup.add(sign);
  }

  // Entrance Turnstile Gates (Glass & Steel barriers at z = -0.4)
  for (const gx of [-1.0, 0.0, 1.0]) {
    const gatePillarGeo = registerGeo(new THREE.BoxGeometry(0.18, 0.9, 0.6));
    const gatePillarMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x4a4060, roughness: 0.3 }));
    const gate = new THREE.Mesh(gatePillarGeo, gatePillarMat);
    gate.position.set(gx, 0.45, -0.4);
    plazaGroup.add(gate);

    // Green illuminated turnstile indicator LED
    const ledGeo = registerGeo(new THREE.SphereGeometry(0.03, 8, 8));
    const ledMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x059669 }));
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(gx, 0.92, -0.2);
    plazaGroup.add(led);
  }

  // Exterior Plaza Planters and Decorative Shrubs
  for (const plx of [-3.0, 3.0]) {
    const planterBoxGeo = registerGeo(new THREE.BoxGeometry(0.7, 0.45, 0.7));
    const planterBoxMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.4 }));
    const planterBox = new THREE.Mesh(planterBoxGeo, planterBoxMat);
    planterBox.position.set(plx, 0.225, 0);
    planterBox.castShadow = true;
    plazaGroup.add(planterBox);

    const bushGeo = registerGeo(new THREE.DodecahedronGeometry(0.38, 1));
    const bushMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.8 }));
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(plx, 0.65, 0);
    bush.castShadow = true;
    plazaGroup.add(bush);
  }
  stationGroup.add(plazaGroup);

  // =========================================================================
  // 3. ZONE B: CENTRAL CONCOURSE (Architectural Columns & Lofty Glass Canopy)
  // All structural ribs sit high at y = 6.6+ with zero low cables or camera obstructions
  // =========================================================================
  const columnPositions = [
    { x: -3.2, z: 1.8 },
    { x: 3.2, z: 1.8 },
    { x: -3.2, z: -1.0 },
    { x: 3.2, z: -1.0 },
  ];

  for (const pos of columnPositions) {
    const colGroup = new THREE.Group();
    colGroup.position.set(pos.x, 0, pos.z);

    // Plinth (Square base)
    const plinthGeo = registerGeo(new THREE.BoxGeometry(0.55, 0.5, 0.55));
    const plinthMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x2e2444, roughness: 0.5 }));
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.25;
    colGroup.add(plinth);

    // Fluted Column Shaft
    const shaftGeo = registerGeo(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 16));
    const shaftMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd8c8b4, roughness: 0.4 }));
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 2.15;
    shaft.castShadow = true;
    colGroup.add(shaft);

    // Capital (Crown)
    const capGeo = registerGeo(new THREE.BoxGeometry(0.6, 0.25, 0.6));
    const cap = new THREE.Mesh(capGeo, plinthMat);
    cap.position.y = 4.1;
    colGroup.add(cap);

    // Warm Architectural Wall Sconce on each column (at y = 2.5, illuminating concourse)
    const sconceArmGeo = registerGeo(new THREE.BoxGeometry(0.08, 0.08, 0.2));
    const sconceMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f, metalness: 0.7 }));
    const sconceArm = new THREE.Mesh(sconceArmGeo, sconceMat);
    sconceArm.position.set(0, 2.5, pos.z > 0 ? -0.28 : 0.28);
    colGroup.add(sconceArm);

    const sconceLightGeo = registerGeo(new THREE.SphereGeometry(0.12, 12, 12));
    const sconceLightMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xffd23f,
        emissive: 0xff9922,
        emissiveIntensity: 0.9,
        roughness: 0.2,
      })
    );
    const sconceLight = new THREE.Mesh(sconceLightGeo, sconceLightMat);
    sconceLight.position.set(0, 2.5, pos.z > 0 ? -0.4 : 0.4);
    colGroup.add(sconceLight);

    stationGroup.add(colGroup);
  }

  // Lofty Victorian Skylight Glass Canopy (Positioned high at y = 6.4, letting sun in)
  const skylightGroup = new THREE.Group();
  skylightGroup.position.set(0, 6.4, 0.4);

  const glassGeo = registerGeo(new THREE.PlaneGeometry(8.6, 6.0));
  const glassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x8ddcff,
      transparent: true,
      opacity: 0.18,
      roughness: 0.1,
      metalness: 0.8,
      side: THREE.DoubleSide,
    })
  );
  const skylight = new THREE.Mesh(glassGeo, glassMat);
  skylight.rotation.x = Math.PI / 2;
  skylightGroup.add(skylight);

  // Slender roof arch ribs high above camera (y = 6.5)
  for (const rz of [-2.0, 0, 2.0]) {
    const ribGeo = registerGeo(new THREE.BoxGeometry(8.8, 0.08, 0.08));
    const ribMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x221a30, metalness: 0.8 }));
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.position.set(0, 0.05, rz);
    skylightGroup.add(rib);
  }
  stationGroup.add(skylightGroup);

  // =========================================================================
  // 3.5 PERIMETER TERMINAL WALLS & MEZZANINE (Inspired by Grand Station reference art)
  // Mint-green / seafoam walls, classical pilasters, daylight arched windows, staircase
  // =========================================================================
  const mintWallMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x428e82, roughness: 0.55 })); // Elegant seafoam mint
  const sandTrimMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xe8ded0, roughness: 0.4 })); // Sand-beige classical stone
  const windowGlassMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xa5e5ff, transparent: true, opacity: 0.35, roughness: 0.1 }));

  // East & West Main Terminal Walls
  for (const side of [-4.7, 4.7]) {
    const wallGroup = new THREE.Group();
    wallGroup.position.set(side, 0, 0.2);

    // Wall base & surface
    const wallGeo = registerGeo(new THREE.BoxGeometry(0.3, 5.2, 8.6));
    const wallMesh = new THREE.Mesh(wallGeo, mintWallMat);
    wallMesh.position.y = 2.6;
    wallMesh.receiveShadow = true;
    wallGroup.add(wallMesh);

    // Classical Pilasters along wall
    for (const pz of [-3.0, -1.0, 1.0, 3.0]) {
      const pilasterGeo = registerGeo(new THREE.BoxGeometry(0.38, 5.2, 0.4));
      const pilaster = new THREE.Mesh(pilasterGeo, sandTrimMat);
      pilaster.position.set(0, 2.6, pz);
      wallGroup.add(pilaster);

      // Arched Window Bays between pilasters
      if (pz < 3.0) {
        const winGeo = registerGeo(new THREE.BoxGeometry(0.08, 2.2, 1.2));
        const win = new THREE.Mesh(winGeo, windowGlassMat);
        win.position.set(side < 0 ? 0.12 : -0.12, 3.2, pz + 1.0);
        wallGroup.add(win);
      }
    }

    stationGroup.add(wallGroup);
  }

  // West Grand Mezzanine Staircase & Balustrade (as in station reference photo)
  const stairGroup = new THREE.Group();
  stairGroup.position.set(-4.0, 0, 1.8);

  // Stepped treads leading up to mezzanine
  for (let step = 0; step < 7; step++) {
    const stepGeo = registerGeo(new THREE.BoxGeometry(0.9, 0.18, 0.3));
    const stepMesh = new THREE.Mesh(stepGeo, sandTrimMat);
    stepMesh.position.set(0, 0.09 + step * 0.18, -step * 0.26);
    stepMesh.receiveShadow = true;
    stairGroup.add(stepMesh);
  }

  // Mezzanine Balcony Slab
  const mezzSlabGeo = registerGeo(new THREE.BoxGeometry(1.2, 0.2, 2.4));
  const mezzSlab = new THREE.Mesh(mezzSlabGeo, sandTrimMat);
  mezzSlab.position.set(0, 1.35, -2.2);
  stairGroup.add(mezzSlab);

  // Balustrade Handrail
  const railGeo = registerGeo(new THREE.BoxGeometry(0.06, 0.6, 2.4));
  const railMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd8c8b4, roughness: 0.3 }));
  const handrail = new THREE.Mesh(railGeo, railMat);
  handrail.position.set(0.5, 1.75, -2.2);
  stairGroup.add(handrail);
  stationGroup.add(stairGroup);

  // Waiting Lounge (Teak Slat Benches with Sage-Green Cast-Iron Frames)
  const benchPositions = [
    { x: -1.5, z: 2.2, rot: 0 },
    { x: -1.5, z: 1.4, rot: 0 },
  ];
  const teakMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.5 }));
  const sageGreenIronMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x2e6040, roughness: 0.35, metalness: 0.4 })); // Sage-green cast iron as in reference

  for (const b of benchPositions) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(b.x, 0, b.z);

    // Individual Teak Slats for realistic look
    for (let s = 0; s < 4; s++) {
      const slatGeo = registerGeo(new THREE.BoxGeometry(1.3, 0.04, 0.08));
      const slat = new THREE.Mesh(slatGeo, teakMat);
      slat.position.set(0, 0.4, -0.15 + s * 0.1);
      benchGroup.add(slat);
    }

    // Backrest slats
    for (let r = 0; r < 3; r++) {
      const bSlatGeo = registerGeo(new THREE.BoxGeometry(1.3, 0.08, 0.03));
      const bSlat = new THREE.Mesh(bSlatGeo, teakMat);
      bSlat.position.set(0, 0.55 + r * 0.1, -0.2);
      benchGroup.add(bSlat);
    }

    // Sage-Green Cast-Iron Armrests & Legs (matching reference photo)
    for (const lx of [-0.6, 0.6]) {
      const legGeo = registerGeo(new THREE.BoxGeometry(0.05, 0.45, 0.45));
      const leg = new THREE.Mesh(legGeo, sageGreenIronMat);
      leg.position.set(lx, 0.22, 0);
      leg.castShadow = true;

      const armrestGeo = registerGeo(new THREE.TorusGeometry(0.12, 0.02, 6, 12, Math.PI));
      const armrest = new THREE.Mesh(armrestGeo, sageGreenIronMat);
      armrest.position.set(lx, 0.52, -0.05);
      armrest.rotation.z = Math.PI / 2;

      benchGroup.add(leg, armrest);
    }
    stationGroup.add(benchGroup);
  }

  // Potted Tropical Banana Palms & Ficus Urns (arranged around station)
  const potMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xad5834, roughness: 0.65 })); // Terracotta urn
  const leafMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.6 })); // Lush green palm leaf

  const plantPositions = [
    { x: -3.3, z: 2.2 },
    { x: -3.3, z: 0.6 },
    { x: 3.3, z: 2.2 },
    { x: 3.3, z: 0.6 },
    { x: 1.0, z: 2.3 },
  ];

  for (const p of plantPositions) {
    const plantGroup = new THREE.Group();
    plantGroup.position.set(p.x, 0, p.z);

    const urnGeo = registerGeo(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 12));
    const urn = new THREE.Mesh(urnGeo, potMat);
    urn.position.y = 0.225;
    urn.castShadow = true;
    plantGroup.add(urn);

    // Broad tropical palm leaves arching out
    for (let l = 0; l < 5; l++) {
      const leafGeo = registerGeo(new THREE.PlaneGeometry(0.3, 0.65));
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      const angle = (l / 5) * Math.PI * 2;
      leaf.position.set(Math.sin(angle) * 0.12, 0.55, Math.cos(angle) * 0.12);
      leaf.rotation.y = angle;
      leaf.rotation.x = 0.45;
      plantGroup.add(leaf);
    }
    stationGroup.add(plantGroup);
  }

  // =========================================================================
  // 4. ZONE C: TICKET HALL (Checkpoint 1 — Arjun & Kiosk at x: 0, z: 0.2)
  // =========================================================================
  const kioskGroup = new THREE.Group();
  kioskGroup.position.set(0, 0, 0.2);

  // Kiosk Cabinet with beveled housing
  const kCabinetGeo = registerGeo(new THREE.BoxGeometry(0.92, 1.85, 0.7));
  const kCabinetMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xff8a1f,
      roughness: 0.22,
      metalness: 0.18,
    })
  );
  const kioskCabinet = new THREE.Mesh(kCabinetGeo, kCabinetMat);
  kioskCabinet.position.y = 0.925;
  kioskCabinet.castShadow = true;
  kioskGroup.add(kioskCabinet);

  // Kiosk Marquee Banner (Transforms in Clarity Mode)
  const isLabelsRepaired = clarityRepairs.includes('labels');
  const kBannerGeo = registerGeo(new THREE.BoxGeometry(0.84, 0.24, 0.08));
  const kioskBannerMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: isLabelsRepaired ? 0xb6ffb2 : 0xffd23f,
      emissive: isLabelsRepaired ? 0x059669 : 0xff8a1f,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    })
  );
  const kioskBannerMesh = new THREE.Mesh(kBannerGeo, kioskBannerMat);
  kioskBannerMesh.position.set(0, 1.66, 0.36);
  kioskGroup.add(kioskBannerMesh);

  // Interactive Screen Display (Luminous interface with actual graphics)
  const kScreenGeo = registerGeo(new THREE.PlaneGeometry(0.74, 0.68));
  const kioskTex = createKioskCanvasTexture(isLabelsRepaired);
  disposables.push(kioskTex);
  const kioskScreenMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: kioskTex,
      roughness: 0.2,
      metalness: 0.1,
    })
  );
  const kioskScreenMesh = new THREE.Mesh(kScreenGeo, kioskScreenMat);
  kioskScreenMesh.position.set(0, 1.12, 0.36);
  kioskGroup.add(kioskScreenMesh);

  // Card Contactless Terminal & Keypad Shelf
  const shelfGeo = registerGeo(new THREE.BoxGeometry(0.78, 0.08, 0.22));
  const shelfMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.4 }));
  const shelf = new THREE.Mesh(shelfGeo, shelfMat);
  shelf.position.set(0, 0.72, 0.42);
  kioskGroup.add(shelf);

  // Contactless NFC blue target beacon
  const nfcGeo = registerGeo(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16));
  const nfcMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x8ddcff }));
  const nfc = new THREE.Mesh(nfcGeo, nfcMat);
  nfc.position.set(0.25, 0.77, 0.42);
  kioskGroup.add(nfc);

  // Ticket Output Hopper Slot
  const slotGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.05, 0.08));
  const slotMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x0c0a14 }));
  const slot = new THREE.Mesh(slotGeo, slotMat);
  slot.position.set(0, 0.48, 0.36);
  kioskGroup.add(slot);

  // Queue Stanchions (Brass posts + Red velvet rope)
  for (const qx of [-0.9, 0.9]) {
    const postGeo = registerGeo(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 12));
    const brassMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.85, roughness: 0.2 }));
    const post = new THREE.Mesh(postGeo, brassMat);
    post.position.set(qx, 0.425, 0.8);
    post.castShadow = true;
    kioskGroup.add(post);

    const postBaseGeo = registerGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16));
    const postBase = new THREE.Mesh(postBaseGeo, brassMat);
    postBase.position.set(qx, 0.02, 0.8);
    kioskGroup.add(postBase);
  }
  stationGroup.add(kioskGroup);

  // =========================================================================
  // 5. ZONE D: DEPARTURE CONCOURSE (Checkpoint 2 — Meera & Board at x: 2.6, z: -1.2)
  // =========================================================================
  const boardGroup = new THREE.Group();
  boardGroup.position.set(2.6, 0, -1.2);

  // Steel Gantry Truss Post
  const gantryPostGeo = registerGeo(new THREE.CylinderGeometry(0.09, 0.11, 3.2, 12));
  const gantryPostMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1c1729, metalness: 0.6, roughness: 0.3 }));
  const gantryPost = new THREE.Mesh(gantryPostGeo, gantryPostMat);
  gantryPost.position.y = 1.6;
  gantryPost.castShadow = true;
  boardGroup.add(gantryPost);

  // Monumental Solari Housing
  const bHousingGeo = registerGeo(new THREE.BoxGeometry(2.1, 1.25, 0.32));
  const bHousingMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.3 }));
  const boardHousing = new THREE.Mesh(bHousingGeo, bHousingMat);
  boardHousing.position.y = 2.45;
  boardHousing.castShadow = true;
  boardGroup.add(boardHousing);

  // Solari Schedule LED Display Face (High-resolution split-flap display)
  const isErrorsRepaired = clarityRepairs.includes('errors');
  const bScreenGeo = registerGeo(new THREE.PlaneGeometry(1.95, 1.05));
  const boardTex = createBoardCanvasTexture(isErrorsRepaired);
  disposables.push(boardTex);
  const departureBoardLedMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.2,
      metalness: 0.1,
    })
  );
  const departureBoardLed = new THREE.Mesh(bScreenGeo, departureBoardLedMat);
  departureBoardLed.position.set(0, 2.45, 0.17);
  boardGroup.add(departureBoardLed);

  // Overhead Status Spotlight Illuminating Board
  const spotGeo = registerGeo(new THREE.BoxGeometry(0.3, 0.08, 0.12));
  const spot = new THREE.Mesh(spotGeo, gantryPostMat);
  spot.position.set(0, 3.15, 0.25);
  boardGroup.add(spot);
  stationGroup.add(boardGroup);

  // =========================================================================
  // 6. ZONE E: CUSTOMER HELP DESK (Checkpoint 3 — Kabir & Priya at x: -2.6, z: 0.4)
  // =========================================================================
  const deskGroup = new THREE.Group();
  deskGroup.position.set(-2.6, 0, 0.4);

  // Semi-Circular Curved Customer Service Counter
  const dCounterGeo = registerGeo(new THREE.CylinderGeometry(0.95, 0.95, 0.95, 24, 1, false, -Math.PI / 2, Math.PI));
  const isActionsRepaired = clarityRepairs.includes('actions');
  const dCounterMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: isActionsRepaired ? 0xc7b5ff : 0xaa98df,
      roughness: 0.32,
    })
  );
  const deskCounter = new THREE.Mesh(dCounterGeo, dCounterMat);
  deskCounter.position.y = 0.475;
  deskCounter.castShadow = true;
  deskGroup.add(deskCounter);

  // Polished Countertop Slab
  const topGeo = registerGeo(new THREE.CylinderGeometry(1.02, 1.02, 0.08, 24, 1, false, -Math.PI / 2, Math.PI));
  const topMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xfff6e5, roughness: 0.15 }));
  const counterTop = new THREE.Mesh(topGeo, topMat);
  counterTop.position.y = 0.96;
  deskGroup.add(counterTop);

  // Countertop Monitor Screen (Demonstrating button hierarchy)
  const dMonitorGeo = registerGeo(new THREE.BoxGeometry(0.44, 0.28, 0.04));
  const deskTex = createHelpDeskCanvasTexture(isActionsRepaired);
  disposables.push(deskTex);
  const dMonitorMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: deskTex,
      roughness: 0.2,
    })
  );
  const deskMonitorMesh = new THREE.Mesh(dMonitorGeo, dMonitorMat);
  deskMonitorMesh.position.set(0, 1.14, 0.3);
  deskGroup.add(deskMonitorMesh);

  // Overhead Service Sign: "HELP DESK · CUSTOMER ASSISTANCE"
  const dSignGeo = registerGeo(new THREE.BoxGeometry(1.2, 0.32, 0.1));
  const deskSignMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: isActionsRepaired ? 0xb6ffb2 : 0xffd23f,
      emissiveIntensity: isActionsRepaired ? 0.7 : 0.4,
    })
  );
  const deskSignMesh = new THREE.Mesh(dSignGeo, deskSignMat);
  deskSignMesh.position.set(0, 2.1, 0);
  deskGroup.add(deskSignMesh);

  const dPoleGeo = registerGeo(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8));
  const dPole = new THREE.Mesh(dPoleGeo, gantryPostMat);
  dPole.position.set(0, 1.5, 0);
  deskGroup.add(dPole);

  stationGroup.add(deskGroup);

  // =========================================================================
  // 7. ZONE F: PLATFORM 1 & DECCAN EXPRESS TRAIN (North Zone: z = -2.6 to -4.6)
  // =========================================================================
  // North Platform Gantry with Grand Clock & Station Signboard
  const northGantry = new THREE.Group();
  northGantry.position.set(0, 0, -2.8);

  // Side Support Columns
  const gantryPillarGeo = registerGeo(new THREE.BoxGeometry(0.45, 4.4, 0.45));
  const gantryMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x241b34, roughness: 0.4, metalness: 0.2 }));
  for (const gx of [-3.8, 3.8]) {
    const p = new THREE.Mesh(gantryPillarGeo, gantryMat);
    p.position.set(gx, 2.2, 0);
    p.castShadow = true;
    northGantry.add(p);
  }

  // Horizontal Portal Beam (Framing Platform 1 overhead at y = 4.0)
  const gantryBeamGeo = registerGeo(new THREE.BoxGeometry(8.2, 0.4, 0.4));
  const gantryBeam = new THREE.Mesh(gantryBeamGeo, gantryMat);
  gantryBeam.position.set(0, 4.1, 0);
  gantryBeam.castShadow = true;
  northGantry.add(gantryBeam);

  // Station Platform Signboard: "PLATFORM 01 · DECCAN EXPRESS (TO PUNE)"
  const pSignGeo = registerGeo(new THREE.BoxGeometry(4.8, 0.42, 0.08));
  const pSignMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: 0xffd23f,
      emissiveIntensity: 0.4,
      roughness: 0.25,
    })
  );
  const pSign = new THREE.Mesh(pSignGeo, pSignMat);
  pSign.position.set(0, 4.1, 0.22);
  northGantry.add(pSign);

  // Grand Station Clock centered atop gantry
  const clockFrameGeo = registerGeo(new THREE.CylinderGeometry(0.38, 0.38, 0.08, 24));
  const clockFrameMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.8, roughness: 0.2 }));
  const clockFrame = new THREE.Mesh(clockFrameGeo, clockFrameMat);
  clockFrame.rotation.x = Math.PI / 2;
  clockFrame.position.set(0, 4.65, 0.22);
  northGantry.add(clockFrame);

  const clockFaceGeo = registerGeo(new THREE.CircleGeometry(0.32, 24));
  const clockFaceMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  clockFace.position.set(0, 4.65, 0.27);
  northGantry.add(clockFace);

  const clockHandGeo = registerGeo(new THREE.BoxGeometry(0.025, 0.18, 0.01));
  const clockHandMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x17131f }));
  const clockHandMesh = new THREE.Mesh(clockHandGeo, clockHandMat);
  clockHandMesh.position.set(0, 4.71, 0.28);
  northGantry.add(clockHandMesh);

  stationGroup.add(northGantry);

  // Platform Edge Tactile Yellow Safety Strip (z = -3.2)
  const pEdgeGeo = registerGeo(new THREE.BoxGeometry(9.6, 0.03, 0.35));
  const pEdgeMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xffd23f,
      roughness: 0.3,
      emissive: 0xffa550,
      emissiveIntensity: 0.2,
    })
  );
  const platformEdge = new THREE.Mesh(pEdgeGeo, pEdgeMat);
  platformEdge.position.set(0, 0.015, -3.2);
  stationGroup.add(platformEdge);

  // Railway Track Ballast (Gravel bed)
  const ballastGeo = registerGeo(new THREE.BoxGeometry(9.8, 0.28, 2.4));
  const ballastMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x120e1a, roughness: 0.9 }));
  const ballast = new THREE.Mesh(ballastGeo, ballastMat);
  ballast.position.set(0, -0.22, -4.6);
  stationGroup.add(ballast);

  // Steel Rails and Wooden Sleepers
  for (let s = -4.6; s <= 4.6; s += 0.45) {
    const sleeperGeo = registerGeo(new THREE.BoxGeometry(0.22, 0.08, 1.8));
    const sleeperMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 }));
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(s, -0.06, -4.6);
    stationGroup.add(sleeper);
  }

  for (const rz of [-4.1, -5.1]) {
    const railGeo = registerGeo(new THREE.BoxGeometry(9.8, 0.07, 0.08));
    const railMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.85, roughness: 0.2 }));
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, -0.02, rz);
    stationGroup.add(rail);
  }

  // --- THE DECCAN EXPRESS TRAIN (Multi-Coach Passenger Train) ---
  const trainGroup = new THREE.Group();
  trainGroup.position.set(0, 0.75, -4.6);

  // Engine / Lead Locomotive (Right section: x = 1.6 to 4.4)
  const engineBodyGeo = registerGeo(new THREE.BoxGeometry(3.6, 1.55, 1.6));
  const trainOrangeMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.25,
      metalness: 0.25,
    })
  );
  const engineBody = new THREE.Mesh(engineBodyGeo, trainOrangeMat);
  engineBody.position.set(2.4, 0, 0);
  engineBody.castShadow = true;
  trainGroup.add(engineBody);

  // Aerodynamic Sloped Cab Front
  const cabGeo = registerGeo(new THREE.ConeGeometry(0.9, 1.2, 4));
  const cab = new THREE.Mesh(cabGeo, trainOrangeMat);
  cab.rotation.z = -Math.PI / 2;
  cab.position.set(4.4, -0.15, 0);
  trainGroup.add(cab);

  // Locomotive Headlamp (Glowing golden beam)
  const headlampGeo = registerGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16));
  const headlampMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xfffed0 }));
  const headlamp = new THREE.Mesh(headlampGeo, headlampMat);
  headlamp.rotation.z = Math.PI / 2;
  headlamp.position.set(4.9, 0.1, 0);
  trainGroup.add(headlamp);

  // Coach Carriage 1 (Middle section: x = -1.8 to 0.4)
  const coach1Geo = registerGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55));
  const trainBlueMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.2,
    })
  );
  const coach1 = new THREE.Mesh(coach1Geo, trainBlueMat);
  coach1.position.set(-0.9, 0, 0);
  coach1.castShadow = true;
  trainGroup.add(coach1);

  // Coach Carriage 2 (Trailing section: x = -4.6 to -2.6)
  const coach2 = new THREE.Mesh(coach1Geo, trainBlueMat);
  coach2.position.set(-4.2, 0, 0);
  coach2.castShadow = true;
  trainGroup.add(coach2);

  // Glowing Train Passenger Windows (Rows along side facing platform at z = 0.8)
  for (let wx = -4.8; wx <= 3.8; wx += 0.85) {
    if (Math.abs(wx - 0.7) < 0.2 || Math.abs(wx + 2.5) < 0.2) continue; // Door gaps
    const winGeo = registerGeo(new THREE.BoxGeometry(0.55, 0.42, 0.04));
    const winMat = registerMat(
      new THREE.MeshStandardMaterial({
        color: 0xfff6e5,
        emissive: 0xffd23f,
        emissiveIntensity: 0.65,
      })
    );
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(wx, 0.2, 0.79);
    trainGroup.add(win);
  }

  // Steel Train Wheels & Carriage Bogies
  for (let bx = -4.6; bx <= 3.8; bx += 1.4) {
    for (const bz of [-0.65, 0.65]) {
      const wheelGeo = registerGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16));
      const wheelMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 }));
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(bx, -0.65, bz);
      trainGroup.add(wheel);
    }
  }

  stationGroup.add(trainGroup);

  // Animation and departure state
  let isTrainDeparting = false;
  let trainVelocity = 0;

  const triggerTrainDeparture = () => {
    isTrainDeparting = true;
    trainVelocity = 0.5;
  };

  const update = (time: number, delta: number) => {
    // Animate clock minute hand
    clockHandMesh.rotation.z = -time * 0.1;

    // Pulse kiosk and board screens gently
    kioskScreenMat.emissiveIntensity = 0.5 + Math.sin(time * 3.0) * 0.15;
    departureBoardLedMat.emissiveIntensity = 0.55 + Math.sin(time * 2.5) * 0.12;

    // Train departure sequence
    if (isTrainDeparting) {
      trainVelocity += delta * 1.8;
      trainGroup.position.x += trainVelocity * delta;
      // Loop or stop once offscreen
      if (trainGroup.position.x > 18) {
        trainGroup.position.x = -18;
        isTrainDeparting = false;
      }
    }
  };

  const dispose = () => {
    scene.remove(stationGroup);
    disposables.forEach((d) => d.dispose());
  };

  return {
    stationGroup,
    trainGroup,
    departureBoardLed,
    kioskScreenMesh,
    kioskBannerMesh,
    deskSignMesh,
    deskMonitorMesh,
    clockHandMesh,
    update,
    triggerTrainDeparture,
    dispose,
  };
}
