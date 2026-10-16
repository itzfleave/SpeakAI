import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encryptAudioBuffer,
  decryptAudioPayload,
  calculateSha256,
  generateRandomKey,
  importRawHexKey,
  bufferToBase64,
  base64ToBuffer,
} from './audioCrypto.ts';

test('Base64 encoding and decoding roundtrip preserves bytes', () => {
  const original = new Uint8Array([0, 1, 2, 255, 128, 64, 32, 16, 8, 4, 2, 1]);
  const b64 = bufferToBase64(original);
  const recovered = base64ToBuffer(b64);
  assert.deepEqual(Array.from(recovered), Array.from(original));
});

test('calculateSha256 returns valid 64-char hex checksum', async () => {
  const data = new TextEncoder().encode('AuraVoice-Broadcast-Stream-Test');
  const checksum = await calculateSha256(data);
  assert.equal(typeof checksum, 'string');
  assert.equal(checksum.length, 64);
  // deterministic check
  const checksum2 = await calculateSha256(data);
  assert.equal(checksum, checksum2);
});

test('AES-256-GCM encryption and decryption roundtrip with raw key', async () => {
  const fakeAudioData = new Uint8Array(1024);
  for (let i = 0; i < fakeAudioData.length; i++) {
    fakeAudioData[i] = (i * 17) % 256;
  }

  const { key } = await generateRandomKey();
  const metadata = {
    audioFormat: 'audio/wav',
    sampleRate: 24000,
    voiceId: 'puck-broadcast-pro',
    projectId: 'proj_morning_news',
  };

  const encryptedPayload = await encryptAudioBuffer(fakeAudioData, key, metadata);
  assert.equal(encryptedPayload.algorithm, 'AES-256-GCM');
  assert.ok(encryptedPayload.ciphertext.length > 0);
  assert.ok(encryptedPayload.authTag.length > 0);
  assert.ok(encryptedPayload.iv.length > 0);

  const decrypted = await decryptAudioPayload(encryptedPayload, key);
  assert.equal(decrypted.verifiedChecksum, true);
  assert.deepEqual(Array.from(decrypted.audioBytes), Array.from(fakeAudioData));
});

test('AES-256-GCM encryption with passphrase and tamper rejection', async () => {
  const fakeAudioData = new TextEncoder().encode('RIFF....WAVEfmt ....data');
  const passphrase = 'SuperSecretBroadcastEncryptionKey!#2026';
  const metadata = {
    audioFormat: 'audio/wav',
    sampleRate: 24000,
    voiceId: 'kore-master',
  };

  const encryptedPayload = await encryptAudioBuffer(fakeAudioData, passphrase, metadata);
  assert.ok(encryptedPayload.salt);

  // Decrypt with correct passphrase
  const decrypted = await decryptAudioPayload(encryptedPayload, passphrase);
  assert.deepEqual(Array.from(decrypted.audioBytes), Array.from(fakeAudioData));

  // Decrypt with wrong passphrase must fail
  await assert.rejects(
    async () => {
      await decryptAudioPayload(encryptedPayload, 'WrongPassphrase123');
    },
    /operation failed|authentication tag|decrypt/i
  );

  // Tampering with ciphertext must fail authentication
  const tamperedPayload = { ...encryptedPayload };
  const bytes = base64ToBuffer(tamperedPayload.ciphertext);
  bytes[0] ^= 0x55; // flip bits
  tamperedPayload.ciphertext = bufferToBase64(bytes);

  await assert.rejects(
    async () => {
      await decryptAudioPayload(tamperedPayload, passphrase);
    },
    /operation failed|authentication tag|decrypt/i
  );
});

test('importRawHexKey parses 64-char hex key', async () => {
  const { rawKeyHex } = await generateRandomKey();
  const imported = await importRawHexKey(rawKeyHex);
  assert.equal(imported.type, 'secret');
  assert.equal(imported.algorithm.name, 'AES-GCM');
});
