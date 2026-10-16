/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, Code2, CheckCircle2, User } from 'lucide-react';

export type TabKey = 'studio' | 'api';

interface NavbarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  userEmail?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  userEmail = 'earthkingmortal@gmail.com',
}) => {
  return (
    <header className="bg-black border-b border-zinc-800 text-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                SpeakAI <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono">TTS</span>
              </span>
            </div>
          </div>

          {/* Navigation: Only TTS and API */}
          <nav className="flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => onSelectTab('studio')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                currentTab === 'studio'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${currentTab === 'studio' ? 'text-green-400' : 'text-zinc-400'}`} />
              <span>TTS Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('api')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition ${
                currentTab === 'api'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Code2 className={`w-3.5 h-3.5 ${currentTab === 'api' ? 'text-green-400' : 'text-zinc-400'}`} />
              <span>API Integration</span>
            </button>
          </nav>

          {/* User Google Account Quota Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <User className="w-3 h-3 text-zinc-400" />
            <span className="text-zinc-300 font-mono truncate max-w-[170px]" title={userEmail}>
              {userEmail}
            </span>
            <span className="text-green-400 text-[10px] font-medium border-l border-zinc-700 pl-1.5">
              Account Quota
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
