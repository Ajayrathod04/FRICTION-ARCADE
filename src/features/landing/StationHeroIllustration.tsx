import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Icons } from '../../components/ui/Icons';

interface StationHeroIllustrationProps {
  onStartMission: () => void;
  onPlayWithout3D: () => void;
}

export const StationHeroIllustration: React.FC<StationHeroIllustrationProps> = ({
  onStartMission,
  onPlayWithout3D,
}) => {
  return (
    <div className="editorial-station-poster" role="img" aria-label="Stylized 3D Railway Station Concourse Artwork">
      {/* Background Station Concourse Artwork with warm station lighting */}
      <svg
        className="station-poster-svg"
        viewBox="0 0 800 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="stationSky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E1435" />
            <stop offset="50%" stopColor="#2D183E" />
            <stop offset="100%" stopColor="#3E1A38" />
          </linearGradient>

          <linearGradient id="roofGlass" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF3D8B" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="trainBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3D8B" />
            <stop offset="50%" stopColor="#FF8A1F" />
            <stop offset="100%" stopColor="#FFD23F" />
          </linearGradient>

          <linearGradient id="platformFloor" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#251F33" />
            <stop offset="100%" stopColor="#17131F" />
          </linearGradient>

          <linearGradient id="warmLight" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFD23F" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="kioskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD23F" />
            <stop offset="100%" stopColor="#FF8A1F" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Night Station Concourse Atmosphere */}
        <rect width="800" height="520" fill="url(#stationSky)" />

        {/* Arching Victorian Truss & Glass Station Canopy */}
        <path d="M 0 140 Q 400 30 800 140 L 800 0 L 0 0 Z" fill="url(#roofGlass)" />
        <path d="M 0 140 Q 400 30 800 140" stroke="#FFD23F" strokeWidth="4" strokeOpacity="0.4" fill="none" />
        <path d="M 0 170 Q 400 65 800 170" stroke="#FF8A1F" strokeWidth="2" strokeOpacity="0.3" fill="none" />

        {/* Light Beams from high windows */}
        <polygon points="120,0 260,0 340,360 80,360" fill="url(#warmLight)" />
        <polygon points="540,0 680,0 760,360 480,360" fill="url(#warmLight)" />

        {/* Concrete Platform Ground */}
        <polygon points="0,320 800,320 800,520 0,520" fill="url(#platformFloor)" />
        <line x1="0" y1="320" x2="800" y2="320" stroke="#FFD23F" strokeWidth="6" strokeDasharray="20 14" />

        {/* Train Tracks in background */}
        <line x1="0" y1="300" x2="800" y2="300" stroke="#483D62" strokeWidth="4" />
        <line x1="0" y1="285" x2="800" y2="285" stroke="#372E4C" strokeWidth="3" />

        {/* The Passenger Express Train (Right side) */}
        <g transform="translate(460, 160)">
          {/* Train Carriage */}
          <rect x="0" y="20" width="340" height="130" rx="16" fill="url(#trainBody)" stroke="#17131F" strokeWidth="4" />
          <rect x="0" y="110" width="340" height="24" fill="#17131F" />
          {/* Windows */}
          <rect x="25" y="45" width="55" height="40" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="3" />
          <rect x="95" y="45" width="55" height="40" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="3" />
          <rect x="165" y="45" width="55" height="40" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="3" />
          <rect x="235" y="45" width="55" height="40" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="3" />
          {/* Train Headcode Sign: PUNE EXPRESS */}
          <rect x="70" y="28" width="160" height="12" rx="4" fill="#17131F" />
          <text x="150" y="38" fill="#FFD23F" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            PUNE EXPRESS · TRACK 1
          </text>
        </g>

        {/* Ticket Kiosk with glowing screen (Left Center) */}
        <g transform="translate(140, 210)">
          {/* Kiosk Pillar / Cabinet */}
          <rect x="0" y="20" width="110" height="160" rx="12" fill="url(#kioskGradient)" stroke="#17131F" strokeWidth="4" />
          <rect x="14" y="5" width="82" height="18" rx="6" fill="#17131F" />
          <text x="55" y="18" fill="#FFD23F" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            TICKETS
          </text>
          {/* Touchscreen with placeholder issue illustration */}
          <rect x="16" y="38" width="78" height="96" rx="8" fill="#FFFFFF" stroke="#17131F" strokeWidth="3" />
          <rect x="24" y="52" width="62" height="14" rx="4" fill="#F0EAE1" />
          <rect x="24" y="74" width="62" height="14" rx="4" fill="#F0EAE1" />
          <rect x="24" y="98" width="62" height="22" rx="6" fill="#FF3D8B" />
          <text x="55" y="113" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            Book Now
          </text>
        </g>

        {/* Departure Board Suspended from ceiling (Center Top) */}
        <g transform="translate(310, 55)">
          <line x1="40" y1="-55" x2="40" y2="0" stroke="#FFD23F" strokeWidth="3" />
          <line x1="160" y1="-55" x2="160" y2="0" stroke="#FFD23F" strokeWidth="3" />
          <rect x="0" y="0" width="200" height="95" rx="10" fill="#17131F" stroke="#FFD23F" strokeWidth="3" />
          <rect x="8" y="8" width="184" height="20" rx="4" fill="#251F33" />
          <text x="100" y="22" fill="#FFD23F" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            ⚡ DEPARTURES
          </text>
          {/* Train rows */}
          <text x="16" y="44" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="monospace">12:30 MUMBAI</text>
          <text x="145" y="44" fill="#B6FFB2" fontSize="9" fontWeight="800" fontFamily="monospace">ON TIME</text>
          <text x="16" y="62" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="monospace">13:15 PUNE</text>
          <text x="145" y="62" fill="#FF3B30" fontSize="9" fontWeight="800" fontFamily="monospace">DELAYED</text>
          <text x="16" y="80" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="monospace">14:20 GOA</text>
          <text x="145" y="80" fill="#B6FFB2" fontSize="9" fontWeight="800" fontFamily="monospace">ON TIME</text>
        </g>

        {/* Station Clock */}
        <g transform="translate(80, 80)">
          <circle cx="28" cy="28" r="26" fill="#FFFDF8" stroke="#17131F" strokeWidth="4" />
          <circle cx="28" cy="28" r="2" fill="#17131F" />
          <line x1="28" y1="28" x2="28" y2="12" stroke="#17131F" strokeWidth="3" strokeLinecap="round" />
          <line x1="28" y1="28" x2="39" y2="28" stroke="#FF3B30" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* The Traveler Avatar (Center Foreground, rear-facing composition based on 11.jpeg) */}
        <g transform="translate(350, 240)">
          {/* Shadow on platform */}
          <ellipse cx="50" cy="210" rx="42" ry="12" fill="rgba(0,0,0,0.4)" />

          {/* Rolling Suitcase */}
          <rect x="-18" y="145" width="32" height="48" rx="8" fill="#FF3D8B" stroke="#17131F" strokeWidth="3" />
          <line x1="-2" y1="145" x2="-2" y2="110" stroke="#17131F" strokeWidth="3" />
          <rect x="-8" y="105" width="12" height="8" rx="2" fill="#17131F" />
          <circle cx="-10" cy="195" r="4" fill="#17131F" />
          <circle cx="6" cy="195" r="4" fill="#17131F" />

          {/* Legs & Dark Trousers */}
          <rect x="28" y="142" width="16" height="58" rx="7" fill="#17131F" />
          <rect x="56" y="142" width="16" height="58" rx="7" fill="#17131F" />
          {/* White Sneakers */}
          <rect x="24" y="194" width="22" height="12" rx="5" fill="#FFFFFF" stroke="#17131F" strokeWidth="2" />
          <rect x="54" y="194" width="22" height="12" rx="5" fill="#FFFFFF" stroke="#17131F" strokeWidth="2" />

          {/* Orange Puffer Jacket Body */}
          <rect x="18" y="55" width="64" height="92" rx="22" fill="#FF8A1F" stroke="#17131F" strokeWidth="4" />
          {/* Jacket Quilting lines */}
          <path d="M 20 85 Q 50 92 80 85" stroke="#D96E0D" strokeWidth="3" fill="none" />
          <path d="M 20 115 Q 50 122 80 115" stroke="#D96E0D" strokeWidth="3" fill="none" />

          {/* Big Yellow Patched Backpack */}
          <rect x="26" y="60" width="48" height="66" rx="14" fill="#FFD23F" stroke="#17131F" strokeWidth="3.5" />
          <rect x="34" y="85" width="32" height="30" rx="8" fill="#F4BF1A" stroke="#17131F" strokeWidth="2" />
          {/* Backpack Stickers */}
          <circle cx="44" cy="98" r="5" fill="#FF3D8B" />
          <rect x="52" y="93" width="9" height="9" rx="2" fill="#8DDCFF" />

          {/* Head & Dark Tousled Hair */}
          <circle cx="50" cy="40" r="22" fill="#E8B58D" stroke="#17131F" strokeWidth="3" />
          <path d="M 26 38 C 26 15, 74 15, 74 38 C 70 24, 30 24, 26 38 Z" fill="#251F33" stroke="#17131F" strokeWidth="2" />
          {/* Orange Beanie / Hood collar */}
          <ellipse cx="50" cy="48" rx="24" ry="9" fill="#FF8A1F" stroke="#17131F" strokeWidth="2.5" />
        </g>

        {/* Floating Glossy 3D Ticket Collectible */}
        <g transform="translate(620, 310)" filter="url(#glowEffect)">
          <rect x="0" y="0" width="70" height="42" rx="8" fill="#FFD23F" stroke="#17131F" strokeWidth="3" transform="rotate(-12)" />
          <circle cx="0" cy="21" r="5" fill="#17131F" />
          <circle cx="70" cy="21" r="5" fill="#17131F" />
          <text x="35" y="24" fill="#17131F" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" transform="rotate(-12 35 24)">
            MUM → PUN
          </text>
        </g>

        {/* Sparkles */}
        <polygon points="120,180 125,190 135,195 125,200 120,210 115,200 105,195 115,190" fill="#FFD23F" />
        <polygon points="430,120 433,127 440,130 433,133 430,140 427,133 420,130 427,127" fill="#FF3D8B" />
        <polygon points="680,180 683,187 690,190 683,193 680,200 677,193 670,190 677,187" fill="#B6FFB2" />
      </svg>

      {/* Floating Tactical Callout Badges */}
      <div className="poster-callout poster-callout--mission">
        <Badge variant="sticker" color="#FFD23F" rotate={-3}>
          MISSION 01: THE LAST TICKET
        </Badge>
      </div>

      <div className="poster-callout poster-callout--flaws">
        <Badge variant="sticker" color="#FF3D8B" rotate={3}>
          3 INTERFACE FLAWS TO UNCOVER
        </Badge>
      </div>

      {/* Hero Poster Overlay Action Strip */}
      <div className="poster-action-overlay">
        <div className="poster-overlay-card">
          <div className="poster-overlay-meta">
            <span className="poster-live-pill">● EXPLORABLE 3D CONCOURSE</span>
            <span className="poster-route-label">MUMBAI ➔ PUNE EXPRESS</span>
          </div>
          <div className="poster-overlay-actions">
            <button
              type="button"
              className="btn btn-primary poster-primary-cta"
              onClick={onStartMission}
              id="hero-start-mission-poster-btn"
            >
              <span>ENTER THE GAME</span>
              <Icons.ArrowRight size={18} />
            </button>
            <button
              type="button"
              className="btn btn-outline poster-secondary-cta"
              onClick={onPlayWithout3D}
            >
              <span>PLAY WITHOUT 3D</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
