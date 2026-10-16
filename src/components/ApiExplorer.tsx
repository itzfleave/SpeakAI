/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Terminal,
  Play,
  Key,
  ShieldCheck,
  Zap,
  RefreshCw
} from 'lucide-react';
import {
  generateCurlSnippet,
  generateNodeSnippet,
  generatePythonSnippet,
} from '../utils/apiSnippetGenerator.ts';

export const ApiExplorer: React.FC = () => {
  const [activeSnippetTab, setActiveSnippetTab] = useState<'curl' | 'node' | 'python'>('curl');
  const [apiKey, setApiKey] = useState('av_live_9f8d2e1c3b4a5960817263544321abcd');
  const [copied, setCopied] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResponse, setApiTestResponse] = useState<any | null>(null);
  const [testText, setTestText] = useState('Real-time neural text to speech API integration test.');

  const snippetOptions = {
    apiKey,
    baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://api.speakai.io',
    voiceId: 'puck',
    text: testText,
    isStreaming: false,
    emotion: 'neutral',
    speed: 1.0,
    pitch: 0,
    encryptPayload: false,
  };

  const getActiveCode = () => {
    switch (activeSnippetTab) {
      case 'curl':
        return generateCurlSnippet(snippetOptions);
      case 'node':
        return generateNodeSnippet(snippetOptions);
      case 'python':
        return generatePythonSnippet(snippetOptions);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runLiveApiTest = async () => {
    setIsTestingApi(true);
    setApiTestResponse(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/v1/synthesize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testText,
          voice_id: 'puck',
          speed: 1.0,
          pitch: 0,
          emotion: 'neutral',
        }),
      });

      const latencyMs = Math.round(performance.now() - start);
      const data = await res.json();

      setApiTestResponse({
        status: res.status,
        statusText: res.statusText,
        latencyMs,
        data,
      });
    } catch (err: any) {
      setApiTestResponse({
        status: 500,
        statusText: 'Network Error',
        latencyMs: Math.round(performance.now() - start),
        error: err.message,
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const generateNewApiKey = () => {
    const chars = '0123456789abcdef';
    let rand = '';
    for (let i = 0; i < 32; i++) {
      rand += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(`av_live_${rand}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              TTS REST API Integration
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-green-400 font-mono">
                v1
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Integrate real-time neural speech synthesis into custom applications via HTTP or Server-Sent Events.
            </p>
          </div>

          <button
            onClick={generateNewApiKey}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium transition self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate Key</span>
          </button>
        </div>

        {/* API Key Bar */}
        <div className="mt-4 p-3 rounded-lg bg-black border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2 font-mono">
            <Key className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            <span className="text-zinc-400">Bearer Token:</span>
            <span className="text-white font-medium truncate max-w-sm">
              {apiKey}
            </span>
          </div>
          <span className="text-[11px] text-green-400 font-medium">Ready for production</span>
        </div>
      </div>

      {/* Code Snippets & Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Snippets */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center space-x-1">
              {[
                { id: 'curl' as const, label: 'cURL' },
                { id: 'node' as const, label: 'JavaScript' },
                { id: 'python' as const, label: 'Python' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSnippetTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    activeSnippetTab === tab.id
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={copyCode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-black border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3.5 rounded-lg bg-black border border-zinc-800 text-green-400 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        {/* Right: Live Endpoint Tester */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              Live Endpoint Test
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300">
              POST /api/v1/synthesize
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Payload Text
            </label>
            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              rows={3}
              className="w-full bg-black border border-zinc-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-green-500 resize-none"
            />
          </div>

          <button
            onClick={runLiveApiTest}
            disabled={isTestingApi || !testText.trim()}
            className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-green-500 hover:bg-green-400 text-black font-bold text-xs shadow transition disabled:opacity-50"
          >
            {isTestingApi ? (
              <span>Calling API...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Execute Request</span>
              </>
            )}
          </button>

          {apiTestResponse && (
            <div className="p-3 rounded-lg bg-black border border-zinc-800 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-bold">
                  Status: {apiTestResponse.status} {apiTestResponse.statusText}
                </span>
                <span className="text-zinc-400">
                  Latency: <strong className="text-white">{apiTestResponse.latencyMs} ms</strong>
                </span>
              </div>

              {apiTestResponse.data?.audio_base64 && (
                <div className="pt-1">
                  <span className="text-[11px] text-zinc-400 block mb-1">Synthesized Response:</span>
                  <audio
                    controls
                    src={`data:audio/wav;base64,${apiTestResponse.data.audio_base64}`}
                    className="w-full h-7 rounded"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
