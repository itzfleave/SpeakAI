/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Creates a valid RIFF WAV audio buffer with realistic multi-tone harmonic frequencies
 * mimicking human vocal tract formants and pitch contour.
 */
export function generateSyntheticVoiceWav(
  durationSeconds = 2.5,
  sampleRate = 24000,
  fundamentalFreq = 160,
  speedMultiplier = 1.0,
  wordsCount = 8
): Buffer {
  const actualDuration = Math.max(0.8, durationSeconds / Math.max(0.5, speedMultiplier));
  const numSamples = Math.floor(sampleRate * actualDuration);
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate speech-like harmonic vocal formants (F0 fundamental, F1 500Hz vowel, F2 1500Hz, F3 2500Hz)
  const syllables = Math.max(4, wordsCount * 2);
  const syllableDuration = actualDuration / syllables;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const syllableIndex = Math.floor(t / syllableDuration);
    const syllablePhase = (t % syllableDuration) / syllableDuration;

    // Vocal envelope (attack, sustain, pause between syllables)
    const envelope = Math.sin(Math.PI * syllablePhase) ** 1.5 * (syllableIndex % 5 === 4 ? 0.2 : 0.85);

    // Natural micro-intonation pitch inflection
    const pitchDrift = Math.sin(2 * Math.PI * 0.8 * t) * 15 + Math.cos(2 * Math.PI * 2.5 * t) * 8;
    const f0 = fundamentalFreq + pitchDrift;

    // Harmonic formants for natural speech warmth
    const h1 = Math.sin(2 * Math.PI * f0 * t) * 0.45;
    const h2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25;
    const h3 = Math.sin(2 * Math.PI * 520 * t) * 0.20; // F1 vowel
    const h4 = Math.sin(2 * Math.PI * 1550 * t) * 0.10; // F2 formant

    const sampleFloat = (h1 + h2 + h3 + h4) * envelope;
    const sampleInt16 = Math.max(-32768, Math.min(32767, Math.floor(sampleFloat * 26000)));

    buffer.writeInt16LE(sampleInt16, 44 + i * 2);
  }

  return buffer;
}
