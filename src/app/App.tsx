import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { StationContainer } from '../features/station/StationContainer';
import { ClueModal } from '../features/friction/ClueModal';
import { BookingFlowBefore } from '../features/mission/BookingFlowBefore';
import { RepairModal } from '../features/repair-lab/RepairModal';
import { BookingFlowAfter } from '../features/mission/BookingFlowAfter';
import { ResultsModal } from '../features/results/ResultsModal';
import { HowItWorks } from '../components/HowItWorks';
import { MeetTheStation } from '../components/MeetTheStation';
import { DesignRulesSection } from '../components/DesignRulesSection';
import { DesignLabSection } from '../features/repair-lab/DesignLabSection';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Icons } from '../components/ui/Icons';
import { announce } from '../lib/a11y';
import { saveGameResults, loadGameResults } from '../lib/storage';
import type { GameResults } from '../lib/storage';

export const App: React.FC = () => {
  // Game loop states: 'idle' | 'booking_before' | 'designer_mode' | 'booking_after'
  const [gameStage, setGameStage] = useState<'idle' | 'booking_before' | 'designer_mode' | 'booking_after'>('idle');

  // Clues & repairs state
  const [cluesFound, setCluesFound] = useState<string[]>([]);
  const [repairsCompleted, setRepairsCompleted] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<'kiosk' | 'board' | 'desk' | null>(null);
  const [repairsComplete, setRepairsComplete] = useState<boolean>(false);

  // Telemetry recording actual user performance
  const [beforeTime, setBeforeTime] = useState<number>(0);
  const [beforeErrors, setBeforeErrors] = useState<number>(0);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

  // 2D vs 3D accessible mode
  const [is2D, setIs2D] = useState<boolean>(false);

  useEffect(() => {
    // Announce initial screen to assistive technology
    announce('Friction Arcade loaded. Spot the friction, fix the flow. Interactive 3D transit station available.');
    const saved = loadGameResults();
    if (saved) {
      setGameResults(saved);
    }
  }, []);

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

  const handleStartMission = () => {
    announce('Starting mission. Opening Ticket Kiosk booking challenge.');
    setGameStage('booking_before');
    const el = document.getElementById('playable-area');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartWithout3D = () => {
    setIs2D(true);
    handleStartMission();
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
    setGameStage('idle');
    setShowResults(true);
  };

  const handlePlayAgain = () => {
    setShowResults(false);
    setCluesFound([]);
    setRepairsCompleted([]);
    setRepairsComplete(false);
    setBeforeTime(0);
    setBeforeErrors(0);
    setGameStage('booking_before');
    announce('Resetting mission. Let us test the flow again.');
  };

  const handleOpenDesignLab = () => {
    setShowResults(false);
    const labEl = document.getElementById('design-lab');
    if (labEl) {
      labEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="arcade-app-root">
      {/* Navigation Header */}
      <Header
        onStartMission={handleStartMission}
        is2D={is2D}
        onToggle2D={() => setIs2D(!is2D)}
      />

      {/* Main Hero & Station Simulation */}
      <main id="main-content">
        <section className="hero-section" id="hero" aria-label="Hero Section">
          <div className="hero-grid">
            {/* Left Column: Expressive Spotify I-Pop Poster Typography & Callouts */}
            <div className="hero-content">
              <div className="hero-pill-row">
                <span className="hero-pill">
                  AN INTERACTIVE UX GAME · 2 MINUTES · NO SIGN-UP
                </span>
                <Badge variant="sticker" color="#FF8A1F" rotate={-2}>
                  HYPERBLOOM OCTOBER
                </Badge>
              </div>

              <h1 className="hero-brand-title">
                <span className="hero-wordmark-gradient">FRICTION</span><br />
                <span className="hero-wordmark-gradient">ARCADE</span>
              </h1>

              <div className="hero-headline-group">
                <h2 className="hero-headline">
                  <span className="hero-headline-tag">
                    SPOT THE FRICTION.
                    <span className="hero-headline-squiggle" aria-hidden="true" />
                  </span><br />
                  <span>FIX THE FLOW.</span>
                </h2>
              </div>

              <p className="hero-subtext">
                Explore a tiny 3D station. Complete a ticket-booking challenge. Discover the confusing parts, then redesign the interface to make the journey clearer.
              </p>

              {/* Exact Hero CTA Buttons */}
              <div className="hero-actions">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartMission}
                  icon={<Icons.Sparkle size={20} color="#FFFFFF" />}
                  id="btn-hero-start"
                >
                  START THE MISSION ↗
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleStartWithout3D}
                  icon={<Icons.Keyboard size={20} color="#17131F" />}
                  id="btn-hero-skip-3d"
                >
                  PLAY WITHOUT 3D
                </Button>
              </div>

              <div className="hero-instruction-strip">
                <Icons.Gamepad size={18} color="#FF8A1F" />
                <span>Move with WASD · Press E to interact · Tap any highlighted hotspot</span>
              </div>
            </div>

            {/* Right Column: 3D Navigable Station Viewport */}
            <div className="hero-station-col" id="playable-area">
              <StationContainer
                onSelectHotspot={handleSelectHotspot}
                cluesFound={cluesFound}
                repairsCompleted={repairsCompleted}
                repairsComplete={repairsComplete}
                activeHotspot={activeHotspot}
                force2D={is2D}
                onToggle2D={() => setIs2D(!is2D)}
              />
            </div>
          </div>
        </section>

        {/* ACTIVE GAME STAGES (IN PLACE OF BORING REDIRECTS) */}
        {gameStage === 'booking_before' && (
          <section className="booking-stage-section" aria-label="Booking Challenge: Before">
            <BookingFlowBefore
              onComplete={handleBeforeComplete}
              onCancel={() => setGameStage('idle')}
            />
          </section>
        )}

        {gameStage === 'booking_after' && (
          <section className="booking-stage-section" aria-label="Booking Challenge: Improved Flow">
            <BookingFlowAfter
              onComplete={handleAfterComplete}
              onBackToStation={() => setGameStage('idle')}
            />
          </section>
        )}

        {/* Supporting Sections */}
        <HowItWorks />
        <MeetTheStation
          onSelectHotspot={handleSelectHotspot}
          onOpenDesignLab={handleOpenDesignLab}
        />
        <DesignLabSection />
        <DesignRulesSection />
      </main>

      {/* Interactive Modals */}
      <ClueModal
        hotspotId={activeHotspot}
        isOpen={activeHotspot !== null}
        onClose={() => setActiveHotspot(null)}
        onCollectClue={handleCollectClue}
        onStartBooking={handleStartMission}
        cluesFound={cluesFound}
      />

      <RepairModal
        isOpen={gameStage === 'designer_mode'}
        onClose={() => setGameStage('idle')}
        onAllRepairsComplete={handleRepairsComplete}
        onRepairApplied={handleRepairApplied}
      />

      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        results={gameResults}
        onPlayAgain={handlePlayAgain}
        onOpenDesignLab={handleOpenDesignLab}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};
