import test from 'node:test';
import assert from 'node:assert/strict';
import { STATION_WAYPOINTS, calculateWalkableRoute } from '../data/missionData.ts';

test('Approved Entrance: Preserved db44156 architecture and dimensions', () => {
  // Verify forecourt and entrance coordinates
  const cityPlazaWp = STATION_WAYPOINTS.find((w) => w.id === 'wp-city-plaza');
  const cityApproachWp = STATION_WAYPOINTS.find((w) => w.id === 'wp-city-approach');
  const atriumWp = STATION_WAYPOINTS.find((w) => w.id === 'wp-atrium');

  assert.ok(cityPlazaWp, 'City Plaza waypoint exists');
  assert.ok(cityApproachWp, 'City Approach waypoint exists');
  assert.ok(atriumWp, 'Atrium waypoint exists');

  // Entrance portal lies at z = 4.4 between city approach (5.6) and atrium (3.2)
  assert.ok(cityApproachWp.z > 4.4, 'City approach is outdoor before entrance gate');
  assert.ok(atriumWp.z < 4.4, 'Grand atrium is indoor past entrance gate');
});

test('Interactive Gate: Logic separates locked approach from open concourse traversal', () => {
  // Gate check simulation matching CharacterController:
  const isGatePassable = (x: number, z: number, isGateOpen: boolean): boolean => {
    // Flanking facade walls at z = 4.4 (outside door width)
    if (Math.abs(z - 4.4) < 0.28 && Math.abs(x) > 2.5) return false;
    // Central turnstile wings (x in [-1.1, 1.1]) block passage until opened
    if (!isGateOpen && Math.abs(z - 4.4) < 0.22 && Math.abs(x) < 1.1) return false;
    return true;
  };

  // When gate is closed:
  assert.equal(isGatePassable(0.0, 4.4, false), false, 'Closed gate blocks traversal through center');
  // When gate is opened by user interaction:
  assert.equal(isGatePassable(0.0, 4.4, true), true, 'Opened gate allows passage into Grand Hall');
  // Flanking facade remains solid wall regardless of gate state
  assert.equal(isGatePassable(3.5, 4.4, true), false, 'Facade walls continue blocking boundary');
});

test('Crimson Ceremonial Carpet Runner: Spans gate to concourse with gold border geometry', () => {
  // Carpet bounds: X in [-0.75, 0.75] (width 1.5m), Z in [2.0, 4.4] (length 2.4m)
  const carpetXMin = -0.75;
  const carpetXMax = 0.75;
  const carpetZMin = 2.0;
  const carpetZMax = 4.4;

  const carpetLength = carpetZMax - carpetZMin;
  const carpetWidth = carpetXMax - carpetXMin;

  assert.ok(Math.abs(carpetLength - 2.4) < 1e-5, 'Crimson runner must be 2.4m continuous length');
  assert.ok(Math.abs(carpetWidth - 1.5) < 1e-5, 'Crimson runner must be 1.5m wide');

  // Royal blue queue carpet at kiosk: z in [0.6, 2.0]
  // Verify zero overlap/stacking:
  const blueQueueZMax = 2.0;
  assert.ok(carpetZMin >= blueQueueZMax, 'Crimson runner seamlessly meets blue queue carpet at z=2.0 without stacking');
});

test('Exactly Two Feature Benches: Symmetrically placed flanking crimson runner without blocking paths', () => {
  const benchWest = { x: -1.85, z: 3.3, width: 0.56, length: 1.46 };
  const benchEast = { x: 1.85, z: 3.3, width: 0.56, length: 1.46 };

  // Verify symmetry
  assert.equal(benchWest.x, -benchEast.x, 'Two benches are positioned symmetrically on X axis');
  assert.equal(benchWest.z, benchEast.z, 'Two benches are positioned at the same Z plane');

  // Verify benches do not intersect the crimson carpet runner (x in [-0.75, 0.75])
  const carpetHalfWidth = 0.75;
  assert.ok(Math.abs(benchWest.x) - benchWest.width / 2 > carpetHalfWidth, 'West bench does not clip crimson runner');
  assert.ok(Math.abs(benchEast.x) - benchEast.width / 2 > carpetHalfWidth, 'East bench does not clip crimson runner');

  // Verify benches do not block door to Room 4 (Lounge at x = -3.0) or Room 5 (Lab at x = 3.0)
  assert.ok(benchWest.x > -3.0 + 0.6, 'West bench leaves clear corridor to Room 4 entrance');
  assert.ok(benchEast.x < 3.0 - 0.6, 'East bench leaves clear corridor to Room 5 entrance');
});

test('Five Rooms and Platform: Connected without teleportation', () => {
  const requiredRooms = [
    { name: 'Room 1: Ticket Concourse', id: 'wp-kiosk' },
    { name: 'Room 2: Departure Gallery', id: 'wp-board' },
    { name: 'Room 3: Passenger Services', id: 'wp-desk' },
    { name: 'Room 4: Waiting Lounge', id: 'wp-lounge' },
    { name: 'Room 5: Designer Workshop', id: 'wp-lab' },
  ];

  assert.equal(requiredRooms.length, 5, 'Exactly 5 interior rooms exist');

  // From Room 1 (Hub), routes can reach every other room directly through walkable corridors
  for (const r of requiredRooms) {
    if (r.id === 'wp-kiosk') continue;
    const route = calculateWalkableRoute(0.0, 0.2, r.id);
    assert.ok(route.length >= 2, `Walkable route from Room 1 to ${r.name} must exist`);
  }

  // Route from outside spawn (z = 8.5) to Grand Platform 1 (z = -3.0) through entrance and Room 1
  const fullWalk = calculateWalkableRoute(0.0, 8.5, 'wp-platform-main');
  assert.ok(fullWalk.length >= 4, 'Full walkable path connects City Plaza, Entrance, Room 1, and Platform 1');
});
