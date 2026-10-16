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

  // =========================================================================
  // 1. PASSENGER 1: ARJUN (Ticket Kiosk — x: 0.0, z: 0.65)
  // =========================================================================
  const arjunGroup = new THREE.Group();
  arjunGroup.position.set(0.0, 0, 0.65);
  arjunGroup.rotation.y = Math.PI; // Faces north toward kiosk

  const arjunJacketMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x3b6e47, roughness: 0.5 }));
  const arjunSkinMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xe8ba96, roughness: 0.5 }));
  const arjunHairMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }));
  const arjunPantsMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.6 }));

  const arjunTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.2, 0.23, 0.65, 12)), arjunJacketMat);
  arjunTorso.position.y = 0.65;
  arjunTorso.castShadow = true;
  arjunGroup.add(arjunTorso);

  const arjunHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.16, 12, 12)), arjunSkinMat);
  arjunHead.position.y = 1.15;
  arjunHead.castShadow = true;
  arjunGroup.add(arjunHead);

  const arjunHair = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.24, 0.12, 0.24)), arjunHairMat);
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
  arjunLeftArm.add(aArmMesh);
  arjunGroup.add(arjunLeftArm);

  // Pants & Legs
  const aLeftLeg = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.065, 0.055, 0.38, 8)), arjunPantsMat);
  aLeftLeg.position.set(-0.09, 0.19, 0);
  arjunGroup.add(aLeftLeg);

  const aRightLeg = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.065, 0.055, 0.38, 8)), arjunPantsMat);
  aRightLeg.position.set(0.09, 0.19, 0);
  arjunGroup.add(aRightLeg);

  group.add(arjunGroup);

  // =========================================================================
  // 2. PASSENGER 2: MEERA (Departure Board — x: 2.3, z: -0.85)
  // =========================================================================
  const meeraGroup = new THREE.Group();
  meeraGroup.position.set(2.3, 0, -0.85);
  meeraGroup.rotation.y = Math.PI * 0.85; // Gazes up at departure board

  const meeraJacketMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xd946ef, roughness: 0.4 }));
  const meeraSkinMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf5d0b0, roughness: 0.5 }));
  const meeraHairMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x2b1d14, roughness: 0.7 }));

  const meeraTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.18, 0.22, 0.62, 12)), meeraJacketMat);
  meeraTorso.position.y = 0.62;
  meeraTorso.castShadow = true;
  meeraGroup.add(meeraTorso);

  const meeraHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), meeraSkinMat);
  meeraHead.position.y = 1.1;
  meeraHead.castShadow = true;
  meeraGroup.add(meeraHead);

  const meeraHair = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.17, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.6)), meeraHairMat);
  meeraHair.position.set(0, 1.15, 0);
  meeraGroup.add(meeraHair);

  // Ponytail
  const ponytail = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.04, 0.08, 0.28, 8)), meeraHairMat);
  ponytail.rotation.x = Math.PI / 4;
  ponytail.position.set(0, 1.1, -0.18);
  meeraGroup.add(ponytail);

  // Sky-blue satchel
  const meeraBag = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.2, 0.22, 0.1)), registerMat(new THREE.MeshStandardMaterial({ color: 0x8ddcff })));
  meeraBag.position.set(-0.16, 0.55, -0.08);
  meeraGroup.add(meeraBag);

  group.add(meeraGroup);

  // =========================================================================
  // 3. PASSENGER 3: KABIR (Help Desk — x: -2.1, z: 0.55)
  // =========================================================================
  const kabirGroup = new THREE.Group();
  kabirGroup.position.set(-2.1, 0, 0.55);
  kabirGroup.rotation.y = -Math.PI / 3; // Faces northwest towards Help Desk counter

  const kabirJacketMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 }));
  const kabirSkinMat = registerMat(new THREE.MeshStandardMaterial({ color: 0xf0cbb0, roughness: 0.5 }));
  const kabirHairMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.7 }));

  const kabirTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.19, 0.23, 0.65, 12)), kabirJacketMat);
  kabirTorso.position.y = 0.65;
  kabirTorso.castShadow = true;
  kabirGroup.add(kabirTorso);

  const kabirHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), kabirSkinMat);
  kabirHead.position.y = 1.12;
  kabirHead.castShadow = true;
  kabirGroup.add(kabirHead);

  const kabirHair = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.22, 0.1, 0.22)), kabirHairMat);
  kabirHair.position.set(0, 1.22, 0);
  kabirGroup.add(kabirHair);

  // Right arm reaching forward towards counter screen
  const kabirRightArm = new THREE.Group();
  kabirRightArm.position.set(0.22, 0.88, 0);
  const kArmMesh = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 8)), kabirJacketMat);
  kArmMesh.position.set(0, -0.15, 0.12);
  kArmMesh.rotation.x = -Math.PI / 3;
  kabirRightArm.add(kArmMesh);
  kabirGroup.add(kabirRightArm);

  group.add(kabirGroup);

  // =========================================================================
  // 4. STATION CONCIERGE: AGENT PRIYA (behind Help Desk at x: -2.6, z: 0.1)
  // =========================================================================
  const priyaGroup = new THREE.Group();
  priyaGroup.position.set(-2.6, 0.45, 0.1);
  priyaGroup.rotation.y = Math.PI / 4;

  const priyaVestMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x6b21a8, roughness: 0.4 }));
  const priyaTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.17, 0.2, 0.52, 12)), priyaVestMat);
  priyaTorso.position.y = 0.26;
  priyaGroup.add(priyaTorso);

  const priyaHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.14, 12, 12)), arjunSkinMat);
  priyaHead.position.y = 0.65;
  priyaGroup.add(priyaHead);

  const priyaHair = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55)), arjunHairMat);
  priyaHair.position.set(0, 0.7, 0);
  priyaGroup.add(priyaHair);

  group.add(priyaGroup);

  // =========================================================================
  // 5. CONDUCTOR RAJIV (Platform 1 Boarding Gate at x: -0.8, z: -2.9)
  // =========================================================================
  const rajivGroup = new THREE.Group();
  rajivGroup.position.set(-0.8, 0, -2.9);
  rajivGroup.rotation.y = 0; // Faces into concourse

  const rajivNavyMat = registerMat(new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35 }));
  const rajivTorso = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.2, 0.24, 0.68, 12)), rajivNavyMat);
  rajivTorso.position.y = 0.65;
  rajivTorso.castShadow = true;
  rajivGroup.add(rajivTorso);

  const rajivHead = new THREE.Mesh(registerGeo(new THREE.SphereGeometry(0.15, 12, 12)), arjunSkinMat);
  rajivHead.position.y = 1.15;
  rajivGroup.add(rajivHead);

  // Conductor Peaked Cap with Gold Braid
  const rajivCap = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.17, 0.17, 0.08, 12)), rajivNavyMat);
  rajivCap.position.set(0, 1.26, 0);
  const rajivBrim = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.18, 0.02, 0.12)), registerMat(new THREE.MeshStandardMaterial({ color: 0x111111 })));
  rajivBrim.position.set(0, 1.23, 0.1);
  const goldBraid = new THREE.Mesh(registerGeo(new THREE.TorusGeometry(0.16, 0.015, 6, 16)), registerMat(new THREE.MeshStandardMaterial({ color: 0xffd23f, metalness: 0.8 })));
  goldBraid.rotation.x = Math.PI / 2;
  goldBraid.position.set(0, 1.23, 0);
  rajivGroup.add(rajivCap, rajivBrim, goldBraid);

  group.add(rajivGroup);

  // =========================================================================
  // 6. FRICTION VISION: GHOST FORENSIC REPLAY TRAILS & BEACONS
  // =========================================================================
  // Authoritative Ghost Waypoint Paths for each passenger
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
          transparent: true,
          opacity: 0.8,
        })
      );
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.copy(pt);
      ghostTrailGroup.add(disc);
      ghostMeshes.push(disc);

      // Connect with line
      if (idx > 0) {
        const prev = path.points[idx - 1];
        const lineGeo = registerGeo(new THREE.BufferGeometry().setFromPoints([prev, pt]));
        const lineMat = registerMat(new THREE.LineDashedMaterial({ color: path.color, dashSize: 0.2, gapSize: 0.1, linewidth: 2 }));
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
      boardingProgress = Math.min(1, boardingProgress + delta * 0.25);
      // Arjun walks to train door at (-0.6, -3.1)
      arjunGroup.position.x = THREE.MathUtils.lerp(0.0, -0.6, boardingProgress);
      arjunGroup.position.z = THREE.MathUtils.lerp(0.65, -3.1, boardingProgress);
      arjunGroup.rotation.y = Math.PI;

      // Meera walks to train coach 2 at (1.2, -3.1)
      meeraGroup.position.x = THREE.MathUtils.lerp(2.3, 1.2, boardingProgress);
      meeraGroup.position.z = THREE.MathUtils.lerp(-0.85, -3.1, boardingProgress);

      // Kabir walks to train door at (-1.8, -3.1)
      kabirGroup.position.x = THREE.MathUtils.lerp(-2.1, -1.8, boardingProgress);
      kabirGroup.position.z = THREE.MathUtils.lerp(0.55, -3.1, boardingProgress);
    } else {
      // Gentle natural idle animations
      arjunLeftArm.rotation.z = Math.sin(time * 2.5) * 0.15;
      arjunHead.rotation.y = Math.sin(time * 1.5) * 0.2;

      meeraGroup.position.y = Math.sin(time * 2.0) * 0.015;
      meeraHead.rotation.x = Math.sin(time * 1.8) * 0.1 - 0.2; // Looks up at board

      kabirRightArm.rotation.y = Math.sin(time * 3.0) * 0.1; // Hesitating hand
      kabirHead.rotation.y = Math.sin(time * 1.6) * 0.15;
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
