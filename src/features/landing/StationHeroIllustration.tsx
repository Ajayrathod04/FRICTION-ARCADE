import React from 'react';

export const StationHeroIllustration: React.FC = () => {
  return (
    <div className="hero-cinematic-composition" role="img" aria-label="Cinematic illustration of the stylized traveler exploring the vibrant railway terminal">
      {/* Decorative Layered Background SVG - seamlessly blends into the cream canvas */}
      <svg
        className="hero-cinematic-svg"
        viewBox="0 0 760 620"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Station Atmospheric Sky Gradient */}
          <radialGradient id="stationGlow" cx="60%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF8E7" stopOpacity="0.9" />
            <stop offset="45%" stopColor="#FFECC7" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#FFF6E5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FFF6E5" stopOpacity="0" />
          </radialGradient>

          {/* Train Metallic Body Gradient */}
          <linearGradient id="trainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3D8B" />
            <stop offset="35%" stopColor="#FF3B30" />
            <stop offset="70%" stopColor="#FF8A1F" />
            <stop offset="100%" stopColor="#FFD23F" />
          </linearGradient>

          {/* Architectural Archway Gradient */}
          <linearGradient id="archTruss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#251F33" />
            <stop offset="100%" stopColor="#4A3F60" />
          </linearGradient>

          {/* Golden Sunlit Window Beams */}
          <linearGradient id="sunBeam" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD23F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFD23F" stopOpacity="0" />
          </linearGradient>

          {/* Golden Ticket Foil Gradient */}
          <linearGradient id="ticketFoil" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="50%" stopColor="#FFD23F" />
            <stop offset="100%" stopColor="#FF8A1F" />
          </linearGradient>

          {/* Drop Shadows */}
          <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="4" dy="8" stdDeviation="6" floodColor="#17131F" floodOpacity="0.18" />
          </filter>
          <filter id="ticketGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#FF8A1F" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. Warm Atmospheric Base Oval */}
        <ellipse cx="440" cy="300" rx="320" ry="260" fill="url(#stationGlow)" />

        {/* 2. Classical Victorian Arched Station Trusses & Glass Canopy */}
        <g opacity="0.85">
          <path
            d="M 60 260 C 160 80, 520 80, 720 260"
            stroke="url(#archTruss)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M 90 280 C 180 120, 500 120, 690 280"
            stroke="#17131F"
            strokeWidth="3.5"
            strokeDasharray="14 8"
            fill="none"
          />
          {/* Vertical Glass Ribs */}
          <line x1="240" y1="135" x2="240" y2="400" stroke="#FFD23F" strokeWidth="2" strokeOpacity="0.4" />
          <line x1="390" y1="110" x2="390" y2="400" stroke="#FFD23F" strokeWidth="2.5" strokeOpacity="0.5" />
          <line x1="540" y1="135" x2="540" y2="400" stroke="#FFD23F" strokeWidth="2" strokeOpacity="0.4" />
        </g>

        {/* 3. Diagonal Sunlit Window Beams */}
        <polygon points="180,60 260,60 340,480 200,480" fill="url(#sunBeam)" />
        <polygon points="460,60 540,60 620,480 480,480" fill="url(#sunBeam)" />

        {/* 4. Concrete Station Platform & Track Area */}
        <polygon points="40,430 740,430 760,600 20,600" fill="#E8DEC9" stroke="#17131F" strokeWidth="3" />
        {/* Platform Tactile Yellow Safety Edge */}
        <polygon points="40,430 740,430 744,444 36,444" fill="#FFD23F" stroke="#17131F" strokeWidth="2" />
        <line x1="40" y1="444" x2="744" y2="444" stroke="#17131F" strokeWidth="2" strokeDasharray="12 10" />

        {/* Railway Steel Track Rails */}
        <line x1="40" y1="418" x2="740" y2="418" stroke="#5E5072" strokeWidth="5" />
        <line x1="40" y1="402" x2="740" y2="402" stroke="#433754" strokeWidth="4" />

        {/* 5. Approaching High-Speed Passenger Train (Right Flank) */}
        <g transform="translate(420, 240)" filter="url(#softShadow)">
          {/* Aerodynamic Locomotive Nose */}
          <path
            d="M 0 110 L 40 40 Q 90 20 220 20 L 320 20 L 320 170 L 60 170 Q 20 160 0 110 Z"
            fill="url(#trainGradient)"
            stroke="#17131F"
            strokeWidth="4"
          />
          {/* Windshield / Cab Glass */}
          <path
            d="M 50 48 L 130 38 L 140 85 L 35 90 Z"
            fill="#8DDCFF"
            stroke="#17131F"
            strokeWidth="3"
          />
          {/* Passenger Windows */}
          <rect x="160" y="44" width="45" height="34" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="2.5" />
          <rect x="220" y="44" width="45" height="34" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="2.5" />
          <rect x="280" y="44" width="45" height="34" rx="8" fill="#8DDCFF" stroke="#17131F" strokeWidth="2.5" />
          {/* Express Headcode Plate */}
          <rect x="45" y="118" width="115" height="24" rx="6" fill="#17131F" />
          <text x="102" y="134" fill="#FFD23F" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            THE LAST TRAIN · 13:15
          </text>
          {/* Bright Train Headlight Beam */}
          <circle cx="28" cy="115" r="12" fill="#FFFDF8" stroke="#FFD23F" strokeWidth="3" />
          <polygon points="28,115 -180,80 -180,240 28,135" fill="url(#sunBeam)" opacity="0.6" />
        </g>

        {/* 6. Expressive Grand Departure Board (Top-Center) */}
        <g transform="translate(190, 85)" filter="url(#softShadow)">
          {/* Ceiling Suspension Cables */}
          <line x1="50" y1="-85" x2="50" y2="0" stroke="#17131F" strokeWidth="3.5" />
          <line x1="210" y1="-85" x2="210" y2="0" stroke="#17131F" strokeWidth="3.5" />
          {/* Display Board Case */}
          <rect x="0" y="0" width="260" height="105" rx="14" fill="#17131F" stroke="#FFD23F" strokeWidth="3.5" />
          <rect x="10" y="10" width="240" height="22" rx="6" fill="#251F33" />
          <text x="130" y="25" fill="#FFD23F" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.08em">
            ⚡ DEPARTURES · PLATFORM 1
          </text>
          {/* Departure Rows */}
          <text x="20" y="52" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">13:15 PUNE EXP</text>
          <text x="180" y="52" fill="#FF3D8B" fontSize="10" fontWeight="800" fontFamily="monospace">BOARDING</text>
          <text x="20" y="72" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">13:45 GOA SF</text>
          <text x="180" y="72" fill="#B6FFB2" fontSize="10" fontWeight="800" fontFamily="monospace">ON TIME</text>
          <text x="20" y="92" fill="#FFFFFF" fontSize="10" fontWeight="700" fontFamily="monospace">14:10 DELHI RAJ</text>
          <text x="180" y="92" fill="#B6FFB2" fontSize="10" fontWeight="800" fontFamily="monospace">ON TIME</text>
        </g>

        {/* 7. Self-Service Ticket Kiosk (Left Concourse) */}
        <g transform="translate(70, 240)" filter="url(#softShadow)">
          {/* Kiosk Body */}
          <rect x="0" y="20" width="105" height="175" rx="14" fill="#FFD23F" stroke="#17131F" strokeWidth="4" />
          <rect x="12" y="6" width="81" height="20" rx="6" fill="#17131F" />
          <text x="52" y="20" fill="#FFD23F" fontSize="10" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            TICKETS
          </text>
          {/* Screen with simulated ticket flow */}
          <rect x="14" y="38" width="77" height="105" rx="8" fill="#FFFDF8" stroke="#17131F" strokeWidth="3" />
          <rect x="22" y="52" width="61" height="16" rx="4" fill="#F0EAE1" />
          <rect x="22" y="74" width="61" height="16" rx="4" fill="#FFE4EE" />
          <rect x="22" y="100" width="61" height="24" rx="6" fill="#FF3B30" />
          <text x="52" y="116" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            BOOK NOW
          </text>
        </g>

        {/* 8. THE PLAYABLE TRAVELER (Center Foreground, Energetic 3/4 Pose reaching for ticket) */}
        <g transform="translate(260, 235)" filter="url(#softShadow)">
          {/* Platform Cast Shadow */}
          <ellipse cx="70" cy="270" rx="55" ry="14" fill="rgba(23, 19, 31, 0.28)" />

          {/* Rolling Luggage / Suitcase */}
          <g transform="translate(-15, 185)">
            <rect x="0" y="20" width="36" height="58" rx="8" fill="#FF3D8B" stroke="#17131F" strokeWidth="3.5" />
            {/* Telescopic Pull Handle */}
            <line x1="18" y1="20" x2="18" y2="-20" stroke="#17131F" strokeWidth="3.5" />
            <rect x="8" y="-26" width="20" height="8" rx="3" fill="#17131F" />
            {/* Luggage Wheels */}
            <circle cx="8" cy="80" r="5" fill="#17131F" />
            <circle cx="28" cy="80" r="5" fill="#17131F" />
            {/* Luggage Tag / Sticker */}
            <rect x="8" y="35" width="20" height="12" rx="2" fill="#FFD23F" stroke="#17131F" strokeWidth="1.5" />
          </g>

          {/* Left Leg (Forward Stride) & Dark Indigo Trousers */}
          <path
            d="M 46 160 L 38 235 L 56 235 L 62 160 Z"
            fill="#1E293B"
            stroke="#17131F"
            strokeWidth="3.5"
          />
          {/* Left Sneaker (Chunky white/teal running shoe) */}
          <path
            d="M 32 235 L 60 235 Q 68 245 60 256 L 28 256 Q 24 245 32 235 Z"
            fill="#FFFFFF"
            stroke="#17131F"
            strokeWidth="3"
          />
          <rect x="36" y="244" width="18" height="6" rx="2" fill="#8DDCFF" />

          {/* Right Leg (Pivoted Leg) */}
          <path
            d="M 72 160 L 88 230 L 106 230 L 88 160 Z"
            fill="#1E293B"
            stroke="#17131F"
            strokeWidth="3.5"
          />
          {/* Right Sneaker */}
          <path
            d="M 82 230 L 112 230 Q 120 240 114 252 L 80 252 Q 76 242 82 230 Z"
            fill="#FFFFFF"
            stroke="#17131F"
            strokeWidth="3"
          />
          <rect x="88" y="240" width="18" height="6" rx="2" fill="#FF8A1F" />

          {/* Upper Body: Vivid Orange Puffer Jacket / Hoodie */}
          <path
            d="M 34 78 Q 20 120 38 165 L 94 165 Q 112 120 98 78 Q 66 65 34 78 Z"
            fill="#FF8A1F"
            stroke="#17131F"
            strokeWidth="4"
          />
          {/* Jacket Quilting seams */}
          <path d="M 38 108 Q 66 116 94 108" stroke="#D96E0D" strokeWidth="3" fill="none" />
          <path d="M 40 138 Q 66 146 92 138" stroke="#D96E0D" strokeWidth="3" fill="none" />

          {/* Bright Yellow Patched Backpack */}
          <rect
            x="44"
            y="76"
            width="58"
            height="76"
            rx="16"
            fill="#FFD23F"
            stroke="#17131F"
            strokeWidth="4"
          />
          {/* Front Pocket */}
          <rect
            x="54"
            y="105"
            width="38"
            height="34"
            rx="8"
            fill="#F4BF1A"
            stroke="#17131F"
            strokeWidth="2.5"
          />
          {/* Backpack Travel Patches */}
          <circle cx="66" cy="118" r="6" fill="#FF3D8B" stroke="#17131F" strokeWidth="1.5" />
          <polygon points="78,114 83,124 73,124" fill="#8DDCFF" stroke="#17131F" strokeWidth="1.5" />

          {/* Left Arm: Resting naturally */}
          <path
            d="M 34 88 L 18 135 L 28 142 L 44 95 Z"
            fill="#FF8A1F"
            stroke="#17131F"
            strokeWidth="3.5"
          />

          {/* Right Arm: Reaching dynamically up toward the floating ticket */}
          <path
            d="M 92 88 L 135 48 L 146 58 L 102 98 Z"
            fill="#FF8A1F"
            stroke="#17131F"
            strokeWidth="3.5"
          />
          {/* Hand reaching out */}
          <circle cx="145" cy="48" r="9" fill="#E8B58D" stroke="#17131F" strokeWidth="2.5" />

          {/* Head & Neck */}
          <circle cx="64" cy="50" r="26" fill="#E8B58D" stroke="#17131F" strokeWidth="3.5" />
          {/* Tousled Dark Hair */}
          <path
            d="M 38 48 C 36 20, 88 16, 92 48 C 84 32, 44 32, 38 48 Z"
            fill="#1E1435"
            stroke="#17131F"
            strokeWidth="3"
          />
          {/* Hair Tufts / Tousles */}
          <path d="M 48 24 Q 54 12 62 20" stroke="#17131F" strokeWidth="3" fill="none" />
          <path d="M 68 18 Q 76 8 82 22" stroke="#17131F" strokeWidth="3" fill="none" />
          {/* Orange Hoodie Collar */}
          <ellipse cx="64" cy="62" rx="28" ry="10" fill="#FF8A1F" stroke="#17131F" strokeWidth="3" />
        </g>

        {/* 9. Floating Golden Railway Ticket Collectible (Reaching Target) */}
        <g transform="translate(420, 190)" filter="url(#ticketGlow)" className="hero-floating-ticket">
          <g transform="rotate(-15)">
            <rect
              x="0"
              y="0"
              width="100"
              height="58"
              rx="10"
              fill="url(#ticketFoil)"
              stroke="#17131F"
              strokeWidth="3.5"
            />
            {/* Cutout Notches */}
            <circle cx="0" cy="29" r="7" fill="#FFF8E7" stroke="#17131F" strokeWidth="3" />
            <circle cx="100" cy="29" r="7" fill="#FFF8E7" stroke="#17131F" strokeWidth="3" />
            {/* Ticket Text */}
            <text x="50" y="24" fill="#17131F" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
              BOARDING PASS
            </text>
            <text x="50" y="42" fill="#FF3B30" fontSize="12" fontWeight="900" fontFamily="monospace" textAnchor="middle">
              MUM ➔ PUN
            </text>
            <line x1="16" y1="48" x2="84" y2="48" stroke="#17131F" strokeWidth="1.5" strokeDasharray="3 3" />
          </g>
        </g>

        {/* 10. Glossy Four-Point Sparkle Stars */}
        <g className="hero-sparkle-star s1" transform="translate(180, 200)">
          <path d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z" fill="#FFD23F" stroke="#17131F" strokeWidth="2" />
        </g>
        <g className="hero-sparkle-star s2" transform="translate(400, 110)">
          <path d="M 0 -18 Q 0 0 18 0 Q 0 0 0 18 Q 0 0 -18 0 Q 0 0 0 -18 Z" fill="#FF3D8B" stroke="#17131F" strokeWidth="2" />
        </g>
        <g className="hero-sparkle-star s3" transform="translate(680, 260)">
          <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="#B6FFB2" stroke="#17131F" strokeWidth="2" />
        </g>

        {/* 11. Playful Decorative Sticker: "FIX THE FLOW" */}
        <g transform="translate(470, 460) rotate(-4)">
          <rect x="0" y="0" width="135" height="34" rx="8" fill="#FF3D8B" stroke="#17131F" strokeWidth="3" />
          <text x="67" y="22" fill="#FFFFFF" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.08em">
            ★ FIX THE FLOW
          </text>
        </g>
      </svg>
    </div>
  );
};
