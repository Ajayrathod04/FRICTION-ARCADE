/**
 * 12-Stage Mission State Machine for FRICTION ARCADE V3: THE LAST TRAIN: FLOW RESCUE
 * Provides strict, deterministic state transitions:
 * GAME_ENTRY -> AVATAR_SELECT -> BRIEFING -> EXPLORATION -> KIOSK_INVESTIGATION ->
 * BOARD_INVESTIGATION -> HELP_DESK_INVESTIGATION -> BEFORE_BOOKING -> CASE_FILE_FLOW_LAB ->
 * AFTER_BOOKING -> CLARITY_REPLAY_BOARDING -> MISSION_RESULTS
 */

export type MissionStage =
  | 'game_entry'
  | 'avatar_select'
  | 'briefing'
  | 'exploration'
  | 'kiosk_investigation'
  | 'board_investigation'
  | 'desk_investigation'
  | 'booking_before'
  | 'case_file_flow_lab'
  | 'booking_after'
  | 'clarity_boarding'
  | 'results';

export interface MissionRunState {
  stage: MissionStage;
  selectedAvatarId: 'explorer' | 'creative' | 'analyst';
  cluesFound: string[];
  repairsCompleted: string[];
  repairsComplete: boolean;
  activeHotspot: 'kiosk' | 'board' | 'desk' | null;
  activeWaypointId: string;
  isFrictionVisionActive: boolean;
  isBoardingSequence: boolean;
  beforeTimeSec: number;
  beforeErrors: number;
  afterTimeSec: number;
  afterErrors: number;
}

export const INITIAL_MISSION_STATE: MissionRunState = {
  stage: 'avatar_select',
  selectedAvatarId: 'explorer',
  cluesFound: [],
  repairsCompleted: [],
  repairsComplete: false,
  activeHotspot: null,
  activeWaypointId: 'wp-kiosk',
  isFrictionVisionActive: false,
  isBoardingSequence: false,
  beforeTimeSec: 0,
  beforeErrors: 0,
  afterTimeSec: 0,
  afterErrors: 0,
};

export function canTransitionTo(current: MissionStage, next: MissionStage): boolean {
  const stageOrder: MissionStage[] = [
    'game_entry',
    'avatar_select',
    'briefing',
    'exploration',
    'kiosk_investigation',
    'board_investigation',
    'desk_investigation',
    'booking_before',
    'case_file_flow_lab',
    'booking_after',
    'clarity_boarding',
    'results',
  ];

  const currIdx = stageOrder.indexOf(current);
  const nextIdx = stageOrder.indexOf(next);

  // Allow returning to exploration at any stage except results
  if (next === 'exploration') return true;
  // Allow advancing forward
  return nextIdx >= currIdx - 1;
}

export function getNextObjectiveText(cluesFound: string[], repairsComplete: boolean, stage: MissionStage): string {
  if (stage === 'booking_before') return 'Complete the fictional booking drill (BEFORE flow)';
  if (stage === 'case_file_flow_lab') return 'Solve the 3 Designer Mode repair puzzles in Flow Lab';
  if (stage === 'booking_after') return 'Replay the improved booking flow (AFTER flow)';
  if (stage === 'clarity_boarding') return 'Watch passengers board the Deccan Express for departure';
  if (stage === 'results') return 'Review personal run results and UX principles';

  if (!cluesFound.includes('kiosk')) {
    return 'Zone C: Investigate Arjun at Ticket Kiosk (Missing Context)';
  }
  if (!cluesFound.includes('board')) {
    return 'Zone D: Investigate Meera at Departure Board (Confusing Feedback)';
  }
  if (!cluesFound.includes('desk')) {
    return 'Zone E: Investigate Kabir at Help Desk (Unclear Actions)';
  }
  return 'Zone C: Launch the Mumbai-to-Pune Ticket Booking Challenge';
}
