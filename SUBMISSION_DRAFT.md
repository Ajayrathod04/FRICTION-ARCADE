# Devpost Submission Draft — FRICTION ARCADE
**Hyperbloom October Hackathon**

---

### Project Name
**FRICTION ARCADE**

### Tagline
**Spot the friction. Fix the flow.**

---

## 💡 The Problem & Intended Audience

### The Problem
Most digital products still suffer from subtle, insidious UX friction:
1. **Vanishing context:** Forms that rely strictly on floating or placeholder-only labels become impossible to review once characters are typed.
2. **Ambiguous error states:** Cryptic error codes or color-only changes that fail to explain *what* went wrong, *where* it occurred, or *how* to recover.
3. **Muddled visual hierarchy:** Primary conversion actions competing with equal visual weight against secondary or destructive buttons (like "Cancel" or "Clear All").

While design guidelines (like Nielsen Norman heuristics and WCAG AA) document these problems extensively, most developers and aspiring designers only read about them abstractly. Static articles and passive video tutorials rarely convey the visceral frustration that poor UX causes everyday users.

### The Audience
- **Frontend engineers & full-stack builders:** Who want to understand *why* semantic HTML `<label>` elements and accessible inline errors matter beyond basic compliance.
- **UI/UX design students & juniors:** Seeking an engaging, experiential way to practice identifying cognitive friction and applying human-centered design heuristics.
- **Product managers & hackathon judges:** Anyone evaluating interactive, playful educational games that make abstract design concepts concrete and memorable.

---

## 🚀 The Solution & Complete User Journey

**FRICTION ARCADE** transforms abstract UX heuristics into an explorable, toy-like 3D railway station game where players encounter design flaws first-hand, discover the cognitive friction, repair the interface in Designer Mode, and witness the station itself transform through their solutions.

### Complete User Journey:
1. **Screen 01 — Landing Page:**
   - Striking retro-arcade poster typography and glossy 3D station preview.
   - Dual entry points: **Start the Mission →** (full 3D) or **Play Without 3D** (100% accessible 2D alternative).
   - Instant access to Duo Jam Co-op mode.
2. **Screen 02 — Character Selection Modal:**
   - Choose between 3 original stylised traveler avatars:
     - **The Explorer:** Orange puffer jacket, bright yellow patched backpack, dark trousers, and rolling suitcase.
     - **The Creative:** Hot pink hoodie, topknot hairstyle, mint-green backpack, and lavender duffel.
     - **The Analyst:** Sky-blue technical windbreaker, parted hair, tangerine bag, and slim briefcase.
   - Real-time Three.js turntable preview to inspect the selected avatar in 3D.
3. **Screen 03 — Introduction & Controls Briefing:**
   - Fictional mission briefing: `MISSION 01 — THE LAST TICKET` (Mumbai to Pune for 2 passengers on Saturday).
   - Clear controls guide for Desktop (`WASD` move, `Shift` sprint, `E` interact, `M` concourse map, `H` contextual hint, `Esc` pause) and mobile tap.
4. **Screen 04 — The Explorable 3D Station Concourse:**
   - Spatially navigable transit hub with ticket kiosks, Solari departure boards, staffed help desks, wooden benches, lush planters, concrete pillars, and a passenger train on the tracks.
   - Three animated in-world NPCs providing contextual dialogue and usability observations:
     - **Priya (Help Desk Attendant):** Insights on visual hierarchy and confusing choices.
     - **Arjun (Frequent Commuter):** Commentary on missing labels and ticket confusion.
     - **Rajiv (Conductor & Station Master):** Notes on departure status transparency.
   - Six animated glossy 3D collectibles floating across the concourse (ticket, sparkle star, route pin, magnifying glass, warning badge, repair token).
   - Concourse map overlay (`M`) and hint system (`H`).
5. **Screen 05 — Clue Discoveries (The Friction Trail):**
   - **Checkpoint 1 (Ticket Kiosk):** Discovers *Missing Context* caused by disappearing placeholder labels.
   - **Checkpoint 2 (Departure Board):** Discovers *Confusing Feedback* caused by ambiguous, color-only status changes.
   - **Checkpoint 3 (Help Desk):** Discovers *Unclear Actions* caused by competing button styles.
   - Earns 3 collectible ticket stamps.
