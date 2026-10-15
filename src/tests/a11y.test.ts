import test from 'node:test';
import assert from 'node:assert/strict';
import { isWebGLAvailable } from '../lib/a11y.ts';
import { loadUserPrefs, formatSeconds } from '../lib/storage.ts';

test('isWebGLAvailable handles SSR / non-browser gracefully', () => {
  // In Node environment without window/DOM, must return false without crashing
  const result = isWebGLAvailable();
  assert.equal(result, false);
});

test('loadUserPrefs returns standard accessible defaults', () => {
  const prefs = loadUserPrefs();
  assert.equal(typeof prefs.skip3D, 'boolean');
  assert.equal(typeof prefs.reducedMotion, 'boolean');
  assert.equal(typeof prefs.highContrast, 'boolean');
  assert.equal(prefs.skip3D, false);
});

test('timing formatter edge cases', () => {
  assert.equal(formatSeconds(3599), '59:59');
  assert.equal(formatSeconds(60), '01:00');
  assert.equal(formatSeconds(9), '00:09');
});
