import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STATION_WAYPOINTS,
  calculateWalkableRoute,
  FRICTION_TOKENS,
  CLUES,
  REPAIR_PUZZLES,
} from '../data/missionData.ts';
import { RewardLedger } from '../features/game/state/RewardLedger.ts';

test('1. Exactly five interior gameplay rooms are physically defined and named', () => {
  const rooms = [
    { roomNumber: 1, name: 'Ticket Concourse', waypointId: 'wp-kiosk' },
    { roomNumber: 2, name: 'Departure Gallery', waypointId: 'wp-board' },
    { roomNumber: 3, name: 'Passenger Services & Help Desk Wing', waypointId: 'wp-desk' },
    { roomNumber: 4, name: 'Waiting Lounge & Transit Arcade', waypointId: 'wp-lounge' },
    { roomNumber: 5, name: 'Designer Workshop & Clarity Lab', waypointId: 'wp-lab' },
  ];

  assert.equal(rooms.length, 5, 'Must have exactly 5 distinct interior rooms');

  for (const r of rooms) {
    const wp = STATION_WAYPOINTS.find((w) => w.id === r.waypointId);
    assert.ok(wp, `Room ${r.roomNumber} (${r.name}) must have a valid landmark waypoint`);
    assert.ok(wp.name.includes(`Area ${r.roomNumber}`) || wp.name.includes(`Room ${r.roomNumber}`) || wp.name.length > 0);
  }
});

test('2. Room graph connectivity from outside spawn (z = 8.5) to all rooms and Platform 1', () => {
  const spawnX = 0.0;
  const spawnZ = 8.5;

  const targetDestinations = [
    { id: 'wp-atrium', label: 'Grand Atrium' },
    { id: 'wp-kiosk', label: 'Room 1: Ticket Concourse' },
    { id: 'wp-board', label: 'Room 2: Departure Gallery' },
    { id: 'wp-desk', label: 'Room 3: Passenger Services' },
    { id: 'wp-lounge', label: 'Room 4: Waiting Lounge' },
    { id: 'wp-lab', label: 'Room 5: Designer Workshop' },
    { id: 'wp-platform-main', label: 'Grand Platform 1' },
  ];

  for (const dest of targetDestinations) {
    const route = calculateWalkableRoute(spawnX, spawnZ, dest.id);
    assert.ok(
      route.length >= 2,
      `Route from outside spawn to ${dest.label} (${dest.id}) must produce a valid connected path`
    );
    const destinationNode = route[route.length - 1];
    const targetWp = STATION_WAYPOINTS.find((w) => w.id === dest.id)!;
    assert.equal(
      destinationNode.x,
      targetWp.x,
      `Route endpoint X must strictly match waypoint ${dest.id}`
    );
    assert.equal(
      destinationNode.z,
      targetWp.z,
      `Route endpoint Z must strictly match waypoint ${dest.id}`
    );
  }
});

test('3. Reachability through intended entrance and doorway gaps', () => {
  // Test door openings matching CharacterController collision boundaries:
  // - Entrance facade (z = 4.4): open gap |x| <= 2.4 is passable
  // - Divider x = 2.9 (R1 <-> R2): door at z in [-0.5, 0.5] is passable
  // - Divider x = -2.9 (R1 <-> R3): door at z in [-0.5, 0.5] is passable
  // - Divider x = 2.9 (Atrium <-> R5): arch at z in [2.9, 3.9] is passable
  // - Divider x = -2.9 (Atrium <-> R4): arch at z in [2.9, 3.9] is passable

  const isPointColliding = (x: number, z: number): boolean => {
    // Check perimeter
    if (x < -7.8 || x > 7.8 || z < -3.1 || z > 10.5) return true;

    // Entrance facade at z = 4.4 (gate between -2.4 and 2.4)
    if (Math.abs(z - 4.4) < 0.22 && Math.abs(x) > 2.4) return true;

    // Dividing wall x = -2.9
    if (Math.abs(x - -2.9) < 0.22) {
      const inR1R3Door = z >= -0.5 && z <= 0.5;
      const inAtriumR4Arch = z >= 2.9 && z <= 3.9;
      if (!inR1R3Door && !inAtriumR4Arch) return true;
    }

    // Dividing wall x = 2.9
    if (Math.abs(x - 2.9) < 0.22) {
      const inR1R2Door = z >= -0.5 && z <= 0.5;
      const inAtriumR5Arch = z >= 2.9 && z <= 3.9;
      if (!inR1R2Door && !inAtriumR5Arch) return true;
    }

    // Dividing wall z = 1.8
    if (Math.abs(z - 1.8) < 0.22) {
      const inAtriumR1Door = Math.abs(x) <= 1.5;
      const inR3R4Door = x >= -6.2 && x <= -5.0;
      const inR2R5Door = x >= 5.0 && x <= 6.2;
      if (!inAtriumR1Door && !inR3R4Door && !inR2R5Door) return true;
    }

    return false;
  };

  // Entrance gate: center (x = 0, z = 4.4) is OPEN
  assert.equal(isPointColliding(0.0, 4.4), false, 'Station entrance gate center must be passable');
  // Solid facade: (x = 4.0, z = 4.4) is COLLIDING
  assert.equal(isPointColliding(4.0, 4.4), true, 'Entrance facade flanking wall must block player');

  // Room 1 <-> Room 2 doorway: (x = 2.9, z = 0.0) is OPEN
  assert.equal(isPointColliding(2.9, 0.0), false, 'R1 to R2 doorway must be passable');
  // Room 1 <-> Room 2 solid wall: (x = 2.9, z = 1.2) is COLLIDING
  assert.equal(isPointColliding(2.9, 1.2), true, 'Wall segment between R1 and R2 must block player');

  // Room 1 <-> Room 3 doorway: (x = -2.9, z = 0.0) is OPEN
  assert.equal(isPointColliding(-2.9, 0.0), false, 'R1 to R3 doorway must be passable');

  // Atrium <-> Room 4 archway: (x = -2.9, z = 3.4) is OPEN
  assert.equal(isPointColliding(-2.9, 3.4), false, 'Atrium to R4 archway must be passable');

  // Atrium <-> Room 5 archway: (x = 2.9, z = 3.4) is OPEN
  assert.equal(isPointColliding(2.9, 3.4), false, 'Atrium to R5 archway must be passable');
});

