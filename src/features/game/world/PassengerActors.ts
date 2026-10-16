import * as THREE from 'three';

export interface PassengerActorsOptions {
  scene: THREE.Scene;
  cluesFound: string[];
  repairsComplete: boolean;
  isFrictionVision: boolean;
}

export interface PassengerActorsHandles {
  group: THREE.Group;
  ghostTrailGroup: THREE.Group;
  update: (time: number, delta: number, isFrictionVision: boolean, isBoarding: boolean) => void;
  triggerBoardingWalk: () => void;
  dispose: () => void;
}

export function createPassengerActors(options: PassengerActorsOptions): PassengerActorsHandles {
  const { scene, cluesFound } = options;
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
  scene.add(group);

  const ghostTrailGroup = new THREE.Group();
  scene.add(ghostTrailGroup);

  // Common Shared Materials
  const skinMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf5d0b0, roughness: 0.5 }));
  const darkHairMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
  const brownHairMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x3d271d, roughness: 0.7 }));
  const shoeMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f, roughness: 0.4 }));

  // Helper function to create articulated legs
  const createArticulatedLegs = (pantsMat: THREE.Material, parentGroup: THREE.Group, shoeMaterial = shoeMat) => {
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.1, 0.42, 0);
    const lLegMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 8)), pantsMat);
    lLegMesh.position.y = -0.21;
    lLegMesh.castShadow = true;
    const lShoe = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.12, 0.07, 0.18)), shoeMaterial);
    lShoe.position.set(0, -0.42, 0.03);
    lShoe.castShadow = true;
    leftLeg.add(lLegMesh, lShoe);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.1, 0.42, 0);
    const rLegMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.065, 0.055, 0.42, 8)), pantsMat);
    rLegMesh.position.y = -0.21;
    rLegMesh.castShadow = true;
    const rShoe = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.12, 0.07, 0.18)), shoeMaterial);
    rShoe.position.set(0, -0.42, 0.03);
    rShoe.castShadow = true;
    rightLeg.add(rLegMesh, rShoe);

    parentGroup.add(leftLeg, rightLeg);
    return { leftLeg, rightLeg };
  };

  // =========================================================================
  // 1. PASSENGER 1: ARJUN (Ticket Kiosk — x: 0.0, z: 0.65)
  // Olive casual jacket, dark jeans, messenger bag, scratching head in hesitation
  // =========================================================================
  const arjunGroup = new THREE.Group();
  arjunGroup.position.set(0.0, 0, 0.65);
  arjunGroup.rotation.y = Math.PI; // Faces north toward kiosk

  const arjunJacketMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x3b6e47, roughness: 0.5 }));
  const arjunPantsMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.6 }));

  const arjunTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.2, 0.23, 0.55, 12)), arjunJacketMat);
  arjunTorso.position.y = 0.68;
  arjunTorso.castShadow = true;
  arjunGroup.add(arjunTorso);

  // Inner shirt collar
  const arjunShirt = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.14, 0.18, 0.1, 10)), registerMat(new THREE.MeshStandardMaterial({ color: 0xfff6e5 })));
  arjunShirt.position.y = 0.94;
  arjunGroup.add(arjunShirt);

  const arjunHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), skinMat);
  arjunHead.position.y = 1.15;
  arjunHead.castShadow = true;
  arjunGroup.add(arjunHead);

  const arjunHair = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.24, 0.12, 0.24)), darkHairMat);
  arjunHair.position.set(0, 1.25, 0);
  arjunGroup.add(arjunHair);

  // Messenger Bag
  const arjunBag = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.24, 0.26, 0.1)), registerMat(new THREE.MeshStandardMaterial({ color: 0x8a5a36 })));
  arjunBag.position.set(0.18, 0.6, -0.12);
  arjunGroup.add(arjunBag);

  // Left arm (scratching head in confusion)
  const arjunLeftArm = new THREE.Group();
  arjunLeftArm.position.set(-0.24, 0.88, 0);
  const aArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), arjunJacketMat);
  aArmMesh.position.y = -0.18;
  const aLeftHand = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.05, 8, 8)), skinMat);
  aLeftHand.position.y = -0.38;
  arjunLeftArm.add(aArmMesh, aLeftHand);
  arjunGroup.add(arjunLeftArm);

  // Right arm (holding smartcard forward)
  const arjunRightArm = new THREE.Group();
  arjunRightArm.position.set(0.24, 0.88, 0);
  const aRArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), arjunJacketMat);
  aRArmMesh.position.set(0, -0.15, 0.1);
  aRArmMesh.rotation.x = -Math.PI / 4;
  const smartCard = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.08, 0.05, 0.01)), registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f })));
  smartCard.position.set(0, -0.36, 0.2);
  arjunRightArm.add(aRArmMesh, smartCard);
  arjunGroup.add(arjunRightArm);

  // Articulated legs
  const arjunLegs = createArticulatedLegs(arjunPantsMat, arjunGroup);
  group.add(arjunGroup);

  // =========================================================================
  // 2. PASSENGER 2: MEERA (Departure Board — x: 2.3, z: -0.85)
  // Stylish magenta trench coat, ponytail, dark trousers, holding timetable brochure
  // =========================================================================
  const meeraGroup = new THREE.Group();
  meeraGroup.position.set(2.3, 0, -0.85);
  meeraGroup.rotation.y = Math.PI * 0.85; // Gazes up at departure board

  const meeraCoatMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.4 }));
  const meeraPantsMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1f192b, roughness: 0.6 }));

  const meeraTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.18, 0.22, 0.58, 12)), meeraCoatMat);
  meeraTorso.position.y = 0.68;
  meeraTorso.castShadow = true;
  meeraGroup.add(meeraTorso);

  // Belt accent
  const belt = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.38, 0.06, 0.38)), registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f })));
  belt.position.y = 0.62;
  meeraGroup.add(belt);

  const meeraHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), skinMat);
  meeraHead.position.y = 1.1;
  meeraHead.castShadow = true;
  meeraGroup.add(meeraHead);

  const meeraHair = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.17, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6)), brownHairMat);
  meeraHair.position.set(0, 1.15, 0);
  meeraGroup.add(meeraHair);

  // Sleek Ponytail
  const ponytail = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.04, 0.08, 0.28, 8)), brownHairMat);
  ponytail.rotation.x = Math.PI / 4;
  ponytail.position.set(0, 1.1, -0.18);
  meeraGroup.add(ponytail);

  // Shoulder Satchel
  const meeraBag = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.2, 0.22, 0.1)), registerMat(new THREE.MeshStandardMaterial({ color: 0x8ddcff })));
  meeraBag.position.set(-0.16, 0.55, -0.08);
  meeraGroup.add(meeraBag);

  // Arms holding printed travel schedule booklet
  const meeraLeftArm = new THREE.Group();
  meeraLeftArm.position.set(-0.22, 0.85, 0);
  const mLArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.055, 0.045, 0.36, 8)), meeraCoatMat);
  mLArmMesh.position.set(0.05, -0.14, 0.12);
  mLArmMesh.rotation.x = -Math.PI / 3;
  meeraLeftArm.add(mLArmMesh);
  meeraGroup.add(meeraLeftArm);

  const meeraRightArm = new THREE.Group();
  meeraRightArm.position.set(0.22, 0.85, 0);
  const mRArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.055, 0.045, 0.36, 8)), meeraCoatMat);
  mRArmMesh.position.set(-0.05, -0.14, 0.12);
  mRArmMesh.rotation.x = -Math.PI / 3;

  // Timetable brochure
  const timetable = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.16, 0.22, 0.01)), registerMat(new THREE.MeshBasicMaterial({ color: 0xffffff })));
  timetable.position.set(0, -0.28, 0.22);
  timetable.rotation.x = Math.PI / 6;
  meeraRightArm.add(mRArmMesh, timetable);
  meeraGroup.add(meeraRightArm);

  // Articulated legs
  const meeraLegs = createArticulatedLegs(meeraPantsMat, meeraGroup);
  group.add(meeraGroup);

  // =========================================================================
  // 3. PASSENGER 3: KABIR (Help Desk — x: -2.1, z: 0.55)
  // Electric blue puffer jacket, beige chinos, white sneakers, phone in hand
  // =========================================================================
  const kabirGroup = new THREE.Group();
  kabirGroup.position.set(-2.1, 0, 0.55);
  kabirGroup.rotation.y = -Math.PI / 3; // Faces northwest towards Help Desk counter

  const kabirJacketMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 }));
  const kabirPantsMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd4b896, roughness: 0.6 }));
  const whiteSneakerMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));

  const kabirTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.2, 0.23, 0.58, 12)), kabirJacketMat);
  kabirTorso.position.y = 0.68;
  kabirTorso.castShadow = true;
  kabirGroup.add(kabirTorso);

  const kabirHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), skinMat);
  kabirHead.position.y = 1.12;
  kabirHead.castShadow = true;
  kabirGroup.add(kabirHead);

  const kabirHair = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.22, 0.1, 0.22)), darkHairMat);
  kabirHair.position.set(0, 1.22, 0);
  kabirGroup.add(kabirHair);

  // Right arm reaching forward towards counter screen
  const kabirRightArm = new THREE.Group();
  kabirRightArm.position.set(0.22, 0.88, 0);
  const kArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), kabirJacketMat);
  kArmMesh.position.set(0, -0.15, 0.12);
  kArmMesh.rotation.x = -Math.PI / 3;
  const kHand = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.05, 8, 8)), skinMat);
  kHand.position.set(0, -0.34, 0.22);
  kabirRightArm.add(kArmMesh, kHand);
  kabirGroup.add(kabirRightArm);

  // Left arm holding smartphone
  const kabirLeftArm = new THREE.Group();
  kabirLeftArm.position.set(-0.22, 0.88, 0);
  const kLArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), kabirJacketMat);
  kLArmMesh.position.y = -0.18;
  const phone = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.06, 0.1, 0.01)), registerMat(new THREE.MeshBasicMaterial({ color: 0x111111 })));
  phone.position.set(0, -0.38, 0.04);
  kabirLeftArm.add(kLArmMesh, phone);
  kabirGroup.add(kabirLeftArm);

  // Articulated legs
  const kabirLegs = createArticulatedLegs(kabirPantsMat, kabirGroup, whiteSneakerMat);
  group.add(kabirGroup);

  // =========================================================================
  // 4. STATION CONCIERGE: AGENT PRIYA (behind Help Desk at x: -2.6, z: 0.1)
  // Purple railway vest over white shirt, ID badge, welcoming pose behind counter
  // =========================================================================
  const priyaGroup = new THREE.Group();
  priyaGroup.position.set(-2.6, 0, 0.1);
  priyaGroup.rotation.y = Math.PI / 4;

  const priyaVestMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.4 }));
  const priyaShirtMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }));

  const priyaTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.18, 0.21, 0.54, 12)), priyaVestMat);
  priyaTorso.position.y = 0.68;
  priyaGroup.add(priyaTorso);

  // ID Lanyard
  const lanyard = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.06, 0.08, 0.02)), registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f })));
  lanyard.position.set(0, 0.72, 0.2);
  priyaGroup.add(lanyard);

  const priyaHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.14, 12, 12)), skinMat);
  priyaHead.position.y = 1.08;
  priyaGroup.add(priyaHead);

  // Hair Bun
  const priyaHair = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)), darkHairMat);
  priyaHair.position.set(0, 1.12, 0);
  const bun = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.07, 10, 10)), darkHairMat);
  bun.position.set(0, 1.18, -0.12);
  priyaGroup.add(priyaHair, bun);

  // Articulated arms resting naturally on counter
  const priyaLArm = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.05, 0.045, 0.34, 8)), priyaShirtMat);
  priyaLArm.position.set(-0.2, 0.78, 0.14);
  priyaLArm.rotation.x = -Math.PI / 3;
  const priyaRArm = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.05, 0.045, 0.34, 8)), priyaShirtMat);
  priyaRArm.position.set(0.2, 0.78, 0.14);
  priyaRArm.rotation.x = -Math.PI / 3;
  priyaGroup.add(priyaLArm, priyaRArm);

  // Formal dark trousers
  createArticulatedLegs(registerMat(new THREE.MeshStandardMaterial({ color: 0x17131f })), priyaGroup);
  group.add(priyaGroup);

  // =========================================================================
  // 5. CONDUCTOR RAJIV (Platform 1 Boarding Gate at x: -0.8, z: -2.9)
  // Formal navy conductor uniform with brass buttons, peaked cap, clipboard
  // =========================================================================
  const rajivGroup = new THREE.Group();
  rajivGroup.position.set(-0.8, 0, -2.9);
  rajivGroup.rotation.y = 0; // Faces into concourse

  const rajivNavyMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 }));

  const rajivTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.2, 0.24, 0.64, 12)), rajivNavyMat);
  rajivTorso.position.y = 0.7;
  rajivTorso.castShadow = true;
  rajivGroup.add(rajivTorso);

  // Gold Brass Buttons
  for (const by of [0.8, 0.7, 0.6]) {
    const btn = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.015, 6, 6)), registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.9 })));
    btn.position.set(0, by, 0.22);
    rajivGroup.add(btn);
  }

  const rajivHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), skinMat);
  rajivHead.position.y = 1.15;
  rajivGroup.add(rajivHead);

  // Conductor Peaked Cap with Gold Braid & Visor
  const rajivCap = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 12)), rajivNavyMat);
  rajivCap.position.set(0, 1.26, 0);
  const rajivBrim = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.18, 0.02, 0.12)), registerMat(new THREE.MeshStandardMaterial({ color: 0x111111 })));
  rajivBrim.position.set(0, 1.23, 0.1);
  const goldBraid = new THREE.Mesh(registerGeo(new THREE.TorusGeometry(0.16, 0.015, 6, 16)), registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.8 })));
  goldBraid.rotation.x = Math.PI / 2;
  goldBraid.position.set(0, 1.23, 0);
  rajivGroup.add(rajivCap, rajivBrim, goldBraid);

  // Left arm holding manifest clipboard
  const rajivLeftArm = new THREE.Group();
  rajivLeftArm.position.set(-0.24, 0.88, 0);
  const rLArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), rajivNavyMat);
  rLArmMesh.position.set(0.05, -0.15, 0.1);
  rLArmMesh.rotation.x = -Math.PI / 4;
  const clipboard = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.16, 0.22, 0.015)), registerMat(new THREE.MeshStandardMaterial({ color: 0x8a5a36 })));
  clipboard.position.set(0.05, -0.3, 0.2);
  rajivLeftArm.add(rLArmMesh, clipboard);
  rajivGroup.add(rajivLeftArm);

  // Right arm at side with silver whistle
  const rajivRightArm = new THREE.Group();
  rajivRightArm.position.set(0.24, 0.88, 0);
  const rRArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), rajivNavyMat);
  rRArmMesh.position.y = -0.18;
  rajivRightArm.add(rRArmMesh);
  rajivGroup.add(rajivRightArm);

  // Articulated legs
  createArticulatedLegs(rajivNavyMat, rajivGroup);
  group.add(rajivGroup);

  // =========================================================================
  // 6. FRICTION VISION: GHOST FORENSIC REPLAY TRAILS & BEACONS
  // =========================================================================
  const ghostArjunPoints = [
    new THREE.Vector3(0.0, 0.04, 3.2),
    new THREE.Vector3(0.0, 0.04, 2.0),
    new THREE.Vector3(0.0, 0.04, 1.1),
    new THREE.Vector3(0.0, 0.04, 0.65), // Hesitation Freeze
  ];

  const ghostMeeraPoints = [
    new THREE.Vector3(0.6, 0.04, 1.2),
    new THREE.Vector3(1.6, 0.04, 0.2),
    new THREE.Vector3(2.3, 0.04, -0.3),
    new THREE.Vector3(2.3, 0.04, -0.85), // Confusion Pacing
  ];

  const ghostKabirPoints = [
    new THREE.Vector3(-0.6, 0.04, 2.0),
    new THREE.Vector3(-1.4, 0.04, 1.4),
    new THREE.Vector3(-2.1, 0.04, 0.8),
    new THREE.Vector3(-2.1, 0.04, 0.55), // Button Ambiguity Freeze
  ];

  const allGhostPaths = [
    { points: ghostArjunPoints, color: 0xff8a1f, active: !cluesFound.includes('kiosk') },
    { points: ghostMeeraPoints, color: 0xff3d8b, active: cluesFound.includes('kiosk') && !cluesFound.includes('board') },
    { points: ghostKabirPoints, color: 0x8ddcff, active: cluesFound.includes('board') && !cluesFound.includes('desk') },
  ];

  const ghostMeshes: THREE.Mesh[] = [];
  allGhostPaths.forEach((path) => {
    path.points.forEach((pt, idx) => {
      const discGeo = registerGeo(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16));
      const discMat = registerMat(
        new THREE.MeshStandardMaterial({
          color: path.color,
          emissive: path.color,
          emissiveIntensity: 0.6,
          roughness: 0.2,
          transparent: true,
          opacity: 0.75,
        })
      );
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(pt);
      ghostTrailGroup.add(disc);
      ghostMeshes.push(disc);

      if (idx < path.points.length - 1) {
        const nextPt = path.points[idx + 1];
        const lineMat = registerMat(
          new THREE.LineDashedMaterial({
            color: path.color,
            dashSize: 0.15,
            gapSize: 0.08,
            linewidth: 2,
          })
        );
        const lineGeo = registerGeo(new THREE.BufferGeometry().setFromPoints([pt, nextPt]));
        const line = new THREE.Line(lineGeo, lineMat);
        line.computeLineDistances();
        ghostTrailGroup.add(line);
      }
    });

    // Forensic Hesitation Beacon Ring
    const lastPt = path.points[path.points.length - 1];
    const beaconRingGeo = registerGeo(new THREE.RingGeometry(0.25, 0.45, 24));
    const beaconRingMat = registerMat(
      new THREE.MeshBasicMaterial({
        color: path.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      })
    );
    const beaconRing = new THREE.Mesh(beaconRingGeo, beaconRingMat);
    beaconRing.rotation.x = -Math.PI / 2;
    beaconRing.position.set(lastPt.x, 0.05, lastPt.z);
    ghostTrailGroup.add(beaconRing);
  });

  // =========================================================================
  // 7. BOARDING CLIMAX STATE & ANIMATION TICK
  // =========================================================================
  let isBoardingActive = false;
  let boardingProgress = 0;

  const triggerBoardingWalk = () => {
    isBoardingActive = true;
    boardingProgress = 0;
  };

  const update = (time: number, delta: number, isFrictionVision: boolean, isBoarding: boolean) => {
    // Friction Vision visibility
    ghostTrailGroup.visible = isFrictionVision;

    if (isFrictionVision) {
      // Pulse ghost trail discs
      ghostMeshes.forEach((mesh, i) => {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.4 + Math.sin(time * 5.0 + i) * 0.4;
      });
    }

    if (isBoarding || isBoardingActive) {
      boardingProgress = Math.min(1, boardingProgress + delta * 0.22);
      const walkCycle = Math.sin(boardingProgress * 35);

      // Arjun walks to train door at (-0.6, -3.1)
      arjunGroup.position.x = THREE.MathUtils.lerp(0.0, -0.6, boardingProgress);
      arjunGroup.position.z = THREE.MathUtils.lerp(0.65, -3.1, boardingProgress);
      arjunGroup.rotation.y = Math.PI;
      arjunLegs.leftLeg.rotation.x = walkCycle * 0.6;
      arjunLegs.rightLeg.rotation.x = -walkCycle * 0.6;

      // Meera walks to train coach 2 at (1.2, -3.1)
      meeraGroup.position.x = THREE.MathUtils.lerp(2.3, 1.2, boardingProgress);
      meeraGroup.position.z = THREE.MathUtils.lerp(-0.85, -3.1, boardingProgress);
      meeraGroup.rotation.y = Math.PI;
      meeraLegs.leftLeg.rotation.x = -walkCycle * 0.6;
      meeraLegs.rightLeg.rotation.x = walkCycle * 0.6;

      // Kabir walks to train door at (-1.8, -3.1)
      kabirGroup.position.x = THREE.MathUtils.lerp(-2.1, -1.8, boardingProgress);
      kabirGroup.position.z = THREE.MathUtils.lerp(0.55, -3.1, boardingProgress);
      kabirGroup.rotation.y = Math.PI;
      kabirLegs.leftLeg.rotation.x = walkCycle * 0.6;
      kabirLegs.rightLeg.rotation.x = -walkCycle * 0.6;
    } else {
      // Gentle natural idle breathing and head turns
      arjunLeftArm.rotation.z = Math.sin(time * 2.5) * 0.15;
      arjunHead.rotation.y = Math.sin(time * 1.5) * 0.2;

      meeraGroup.position.y = Math.sin(time * 2.0) * 0.015;
      meeraHead.rotation.x = Math.sin(time * 1.8) * 0.1 - 0.2; // Gazes up at board

      kabirRightArm.rotation.y = Math.sin(time * 3.0) * 0.1; // Reaching toward screen
      kabirHead.rotation.y = Math.sin(time * 1.6) * 0.15;

      rajivGroup.position.y = Math.sin(time * 1.4) * 0.008;
    }
  };

  const dispose = () => {
    scene.remove(group);
    scene.remove(ghostTrailGroup);
    disposables.forEach((d) => d.dispose());
  };

  return {
    group,
    ghostTrailGroup,
    update,
    triggerBoardingWalk,
    dispose,
  };
}
