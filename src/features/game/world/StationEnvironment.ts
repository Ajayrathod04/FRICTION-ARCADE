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

  // Distinct Floor Materials for all 5 Rooms
  const departureFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 })); // Midnight-blue & cream
  const helpDeskFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0xc2785c, roughness: 0.45 })); // Terracotta & sandstone
  const loungeFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 })); // Teak parquet wood
  const labFloorMat = regMat(new THREE.MeshStandardMaterial({ color: 0x2e1065, roughness: 0.25 })); // Deep violet high-gloss terrazzo

  // =========================================================================
  // 1. ZONE 0: CITY STREET & ARRIVAL PLAZA (z = 4.4 to 11.5)
  // Character starts outside on the sidewalk, facing north toward the station
  // =========================================================================
  const cityPlazaGroup = new THREE.Group();

  // Asphalt Roadway (z = 9.2 to 11.2, running East-West)
  const roadGeo = regGeo(new THREE.BoxGeometry(24.0, 0.2, 2.4));
  const roadMesh = new THREE.Mesh(roadGeo, asphaltRoadMat);
  roadMesh.position.set(0, -0.22, 10.0);
  roadMesh.receiveShadow = true;
  cityPlazaGroup.add(roadMesh);

  // Road Lane Dividers (Dashed yellow centerlines)
  for (let rx = -10.0; rx <= 10.0; rx += 2.2) {
    const laneGeo = regGeo(new THREE.BoxGeometry(1.1, 0.01, 0.12));
    const laneMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffd23f }));
    const lane = new THREE.Mesh(laneGeo, laneMat);
    lane.position.set(rx, -0.11, 10.0);
    cityPlazaGroup.add(lane);
  }

  // Pedestrian Zebra Crossing leading to station entrance (x: -1.8 to 1.8)
  for (let zx = -1.6; zx <= 1.6; zx += 0.55) {
    const zebraGeo = regGeo(new THREE.BoxGeometry(0.35, 0.015, 2.0));
    const zebraMat = regMat(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const zebra = new THREE.Mesh(zebraGeo, zebraMat);
    zebra.position.set(zx, -0.105, 10.0);
    cityPlazaGroup.add(zebra);
  }

  // Sidewalk Curb Stone separating road from plaza
  const curbGeo = regGeo(new THREE.BoxGeometry(24.0, 0.14, 0.3));
  const curbMat = regMat(new THREE.MeshStandardMaterial({ color: 0x8c857b, roughness: 0.6 }));
  const curbMesh = new THREE.Mesh(curbGeo, curbMat);
  curbMesh.position.set(0, -0.13, 8.7);
  cityPlazaGroup.add(curbMesh);

  // Arrival Plaza Stone Pavers Slab (z = 4.4 to 8.6)
  const plazaFloorGeo = regGeo(new THREE.BoxGeometry(18.0, 0.3, 4.4));
  const plazaFloor = new THREE.Mesh(plazaFloorGeo, plazaPaverMat);
  plazaFloor.position.set(0, -0.15, 6.5);
  plazaFloor.receiveShadow = true;
  cityPlazaGroup.add(plazaFloor);

  // Animated Street Vehicles
  // 1. Classic Yellow & Black Mumbai Taxi (Traveling East on lane z = 9.5)
  const taxiGroup = new THREE.Group();
  taxiGroup.position.set(-6.0, 0, 9.5);
  const taxiBody = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.55, 0.8)), regMat(new THREE.MeshStandardMaterial({ color: 0x111111 })));
  taxiBody.position.y = 0.35;
  const taxiRoof = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.9, 0.45, 0.74)), regMat(new THREE.MeshStandardMaterial({ color: 0xfacc15 })));
  taxiRoof.position.set(-0.1, 0.75, 0);
  taxiGroup.add(taxiBody, taxiRoof);
  cityPlazaGroup.add(taxiGroup);

  // 2. Red BEST Transit Bus (Traveling West on lane z = 10.5)
  const busGroup = new THREE.Group();
  busGroup.position.set(6.0, 0, 10.5);
  const busBody = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.1, 1.1)), regMat(new THREE.MeshStandardMaterial({ color: 0xdc2626 })));
  busBody.position.y = 0.65;
  const busStripe = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.22, 0.16, 1.12)), regMat(new THREE.MeshStandardMaterial({ color: 0xffffff })));
  busStripe.position.y = 0.65;
  busGroup.add(busBody, busStripe);
  cityPlazaGroup.add(busGroup);

  // Street Trees in circular sidewalk planters
  for (const tx of [-4.5, 4.5]) {
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

  // Victorian Streetlamps along plaza
  const lampPostGeo = regGeo(new THREE.CylinderGeometry(0.04, 0.05, 2.6, 12));
  const lampGlobeGeo = regGeo(new THREE.SphereGeometry(0.18, 16, 16));
  const lampGlobeMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfff3d6 }));

  for (const lx of [-5.5, 5.5]) {
    for (const lz of [6.0, 8.0]) {
      const lampG = new THREE.Group();
      lampG.position.set(lx, 0, lz);
      const post = new THREE.Mesh(lampPostGeo, castIronMat);
      post.position.y = 1.3;
      const globe = new THREE.Mesh(lampGlobeGeo, lampGlobeMat);
      globe.position.y = 2.6;
      lampG.add(post, globe);
      cityPlazaGroup.add(lampG);
    }
  }

  // Plaza Direction Signpost: "FRICTION CENTRAL ➔"
  const signpostGroup = new THREE.Group();
  signpostGroup.position.set(2.4, 0, 7.2);
  const signPole = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8)), castIronMat);
  signPole.position.y = 0.9;
  const signBoard = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(1.6, 0.45, 0.06)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x3b82f6, emissiveIntensity: 0.3 }))
  );
  signBoard.position.set(0, 1.6, 0);
  signpostGroup.add(signPole, signBoard);
  cityPlazaGroup.add(signpostGroup);

  // Distant Pastel City Buildings (South at z >= 13.0 and flanks x <= -9.0, x >= 9.0)
  const pastelColors = [0xfca5a5, 0xfde047, 0x93c5fd, 0xc4b5fd, 0x86efac];
  for (let bx = -11.0; bx <= 11.0; bx += 2.8) {
    const bColor = pastelColors[Math.abs(Math.round(bx * 2)) % pastelColors.length];
    const bHeight = 5.4 + (Math.abs(bx) % 1.5) * 1.0;
    const bGeo = regGeo(new THREE.BoxGeometry(2.6, bHeight, 1.8));
    const bMat = regMat(new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.7 }));
    const building = new THREE.Mesh(bGeo, bMat);
    building.position.set(bx, bHeight / 2 - 0.15, 13.2);
    cityPlazaGroup.add(building);
  }

  stationGroup.add(cityPlazaGroup);

  // =========================================================================
  // 2. ZONE 1: STATION ENTRANCE GATE & ARCHITECTURAL FACADE (z = 4.4)
  // Completely open central portal (x in [-2.4, 2.4]) - direct view into Atrium!
  // =========================================================================
  const entranceFacadeGroup = new THREE.Group();
  entranceFacadeGroup.position.set(0, 0, 4.4);

  // Left Sandstone Entrance Tower (West: x = -4.0)
  const leftTower = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 5.2, 0.8)), sandstoneMat);
  leftTower.position.set(-4.0, 2.6, 0);
  leftTower.castShadow = true;
  entranceFacadeGroup.add(leftTower);

  // Right Sandstone Entrance Tower (East: x = 4.0)
  const rightTower = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.4, 5.2, 0.8)), sandstoneMat);
  rightTower.position.set(4.0, 2.6, 0);
  rightTower.castShadow = true;
  entranceFacadeGroup.add(rightTower);

  // Grand Entrance Overhead Lintel Beam (at y = 4.45, high above camera!)
  const entranceLintel = new THREE.Mesh(regGeo(new THREE.BoxGeometry(5.8, 0.7, 0.8)), sandstoneMat);
  entranceLintel.position.set(0, 4.45, 0);
  entranceLintel.castShadow = true;
  entranceFacadeGroup.add(entranceLintel);

  // Station Marquee Signboard: "FRICTION CENTRAL · MUMBAI"
  const stationMarquee = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(5.2, 0.55, 0.12)),
    regMat(new THREE.MeshStandardMaterial({
      color: 0x17131f,
      emissive: 0xff8a1f,
      emissiveIntensity: 0.55,
      roughness: 0.25,
    }))
  );
  stationMarquee.position.set(0, 4.45, 0.42);
  entranceFacadeGroup.add(stationMarquee);

  // Ornamental Gateposts flanking the open walkway (x = -2.5 and 2.5)
  for (const gx of [-2.5, 2.5]) {
    const postG = new THREE.Group();
    postG.position.set(gx, 0, 0);
    const postPillar = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.35, 3.4, 0.35)), castIronMat);
    postPillar.position.y = 1.7;
    const postLantern = new THREE.Mesh(regGeo(new THREE.BoxGeometry(0.24, 0.35, 0.24)), brassMat);
    postLantern.position.y = 3.55;
    postG.add(postPillar, postLantern);
    entranceFacadeGroup.add(postG);
  }

  stationGroup.add(entranceFacadeGroup);

  // =========================================================================
  // 3. ZONE 2: GRAND VICTORIAN ATRIUM & MEZZANINE (z = 1.8 to 4.4, Hub x in [-3.0, 3.0])
  // Restores commit 385c55e architecture: seafoam walls, cream sandstone, skylights, clock, mezzanine
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

  // Teak Slat Benches with Sage Cast-Iron Frames
  const teakBenchMat = regMat(new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.6 }));
  const sageIronMat = regMat(new THREE.MeshStandardMaterial({ color: 0x2e6040, roughness: 0.4, metalness: 0.3 }));
  const benchG = new THREE.Group();
  benchG.position.set(-1.4, 0, 2.4);
  const seat = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.5, 0.08, 0.45)), teakBenchMat);
  seat.position.y = 0.42;
  const back = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.5, 0.35, 0.06)), teakBenchMat);
  back.position.set(0, 0.62, -0.2);
  for (const lx of [-0.65, 0.65]) {
    const leg = new THREE.Mesh(regGeo(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 8)), sageIronMat);
    leg.position.set(lx, 0.21, 0);
    benchG.add(leg);
  }
  benchG.add(seat, back);
  atriumGroup.add(benchG);

  // Terracotta Urn Planters with Tropical Palms
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
  // 4. ROOM 1: ORIGINAL TICKET CONCOURSE (Center North: x in [-2.6, 2.6], z in [-1.4, 1.8])
  // PRESERVED BASELINE: Kiosk, royal-blue queue carpet, velvet stanchions, Arjun
  // =========================================================================
  const room1Group = new THREE.Group();

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

  // Dividing Wall South (z = 1.8) between Room 2 & Room 5 with open doorway (x in [5.0, 6.4])
  const r2SouthWallWest = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r2SouthWallWest.position.set(4.0, 2.2, 1.8);
  const r2SouthWallEast = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r2SouthWallEast.position.set(7.4, 2.2, 1.8);
  const r2SouthArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.6, 0.3)), sandstoneMat);
  r2SouthArchBeam.position.set(5.7, 3.8, 1.8);
  room2Group.add(r2SouthWallWest, r2SouthWallEast, r2SouthArchBeam);

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

  // Dividing Wall South (z = 1.8) between Room 3 & Room 4 with open doorway (x in [-6.4, -5.0])
  const r3SouthWallWest = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r3SouthWallWest.position.set(-7.4, 2.2, 1.8);
  const r3SouthWallEast = new THREE.Mesh(regGeo(new THREE.BoxGeometry(2.0, 4.4, 0.24)), sandstoneMat);
  r3SouthWallEast.position.set(-4.0, 2.2, 1.8);
  const r3SouthArchBeam = new THREE.Mesh(regGeo(new THREE.BoxGeometry(1.6, 0.6, 0.3)), sandstoneMat);
  r3SouthArchBeam.position.set(-5.7, 3.8, 1.8);
  room3Group.add(r3SouthWallWest, r3SouthWallEast, r3SouthArchBeam);

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
  // 9. GRAND PLATFORM 1 & TRACKS (North: z = -2.0 to -5.5, x in [-8.8, 8.8])
  // =========================================================================
  const platformGroup = new THREE.Group();

  // Long Passenger Platform Slab
  const platGeo = regGeo(new THREE.BoxGeometry(18.0, 0.4, 2.2));
  const platMat = regMat(new THREE.MeshStandardMaterial({ color: 0xded8cc, roughness: 0.5 }));
  const platform = new THREE.Mesh(platGeo, platMat);
  platform.position.set(0, -0.2, -2.6);
  platform.receiveShadow = true;
  platformGroup.add(platform);

  // Tactile Yellow Safety Edge along platform border (z = -3.2)
  const safetyEdge = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(18.0, 0.02, 0.18)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.3 }))
  );
  safetyEdge.position.set(0, 0.01, -3.2);
  platformGroup.add(safetyEdge);

  // Platform Direction Signs and Lighting
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

  // Railway Track Ballast (Gravel Bed)
  const ballast = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(20.0, 0.25, 2.8)),
    regMat(new THREE.MeshStandardMaterial({ color: 0x14101e, roughness: 0.9 }))
  );
  ballast.position.set(0, -0.22, -4.8);
  platformGroup.add(ballast);

  // Wooden Sleepers
  for (let sx = -9.5; sx <= 9.5; sx += 0.5) {
    const sleeper = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.22, 0.08, 2.0)),
      regMat(new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 }))
    );
    sleeper.position.set(sx, -0.06, -4.8);
    platformGroup.add(sleeper);
  }

  // Polished Steel Rails
  for (const rz of [-4.3, -5.3]) {
    const rail = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(20.0, 0.08, 0.08)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 }))
    );
    rail.position.set(0, -0.02, rz);
    platformGroup.add(rail);
  }

  stationGroup.add(platformGroup);

  // =========================================================================
  // 10. LIVING RAILWAY: SIMULATED DECCAN EXPRESS & TOKEN COLLECTIBLES
  // =========================================================================
  const trainSystem = createTrainSystem({
    scene,
    cycleInterval: 16,
    onPhaseChange: onTrainPhaseChange,
  });

  const tokenCollectibles = createTokenCollectibles(scene);

  // Animation Update Loop
  const update = (playerPos: THREE.Vector3, time: number, delta: number) => {
    // Animate clock minute hand
    clockHandMesh.rotation.z = -time * 0.15;

    // Pulse interactive screens
    kioskScreenMat.emissiveIntensity = 0.5 + Math.sin(time * 3.0) * 0.12;
    departureBoardLedMat.emissiveIntensity = 0.6 + Math.sin(time * 2.5) * 0.1;

    // Move City Street Vehicles
    taxiGroup.position.x += delta * 3.2;
    if (taxiGroup.position.x > 12.0) taxiGroup.position.x = -12.0;

    busGroup.position.x -= delta * 2.4;
    if (busGroup.position.x < -12.0) busGroup.position.x = 12.0;

    // Tick Train System & Token Collectibles
    trainSystem.update(delta);
    const { collectedId } = tokenCollectibles.update(playerPos, time, delta);

    return { collectedTokenId: collectedId };
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