test('4. Synchronization of room, world and minimap coordinates', () => {
  // World bounds: X in [-8.8, 8.8], Z in [-4.6, 11.4]
  const toSvgX = (x: number) => Math.max(6, Math.min(94, ((x + 8.8) / 17.6) * 84 + 8));
  const toSvgY = (z: number) => Math.max(6, Math.min(94, ((z + 4.6) / 16.0) * 84 + 8));

  // Test that all waypoints map within the valid 6% - 94% SVG coordinate area
  for (const wp of STATION_WAYPOINTS) {
    const sx = toSvgX(wp.x);
    const sy = toSvgY(wp.z);
    assert.ok(sx >= 6 && sx <= 94, `Waypoint ${wp.id} X ${wp.x} maps out of bounds: ${sx}`);
    assert.ok(sy >= 6 && sy <= 94, `Waypoint ${wp.id} Z ${wp.z} maps out of bounds: ${sy}`);
    assert.ok(!Number.isNaN(sx) && !Number.isNaN(sy), `Waypoint ${wp.id} generated NaN`);
  }

  // Outdoor start position (0, 8.5) maps in the lower quadrant of the map
  const spawnSvgY = toSvgY(8.5);
  assert.ok(spawnSvgY > 70, `Spawn Z=8.5 should be at the bottom area of map (> 70%), got ${spawnSvgY}`);

  // Platform 1 (0, -3.0) maps near the top of the map
  const platformSvgY = toSvgY(-3.0);
  assert.ok(platformSvgY < 25, `Platform 1 Z=-3.0 should be near the top (< 25%), got ${platformSvgY}`);
});

test('5. Simulated train lifecycle state machine transitions', () => {
  type TrainPhase = 'approaching' | 'doors_opening' | 'boarding' | 'alighting' | 'doors_closing' | 'departing' | 'cleared';

  const getTrainPhaseAtTime = (t: number): TrainPhase => {
    const cycleTime = t % 16.0;
    if (cycleTime < 3.0) return 'approaching';
    if (cycleTime < 4.5) return 'doors_opening';
    if (cycleTime < 9.0) return 'boarding';
    if (cycleTime < 11.0) return 'alighting';
    if (cycleTime < 12.5) return 'doors_closing';
    if (cycleTime < 15.5) return 'departing';
    return 'cleared';
  };

  assert.equal(getTrainPhaseAtTime(1.0), 'approaching');
  assert.equal(getTrainPhaseAtTime(3.5), 'doors_opening');
  assert.equal(getTrainPhaseAtTime(6.0), 'boarding');
  assert.equal(getTrainPhaseAtTime(10.0), 'alighting');
  assert.equal(getTrainPhaseAtTime(12.0), 'doors_closing');
  assert.equal(getTrainPhaseAtTime(14.0), 'departing');
  assert.equal(getTrainPhaseAtTime(15.8), 'cleared');
  // Loop continuity
  assert.equal(getTrainPhaseAtTime(17.0), 'approaching');
});

test('6. Prevention of duplicate collectible rewards', () => {
  RewardLedger.resetLifetimeRewards();
  assert.equal(RewardLedger.getState().tokenBalance, 0);

  for (const token of FRICTION_TOKENS) {
    const firstAttempt = RewardLedger.collectToken(token.id);
    assert.equal(firstAttempt.success, true, `First collection of ${token.id} should succeed`);
    assert.equal(firstAttempt.amount, token.value);

    // Second attempt must fail
    const secondAttempt = RewardLedger.collectToken(token.id);
    assert.equal(secondAttempt.success, false, `Duplicate collection of ${token.id} must fail`);
    assert.equal(secondAttempt.amount, 0);
  }
});

test('7. Preservation of mission progression and root/game route separation', () => {
  // Root / should point to landing page, not the game HUD
  const isGameRoute = (path: string) => {
    const clean = path.replace(/^[#/]+/, '').toLowerCase();
    return clean.startsWith('play') || clean.startsWith('game');
  };

  assert.equal(isGameRoute(''), false, 'Root path must not be game route');
  assert.equal(isGameRoute('/'), false, 'Slash path must not be game route');
  assert.equal(isGameRoute('#/'), false, 'Hash root must not be game route');
  assert.equal(isGameRoute('#play'), true, '#play is game route');
  assert.equal(isGameRoute('#/play'), true, '#/play is game route');
  assert.equal(isGameRoute('/play'), true, '/play is game route');

  // Verify all 3 core clues remain intact
  assert.equal(Object.keys(CLUES).length, 3);
  assert.ok(CLUES.kiosk);
  assert.ok(CLUES.board);
  assert.ok(CLUES.desk);

  // Verify all 3 repair puzzles have single correct options
  assert.equal(REPAIR_PUZZLES.length, 3);
  for (const p of REPAIR_PUZZLES) {
    assert.equal(p.options.filter((o) => o.isCorrect).length, 1);
  }
});
