import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import { AVATAR_CHOICES } from '../../data/missionData';

interface CharacterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatarId: 'explorer' | 'creative' | 'analyst';
  onSelectAvatar: (avatarId: 'explorer' | 'creative' | 'analyst') => void;
  onEnterStation: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  isOpen,
  onClose,
  selectedAvatarId,
  onSelectAvatar,
  onEnterStation,
}) => {
  const [activeId, setActiveId] = useState<'explorer' | 'creative' | 'analyst'>(selectedAvatarId);
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveId(selectedAvatarId);
  }, [selectedAvatarId]);

  // Mini 3D Turntable preview of the currently selected character
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;
    const container = previewCanvasRef.current;
    const width = container.clientWidth || 220;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x211838);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 2.8);
    camera.lookAt(0, 0.7, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xfff3e0, 1.4);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffbe60, 2.2);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x8ddcff, 1.5);
    rimLight.position.set(-2, 3, -2);
    scene.add(rimLight);

    const charConfig = AVATAR_CHOICES.find((a) => a.id === activeId) || AVATAR_CHOICES[0];

    // Character Group
    const charGroup = new THREE.Group();

    // Hoodie / Jacket
    const jacketMat = new THREE.MeshStandardMaterial({ color: charConfig.jacketColor, roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.7, 16), jacketMat);
    body.position.y = 0.65;
    charGroup.add(body);

    // Head
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf8d7b8, roughness: 0.5 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), skinMat);
    head.position.y = 1.15;
    charGroup.add(head);

    // Hairstyle
    const hairMat = new THREE.MeshStandardMaterial({ color: charConfig.hairColor, roughness: 0.6 });
    if (charConfig.hairStyle === 'topknot') {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      crown.position.set(0, 1.2, 0);
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), hairMat);
      knot.position.set(0, 1.38, -0.05);
      charGroup.add(crown, knot);
    } else if (charConfig.hairStyle === 'parted') {
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      crown.position.set(0, 1.2, 0);
      const sideSlick = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.25), hairMat);
      sideSlick.position.set(0.1, 1.28, 0);
      sideSlick.rotation.z = -0.3;
      charGroup.add(crown, sideSlick);
    } else {
      // Tousled locks
      const crown = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
      crown.position.set(0, 1.2, 0);
      const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.14, 6), hairMat);
      tuft.rotation.x = -Math.PI / 3;
      tuft.position.set(0, 1.25, 0.15);
      charGroup.add(crown, tuft);
    }

    // Backpack
    const packMat = new THREE.MeshStandardMaterial({ color: charConfig.backpackColor, roughness: 0.35 });
    const pack = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.2), packMat);
    pack.position.set(0, 0.68, -0.25);
    charGroup.add(pack);

    // Legs
    const pantsMat = new THREE.MeshStandardMaterial({ color: charConfig.pantsColor, roughness: 0.6 });
    for (const lx of [-0.12, 0.12]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8), pantsMat);
      leg.position.set(lx, 0.2, 0);
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      shoe.position.set(lx, 0.04, 0.04);
      charGroup.add(leg, shoe);
    }

    // Suitcase for Explorer
    if (charConfig.id === 'explorer') {
      const luggage = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.44, 0.28), new THREE.MeshStandardMaterial({ color: 0xff3d8b }));
      luggage.position.set(0.42, 0.22, -0.05);
      charGroup.add(luggage);
    }

    // Pedestal disk
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.7, 0.06, 24),
      new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xff8a1f, emissiveIntensity: 0.3 })
    );
    disc.position.y = -0.03;
    charGroup.add(disc);

    scene.add(charGroup);

    let frameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      charGroup.rotation.y = t * 1.4;
      charGroup.position.y = Math.sin(t * 2.5) * 0.04;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.replaceChildren();
      }
    };
  }, [isOpen, activeId]);

  const handleSelect = (id: 'explorer' | 'creative' | 'analyst') => {
    setActiveId(id);
    onSelectAvatar(id);
  };

  const handleConfirm = () => {
    onSelectAvatar(activeId);
    onEnterStation();
    onClose();
  };

  const currentSelection = AVATAR_CHOICES.find((a) => a.id === activeId) || AVATAR_CHOICES[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CHOOSE YOUR TRAVELER"
      badge="SCREEN 02 · AVATAR SELECT"
      maxWidth="780px"
    >
      <div className="char-select-modal-content">
        <p className="char-select-subtext">
          Select your playable protagonist for <strong>Friction Station</strong>. All avatars share the exact same movement speed and gameplay capabilities.
        </p>

        <div className="char-select-layout">
          {/* Left: 3D Turntable Preview */}
          <div className="char-preview-pane">
            <div className="char-canvas-box" ref={previewCanvasRef} />
            <div className="char-preview-meta">
              <span className="char-preview-name">{currentSelection.name}</span>
              <span className="char-preview-role">{currentSelection.role}</span>
              <Badge variant="sticker" color="#FFD23F" rotate={-1}>
                {currentSelection.accessories}
              </Badge>
            </div>
          </div>

          {/* Right: Avatar Choice Cards */}
          <div className="char-choices-list" role="radiogroup" aria-label="Traveler Avatar Choices">
            {AVATAR_CHOICES.map((avatar) => {
              const isSelected = activeId === avatar.id;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  className={`char-choice-card ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(avatar.id)}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className="char-card-swatches">
                    <span className="swatch" style={{ backgroundColor: avatar.jacketCss }} title="Jacket color" />
                    <span className="swatch" style={{ backgroundColor: avatar.backpackCss }} title="Backpack color" />
                  </div>
                  <div className="char-card-info">
                    <div className="char-card-top">
                      <strong className="char-card-title">{avatar.name}</strong>
                      <span className="char-card-role-tag">{avatar.role}</span>
                    </div>
                    <p className="char-card-desc">{avatar.description}</p>
                    <span className="char-card-tagline">“{avatar.tagline}”</span>
                  </div>
                  {isSelected && (
                    <div className="char-check-badge">
                      <Icons.Check size={18} color="#FFFFFF" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="char-select-footer">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleConfirm}
            icon={<Icons.Sparkle size={20} color="#FFFFFF" />}
          >
            ENTER THE STATION →
          </Button>
        </div>
      </div>
    </Modal>
  );
};
