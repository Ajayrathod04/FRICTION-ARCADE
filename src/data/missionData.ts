export interface ClueItem {
  id: 'kiosk' | 'board' | 'desk';
  title: string;
  stationObject: string;
  flawName: string;
  description: string;
  frictionExplanation: string;
  principle: string;
  badgeName: string;
  badgeIcon: string;
  badgeColor: string;
}

export interface RepairOption {
  id: string;
  label: string;
  description: string;
  isCorrect: boolean;
  explanation: string;
}

export interface RepairPuzzle {
  id: 'labels' | 'errors' | 'actions';
  title: string;
  prompt: string;
  options: RepairOption[];
}

export interface DesignRule {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
}

export const MISSION_DETAILS = {
  code: 'MISSION 01',
  name: 'THE LAST TICKET',
  taskPrompt: 'Book two seats from Mumbai to Pune for Saturday, 17 Oct 2026.',
  destination: 'Pune',
  origin: 'Mumbai',
  targetDate: '2026-10-17',
  targetSeats: 2,
  seatType: 'AC',
};

export const CLUES: Record<'kiosk' | 'board' | 'desk', ClueItem> = {
  kiosk: {
    id: 'kiosk',
    title: 'Ticket Kiosk — Missing Context',
    stationObject: 'Central Kiosk',
    flawName: 'Placeholder-Only Inputs',
    description: 'The fields rely solely on ghosted placeholder text rather than persistent visible labels.',
    frictionExplanation: 'When the visitor clicks or begins typing, the placeholder text vanishes. Cognitive load surges because the traveler must recall what the field requested.',
    principle: 'Persistent Form Labels & Accessible Associations',
    badgeName: 'Context Finder',
    badgeIcon: 'search',
    badgeColor: '#FFD23F',
  },
  board: {
    id: 'board',
    title: 'Departure Board — Confusing Feedback',
    stationObject: 'Overhead Board',
    flawName: 'Color-Only & Cryptic Error Feedback',
    description: 'The system highlights fields with a plain red outline and displays a generic "Invalid Input" alert without stating the problem or how to correct it.',
    frictionExplanation: 'Color alone excludes color-blind individuals and leaves everyone guessing whether the date format was invalid, the city was unrecognised, or seats were unavailable.',
    principle: 'Multimodal Error Identification & Actionable Guidance',
    badgeName: 'Error Hunter',
    badgeIcon: 'alert',
    badgeColor: '#FF3B30',
  },
  desk: {
    id: 'desk',
    title: 'Help Desk — Unclear Actions',
    stationObject: 'Customer Desk',
    flawName: 'Competing Actions & Poor Hierarchy',
    description: 'Primary and destructive buttons share the exact same gray visual weight, making the next step completely ambiguous.',
    frictionExplanation: 'Users hesitate when they cannot predict what clicking a button will do. Without clear visual hierarchy, travelers might accidentally abandon their booking.',
    principle: 'Predictable Action Hierarchy & High-Contrast CTA',
    badgeName: 'Flow Fixer',
    badgeIcon: 'wrench',
    badgeColor: '#8DDCFF',
  },
};

