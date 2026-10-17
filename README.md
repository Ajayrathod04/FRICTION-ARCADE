# FRICTION ARCADE

> **“Spot the friction. Fix the flow.”**  
> An interactive UX game and editorial experience that teaches human-centered interface design principles through an explorable 3D railway station and a fictional transit booking challenge.

---

## 🏛️ Two Distinct Routes & Experiences

FRICTION ARCADE cleanly separates the marketing editorial website from the playable game into two isolated top-level routes:

### Route A: Cinematic Landing Website (`/`)
- **Son Daven-Inspired Editorial Storytelling:**
  - **Editorial Hero Poster:** High-impact typography with glossy pink-to-orange-to-yellow gradient, extruded shadows, and a handcrafted non-interactive railway station illustration.
  - **Story Section ("Small design problems. Real frustration."):** 3 deep-dive feature blocks explaining Missing Context, Confusing Feedback, and Unclear Actions.
  - **The Experience ("From confused traveler to confident designer."):** 4-stage narrative progression outlining the journey.
  - **Design Principles & Interactive Design Lab Sandbox:** Hands-on playground to toggle persistent labels, inline errors, touch target sizes, and visible focus.
  - **Zero Game Engine Overhead:** Never mounts `StationCanvas`, player controller, movement listeners, game timers, or booking challenges.

### Route B: Independent Playable Game (`/#/play` or `/play`)
- **Full-Screen Playable Concourse:**
  - Dedicated gameplay top-bar with `← Exit to Home`, mission pill, avatar switcher, and mode toggles.
  - **Avatar Selection:** 3 stylised characters (*The Explorer*, *The Creative*, *The Analyst*) with real-time 3D turntable preview.
  - **Controls Briefing Tutorial:** Quick key-cap overview (`WASD`, `Shift`, `E`, `M`, `H`, `Esc`, `P`).
  - **3D Concourse Exploration:** Navigable railway station with train, kiosk, board, help desk, 3 in-world NPCs (*Priya*, *Arjun*, *Rajiv*), 6 floating collectibles, AABB collisions, and follow camera.
  - **Minimap Radar HUD & Transit Phone PDA:** Circular radar blip in bottom-left and collapsible mobile PDA on the right.
  - **Campus-Grade Pause Menu (`Esc`):** Pause menu with camera toggles, voice narration, role perspectives, and reset to entrance.
  - **The Friction Trail & Booking Challenges:** Hands-on BEFORE flow with live timer/error tracking, forensic case file, 3 interactive repair puzzles, and accessible AFTER flow.
  - **Clarity Mode & Telemetry Results:** Concourse transformation upon repair completion and exportable UX checklist.
  - **100% Accessible 2D Fallback:** Available via `/#/play?mode=2d` or the top-bar toggle.

---

## 🏗️ Architecture & Clean Code Structure

```
src/
├── app/                  # App shell, routing (router.ts), and top-level layout switch
├── components/           # Accessible UI primitives (Button, Modal, Badge, Toggle, Icons)
├── data/                 # Fictional mission data, avatar definitions, NPCs, clues, repair puzzles
├── features/
│   ├── coop/             # Duo Design Jam local 2-player cooperative mode
│   ├── friction/         # Clue inspection modals and forensic case files
│   ├── game/             # Independent game route shell (GamePage.tsx)
│   ├── landing/          # Editorial marketing website (LandingPage.tsx, StationHeroIllustration.tsx)
│   ├── mission/          # Briefing tutorial, Before & After booking challenges
│   ├── repair-lab/       # Designer Mode repair puzzles + live Design Lab sandbox
│   ├── results/          # Personal results telemetry card & design checklist export
│   └── station/          # Procedural Three.js station, NPCs, minimap radar, pause menu, phone PDA
├── lib/                  # A11y announcer, audio & speech synthesis, storage, and timing utilities
└── tests/                # Unit tests for mission, accessibility, and route separation
```

---

## 🎨 Visual System & Typography

- **Display Face:** Self-hosted *Archivo Variable* (expanded, weight 900) styled with dimensional pink-to-orange-to-yellow gradients, glossy highlights, fine dark outlines, and extruded 3D drop-shadows inspired by retro arcade posters.
- **Body & Controls:** Self-hosted *Space Grotesk* for high-contrast, crystal-clear readability.
- **Palette:** Warm cream (`#FFF6E5`), Ink (`#17131F`), Cherry red (`#FF3B30`), Tangerine (`#FF8A1F`), Sun yellow (`#FFD23F`), Hot pink (`#FF3D8B`), and Mint (`#B6FFB2`).
- **Tactile UI:** Chunky 3px solid ink borders, hard offset shadows, white die-cut sticker badges, and custom SVG icons.

---

## 🧪 Verification & Checks

| Check | Tool / Command | Status |
|---|---|---|
| **TypeScript** | `tsc -b` | **PASS (0 errors)** |
| **Unit Tests** | `node --test src/tests/*.test.ts` | **PASS (10/10 tests pass)** |
| **Production Build** | `tsc -b && vite build` | **PASS (clean bundle in dist/)** |
| **Route Separation** | Router unit tests & browser verification | **PASS (Zero canvas on `/`)** |
| **Dev Server** | `vite` | **PASS (active on http://127.0.0.1:5173/)** |
| **A11y & Motion** | `prefers-reduced-motion` & WCAG AA contrast | **PASS** |

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

---

## 👤 Credits & Authorship

- **Author:** `AJRathod`
- **GitHub:** [`Ajayrathod04`](https://github.com/Ajayrathod04)
- **License:** MIT
- **Hackathon:** Hyperbloom October 2026
