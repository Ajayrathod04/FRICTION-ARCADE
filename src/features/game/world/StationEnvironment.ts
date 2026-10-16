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
  // 2. ZONE A: ARRIVAL PLAZA & STATION PORTAL (South Zone: z = 3.0 to 4.2)
  // =========================================================================
  const plazaGroup = new THREE.Group();
  plazaGroup.position.set(0, 0, 3.6);

  // Grand Architectural Portal Arch
  const portalPillarGeo = registerGeo(new THREE.BoxGeometry(0.45, 3.6, 0.45));
  const portalStoneMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x241b34, roughness: 0.5, metalness: 0.1 })
  );
  for (const px of [-2.4, 2.4]) {
    const pPillar = new THREE.Mesh(portalPillarGeo, portalStoneMat);
    pPillar.position.set(px, 1.8, 0);
    pPillar.castShadow = true;
    plazaGroup.add(pPillar);
  }

  // Arch Header Beam
  const portalBeamGeo = registerGeo(new THREE.BoxGeometry(5.2, 0.6, 0.5));
  const portalBeam = new THREE.Mesh(portalBeamGeo, portalStoneMat);
  portalBeam.position.set(0, 3.5, 0);
  portalBeam.castShadow = true;
  plazaGroup.add(portalBeam);

  // Golden Station Marquee Nameplate: "MUMBAI CENTRAL · FRICTION ARCADE"
  const nameplateGeo = registerGeo(new THREE.BoxGeometry(4.2, 0.4, 0.08));
  const nameplateMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: 0xffd23f,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    })
  );
  const nameplate = new THREE.Mesh(nameplateGeo, nameplateMat);
  nameplate.position.set(0, 3.5, 0.28);
  plazaGroup.add(nameplate);

  // Station Grand Clock above portal
  const clockFrameGeo = registerGeo(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24));
  const clockFrameMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.8, roughness: 0.2 }));
  const clockFrame = new THREE.Mesh(clockFrameGeo, clockFrameMat);
  clockFrame.rotation.x = Math.PI / 2;
  clockFrame.position.set(0, 4.15, 0.25);
  plazaGroup.add(clockFrame);

  const clockFaceGeo = registerGeo(new THREE.CircleGeometry(0.3, 24));
  const clockFaceMat = registerMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const clockFace = new THREE.Mesh(clockFaceGeo, clockFaceMat);
  clockFace.position.set(0, 4.15, 0.3);
  plazaGroup.add(clockFace);

  // Moving Clock Minute Hand
  const clockHandGeo = registerGeo(new THREE.BoxGeometry(0.03, 0.18, 0.01));
  const clockHandMat = registerMat(new THREE.MeshBasicMaterial({ color: 0x17131f }));
  const clockHandMesh = new THREE.Mesh(clockHandGeo, clockHandMat);
  clockHandMesh.position.set(0, 4.22, 0.31);
  plazaGroup.add(clockHandMesh);

  // Entrance Turnstile Gates (Glass & Steel barriers)
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
  for (const plx of [-3.2, 3.2]) {
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
  // 3. ZONE B: CENTRAL CONCOURSE (Columns, Roof Trusses, Skylight Canopy)
  // =========================================================================
  // 4 Fluted Architectural Columns with Square Plinths
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
    const shaftGeo = registerGeo(new THREE.CylinderGeometry(0.2, 0.24, 3.6, 16));
    const shaftMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd8c8b4, roughness: 0.4 }));
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 2.05;
    shaft.castShadow = true;
    colGroup.add(shaft);

    // Capital (Crown)
    const capGeo = registerGeo(new THREE.BoxGeometry(0.6, 0.25, 0.6));
    const cap = new THREE.Mesh(capGeo, plinthMat);
    cap.position.y = 3.9;
    colGroup.add(cap);

    stationGroup.add(colGroup);
  }

  // Vaulted Roof Steel Trusses spanning across concourse
  for (const rz of [2.4, 0.6, -1.2]) {
    const trussGroup = new THREE.Group();
    trussGroup.position.set(0, 4.1, rz);

    // Horizontal tie beam
    const tieGeo = registerGeo(new THREE.BoxGeometry(8.6, 0.12, 0.12));
    const steelMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1f192b, metalness: 0.7, roughness: 0.3 }));
    const tie = new THREE.Mesh(tieGeo, steelMat);
    trussGroup.add(tie);

    // Arched rafter top
    const rafterGeo = registerGeo(new THREE.TorusGeometry(4.3, 0.07, 8, 24, Math.PI));
    const rafter = new THREE.Mesh(rafterGeo, steelMat);
    rafter.rotation.z = Math.PI;
    trussGroup.add(rafter);

    // Hanging Industrial Pendant Lamps
    for (const lx of [-2.0, 0, 2.0]) {
      const cordGeo = registerGeo(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6));
      const cord = new THREE.Mesh(cordGeo, steelMat);
      cord.position.set(lx, -0.45, 0);
      trussGroup.add(cord);

      const lampShadeGeo = registerGeo(new THREE.ConeGeometry(0.25, 0.2, 12));
      const lampMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: 0xffbe60,
          emissive: 0xffbe60,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        })
      );
      const lampShade = new THREE.Mesh(lampShadeGeo, lampMat);
      lampShade.position.set(lx, -0.9, 0);
      lampShade.rotation.x = Math.PI;
      trussGroup.add(lampShade);
    }
    stationGroup.add(trussGroup);
  }

  // Skylight Glass Ceiling Panels
  const glassGeo = registerGeo(new THREE.PlaneGeometry(8.6, 4.4));
  const glassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x8ddcff,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      metalness: 0.9,
      side: THREE.DoubleSide,
    })
  );
  const skylight = new THREE.Mesh(glassGeo, glassMat);
  skylight.rotation.x = Math.PI / 2;
  skylight.position.set(0, 4.6, 0.6);
  stationGroup.add(skylight);

  // Waiting Lounge (Wooden Benches & Planters in Southwest quadrant)
  const benchPositions = [
    { x: -1.4, z: 2.1, rot: 0 },
    { x: -1.4, z: 1.3, rot: 0 },
  ];
  for (const b of benchPositions) {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(b.x, 0, b.z);

    const seatGeo = registerGeo(new THREE.BoxGeometry(1.2, 0.08, 0.42));
    const woodMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x8d5b4c, roughness: 0.6 }));
    const seat = new THREE.Mesh(seatGeo, woodMat);
    seat.position.y = 0.4;
    benchGroup.add(seat);

    const backrestGeo = registerGeo(new THREE.BoxGeometry(1.2, 0.35, 0.06));
    const backrest = new THREE.Mesh(backrestGeo, woodMat);
    backrest.position.set(0, 0.62, -0.18);
    benchGroup.add(backrest);

    // Iron Legs
    for (const lx of [-0.5, 0.5]) {
      const legGeo = registerGeo(new THREE.BoxGeometry(0.06, 0.4, 0.38));
      const ironMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f, metalness: 0.6 }));
      const leg = new THREE.Mesh(legGeo, ironMat);
      leg.position.set(lx, 0.2, 0);
      benchGroup.add(leg);
    }
    stationGroup.add(benchGroup);
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

  // Interactive Screen Display (Glows and transforms with clarity)
  const kScreenGeo = registerGeo(new THREE.PlaneGeometry(0.74, 0.68));
  const kScreenColor = isLabelsRepaired ? 0x8ddcff : isClarity ? 0xb6ffb2 : 0xffd6e0;
  const kioskScreenMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: kScreenColor,
      emissive: kScreenColor,
      emissiveIntensity: 0.5,
      roughness: 0.15,
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

  // Solari Schedule LED Display Face
  const isErrorsRepaired = clarityRepairs.includes('errors');
  const bScreenGeo = registerGeo(new THREE.PlaneGeometry(1.95, 1.05));
  const bLedColor = isErrorsRepaired ? 0x22c55e : isClarity ? 0xb6ffb2 : 0xff3b30;
  const departureBoardLedMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x0a0812,
      emissive: bLedColor,
      emissiveIntensity: 0.55,
      roughness: 0.2,
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
  const dMonitorGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.28, 0.04));
  const dMonitorMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: isActionsRepaired ? 0xff8a1f : 0x4a4060,
      emissive: isActionsRepaired ? 0xff8a1f : 0x4a4060,
      emissiveIntensity: 0.5,
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