6. **Screen 06 — Booking Challenge (BEFORE):**
   - The player attempts to book the tickets through a flawed booking form exhibiting the 3 UX issues.
   - An active stopwatch tracks elapsed time while a real validation engine counts genuine input errors.
7. **Screen 07 — Forensic Case Files:**
   - Visual breakdown of each discovered flaw, the human cognitive factors behind it, and the corresponding design heuristics.
8. **Screen 08 — Designer Mode (Interactive Repair Lab):**
   - The player switches from traveler to designer to solve 3 interactive repair puzzles.
   - Unanswered by default; provides instant educational feedback and allows retries.
   - Applying correct fixes updates the shared component preview in real time.
9. **Screen 09 — Booking Challenge (AFTER):**
   - Replays the exact same booking task using the repaired interface: persistent HTML `<label>` tags, inline specific feedback with icons, 48px touch targets, visible focus rings, and clear hierarchy.
   - Collects real before-and-after telemetry with zero invented numbers.
10. **Screen 10 — Clarity Mode: Station Transformation:**
    - The 3D station itself dynamically transforms in response to the player's repairs: the kiosk illuminates with permanent signage, the departure board switches to clear textual statuses, and the help desk highlights its primary service.
11. **Screen 11 — Results & Personal Run Recap:**
    - Earned stamps displayed on a collectible transit card.
    - Honest before vs. after comparison of actual elapsed time and error counts.
    - Explicit disclaimer stating that repetition naturally increases familiarity.
    - Stored personal best history in LocalStorage.
    - One-click copyable 8-point UX design checklist for developers.

---

## 🛠️ Technologies Actually Used

| Layer | Technology | Purpose |
|---|---|---|
| **Core Framework** | React 19 + TypeScript + Vite | Application shell, modular components, strict type safety, fast HMR. |
| **3D Rendering** | Three.js | Procedural 3D station concourse, lighting, articulated avatar meshes, character controller, collision boundaries, and interactive turntable previews. |
| **Styling & Design System** | Vanilla CSS with Design Tokens | High-contrast, tactile neo-arcade aesthetic with glossy gradients, extruded drop-shadows, responsive grid/flexbox layouts. |
| **Typography** | Self-hosted *Archivo Variable* & *Space Grotesk* | Expressive retro-arcade display headings paired with ultra-readable body and form typography. |
| **Accessibility (A11y)** | Semantic HTML5 + ARIA Live Regions | Screen-reader live announcements, visible focus outlines, WCAG AA color contrast, `prefers-reduced-motion` compliance. |
| **State & Persistence** | React Hooks + LocalStorage | Authoritative game-state machine, telemetry timer, error counters, and local personal-best persistence. |
| **Testing** | Node.js Test Runner (`node --test`) | Fast unit tests verifying mission parameters, clue definitions, repair puzzle logic, timing utilities, and SSR fallbacks. |

---

## 🎮 Controls & Demo Instructions

### Desktop Controls:
- **`W`, `A`, `S`, `D` / Arrow Keys:** Walk through the station concourse.
- **`Shift`:** Hold to sprint.
- **`E` or `Enter`:** Interact with nearby station objects (Kiosk, Board, Desk, NPCs).
- **`M`:** Open/close the concourse map overlay.
- **`H`:** Trigger a contextual hint for the current objective.
- **`Esc`:** Close open modals or return to the concourse.

### Mobile & Touch Controls:
- **Tap-to-Interact Hotspots:** Direct tapping on highlighted 3D objects or HUD action buttons.
- **Accessible 2D Mode:** Tap **"PLAY WITHOUT 3D"** on the landing page for a keyboard-navigable, screen-reader optimized 2D flow.

---

## 👥 Cooperative Mode: Duo Design Jam (Local 2-Player)

