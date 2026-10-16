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
    id: 'priya',
    name: 'Agent Priya',
    role: 'Help Desk Concierge',
    position: { x: -2.4, z: 0.8 },
    dialogue: 'Welcome to Friction Station! If a form seems confusing, look for where your attention gets lost.',
    tip: 'Clear action buttons save travelers from abandoning their tickets!',
  },
  {
    id: 'arjun',
    name: 'Arjun',
    role: 'Daily Commuter',
    position: { x: 1.2, z: 1.8 },
    dialogue: 'I take the Deccan Express every Saturday. Last week I misbooked because the placeholder vanished when I typed!',
    tip: 'Persistent labels mean you never have to re-read from memory.',
  },
  {
    id: 'rajiv',
    name: 'Conductor Rajiv',
    role: 'Senior Train Guard',
    position: { x: -0.8, z: -3.0 },
    dialogue: 'Departures run on strict time. The board should tell people WHY a train is delayed, not just turn red.',
    tip: 'Color alone is never enough for accessible status alerts.',
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

// --- AUTHORED STATION WAYPOINTS & WALKABLE NAVIGATION GRAPH ---
export interface StationWaypoint {
  id: string;
  name: string;
  category: 'entrance' | 'kiosk' | 'board' | 'desk' | 'platform' | 'lounge' | 'concourse';
  x: number;
  z: number;
  hotspotId?: 'kiosk' | 'board' | 'desk';
  description: string;
  connectedIds: string[];
}

export const STATION_WAYPOINTS: StationWaypoint[] = [
  {
    id: 'wp-entrance',
    name: 'Main Entrance & Foyer',
    category: 'entrance',
    x: 0.2,
    z: 2.8,
    description: 'Station concourse entrance with wayfinding overhead marquee.',
    connectedIds: ['wp-center', 'wp-lounge'],
  },
  {
    id: 'wp-center',
    name: 'Central Concourse Plaza',
    category: 'concourse',
    x: 0.0,
    z: 1.2,
    description: 'Central hub connecting ticketing, departure boards, and customer service.',
    connectedIds: ['wp-entrance', 'wp-kiosk', 'wp-lounge', 'wp-board-path'],
  },
  {
    id: 'wp-kiosk',
    name: 'Ticket Kiosk (Checkpoint 1)',
    category: 'kiosk',
    x: 0.0,
    z: 0.2,
    hotspotId: 'kiosk',
    description: 'Self-service automated ticketing terminals.',
    connectedIds: ['wp-center', 'wp-platform-path', 'wp-board-path', 'wp-desk-path'],
  },
  {
    id: 'wp-board-path',
    name: 'East Corridor',
    category: 'concourse',
    x: 1.4,
    z: -0.4,
    description: 'Walkway leading to the Solari departure board.',
    connectedIds: ['wp-center', 'wp-kiosk', 'wp-board'],
  },
  {
    id: 'wp-board',
    name: 'Departure Board (Checkpoint 2)',
    category: 'board',
    x: 2.4,
    z: -1.2,
    hotspotId: 'board',
    description: 'Overhead LED Solari timetable board.',
    connectedIds: ['wp-board-path', 'wp-platform-east'],
  },
  {
    id: 'wp-desk-path',
    name: 'West Walkway',
    category: 'concourse',
    x: -1.4,
    z: 0.6,
    description: 'Passage towards Agent Priya customer service desk.',
    connectedIds: ['wp-kiosk', 'wp-lounge', 'wp-desk'],
  },
  {
    id: 'wp-desk',
    name: 'Help Desk (Checkpoint 3)',
    category: 'desk',
    x: -2.4,
    z: 0.4,
    hotspotId: 'desk',
    description: 'Staffed customer service desk and accessibility support.',
    connectedIds: ['wp-desk-path'],
  },
  {
    id: 'wp-lounge',
    name: 'Waiting Lounge & Benches',
    category: 'lounge',
    x: -1.4,
    z: 1.8,
    description: 'Rest area with wooden benches, planters, and commuter Rajiv.',
    connectedIds: ['wp-entrance', 'wp-center', 'wp-desk-path'],
  },
  {
    id: 'wp-platform-path',
    name: 'Central Platform Gate',
    category: 'concourse',
    x: 0.0,
    z: -1.4,
    description: 'Turnstile gate opening onto the passenger platform.',
    connectedIds: ['wp-kiosk', 'wp-platform-main', 'wp-platform-east'],
  },
  {
    id: 'wp-platform-main',
    name: 'Platform 1 (Deccan Express)',
    category: 'platform',
    x: 0.0,
    z: -2.8,
    description: 'Passenger train tracks and yellow safety tactile line.',
    connectedIds: ['wp-platform-path', 'wp-platform-east'],
  },
  {
    id: 'wp-platform-east',
    name: 'Platform 1 East Ramp',
    category: 'platform',
    x: 1.8,
    z: -2.6,
    description: 'East platform walkway connecting to departures.',
    connectedIds: ['wp-board', 'wp-platform-path', 'wp-platform-main'],
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