export const REPAIR_PUZZLES: RepairPuzzle[] = [
  {
    id: 'labels',
    title: 'Fix 1 of 3: Field Labels',
    prompt: 'How should form field labels be presented to eliminate friction?',
    options: [
      {
        id: 'A',
        label: 'A. Use clear, persistent labels above or alongside the input with proper HTML <label> tags.',
        description: 'Labels remain visible at all times, including while typing and reviewing.',
        isCorrect: true,
        explanation: 'Correct! Persistent labels maintain context, allow effortless review, and are fully read by screen readers.',
      },
      {
        id: 'B',
        label: 'B. Keep only placeholder text to make the form look minimal and clean.',
        description: 'Removes visual clutter at the cost of memory.',
        isCorrect: false,
        explanation: 'Placeholders disappear as soon as users type, forcing them to delete text to double check what was requested.',
      },
      {
        id: 'C',
        label: 'C. Rely on hover tooltips that show the label only when mouse hovers.',
        description: 'Requires mouse interaction to discover field purpose.',
        isCorrect: false,
        explanation: 'Hover tooltips fail for mobile touchscreens, keyboard navigation, and cognitive accessibility.',
      },
    ],
  },
  {
    id: 'errors',
    title: 'Fix 2 of 3: Error Feedback',
    prompt: 'How should validation errors be communicated effectively?',
    options: [
      {
        id: 'A',
        label: 'A. Provide clear inline text + warning icon + specific guidance on how to fix the error.',
        description: 'E.g., "Enter date as YYYY-MM-DD (e.g. 17 Oct 2026)" with high contrast.',
        isCorrect: true,
        explanation: 'Correct! Combining icons and descriptive text ensures users know exactly what went wrong and how to fix it immediately.',
      },
      {
        id: 'B',
        label: 'B. Flash the screen red and shake the field without showing any text.',
        description: 'Relies purely on sensory feedback.',
        isCorrect: false,
        explanation: 'Sensory feedback without explanation causes confusion and frustration, and violates accessibility guidelines.',
      },
      {
        id: 'C',
        label: 'C. Show a generic popup saying "Something went wrong" at the top corner.',
        description: 'Disconnected from the offending input.',
        isCorrect: false,
        explanation: 'Disconnected messages force the user to hunt across the entire form to discover which field was incorrect.',
      },
    ],
  },
  {
    id: 'actions',
    title: 'Fix 3 of 3: Action Hierarchy',
    prompt: 'How should the booking submission controls be styled and structured?',
    options: [
      {
        id: 'A',
        label: 'A. One prominent, high-contrast primary button ("Book Tickets →") with obvious secondary actions.',
        description: 'Clear visual weight, large touch target (48px+), and predictable next step.',
        isCorrect: true,
        explanation: 'Correct! Clear visual priority guides the user effortlessly toward task completion without hesitation.',
      },
      {
        id: 'B',
        label: 'B. Make "Cancel Booking" bright red and "Book Tickets" subtle gray.',
        description: 'Reverses customary action hierarchy.',
        isCorrect: false,
        explanation: 'Highlighting destructive actions over constructive ones causes accidental cancellations.',
      },
      {
        id: 'C',
        label: 'C. Hide the submit button until every single field has been touched.',
        description: 'Surprise appearance of key controls.',
        isCorrect: false,
        explanation: 'Hiding submit buttons confuses users who look for how to finish before filling out forms.',
      },
    ],
  },
];

export const DESIGN_RULES: DesignRule[] = [
  {
    id: 1,
    title: 'Clear Labels',
    subtitle: 'Not placeholders',
    description: 'Keep labels visible at all times. Placeholders vanish upon typing and strain short-term memory.',
    color: '#FFD23F',
    icon: 'tag',
  },
  {
    id: 2,
    title: '4.5:1 Contrast',
    subtitle: 'Make it readable',
    description: 'Ensure body text and form controls easily pass WCAG AA contrast standards in all lighting.',
    color: '#C7B5FF',
    icon: 'eye',
  },
  {
    id: 3,
    title: 'Not Colour Alone',
    subtitle: 'Use text + icon',
    description: 'Never communicate status exclusively with red or green. Combine symbols, borders, and clear wording.',
    color: '#FF8A1F',
    icon: 'palette',
  },
  {
    id: 4,
    title: 'Larger Targets',
    subtitle: 'At least 44-48px',
    description: 'Generous interactive tap zones prevent frustrating mis-taps on phones and aid motor precision.',
    color: '#8DDCFF',
    icon: 'target',
  },
  {
    id: 5,
    title: 'Visible Focus',
    subtitle: 'Keyboard friendly',
    description: 'Provide an unmistakable high-contrast focus ring for keyboard tab navigation and accessibility.',
    color: '#B6FFB2',
    icon: 'keyboard',
  },
  {
    id: 6,
    title: 'Helpful Errors',
    subtitle: 'Next step included',
    description: 'Tell users what happened and exactly what to do next. "Select Saturday, 18 Oct" beats "Invalid input".',
    color: '#FF3D8B',
    icon: 'alert-circle',
  },
  {
    id: 7,
    title: 'Logical Order',
    subtitle: 'Predictable flow',
    description: 'Arrange departure, destination, date, and seats in the natural order people plan their trips.',
    color: '#FFD23F',
    icon: 'arrow-down',
  },
  {
    id: 8,
    title: 'Plain Language',
    subtitle: 'Keep it simple',
    description: 'Replace technical jargon and confusing codes with plain, friendly instructions.',
    color: '#FFF6E5',
    icon: 'message',
  },
];

