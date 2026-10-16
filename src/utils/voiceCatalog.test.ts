import test from 'node:test';
import assert from 'node:assert/strict';
import { POPULAR_VOICES, getPopularVoices } from './voiceCatalog.ts';

test('getPopularVoices returns the popular curated voices (between 5 and 10)', () => {
  const voices = getPopularVoices();
  assert.ok(voices.length >= 5 && voices.length <= 10, `Expected 5-10 voices, got ${voices.length}`);
  assert.equal(voices.length, 8);

  const ids = new Set(voices.map(v => v.id));
  assert.equal(ids.size, voices.length, 'IDs must be unique');

  const names = voices.map(v => v.name);
  assert.ok(names.includes('Puck'));
  assert.ok(names.includes('Charon'));
  assert.ok(names.includes('Kore'));
  assert.ok(names.includes('Zephyr'));
  assert.ok(names.includes('Fenrir'));
});
