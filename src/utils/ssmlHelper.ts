/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmotionType =
  | 'neutral'
  | 'urgent'
  | 'warm'
  | 'dramatic'
  | 'cheerful'
  | 'corporate';

export interface GranularVoiceSettings {
  pitch: number; // -50% to +50% (0 is default)
  speed: number; // 0.5x to 2.0x (1.0 is normal)
  emotion: EmotionType;
}

export const EMOTION_PRESETS: Record<EmotionType, { label: string; prompt: string }> = {
  neutral: {
    label: 'Neutral',
    prompt: 'Clear, objective, steady natural speech with standard pacing.',
  },
  urgent: {
    label: 'Breaking / Urgent',
    prompt: 'Dynamic, immediate, crisp broadcast style with heightened cadence.',
  },
  warm: {
    label: 'Warm & Velvety',
    prompt: 'Warm, natural, storytelling tone with gentle warmth.',
  },
  dramatic: {
    label: 'Dramatic',
    prompt: 'Deep, theatrical gravitas with controlled, expressive pacing.',
  },
  cheerful: {
    label: 'Cheerful & Upbeat',
    prompt: 'Bright, energetic, positive and enthusiastic tone.',
  },
  corporate: {
    label: 'Executive',
    prompt: 'Polished, confident, and professional presentation tone.',
  },
};

/**
 * Strips any bracketed tags (e.g. <breath>, [pause], {laugh}, |yeah|)
 * so the TTS model speaks natural continuous human speech without
 * reading bracket words literally.
 */
export function cleanScriptText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\|[^|]*\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds the speech metadata style instruction for Gemini TTS
 */
export function buildGeminiSpeechStyle(settings: GranularVoiceSettings): string {
  const parts: string[] = [];

  const emotionInfo = EMOTION_PRESETS[settings.emotion] || EMOTION_PRESETS.neutral;
  parts.push(emotionInfo.prompt);

  if (settings.speed !== 1.0) {
    if (settings.speed > 1.2) {
      parts.push(`Speaking pace: fast (${settings.speed.toFixed(2)}x rate).`);
    } else if (settings.speed < 0.8) {
      parts.push(`Speaking pace: slow and deliberate (${settings.speed.toFixed(2)}x rate).`);
    } else {
      parts.push(`Speaking pace: ${settings.speed.toFixed(2)}x.`);
    }
  }

  if (settings.pitch !== 0) {
    if (settings.pitch > 0) {
      parts.push(`Vocal pitch register: slightly higher (+${settings.pitch}%).`);
    } else {
      parts.push(`Vocal pitch register: deeper and lower (${settings.pitch}%).`);
    }
  }

  return parts.join(' ');
}

/**
 * Calculate approximate word count and duration in seconds
 */
export function estimateAudioDuration(text: string, speedMultiplier = 1.0): {
  wordCount: number;
  durationSeconds: number;
  formattedDuration: string;
} {
  const clean = cleanScriptText(text);
  const words = clean ? clean.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const baseWpm = 145;
  const effectiveWpm = baseWpm * Math.max(0.5, Math.min(2.0, speedMultiplier));
  const durationSeconds = wordCount === 0 ? 0 : Math.round((wordCount / effectiveWpm) * 60 * 10) / 10;

  const minutes = Math.floor(durationSeconds / 60);
  const remainingSecs = Math.floor(durationSeconds % 60);
  const formattedDuration = `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;

  return { wordCount, durationSeconds, formattedDuration };
}
