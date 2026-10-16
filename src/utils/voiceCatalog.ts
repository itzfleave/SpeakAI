/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male';
  accent: string;
  category: string;
  timbre: string;
  geminiBaseVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  sampleQuote: string;
}

export const POPULAR_VOICES: VoiceProfile[] = [
  {
    id: 'voice-puck',
    name: 'Puck',
    gender: 'male',
    accent: 'US Standard',
    category: 'News & Narration',
    timbre: 'Authoritative, resonant, and balanced',
    geminiBaseVoice: 'Puck',
    sampleQuote: 'Good evening. Here are the top stories shaping world markets today.',
  },
  {
    id: 'voice-kore',
    name: 'Kore',
    gender: 'female',
    accent: 'British RP',
    category: 'Documentary',
    timbre: 'Velvety, warm, measured, and natural',
    geminiBaseVoice: 'Kore',
    sampleQuote: 'Across the vast expanse of the northern tundra, the quiet migration begins.',
  },
  {
    id: 'voice-charon',
    name: 'Charon',
    gender: 'male',
    accent: 'US Mid-Atlantic',
    category: 'Cinematic & Audiobooks',
    timbre: 'Deep baritone with rich gravitas',
    geminiBaseVoice: 'Charon',
    sampleQuote: 'In a world shaped by technological convergence, one voice guided the way.',
  },
  {
    id: 'voice-zephyr',
    name: 'Zephyr',
    gender: 'female',
    accent: 'US Standard',
    category: 'Commercial & Podcast',
    timbre: 'Bright, cheerful, and dynamic',
    geminiBaseVoice: 'Zephyr',
    sampleQuote: 'Welcome back to the podcast. Today we explore instantaneous neural audio generation.',
  },
  {
    id: 'voice-fenrir',
    name: 'Fenrir',
    gender: 'male',
    accent: 'Australian',
    category: 'Live & Sports',
    timbre: 'Energetic, crisp, and high-presence',
    geminiBaseVoice: 'Fenrir',
    sampleQuote: 'Down the final stretch, the lead changes hands in an extraordinary finish!',
  },
  {
    id: 'voice-aoede',
    name: 'Aoede',
    gender: 'female',
    accent: 'International English',
    category: 'Corporate & Tech',
    timbre: 'Articulate, executive, and lucid',
    geminiBaseVoice: 'Kore',
    sampleQuote: 'Our neural pipeline processes streaming requests with sub-fifty millisecond latency.',
  },
  {
    id: 'voice-orpheus',
    name: 'Orpheus',
    gender: 'male',
    accent: 'Canadian',
    category: 'Storyteller',
    timbre: 'Calm, contemplative, and reassuring',
    geminiBaseVoice: 'Puck',
    sampleQuote: 'The quiet evening settled over the harbor as the lighthouse began its gentle sweep.',
  },
  {
    id: 'voice-thalia',
    name: 'Thalia',
    gender: 'female',
    accent: 'US West Coast',
    category: 'Conversational',
    timbre: 'Friendly, warm, and approachable',
    geminiBaseVoice: 'Zephyr',
    sampleQuote: 'Hey there! Let me know whenever you are ready to get started on your project.',
  },
];

export function getPopularVoices(): VoiceProfile[] {
  return POPULAR_VOICES;
}