export const TIMETABLE_ITEMS = [
  { train: 'Deccan Express', origin: 'Mumbai CST', destination: 'Pune Jn', time: '10:30 AM', status: 'ON TIME', platform: 'P1' },
  { train: 'Pragati Express', origin: 'Mumbai CST', destination: 'Pune Jn', time: '11:15 AM', status: 'ON TIME', platform: 'P2' },
  { train: 'Indrayani Exp', origin: 'Mumbai CST', destination: 'Pune Jn', time: '12:40 PM', status: 'ON TIME', platform: 'P1' },
  { train: 'Sinhagad Express', origin: 'Mumbai CST', destination: 'Pune Jn', time: '02:20 PM', status: 'ON TIME', platform: 'P3' },
];

export interface AvatarChoice {
  id: 'explorer' | 'creative' | 'analyst';
  name: string;
  role: string;
  tagline: string;
  jacketColor: number;
  jacketCss: string;
  backpackColor: number;
  backpackCss: string;
  pantsColor: number;
  hairColor: number;
  hairStyle: 'tousled' | 'topknot' | 'parted';
  accessories: string;
  description: string;
}

export const AVATAR_CHOICES: AvatarChoice[] = [
  {
    id: 'explorer',
    name: 'The Explorer',
    role: 'Wayfarer & Scout',
    tagline: 'Notices hidden friction in fast-paced journeys',
    jacketColor: 0xff6b00,
    jacketCss: '#FF6B00',
    backpackColor: 0xffd23f,
    backpackCss: '#FFD23F',
    pantsColor: 0x221c30,
    hairColor: 0x221a16,
    hairStyle: 'tousled',
    accessories: 'Patched Backpack & Rolling Suitcase',
    description: 'Energetic adventurer sporting an iconic orange hoodie, bright yellow patched backpack, dark trousers, and rolling luggage.',
  },
  {
    id: 'creative',
    name: 'The Creative',
    role: 'Visual & Interaction Designer',
    tagline: 'Spots subtle aesthetic and layout misalignments',
    jacketColor: 0xff3d8b,
    jacketCss: '#FF3D8B',
    backpackColor: 0x8ddcff,
    backpackCss: '#8DDCFF',
    pantsColor: 0x36234b,
    hairColor: 0x4a2e18,
    hairStyle: 'topknot',
    accessories: 'Lilac/Pink Jacket & Sky-Blue Satchel',
    description: 'Stylishly outfitted in a vivid pink-magenta windbreaker, sky-blue satchel, topknot hairstyle, and mint accessories.',
  },
  {
    id: 'analyst',
    name: 'The Analyst',
    role: 'Cognitive & Systems Architect',
    tagline: 'Focused on clarity, predictability, and error logic',
    jacketColor: 0x2a85ff,
    jacketCss: '#2A85FF',
    backpackColor: 0xff8a1f,
    backpackCss: '#FF8A1F',
    pantsColor: 0x181e2e,
    hairColor: 0x161622,
    hairStyle: 'parted',
    accessories: 'Sky-Blue Coat & Retro Specs',
    description: 'Crisp and methodical with a sky-blue coat, tangerine utility pack, neat side-parted hairstyle, and clear focus.',
  },
];

export interface StationNPC {
  id: string;
  name: string;
  role: string;
  position: { x: number; z: number };
  dialogue: string;
  tip: string;
}

