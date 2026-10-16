/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Volume2,
  Sliders,
  Check,
  CheckCircle2,
  FileAudio
} from 'lucide-react';
import { VoiceProfile, POPULAR_VOICES } from '../utils/voiceCatalog.ts';
import {
  GranularVoiceSettings,
  EMOTION_PRESETS,
  EmotionType,
  estimateAudioDuration,
  cleanScriptText,
} from '../utils/ssmlHelper.ts';
import { WaveformVisualizer } from './WaveformVisualizer.tsx';

interface StudioEditorProps {
  activeVoice: VoiceProfile;
  onSelectVoice: (voice: VoiceProfile) => void;
  script: string;
  onScriptChange: (newScript: string) => void;
  voiceSettings: GranularVoiceSettings;
  onVoiceSettingsChange: (newSettings: GranularVoiceSettings) => void;
}

export const StudioEditor: React.FC<StudioEditorProps> = ({
  activeVoice,
  onSelectVoice,
  script,
  onScriptChange,
  voiceSettings,
  onVoiceSettingsChange,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationEstimate = estimateAudioDuration(script, voiceSettings.speed);

  const handleSynthesize = async () => {
    // Automatically strip any bracket sounds so the model never reads bracket tags
    const cleanedText = cleanScriptText(script);
    if (!cleanedText) return;

    setIsSynthesizing(true);
    const start = performance.now();

    try {
      const res = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanedText,
          voiceName: activeVoice.geminiBaseVoice,
          settings: voiceSettings,
        }),
      });

      const data = await res.json();
      if (data.audioItem?.audioBase64) {
        const url = `data:audio/wav;base64,${data.audioItem.audioBase64}`;
        setCurrentAudioUrl(url);
        setLastLatencyMs(Math.round(performance.now() - start));

        // Start playback
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setIsPlaying(true);
          }
        }, 80);
      }
    } catch (_err) {
      // Graceful fallback
    } finally {
      setIsSynthesizing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const downloadWav = () => {
    if (!currentAudioUrl) return;
    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `speakai_${activeVoice.name.toLowerCase()}.wav`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <audio
        ref={audioRef}
        src={currentAudioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Voice Selection (Top 8 Curated Voices) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Select Voice Anchor ({POPULAR_VOICES.length} Curated Voices)
          </label>
          <span className="text-xs text-green-400 font-medium">
            Active: <strong className="text-white">{activeVoice.name}</strong> ({activeVoice.accent})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {POPULAR_VOICES.map(voice => {
            const isSelected = voice.id === activeVoice.id;
            return (
              <button
                key={voice.id}
                onClick={() => onSelectVoice(voice)}
                className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-zinc-900 border-green-500 shadow-sm ring-1 ring-green-500/50'
                    : 'bg-black border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{voice.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-green-400" />}
                  </div>
                  <span className="text-[11px] text-zinc-400 block">{voice.category}</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 truncate">
                  {voice.accent} • {voice.gender}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Area & Granular Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clean Text Area (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileAudio className="w-3.5 h-3.5 text-green-400" />
                Speech Script
              </span>

              <div className="text-[11px] font-mono text-zinc-400">
                {durationEstimate.wordCount} words • ~{durationEstimate.formattedDuration}
              </div>
            </div>

            <textarea
              value={script}
              onChange={e => onScriptChange(e.target.value)}
              rows={8}
              placeholder="Enter your script text to convert into natural speech..."
              className="w-full bg-black border border-zinc-800 rounded-lg p-3.5 text-white font-sans text-sm leading-relaxed focus:outline-none focus:border-green-500 resize-none placeholder-zinc-600"
            />
          </div>

          {/* Master Waveform & Player */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                Synthesized Output
              </span>
              {lastLatencyMs && (
                <span className="font-mono text-green-400">
                  Synthesized in {lastLatencyMs}ms
                </span>
              )}
            </div>

            <WaveformVisualizer isPlaying={isPlaying} height={52} />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={togglePlayback}
                  disabled={!currentAudioUrl}
                  className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 flex items-center justify-center text-white transition border border-zinc-700"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 text-green-400" /> : <Play className="w-4 h-4 text-green-400 ml-0.5" />}
                </button>

                <button
                  onClick={downloadWav}
                  disabled={!currentAudioUrl}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-black border border-zinc-800 hover:border-zinc-700 text-zinc-300 disabled:opacity-40 text-xs font-medium transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download WAV</span>
                </button>
              </div>

              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing || !script.trim()}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isSynthesizing ? (
                  <span>Generating Speech...</span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Synthesize Audio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Granular Controls */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-green-400" />
                Granular Controls
              </span>

              <button
                onClick={() =>
                  onVoiceSettingsChange({
                    pitch: 0,
                    speed: 1.0,
                    emotion: 'neutral',
                  })
                }
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                title="Reset to defaults"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Emotion Tone */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Emotion Tone
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(EMOTION_PRESETS).map(([key, info]) => {
                  const isSelected = voiceSettings.emotion === key;
                  return (
                    <button
                      key={key}
                      onClick={() =>
                        onVoiceSettingsChange({
                          ...voiceSettings,
                          emotion: key as EmotionType,
                        })
                      }
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium truncate transition ${
                        isSelected
                          ? 'bg-zinc-800 border border-green-500 text-green-400'
                          : 'bg-black border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium">Speed / Rate</span>
                <span className="font-mono text-green-400">{voiceSettings.speed.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.05}
                value={voiceSettings.speed}
                onChange={e =>
                  onVoiceSettingsChange({
                    ...voiceSettings,
                    speed: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-green-500 bg-black h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>0.5x Slow</span>
                <span>1.0x Normal</span>
                <span>2.0x Fast</span>
              </div>
            </div>

            {/* Pitch Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-zinc-300 font-medium">Pitch</span>
                <span className="font-mono text-green-400">
                  {voiceSettings.pitch > 0 ? `+${voiceSettings.pitch}%` : `${voiceSettings.pitch}%`}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={voiceSettings.pitch}
                onChange={e =>
                  onVoiceSettingsChange({
                    ...voiceSettings,
                    pitch: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-green-500 bg-black h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>-50% Deep</span>
                <span>0 Normal</span>
                <span>+50% High</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
