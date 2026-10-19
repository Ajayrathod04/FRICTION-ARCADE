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
  departureBoardLed2: THREE.Mesh;
  kioskScreenMesh: THREE.Mesh;
  kioskBannerMesh: THREE.Mesh;
  deskSignMesh: THREE.Mesh;
  deskMonitorMesh: THREE.Mesh;
  clockHandMesh: THREE.Mesh;
  entranceGateGroup: THREE.Group;
  isGateOpen: () => boolean;
  openEntranceGate: () => void;
  setCutawayMode: (enabled: boolean) => void;
  setXRayMode: (enabled: boolean) => void;
  getOccluderMeshes: () => THREE.Mesh[];
  update: (playerPos: THREE.Vector3, time: number, delta: number) => { collectedTokenId: string | null; nearbyDoorName: string | null };
  triggerTrainDeparture: () => void;
  triggerTrainBoarding: () => void;
  dispose: () => void;
}

function createStationMarqueeCanvasTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep architectural navy/charcoal background
  ctx.fillStyle = '#0b0e14';
  ctx.fillRect(0, 0, 1024, 256);

  // Polished Brass / Gold double border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 1012, 244);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 996, 228);

  // Header ribbon
  ctx.fillStyle = '#172554';
  ctx.fillRect(16, 16, 992, 40);
  ctx.fillStyle = '#93c5fd';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('◄ WEST ENTRANCE · GRAND CENTRAL TERMINAL · EAST ENTRANCE ►', 512, 43);

  // Primary Station Name: FRICTION CENTRAL
  ctx.fillStyle = '#ffd23f';
  ctx.font = '900 66px sans-serif';
  ctx.shadowColor = '#ff8a1f';
  ctx.shadowBlur = 14;
  ctx.fillText('★ FRICTION CENTRAL ★', 512, 126);
  ctx.shadowBlur = 0;

  // Supporting Signage: MUMBAI CENTRAL · DECCAN EXPRESS · PLATFORMS 1 & 2
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('MUMBAI CENTRAL · DECCAN EXPRESS · PLATFORMS 1 & 2', 512, 180);

  // Bottom wayfinding indicator strip
  ctx.fillStyle = '#b45309';
  ctx.fillRect(16, 202, 992, 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('WAYFINDING: CONCOURSE STRAIGHT AHEAD · TICKET TERMINALS 1-5', 512, 227);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createPlatform2BoardCanvasTexture(): THREE.CanvasTexture {
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

  // Red/Gold Header Banner
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(8, 8, 1008, 64);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('PLATFORM 2 · INTERCITY & EXPRESS DEPARTURES', 24, 52);

  // Table Column Headers
  ctx.fillStyle = '#221a36';
  ctx.fillRect(8, 76, 1008, 44);
  ctx.fillStyle = '#ffd23f';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('TRAIN NO.', 28, 106);
  ctx.fillText('DESTINATION', 230, 106);
  ctx.fillText('TIME', 450, 106);
  ctx.fillText('PLATFORM', 560, 106);
  ctx.fillText('STATUS', 730, 106);

  // Row 1: 12951 RAJDHANI EXP
  ctx.fillStyle = '#191328';
  ctx.fillRect(8, 126, 1008, 76);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('12951 RAJDHANI EXP', 28, 172);
  ctx.fillStyle = '#fde047';
  ctx.fillText('NEW DELHI', 230, 172);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('07:45', 450, 172);
  ctx.fillStyle = '#b6ffb2';
  ctx.fillText('PL 2', 580, 172);
  ctx.fillStyle = '#059669';
  ctx.fillRect(720, 142, 270, 46);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('✓ BOARDING NOW', 740, 172);

  // Row 2: 12009 SHATABDI EXP
  ctx.fillStyle = '#140f20';
  ctx.fillRect(8, 206, 1008, 64);
  ctx.fillStyle = '#e4e4e7';
  ctx.font = '22px monospace';
  ctx.fillText('12009 SHATABDI EXP', 28, 246);
  ctx.fillStyle = '#8ddcff';
  ctx.fillText('AHMEDABAD', 230, 246);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('08:10', 450, 246);
  ctx.fillText('PL 2', 580, 246);
  ctx.fillStyle = '#ffd23f';
  ctx.fillText('ON TIME', 740, 246);

  // Footer Wayfinding
  ctx.fillStyle = '#ff8a1f';
  ctx.fillRect(8, 420, 1008, 80);
  ctx.fillStyle = '#17131f';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('WAYFINDING: PLATFORM 1 ACCESS VIA OVERHEAD FOOTBRIDGE OR WEST LEVEL CROSSING', 24, 468);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
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

function createKioskScreenTexture(isLabelsRepaired: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Header Banner
  ctx.fillStyle = '#ff3d8b';
  ctx.fillRect(0, 0, 512, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('QUICK TICKET TERMINAL', 24, 52);

  // Field 1: Departure Station
  if (isLabelsRepaired) {
    ctx.fillStyle = '#17131f';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Departure *', 32, 110);

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
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('CONFIRM TICKET', 285, 140);

    ctx.fillStyle = '#ff857f';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('⚠ Competing visual weights cause user hesitation', 25, 210);
  } else {
    ctx.fillStyle = '#059669';
    ctx.fillRect(25, 80, 460, 85);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('★ CONFIRM & PRINT (PRIMARY)', 55, 135);

    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 185, 460, 50);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Cancel reservation (Secondary Action)', 110, 216);
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
      color: 0xddcfba, // Sandstone warm cream architectural trim
      roughness: 0.45,
      metalness: 0.08,
    })
  );

  const concourseFloorMat = regMat(
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

  const asphaltRoadMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e242d, // Dark asphalt roadway
      roughness: 0.85,
      metalness: 0.05,
    })
  );

  const darkTerrazzoMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x302742,
      roughness: 0.2,
      metalness: 0.15,
    })
  );

  const brassMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished brass
      metalness: 0.85,
      roughness: 0.18,
    })
  );

  const castIronMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.5,
    })
  );

  const velvetRopeMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x991b1b, // Rich crimson velvet
      roughness: 0.6,
    })
  );

  const glassWindowMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xa5e5ff,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    })
  );

  // Teak Wood & Benches
  const teakWoodMat = regMat(new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.42 }));
  const teakBenchMat = teakWoodMat;

  // Distinct Floor Materials for all 5 Rooms
  const departureFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 })); // Midnight-blue & cream
  const helpDeskFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0xc2785c, roughness: 0.45 })); // Terracotta & sandstone
  const loungeFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 })); // Teak parquet wood
  const labFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.25 })); // Deep violet high-gloss terrazzo

  // =========================================================================
  // 1. ZONE 0: CITY STREET & ARRIVAL PLAZA (z = 4.4 to 12.5)
  // Character starts outside on the sidewalk, facing north toward the station
  // =========================================================================
  const cityPlazaGroup = new THREE.Group();

  // Wide 2-Lane Asphalt Roadway (z = 8.4 to 12.4, spanning 28m East-West)
  const roadGeo = regGeo(new THREE.BoxGeometry(28.0, 0.2, 4.0));
  const roadMesh = new THREE.Mesh(roadGeo, asphaltRoadMat);
  roadMesh.position.set(0, -0.22, 10.4);
  roadMesh.receiveShadow = true;
  cityPlazaGroup.add(roadMesh);

  // Road Lane Dividers (Dashed yellow centerlines at z = 10.4)
  for (let rx = -12.0; rx <= 12.0; rx += 2.4) {
    const laneGeo = regGeo(new THREE.BoxGeometry(1.2, 0.015, 0.14));
    const laneMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffd23f }));
    const lane = new THREE.Mesh(laneGeo, laneMat);
    lane.position.set(rx, -0.11, 10.4);
    cityPlazaGroup.add(lane);
  }

  // Painted Lane Directional Arrows on Asphalt
  // Eastbound lane (z = 11.4) arrows pointing East (+X)
  for (const ax of [-6.0, 4.0]) {
    const arrowShaft = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.2, 0.016, 0.2)), regMat(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    arrowShaft.position.set(ax, -0.108, 11.4);
    const arrowHead = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.35, 0.6, 3)), regMat(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    arrowHead.rotation.x = Math.PI / 2;
    arrowHead.rotation.z = -Math.PI / 2;
    arrowHead.position.set(ax + 0.8, -0.108, 11.4);
    cityPlazaGroup.add(arrowShaft, arrowHead);
  }

  // Westbound lane (z = 9.4) arrows pointing West (-X)
  for (const ax of [-3.0, 7.0]) {
    const arrowShaft = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.2, 0.016, 0.2)), regMat(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    arrowShaft.position.set(ax, -0.108, 9.4);
    const arrowHead = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.35, 0.6, 3)), regMat(new THREE.MeshBasicMaterial({ color: 0xffffff })));
    arrowHead.rotation.x = Math.PI / 2;
    arrowHead.rotation.z = Math.PI / 2;
    arrowHead.position.set(ax - 0.8, -0.108, 9.4);
    cityPlazaGroup.add(arrowShaft, arrowHead);
  }

  // Pedestrian Zebra Crossing leading to station entrance (x: -1.8 to 1.8, across both lanes)
  for (let zx = -1.6; zx <= 1.6; zx += 0.55) {
    const zebraGeo = regGeo(new THREE.BoxGeometry(0.35, 0.018, 3.6));
    const zebraMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const zebra = new THREE.Mesh(zebraGeo, zebraMat);
    zebra.position.set(zx, -0.105, 10.4);
    cityPlazaGroup.add(zebra);
  }

  // North Sidewalk Curb Stone (separating road z=8.4 from arrival plaza)
  const northCurbGeo = regGeo(new THREE.BoxGeometry(28.0, 0.16, 0.3));
  const curbMat = regMat(new THREE.MeshStandardMaterial({ color: 0x8c857b, roughness: 0.6 }));
  const northCurb = new THREE.Mesh(northCurbGeo, curbMat);
  northCurb.position.set(0, -0.12, 8.35);
  cityPlazaGroup.add(northCurb);

  // South Sidewalk Curb Stone (z = 12.45)
  const southCurb = new THREE.Mesh(regGeo(new THREE.BoxGeometry(28.0, 0.16, 0.3)), curbMat);
  southCurb.position.set(0, -0.12, 12.45);
  cityPlazaGroup.add(southCurb);

  // Pedestrian Arrival Plaza Paver Slab (x in [-7.6, 7.6], z in [4.4, 8.2])
  const plazaFloorGeo = regGeo(new THREE.BoxGeometry(16.0, 0.3, 4.0));
  const plazaFloor = new THREE.Mesh(plazaFloorGeo, plazaPaverMat);
  plazaFloor.position.set(0, -0.15, 6.3);
  plazaFloor.receiveShadow = true;
  cityPlazaGroup.add(plazaFloor);

  // Traffic Signal Stanchions at North Curbs (flanking the zebra crossing)
  const trafficLightGreenMat = regMat(new THREE.MeshBasicMaterial({ color: 0x10b981 }));
  const trafficLightAmberMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
  const trafficLightRedMat = regMat(new THREE.MeshBasicMaterial({ color: 0xef4444 }));

  for (const sx of [-2.8, 2.8]) {
    const signalPost = new THREE.Group();
    signalPost.position.set(sx, 0, 8.25);
    const pole = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.05, 0.06, 3.2, 12)), castIronMat);
    pole.position.y = 1.6;
    const housing = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.85, 0.25)), castIronMat);
    housing.position.set(0, 2.7, 0);

    const redLens = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.08, 12, 12)), trafficLightRedMat);
    redLens.position.set(0, 2.95, 0.12);
    const amberLens = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.08, 12, 12)), trafficLightAmberMat);
    amberLens.position.set(0, 2.7, 0.12);
    const greenLens = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.08, 12, 12)), trafficLightGreenMat);
    greenLens.position.set(0, 2.45, 0.12);

    signalPost.add(pole, housing, redLens, amberLens, greenLens);
    cityPlazaGroup.add(signalPost);
  }

  // -------------------------------------------------------------------------
  // COMMERCIAL BUILDINGS FLANKING THE PLAZA (Glass-and-steel architecture)
  // -------------------------------------------------------------------------
  // 1. WEST COMMERCIAL BUILDING: "METRO ARCADE & CAFE" (x in [-13.2, -7.6], z in [4.6, 9.6])
  const westCommGroup = new THREE.Group();
  westCommGroup.position.set(-10.4, 0, 7.1);

  // Sandstone structural piers & walls
  const westCommMain = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 4.8, 4.8)), sandstoneMat);
  westCommMain.position.y = 2.4;
  westCommMain.castShadow = true;
  westCommGroup.add(westCommMain);

  // Large Glazed Shopfront Windows with steel mullions facing the plaza (+X)
  const westShopGlass = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.12, 2.6, 4.2)), glassWindowMat);
  westShopGlass.position.set(2.72, 1.6, 0);
  const westMullionH = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 0.1, 4.3)), castIronMat);
  westMullionH.position.set(2.72, 1.6, 0);
  const westMullionV1 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 2.6, 0.1)), castIronMat);
  westMullionV1.position.set(2.72, 1.6, -1.2);
  const westMullionV2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 2.6, 0.1)), castIronMat);
  westMullionV2.position.set(2.72, 1.6, 1.2);
  westCommGroup.add(westShopGlass, westMullionH, westMullionV1, westMullionV2);

  // Illuminated Storefront Signs on West Arcade
  const cafeSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.16, 0.45, 1.8)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x78350f, emissive: 0xffa040, emissiveIntensity: 0.65 }))
  );
  cafeSign.position.set(2.78, 3.2, -1.0);
  const booksSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.16, 0.45, 1.8)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x60a5fa, emissiveIntensity: 0.65 }))
  );
  booksSign.position.set(2.78, 3.2, 1.1);
  westCommGroup.add(cafeSign, booksSign);

  // Outdoor Cafe Patio Table and Two Chairs
  const cafeTable = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.35, 0.35, 0.7, 12)), brassMat);
  cafeTable.position.set(3.4, 0.35, -1.0);
  const chair1 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.4, 0.3)), teakBenchMat);
  chair1.position.set(3.4, 0.2, -1.6);
  const chair2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.4, 0.3)), teakBenchMat);
  chair2.position.set(3.4, 0.2, -0.4);
  westCommGroup.add(cafeTable, chair1, chair2);
  cityPlazaGroup.add(westCommGroup);

  // 2. EAST COMMERCIAL BUILDING: "STATION SQUARE GALLERIA" (x in [7.6, 13.2], z in [4.6, 9.6])
  const eastCommGroup = new THREE.Group();
  eastCommGroup.position.set(10.4, 0, 7.1);

  const eastCommMain = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 4.8, 4.8)), sandstoneMat);
  eastCommMain.position.y = 2.4;
  eastCommMain.castShadow = true;
  eastCommGroup.add(eastCommMain);

  // Large Glazed Windows facing West into the plaza (-X)
  const eastShopGlass = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.12, 2.6, 4.2)), glassWindowMat);
  eastShopGlass.position.set(-2.72, 1.6, 0);
  const eastMullionH = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 0.1, 4.3)), castIronMat);
  eastMullionH.position.set(-2.72, 1.6, 0);
  const eastMullionV1 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 2.6, 0.1)), castIronMat);
  eastMullionV1.position.set(-2.72, 1.6, -1.2);
  const eastMullionV2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.14, 2.6, 0.1)), castIronMat);
  eastMullionV2.position.set(-2.72, 1.6, 1.2);
  eastCommGroup.add(eastShopGlass, eastMullionH, eastMullionV1, eastMullionV2);

  // Storefront Signs: "STATION PHARMACY" and "DECCAN TRAVEL GOODS"
  const pharmSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.16, 0.45, 1.8)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x065f46, emissive: 0x34d399, emissiveIntensity: 0.65 }))
  );
  pharmSign.position.set(-2.78, 3.2, -1.0);
  const travelSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.16, 0.45, 1.8)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x991b1b, emissive: 0xf87171, emissiveIntensity: 0.65 }))
  );
  travelSign.position.set(-2.78, 3.2, 1.1);
  eastCommGroup.add(pharmSign, travelSign);
  cityPlazaGroup.add(eastCommGroup);

  // -------------------------------------------------------------------------
  // STREET FURNITURE: BENCHES, SHRUBS, STREETLAMPS & HANGING BANNERS
  // -------------------------------------------------------------------------
  // Sidewalk Teak Benches along the plaza
  for (const bx of [-3.8, 3.8]) {
    const plazaBench = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.42, 0.5)), teakBenchMat);
    plazaBench.position.set(bx, 0.21, 7.0);
    cityPlazaGroup.add(plazaBench);
  }

  // Decorative Planter Boxes with Flowering Shrubs
  const flowerBoxMat = regMat(new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }));
  const blossomMat = regMat(new THREE.MeshBasicMaterial({ color: 0xff3d8b }));
  for (const fx of [-2.4, 2.4]) {
    const boxG = new THREE.Group();
    boxG.position.set(fx, 0, 5.8);
    const planterBox = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.8, 0.4, 0.8)), flowerBoxMat);
    planterBox.position.y = 0.2;
    const foliage = new THREE.Mesh(regGeo(new THREE.DodecahedronGeometry(0.35, 1)), regMat(new THREE.MeshStandardMaterial({ color: 0x16a34a })));
    foliage.position.y = 0.55;
    const flowers = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.16, 8, 8)), blossomMat);
    flowers.position.y = 0.7;
    boxG.add(planterBox, foliage, flowers);
    cityPlazaGroup.add(boxG);
  }

  // Street Trees in circular sidewalk planters
  for (const tx of [-5.2, 5.2]) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, 7.8);
    const trunk = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 8)), regMat(new THREE.MeshStandardMaterial({ color: 0x4a2e1b })));
    trunk.position.y = 0.7;
    const foliage = new THREE.Mesh(regGeo(new THREE.DodecahedronGeometry(0.65, 1)), regMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })));
    foliage.position.y = 1.8;
    const grate = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16)), castIronMat);
    grate.position.y = 0.02;
    treeGroup.add(trunk, foliage, grate);
    cityPlazaGroup.add(treeGroup);
  }

  // Victorian Streetlamps with Hanging Vertical Banners
  const lampPostGeo = regGeo(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 12));
  const lampGlobeGeo = regGeo(new THREE.SphereGeometry(0.18, 16, 16));
  const lampGlobeMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));

  const bannerMat1 = regMat(new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.5 }));
  const bannerMat2 = regMat(new THREE.MeshStandardMaterial({ color: 0xff3d8b, roughness: 0.5 }));

  const plazaBanners: THREE.Mesh[] = [];

  for (const lx of [-5.5, 5.5]) {
    for (const lz of [6.0, 8.0]) {
      const lampG = new THREE.Group();
      lampG.position.set(lx, 0, lz);
      const post = new THREE.Mesh(lampPostGeo, castIronMat);
      post.position.y = 1.3;
      const globe = new THREE.Mesh(lampGlobeGeo, lampGlobeMat);
      globe.position.y = 2.6;
      lampG.add(post, globe);

      // Hanging decorative banner on the 6.0 lamp
      if (lz === 6.0) {
        const bannerArm = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8)), castIronMat);
        bannerArm.rotation.z = Math.PI / 2;
        bannerArm.position.set(lx < 0 ? 0.4 : -0.4, 2.2, 0);

        const bannerFabric = new THREE.Mesh(
          regGeo(new THREE.PlaneGeometry(0.55, 1.1)),
          lx < 0 ? bannerMat1 : bannerMat2
        );
        bannerFabric.position.set(lx < 0 ? 0.4 : -0.4, 1.6, 0);
        plazaBanners.push(bannerFabric);
        lampG.add(bannerArm, bannerFabric);
      }

      cityPlazaGroup.add(lampG);
    }
  }

  // Plaza Wayfinding Information Kiosk: "FRICTION CENTRAL · WAYFINDING" (x = -2.6, z = 7.0)
  const signpostGroup = new THREE.Group();
  signpostGroup.position.set(-2.6, 0, 7.0);
  const signPole = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8)), castIronMat);
  signPole.position.y = 0.9;
  const signBoard = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.6, 0.5, 0.08)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x3b82f6, emissiveIntensity: 0.4 }))
  );
  signBoard.position.set(0, 1.6, 0);
  signpostGroup.add(signPole, signBoard);
  cityPlazaGroup.add(signpostGroup);

  // -------------------------------------------------------------------------
  // ANIMATED STREET VEHICLES & AMBIENT PEDESTRIANS
  // -------------------------------------------------------------------------
  // 1. Classic Yellow & Black Mumbai Taxi (Traveling East on lane z = 11.4)
  const taxiGroup = new THREE.Group();
  taxiGroup.position.set(-6.0, 0, 11.4);
  const taxiBody = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.55, 0.8)), regMat(new THREE.MeshStandardMaterial({ color: 0x111111 })));
  taxiBody.position.y = 0.35;
  const taxiRoof = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.9, 0.45, 0.74)), regMat(new THREE.MeshStandardMaterial({ color: 0xfacc15 })));
  taxiRoof.position.set(-0.1, 0.75, 0);
  taxiGroup.add(taxiBody, taxiRoof);
  cityPlazaGroup.add(taxiGroup);

  // 2. Red BEST Transit Bus (Traveling West on lane z = 9.4)
  const busGroup = new THREE.Group();
  busGroup.position.set(6.0, 0, 9.4);
  const busBody = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.1, 1.1)), regMat(new THREE.MeshStandardMaterial({ color: 0xdc2626 })));
  busBody.position.y = 0.65;
  const busStripe = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.22, 0.16, 1.12)), regMat(new THREE.MeshStandardMaterial({ color: 0xffffff })));
  busStripe.position.y = 0.65;
  busGroup.add(busBody, busStripe);
  cityPlazaGroup.add(busGroup);

  // 3. Green & Yellow Auto-Rickshaw (Traveling East on lane z = 11.4)
  const rickshawGroup = new THREE.Group();
  rickshawGroup.position.set(-14.0, 0, 11.4);
  const rickshawBody = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.2, 0.5, 0.7)), regMat(new THREE.MeshStandardMaterial({ color: 0x15803d })));
  rickshawBody.position.y = 0.32;
  const rickshawCanopy = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.1, 0.45, 0.68)), regMat(new THREE.MeshStandardMaterial({ color: 0xfacc15 })));
  rickshawCanopy.position.set(0, 0.68, 0);
  rickshawGroup.add(rickshawBody, rickshawCanopy);
  cityPlazaGroup.add(rickshawGroup);

  // Ambient Sidewalk Pedestrians
  const pedMatA = regMat(new THREE.MeshStandardMaterial({ color: 0x3b82f6 }));
  const pedMatB = regMat(new THREE.MeshStandardMaterial({ color: 0xec4899 }));
  const pedestrianAGroup = new THREE.Group();
  pedestrianAGroup.position.set(-5.0, 0, 8.0);
  const pedABody = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8)), pedMatA);
  pedABody.position.y = 0.45;
  const pedAHead = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.12, 8, 8)), regMat(new THREE.MeshStandardMaterial({ color: 0xf5d0b0 })));
  pedAHead.position.y = 1.0;
  pedestrianAGroup.add(pedABody, pedAHead);
  cityPlazaGroup.add(pedestrianAGroup);

  const pedestrianBGroup = new THREE.Group();
  pedestrianBGroup.position.set(5.0, 0, 8.0);
  const pedBBody = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8)), pedMatB);
  pedBBody.position.y = 0.45;
  const pedBHead = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.12, 8, 8)), regMat(new THREE.MeshStandardMaterial({ color: 0xf5d0b0 })));
  pedBHead.position.y = 1.0;
  pedestrianBGroup.add(pedBBody, pedBHead);
  cityPlazaGroup.add(pedestrianBGroup);

  // Distant Pastel City Buildings (South at z >= 13.2)
  const pastelColors = [0xfca5a5, 0xfde047, 0x93c5fd, 0xc4b5fd, 0x86efac];
  for (let bx = -13.0; bx <= 13.0; bx += 2.8) {
    const bColor = pastelColors[Math.abs(Math.round(bx * 2)) % pastelColors.length];
    const bHeight = 5.6 + (Math.abs(bx) % 1.5) * 1.0;
    const bGeo = regGeo(new THREE.BoxGeometry(2.6, bHeight, 1.8));
    const bMat = regMat(new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.7 }));
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(bx, bHeight / 2 - 0.15, 13.5);
    cityPlazaGroup.add(building);
  }

  stationGroup.add(cityPlazaGroup);

  // =========================================================================
  // 2. ZONE 1: STATION ENTRANCE GATE & ARCHITECTURAL FACADE (z = 4.4)
  // Preserves commit db44156 approved entrance with interactive turnstiles
  // =========================================================================
  const allWallMeshes: THREE.Mesh[] = [];
  const entranceFacadeGroup = new THREE.Group();
  entranceFacadeGroup.position.set(0, 0, 4.4);

  // Left Sandstone Entrance Tower & Pylon (West: x = -3.8)
  const leftTower = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.2, 4.8, 0.8)), sandstoneMat);
  leftTower.position.set(-3.8, 2.4, 0);
  leftTower.castShadow = true;
  entranceFacadeGroup.add(leftTower);

  // Right Sandstone Entrance Tower & Pylon (East: x = 3.8)
  const rightTower = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.2, 4.8, 0.8)), sandstoneMat);
  rightTower.position.set(3.8, 2.4, 0);
  rightTower.castShadow = true;
  entranceFacadeGroup.add(rightTower);

  // Grand Entrance Overhead Lintel Beam (framed high at y = 4.2 to eliminate view obstruction)
  const entranceLintel = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.6, 0.6, 0.8)), sandstoneMat);
  entranceLintel.position.set(0, 4.2, 0);
  entranceLintel.castShadow = true;
  entranceFacadeGroup.add(entranceLintel);

  // PROMINENT MAIN STATION IDENTITY MARQUEE
  // "FRICTION CENTRAL" · "MUMBAI CENTRAL · DECCAN EXPRESS · PLATFORMS 1 & 2"
  const marqueeTex = createStationMarqueeCanvasTexture();
  const marqueeMat = regMat(
    new THREE.MeshBasicMaterial({
      map: marqueeTex,
    })
  );
  const stationMarquee = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(5.4, 0.95, 0.14)),
    marqueeMat
  );
  stationMarquee.position.set(0, 4.3, 0.44);

  // Polished Brass Frame & Architectural Bracket Supports
  const marqueeFrame = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(5.5, 1.05, 0.08)),
    brassMat
  );
  marqueeFrame.position.set(0, 4.3, 0.38);

  for (const bx of [-2.4, 0, 2.4]) {
    const bracket = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.12, 0.5, 0.4)),
      castIronMat
    );
    bracket.position.set(bx, 3.65, 0.2);
    entranceFacadeGroup.add(bracket);
  }

  entranceFacadeGroup.add(marqueeFrame, stationMarquee);
  allWallMeshes.push(leftTower, rightTower, entranceLintel, stationMarquee);

  // Flank Entrance Pylons with warm globe lanterns (db44156 approved design)
  const lanternGlobeGeo = regGeo(new THREE.SphereGeometry(0.2, 16, 16));
  const lanternGlobeMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xffe2b8,
      emissive: 0xffa040,
      emissiveIntensity: 0.95,
      roughness: 0.2,
    })
  );

  for (const px of [-2.6, 2.6]) {
    const postG = new THREE.Group();
    postG.position.set(px, 0, 0);
    const postPillar = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.35, 3.2, 0.35)), castIronMat);
    postPillar.position.y = 1.6;
    const postLantern = new THREE.Mesh(lanternGlobeGeo, lanternGlobeMat);
    postLantern.position.y = 3.35;
    postG.add(postPillar, postLantern);
    entranceFacadeGroup.add(postG);
  }

  // INTERACTIVE ENTRANCE TURNSTILE GATES
  // Twin motorized swing gates with chevron acrylic barriers and LED status indicators
  const entranceGateGroup = new THREE.Group();
  entranceGateGroup.position.set(0, 0, 0);

  // Gate Turnstile Pedestals flanking passage
  const turnstilePedGeo = regGeo(new THREE.BoxGeometry(0.28, 1.05, 0.5));
  const turnstilePedMat = regMat(new THREE.MeshStandardMaterial({ color: 0x241b34, roughness: 0.3, metalness: 0.3 }));

  const leftPed = new THREE.Mesh(turnstilePedGeo, turnstilePedMat);
  leftPed.position.set(-1.15, 0.525, 0);
  const rightPed = new THREE.Mesh(turnstilePedGeo, turnstilePedMat);
  rightPed.position.set(1.15, 0.525, 0);
  entranceGateGroup.add(leftPed, rightPed);

  // Left Motorized Swing Barrier
  const gateWingLeft = new THREE.Group();
  gateWingLeft.position.set(-1.0, 0.55, 0);
  const wingLeftPaddle = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.9, 0.42, 0.04)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.75, roughness: 0.1 }))
  );
  wingLeftPaddle.position.set(0.45, 0, 0);
  const wingLeftTrim = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.92, 0.05, 0.05)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }))
  );
  wingLeftTrim.position.set(0.45, 0.21, 0);
  gateWingLeft.add(wingLeftPaddle, wingLeftTrim);

  // Right Motorized Swing Barrier
  const gateWingRight = new THREE.Group();
  gateWingRight.position.set(1.0, 0.55, 0);
  const wingRightPaddle = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.9, 0.42, 0.04)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.75, roughness: 0.1 }))
  );
  wingRightPaddle.position.set(-0.45, 0, 0);
  const wingRightTrim = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.92, 0.05, 0.05)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.2 }))
  );
  wingRightTrim.position.set(-0.45, 0.21, 0);
  gateWingRight.add(wingRightPaddle, wingRightTrim);

  // Gate Status LED Indicators atop pedestals
  const gateLedGeo = regGeo(new THREE.SphereGeometry(0.06, 12, 12));
  const gateLedMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff8800,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    })
  );
  const leftLed = new THREE.Mesh(gateLedGeo, gateLedMat);
  leftLed.position.set(-1.15, 1.1, 0);
  const rightLed = new THREE.Mesh(gateLedGeo, gateLedMat);
  rightLed.position.set(1.15, 1.1, 0);
  entranceGateGroup.add(gateWingLeft, gateWingRight, leftLed, rightLed);

  entranceFacadeGroup.add(entranceGateGroup);
  stationGroup.add(entranceFacadeGroup);

  let isGateOpenState = false;
  let gateOpenAngle = 0;

  const openEntranceGate = () => {
    isGateOpenState = true;
    gateLedMat.color.setHex(0x10b981);
    gateLedMat.emissive.setHex(0x10b981);
    gateLedMat.emissiveIntensity = 1.2;
  };

  const isGateOpen = () => isGateOpenState;

  // =========================================================================
  // 3. ZONE 2: GRAND VICTORIAN ATRIUM & MEZZANINE (z = 1.8 to 4.4, Hub x in [-3.0, 3.0])
  // Restores commit db44156 & 385c55e architecture: seafoam walls, cream sandstone,
  // grand clock tower, mezzanine stairs, crimson runner and two feature benches
  // =========================================================================
  const atriumGroup = new THREE.Group();

  // Central Atrium Floor Slab
  const atriumFloorGeo = regGeo(new THREE.BoxGeometry(6.4, 0.4, 2.8));
  const atriumFloor = new THREE.Mesh(atriumFloorGeo, concourseFloorMat);
  atriumFloor.position.set(0, -0.2, 3.1);
  atriumFloor.receiveShadow = true;
  atriumGroup.add(atriumFloor);

  // Central Dark Terrazzo Runner Strip leading North into Concourse
  const atriumTerrazzo = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.01, 2.8)), darkTerrazzoMat);
  atriumTerrazzo.position.set(0, 0.005, 3.1);
  atriumTerrazzo.receiveShadow = true;
  atriumGroup.add(atriumTerrazzo);

  // -------------------------------------------------------------------------
  // DEEP-CRIMSON CEREMONIAL CARPET RUNNER WITH REFINED GOLD BORDER
  // Leads from entrance gate (z = 4.4) to grand hall/concourse threshold (z = 2.0)
  // Perfectly aligned on the stone floor without floating or clipping
  // -------------------------------------------------------------------------
  const crimsonCarpetGroup = new THREE.Group();
  crimsonCarpetGroup.position.set(0, 0, 3.2);

  // Subtle contact shadow underneath
  const carpetShadow = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.58, 0.002, 2.44)),
    regMat(new THREE.MeshBasicMaterial({ color: 0x140f1a, transparent: true, opacity: 0.35 }))
  );
  carpetShadow.position.y = 0.001;
  crimsonCarpetGroup.add(carpetShadow);

  // Main Deep-Crimson Fabric Runner (1.5m wide x 2.4m long)
  const crimsonCarpetMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x8f152b, // Rich ceremonial crimson
      roughness: 0.65,
      metalness: 0.04,
    })
  );
  const crimsonRunner = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.5, 0.012, 2.4)), crimsonCarpetMat);
  crimsonRunner.position.y = 0.007;
  crimsonRunner.receiveShadow = true;
  crimsonCarpetGroup.add(crimsonRunner);

  // Polished Gold / Brass Trim Borders framing the crimson runner
  const goldBorderMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37, // Polished gold trim
      metalness: 0.85,
      roughness: 0.2,
    })
  );
  // Left border
  const borderLeft = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.06, 0.015, 2.4)), goldBorderMat);
  borderLeft.position.set(-0.72, 0.008, 0);
  // Right border
  const borderRight = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.06, 0.015, 2.4)), goldBorderMat);
  borderRight.position.set(0.72, 0.008, 0);
  // South border (Gate threshold)
  const borderSouth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.5, 0.015, 0.06)), goldBorderMat);
  borderSouth.position.set(0, 0.008, 1.17);
  // North border (Concourse threshold meeting dark terrazzo)
  const borderNorth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.5, 0.015, 0.06)), goldBorderMat);
  borderNorth.position.set(0, 0.008, -1.17);

  // Woven center diamond accent strip in gold
  const centerAccent = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.04, 0.014, 2.3)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.7, roughness: 0.3 }))
  );
  centerAccent.position.set(0, 0.008, 0);

  crimsonCarpetGroup.add(borderLeft, borderRight, borderSouth, borderNorth, centerAccent);
  atriumGroup.add(crimsonCarpetGroup);

  // -------------------------------------------------------------------------
  // EXACTLY TWO FEATURE BENCHES IN THE ENTRANCE AREA
  // Symmetrically placed flanking the crimson runner (West & East at z = 3.3)
  // Teak wood slats, Victorian dark-green metal frames, brass finials,
  // and comfortable muted mint-cream upholstered seat cushions.
  // -------------------------------------------------------------------------
  const darkGreenFrameMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1b4332, roughness: 0.35, metalness: 0.45 }));
  const mintCushionMat = regMat(new THREE.MeshStandardMaterial({ color: 0xd1fae5, roughness: 0.55, metalness: 0.05 }));

  const createPremiumFeatureBench = (xPos: number, yRot: number) => {
    const benchGroup = new THREE.Group();
    benchGroup.position.set(xPos, 0, 3.3);
    benchGroup.rotation.y = yRot;

    // Contact shadow
    const bShadow = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(1.56, 0.002, 0.56)),
      regMat(new THREE.MeshBasicMaterial({ color: 0x110e1a, transparent: true, opacity: 0.3 }))
    );
    bShadow.position.y = 0.001;
    benchGroup.add(bShadow);

    // Teak Slat Base
    const seatBase = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.46, 0.04, 0.46)), teakWoodMat);
    seatBase.position.y = 0.36;
    benchGroup.add(seatBase);

    // Muted Mint-Cream Upholstered Seat Cushion with Tufting
    const cushion = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.42, 0.08, 0.44)), mintCushionMat);
    cushion.position.y = 0.42;
    cushion.castShadow = true;
    benchGroup.add(cushion);

    // 4 Polished Teak Backrest Slats
    for (let si = 0; si < 4; si++) {
      const slat = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.46, 0.055, 0.025)), teakWoodMat);
      slat.position.set(0, 0.58 + si * 0.085, -0.21);
      benchGroup.add(slat);
    }

    // Victorian Dark-Green Cast Iron End Frames & Curved Scroll Armrests
    for (const ex of [-0.68, 0.68]) {
      // Front & Rear Curved Legs
      const legFrame = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.06, 0.44, 0.46)), darkGreenFrameMat);
      legFrame.position.set(ex, 0.22, 0);
      legFrame.castShadow = true;

      // Brass Feet Caps
      const footCap = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.08, 0.06, 0.48)), brassMat);
      footCap.position.set(ex, 0.03, 0);

      // Backrest Support Stanchion
      const backStanchion = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.05, 0.45, 0.05)), darkGreenFrameMat);
      backStanchion.position.set(ex, 0.7, -0.21);

      // Graceful Curved Armrest
      const armrest = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.07, 0.04, 0.48)), darkGreenFrameMat);
      armrest.position.set(ex, 0.54, 0);

      // Brass Finial Knobs on armrest front
      const knob = new THREE.Mesh(regGeo(new THREE.SphereGeometry(0.035, 12, 12)), brassMat);
      knob.position.set(ex, 0.55, 0.23);

      benchGroup.add(legFrame, footCap, backStanchion, armrest, knob);
    }

    return benchGroup;
  };

  // Exactly two feature benches placed symmetrically:
  // Bench 1: West side of entrance foyer, facing East towards crimson runner
  const entranceBenchWest = createPremiumFeatureBench(-1.85, Math.PI / 2);
  // Bench 2: East side of entrance foyer, facing West towards crimson runner
  const entranceBenchEast = createPremiumFeatureBench(1.85, -Math.PI / 2);
  atriumGroup.add(entranceBenchWest, entranceBenchEast);

  // Fluted Sandstone Columns framing the Atrium
  const atriumColumnPositions = [
    { x: -2.8, z: 2.2 },
    { x: 2.8, z: 2.2 },
    { x: -2.8, z: 3.8 },
    { x: 2.8, z: 3.8 },
  ];
  for (const cpos of atriumColumnPositions) {
    const colG = new THREE.Group();
    colG.position.set(cpos.x, 0, cpos.z);
    const plinth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.55, 0.5, 0.55)), sandstoneMat);
    plinth.position.y = 0.25;
    const shaft = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.2, 0.24, 3.8, 16)), sandstoneMat);
    shaft.position.y = 2.15;
    shaft.castShadow = true;
    const cap = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.6, 0.25, 0.6)), sandstoneMat);
    cap.position.y = 4.1;
    // Sconce light
    const sconceArm = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.08, 0.08, 0.2)), castIronMat);
    sconceArm.position.set(0, 2.5, cpos.z > 3.0 ? -0.28 : 0.28);
    const sconceLight = new THREE.Mesh(
      regGeo(new THREE.SphereGeometry(0.12, 12, 12)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xff9922, emissiveIntensity: 0.9 }))
    );
    sconceLight.position.set(0, 2.5, cpos.z > 3.0 ? -0.4 : 0.4);
    colG.add(plinth, shaft, cap, sconceArm, sconceLight);
    atriumGroup.add(colG);
  }

  // Freestanding Vintage Cast-Iron Pedestal Clock Tower (at x: 1.8, z: 2.4)
  const clockTowerGroup = new THREE.Group();
  clockTowerGroup.position.set(1.8, 0, 2.4);
  const ctBase = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.42, 0.5, 0.42)), castIronMat);
  ctBase.position.y = 0.25;
  const ctShaft = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.1, 0.12, 1.6, 12)), castIronMat);
  ctShaft.position.y = 1.3;
  const ctHead = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.3, 0.3, 0.24, 24)), castIronMat);
  ctHead.rotation.x = Math.PI / 2;
  ctHead.position.y = 2.2;
  clockTowerGroup.add(ctBase, ctShaft, ctHead);

  const ctDialMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfffdf5 }));
  const dialSouth = new THREE.Mesh(regGeo(new THREE.CircleGeometry(0.24, 24)), ctDialMat);
  dialSouth.position.set(0, 2.2, 0.125);
  const dialNorth = new THREE.Mesh(regGeo(new THREE.CircleGeometry(0.24, 24)), ctDialMat);
  dialNorth.position.set(0, 2.2, -0.125);
  dialNorth.rotation.y = Math.PI;
  const clockHandMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.02, 0.14, 0.01)), castIronMat);
  clockHandMesh.position.set(0, 2.2, 0.13);
  clockTowerGroup.add(dialSouth, dialNorth, clockHandMesh);
  atriumGroup.add(clockTowerGroup);

  // West Mezzanine Grand Staircase (at x: -2.6, z: 3.0)
  const stairGroup = new THREE.Group();
  stairGroup.position.set(-2.6, 0, 3.0);
  for (let step = 0; step < 7; step++) {
    const stepMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.85, 0.18, 0.28)), sandstoneMat);
    stepMesh.position.set(0, 0.09 + step * 0.18, -step * 0.24);
    stepMesh.receiveShadow = true;
    stairGroup.add(stepMesh);
  }
  const mezzSlab = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.2, 0.2, 1.8)), sandstoneMat);
  mezzSlab.position.set(0, 1.35, -1.8);
  const handrail = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.06, 0.6, 1.8)), brassMat);
  handrail.position.set(0.45, 1.75, -1.8);
  stairGroup.add(mezzSlab, handrail);
  atriumGroup.add(stairGroup);

  // Terracotta Urn Planters with Tropical Palms flanking staircase and clock
  const urnMat = regMat(new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.7 }));
  const palmMat = regMat(new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }));
  for (const px of [-1.8, 1.2]) {
    const urn = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 16)), urnMat);
    urn.position.set(px, 0.22, 3.8);
    const palm = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.42, 0.85, 6)), palmMat);
    palm.position.set(px, 0.75, 3.8);
    atriumGroup.add(urn, palm);
  }

  // Lofty Victorian Glass Skylight Overhead (y = 6.4m)
  const skylightGroup = new THREE.Group();
  skylightGroup.position.set(0, 6.4, 3.0);
  const skylightGlass = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(6.4, 3.2)), glassWindowMat);
  skylightGlass.rotation.x = Math.PI / 2;
  skylightGroup.add(skylightGlass);
  for (const rz of [-1.2, 0, 1.2]) {
    const rib = new THREE.Mesh(regGeo(new THREE.BoxGeometry(6.6, 0.08, 0.08)), castIronMat);
    rib.position.set(0, 0.05, rz);
    skylightGroup.add(rib);
  }
  atriumGroup.add(skylightGroup);

  // Atrium Wayfinding Signs pointing to the rooms
  const wayfindingSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(3.6, 0.35, 0.08)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x17131f, emissive: 0xffd23f, emissiveIntensity: 0.4 }))
  );
  wayfindingSign.position.set(0, 3.6, 1.85);
  atriumGroup.add(wayfindingSign);

  stationGroup.add(atriumGroup);

  // =========================================================================
  // ARCHITECTURAL VISIBLE ROOM ENTRANCE DOORWAYS (ROOMS 1 TO 5)
  // Each room receives an authentic, clearly modeled doorframe with side jambs,
  // top lintel header, brass threshold, readable illuminated room signplate,
  // and smooth proximity-animated sliding frosted glass door leaves.
  // =========================================================================
  interface AnimatedDoor {
    name: string;
    pos: THREE.Vector3;
    leafLeft: THREE.Mesh;
    leafRight: THREE.Mesh;
    openAxis: 'x' | 'z';
    maxSlide: number;
    currentOpen: number;
    initialLeftPos: number;
    initialRightPos: number;
  }
  const animatedDoors: AnimatedDoor[] = [];

  const createRoomDoorway = (
    parentGroup: THREE.Group,
    roomName: string,
    pos: THREE.Vector3,
    axis: 'x' | 'z',
    width: number,
    height: number
  ) => {
    const doorGroup = new THREE.Group();
    doorGroup.position.copy(pos);

    // Left and Right Sandstone Door Jambs
    const jambGeo = regGeo(axis === 'x' ? new THREE.BoxGeometry(0.2, height, 0.24) : new THREE.BoxGeometry(0.24, height, 0.2));
    const jambLeft = new THREE.Mesh(jambGeo, sandstoneMat);
    const jambRight = new THREE.Mesh(jambGeo, sandstoneMat);
    if (axis === 'x') {
      jambLeft.position.set(-width / 2, height / 2, 0);
      jambRight.position.set(width / 2, height / 2, 0);
    } else {
      jambLeft.position.set(0, height / 2, -width / 2);
      jambRight.position.set(0, height / 2, width / 2);
    }
    doorGroup.add(jambLeft, jambRight);
    allWallMeshes.push(jambLeft, jambRight);

    // Sandstone Header Lintel Beam with Classical Molded Trim
    const lintelGeo = regGeo(axis === 'x' ? new THREE.BoxGeometry(width + 0.4, 0.36, 0.28) : new THREE.BoxGeometry(0.28, 0.36, width + 0.4));
    const lintel = new THREE.Mesh(lintelGeo, sandstoneMat);
    lintel.position.y = height + 0.18;
    doorGroup.add(lintel);
    allWallMeshes.push(lintel);

    // Readable Illuminated Room Signplate
    const signGeo = regGeo(axis === 'x' ? new THREE.BoxGeometry(width * 0.88, 0.32, 0.08) : new THREE.BoxGeometry(0.08, 0.32, width * 0.88));
    const signMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x17131f,
        emissive: 0xffd23f,
        emissiveIntensity: 0.65,
        roughness: 0.25,
      })
    );
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.y = height + 0.48;
    doorGroup.add(sign);

    // Polished Brass Door Sill / Threshold Plate
    const sillGeo = regGeo(axis === 'x' ? new THREE.BoxGeometry(width + 0.1, 0.015, 0.32) : new THREE.BoxGeometry(0.32, 0.015, width + 0.1));
    const sill = new THREE.Mesh(sillGeo, brassMat);
    sill.position.y = 0.008;
    doorGroup.add(sill);

    // Sliding Frosted Glass Door Panels with Brass Stile Handles
    const leafWidth = width / 2;
    const leafGeo = regGeo(axis === 'x' ? new THREE.BoxGeometry(leafWidth * 0.98, height * 0.94, 0.04) : new THREE.BoxGeometry(0.04, height * 0.94, leafWidth * 0.98));
    const leafMat = regMat(
      new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.7,
        roughness: 0.15,
        metalness: 0.2,
      })
    );
    const leafLeft = new THREE.Mesh(leafGeo, leafMat);
    const leafRight = new THREE.Mesh(leafGeo, leafMat);

    // Polished Brass Handle Bars
    const handleGeo = regGeo(new THREE.BoxGeometry(0.03, 0.45, 0.06));
    const handleLeft = new THREE.Mesh(handleGeo, brassMat);
    const handleRight = new THREE.Mesh(handleGeo, brassMat);
    handleLeft.position.y = 0;
    handleRight.position.y = 0;
    leafLeft.add(handleLeft);
    leafRight.add(handleRight);

    const initL = -leafWidth / 2;
    const initR = leafWidth / 2;
    if (axis === 'x') {
      leafLeft.position.set(initL, height * 0.47, 0);
      leafRight.position.set(initR, height * 0.47, 0);
    } else {
      leafLeft.position.set(0, height * 0.47, initL);
      leafRight.position.set(0, height * 0.47, initR);
    }

    doorGroup.add(leafLeft, leafRight);
    parentGroup.add(doorGroup);

    animatedDoors.push({
      name: roomName,
      pos: pos.clone(),
      leafLeft,
      leafRight,
      openAxis: axis,
      maxSlide: leafWidth * 0.88,
      currentOpen: 0,
      initialLeftPos: initL,
      initialRightPos: initR,
    });
  };

  // =========================================================================
  // 4. ROOM 1: ORIGINAL TICKET CONCOURSE (Center North: x in [-2.6, 2.6], z in [-1.4, 1.8])
  // PRESERVED BASELINE: Kiosk, royal-blue queue carpet, velvet stanchions, Arjun
  // =========================================================================
  const room1Group = new THREE.Group();

  // Visible Entrance Doorway to Room 1 (Facing South to Atrium at z = 1.8)
  createRoomDoorway(room1Group, 'ROOM 1 · TICKET CONCOURSE', new THREE.Vector3(0, 0, 1.8), 'x', 2.4, 2.5);

  // Room 1 Floor Slab
  const r1Floor = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.6, 0.4, 3.4)), concourseFloorMat);
  r1Floor.position.set(0, -0.2, 0.2);
  r1Floor.receiveShadow = true;
  room1Group.add(r1Floor);

  // Central Polished Walkway Strip
  const r1Terrazzo = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.01, 3.4)), darkTerrazzoMat);
  r1Terrazzo.position.set(0, 0.005, 0.2);
  r1Terrazzo.receiveShadow = true;
  room1Group.add(r1Terrazzo);

  // Royal Blue Carpet Queue Runner (Leading towards Ticket Kiosk)
  const carpetMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.7, metalness: 0.05 }));
  const queueCarpet = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.4, 0.015, 1.8)), carpetMat);
  queueCarpet.position.set(0, 0.012, 1.25);
  queueCarpet.receiveShadow = true;
  room1Group.add(queueCarpet);

  // Brass Stanchion Posts & Crimson Velvet Ropes
  const stanchionPoleGeo = regGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.75, 12));
  const stanchionBaseGeo = regGeo(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 16));
  const stanchionBallGeo = regGeo(new THREE.SphereGeometry(0.045, 12, 12));

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
      room1Group.add(sGroup);
    }
    const rope = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.03, 0.03, 1.4)), velvetRopeMat);
    rope.position.set(sx, 0.62, 1.3);
    room1Group.add(rope);
  }

  // Central Ticket Kiosk Terminal (at x = 0, z = 0.2)
  const kioskGroup = new THREE.Group();
  kioskGroup.position.set(0, 0, 0.2);
  const kioskBody = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.1, 1.85, 0.7)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x1f192c, roughness: 0.35, metalness: 0.2 }))
  );
  kioskBody.position.y = 0.925;
  kioskBody.castShadow = true;
  kioskGroup.add(kioskBody);

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

  const kioskBannerMat = regMat(
    new THREE.MeshStandardMaterial({ color: 0xff8a1f, emissive: 0xff8a1f, emissiveIntensity: 0.6, roughness: 0.3 })
  );
  const kioskBannerMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.0, 0.24, 0.08)), kioskBannerMat);
  kioskBannerMesh.position.set(0, 1.72, 0.36);
  kioskGroup.add(kioskBannerMesh);
  room1Group.add(kioskGroup);

  // Turnstile Exit Portal North (z = -1.4) leading to Platform 1
  for (const tx of [-1.0, 0.0, 1.0]) {
    const turnstile = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.18, 0.9, 0.5)), castIronMat);
    turnstile.position.set(tx, 0.45, -1.4);
    room1Group.add(turnstile);
  }

  stationGroup.add(room1Group);

  // =========================================================================
  // 5. ROOM 2: DEPARTURE GALLERY (Northeast Room: x in [3.0, 8.4], z in [-1.4, 1.8])
  // Separate physical room with midnight-blue tiled floor, perimeter walls, huge Solari board
  // =========================================================================
  const room2Group = new THREE.Group();

  // Room 2 Floor Slab (Midnight Blue & Cream geometric tiles)
  const r2Floor = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 0.4, 3.4)), departureFloorMat);
  r2Floor.position.set(5.7, -0.2, 0.2);
  r2Floor.receiveShadow = true;
  room2Group.add(r2Floor);

  // East Perimeter Wall (x = 8.4)
  const r2EastWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 3.4)), seafoamWallMat);
  r2EastWall.position.set(8.4, 2.2, 0.2);
  room2Group.add(r2EastWall);

  // North Wall (z = -1.4) holding the monumental Solari board
  // Left wall segment
  const r2NorthWallLeft = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.6, 4.4, 0.24)), seafoamWallMat);
  r2NorthWallLeft.position.set(4.8, 2.2, -1.4);
  room2Group.add(r2NorthWallLeft);
  // Open East ramp doorway to Platform 1 at x in [6.6, 8.4]!

  // Dividing Wall West (x = 3.0) between Room 1 & Room 2 with open archway (z in [-0.3, 0.7])
  const r2WestWallNorth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 1.1)), sandstoneMat);
  r2WestWallNorth.position.set(3.0, 2.2, -0.85);
  const r2WestWallSouth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 1.1)), sandstoneMat);
  r2WestWallSouth.position.set(3.0, 2.2, 1.25);
  const r2WestArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.6, 1.4)), sandstoneMat);
  r2WestArchBeam.position.set(3.0, 3.8, 0.2);
  room2Group.add(r2WestWallNorth, r2WestWallSouth, r2WestArchBeam);

  // Visible Entrance Doorway to Room 2 from Room 1 (at x = 3.0, z = 0.2)
  createRoomDoorway(room2Group, 'ROOM 2 · DEPARTURE GALLERY', new THREE.Vector3(3.0, 0, 0.2), 'z', 1.4, 2.4);

  // Dividing Wall South (z = 1.8) between Room 2 & Room 5 with open doorway (x in [5.0, 6.4])
  const r2SouthWallWest = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r2SouthWallWest.position.set(4.0, 2.2, 1.8);
  const r2SouthWallEast = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r2SouthWallEast.position.set(7.4, 2.2, 1.8);
  const r2SouthArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.6, 0.3)), sandstoneMat);
  r2SouthArchBeam.position.set(5.7, 3.8, 1.8);
  room2Group.add(r2SouthWallWest, r2SouthWallEast, r2SouthArchBeam);
  allWallMeshes.push(r2EastWall, r2NorthWallLeft, r2WestWallNorth, r2WestWallSouth, r2WestArchBeam, r2SouthWallWest, r2SouthWallEast, r2SouthArchBeam);

  // Monumental Solari Departures Board (mounted at x = 5.4, z = -1.25)
  const departureBoardLedMat = regMat(
    new THREE.MeshStandardMaterial({
      map: createBoardCanvasTexture(clarityRepairs.includes('errors')),
      emissive: 0xffffff,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    })
  );
  const departureBoardLed = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(3.6, 1.8)), departureBoardLedMat);
  departureBoardLed.position.set(5.4, 2.6, -1.25);
  room2Group.add(departureBoardLed);

  const boardFrame = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.8, 2.0, 0.16)), castIronMat);
  boardFrame.position.set(5.4, 2.6, -1.33);
  room2Group.add(boardFrame);

  // Waiting benches along East wall
  for (const bz of [-0.4, 0.8]) {
    const r2Bench = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.5, 0.42, 1.4)), teakBenchMat);
    r2Bench.position.set(7.9, 0.21, bz);
    room2Group.add(r2Bench);
  }

  // Directional Overhead Sign: "TRACK 1A / DECCAN EXPRESS ➔"
  const trackSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(2.2, 0.35, 0.08)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xff8a1f, emissiveIntensity: 0.3 }))
  );
  trackSign.position.set(7.2, 3.2, -1.2);
  room2Group.add(trackSign);

  stationGroup.add(room2Group);

  // =========================================================================
  // 6. ROOM 3: PASSENGER SERVICES & HELP DESK WING (Northwest Room: x in [-8.4, -3.0], z in [-1.4, 1.8])
  // Separate physical room with terracotta floor, customer help desk counter, service monitors
  // =========================================================================
  const room3Group = new THREE.Group();

  // Room 3 Floor Slab
  const r3Floor = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 0.4, 3.4)), helpDeskFloorMat);
  r3Floor.position.set(-5.7, -0.2, 0.2);
  r3Floor.receiveShadow = true;
  room3Group.add(r3Floor);

  // West Perimeter Wall (x = -8.4)
  const r3WestWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 3.4)), seafoamWallMat);
  r3WestWall.position.set(-8.4, 2.2, 0.2);
  room3Group.add(r3WestWall);

  // North Wall (z = -1.4) with open ramp doorway to Platform 1 West at x in [-8.4, -6.6]
  const r3NorthWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.6, 4.4, 0.24)), seafoamWallMat);
  r3NorthWall.position.set(-4.8, 2.2, -1.4);
  room3Group.add(r3NorthWall);

  // Dividing Wall East (x = -3.0) between Room 1 & Room 3 with open archway (z in [-0.3, 0.7])
  const r3EastWallNorth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 1.1)), sandstoneMat);
  r3EastWallNorth.position.set(-3.0, 2.2, -0.85);
  const r3EastWallSouth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 1.1)), sandstoneMat);
  r3EastWallSouth.position.set(-3.0, 2.2, 1.25);
  const r3EastArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.6, 1.4)), sandstoneMat);
  r3EastArchBeam.position.set(-3.0, 3.8, 0.2);
  room3Group.add(r3EastWallNorth, r3EastWallSouth, r3EastArchBeam);

  // Visible Entrance Doorway to Room 3 from Room 1 (at x = -3.0, z = 0.2)
  createRoomDoorway(room3Group, 'ROOM 3 · PASSENGER SERVICES', new THREE.Vector3(-3.0, 0, 0.2), 'z', 1.4, 2.4);

  // Dividing Wall South (z = 1.8) between Room 3 & Room 4 with open doorway (x in [-6.4, -5.0])
  const r3SouthWallWest = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r3SouthWallWest.position.set(-7.4, 2.2, 1.8);
  const r3SouthWallEast = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r3SouthWallEast.position.set(-4.0, 2.2, 1.8);
  const r3SouthArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.6, 0.3)), sandstoneMat);
  r3SouthArchBeam.position.set(-5.7, 3.8, 1.8);
  room3Group.add(r3SouthWallWest, r3SouthWallEast, r3SouthArchBeam);
  allWallMeshes.push(r3WestWall, r3NorthWall, r3EastWallNorth, r3EastWallSouth, r3EastArchBeam, r3SouthWallWest, r3SouthWallEast, r3SouthArchBeam);

  // Curved Customer Service Counter Desk (at x = -5.6, z = 0.2)
  const helpDeskGroup = new THREE.Group();
  helpDeskGroup.position.set(-5.6, 0, 0.2);
  const counterMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.95, 0.9)), sandstoneMat);
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

  // Overhead Sign: "PASSENGER SERVICES & HELP DESK"
  const deskSignMat = regMat(
    new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x3b82f6, emissiveIntensity: 0.4 })
  );
  const deskSignMesh = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.35, 0.1)), deskSignMat);
  deskSignMesh.position.set(0, 2.4, 0);
  helpDeskGroup.add(deskSignMesh);
  room3Group.add(helpDeskGroup);

  // Customer Consultation Seats & Queue Barriers
  for (const cx of [-7.2, -4.0]) {
    const chair = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.5, 0.45, 0.5)), teakBenchMat);
    chair.position.set(cx, 0.22, 1.0);
    room3Group.add(chair);
  }

  stationGroup.add(room3Group);

  // =========================================================================
  // 7. ROOM 4: WAITING LOUNGE & TRANSIT ARCADE (Southwest Room: x in [-8.4, -3.0], z in [1.8, 5.0])
  // Separate physical room: teak parquet, chai snack counter, benches, plants, commuter Rohan
  // =========================================================================
  const room4Group = new THREE.Group();

  // Room 4 Floor Slab (Teak Parquet Wood)
  const r4Floor = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 0.4, 3.2)), loungeFloorMat);
  r4Floor.position.set(-5.7, -0.2, 3.4);
  r4Floor.receiveShadow = true;
  room4Group.add(r4Floor);

  // West Wall (x = -8.4) with Arched Daylight Windows
  const r4WestWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 3.2)), seafoamWallMat);
  r4WestWall.position.set(-8.4, 2.2, 3.4);
  room4Group.add(r4WestWall);
  for (const wz of [2.6, 4.2]) {
    const archedWin = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 1.8, 0.9)), glassWindowMat);
    archedWin.position.set(-8.35, 2.4, wz);
    room4Group.add(archedWin);
  }

  // South Wall (z = 5.0)
  const r4SouthWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 4.4, 0.24)), seafoamWallMat);
  r4SouthWall.position.set(-5.7, 2.2, 5.0);
  room4Group.add(r4SouthWall);

  // Dividing Wall East (x = -3.0) with open archway into Atrium (z in [2.6, 3.8])
  const r4EastWallNorth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 0.8)), sandstoneMat);
  r4EastWallNorth.position.set(-3.0, 2.2, 2.2);
  const r4EastWallSouth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 0.8)), sandstoneMat);
  r4EastWallSouth.position.set(-3.0, 2.2, 4.6);
  const r4EastArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.6, 1.8)), sandstoneMat);
  r4EastArchBeam.position.set(-3.0, 3.8, 3.2);
  room4Group.add(r4EastWallNorth, r4EastWallSouth, r4EastArchBeam);

  // Visible Entrance Doorway to Room 4 from Atrium (at x = -3.0, z = 3.2)
  createRoomDoorway(room4Group, 'ROOM 4 · WAITING LOUNGE', new THREE.Vector3(-3.0, 0, 3.2), 'z', 1.6, 2.4);
  allWallMeshes.push(r4WestWall, r4SouthWall, r4EastWallNorth, r4EastWallSouth, r4EastArchBeam);

  // Refreshment Snack Counter / Chai Kiosk ("MUMBAI CHAI & SNACKS")
  const snackBar = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.2, 1.0, 0.7)), sandstoneMat);
  snackBar.position.set(-5.6, 0.5, 4.4);
  const snackSign = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(2.0, 0.26, 0.08)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x854d0e, emissive: 0xffd23f, emissiveIntensity: 0.3 }))
  );
  snackSign.position.set(-5.6, 1.35, 4.4);
  room4Group.add(snackBar, snackSign);

  // Teak Wood Waiting Benches & Coffee Tables
  for (const bz of [2.6, 3.6]) {
    const lBench = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.42, 0.45)), teakBenchMat);
    lBench.position.set(-5.6, 0.21, bz);
    room4Group.add(lBench);
  }

  // Coffee Table with Timetables (tok-lounge sits here)
  const coffeeTable = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.8, 0.35, 0.6)), brassMat);
  coffeeTable.position.set(-7.0, 0.175, 3.4);
  room4Group.add(coffeeTable);

  // Large Potted Banana Palms in Terracotta Urns
  for (const px of [-7.6, -3.8]) {
    const urn = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.26, 0.2, 0.5, 16)), urnMat);
    urn.position.set(px, 0.25, 2.4);
    const palm = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.45, 0.9, 6)), palmMat);
    palm.position.set(px, 0.85, 2.4);
    room4Group.add(urn, palm);
  }

  stationGroup.add(room4Group);

  // =========================================================================
  // 8. ROOM 5: DESIGNER WORKSHOP & CLARITY LAB (Southeast Room: x in [3.0, 8.4], z in [1.8, 5.0])
  // Separate physical room: dark violet floor, neon signs, workbench, 3 repair pedestals
  // =========================================================================
  const room5Group = new THREE.Group();

  // Room 5 Floor Slab (Violet High-Gloss Terrazzo)
  const r5Floor = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 0.4, 3.2)), labFloorMat);
  r5Floor.position.set(5.7, -0.2, 3.4);
  r5Floor.receiveShadow = true;
  room5Group.add(r5Floor);

  // East Wall (x = 8.4) with Neon Accent Panels
  const r5EastWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 3.2)), seafoamWallMat);
  r5EastWall.position.set(8.4, 2.2, 3.4);
  room5Group.add(r5EastWall);

  // South Wall (z = 5.0)
  const r5SouthWall = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.4, 4.4, 0.24)), seafoamWallMat);
  r5SouthWall.position.set(5.7, 2.2, 5.0);
  room5Group.add(r5SouthWall);

  // Dividing Wall West (x = 3.0) with open archway into Atrium (z in [2.6, 3.8])
  const r5WestWallNorth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 0.8)), sandstoneMat);
  r5WestWallNorth.position.set(3.0, 2.2, 2.2);
  const r5WestWallSouth = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 4.4, 0.8)), sandstoneMat);
  r5WestWallSouth.position.set(3.0, 2.2, 4.6);
  const r5WestArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.3, 0.6, 1.8)), sandstoneMat);
  r5WestArchBeam.position.set(3.0, 3.8, 3.2);
  room5Group.add(r5WestWallNorth, r5WestWallSouth, r5WestArchBeam);

  // Visible Entrance Doorway to Room 5 from Atrium (at x = 3.0, z = 3.2)
  createRoomDoorway(room5Group, 'ROOM 5 · DESIGNER WORKSHOP', new THREE.Vector3(3.0, 0, 3.2), 'z', 1.6, 2.4);
  allWallMeshes.push(r5EastWall, r5SouthWall, r5WestWallNorth, r5WestWallSouth, r5WestArchBeam);

  // Luminous Neon Sign: "CLARITY DESIGN LAB"
  const labSignMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0xa78bfa,
      emissiveIntensity: 0.7,
      roughness: 0.2,
    })
  );
  const labSign = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.6, 0.42, 0.1)), labSignMat);
  labSign.position.set(5.7, 3.2, 4.8);
  room5Group.add(labSign);

  // Interactive Workbench Table (at x = 5.7, z = 3.4)
  const benchTable = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 0.9, 1.0)), darkTerrazzoMat);
  benchTable.position.set(5.7, 0.45, 3.4);
  const benchTop = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.5, 0.08, 1.1)), brassMat);
  benchTop.position.set(5.7, 0.94, 3.4);
  room5Group.add(benchTable, benchTop);

  // 3 Dedicated Interactive Repair Pedestals (Labels, Errors, Actions)
  const pedColors = [0xffd23f, 0xff3b30, 0x8ddcff];
  for (let pi = 0; pi < 3; pi++) {
    const px = 4.6 + pi * 1.1;
    const pedMat = regMat(new THREE.MeshStandardMaterial({ color: pedColors[pi], roughness: 0.3 }));
    const ped = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 16)), pedMat);
    ped.position.set(px, 0.425, 4.4);
    const pedTop = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.35, 0.04, 0.35)),
      regMat(new THREE.MeshStandardMaterial({ color: pedColors[pi], emissive: pedColors[pi], emissiveIntensity: 0.5 }))
    );
    pedTop.position.set(px, 0.87, 4.4);
    room5Group.add(ped, pedTop);
  }

  stationGroup.add(room5Group);

  // =========================================================================
  // 9. GRAND PLATFORMS & DOUBLE TRACKS (PLATFORM 1 & OPPOSITE PLATFORM 2)
  // Complete architectural dual-platform layout with parallel tracks,
  // overhead footbridge, west pedestrian crossing, and Platform 2 canopy.
  // =========================================================================
  const platformGroup = new THREE.Group();

  // --- PLATFORM 1 (South Platform: z = -2.6) ---
  const plat1Geo = regGeo(new THREE.BoxGeometry(18.0, 0.4, 2.2));
  const plat1Mat = regMat(new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.5 }));
  const platform1 = new THREE.Mesh(plat1Geo, plat1Mat);
  platform1.position.set(0, -0.2, -2.6);
  platform1.receiveShadow = true;
  platformGroup.add(platform1);

  // Tactile Yellow Safety Edge along Platform 1 (z = -3.2)
  const safetyEdge1 = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(18.0, 0.02, 0.18)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 }))
  );
  safetyEdge1.position.set(0, 0.01, -3.2);
  platformGroup.add(safetyEdge1);

  // Platform 1 Direction Signs and Gantry Poles
  for (const px of [-6.0, 0, 6.0]) {
    const pGantry = new THREE.Group();
    pGantry.position.set(px, 0, -2.8);
    const pole = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.06, 0.06, 3.2, 12)), castIronMat);
    pole.position.y = 1.6;
    const sign = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(1.8, 0.35, 0.08)),
      regMat(new THREE.MeshStandardMaterial({ color: 0x17131f, emissive: 0xffd23f, emissiveIntensity: 0.4 }))
    );
    sign.position.set(0, 3.1, 0);
    pGantry.add(pole, sign);
    platformGroup.add(pGantry);
  }

  // --- DOUBLE TRACKS BED (Track 1 at z = -4.6, Track 2 at z = -5.8) ---
  const ballast = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(20.0, 0.25, 3.4)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x14101e, roughness: 0.9 }))
  );
  ballast.position.set(0, -0.22, -5.2);
  platformGroup.add(ballast);

  // Wooden Sleepers along double tracks
  for (let sx = -9.5; sx <= 9.5; sx += 0.5) {
    const sleeper1 = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.22, 0.08, 1.4)),
      regMat(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 }))
    );
    sleeper1.position.set(sx, -0.06, -4.6);
    const sleeper2 = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.22, 0.08, 1.4)),
      regMat(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 }))
    );
    sleeper2.position.set(sx, -0.06, -5.8);
    platformGroup.add(sleeper1, sleeper2);
  }

  // Polished Steel Rails for Track 1 & Track 2
  for (const rz of [-4.3, -4.9, -5.5, -6.1]) {
    const rail = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(20.0, 0.08, 0.08)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 }))
    );
    rail.position.set(0, -0.02, rz);
    platformGroup.add(rail);
  }

  // --- PLATFORM 2 (Opposite North Platform: z = -7.4) ---
  const plat2Geo = regGeo(new THREE.BoxGeometry(18.0, 0.4, 2.2));
  const plat2Mat = regMat(new THREE.MeshStandardMaterial({ color: 0xd9d1c1, roughness: 0.48 }));
  const platform2 = new THREE.Mesh(plat2Geo, plat2Mat);
  platform2.position.set(0, -0.2, -7.4);
  platform2.receiveShadow = true;
  platformGroup.add(platform2);

  // Tactile Yellow Safety Edge along Platform 2 (z = -6.4)
  const safetyEdge2 = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(18.0, 0.02, 0.18)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 }))
  );
  safetyEdge2.position.set(0, 0.01, -6.4);
  platformGroup.add(safetyEdge2);

  // Platform 2 Back Victorian Cast-Iron Railing Wall (at z = -8.5)
  const p2BackRailing = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(18.0, 1.1, 0.08)),
    castIronMat
  );
  p2BackRailing.position.set(0, 0.55, -8.5);
  platformGroup.add(p2BackRailing);

  // Platform 2 Canopy Roof & Cast-Iron Fluted Columns
  const platform2CanopyRoof = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(18.4, 0.22, 2.6)),
    sandstoneMat
  );
  platform2CanopyRoof.position.set(0, 3.4, -7.4);
  platformGroup.add(platform2CanopyRoof);

  for (const cx of [-6.0, -2.0, 2.0, 6.0]) {
    const pColG = new THREE.Group();
    pColG.position.set(cx, 0, -7.4);
    const pShaft = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 12)), castIronMat);
    pShaft.position.y = 1.6;
    const pLantern = new THREE.Mesh(
      regGeo(new THREE.SphereGeometry(0.14, 12, 12)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xfff0c2, emissive: 0xffaa33, emissiveIntensity: 0.85 }))
    );
    pLantern.position.y = 2.9;
    pColG.add(pShaft, pLantern);
    platformGroup.add(pColG);
  }

  // Overhead Platform 2 Wayfinding Gantry Sign: "PLATFORM 2 · FAST CORRIDOR"
  const p2SignGantry = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(3.6, 0.45, 0.12)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x17131f, emissive: 0xff8a1f, emissiveIntensity: 0.55 }))
  );
  p2SignGantry.position.set(0, 3.8, -7.4);
  platformGroup.add(p2SignGantry);

  // Platform 2 Solari Departures Board (Mounted at x = -1.8, z = -8.3)
  const departureBoardLed2Mat = regMat(
    new THREE.MeshStandardMaterial({
      map: createPlatform2BoardCanvasTexture(),
      emissive: 0xffffff,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    })
  );
  const departureBoardLed2 = new THREE.Mesh(regGeo(new THREE.PlaneGeometry(3.4, 1.7)), departureBoardLed2Mat);
  departureBoardLed2.position.set(-1.8, 2.2, -8.3);
  platformGroup.add(departureBoardLed2);

  const boardFrame2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.6, 1.9, 0.14)), castIronMat);
  boardFrame2.position.set(-1.8, 2.2, -8.38);
  platformGroup.add(boardFrame2);

  // Platform 2 Teak Waiting Benches
  for (const bx of [-4.2, 3.8]) {
    const p2Bench = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.42, 0.5)), teakBenchMat);
    p2Bench.position.set(bx, 0.21, -8.0);
    platformGroup.add(p2Bench);
  }

  // Waiting Passengers on Platform 2
  const p2Passenger1 = new THREE.Mesh(
    regGeo(new THREE.CylinderGeometry(0.2, 0.22, 1.2, 12)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x3b82f6 }))
  );
  p2Passenger1.position.set(-2.8, 0.6, -7.2);
  const p2Luggage1 = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(0.35, 0.45, 0.25)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x78350f }))
  );
  p2Luggage1.position.set(-2.4, 0.22, -7.2);
  platformGroup.add(p2Passenger1, p2Luggage1);

  // --- PEDESTRIAN CONNECTIONS BETWEEN PLATFORM 1 & PLATFORM 2 ---
  // 1. West Level Crossing (x in [-7.2, -5.2], z in [-3.2, -6.4])
  const crossingSlab = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(2.0, 0.08, 3.2)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 }))
  );
  crossingSlab.position.set(-6.2, 0.0, -4.8);
  platformGroup.add(crossingSlab);

  // Crossing Warning Yellow Border Stripes
  for (const cx of [-7.15, -5.25]) {
    const stripe = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.12, 0.02, 3.2)),
      regMat(new THREE.MeshBasicMaterial({ color: 0xffd23f }))
    );
    stripe.position.set(cx, 0.045, -4.8);
    platformGroup.add(stripe);
  }

  // Crossing Warning Crossbuck Posts with Flashing Amber Lights
  for (const cz of [-3.1, -6.5]) {
    const xPost = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8)), castIronMat);
    xPost.position.set(-7.4, 1.1, cz);
    const xBeacon = new THREE.Mesh(
      regGeo(new THREE.SphereGeometry(0.09, 12, 12)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xffaa00, emissiveIntensity: 1.0 }))
    );
    xBeacon.position.set(-7.4, 2.25, cz);
    platformGroup.add(xPost, xBeacon);
  }

  // 2. East Covered Overhead Footbridge (x in [5.4, 7.0], spanning z = -3.2 to -6.4)
  const bridgeDeck = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.6, 0.2, 3.4)),
    sandstoneMat
  );
  bridgeDeck.position.set(6.2, 1.8, -4.8);
  bridgeDeck.receiveShadow = true;
  platformGroup.add(bridgeDeck);

  // Footbridge Covered Arched Roof
  const bridgeRoof = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.8, 0.15, 3.6)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x428e82, roughness: 0.4 }))
  );
  bridgeRoof.position.set(6.2, 3.5, -4.8);
  platformGroup.add(bridgeRoof);

  // Footbridge Brass Railings
  for (const bx of [5.45, 6.95]) {
    const bRail = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.06, 0.8, 3.4)), brassMat);
    bRail.position.set(bx, 2.3, -4.8);
    platformGroup.add(bRail);
  }

  // Footbridge Steps from Platform 1 (z = -3.2)
  for (let s = 0; s < 6; s++) {
    const stepMesh1 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.18, 0.28)), sandstoneMat);
    stepMesh1.position.set(6.2, 0.09 + s * 0.18, -3.2 - s * 0.24);
    platformGroup.add(stepMesh1);
  }
  // Footbridge Steps to Platform 2 (z = -6.4)
  for (let s = 0; s < 6; s++) {
    const stepMesh2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.18, 0.28)), sandstoneMat);
    stepMesh2.position.set(6.2, 0.09 + s * 0.18, -6.4 + s * 0.24);
    platformGroup.add(stepMesh2);
  }

  stationGroup.add(platformGroup);

  // =========================================================================
  // 10. LIVING RAILWAY: SIMULATED DUAL TRAINS & TOKEN COLLECTIBLES
  // =========================================================================
  const trainSystem = createTrainSystem({
    scene,
    cycleInterval: 16,
    onPhaseChange: (phase, service, platform) => {
      onTrainPhaseChange?.(phase, service);
    },
  });

  const tokenCollectibles = createTokenCollectibles(scene);

  const occluderMeshes: THREE.Mesh[] = [
    leftTower,
    rightTower,
    entranceLintel,
    stationMarquee,
    r4SouthWall,
    r5SouthWall,
  ];

  const setCutawayMode = (enabled: boolean) => {
    skylightGroup.visible = !enabled;
    platform2CanopyRoof.visible = !enabled;
    const targetOpacity = enabled ? 0.22 : 1.0;
    occluderMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.transparent = enabled;
        mat.opacity = targetOpacity;
        mat.depthWrite = !enabled;
        mat.needsUpdate = true;
      }
    });
  };

  const setXRayMode = (enabled: boolean) => {
    skylightGroup.visible = !enabled;
    platform2CanopyRoof.visible = !enabled;
    allWallMeshes.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        if (enabled) {
          mat.transparent = true;
          mat.opacity = 0.0;
          mat.depthWrite = false;
        } else {
          mat.transparent = false;
          mat.opacity = 1.0;
          mat.depthWrite = true;
        }
        mat.needsUpdate = true;
      }
    });
  };

  const getOccluderMeshes = () => occluderMeshes;

  // Animation Update Loop
  const update = (playerPos: THREE.Vector3, time: number, delta: number) => {
    // Animate motorized entrance gate turnstiles
    const targetGateAngle = isGateOpenState ? Math.PI / 2 : 0;
    gateOpenAngle = THREE.MathUtils.lerp(gateOpenAngle, targetGateAngle, delta * 6.0);
    gateWingLeft.rotation.y = gateOpenAngle;
    gateWingRight.rotation.y = -gateOpenAngle;

    // Animate clock minute hand
    clockHandMesh.rotation.z = -time * 0.15;

    // Pulse interactive screens
    kioskScreenMat.emissiveIntensity = 0.5 + Math.sin(time * 3.0) * 0.12;
    departureBoardLedMat.emissiveIntensity = 0.6 + Math.sin(time * 2.5) * 0.1;
    departureBoardLed2Mat.emissiveIntensity = 0.6 + Math.sin(time * 2.8) * 0.1;

    // Move City Street Vehicles
    taxiGroup.position.x += delta * 3.2;
    if (taxiGroup.position.x > 14.0) taxiGroup.position.x = -14.0;

    busGroup.position.x -= delta * 2.4;
    if (busGroup.position.x < -14.0) busGroup.position.x = 14.0;

    rickshawGroup.position.x += delta * 2.7;
    if (rickshawGroup.position.x > 14.0) rickshawGroup.position.x = -14.0;

    // Ambient Pedestrians
    pedestrianAGroup.position.x += delta * 0.5;
    if (pedestrianAGroup.position.x > -3.6) pedestrianAGroup.position.x = -6.6;

    pedestrianBGroup.position.x -= delta * 0.45;
    if (pedestrianBGroup.position.x < 3.6) pedestrianBGroup.position.x = 6.6;

    // Gently wave streetlamp banners
    for (let bi = 0; bi < plazaBanners.length; bi++) {
      plazaBanners[bi].rotation.y = Math.sin(time * 2.2 + bi * 1.5) * 0.1;
    }

    // Animate 5 Architectural Room Doors based on player proximity
    let nearbyDoorName: string | null = null;
    for (const door of animatedDoors) {
      const dist = playerPos.distanceTo(door.pos);
      const isNear = dist < 2.0;
      const target = isNear ? 1.0 : 0.0;
      door.currentOpen = THREE.MathUtils.lerp(door.currentOpen, target, delta * 6.0);

      if (door.openAxis === 'x') {
        door.leafLeft.position.x = door.initialLeftPos - door.maxSlide * door.currentOpen;
        door.leafRight.position.x = door.initialRightPos + door.maxSlide * door.currentOpen;
      } else {
        door.leafLeft.position.z = door.initialLeftPos - door.maxSlide * door.currentOpen;
        door.leafRight.position.z = door.initialRightPos + door.maxSlide * door.currentOpen;
      }

      if (isNear && !nearbyDoorName) {
        nearbyDoorName = door.name;
      }
    }

    // Tick Train System & Token Collectibles
    trainSystem.update(delta);
    const { collectedId } = tokenCollectibles.update(playerPos, time, delta);

    return { collectedTokenId: collectedId, nearbyDoorName };
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
    departureBoardLed2,
    kioskScreenMesh,
    kioskBannerMesh,
    deskSignMesh,
    deskMonitorMesh,
    clockHandMesh,
    entranceGateGroup,
    isGateOpen,
    openEntranceGate,
    setCutawayMode,
    setXRayMode,
    getOccluderMeshes,
    update,
    triggerTrainDeparture,
    triggerTrainBoarding,
    dispose,
  };
}
