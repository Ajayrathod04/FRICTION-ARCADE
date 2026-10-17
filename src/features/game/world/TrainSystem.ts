import * as THREE from 'three';

export type TrainPhase =
  | 'APPROACH'
  | 'ARRIVAL'
  | 'DWELL'
  | 'BOARDING'
  | 'ALIGHTING'
  | 'DEPARTURE'
  | 'RESET';

export interface TrainScheduleItem {
  trainNo: string;
  name: string;
  destination: string;
  scheduledTime: string;
  platform: string;
  status: string;
}

export const TIMETABLE_SERVICES: TrainScheduleItem[] = [
  {
    trainNo: '12127',
    name: 'DECCAN EXP',
    destination: 'PUNE JN',
    scheduledTime: '07:15',
    platform: 'PL 1',
    status: 'BOARDING',
  },
  {
    trainNo: '12951',
    name: 'RAJDHANI EXP',
    destination: 'NEW DELHI',
    scheduledTime: '07:45',
    platform: 'PL 1',
    status: 'ON TIME',
  },
  {
    trainNo: '12009',
    name: 'SHATABDI EXP',
    destination: 'AHMEDABAD',
    scheduledTime: '08:10',
    platform: 'PL 1',
    status: 'ON TIME',
  },
];

export interface TrainSystemOptions {
  scene: THREE.Scene;
  cycleInterval?: number;
  onPhaseChange?: (phase: TrainPhase, service: TrainScheduleItem, platform: 'PL 1' | 'PL 2') => void;
}

export interface TrainSystemHandles {
  trainGroup1: THREE.Group;
  trainGroup2: THREE.Group;
  currentPhase1: TrainPhase;
  currentPhase2: TrainPhase;
  currentService1: TrainScheduleItem;
  currentService2: TrainScheduleItem;
  update: (delta: number) => void;
  triggerImmediateBoarding: () => void;
  triggerImmediateDeparture: () => void;
  dispose: () => void;
}

