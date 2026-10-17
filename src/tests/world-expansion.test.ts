import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATION_WAYPOINTS,
  calculateWalkableRoute,
  FRICTION_TOKENS,
  GAME_BADGES,
  SIDE_QUESTS,
  CLUES,
  REPAIR_PUZZLES,
} from '../data/missionData.ts';
import { RewardLedger } from '../features/game/state/RewardLedger.ts';

test('Expanded Station World: All 8 zones have defined waypoints', () => {
  const waypointIds = STATION_WAYPOINTS.map((w) => w.id);
  const requiredLandmarks = [
    'wp-city-plaza',
    'wp-atrium',
    'wp-kiosk',
    'wp-board',
    'wp-desk',
    'wp-lounge',
    'wp-lab',
    'wp-platform-main',
  ];

  for (const req of requiredLandmarks) {
    assert.ok(waypointIds.includes(req), `Waypoint ${req} must exist in the world graph`);
  }
});

test('Walkable path graph connects City Plaza to Grand Platform 1', () => {
  // Player at City Arrival Plaza (z = 6.2) navigates to Grand Platform 1 (wp-platform-main)
  const route = calculateWalkableRoute(0.0, 6.2, 'wp-platform-main');
  assert.ok(route.length >= 4, 'Route from City Plaza to Platform 1 must navigate through intermediate zones');
  
  const destinationPoint = route[route.length - 1];
  assert.equal(destinationPoint.x, 0.0);
  assert.equal(destinationPoint.z, -3.0);
});

test('Friction Tokens are placed across station zones with unique IDs and positive values', () => {
  assert.ok(FRICTION_TOKENS.length >= 8, 'Must have at least 8 collectible tokens across zones');
  const seenIds = new Set<string>();

  for (const token of FRICTION_TOKENS) {
    assert.ok(!seenIds.has(token.id), `Duplicate token ID detected: ${token.id}`);
    seenIds.add(token.id);
    assert.ok(token.value > 0, `Token ${token.id} value must be positive`);
    assert.ok(token.x !== undefined && token.z !== undefined, `Token ${token.id} must have 3D coordinates`);
  }
});

test('Game Badges satisfy all 6 signature categories', () => {
  assert.equal(GAME_BADGES.length, 6, 'Must define exactly 6 signature game badges');
  const badgeIds = GAME_BADGES.map((b) => b.id);
  assert.ok(badgeIds.includes('badge-context'));
  assert.ok(badgeIds.includes('badge-error'));
  assert.ok(badgeIds.includes('badge-flow'));
  assert.ok(badgeIds.includes('badge-explorer'));
  assert.ok(badgeIds.includes('badge-boarding'));
  assert.ok(badgeIds.includes('badge-champion'));
});

test('Side Quests: Rohan wayfinding query is defined in Waiting Lounge', () => {
  const rohanQuest = SIDE_QUESTS.find((q) => q.id === 'sq-rohan-wayfinding');
  assert.ok(rohanQuest, 'Rohan wayfinding quest must be defined');
  assert.equal(rohanQuest.npcId, 'rohan');
  assert.ok(rohanQuest.rewardTokens >= 10);
});

test('RewardLedger prevents duplicate token harvesting and tracks balance', () => {
  RewardLedger.resetLifetimeRewards();
  assert.equal(RewardLedger.getState().tokenBalance, 0);

  // First collection
  const first = RewardLedger.collectToken('tok-city-plaza');
  assert.equal(first.success, true);
  assert.ok(first.amount > 0);
  assert.equal(RewardLedger.getState().tokenBalance, first.amount);
  assert.equal(RewardLedger.isTokenCollected('tok-city-plaza'), true);

  // Attempt duplicate collection from same trigger
  const duplicate = RewardLedger.collectToken('tok-city-plaza');
  assert.equal(duplicate.success, false);
  assert.equal(duplicate.amount, 0);
  assert.equal(RewardLedger.getState().tokenBalance, first.amount, 'Token balance must not duplicate');
});

test('RewardLedger unlocks badges correctly and tracks all visited zones', () => {
  RewardLedger.resetLifetimeRewards();

  // Test badge unlock
  const unlocked = RewardLedger.unlockBadge('badge-context');
  assert.equal(unlocked, true);
  assert.ok(RewardLedger.getState().unlockedBadgeIds.includes('badge-context'));

  // Unlock duplicate badge
  const repeat = RewardLedger.unlockBadge('badge-context');
  assert.equal(repeat, false);

  // Visit all required zones to earn Station Explorer
  const required = ['city', 'atrium', 'concourse', 'board', 'desk', 'lounge', 'lab', 'platform'];
  for (const zone of required) {
    RewardLedger.recordZoneVisit(zone);
  }
  assert.ok(RewardLedger.getState().unlockedBadgeIds.includes('badge-explorer'), 'Must earn Station Explorer after visiting all 8 zones');
});

test('Core UX mission clues and repair answers remain intact', () => {
  assert.equal(Object.keys(CLUES).length, 3);
  assert.equal(REPAIR_PUZZLES.length, 3);
  for (const puzzle of REPAIR_PUZZLES) {
    const correctOptions = puzzle.options.filter((o) => o.isCorrect);
    assert.equal(correctOptions.length, 1);
  }
});
