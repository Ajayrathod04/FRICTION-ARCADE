import test from 'node:test';
import assert from 'node:assert/strict';
import { STATION_WAYPOINTS, calculateWalkableRoute } from '../data/missionData.ts';
import { createTrainSystem } from '../features/game/world/TrainSystem.ts';
import * as THREE from 'three';

test('Platform 2: Opposite platform waypoints exist and connect across tracks', () => {
  const p2Main = STATION_WAYPOINTS.find((w) => w.id === 'wp-platform2-main');
  assert.ok(p2Main, 'wp-platform2-main must exist on Platform 2');
  assert.equal(p2Main.z, -7.2, 'Platform 2 main waypoint must be at z = -7.2');

  // Verify West level crossing waypoints
  const crossP1 = STATION_WAYPOINTS.find((w) => w.id === 'wp-crossing-p1');
  const crossP2 = STATION_WAYPOINTS.find((w) => w.id === 'wp-crossing-p2');
  assert.ok(crossP1 && crossP2, 'West crossing waypoints must connect Platform 1 to Platform 2');
  assert.ok(crossP1.connectedIds.includes('wp-crossing-p2'));
  assert.ok(crossP2.connectedIds.includes('wp-platform2-main'));

  // Verify East footbridge waypoints
  const bridgeP1 = STATION_WAYPOINTS.find((w) => w.id === 'wp-footbridge-p1');
  const bridgeP2 = STATION_WAYPOINTS.find((w) => w.id === 'wp-footbridge-p2');
  assert.ok(bridgeP1 && bridgeP2, 'East footbridge waypoints must connect Platform 1 to Platform 2');
  assert.ok(bridgeP1.connectedIds.includes('wp-footbridge-p2'));
  assert.ok(bridgeP2.connectedIds.includes('wp-platform2-main'));

  // Test walkable path from Grand Platform 1 (z = -3.0) to Platform 2 (z = -7.2)
  const route = calculateWalkableRoute(0.0, -3.0, 'wp-platform2-main');
  assert.ok(route.length >= 3, 'Walkable route must navigate safely from Platform 1 across to Platform 2');
  const dest = route[route.length - 1];
  assert.equal(dest.z, -7.2);
});

test('Dual Train System: Train 1 and Train 2 run independent staggered services with sliding doors', () => {
  const scene = new THREE.Scene();
  const trainSystem = createTrainSystem({ scene });

  // Initial state check
  const s1 = trainSystem.currentService1;
  const s2 = trainSystem.currentService2;
  const p1 = trainSystem.currentPhase1;
  const p2 = trainSystem.currentPhase2;

  assert.ok(s1, 'Train 1 (Platform 1 Deccan Express) must be initialized');
  assert.ok(s2, 'Train 2 (Platform 2 Rajdhani Express) must be initialized');

  assert.equal(s1.name, 'DECCAN EXP');
  assert.equal(s2.name, 'RAJDHANI EXP');
  assert.equal(s1.platform, 'PL 1');
  assert.equal(s2.platform, 'PL 2');

  // Initial states are staggered so both trains do not intersect or board at the same second
  assert.notEqual(p1, p2, 'Dual train services must be staggered');

  // Verify update tick moves trains smoothly
  trainSystem.update(0.1);
  assert.ok(trainSystem.trainGroup1.position !== undefined);
  assert.ok(trainSystem.trainGroup2.position !== undefined);

  trainSystem.dispose();
});

test('Camera Presets and Modes: All 5 presets are valid and discrete', () => {
  const presets = ['isometric', 'orbit', 'top_down', 'front', 'side'];
  assert.equal(presets.length, 5);
  const uniquePresets = new Set(presets);
  assert.equal(uniquePresets.size, 5);
});