export const STATION_NPCS: StationNPC[] = [
  {
    id: 'arjun',
    name: 'Arjun',
    role: 'Ticket Kiosk Traveler',
    position: { x: 0.0, z: 0.65 },
    dialogue: 'I take the Deccan Express every Saturday. As soon as I clicked into the Date field, the placeholder "e.g. 17 Oct 2026" vanished! I had no idea whether it wanted DD/MM or YYYY-MM-DD!',
    tip: 'Persistent floating labels ensure travelers never have to guess input formats from memory.',
  },
  {
    id: 'meera',
    name: 'Meera',
    role: 'Departure Concourse Passenger',
    position: { x: 2.3, z: -0.85 },
    dialogue: 'Look at that Solari board! It just flashed "ALERT 404" in red. Is my train delayed, cancelled, or moving tracks? There is no explanation or recommended next step!',
    tip: 'Color alone is never enough for status alerts. Always pair icons with plain descriptive language and next steps.',
  },
  {
    id: 'kabir',
    name: 'Kabir',
    role: 'Help Desk Visitor',
    position: { x: -2.1, z: 0.55 },
    dialogue: 'I was using the customer terminal and almost tapped "Cancel Booking" because it looked identical to "Confirm Assistance"! Both buttons had the exact same bright purple style!',
    tip: 'Visual hierarchy is vital: primary actions must stand out, while destructive or secondary choices remain subdued.',
  },
  {
    id: 'priya',
    name: 'Agent Priya',
    role: 'Help Desk Concierge',
    position: { x: -2.6, z: 0.1 },
    dialogue: 'Welcome to Friction Station! Every day, dozens of travelers ask for help because interfaces hide crucial context or offer ambiguous choices. Help us fix the flow!',
    tip: 'Accessible design doesn\'t just help people with disabilities—it prevents errors for every tired, rushed traveler.',
  },
  {
    id: 'rajiv',
    name: 'Conductor Rajiv',
    role: 'Senior Train Guard',
    position: { x: -0.8, z: -2.9 },
    dialogue: 'The Deccan Express to Pune is on Platform 1! We depart promptly at 07:15. Once you solve the concourse design friction and book your ticket, I will welcome you aboard!',
    tip: 'A smooth booking experience gets travelers to their platforms calmly and on time.',
  },
  {
    id: 'rohan',
    name: 'Rohan',
    role: 'Transit Arcade Commuter',
    position: { x: -4.2, z: 2.8 },
    dialogue: 'Excuse me! This handwritten note says "Go to the far train", but Platform 1 and Platform 2 are on opposite sides! Do you know which track leads to the Pune Express?',
    tip: 'Unambiguous wayfinding signs prevent missed connections and reduce passenger anxiety.',
  },
];

// --- FRICTION ECHO: SIGNATURE GAMEPLAY MECHANIC ---
export interface FrictionEchoOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

export interface FrictionEchoData {
  hotspotId: 'kiosk' | 'board' | 'desk';
  passengerName: string;
  passengerRole: string;
  avatarColor: string;
  locationName: string;
  ghostStartPos: { x: number; z: number };
  ghostTargetPos: { x: number; z: number };
  hesitationPoint: { x: number; z: number };
  observationNarrative: string;
  hesitationAction: string;
  diagnosisPrompt: string;
  options: FrictionEchoOption[];
  afterRepairResolution: string;
}

