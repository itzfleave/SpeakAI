import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanScriptText,
  buildGeminiSpeechStyle,
  estimateAudioDuration,
  EMOTION_PRESETS,
} from './ssmlHelper.ts';

test('cleanScriptText removes all bracketed sounds and symbols', () => {
  const dirty = 'Hello world <breath> this is a [sound] test {laugh} and |yeah| cool.';
  const cleaned = cleanScriptText(dirty);
  assert.equal(cleaned, 'Hello world this is a test and cool.');
});

test('buildGeminiSpeechStyle incorporates emotion, speed and pitch correctly', () => {
  const style = buildGeminiSpeechStyle({
    pitch: 15,
    speed: 1.3,
    emotion: 'urgent',
  });

  assert.ok(style.includes(EMOTION_PRESETS.urgent.prompt));
  assert.ok(style.includes('1.30x rate'));
  assert.ok(style.includes('+15%'));
});

test('estimateAudioDuration calculates words and duration accurately', () => {
  const sample = 'Good morning. <breath> Today in tech, speech synthesis achieved real-time latency.';
  const est = estimateAudioDuration(sample, 1.0);
  assert.equal(est.wordCount, 10);
  assert.ok(est.durationSeconds > 0);
});
