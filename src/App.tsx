/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, TabKey } from './components/Navbar.tsx';
import { StudioEditor } from './components/StudioEditor.tsx';
import { ApiExplorer } from './components/ApiExplorer.tsx';
import { POPULAR_VOICES, VoiceProfile } from './utils/voiceCatalog.ts';
import { GranularVoiceSettings } from './utils/ssmlHelper.ts';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('studio');
  const [activeVoice, setActiveVoice] = useState<VoiceProfile>(POPULAR_VOICES[0]);
  const [script, setScript] = useState<string>(
    'Good evening. Welcome to SpeakAI neural speech synthesis. This voice engine delivers clear, natural speech for custom broadcast and developer applications.'
  );

  const [voiceSettings, setVoiceSettings] = useState<GranularVoiceSettings>({
    pitch: 0,
    speed: 1.0,
    emotion: 'neutral',
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-green-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userEmail="earthkingmortal@gmail.com"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentTab === 'studio' && (
          <StudioEditor
            activeVoice={activeVoice}
            onSelectVoice={setActiveVoice}
            script={script}
            onScriptChange={setScript}
            voiceSettings={voiceSettings}
            onVoiceSettingsChange={setVoiceSettings}
          />
        )}

        {currentTab === 'api' && <ApiExplorer />}
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-zinc-900 bg-black py-4 text-xs text-zinc-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SpeakAI TTS Studio & API</span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Connected via Google Account
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
