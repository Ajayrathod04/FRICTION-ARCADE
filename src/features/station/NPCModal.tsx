import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';
import type { StationNPC } from '../../data/missionData';

interface NPCModalProps {
  npc: StationNPC | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NPCModal: React.FC<NPCModalProps> = ({ npc, isOpen, onClose }) => {
  if (!npc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`TALKING TO: ${npc.name.toUpperCase()}`}
      badge={npc.role.toUpperCase()}
      maxWidth="540px"
    >
      <div className="npc-dialog-content">
        <div className="npc-speaker-card">
          <div className="npc-avatar-icon">
            <Icons.User size={32} color="#FF8A1F" />
          </div>
          <div className="npc-speaker-meta">
            <strong className="npc-speaker-name">{npc.name}</strong>
            <span className="npc-speaker-role">{npc.role} · Friction Station</span>
          </div>
        </div>

        <div className="npc-speech-bubble">
          <p className="npc-speech-text">“{npc.dialogue}”</p>
        </div>

        <div className="npc-tip-card">
          <div className="npc-tip-header">
            <Icons.Sparkle size={18} color="#059669" />
            <Badge variant="sticker" color="#B6FFB2" rotate={-1}>
              TRAVELER UX TIP
            </Badge>
          </div>
          <p className="npc-tip-text">{npc.tip}</p>
        </div>

        <div className="npc-modal-footer">
          <Button variant="primary" size="md" onClick={onClose}>
            Thanks! (Enter)
          </Button>
        </div>
      </div>
    </Modal>
  );
};
