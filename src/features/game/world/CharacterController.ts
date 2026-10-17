import * as THREE from 'three';
import { AVATAR_CHOICES } from '../../../data/missionData';

export interface CharacterControllerOptions {
  scene: THREE.Scene;
  avatarId: 'explorer' | 'creative' | 'analyst';
  initialX?: number;
  initialZ?: number;
}

export interface CharacterControllerHandles {
  group: THREE.Group;
  getPosition: () => { x: number; z: number };
  getAngle: () => number;
  setPosition: (x: number, z: number) => void;
  setGateOpen: (open: boolean) => void;
  update: (delta: number, time: number, keys: Record<string, boolean>) => { isMoving: boolean; speed: number };
  dispose: () => void;
}

export function createCharacterController(options: CharacterControllerOptions): CharacterControllerHandles {
  const { scene, avatarId, initialX = 0.0, initialZ = 7.5 } = options;
  const avatar = AVATAR_CHOICES.find((a) => a.id === avatarId) || AVATAR_CHOICES[0];
  const disposables: Array<{ dispose: () => void }> = [];

  const registerGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
    disposables.push(geo);
    return geo;
  };
  const registerMat = <T extends THREE.Material>(mat: T): T => {
    disposables.push(mat);
    return mat;
  };

  const group = new THREE.Group();
  group.position.set(initialX, 0, initialZ);
  group.rotation.y = Math.PI; // Face North towards station entrance
  scene.add(group);

  const pos = { x: initialX, z: initialZ };
  let currentAngle = Math.PI;
  let isGateOpen = false;

  // =========================================================================
  // 1. ANATOMY & STYLIZED OUTFIT
  // =========================================================================
  // Torso / Jacket
  const jacketGeo = registerGeo(new THREE.CylinderGeometry(0.24, 0.28, 0.72, 16));
  const jacketMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: avatar.jacketColor,
      roughness: 0.45,
      metalness: 0.1,
    })
  );
  const jacket = new THREE.Mesh(jacketGeo, jacketMat);
  jacket.position.y = 0.68;
  jacket.castShadow = true;
  group.add(jacket);

  // Hood / Collar trim
  const collarGeo = registerGeo(new THREE.TorusGeometry(0.18, 0.06, 8, 16));
  const collar = new THREE.Mesh(collarGeo, jacketMat);
  collar.rotation.x = Math.PI / 2.2;
  collar.position.set(0, 0.98, -0.06);
  group.add(collar);

  // Head
  const headGeo = registerGeo(new THREE.SphereGeometry(0.18, 16, 16));
  const skinMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf6d5b4, roughness: 0.5 }));
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.2;
  head.castShadow = true;
  group.add(head);

  // Hairstyle
  const hairMat = registerMat(new THREE.MeshStandardMaterial({ color: avatar.hairColor, roughness: 0.7 }));
  const hairGeo = registerGeo(new THREE.SphereGeometry(0.19, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55));
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 1.25, 0);
  group.add(hair);

  if (avatar.hairStyle === 'topknot') {
    const knotGeo = registerGeo(new THREE.SphereGeometry(0.09, 10, 10));
    const knot = new THREE.Mesh(knotGeo, hairMat);
    knot.position.set(0, 1.45, -0.04);
    group.add(knot);
  } else if (avatar.hairStyle === 'parted') {
    const sweepGeo = registerGeo(new THREE.BoxGeometry(0.14, 0.05, 0.24));
    const sweep = new THREE.Mesh(sweepGeo, hairMat);
    sweep.position.set(0.09, 1.35, 0);
    sweep.rotation.z = -0.28;
    group.add(sweep);
  } else {
    // Tousled adventurous spikes
    const tuftGeo = registerGeo(new THREE.ConeGeometry(0.07, 0.14, 6));
    for (const tx of [-0.08, 0, 0.08]) {
      const tuft = new THREE.Mesh(tuftGeo, hairMat);
      tuft.rotation.x = -Math.PI / 2.7;
      tuft.rotation.z = tx * 2;
      tuft.position.set(tx, 1.32, 0.14);
      group.add(tuft);
    }
  }

  // =========================================================================
  // 2. SIGNATURE BACKPACK (Yellow with straps, pockets & patches)
  // =========================================================================
  const backpackGroup = new THREE.Group();
  backpackGroup.position.set(0, 0.7, -0.24);

  // Main Bag body
  const bagGeo = registerGeo(new THREE.BoxGeometry(0.32, 0.42, 0.22));
  const bagMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: avatar.backpackColor,
      roughness: 0.4,
      metalness: 0.08,
    })
  );
  const bag = new THREE.Mesh(bagGeo, bagMat);
  bag.castShadow = true;
  backpackGroup.add(bag);

  // Exterior Utility Pocket
  const pocketGeo = registerGeo(new THREE.BoxGeometry(0.24, 0.2, 0.08));
  const pocket = new THREE.Mesh(pocketGeo, bagMat);
  pocket.position.set(0, -0.06, -0.14);
  backpackGroup.add(pocket);

  // Shoulder Straps
  for (const sx of [-0.12, 0.12]) {
    const strapGeo = registerGeo(new THREE.BoxGeometry(0.05, 0.44, 0.04));
    const strapMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f }));
    const strap = new THREE.Mesh(strapGeo, strapMat);
    strap.position.set(sx, 0.02, 0.12);
    backpackGroup.add(strap);
  }

  // Patches (Explorer Badge Accents)
  const patchGeo = registerGeo(new THREE.BoxGeometry(0.08, 0.08, 0.02));
  const patch1Mat = registerMat(new THREE.MeshStandardMaterial({ color: 0xff3d8b }));
  const patch1 = new THREE.Mesh(patchGeo, patch1Mat);
  patch1.position.set(-0.07, 0.08, -0.12);
  backpackGroup.add(patch1);

  const patch2Mat = registerMat(new THREE.MeshStandardMaterial({ color: 0x8ddcff }));
  const patch2 = new THREE.Mesh(patchGeo, patch2Mat);
  patch2.position.set(0.07, 0.02, -0.12);
  backpackGroup.add(patch2);

  group.add(backpackGroup);

  // =========================================================================
  // 3. ARTICULATED LIMBS (Legs & Arms for walk cycles)
  // =========================================================================
  const pantsMat = registerMat(new THREE.MeshStandardMaterial({ color: avatar.pantsColor, roughness: 0.6 }));
  const shoeMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 }));

  // Left Leg
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.12, 0.4, 0);
  const leftLegMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8)), pantsMat);
  leftLegMesh.position.y = -0.2;
  leftLegMesh.castShadow = true;
  const leftShoe = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.14, 0.09, 0.2)), shoeMat);
  leftShoe.position.set(0, -0.4, 0.04);
  leftShoe.castShadow = true;
  leftLegGroup.add(leftLegMesh, leftShoe);
  group.add(leftLegGroup);

  // Right Leg
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.12, 0.4, 0);
  const rightLegMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8)), pantsMat);
  rightLegMesh.position.y = -0.2;
  rightLegMesh.castShadow = true;
  const rightShoe = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.14, 0.09, 0.2)), shoeMat);
  rightShoe.position.set(0, -0.4, 0.04);
  rightShoe.castShadow = true;
  rightLegGroup.add(rightLegMesh, rightShoe);
  group.add(rightLegGroup);

  // Left Arm
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.32, 0.95, 0);
  const leftSleeve = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 8)), jacketMat);
  leftSleeve.position.y = -0.2;
  leftSleeve.castShadow = true;
  const leftHand = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.06, 8, 8)), skinMat);
  leftHand.position.y = -0.44;
  leftArmGroup.add(leftSleeve, leftHand);
  group.add(leftArmGroup);

  // Right Arm
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.32, 0.95, 0);
  const rightSleeve = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.07, 0.06, 0.42, 8)), jacketMat);
  rightSleeve.position.y = -0.2;
  rightSleeve.castShadow = true;
  const rightHand = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.06, 8, 8)), skinMat);
  rightHand.position.y = -0.44;
  rightArmGroup.add(rightSleeve, rightHand);
  group.add(rightArmGroup);

  // Rolling Luggage Suitcase (accompanying Explorer)
  const suitcaseGroup = new THREE.Group();
  suitcaseGroup.position.set(0.42, 0, -0.15);
  const suitcaseGeo = registerGeo(new THREE.BoxGeometry(0.26, 0.48, 0.3));
  const suitcaseMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xff3d8b, roughness: 0.35 }));
  const suitcase = new THREE.Mesh(suitcaseGeo, suitcaseMat);
  suitcase.position.y = 0.26;
  suitcase.castShadow = true;
  suitcaseGroup.add(suitcase);

  const handleGeo = registerGeo(new THREE.TorusGeometry(0.08, 0.02, 6, 12, Math.PI));
  const handleMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8 }));
  const suitcaseHandle = new THREE.Mesh(handleGeo, handleMat);
  suitcaseHandle.position.set(0, 0.54, 0);
  suitcaseGroup.add(suitcaseHandle);
  group.add(suitcaseGroup);

  // Soft Contact Ground Shadow
  const shadowGeo = registerGeo(new THREE.RingGeometry(0.05, 0.42, 16));
  const shadowMat = registerMat(
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
  );
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.01;
  group.add(shadow);

  // =========================================================================
  // 4. MOVEMENT, COLLISION, ANIMATION TICK
  // =========================================================================
  const update = (delta: number, time: number, keys: Record<string, boolean>) => {
    const isSprinting = !!keys['shift'];
    const speed = isSprinting ? 4.2 : 2.5;

    let dx = 0;
    let dz = 0;
    if (keys['w'] || keys['arrowup']) dz -= 1;
    if (keys['s'] || keys['arrowdown']) dz += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    const isMoving = dx !== 0 || dz !== 0;

    if (isMoving) {
      const len = Math.hypot(dx, dz);
      const moveX = (dx / len) * speed * delta;
      const moveZ = (dz / len) * speed * delta;

      const nextX = THREE.MathUtils.clamp(pos.x + moveX, -8.4, 8.4);
      const nextZ = THREE.MathUtils.clamp(pos.z + moveZ, -8.2, 10.5);

      // Traversal zones through open doorways / archways:
      // Doorway: Atrium <-> Room 4 (West): x around -3.0, z in [2.4, 4.0]
      const inDoorAtriumLounge = Math.abs(nextX - -3.0) < 0.45 && nextZ >= 2.4 && nextZ <= 4.0;
      // Doorway: Atrium <-> Room 5 (East): x around 3.0, z in [2.4, 4.0]
      const inDoorAtriumLab = Math.abs(nextX - 3.0) < 0.45 && nextZ >= 2.4 && nextZ <= 4.0;
      // Doorway: Room 1 <-> Room 3 (West): x around -3.0, z in [-0.6, 1.0]
      const inDoorConcourseDesk = Math.abs(nextX - -3.0) < 0.45 && nextZ >= -0.6 && nextZ <= 1.0;
      // Doorway: Room 1 <-> Room 2 (East): x around 3.0, z in [-0.6, 1.0]
      const inDoorConcourseBoard = Math.abs(nextX - 3.0) < 0.45 && nextZ >= -0.6 && nextZ <= 1.0;
      // Doorway: Room 4 <-> Room 3: z around 1.8, x in [-6.6, -4.6]
      const inDoorLoungeDesk = Math.abs(nextZ - 1.8) < 0.35 && nextX >= -6.6 && nextX <= -4.6;
      // Doorway: Room 5 <-> Room 2: z around 1.8, x in [4.6, 6.6]
      const inDoorLabBoard = Math.abs(nextZ - 1.8) < 0.35 && nextX >= 4.6 && nextX <= 6.6;
      // Platform Turnstiles from Room 1: z around -1.4, x in [-1.8, 1.8]
      const inPlatformGate = Math.abs(nextZ - -1.4) < 0.35 && Math.abs(nextX) <= 1.8;
      // Platform Ramp from Room 3: z around -1.4, x in [-7.5, -5.0]
      const inPlatformWest = Math.abs(nextZ - -1.4) < 0.35 && nextX >= -7.5 && nextX <= -5.0;
      // Platform Ramp from Room 2: z around -1.4, x in [5.0, 7.5]
      const inPlatformEast = Math.abs(nextZ - -1.4) < 0.35 && nextX >= 5.0 && nextX <= 7.5;

      // Solid dividing wall collisions:
      // Dividing wall x = -3.0 (between Room 1/Atrium and Room 3/Room 4)
      const hitWestDividingWall = Math.abs(nextX - -3.0) < 0.22 && !inDoorAtriumLounge && !inDoorConcourseDesk;
      // Dividing wall x = 3.0 (between Room 1/Atrium and Room 2/Room 5)
      const hitEastDividingWall = Math.abs(nextX - 3.0) < 0.22 && !inDoorAtriumLab && !inDoorConcourseBoard;
      // Dividing horizontal wall z = 1.8 (between Lounge/Desk and Lab/Board)
      const hitHorizWallWest = Math.abs(nextZ - 1.8) < 0.22 && nextX < -3.0 && !inDoorLoungeDesk;
      const hitHorizWallEast = Math.abs(nextZ - 1.8) < 0.22 && nextX > 3.0 && !inDoorLabBoard;
      // Facade wall at z = 4.4
      const hitFacadeWall = Math.abs(nextZ - 4.4) < 0.28 && Math.abs(nextX) > 2.5;
      // Platform dividing wall at z = -1.4
      const hitPlatformWall = Math.abs(nextZ - -1.4) < 0.22 && !inPlatformGate && !inPlatformWest && !inPlatformEast;

      // Specific Furniture & Prop collisions
      const hitKiosk = Math.abs(nextX) < 0.72 && Math.abs(nextZ - 0.2) < 0.55;
      const hitDesk = Math.abs(nextX - -5.6) < 1.3 && Math.abs(nextZ - 0.2) < 0.55;
      const hitBoard = Math.abs(nextX - 5.4) < 0.45 && Math.abs(nextZ - -1.2) < 0.45;
      const hitClock = Math.abs(nextX - 1.8) < 0.35 && Math.abs(nextZ - 2.4) < 0.35;
      const hitGatePosts = (Math.abs(nextX - -2.5) < 0.35 || Math.abs(nextX - 2.5) < 0.35) && Math.abs(nextZ - 4.4) < 0.35;
      // Closed entrance gate wings block central passage (x in [-1.1, 1.1]) until opened
      const hitClosedGate = !isGateOpen && Math.abs(nextZ - 4.4) < 0.22 && Math.abs(nextX) < 1.1;
      // Exactly two feature benches placed symmetrically flanking crimson runner (at x = ±1.85, z = 3.3)
      const hitFeatureBenchWest = Math.abs(nextX - -1.85) < 0.35 && Math.abs(nextZ - 3.3) < 0.72;
      const hitFeatureBenchEast = Math.abs(nextX - 1.85) < 0.35 && Math.abs(nextZ - 3.3) < 0.72;

      // Platform 2 & Double Tracks Traversal:
      // Tracks run between z = -3.4 and z = -6.4.
      // Crossing is allowed via West Crossing (x in [-7.4, -5.2]) or East Footbridge (x in [5.2, 7.4]).
      const inCrossingWest = nextX >= -7.4 && nextX <= -5.2;
      const inCrossingEast = nextX >= 5.2 && nextX <= 7.4;
      const inCrossing = inCrossingWest || inCrossingEast;
      const hitTracks = nextZ < -3.3 && nextZ > -6.4 && !inCrossing;
      const hitPlatform2BackWall = nextZ < -8.2;

      const isBlocked =
        hitWestDividingWall ||
        hitEastDividingWall ||
        hitHorizWallWest ||
        hitHorizWallEast ||
        hitFacadeWall ||
        hitPlatformWall ||
        hitKiosk ||
        hitDesk ||
        hitBoard ||
        hitClock ||
        hitGatePosts ||
        hitClosedGate ||
        hitFeatureBenchWest ||
        hitFeatureBenchEast ||
        hitTracks ||
        hitPlatform2BackWall;

      if (!isBlocked) {
        pos.x = nextX;
        pos.z = nextZ;
      }

      // Smooth turning towards movement vector
      const targetAngle = Math.atan2(dx, dz);
      currentAngle = THREE.MathUtils.lerp(currentAngle, targetAngle, 0.2);
      group.rotation.y = currentAngle;

      // Leg & Arm stride cycle
      const cycleSpeed = isSprinting ? 16 : 10;
      const stride = Math.sin(time * cycleSpeed);
      leftLegGroup.rotation.x = stride * 0.65;
      rightLegGroup.rotation.x = -stride * 0.65;
      leftArmGroup.rotation.x = -stride * 0.55;
      rightArmGroup.rotation.x = stride * 0.55;

      // Physical staircase elevation in Atrium (staircase at x in [-3.0, -2.1], z in [1.2, 3.1])
      let elevationY = 0;
      if (pos.x >= -3.0 && pos.x <= -2.1 && pos.z >= 1.2 && pos.z <= 3.1) {
        const stairT = (3.1 - pos.z) / 1.9;
        elevationY = stairT * 1.26;
      } else if (pos.x >= -3.0 && pos.x <= -2.0 && pos.z >= 0.8 && pos.z < 1.2) {
        elevationY = 1.26;
      } else if (inCrossingEast && pos.z < -3.3 && pos.z > -6.4) {
        // High footbridge arch elevation
        const bridgeT = Math.sin(((pos.z - -3.3) / (-6.4 - -3.3)) * Math.PI);
        elevationY = bridgeT * 1.6;
      }

      group.position.y = elevationY + Math.abs(Math.sin(time * cycleSpeed)) * 0.06;
    } else {
      // Idle Breathing Animation with proper stair height preservation
      let elevationY = 0;
      if (pos.x >= -3.0 && pos.x <= -2.1 && pos.z >= 1.2 && pos.z <= 3.1) {
        const stairT = (3.1 - pos.z) / 1.9;
        elevationY = stairT * 1.26;
      } else if (pos.x >= -3.0 && pos.x <= -2.0 && pos.z >= 0.8 && pos.z < 1.2) {
        elevationY = 1.26;
      } else if (pos.x >= 5.2 && pos.x <= 7.4 && pos.z < -3.3 && pos.z > -6.4) {
        const bridgeT = Math.sin(((pos.z - -3.3) / (-6.4 - -3.3)) * Math.PI);
        elevationY = bridgeT * 1.6;
      }

      const idleSway = Math.sin(time * 2.2);
      leftLegGroup.rotation.x = 0;
      rightLegGroup.rotation.x = 0;
      leftArmGroup.rotation.x = idleSway * 0.08;
      rightArmGroup.rotation.x = -idleSway * 0.08;
      group.position.y = elevationY + Math.sin(time * 2.0) * 0.02;
    }

    group.position.x = pos.x;
    group.position.z = pos.z;

    return { isMoving, speed: isMoving ? speed : 0 };
  };

  const getPosition = () => ({ x: pos.x, z: pos.z });
  const getAngle = () => currentAngle;
  const setPosition = (x: number, z: number) => {
    pos.x = x;
    pos.z = z;
    group.position.set(x, group.position.y, z);
  };
  const setGateOpen = (open: boolean) => {
    isGateOpen = open;
  };

  const dispose = () => {
    scene.remove(group);
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    getPosition,
    getAngle,
    setPosition,
    setGateOpen,
    update,
    dispose,
  };
}