Inspired by the complementary-role mechanics of cooperative browser games like *CampusEvac*:
- **Role 1 — Field Traveler:** Moves through the 3D station, inspects physical objects, interacts with commuter NPCs, and attempts the initial booking task.
- **Role 2 — Lead Designer:** Reviews forensic case files, consults the overhead station schematic, selects UX repair options, and guides the team to victory.
- **Implementation Status:** Configured as a local, turn-based cooperative mode on the same device. *Note: Does not require or simulate cross-device networked multiplayer.*

---

## 🔍 Known Limitations & Honest Results

1. **Local Telemetry Disclaimer:** The before-and-after time comparison represents a personal learning exercise. Replaying any form inherently benefits from task familiarity, and this is explicitly noted on the results screen.
2. **Procedural Geometry:** The 3D world is generated entirely in procedural Three.js without downloading massive external GLTF/GLB models, ensuring instant loads under 1 second and zero third-party asset licensing concerns.
3. **No External Backend:** To guarantee privacy and zero server overhead, all progress and personal best records are stored strictly in client-side `localStorage`.

---

## 🎬 Video Demo Outline & Gallery Screenshots

### Recommended 2-Minute Video Flow:
1. **0:00 – 0:20 (The Hook):** Landing page, bold tagline *"Spot the friction. Fix the flow."*, and character selection with 3D turntable preview.
2. **0:20 – 0:45 (3D Exploration):** Walking through the 3D railway concourse, talking to Arjun the commuter, and inspecting the ticket kiosk to reveal the disappearing placeholder flaw.
3. **0:45 – 1:10 (The Frustrating Booking):** Attempting the BEFORE booking flow, triggering realistic validation errors, and reviewing the forensic case file.
4. **1:10 – 1:35 (Designer Mode):** Solving the 3 repair puzzles and seeing the shared component dynamically adopt persistent labels and inline error icons.
5. **1:35 – 1:50 (Clarity Mode Transformation):** Returning to the 3D station to see the kiosk, departure board, and help desk visually transformed.
6. **1:50 – 2:00 (Results & Takeaway):** The final transit pass card, actual before/after telemetry, and copyable design checklist.

### Suggested Screenshots for Gallery:
1. `01-hero-landing.png`: Glossy wordmark, retro-arcade poster layout, dual CTAs.
2. `02-character-select.png`: 3D turntable preview showing The Explorer in orange jacket and yellow backpack.
3. `03-station-exploration.png`: Third-person view of the 3D railway station concourse with train, board, and kiosk.
4. `04-clue-discovery.png`: Ticket kiosk inspection modal explaining vanishing placeholder context.
5. `05-booking-before.png`: Frustrating booking challenge with active error counter and validation feedback.
6. `06-designer-repair-lab.png`: Interactive repair puzzle with educational feedback and component preview.
7. `07-booking-after.png`: Accessible, repaired booking form with persistent labels and green success states.
8. `08-clarity-transformation.png`: Transformed station concourse illuminated with high-legibility signage.
9. `09-results-recap.png`: Complete mission recap card with honest telemetry, stamps, and checklist export.
10. `10-mobile-experience.png`: Responsive mobile layout and accessible 2D alternative mode.

---

## 🏆 Originality & Educational Value

- **Experiential UX Education:** Rather than preaching design guidelines through dry slides, FRICTION ARCADE forces the player to experience usability breakdowns first-hand before fixing them.
- **Direct Visual Consequence:** Solving design problems directly changes both the web application interface and the surrounding 3D game world.
- **Zero Third-Party Model Overhead:** 100% procedural Three.js assets and custom SVG iconography, providing lightweight performance on any device.
- **Universal Accessibility:** Seamless fallback between full 3D exploration and screen-reader accessible 2D gameplay.

---

### Hyperbloom Submission Metadata
- **Hackathon:** Hyperbloom October 2026
- **Submission Deadline:** October 19, 2026 at 5:00 PM EDT (October 20, 2026 at 2:30 AM IST)
- **Author:** AJRathod (`ajaybr2021@gmail.com`)
- **License:** MIT
- **Local Dev URL:** `http://127.0.0.1:5173/`
