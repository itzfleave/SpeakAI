import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCurlSnippet,
  generateNodeSnippet,
  generatePythonSnippet,
} from './apiSnippetGenerator.ts';

test('generateCurlSnippet builds valid curl commands for streaming and unary', () => {
  const curlUnary = generateCurlSnippet({
    apiKey: 'av_live_testkey_123',
    baseUrl: 'https://api.auravoice.io',
    voiceId: 'puck-broadcast-lead',
    text: 'Good morning listeners.',
    isStreaming: false,
    emotion: 'neutral_broadcast',
    speed: 1.0,
    pitch: 0,
    encryptPayload: true,
  });

  assert.ok(curlUnary.includes('curl -X POST'));
  assert.ok(curlUnary.includes('https://api.auravoice.io/api/v1/synthesize'));
  assert.ok(curlUnary.includes('av_live_testkey_123'));
  assert.ok(curlUnary.includes('AES-256-GCM'));

  const curlStream = generateCurlSnippet({
    apiKey: 'av_live_testkey_123',
    baseUrl: 'https://api.auravoice.io',
    voiceId: 'zephyr-urgent-bulletin',
    text: 'Breaking news update.',
    isStreaming: true,
    emotion: 'breaking_urgent',
    speed: 1.2,
    pitch: 5,
    encryptPayload: false,
  });

  assert.ok(curlStream.includes('/api/v1/synthesize/stream'));
  assert.ok(curlStream.includes('text/event-stream'));
});

test('generateNodeSnippet and generatePythonSnippet contain required handlers', () => {
  const nodeCode = generateNodeSnippet({
    apiKey: 'key_node',
    baseUrl: 'http://localhost:3000',
    voiceId: 'kore-master',
    text: 'Sample text',
    isStreaming: true,
    emotion: 'warm_narration',
    speed: 1.0,
    pitch: 0,
    encryptPayload: false,
  });
  assert.ok(nodeCode.includes('response.body.getReader()'));

  const pythonCode = generatePythonSnippet({
    apiKey: 'key_py',
    baseUrl: 'http://localhost:3000',
    voiceId: 'kore-master',
    text: 'Sample text',
    isStreaming: false,
    emotion: 'warm_narration',
    speed: 1.0,
    pitch: 0,
    encryptPayload: true,
  });
  assert.ok(pythonCode.includes('import requests'));
  assert.ok(pythonCode.includes('b64decode'));
});