export function createTrainSystem(options: TrainSystemOptions): TrainSystemHandles & { trainGroup: THREE.Group; currentPhase: TrainPhase; currentService: TrainScheduleItem } {
  const { scene, onPhaseChange } = options;

  const disposables: Array<{ dispose: () => void }> = [];
  const regGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const regMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // =========================================================================
  // 1. TRAIN 1 (PLATFORM 1: TRACK z = -4.6) — DECCAN EXPRESS / PUNE EXP
  // =========================================================================
  const trainGroup1 = new THREE.Group();
  trainGroup1.position.set(-18, 0.75, -4.6);
  scene.add(trainGroup1);

  // Train 1 Body
  const engineBody1 = new THREE.Mesh(
    regGeo(new THREE.BoxGeometry(3.6, 1.55, 1.6)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.28, metalness: 0.25 }))
  );
  engineBody1.position.set(2.4, 0, 0);
  engineBody1.castShadow = true;
  trainGroup1.add(engineBody1);

  const cab1 = new THREE.Mesh(
    regGeo(new THREE.ConeGeometry(0.9, 1.2, 4)),
    regMat(new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.28, metalness: 0.25 }))
  );
  cab1.rotation.z = -Math.PI / 2;
  cab1.position.set(4.4, -0.15, 0);
  trainGroup1.add(cab1);

  const headlamp1 = new THREE.Mesh(
    regGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16)),
    regMat(new THREE.MeshBasicMaterial({ color: 0xfffed0 }))
  );
  headlamp1.rotation.z = Math.PI / 2;
  headlamp1.position.set(4.9, 0.1, 0);
  trainGroup1.add(headlamp1);

  const trainBlueMat = regMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3, metalness: 0.2 }));
  const coach1A = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55)), trainBlueMat);
  coach1A.position.set(-0.9, 0, 0);
  coach1A.castShadow = true;
  const coach1B = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55)), trainBlueMat);
  coach1B.position.set(-4.2, 0, 0);
  coach1B.castShadow = true;
  trainGroup1.add(coach1A, coach1B);

  // Sliding Passenger Doors (facing Platform 1 at z = +0.8 relative to train center)
  const doorGeo1 = regGeo(new THREE.BoxGeometry(0.65, 1.25, 0.05));
  const doorMat1 = regMat(new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.6, roughness: 0.2 }));
  const door1A = new THREE.Mesh(doorGeo1, doorMat1);
  door1A.position.set(0.7, -0.1, 0.8);
  const door1B = new THREE.Mesh(doorGeo1, doorMat1);
  door1B.position.set(-2.5, -0.1, 0.8);
  trainGroup1.add(door1A, door1B);

  // Train 1 Windows & Wheels
  for (let wx = -4.8; wx <= 3.8; wx += 0.85) {
    if (Math.abs(wx - 0.7) < 0.2 || Math.abs(wx + 2.5) < 0.2) continue;
    const win = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.55, 0.42, 0.04)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xfff6e5, emissive: 0xffd23f, emissiveIntensity: 0.65 }))
    );
    win.position.set(wx, 0.2, 0.79);
    trainGroup1.add(win);
  }
  for (let bx = -4.6; bx <= 3.8; bx += 1.4) {
    for (const bz of [-0.65, 0.65]) {
      const wheel = new THREE.Mesh(
        regGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16)),
        regMat(new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 }))
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(bx, -0.65, bz);
      trainGroup1.add(wheel);
    }
  }

  // =========================================================================
  // 2. TRAIN 2 (PLATFORM 2: TRACK z = -5.8) — RAJDHANI EXPRESS (Red & Gold)
  // =========================================================================
  const trainGroup2 = new THREE.Group();
  trainGroup2.position.set(0, 0.75, -5.8); // Starts stationed at Platform 2
  scene.add(trainGroup2);

  const rajdhaniRedMat = regMat(new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3, metalness: 0.2 }));
  const rajdhaniCreamMat = regMat(new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.35, metalness: 0.15 }));

  const engineBody2 = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.6, 1.55, 1.6)), rajdhaniRedMat);
  engineBody2.position.set(-2.4, 0, 0); // Facing West
  engineBody2.castShadow = true;
  trainGroup2.add(engineBody2);

  const cab2 = new THREE.Mesh(regGeo(new THREE.ConeGeometry(0.9, 1.2, 4)), rajdhaniRedMat);
  cab2.rotation.z = Math.PI / 2;
  cab2.position.set(-4.4, -0.15, 0);
  trainGroup2.add(cab2);

  const headlamp2 = new THREE.Mesh(
    regGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16)),
    regMat(new THREE.MeshBasicMaterial({ color: 0xfffed0 }))
  );
  headlamp2.rotation.z = Math.PI / 2;
  headlamp2.position.set(-4.9, 0.1, 0);
  trainGroup2.add(headlamp2);

  const coach2A = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55)), rajdhaniRedMat);
  coach2A.position.set(0.9, 0, 0);
  coach2A.castShadow = true;
  const coach2B = new THREE.Mesh(regGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55)), rajdhaniCreamMat);
  coach2B.position.set(4.2, 0, 0);
  coach2B.castShadow = true;
  trainGroup2.add(coach2A, coach2B);

  // Sliding Doors (facing Platform 2 at z = -0.8 relative to train center)
  const door2A = new THREE.Mesh(doorGeo1, doorMat1);
  door2A.position.set(-0.7, -0.1, -0.8);
  const door2B = new THREE.Mesh(doorGeo1, doorMat1);
  door2B.position.set(2.5, -0.1, -0.8);
  trainGroup2.add(door2A, door2B);

  // Windows & Wheels for Train 2
  for (let wx = -3.8; wx <= 4.8; wx += 0.85) {
    if (Math.abs(wx + 0.7) < 0.2 || Math.abs(wx - 2.5) < 0.2) continue;
    const win = new THREE.Mesh(
      regGeo(new THREE.BoxGeometry(0.55, 0.42, 0.04)),
      regMat(new THREE.MeshStandardMaterial({ color: 0xfff6e5, emissive: 0xffd23f, emissiveIntensity: 0.65 }))
    );
    win.position.set(wx, 0.2, -0.79);
    trainGroup2.add(win);
  }
  for (let bx = -3.8; bx <= 4.6; bx += 1.4) {
    for (const bz of [-0.65, 0.65]) {
      const wheel = new THREE.Mesh(
        regGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16)),
        regMat(new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 }))
      );
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(bx, -0.65, bz);
      trainGroup2.add(wheel);
    }
  }

  // --- TRAIN 1 LIFECYCLE (Platform 1: Deccan Express) ---
  let currentPhase1: TrainPhase = 'APPROACH';
  let phaseTimer1 = 0;
  let serviceIndex1 = 0;
  let currentService1 = TIMETABLE_SERVICES[0];

  const setPhase1 = (phase: TrainPhase) => {
    currentPhase1 = phase;
    phaseTimer1 = 0;
    onPhaseChange?.(currentPhase1, currentService1, 'PL 1');
  };

  // --- TRAIN 2 LIFECYCLE (Platform 2: Rajdhani Express) ---
  let currentPhase2: TrainPhase = 'DWELL';
  let phaseTimer2 = 0;
  let currentService2: TrainScheduleItem = {
    trainNo: '12951',
    name: 'RAJDHANI EXP',
    destination: 'NEW DELHI',
    scheduledTime: '07:45',
    platform: 'PL 2',
    status: 'BOARDING',
  };

  const setPhase2 = (phase: TrainPhase) => {
    currentPhase2 = phase;
    phaseTimer2 = 0;
    onPhaseChange?.(currentPhase2, currentService2, 'PL 2');
  };

  const update = (delta: number) => {
    // --- UPDATE TRAIN 1 ---
    phaseTimer1 += delta;
    switch (currentPhase1) {
      case 'APPROACH': {
        trainGroup1.position.x += 4.5 * delta;
        door1A.scale.x = 1;
        door1B.scale.x = 1;
        if (trainGroup1.position.x >= -4 || phaseTimer1 > 3.2) {
          setPhase1('ARRIVAL');
        }
        break;
      }
      case 'ARRIVAL': {
        const dist = 0 - trainGroup1.position.x;
        trainGroup1.position.x += dist * Math.min(delta * 2.8, 0.9);
        if (Math.abs(trainGroup1.position.x) < 0.05 || phaseTimer1 > 2.5) {
          trainGroup1.position.x = 0;
          setPhase1('DWELL');
        }
        break;
      }
      case 'DWELL': {
        const openT = Math.min(phaseTimer1 / 1.0, 1.0);
        door1A.scale.x = 1.0 - openT * 0.8;
        door1B.scale.x = 1.0 - openT * 0.8;
        if (phaseTimer1 > 2.8) {
          setPhase1('BOARDING');
        }
        break;
      }
      case 'BOARDING': {
        if (phaseTimer1 > 3.0) {
          setPhase1('ALIGHTING');
        }
        break;
      }
      case 'ALIGHTING': {
        if (phaseTimer1 > 2.0) {
          setPhase1('DEPARTURE');
        }
        break;
      }
      case 'DEPARTURE': {
        door1A.scale.x = 1;
        door1B.scale.x = 1;
        const speed = Math.min(0.5 + phaseTimer1 * 2.4, 6.5);
        trainGroup1.position.x += speed * delta;
        if (trainGroup1.position.x > 16 || phaseTimer1 > 3.5) {
          setPhase1('RESET');
        }
        break;
      }
      case 'RESET': {
        trainGroup1.position.x = -18;
        if (phaseTimer1 > 2.0) {
          serviceIndex1 = (serviceIndex1 + 1) % TIMETABLE_SERVICES.length;
          currentService1 = TIMETABLE_SERVICES[serviceIndex1];
          setPhase1('APPROACH');
        }
        break;
      }
    }

    // --- UPDATE TRAIN 2 (Platform 2: Staggered Cycle) ---
    phaseTimer2 += delta;
    switch (currentPhase2) {
      case 'DWELL': {
        const openT = Math.min(phaseTimer2 / 1.2, 1.0);
        door2A.scale.x = 1.0 - openT * 0.8;
        door2B.scale.x = 1.0 - openT * 0.8;
        if (phaseTimer2 > 3.2) {
          setPhase2('BOARDING');
        }
        break;
      }
      case 'BOARDING': {
        if (phaseTimer2 > 3.5) {
          setPhase2('ALIGHTING');
        }
        break;
      }
      case 'ALIGHTING': {
        if (phaseTimer2 > 2.2) {
          setPhase2('DEPARTURE');
        }
        break;
      }
      case 'DEPARTURE': {
        door2A.scale.x = 1;
        door2B.scale.x = 1;
        const speed = Math.min(0.5 + phaseTimer2 * 2.2, 5.8);
        trainGroup2.position.x -= speed * delta; // Departs towards West
        if (trainGroup2.position.x < -18 || phaseTimer2 > 4.0) {
          setPhase2('RESET');
        }
        break;
      }
      case 'RESET': {
        trainGroup2.position.x = 18; // Resets on East
        if (phaseTimer2 > 2.5) {
          setPhase2('APPROACH');
        }
        break;
      }
      case 'APPROACH': {
        trainGroup2.position.x -= 4.2 * delta;
        if (trainGroup2.position.x <= 4.0 || phaseTimer2 > 3.5) {
          setPhase2('ARRIVAL');
        }
        break;
      }
      case 'ARRIVAL': {
        const dist = 0 - trainGroup2.position.x;
        trainGroup2.position.x += dist * Math.min(delta * 2.5, 0.9);
        if (Math.abs(trainGroup2.position.x) < 0.05 || phaseTimer2 > 2.5) {
          trainGroup2.position.x = 0;
          setPhase2('DWELL');
        }
        break;
      }
    }
  };

  const triggerImmediateBoarding = () => {
    trainGroup1.position.x = 0;
    setPhase1('BOARDING');
  };

  const triggerImmediateDeparture = () => {
    setPhase1('DEPARTURE');
  };

  const dispose = () => {
    scene.remove(trainGroup1);
    scene.remove(trainGroup2);
    disposables.forEach((d) => d.dispose());
  };

  return {
    trainGroup1,
    trainGroup2,
    get currentPhase1() {
      return currentPhase1;
    },
    get currentPhase2() {
      return currentPhase2;
    },
    get currentService1() {
      return currentService1;
    },
    get currentService2() {
      return currentService2;
    },
    // Backward compatibility aliases for existing code and tests
    get trainGroup() {
      return trainGroup1;
    },
    get currentPhase() {
      return currentPhase1;
    },
    get currentService() {
      return currentService1;
    },
    update,
    triggerImmediateBoarding,
    triggerImmediateDeparture,
    dispose,
  };
}
