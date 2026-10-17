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
  update: (delta: number, time: number, keys: Record<string, boolean>) => { isMoving: boolean; speed: number };
  dispose: () => void;
}

export function createCharacterController(options: CharacterControllerOptions): CharacterControllerHandles {
  const { scene, avatarId, initialX = 0.0, initialZ = 6.0 } = options;
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
  scene.add(group);

  const pos = { x: initialX, z: initialZ };
  let currentAngle = 0;

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

      const nextX = THREE.MathUtils.clamp(pos.x + moveX, -5.2, 5.2);
      const nextZ = THREE.MathUtils.clamp(pos.z + moveZ, -3.1, 7.2);

      // Collision checks with Station Obstacles
      // 1. Central Kiosk at (0, 0.2)
      const hitKiosk = Math.abs(nextX) < 0.72 && Math.abs(nextZ - 0.2) < 0.62;
      // 2. Help Desk at (-2.6, 0.4)
      const hitDesk = Math.abs(nextX - -2.6) < 1.15 && Math.abs(nextZ - 0.4) < 0.85;
      // 3. Departure Board Post at (2.6, -1.2)
      const hitBoard = Math.abs(nextX - 2.6) < 0.45 && Math.abs(nextZ - -1.2) < 0.45;
      // 4. Train Platform Boundary (safety tactile line, cannot fall onto active tracks)
      const hitTracks = nextZ < -3.1;

      if (!hitKiosk && !hitDesk && !hitBoard && !hitTracks) {
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

      group.position.y = Math.abs(Math.sin(time * cycleSpeed)) * 0.06;
    } else {
      // Idle Breathing Animation
      const idleSway = Math.sin(time * 2.2);
      leftLegGroup.rotation.x = 0;
      rightLegGroup.rotation.x = 0;
      leftArmGroup.rotation.x = idleSway * 0.08;
      rightArmGroup.rotation.x = -idleSway * 0.08;
      group.position.y = Math.sin(time * 2.0) * 0.02;
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

  const dispose = () => {
    scene.remove(group);
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    getPosition,
    getAngle,
    setPosition,
    update,
    dispose,
  };
}
