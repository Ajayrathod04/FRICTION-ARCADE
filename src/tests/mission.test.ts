import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSION_DETAILS, CLUES, REPAIR_PUZZLES, DESIGN_RULES } from '../data/missionData.ts';
import { formatSeconds } from '../lib/storage.ts';

test('Mission specification integrity', () => {
  assert.equal(MISSION_DETAILS.code, 'MISSION 01');
  assert.equal(MISSION_DETAILS.name, 'THE LAST TICKET');
  assert.equal(MISSION_DETAILS.destination, 'Pune');
  assert.equal(MISSION_DETAILS.origin, 'Mumbai');
  assert.equal(MISSION_DETAILS.targetSeats, 2);
});

test('Clues definition has all 3 friction points', () => {
  assert.ok(CLUES.kiosk);
  assert.ok(CLUES.board);
  assert.ok(CLUES.desk);
  assert.equal(CLUES.kiosk.flawName, 'Placeholder-Only Inputs');
  assert.equal(CLUES.board.flawName, 'Color-Only & Cryptic Error Feedback');
  assert.equal(CLUES.desk.flawName, 'Competing Actions & Poor Hierarchy');
});

test('Repair puzzles have exactly one correct option each', () => {
  assert.equal(REPAIR_PUZZLES.length, 3);
  for (const puzzle of REPAIR_PUZZLES) {
    const correctOptions = puzzle.options.filter(o => o.isCorrect);
    assert.equal(correctOptions.length, 1, `Puzzle ${puzzle.id} must have exactly one correct answer`);
  }
});

test('8 Design Rules are defined and complete', () => {
  assert.equal(DESIGN_RULES.length, 8);
  assert.equal(DESIGN_RULES[0].title, 'Clear Labels');
  assert.equal(DESIGN_RULES[1].title, '4.5:1 Contrast');
});

test('formatSeconds utility converts seconds accurately', () => {
  assert.equal(formatSeconds(0), '00:00');
  assert.equal(formatSeconds(65), '01:05');
  assert.equal(formatSeconds(134), '02:14');
});

test('Friction Echo definitions have complete passenger journeys and valid diagnoses', async () => {
  const { STATION_ECHOES } = await import('../data/missionData.ts');
  const hotspots: Array<'kiosk' | 'board' | 'desk'> = ['kiosk', 'board', 'desk'];
  for (const h of hotspots) {
    const echo = STATION_ECHOES[h];
    assert.ok(echo, `Echo for ${h} must exist`);
    assert.ok(echo.passengerName, `Passenger name must be defined for ${h}`);
    assert.ok(echo.observationNarrative.length > 20, `Observation narrative must be substantive for ${h}`);
    assert.ok(echo.hesitationAction.length > 10, `Hesitation action must be defined for ${h}`);
    const correctOpts = echo.options.filter((o) => o.isCorrect);
    assert.equal(correctOpts.length, 1, `Echo for ${h} must have exactly one correct diagnosis`);
    assert.equal(echo.options.length, 3, `Echo for ${h} must have 3 diagnosis choices`);
  }
});

test('Walkable station route calculator outputs connected waypoints', async () => {
  const { calculateWalkableRoute } = await import('../data/missionData.ts');
  const entranceToKiosk = calculateWalkableRoute(0.2, 2.8, 'wp-kiosk');
  assert.ok(entranceToKiosk.length >= 2, 'Route from entrance to kiosk should have at least 2 nodes');
  assert.equal(entranceToKiosk[entranceToKiosk.length - 1].x, 0.0);
  assert.equal(entranceToKiosk[entranceToKiosk.length - 1].z, 0.2);

  const kioskToBoard = calculateWalkableRoute(0.0, 0.2, 'wp-board');
  assert.ok(kioskToBoard.length >= 2, 'Route from kiosk to board should have at least 2 nodes');
  assert.equal(kioskToBoard[kioskToBoard.length - 1].x, 2.4);
  assert.equal(kioskToBoard[kioskToBoard.length - 1].z, -1.2);
});

test('Mission State Machine transitions and objective progression', async () => {
  const { canTransitionTo, getNextObjectiveText } = await import('../features/game/state/missionStateMachine.ts');

  // Verify transition rules
  assert.equal(canTransitionTo('game_entry', 'avatar_select'), true);
  assert.equal(canTransitionTo('avatar_select', 'briefing'), true);
  assert.equal(canTransitionTo('briefing', 'exploration'), true);
  assert.equal(canTransitionTo('exploration', 'kiosk_investigation'), true);
  assert.equal(canTransitionTo('case_file_flow_lab', 'exploration'), true, 'Should allow returning to exploration');

  // Verify dynamic objective text
  const initialObj = getNextObjectiveText([], false, 'exploration');
  assert.match(initialObj, /Zone C.*Ticket Kiosk/);

  const boardObj = getNextObjectiveText(['kiosk'], false, 'exploration');
  assert.match(boardObj, /Zone D.*Departure Board/);

  const deskObj = getNextObjectiveText(['kiosk', 'board'], false, 'exploration');
  assert.match(deskObj, /Zone E.*Help Desk/);

  const bookingObj = getNextObjectiveText(['kiosk', 'board', 'desk'], false, 'exploration');
  assert.match(bookingObj, /Booking Challenge/);

  const flowLabObj = getNextObjectiveText(['kiosk', 'board', 'desk'], false, 'case_file_flow_lab');
  assert.match(flowLabObj, /Flow Lab/);

  const boardingObj = getNextObjectiveText(['kiosk', 'board', 'desk'], true, 'clarity_boarding');
  assert.match(boardingObj, /board the Deccan Express/);
});


