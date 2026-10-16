import test from 'node:test';
import assert from 'node:assert/strict';

// Route parser unit logic
function parseRoute(hash: string, pathname: string): { route: 'landing' | 'game'; is2D: boolean } {
  const isPlay = hash.startsWith('#/play') || hash.startsWith('#play') || pathname === '/play';
  const is2D = hash.includes('mode=2d');
  return {
    route: isPlay ? 'game' : 'landing',
    is2D,
  };
}

test('Route A: root and default hash routes map to landing page', () => {
  assert.equal(parseRoute('', '/').route, 'landing');
  assert.equal(parseRoute('#/', '/').route, 'landing');
  assert.equal(parseRoute('#', '/').route, 'landing');
  assert.equal(parseRoute('#hero', '/').route, 'landing');
  assert.equal(parseRoute('#story', '/').route, 'landing');
});

test('Route B: play paths map to independent game route', () => {
  assert.equal(parseRoute('#/play', '/').route, 'game');
  assert.equal(parseRoute('', '/play').route, 'game');
  assert.equal(parseRoute('#/play?mode=2d', '/').route, 'game');
  assert.equal(parseRoute('#/play?mode=2d', '/').is2D, true);
  assert.equal(parseRoute('#/play', '/').is2D, false);
});
