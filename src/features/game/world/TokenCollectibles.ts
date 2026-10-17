import * as THREE from 'three';
import { FRICTION_TOKENS } from '../../../data/missionData';
import { RewardLedger } from '../state/RewardLedger';
import { SoundEffects } from '../../../lib/audio';

export interface TokenCollectibleItem {
  id: string;
  meshGroup: THREE.Group;
  baseY: number;
  isCollected: boolean;
  x: number;
  z: number;
}

export interface TokenCollectiblesHandles {
  tokenGroup: THREE.Group;
  update: (playerPos: THREE.Vector3, time: number, delta: number) => { collectedId: string | null };
  dispose: () => void;
}

export function createTokenCollectibles(scene: THREE.Scene): TokenCollectiblesHandles {
  const disposables: Array<{ dispose: () => void }> = [];
  const tokenGroup = new THREE.Group();
  scene.add(tokenGroup);

  const regGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    disposables.push(g);
    return g;
  };
  const regMat = <T extends THREE.Material>(m: T): T => {
    disposables.push(m);
    return m;
  };

  // Shared token geometries & materials
  const coinGeo = regGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24));
  const starGeo = regGeo(new THREE.BoxGeometry(0.12, 0.12, 0.08));
  const glowRingGeo = regGeo(new THREE.RingGeometry(0.28, 0.38, 24));

  const coinMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xffd23f, // Golden sun
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0xff8a1f,
      emissiveIntensity: 0.35,
    })
  );

  const starMat = regMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.8,
    })
  );

  const glowRingMat = regMat(
    new THREE.MeshBasicMaterial({
      color: 0xffd23f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    })
  );

  const tokenItems: TokenCollectibleItem[] = [];

  FRICTION_TOKENS.forEach((t) => {
    const isAlreadyCollected = RewardLedger.isTokenCollected(t.id);
    const itemGroup = new THREE.Group();
    itemGroup.position.set(t.x, 0.6, t.z);

    if (!isAlreadyCollected) {
      // Main spinning coin (rotated to stand upright)
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      coinMesh.rotation.x = Math.PI / 2;

      // Sparkling star in center
      const starMesh = new THREE.Mesh(starGeo, starMat);
      starMesh.rotation.z = Math.PI / 4;

      // Floating luminous base halo
      const ringMesh = new THREE.Mesh(glowRingGeo, glowRingMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = -0.4;

      itemGroup.add(coinMesh, starMesh, ringMesh);
      tokenGroup.add(itemGroup);
    }

    tokenItems.push({
      id: t.id,
      meshGroup: itemGroup,
      baseY: 0.6,
      isCollected: isAlreadyCollected,
      x: t.x,
      z: t.z,
    });
  });

  const update = (playerPos: THREE.Vector3, time: number, delta: number): { collectedId: string | null } => {
    let justCollectedId: string | null = null;

    tokenItems.forEach((item) => {
      if (item.isCollected) return;

      // Hover and spin animation
      item.meshGroup.rotation.y += delta * 2.5;
      item.meshGroup.position.y = item.baseY + Math.sin(time * 3.5 + item.x) * 0.08;

      // Distance check to player
      const dist = Math.hypot(playerPos.x - item.x, playerPos.z - item.z);
      if (dist < 1.15) {
        // Collect token!
        item.isCollected = true;
        RewardLedger.collectToken(item.id);
        try {
          SoundEffects.playCollect();
        } catch {
          // audio fallback
        }
        justCollectedId = item.id;

        // Pop shrink animation before removal
        item.meshGroup.scale.set(1.4, 1.4, 1.4);
        setTimeout(() => {
          tokenGroup.remove(item.meshGroup);
        }, 150);
      }
    });

    return { collectedId: justCollectedId };
  };

  const dispose = () => {
    scene.remove(tokenGroup);
    disposables.forEach((d) => d.dispose());
  };

  return {
    tokenGroup,
    update,
    dispose,
  };
}