export const STATION_ECHOES: Record<'kiosk' | 'board' | 'desk', FrictionEchoData> = {
  kiosk: {
    hotspotId: 'kiosk',
    passengerName: 'Arjun',
    passengerRole: 'Hurried Weekend Traveler',
    avatarColor: '#FF8A1F',
    locationName: 'Ticket Kiosk',
    ghostStartPos: { x: 0.2, z: 2.6 },
    ghostTargetPos: { x: 0.0, z: 0.5 },
    hesitationPoint: { x: 0.0, z: 0.7 },
    observationNarrative:
      'Arjun rushes to the Kiosk to book the Deccan Express. He taps into the origin field, types "M", and stops. The light-gray placeholder text vanished. He squints, rubs his forehead, presses backspace to re-read the ghosted prompt, and hesitates for 4 critical seconds.',
    hesitationAction:
      'Erasing typed characters repeatedly just to verify what the vanished placeholder originally requested.',
    diagnosisPrompt:
      'Diagnose the friction: What caused Arjun to freeze and erase his input at the ticket kiosk?',
    options: [
      {
        id: 'A',
        label: 'A. Disappearing placeholder labels forced Arjun to rely on fragile short-term recall.',
        isCorrect: true,
        explanation:
          'Exact diagnosis! Placeholders vanish upon typing. Without permanent HTML <label> tags, users must delete their input to confirm the field requirements.',
      },
      {
        id: 'B',
        label: 'B. The kiosk touch screen was physically unplugged or broken.',
        isCorrect: false,
        explanation:
          'Incorrect. The screen responded immediately, but the interface lost essential field context as soon as typing began.',
      },
      {
        id: 'C',
        label: 'C. The Deccan Express train had already departed.',
        isCorrect: false,
        explanation:
          'Incorrect. The schedule was active, but the form design imposed unnecessary cognitive load on the traveler.',
      },
    ],
    afterRepairResolution:
      'With persistent labels applied, Arjun reads "Departure Station" clearly above the box, types with confidence without second-guessing, and completes his booking in record time!',
  },
  board: {
    hotspotId: 'board',
    passengerName: 'Meera',
    passengerRole: 'Connecting Commuter',
    avatarColor: '#FF3D8B',
    locationName: 'Solari Departure Board',
    ghostStartPos: { x: -0.6, z: -2.2 },
    ghostTargetPos: { x: 2.2, z: -1.0 },
    hesitationPoint: { x: 2.0, z: -0.9 },
    observationNarrative:
      'Meera checks the departure board for her connecting express to Pune. The Solari display flashes red with a cryptic badge: "ALERT 404". There is no reason given, no alternate platform mentioned, and no recovery step provided. She looks anxiously back and forth between the tracks and the ceiling.',
    hesitationAction:
      'Staring at a flashing red badge with no text explanation of whether her train is delayed or cancelled.',
    diagnosisPrompt:
      'Diagnose the friction: Why is Meera stranded in confusion in front of the departure board?',
    options: [
      {
        id: 'A',
        label: 'A. The board used color-only and a cryptic error code without plain-language next steps.',
        isCorrect: true,
        explanation:
          'Exact diagnosis! Communicating status via red color and obscure codes violates accessibility heuristics. Systems must clearly explain what happened and what step to take next.',
      },
      {
        id: 'B',
        label: 'B. Meera forgot her glasses and could not see the letters.',
        isCorrect: false,
        explanation:
          'Incorrect. The board was in full view, but its ambiguous error feedback left her without actionable guidance.',
      },
      {
        id: 'C',
        label: 'C. The station was struck by a power outage.',
        isCorrect: false,
        explanation:
          'Incorrect. The board had full power, but its software failed to provide human-centered error recovery.',
      },
    ],
    afterRepairResolution:
      'With actionable status feedback restored, the board reads "ON TIME · Platform 1 · Gate Closes 10:25 AM" with green icons and clear platform directions. Meera walks straight to coach 3!',
  },
  desk: {
    hotspotId: 'desk',
    passengerName: 'Kabir',
    passengerRole: 'First-Time Passenger',
    avatarColor: '#8DDCFF',
    locationName: 'Customer Help Desk',
    ghostStartPos: { x: -1.4, z: 1.8 },
    ghostTargetPos: { x: -2.2, z: 0.6 },
    hesitationPoint: { x: -2.0, z: 0.6 },
    observationNarrative:
      'Kabir reaches Agent Priya at the Help Desk to confirm his senior citizen reservation. The counter tablet displays two identical wide gray buttons: "CANCEL RESERVATION" and "CONFIRM TICKETS". Both have the exact same size, gray background, and weight. Kabir hovers his index finger back and forth, terrified of accidentally deleting his ticket.',
    hesitationAction:
      'Hesitating between two identical gray buttons because the safe forward action lacks visual priority.',
    diagnosisPrompt:
      'Diagnose the friction: What stopped Kabir from pressing the confirmation button with confidence?',
    options: [
      {
        id: 'A',
        label: 'A. Primary and destructive actions shared equal visual weight, creating dangerous ambiguity.',
        isCorrect: true,
        explanation:
          'Exact diagnosis! Action hierarchy demands that constructive forward actions receive prominent visual priority (contrast, color, size), while destructive actions are visually secondary.',
      },
      {
        id: 'B',
        label: 'B. Agent Priya refused to speak with him.',
        isCorrect: false,
        explanation:
          'Incorrect. Agent Priya was ready to help, but the counter screen failed to provide intuitive visual hierarchy.',
      },
      {
        id: 'C',
        label: 'C. The tablet had run out of battery.',
        isCorrect: false,
        explanation:
          'Incorrect. The tablet was illuminated, but the competing buttons confused the user.',
      },
    ],
    afterRepairResolution:
      'With clear visual hierarchy applied, "Confirm Tickets →" stands out as a vibrant high-contrast orange button, while "Cancel" is a discreet secondary link. Kabir taps with a smile!',
  },
};

