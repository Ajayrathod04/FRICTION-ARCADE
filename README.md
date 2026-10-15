# FRICTION ARCADE

> **“Spot the friction. Fix the flow.”**  
> An interactive 3D web game that teaches practical, human-centered interface design principles through an explorable railway station and a fictional transit booking challenge.

---

## 🎮 About The Project

**FRICTION ARCADE** invites visitors to explore a stylized, toy-like 3D transit station, experience a ticket-booking challenge filled with realistic interface friction, discover forensic case files on why usability broke down, and switch to Designer Mode to repair the interface and replay the journey with clarity.

- **No accounts or signups:** Jump in immediately.
- **Fictional data only:** No real identity, payment, or personal information is collected.
- **100% Accessible:** Full 3D station plus a dedicated accessible 2D alternative path with high-contrast WCAG AA controls and screen-reader live region announcements.
- **Duo Design Jam (Co-op):** Local 2-player turn-based cooperative mode with complementary roles (Field Traveler & Lead Designer).

---

## 🏗️ Architecture & Features

```
src/
├── app/                  # Application shell and game-state orchestrator
├── components/           # Accessible UI primitives (Buttons, Modals, Badges, Toggles, SVG Icons)
├── data/                 # Fictional mission data, avatar choices, NPCs, clue definitions, repair puzzles, 8 UX rules
├── features/
│   ├── coop/             # Duo Design Jam local 2-player cooperative mode
│   ├── friction/         # Clue inspection modals and forensic case files
│   ├── landing/          # Character select modal with 3D turntable preview
│   ├── mission/          # Intro briefing tutorial, Before (Flawed) and After (Improved) booking challenge flows
│   ├── repair-lab/       # Designer Mode interactive repairs + live Design Lab sandbox
│   ├── results/          # Personal results telemetry card & design checklist export
│   └── station/          # Procedural Three.js 3D station, NPCs, collision boundaries, and concourse map
├── lib/                  # A11y announcer, WebGL detection, storage, and timing utilities
└── tests/                # Unit test suites for mission data, a11y, and utilities
```

### The 10 Master Game Loop Stages:
1. **Screen 01 — Landing Hero:** Bold typography, 3D station preview, and dual CTAs ("Start the Mission →" & "Play Without 3D").
2. **Screen 02 — Character Selection:** Choose between 3 original stylised avatars (*The Explorer*, *The Creative*, *The Analyst*) with a real-time Three.js turntable preview.
3. **Screen 03 — Introduction & Controls:** `MISSION 01 — THE LAST TICKET` briefing with key-cap guide (`WASD`, `Shift`, `E`, `M`, `H`, `Esc`).
4. **Screen 04 — The 3D Railway Station:** Spatially explorable concourse with ticket kiosk, Solari departure board, staffed help desk, 3 in-world NPCs (*Priya*, *Arjun*, *Rajiv*), and 6 animated floating 3D collectibles.
5. **Screen 05 — Clue Discoveries (The Friction Trail):**
   - **Ticket Kiosk:** Missing context (disappearing placeholder text).
   - **Departure Board:** Confusing feedback (color-only error indicators).
   - **Help Desk:** Unclear actions (competing button hierarchy).
6. **Screen 06 — Booking Challenge (BEFORE):** Hands-on form with real live elapsed timer and error counter, hints drawer, and post-task forensic case file.
7. **Screen 07 — Forensic Case Files:** Human-factors breakdown and UX heuristics explaining each friction point.
8. **Screen 08 — Designer Mode:** Interactive 3-step repair puzzles with instant feedback, explanations, and dynamic component preview updates.
9. **Screen 09 — Booking Challenge (AFTER):** Polished booking with persistent `<label>` tags, inline validation with icons, 48px targets, visible focus rings, single high-contrast primary CTA, and boarding pass success state.
10. **Screen 10 — Clarity Mode & Results:** The 3D station visibly transforms in response to fixes, followed by the personal results telemetry card with local history persistence and a copyable 8-point UX checklist.

---

## 🎨 Visual System & Typography

- **Display Face:** Self-hosted *Archivo Variable* (expanded, weight 900) styled with glossy metallic gradients, reflective highlights, fine dark outlines, and extruded 3D drop-shadows inspired by retro arcade posters.
- **Body & Controls:** Self-hosted *Space Grotesk* for high-contrast, crystal-clear readability.
- **Palette:** Warm cream (`#FFF6E5`), Ink (`#17131F`), Cherry red (`#FF3B30`), Tangerine (`#FF8A1F`), Sun yellow (`#FFD23F`), Hot pink (`#FF3D8B`), and Mint (`#B6FFB2`).
- **Tactile UI:** Chunky 3px solid ink borders, hard offset shadows, white die-cut sticker badges, and custom SVG icons (no generic emojis as primary icons).

---

## 🧪 Verification & Checks

| Check | Tool | Status |
|---|---|---|
| **TypeScript** | `tsc -b` | **PASS (0 errors)** |
| **Unit Tests** | `node --test src/tests/*.test.ts` | **PASS (8/8 tests pass)** |
| **Production Build** | `tsc -b && vite build` | **PASS (clean bundle in dist/)** |
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
- **Email:** [`ajaybr2021@gmail.com`](mailto:ajaybr2021@gmail.com)
- **License:** MIT
- **Hackathon:** Hyperbloom October 2026
