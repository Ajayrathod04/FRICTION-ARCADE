import * as THREE from 'three';
import { createTrainSystem } from './TrainSystem';
import type { TrainSystemHandles, TrainScheduleItem, TrainPhase } from './TrainSystem';
import { createTokenCollectibles } from './TokenCollectibles';
import type { TokenCollectiblesHandles } from './TokenCollectibles';

export interface StationEnvironmentBuildOptions {
  scene: THREE.Scene;
  isClarity: boolean;
  clarityRepairs: string[];
  isFrictionVision: boolean;
  onTrainPhaseChange?: (phase: TrainPhase, service: TrainScheduleItem) => void;
}

export interface StationEnvironmentHandles {
  stationGroup: THREE.Group;
  trainSystem: TrainSystemHandles;
  tokenCollectibles: TokenCollectiblesHandles;
  departureBoardLed: THREE.Mesh;
  kioskScreenMesh: THREE.Mesh;
  kioskBannerMesh: THREE.Mesh;
  deskSignMesh: THREE.Mesh;
  deskMonitorMesh: THREE.Mesh;
  clockHandMesh: THREE.Mesh;
  update: (playerPos: THREE.Vector3, time: number, delta: number) => { collectedTokenId: string | null };
  triggerTrainDeparture: () => void;
  triggerTrainBoarding: () => void;
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
  ctx.fillStyle = '#059669';
  ctx.fillText('ON TIME', 740, 314);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createKioskScreenTexture(isLabelsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Header Banner
  ctx.fillStyle = '#17131f';
  ctx.fillRect(0, 0, 512, 68);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('⚡ TICKET TOUCH SCREEN', 24, 44);

  // Field 1: Departure Station
  if (isLabelsRepaired) {
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Departure Station *', 32, 108);

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 118, 448, 54);
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(34, 120, 444, 50);
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('Mumbai Central (BCT)', 48, 154);
  } else {
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 100, 448, 56);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('(vanished placeholder...)', 48, 136);
  }

  // Field 2: Destination Station
  if (isLabelsRepaired) {
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Destination *', 32, 204);

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 214, 448, 54);
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(34, 216, 444, 50);
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('Pune Jn (PUNE)', 48, 250);
  } else {
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 180, 448, 56);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('(where to? placeholder erased)', 48, 216);
  }

  // Field 3: Travel Date
  if (isLabelsRepaired) {
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Travel Date *', 32, 300);

    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 310, 448, 54);
    ctx.fillStyle = '#f0fdf4';
    ctx.fillRect(34, 312, 444, 50);
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('Saturday, 17 Oct 2026', 48, 346);
  } else {
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 260, 448, 56);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'italic 20px sans-serif';
    ctx.fillText('date format unspecified', 48, 296);
  }

  // CTA Button
  ctx.fillStyle = isLabelsRepaired ? '#ff8a1f' : '#6b7280';
  ctx.fillRect(32, 400, 448, 70);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(isLabelsRepaired ? 'BOOK DECCAN EXPRESS →' : 'BOOK NOW', 80, 445);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createDeskMonitorTexture(isActionsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#181326';
  ctx.fillRect(0, 0, 512, 256);

  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('CUSTOMER SERVICE TERMINAL', 20, 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  ctx.fillText('Deccan Express · 2 Passengers (AC Chair)', 20, 70);

  if (!isActionsRepaired) {
    ctx.fillStyle = '#4c425e';
    ctx.fillRect(25, 90, 220, 80);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CANCEL', 95, 140);

    ctx.fillStyle = '#4c425e';
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
  const { scene, isClarity, clarityRepairs, onTrainPhaseChange } = options;
  const disposables: Array<{ dispose: () => void }> = [];

  const regGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
    disposables.push(geo);
    return geo;
  };
  const regMat = <T extends THREE.Material>(mat: T): T => {
    disposables.push(mat);
    return mat;
  };

  const stationGroup = new THREE.Group();
  scene.add(stationGroup);

  // =========================================================================
  // SHARED MATERIALS & COLOR PALETTE
  // =========================================================================
  const seafoamWallMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x428e82, // Victorian Seafoam Green
      roughness: 0.5,
      metalness: 0.05,
    })
  );

  const sandstoneMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xddcfba, // Sandstone beige architectural trim
      roughness: 0.45,
      metalness: 0.08,
    })
  );

  const mainFloorMat = regMat(
    new THREE.MeshStandardMaterial({
      color: isClarity ? 0xf4ebe1 : 0xe8ddd0,
      roughness: 0.32,
      metalness: 0.08,
    })
  );

  const plazaPaverMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4c8b6, // Outdoor city stone pavers
      roughness: 0.65,
      metalness: 0.04,
    })
  );

  const darkTerrazzoMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x302742,
      roughness: 0.2,
      metalness: 0.15,
    })
  );

  // =========================================================================
  // 1. ZONE 0: CITY ARRIVAL PLAZA (South: z = 4.0 to 8.5, x = -6.0 to 6.0)
  // =========================================================================
  const cityPlazaGroup = new THREE.Group();

  // Plaza Stone Floor Slab
  const plazaFloorGeo = regGeo(new THREE.BoxGeometry(14.0, 0.3, 5.0));
  const plazaFloor = new THREE.Mesh(plazaFloorGeo, plazaPaverMat);
  plazaFloor.position.set(0, -0.15, 6.0);
  plazaFloor.receiveShadow = true;
  cityPlazaGroup.add(plazaFloor);

  // Pastel Victorian Street Buildings (South backdrop at z = 8.2)
  const pastelColors = [0xfca5a5, 0xfde047, 0x93c5fd, 0xc4b5fd, 0x86efac];
  for (let bx = -6.0; bx <= 6.0; bx += 2.4) {
    const bColor = pastelColors[Math.abs(Math.round(bx * 2)) % pastelColors.length];
    const bHeight = 4.2 + (Math.abs(bx) % 1.5) * 0.8;
    const bGeo = regGeo(new THREE.BoxGeometry(2.2, bHeight, 1.2));
    const bMat = regMat(new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.6 }));
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(bx, bHeight / 2 - 0.15, 8.4);
    building.castShadow = true;
    cityPlazaGroup.add(building);

    // Windows
    for (let wy = 1.0; wy < bHeight - 0.8; wy += 1.1) {
      for (const wx of [-0.5, 0.5]) {
        const wGeo = regGeo(new THREE.BoxGeometry(0.45, 0.6, 0.05));
        const wMat = regMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        const win = new THREE.Mesh(wGeo, wMat);
        win.position.set(bx + wx, wy, 7.78);
        cityPlazaGroup.add(win);
      }
    }
  }

  // Streetlamps along plaza sidewalk
  const lampPostGeo = regGeo(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 12));
  const lampIronMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 }));
  const lampGlobeGeo = regGeo(new THREE.SphereGeometry(0.18, 16, 16));
  const lampGlobeMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));

  for (const lx of [-4.5, 4.5]) {
    const lampG = new THREE.Group();
    lampG.position.set(lx, 0, 5.5);
    const post = new THREE.Mesh(lampPostGeo, lampIronMat);
    post.position.y = 1.3;
    const globe = new THREE.Mesh(lampGlobeGeo, lampGlobeMat);
    globe.position.y = 2.6;
    lampG.add(post, globe);
    cityPlazaGroup.add(lampG);
  }

  // Plaza Planters with Shrubbery
  const planterGeo = regGeo(new THREE.BoxGeometry(1.4, 0.45, 0.6));
  const planterMat = regMat(new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 })); // terracotta
  const shrubGeo = regGeo(new THREE.DodecahedronGeometry(0.35, 1));
  const shrubMat = regMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));

  for (const px of [-2.8, 2.8]) {
    const planter = new THREE.Mesh(planterGeo, planterMat);
    planter.position.set(px, 0.22, 5.0);
    const shrub1 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub1.position.set(px - 0.35, 0.55, 5.0);
    const shrub2 = new THREE.Mesh(shrubGeo, shrubMat);
    shrub2.position.set(px + 0.35, 0.55, 5.0);
    cityPlazaGroup.add(planter, shrub1, shrub2);
  }

  // Station Entrance Grand Facade Marquee (z = 3.6)
  const facadeArchGeo = regGeo(new THREE.BoxGeometry(7.0, 4.8, 0.5));
  const facadeArch = new THREE.Mesh(facadeArchGeo, sandstoneMat);
  facadeArch.position.set(0, 2.4, 3.6);
  cityPlazaGroup.add(facadeArch);

  // Entrance Portal Opening Cutout (Central archway)
  const portalArchGeo = regGeo(new THREE.BoxGeometry(3.6, 3.2, 0.6));
  const portalArchMat = regMat(new THREE.MeshBasicMaterial({ color: 0x17131f }));
  const portal = new THREE.Mesh(portalArchGeo, portalArchMat);
  portal.position.set(0, 1.6, 3.6);
  cityPlazaGroup.add(portal);

  // Station Marquee Signboard ("MUMBAI CENTRAL · FRICTION ARCADE")
  const marqueeGeo = regGeo(new THREE.BoxGeometry(4.8, 0.65, 0.15));
  const marqueeMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x17131f,
      roughness: 0.2,
      emissive: 0xff8a1f,
      emissiveIntensity: 0.35,
    })
  );
  const marquee = new THREE.Mesh(marqueeGeo, marqueeMat);
  marquee.position.set(0, 3.6, 3.32);
  cityPlazaGroup.add(marquee);

  stationGroup.add(cityPlazaGroup);

  // =========================================================================
  // 2. MAIN INTERIOR SLAB & CENTRAL CONCOURSE FLOOR
  // =========================================================================
  const interiorFloorGeo = regGeo(new THREE.BoxGeometry(14.0, 0.4, 7.8));
  const interiorFloor = new THREE.Mesh(interiorFloorGeo, mainFloorMat);
  interiorFloor.position.set(0, -0.2, 0.2);
  interiorFloor.receiveShadow = true;
  stationGroup.add(interiorFloor);

  // Central Polished Walkway Strip
  const terrazzoGeo = regGeo(new THREE.BoxGeometry(2.4, 0.01, 7.6));
  const terrazzoStrip = new THREE.Mesh(terrazzoGeo, darkTerrazzoMat);
  terrazzoStrip.position.set(0, 0.005, 0.2);
  terrazzoStrip.receiveShadow = true;
  stationGroup.add(terrazzoStrip);

  // Royal Blue Carpet Queue Runner (Leading towards Ticket Kiosk)
  const carpetGeo = regGeo(new THREE.BoxGeometry(1.4, 0.015, 1.8));
  const carpetMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.7,
      metalness: 0.05,
    })
  );
  const queueCarpet = new THREE.Mesh(carpetGeo, carpetMat);
  queueCarpet.position.set(0, 0.012, 1.25);
  queueCarpet.receiveShadow = true;
  stationGroup.add(queueCarpet);

  // Polished Brass Stanchion Posts & Velvet Ropes
  const stanchionPoleGeo = regGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 12));
  const stanchionBaseGeo = regGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16));
  const stanchionBallGeo = regGeo(new THREE.SphereGeometry(0.045, 12, 12));
  const brassMat = regMat(new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.18 }));
  const velvetRopeMat = regMat(new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 }));

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
    const ropeGeo = regGeo(new THREE.BoxGeometry(0.03, 0.03, 1.4));
    const rope = new THREE.Mesh(ropeGeo, velvetRopeMat);
    rope.position.set(sx, 0.62, 1.3);
    stationGroup.add(rope);
  }

  // =========================================================================
  // 3. ZONE 1: GRAND VICTORIAN ATRIUM & MEZZANINE (z = 1.6 to 3.6)
  // =========================================================================
  // Freestanding Vintage Cast-Iron Pedestal Clock Tower (at x: 1.6, z: 2.2)
  const clockTowerGroup = new THREE.Group();
  clockTowerGroup.position.set(1.6, 0, 2.2);

  const ctIronMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }));
  const ctBase = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.42, 0.5, 0.42)), ctIronMat);
  ctBase.position.y = 0.25;
  const ctShaft = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 12)), ctIronMat);
  ctShaft.position.y = 1.3;
  const ctHead = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 24)), ctIronMat);
  ctHead.rotation.x = Math.PI / 2;
  ctHead.position.y = 2.2;
  clockTowerGroup.add(ctBase, ctShaft, ctHead);

  // Twin Clock Dials
  const ctDialMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfffdf5 }));
  const dialSouth = new THREE.Mesh(regGeo(new THREE.CircleGeometry(0.24, 24)), ctDialMat);
  dialSouth.position.set(0, 2.2, 0.125);
  const dialNorth = new THREE.Mesh(regGeo(new THREE.CircleGeometry(0.24, 24)), ctDialMat);
  dialNorth.position.set(0, 2.2, -0.125);
  dialNorth.rotation.y = Math.PI;

  const clockHandMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.02, 0.14, 0.01)), ctIronMat);
  clockHandMesh.position.set(0, 2.2, 0.13);
  clockTowerGroup.add(dialSouth, dialNorth, clockHandMesh);
  stationGroup.add(clockTowerGroup);

  // West Grand Mezzanine Staircase (at x: -2.2, z: 2.5)
  const stairGroup = new THREE.Group();
  stairGroup.position.set(-2.4, 0, 2.5);
  for (let step = 0; step < 7; step++) {
    const sMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.2, 0.14, 0.28)), sandstoneMat);
    sMesh.position.set(0, 0.07 + step * 0.14, -step * 0.26);
    stairGroup.add(sMesh);
  }
  // Railing
  const railMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.04, 0.06, 1.8)), brassMat);
  railMesh.position.set(0.58, 1.0, -0.7);
  railMesh.rotation.x = 0.45;
  stairGroup.add(railMesh);
  stationGroup.add(stairGroup);

  // =========================================================================
  // 4. AREA 1: TICKET CONCOURSE & CENTRAL KIOSK (x: 0, z: 0.2)
  // =========================================================================
  const kioskGroup = new THREE.Group();
  kioskGroup.position.set(0, 0, 0.2);

  const kioskBodyGeo = regGeo(new THREE.BoxGeometry(1.1, 1.85, 0.7));
  const kioskBodyMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x1f192c,
      roughness: 0.35,
      metalness: 0.2,
    })
  );
  const kioskBody = new THREE.Mesh(kioskBodyGeo, kioskBodyMat);
  kioskBody.position.y = 0.925;
  kioskBody.castShadow = true;
  kioskGroup.add(kioskBody);

  // Screen
  const kioskScreenMat = regMat(
    new THREE.MeshStandardMaterial({
      map: createKioskScreenTexture(clarityRepairs.includes('labels')),
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      roughness: 0.2,
    })
  );
  const kioskScreenMesh = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(0.82, 0.82)), kioskScreenMat);
  kioskScreenMesh.position.set(0, 1.15, 0.355);
  kioskGroup.add(kioskScreenMesh);

  // Marquee Banner
  const kioskBannerMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xff8a1f,
      emissive: 0xff8a1f,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    })
  );
  const kioskBannerMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.0, 0.24, 0.08)), kioskBannerMat);
  kioskBannerMesh.position.set(0, 1.72, 0.36);
  kioskGroup.add(kioskBannerMesh);

  stationGroup.add(kioskGroup);

  // =========================================================================
  // 5. AREA 2: DEPARTURE GALLERY (East Wing: x = 4.2, z = -0.6)
  // =========================================================================
  const depGalleryGroup = new THREE.Group();
  depGalleryGroup.position.set(4.2, 0, -0.6);

  // East Wall & Archway
  const depWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.4, 5.0, 4.4)), seafoamWallMat);
  depWall.position.set(2.4, 2.5, 0);
  depGalleryGroup.add(depWall);

  // Monumental Solari Departures Board
  const departureBoardLedMat = regMat(
    new THREE.MeshStandardMaterial({
      map: createBoardCanvasTexture(clarityRepairs.includes('errors')),
      emissive: 0xffffff,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    })
  );
  const departureBoardLed = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(3.6, 1.8)), departureBoardLedMat);
  departureBoardLed.position.set(0, 2.8, -1.2);
  depGalleryGroup.add(departureBoardLed);

  const boardFrame = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.8, 2.0, 0.2)), ctIronMat);
  boardFrame.position.set(0, 2.8, -1.3);
  depGalleryGroup.add(boardFrame);

  stationGroup.add(depGalleryGroup);

  // =========================================================================
  // 6. AREA 3: PASSENGER SERVICES & HELP DESK (West Wing: x = -4.2, z = 0.2)
  // =========================================================================
  const helpDeskGroup = new THREE.Group();
  helpDeskGroup.position.set(-4.2, 0, 0.2);

  // West Wall
  const westWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.4, 5.0, 4.4)), seafoamWallMat);
  westWall.position.set(-2.4, 2.5, 0);
  helpDeskGroup.add(westWall);

  // Curved Customer Service Counter Desk
  const counterMesh = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(2.4, 0.95, 0.9)),
    sandstoneMat
  );
  counterMesh.position.set(0, 0.475, 0);
  counterMesh.castShadow = true;
  helpDeskGroup.add(counterMesh);

  // Counter Tablet Screen (Competing actions clue)
  const deskMonitorMat = regMat(
    new THREE.MeshStandardMaterial({
      map: createDeskMonitorTexture(clarityRepairs.includes('actions')),
      emissive: 0xffffff,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    })
  );
  const deskMonitorMesh = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(0.7, 0.35)), deskMonitorMat);
  deskMonitorMesh.rotation.x = -0.4;
  deskMonitorMesh.position.set(0, 1.05, 0.2);
  helpDeskGroup.add(deskMonitorMesh);

  // Overhead Sign ("PASSENGER SERVICES & HELP DESK")
  const deskSignMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x3b82f6, emissiveIntensity: 0.4 }));
  const deskSignMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.2, 0.35, 0.1)), deskSignMat);
  deskSignMesh.position.set(0, 2.5, 0);
  helpDeskGroup.add(deskSignMesh);

  stationGroup.add(helpDeskGroup);

  // =========================================================================
  // 7. AREA 4: WAITING LOUNGE & TRANSIT ARCADE (Southwest: x = -4.2, z = 3.0)
  // =========================================================================
  const loungeGroup = new THREE.Group();
  loungeGroup.position.set(-4.2, 0, 3.0);

  // Snack Kiosk & Transit Arcade Counter
  const snackBar = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.2, 1.1, 0.8)), sandstoneMat);
  snackBar.position.set(0, 0.55, 0.8);
  const snackSign = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 0.3, 0.08)), brassMat);
  snackSign.position.set(0, 1.4, 0.8);
  loungeGroup.add(snackBar, snackSign);

  // Teak Wood Waiting Benches with sage-green legs
  const teakMat = regMat(new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 }));
  const sageMat = regMat(new THREE.MeshStandardMaterial({ color: 0x2e6040, roughness: 0.5, metalness: 0.3 }));

  for (const bz of [-0.6, 0.2]) {
    const benchG = new THREE.Group();
    benchG.position.set(0, 0, bz);
    const seat = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.08, 0.45)), teakMat);
    seat.position.y = 0.42;
    const back = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.35, 0.06)), teakMat);
    back.position.set(0, 0.62, -0.2);
    for (const lx of [-0.7, 0.7]) {
      const leg = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 8)), sageMat);
      leg.position.set(lx, 0.21, 0);
      benchG.add(leg);
    }
    benchG.add(seat, back);
    loungeGroup.add(benchG);
  }

  // Potted Banana Palms in Terracotta Urns
  for (const px of [-1.5, 1.5]) {
    const urn = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.25, 0.18, 0.5, 16)), planterMat);
    urn.position.set(px, 0.25, -0.6);
    const palmLeaf = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.45, 0.9, 5)), shrubMat);
    palmLeaf.position.set(px, 0.85, -0.6);
    loungeGroup.add(urn, palmLeaf);
  }

  stationGroup.add(loungeGroup);

  // =========================================================================
  // 8. AREA 5: DESIGNER WORKSHOP & CLARITY LAB (Southeast: x = 4.2, z = 3.0)
  // =========================================================================
  const labGroup = new THREE.Group();
  labGroup.position.set(4.2, 0, 3.0);

  // Workbench Table
  const benchTable = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.9, 1.0)), darkTerrazzoMat);
  benchTable.position.set(0, 0.45, 0);
  const benchTop = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.5, 0.08, 1.1)), brassMat);
  benchTop.position.set(0, 0.94, 0);
  labGroup.add(benchTable, benchTop);

  // Luminous Neon Sign: "CLARITY DESIGN LAB"
  const labSignMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    })
  );
  const labSign = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.4, 0.1)), labSignMat);
  labSign.position.set(0, 2.4, 0);
  labGroup.add(labSign);

  // 3 Interactive Repair Pedestals (Labels, Errors, Actions)
  const pedColors = [0xffd23f, 0xff3b30, 0x8ddcff];
  for (let pi = 0; pi < 3; pi++) {
    const px = (pi - 1) * 0.75;
    const pedMat = regMat(new THREE.MeshStandardMaterial({ color: pedColors[pi], roughness: 0.3 }));
    const ped = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 16)), pedMat);
    ped.position.set(px, 0.425, 0.9);
    labGroup.add(ped);
  }

  stationGroup.add(labGroup);

  // =========================================================================
  // 9. GRAND PLATFORM 1 & TRACKS (North: z = -2.5 to -5.5, x = -8.0 to 8.0)
  // =========================================================================
  const platformGroup = new THREE.Group();

  // Long Passenger Platform
  const platGeo = regGeo(new THREE.BoxGeometry(16.0, 0.4, 2.2));
  const platMat = regMat(new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.5 }));
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.set(0, -0.2, -2.6);
  platform.receiveShadow = true;
  platformGroup.add(platform);

  // Tactile Yellow Safety Edge
  const safetyEdgeGeo = regGeo(new THREE.BoxGeometry(16.0, 0.02, 0.18));
  const safetyEdgeMat = regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 }));
  const safetyEdge = new THREE.Mesh(safetyEdgeGeo, safetyEdgeMat);
  safetyEdge.position.set(0, 0.01, -3.6);
  platformGroup.add(safetyEdge);

  // Track Bed Gravel Ballast
  const ballastGeo = regGeo(new THREE.BoxGeometry(16.0, 0.35, 2.2));
  const ballastMat = regMat(new THREE.MeshStandardMaterial({ color: 0x47424f, roughness: 0.9 }));
  const ballast = new THREE.Mesh(ballastGeo, ballastMat);
  ballast.position.set(0, -0.22, -4.6);
  platformGroup.add(ballast);

  // Wooden Sleepers
  for (let s = -7.6; s <= 7.6; s += 0.45) {
    const sleeperGeo = regGeo(new THREE.BoxGeometry(0.22, 0.08, 1.8));
    const sleeperMat = regMat(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 }));
    const sleeper = new THREE.Mesh(sleeperGeo, sleeperMat);
    sleeper.position.set(s, -0.06, -4.6);
    platformGroup.add(sleeper);
  }

  // Steel Rails
  for (const rz of [-4.1, -5.1]) {
    const railGeo = regGeo(new THREE.BoxGeometry(16.0, 0.07, 0.08));
    const railMat = regMat(new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.85, roughness: 0.2 }));
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, -0.02, rz);
    platformGroup.add(rail);
  }

  stationGroup.add(platformGroup);

  // =========================================================================
  // 10. LIVING TRAIN SYSTEM & COLLECTIBLE TOKENS
  // =========================================================================
  const trainSystem = createTrainSystem({
    scene,
    onPhaseChange: onTrainPhaseChange,
  });

  const tokenCollectibles = createTokenCollectibles(scene);

  // =========================================================================
  // 11. UPDATE & DISPOSE HANDLERS
  // =========================================================================
  const update = (playerPos: THREE.Vector3, time: number, delta: number): { collectedTokenId: string | null } => {
    // Clock rotation
    clockHandMesh.rotation.z = -time * 0.1;

    // Subtle screen pulsing
    kioskScreenMat.emissiveIntensity = 0.5 + Math.sin(time * 3.0) * 0.12;
    departureBoardLedMat.emissiveIntensity = 0.58 + Math.sin(time * 2.5) * 0.1;

    // Train movement & doors
    trainSystem.update(delta);

    // Collectibles update & proximity collection
    const tokenResult = tokenCollectibles.update(playerPos, time, delta);

    return { collectedTokenId: tokenResult.collectedId };
  };

  const triggerTrainDeparture = () => {
    trainSystem.triggerImmediateDeparture();
  };

  const triggerTrainBoarding = () => {
    trainSystem.triggerImmediateBoarding();
  };

  const dispose = () => {
    scene.remove(stationGroup);
    trainSystem.dispose();
    tokenCollectibles.dispose();
    disposables.forEach((d) => d.dispose());
  };

  return {
    stationGroup,
    trainSystem,
    tokenCollectibles,
    departureBoardLed,
    kioskScreenMesh,
    kioskBannerMesh,
    deskSignMesh,
    deskMonitorMesh,
    clockHandMesh,
    update,
    triggerTrainDeparture,
    triggerTrainBoarding,
    dispose,
  };
}