// --- SIGNATURE COLLECTIBLE REWARD SYSTEM: FRICTION TOKENS ---
export interface FrictionTokenItem {
  id: string;
  name: string;
  zone: 'city' | 'atrium' | 'concourse' | 'board' | 'desk' | 'lounge' | 'lab' | 'platform';
  x: number;
  z: number;
  value: number;
  description: string;
  lore: string;
}

export const FRICTION_TOKENS: FrictionTokenItem[] = [
  {
    id: 'tok-city',
    name: 'City Arrival Token',
    zone: 'city',
    x: 1.6,
    z: 5.8,
    value: 5,
    description: 'Found near the colorful Mumbai street approach and Victorian plaza facade.',
    lore: 'Minted to celebrate the opening of Mumbai Central Station pedestrian plaza.',
  },
  {
    id: 'tok-atrium',
    name: 'Atrium Clock Token',
    zone: 'atrium',
    x: -1.6,
    z: 2.6,
    value: 5,
    description: 'Resting by the grand mezzanine staircase and vintage pedestal clock.',
    lore: 'Features the twin-dial station clock with Roman numerals.',
  },
  {
    id: 'tok-kiosk',
    name: 'Kiosk Queue Token',
    zone: 'concourse',
    x: 1.0,
    z: 0.6,
    value: 10,
    description: 'Discovered along the royal blue carpet queue stanchions.',
    lore: 'Awarded for inspecting the missing context in the self-service kiosk.',
  },
  {
    id: 'tok-board',
    name: 'Solari Departure Token',
    zone: 'board',
    x: 5.2,
    z: -0.4,
    value: 10,
    description: 'Located in the Departure Gallery beneath the timetable display.',
    lore: 'Stamped with the mechanical split-flap timetable symbol.',
  },
  {
    id: 'tok-desk',
    name: 'Concierge Help Token',
    zone: 'desk',
    x: -5.2,
    z: 0.4,
    value: 10,
    description: 'Placed at the customer service wing near Agent Priya.',
    lore: 'Honors human-centered transit assistance and accessible advocacy.',
  },
  {
    id: 'tok-lounge',
    name: 'Transit Arcade Token',
    zone: 'lounge',
    x: -4.8,
    z: 3.4,
    value: 10,
    description: 'Tucked inside the Waiting Lounge near the tropical banana palms.',
    lore: 'A souvenir from the commuter rest pavilion and snack arcade.',
  },
  {
    id: 'tok-lab',
    name: 'Clarity Designer Token',
    zone: 'lab',
    x: 4.8,
    z: 3.4,
    value: 15,
    description: 'Found atop the Designer Workshop repair workbench.',
    lore: 'Earned by designers who turn friction into flow.',
  },
  {
    id: 'tok-platform',
    name: 'Platform 1 Express Token',
    zone: 'platform',
    x: 2.2,
    z: -3.2,
    value: 15,
    description: 'Waiting along the tactile platform safety line near Conductor Rajiv.',
    lore: 'Commemorates the 12127 Deccan Express departure to Pune.',
  },
];

// --- BADGES & ACHIEVEMENTS ---
export interface BadgeItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  category: 'mission' | 'exploration' | 'repair' | 'mastery';
}

export const GAME_BADGES: BadgeItem[] = [
  {
    id: 'badge-context',
    title: 'Context Finder',
    subtitle: 'Kiosk Investigation',
    description: 'Discovered why disappearing placeholder labels cause recall friction.',
    icon: 'search',
    color: '#FFD23F',
    category: 'mission',
  },
  {
    id: 'badge-error',
    title: 'Error Hunter',
    subtitle: 'Departure Gallery',
    description: 'Uncovered color-only status flags and ambiguous error codes.',
    icon: 'alert',
    color: '#FF3B30',
    category: 'mission',
  },
  {
    id: 'badge-flow',
    title: 'Flow Fixer',
    subtitle: 'Help Desk Wing',
    description: 'Diagnosed competing visual button weights and missing action hierarchy.',
    icon: 'wrench',
    color: '#8DDCFF',
    category: 'mission',
  },
  {
    id: 'badge-explorer',
    title: 'Station Explorer',
    subtitle: 'Connected World',
    description: 'Explored all 5 interior areas, the city plaza, and Platform 1.',
    icon: 'compass',
    color: '#B6FFB2',
    category: 'exploration',
  },
  {
    id: 'badge-boarding',
    title: 'First Boarding',
    subtitle: 'Deccan Express',
    description: 'Guided passengers to Platform 1 and watched them board the train.',
    icon: 'train',
    color: '#FF8A1F',
    category: 'mastery',
  },
  {
    id: 'badge-champion',
    title: 'Clarity Champion',
    subtitle: 'Full Flow Rescue',
    description: 'Completed all 3 repair puzzles with 100% accuracy and clarity.',
    icon: 'star',
    color: '#C7B5FF',
    category: 'mastery',
  },
];

