import React, { lazy, Suspense } from 'react';
import { useRouter } from './router';
import { LandingPage } from '../features/landing/LandingPage';

// Lazy-load the game engine & 3D station bundle so the landing page stays lightweight
// and completely free of Three.js / game dependencies until Route B is entered.
const GamePage = lazy(() =>
  import('../features/game/GamePage').then((m) => ({ default: m.GamePage }))
);

export const App: React.FC = () => {
  const { route, params, navigateTo } = useRouter();

  if (route === 'game') {
    return (
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#17131F',
              color: '#FFF6E5',
              fontFamily: 'Space Grotesk, sans-serif',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#FF8A1F',
                letterSpacing: '0.05em',
              }}
            >
              FRICTION ARCADE
            </div>
            <div>Loading Railway Station Concourse...</div>
          </div>
        }
      >
        <GamePage
          onExitToHome={() => navigateTo('landing')}
          initialMode={params.mode === '2d' ? '2d' : '3d'}
        />
      </Suspense>
    );
  }

  // Default Route: Route A (Clean Editorial Landing Website)
  // Absolutely NO game canvas, NO game timers, NO booking forms mounted here!
  return (
    <LandingPage
      onStartMission={() => navigateTo('game')}
      onPlayWithout3D={() => navigateTo('game', { mode: '2d' })}
    />
  );
};
