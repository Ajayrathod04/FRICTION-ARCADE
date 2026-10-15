# FRICTION ARCADE

> **“Spot the friction. Fix the flow.”**
> An interactive 3D web game that teaches practical, human-centered interface design principles through a fictional transit booking challenge.

---

## 🎮 About The Project

**FRICTION ARCADE** invites visitors to explore a stylized 3D transit station, experience a ticket-booking challenge filled with realistic interface friction, discover forensic case files on why usability broke down, and switch to Designer Mode to repair the interface and replay the journey with clarity.

- **No accounts or signups:** Jump in immediately.
- **Fictional data only:** No real identity, payment, or personal information is collected.
- **100% Accessible:** Full 3D station plus a dedicated accessible 2D alternative path with high-contrast WCAG AA controls and screen-reader live region announcements.

---

## 🏗️ Architecture & Features

```
src/
├── app/                  # Application shell and game-state orchestrator
├── components/           # Accessible UI primitives (Buttons, Modals, Badges, Toggles, SVG Icons)
├── data/                 # Fictional mission data, clue definitions, repair puzzles, 8 UX rules
├── features/
│   ├── station/          # Procedural Three.js 3D station + accessible 2D fallback
│   ├── mission/          # Before (Flawed) and After (Improved) booking challenge flows
│   ├── friction/         # Clue inspection modals and forensic case files
│   ├── repair-lab/       # Designer Mode interactive repairs + live Design Lab sandbox
│   └── results/          # Personal results telemetry card & design checklist export
├── lib/                  # A11y announcer, WebGL detection, storage, and timing utilities
└── tests/                # Unit test suites for mission data, a11y, and utilities
```

### The 5 Game Loop Stages:
1. **Stage A — Mission Briefing:** `MISSION 01 · THE LAST TICKET` — "Book two seats from Mumbai to Pune for Saturday (18 Oct 2026)."
2. **Stage B — Discover 3 Hotspots:**
   - **Ticket Kiosk:** Missing context (vanishing placeholder text).
   - **Departure Board:** Confusing feedback (color-only error indicators).
   - **Help Desk:** Unclear actions (competing button hierarchy).
3. **Stage C — The Booking Challenge:** Hands-on form with real live elapsed timer and error counter, hints drawer, and post-task forensic case file.
4. **Stage D — Designer Mode:** Interactive 3-step repair puzzles with instant feedback, explanations, and sticker unlocks.
5. **Stage E — Replay Improved Flow:** Polished booking with persistent `<label>` tags, inline validation, 48px targets, visible focus rings, single high-contrast primary CTA, and boarding pass success state.

---

## 🎨 Visual System & Typography

- **Display Face:** Self-hosted *Archivo Variable* (expanded, weight 900) styled with glossy metallic gradients, reflective highlights, fine dark outlines, and extruded 3D drop-shadows inspired by retro arcade posters.
- **Body & Controls:** Self-hosted *Space Grotesk* for high-contrast, crystal-clear readability.
- **Palette:** Warm paper (`#FFF6E5`), Ink (`#17131F`), Cherry red (`#FF3B30`), Tangerine (`#FF8A1F`), Sun yellow (`#FFD23F`), Hot pink (`#FF3D8B`), and Mint (`#B6FFB2`).
- **Tactile UI:** Chunky 3px solid ink borders, hard offset shadows, white die-cut sticker badges, and custom SVG icons (no generic emojis as primary icons).

---

## 🧪 Verification & Checks

| Check | Tool | Status |
|---|---|---|
| **TypeScript** | `tsc --noEmit` | **PASS (0 errors)** |
| **Linting** | `tsc --noEmit` with strict verbatim syntax | **PASS (0 errors)** |
| **Unit Tests** | `node --test src/tests/*.test.ts` | **PASS (8/8 tests pass)** |
| **Production Build** | `tsc -b && vite build` | **PASS (clean bundle in dist/)** |
| **Playwright Automation** | Headless Chromium smoke run | **PASS (all flows verified)** |
| **A11y & Motion** | `prefers-reduced-motion` & WCAG AA contrast | **PASS** |

### Verified Screenshots
- `screenshots/desktop-hero.png` — 1440 × 900 desktop hero with procedural 3D station.
- `screenshots/mobile-hero.png` — 390 × 844 responsive mobile layout.
- `screenshots/desktop-mission.png` — Interactive Stage 1 (Before) booking challenge.
- `screenshots/desktop-repair.png` — Designer Mode repair puzzle with active feedback.
- `screenshots/mobile-mission.png` — Mobile booking challenge form.

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
