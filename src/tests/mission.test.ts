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
