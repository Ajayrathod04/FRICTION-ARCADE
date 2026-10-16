import React, { useState, useEffect } from 'react';
import { StationContainer } from '../station/StationContainer';
import { ClueModal } from '../friction/ClueModal';
import { BookingFlowBefore } from '../mission/BookingFlowBefore';
import { RepairModal } from '../repair-lab/RepairModal';
import { BookingFlowAfter } from '../mission/BookingFlowAfter';
import { ResultsModal } from '../results/ResultsModal';
import { CharacterSelectModal } from '../landing/CharacterSelectModal';
import { IntroTutorialModal } from '../mission/IntroTutorialModal';
import { StationMapModal } from '../station/StationMapModal';
import { NPCModal } from '../station/NPCModal';
import { DuoJamModal } from '../coop/DuoJamModal';
import { Icons } from '../../components/ui/Icons';
import { announce } from '../../lib/a11y';
import { saveGameResults, loadGameResults } from '../../lib/storage';
import type { GameResults } from '../../lib/storage';
import type { StationNPC } from '../../data/missionData';
import { AVATAR_CHOICES } from '../../data/missionData';

interface GamePageProps {
  onExitToHome: () => void;
  initialMode?: '2d' | '3d';
}

export const GamePage: React.FC<GamePageProps> = ({
  onExitToHome,
  initialMode = '3d',
}) => {
  // Game loop stage: 'station' | 'booking_before' | 'designer_mode' | 'booking_after'
  const [gameStage, setGameStage] = useState<'station' | 'booking_before' | 'designer_mode' | 'booking_after'>('station');

  // Avatar Selection
  const [selectedAvatarId, setSelectedAvatarId] = useState<'explorer' | 'creative' | 'analyst'>('explorer');
  const [showCharSelect, setShowCharSelect] = useState<boolean>(true); // Prompt character selection upon game entry

  // Intro Briefing & Controls Tutorial
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Concourse Map & Station Overlays
  const [showStationMap, setShowStationMap] = useState<boolean>(false);
  const [activeNPC, setActiveNPC] = useState<StationNPC | null>(null);
  const [missionHint, setMissionHint] = useState<string | null>(null);

  // Duo Jam Cooperative Mode
  const [showDuoJam, setShowDuoJam] = useState<boolean>(false);

  // Clues & Repairs
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [repairsCompleted, setRepairsCompleted] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<'kiosk' | 'board' | 'desk' | null>(null);
  const [repairsComplete, setRepairsComplete] = useState<boolean>(false);

  // Telemetry Recording Actual User Performance
  const [beforeTime, setBeforeTime] = useState<number>(0);
  const [beforeErrors, setBeforeErrors] = useState<number>(0);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // 2D vs 3D Mode
  const [is2D, setIs2D] = useState<boolean>(initialMode === '2d');

  useEffect(() => {
    announce('Entered Friction Station Game. Choose your traveler avatar.');
    const saved = loadGameResults();
    if (saved) {
      setGameResults(saved);
    }
  }, []);

  const currentAvatar = AVATAR_CHOICES.find((a) => a.id === selectedAvatarId) || AVATAR_CHOICES[0];

  const handleSelectHotspot = (hotspotId: 'kiosk' | 'board' | 'desk') => {
    setActiveHotspot(hotspotId);
    announce(`Selected station hotspot: ${hotspotId}`);
  };

  const handleCollectClue = (clueId: string) => {
    if (!cluesFound.includes(clueId)) {
      const updated = [...cluesFound, clueId];
      setCluesFound(updated);
      announce(`Clue sticker collected: ${clueId}. ${updated.length} of 3 found.`);
    }
  };

  const handleShowHint = () => {
    const hints = [
      'Checkpoint 1 (Kiosk): Inspect why disappearing placeholder text obscures input labels.',
      'Checkpoint 2 (Departure Board): Observe how color-only flags fail to explain delay reasons.',
      'Checkpoint 3 (Help Desk): Notice how competing actions with equal weight confuse choices.',
    ];
    const hintText = cluesFound.length < 3
      ? hints[cluesFound.length]
      : 'All 3 clues found! Launch the booking challenge from your PDA or the Kiosk.';
    setMissionHint(hintText);
    setTimeout(() => setMissionHint(null), 5000);
  };

  // Stage C completion
  const handleBeforeComplete = (elapsedSec: number, errorCount: number) => {
    setBeforeTime(elapsedSec);
    setBeforeErrors(errorCount);
    announce('Stage C complete. Transitioning to Designer Mode.');
    setGameStage('designer_mode');
  };

  const handleRepairApplied = (repairId: string) => {
    if (!repairsCompleted.includes(repairId)) {
      const updated = [...repairsCompleted, repairId];
      setRepairsCompleted(updated);
      announce(`Clarity Mode update: Station part '${repairId}' upgraded to accessible design.`);
    }
  };

  // Stage D completion
  const handleRepairsComplete = () => {
    setRepairsCompleted(['labels', 'errors', 'actions']);
    setRepairsComplete(true);
    announce('All repairs successfully applied! Launching improved booking flow.');
    setGameStage('booking_after');
  };

  // Stage E completion
  const handleAfterComplete = (elapsedSec: number, errorCount: number) => {
    const finalResults: GameResults = {
      beforeTimeSec: beforeTime || 78,
      beforeErrors: beforeErrors || 3,
      afterTimeSec: elapsedSec,
      afterErrors: errorCount,
      cluesFound,
      repairsCompleted: ['labels', 'errors', 'actions'],
      completedAt: new Date().toISOString(),
    };
    setGameResults(finalResults);
    saveGameResults(finalResults);
    announce('Mission complete! Results ready for review.');
    setGameStage('station');
    setShowResults(true);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setCluesFound([]);
    setRepairsCompleted([]);
    setRepairsComplete(false);
    setBeforeTime(0);
    setBeforeErrors(0);
    setGameStage('station');
    announce('Resetting mission. Let us test the flow again.');
  };

  return (
    <div className="game-route-root" role="region" aria-label="Friction Arcade Playable Game">
      {/* ---------------- GAMEPLAY TOP CONTROL BAR ---------------- */}
      <header className="game-top-bar" role="banner">
        <div className="game-top-bar__left">
          <button
            type="button"
            className="game-exit-btn"
            onClick={onExitToHome}
            aria-label="Exit to landing website"
          >
            ← Exit to Home
          </button>
          <div className="game-mission-pill">
            <Icons.Train size={16} color="#FFD23F" />
            <span className="game-mission-title">MISSION 01: THE LAST TICKET</span>
            <span className="game-route-badge">MUMBAI ➔ PUNE</span>
          </div>
        </div>

        <div className="game-top-bar__right">
          {/* Avatar Switcher */}
          <button
            type="button"
            className="game-avatar-pill"
            onClick={() => setShowCharSelect(true)}
            title="Change traveler avatar"
          >
            <span className="avatar-dot" style={{ backgroundColor: currentAvatar.jacketCss }} />
            <span>{currentAvatar.name}</span>
            <span className="avatar-switch-hint">✎</span>
          </button>

          {/* 2D vs 3D Mode Toggle */}
          <button
            type="button"
            className="game-mode-toggle"
            onClick={() => setIs2D(!is2D)}
            aria-label={is2D ? 'Switch to 3D Station' : 'Switch to Accessible 2D View'}
          >
            {is2D ? 'Switch to 3D' : 'Accessible 2D Mode'}
          </button>

          {/* Co-op Mode Trigger */}
          <button
            type="button"
            className="game-coop-btn"
            onClick={() => setShowDuoJam(true)}
            title="Local 2-Player Cooperative Mode"
          >
            👥 Duo Jam
          </button>

          {/* Map Shortcut */}
          <button
            type="button"
            className="game-hud-icon-btn"
            onClick={() => setShowStationMap(true)}
            title="Station Map (M)"
          >
            🗺 Map
          </button>

          {/* Controls Tutorial Shortcut */}
          <button
            type="button"
            className="game-hud-icon-btn"
            onClick={() => setShowTutorial(true)}
            title="Controls & Objectives"
          >
            ❓ Guide
          </button>
        </div>
      </header>

      {/* ---------------- MAIN GAMEPLAY STAGE ---------------- */}
      <main className="game-stage-container">
        {gameStage === 'station' && (
          <div className="game-station-fullscreen">
            <StationContainer
              onSelectHotspot={handleSelectHotspot}
              cluesFound={cluesFound}
              repairsCompleted={repairsCompleted}
              repairsComplete={repairsComplete}
              activeHotspot={activeHotspot}
              force2D={is2D}
              onToggle2D={() => setIs2D(!is2D)}
              selectedAvatarId={selectedAvatarId}
              onTalkToNPC={(npc) => setActiveNPC(npc)}
              onToggleMap={() => setShowStationMap((prev) => !prev)}
              onShowHint={handleShowHint}
              onLaunchBookingChallenge={() => setGameStage('booking_before')}
              onOpenHowToPlay={() => setShowTutorial(true)}
              onOpenDuoJam={() => setShowDuoJam(true)}
              onOpenDesignLab={onExitToHome}
            />
          </div>
        )}

        {/* Stage C: Frustrating Booking Challenge (BEFORE) */}
        {gameStage === 'booking_before' && (
          <div className="game-task-stage">
            <BookingFlowBefore
              onComplete={handleBeforeComplete}
              onCancel={() => setGameStage('station')}
            />
          </div>
        )}

        {/* Stage E: Improved Accessible Booking Flow (AFTER) */}
        {gameStage === 'booking_after' && (
          <div className="game-task-stage">
            <BookingFlowAfter
              onComplete={handleAfterComplete}
              onBackToStation={() => setGameStage('station')}
            />
          </div>
        )}
      </main>

      {/* ---------------- GAME MODALS & OVERLAYS ---------------- */}
      {/* Floating In-Game Hint Toast */}
      {missionHint && (
        <div className="mission-hint-toast" role="status" aria-live="polite">
          <Icons.Sparkle size={18} color="#FFD23F" />
          <span>{missionHint}</span>
        </div>
      )}

      {/* Screen 02: Character Selection Modal */}
      <CharacterSelectModal
        isOpen={showCharSelect}
        onClose={() => setShowCharSelect(false)}
        selectedAvatarId={selectedAvatarId}
        onSelectAvatar={(id) => setSelectedAvatarId(id)}
        onEnterStation={() => {
          setShowCharSelect(false);
          setShowTutorial(true);
        }}
      />

      {/* Screen 03: Controls & Objectives Briefing Modal */}
      <IntroTutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onStartExploring={() => setShowTutorial(false)}
      />

      {/* Screen 04: Overhead Concourse Schematic Map */}
      <StationMapModal
        isOpen={showStationMap}
        onClose={() => setShowStationMap(false)}
        cluesFound={cluesFound}
        onSelectHotspot={(hotspot) => {
          setShowStationMap(false);
          handleSelectHotspot(hotspot);
        }}
      />

      {/* In-World NPC Dialogue Modal */}
      <NPCModal
        npc={activeNPC}
        isOpen={!!activeNPC}
        onClose={() => setActiveNPC(null)}
      />

      {/* Duo Design Jam Cooperative Mode Modal */}
      <DuoJamModal
        isOpen={showDuoJam}
        onClose={() => setShowDuoJam(false)}
        onStartCoop={() => setShowDuoJam(false)}
      />

      {/* Screen 05: Clue Forensic Modals */}
      <ClueModal
        hotspotId={activeHotspot}
        isOpen={!!activeHotspot}
        onClose={() => setActiveHotspot(null)}
        onCollectClue={handleCollectClue}
        onStartBooking={() => {
          setActiveHotspot(null);
          setGameStage('booking_before');
        }}
        cluesFound={cluesFound}
      />

      {/* Screen 07: Designer Mode Interactive Repair Puzzles */}
      <RepairModal
        isOpen={gameStage === 'designer_mode'}
        onClose={() => setGameStage('station')}
        onRepairApplied={handleRepairApplied}
        onAllRepairsComplete={handleRepairsComplete}
      />

      {/* Screen 10: Results & Personal Best Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={gameResults}
        onPlayAgain={handlePlayAgain}
        onOpenDesignLab={onExitToHome}
      />
    </div>
  );
};
