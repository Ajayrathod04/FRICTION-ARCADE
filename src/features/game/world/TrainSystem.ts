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
  cycleInterval?: number; // default ~16s
  onPhaseChange?: (phase: TrainPhase, service: TrainScheduleItem) => void;
}

export interface TrainSystemHandles {
  trainGroup: THREE.Group;
  currentPhase: TrainPhase;
  currentService: TrainScheduleItem;
  update: (delta: number) => void;
  triggerImmediateBoarding: () => void;
  triggerImmediateDeparture: () => void;
  dispose: () => void;
}

export function createTrainSystem(options: TrainSystemOptions): TrainSystemHandles {
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

  const trainGroup = new THREE.Group();
  trainGroup.position.set(-18, 0.75, -4.6);
  scene.add(trainGroup);

  // --- TRAIN BODY GEOMETRY ---
  // Lead Locomotive
  const engineBodyGeo = regGeo(new THREE.BoxGeometry(3.6, 1.55, 1.6));
  const trainOrangeMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xff6b00,
      roughness: 0.28,
      metalness: 0.25,
    })
  );
  const engineBody = new THREE.Mesh(engineBodyGeo, trainOrangeMat);
  engineBody.position.set(2.4, 0, 0);
  engineBody.castShadow = true;
  trainGroup.add(engineBody);

  // Aerodynamic Cab Nose
  const cabGeo = regGeo(new THREE.ConeGeometry(0.9, 1.2, 4));
  const cab = new THREE.Mesh(cabGeo, trainOrangeMat);
  cab.rotation.z = -Math.PI / 2;
  cab.position.set(4.4, -0.15, 0);
  trainGroup.add(cab);

  // Glowing Headlamp
  const headlampGeo = regGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16));
  const headlampMat = regMat(new THREE.MeshBasicMaterial({ color: 0xfffed0 }));
  const headlamp = new THREE.Mesh(headlampGeo, headlampMat);
  headlamp.rotation.z = Math.PI / 2;
  headlamp.position.set(4.9, 0.1, 0);
  trainGroup.add(headlamp);

  // Passenger Coaches 1 & 2
  const coachGeo = regGeo(new THREE.BoxGeometry(3.2, 1.5, 1.55));
  const trainBlueMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.3,
      metalness: 0.2,
    })
  );

  const coach1 = new THREE.Mesh(coachGeo, trainBlueMat);
  coach1.position.set(-0.9, 0, 0);
  coach1.castShadow = true;
  trainGroup.add(coach1);

  const coach2 = new THREE.Mesh(coachGeo, trainBlueMat);
  coach2.position.set(-4.2, 0, 0);
  coach2.castShadow = true;
  trainGroup.add(coach2);

  // Sliding Passenger Doors (2 on platform side at z = 0.8)
  const doorGeo = regGeo(new THREE.BoxGeometry(0.65, 1.25, 0.05));
  const doorMat = regMat(new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.6, roughness: 0.2 }));
  const door1 = new THREE.Mesh(doorGeo, doorMat);
  door1.position.set(0.7, -0.1, 0.8);
  const door2 = new THREE.Mesh(doorGeo, doorMat);
  door2.position.set(-2.5, -0.1, 0.8);
  trainGroup.add(door1, door2);

  // Passenger Windows
  for (let wx = -4.8; wx <= 3.8; wx += 0.85) {
    if (Math.abs(wx - 0.7) < 0.2 || Math.abs(wx + 2.5) < 0.2) continue;
    const winGeo = regGeo(new THREE.BoxGeometry(0.55, 0.42, 0.04));
    const winMat = regMat(
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

  // Train Wheels
  for (let bx = -4.6; bx <= 3.8; bx += 1.4) {
    for (const bz of [-0.65, 0.65]) {
      const wheelGeo = regGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16));
      const wheelMat = regMat(new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.3 }));
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(bx, -0.65, bz);
      trainGroup.add(wheel);
    }
  }

  // --- TRAIN LIFECYCLE TIMING ---
  let currentPhase: TrainPhase = 'APPROACH';
  let phaseTimer = 0;
  let serviceIndex = 0;
  let currentService = TIMETABLE_SERVICES[0];

  const setPhase = (phase: TrainPhase) => {
    currentPhase = phase;
    phaseTimer = 0;
    onPhaseChange?.(currentPhase, currentService);
  };

  const update = (delta: number) => {
    phaseTimer += delta;

    switch (currentPhase) {
      case 'APPROACH': {
        // Train approaches from left: -18 to -4
        trainGroup.position.x += 4.5 * delta;
        door1.scale.x = 1;
        door2.scale.x = 1;
        if (trainGroup.position.x >= -4 || phaseTimer > 3.2) {
          setPhase('ARRIVAL');
        }
        break;
      }

      case 'ARRIVAL': {
        // Smoothly decelerate from -4 to 0
        const dist = 0 - trainGroup.position.x;
        trainGroup.position.x += dist * Math.min(delta * 2.8, 0.9);
        if (Math.abs(trainGroup.position.x) < 0.05 || phaseTimer > 2.5) {
          trainGroup.position.x = 0;
          setPhase('DWELL');
        }
        break;
      }

      case 'DWELL': {
        // Doors open smoothly
        const openT = Math.min(phaseTimer / 1.0, 1.0);
        door1.scale.x = 1.0 - openT * 0.8;
        door2.scale.x = 1.0 - openT * 0.8;
        if (phaseTimer > 2.8) {
          setPhase('BOARDING');
        }
        break;
      }

      case 'BOARDING': {
        // Queued passengers step forward into open doors
        if (phaseTimer > 3.0) {
          setPhase('ALIGHTING');
        }
        break;
      }

      case 'ALIGHTING': {
        // Passengers exit onto platform, doors prepare to close
        if (phaseTimer > 2.0) {
          setPhase('DEPARTURE');
        }
        break;
      }

      case 'DEPARTURE': {
        // Doors close, train accelerates off to x = 18
        door1.scale.x = 1;
        door2.scale.x = 1;
        const speed = Math.min(0.5 + phaseTimer * 2.4, 6.5);
        trainGroup.position.x += speed * delta;
        if (trainGroup.position.x > 16 || phaseTimer > 3.5) {
          setPhase('RESET');
        }
        break;
      }

      case 'RESET': {
        // Reset train back offscreen, rotate service on schedule
        trainGroup.position.x = -18;
        if (phaseTimer > 2.0) {
          serviceIndex = (serviceIndex + 1) % TIMETABLE_SERVICES.length;
          currentService = TIMETABLE_SERVICES[serviceIndex];
          setPhase('APPROACH');
        }
        break;
      }
    }
  };

  const triggerImmediateBoarding = () => {
    trainGroup.position.x = 0;
    setPhase('BOARDING');
  };

  const triggerImmediateDeparture = () => {
    setPhase('DEPARTURE');
  };

  const dispose = () => {
    scene.remove(trainGroup);
    disposables.forEach((d) => d.dispose());
  };

  return {
    trainGroup,
    get currentPhase() {
      return currentPhase;
    },
    get currentService() {
      return currentService;
    },
    update,
    triggerImmediateBoarding,
    triggerImmediateDeparture,
    dispose,
  };
}