// --- OPTIONAL SIDE QUESTS ---
export interface SideQuest {
  id: string;
  npcId: string;
  title: string;
  location: string;
  prompt: string;
  solutionChoice: string;
  rewardTokens: number;
  explanation: string;
}

export const SIDE_QUESTS: SideQuest[] = [
  {
    id: 'sq-rohan-wayfinding',
    npcId: 'rohan',
    title: 'Rohan\'s Wayfinding Query',
    location: 'Waiting Lounge & Transit Arcade',
    prompt: 'Rohan has an ambiguous note saying "Board on the right". Which explicit sign directs him safely to the Pune Deccan Express?',
    solutionChoice: 'Follow the overhead directional sign: "Platform 1 → Deccan Express (Pune)"',
    rewardTokens: 10,
    explanation: 'Clear directional wayfinding removes reliance on vague relative directions like "left" or "right".',
  },
];

// --- AUTHORED STATION WAYPOINTS & WALKABLE NAVIGATION GRAPH ---
export interface StationWaypoint {
  id: string;
  name: string;
  category: 'city' | 'atrium' | 'kiosk' | 'board' | 'desk' | 'lounge' | 'lab' | 'platform' | 'concourse';
  x: number;
  z: number;
  hotspotId?: 'kiosk' | 'board' | 'desk';
  description: string;
  connectedIds: string[];
}

export const STATION_WAYPOINTS: StationWaypoint[] = [
  // 1. City Arrival Plaza & Approach
  {
    id: 'wp-city-plaza',
    name: 'City Arrival Plaza',
    category: 'city',
    x: 0.0,
    z: 6.2,
    description: 'Colorful pastel Victorian city street approach and pedestrian plaza.',
    connectedIds: ['wp-city-approach'],
  },
  {
    id: 'wp-city-approach',
    name: 'Station Pedestrian Approach',
    category: 'city',
    x: 0.0,
    z: 4.4,
    description: 'Grand stone steps and station marquee entrance facade.',
    connectedIds: ['wp-city-plaza', 'wp-atrium'],
  },

  // 2. Grand Station Entrance & Victorian Atrium
  {
    id: 'wp-atrium',
    name: 'Grand Station Atrium',
    category: 'atrium',
    x: 0.0,
    z: 2.6,
    description: 'Double-height vaulted atrium with skylights, mezzanine stairs, and vintage clock tower.',
    connectedIds: ['wp-city-approach', 'wp-kiosk', 'wp-lounge', 'wp-lab'],
  },

  // 3. Area 1: Ticket Concourse & Kiosk
  {
    id: 'wp-kiosk',
    name: 'Ticket Concourse & Kiosk (Area 1)',
    category: 'kiosk',
    x: 0.0,
    z: 0.2,
    hotspotId: 'kiosk',
    description: 'Self-service automated ticketing terminals and blue carpet queue runner.',
    connectedIds: ['wp-atrium', 'wp-board', 'wp-desk', 'wp-platform-gate'],
  },

  // 4. Area 2: Departure Gallery
  {
    id: 'wp-board',
    name: 'Departure Gallery (Area 2)',
    category: 'board',
    x: 4.2,
    z: -0.6,
    hotspotId: 'board',
    description: 'Solari split-flap timetable gallery, destination status hierarchy, and platform signs.',
    connectedIds: ['wp-kiosk', 'wp-lab', 'wp-platform-east'],
  },

  // 5. Area 3: Passenger Services & Help Desk Wing
  {
    id: 'wp-desk',
    name: 'Passenger Services & Help Desk (Area 3)',
    category: 'desk',
    x: -4.2,
    z: 0.2,
    hotspotId: 'desk',
    description: 'Staffed customer service desk, Agent Priya, and accessible assistance terminal.',
    connectedIds: ['wp-kiosk', 'wp-lounge', 'wp-platform-west'],
  },

  // 6. Area 4: Waiting Lounge & Transit Arcade
  {
    id: 'wp-lounge',
    name: 'Waiting Lounge & Transit Arcade (Area 4)',
    category: 'lounge',
    x: -4.2,
    z: 3.0,
    description: 'Sunny rest area with teak benches, potted palms, snack counter, and commuter Rohan.',
    connectedIds: ['wp-atrium', 'wp-desk'],
  },

  // 7. Area 5: Designer Workshop & Clarity Lab
  {
    id: 'wp-lab',
    name: 'Designer Workshop & Clarity Lab (Area 5)',
    category: 'lab',
    x: 4.2,
    z: 3.0,
    description: 'Interactive UX repair stations, interface design workbench, and before/after previews.',
    connectedIds: ['wp-atrium', 'wp-board'],
  },

  // 8. Grand Platform 1 & Tracks
  {
    id: 'wp-platform-gate',
    name: 'Platform 1 Access Gate',
    category: 'concourse',
    x: 0.0,
    z: -1.6,
    description: 'Turnstile portal leading onto the passenger train platform.',
    connectedIds: ['wp-kiosk', 'wp-platform-main'],
  },
  {
    id: 'wp-platform-main',
    name: 'Grand Platform 1 (Boarding Area)',
    category: 'platform',
    x: 0.0,
    z: -3.0,
    description: 'Deccan Express boarding doors, tactile safety edge, and Conductor Rajiv.',
    connectedIds: ['wp-platform-gate', 'wp-platform-west', 'wp-platform-east'],
  },
  {
    id: 'wp-platform-west',
    name: 'Platform 1 West Ramp',
    category: 'platform',
    x: -3.5,
    z: -3.0,
    description: 'West platform walkway connecting to Customer Services.',
    connectedIds: ['wp-desk', 'wp-platform-main'],
  },
  {
    id: 'wp-platform-east',
    name: 'Platform 1 East Ramp',
    category: 'platform',
    x: 3.5,
    z: -3.0,
    description: 'East platform walkway connecting to Departure Gallery.',
    connectedIds: ['wp-board', 'wp-platform-main'],
  },
];

