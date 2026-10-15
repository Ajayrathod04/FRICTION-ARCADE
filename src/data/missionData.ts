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
  taskPrompt: 'Book two seats from Mumbai to Pune for Saturday, 18 Oct 2026.',
  destination: 'Pune',
  origin: 'Mumbai',
  targetDate: '2026-10-18',
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
        description: 'E.g., "Enter date as YYYY-MM-DD (e.g. 18 Oct 2026)" with high contrast.',
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