/**
 * Calculates a walkable route from the player's current position to a target landmark waypoint.
 * Uses breadcrumb search through the authored station navigation graph to guarantee that
 * paths never clip through walls, trains, or kiosk cabinets!
 */
export function calculateWalkableRoute(
  fromX: number,
  fromZ: number,
  targetWaypointId: string
): Array<{ x: number; z: number }> {
  const targetWp = STATION_WAYPOINTS.find((w) => w.id === targetWaypointId);
  if (!targetWp) return [{ x: fromX, z: fromZ }];

  // Find the closest waypoint to player start
  let nearestStart = STATION_WAYPOINTS[0];
  let minDist = Infinity;
  for (const wp of STATION_WAYPOINTS) {
    const d = Math.hypot(wp.x - fromX, wp.z - fromZ);
    if (d < minDist) {
      minDist = d;
      nearestStart = wp;
    }
  }

  // BFS search on graph
  const queue: Array<{ id: string; path: string[] }> = [{ id: nearestStart.id, path: [nearestStart.id] }];
  const visited = new Set<string>([nearestStart.id]);

  let bestPath: string[] = [nearestStart.id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.id === targetWaypointId) {
      bestPath = current.path;
      break;
    }
    const currentWp = STATION_WAYPOINTS.find((w) => w.id === current.id);
    if (!currentWp) continue;
    for (const neighborId of currentWp.connectedIds) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, path: [...current.path, neighborId] });
      }
    }
  }

  const resultPoints: Array<{ x: number; z: number }> = [{ x: fromX, z: fromZ }];
  for (const wpId of bestPath) {
    const wp = STATION_WAYPOINTS.find((w) => w.id === wpId);
    if (wp) {
      resultPoints.push({ x: wp.x, z: wp.z });
    }
  }
  // Ensure the target's exact coordinate is the final point
  if (resultPoints.length > 0) {
    resultPoints[resultPoints.length - 1] = { x: targetWp.x, z: targetWp.z };
  }
  return resultPoints;
}

