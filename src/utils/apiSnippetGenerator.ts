/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SnippetOptions {
  apiKey: string;
  baseUrl: string;
  voiceId: string;
  text: string;
  isStreaming: boolean;
  emotion: string;
  speed: number;
  pitch: number;
  encryptPayload: boolean;
}

export function generateCurlSnippet(opts: SnippetOptions): string {
  const endpoint = opts.isStreaming ? `${opts.baseUrl}/api/v1/synthesize/stream` : `${opts.baseUrl}/api/v1/synthesize`;
  const body = {
    voice_id: opts.voiceId,
    text: opts.text,
    emotion: opts.emotion,
    speed: opts.speed,
    pitch: opts.pitch,
    format: 'wav',
    encryption: opts.encryptPayload ? { enabled: true, algorithm: 'AES-256-GCM' } : undefined,
  };

  return `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer ${opts.apiKey}" \\
  -H "Content-Type: application/json" \\
  ${opts.isStreaming ? '-H "Accept: text/event-stream" \\\n  --no-buffer \\\n  ' : ''}-d '${JSON.stringify(body, null, 2)}' \\
  ${opts.isStreaming ? '| grep "data: "' : '--output broadcast_speech.wav'}`;
}

export function generateNodeSnippet(opts: SnippetOptions): string {
  const endpoint = opts.isStreaming ? `${opts.baseUrl}/api/v1/synthesize/stream` : `${opts.baseUrl}/api/v1/synthesize`;

  if (opts.isStreaming) {
    return `// AuraVoice Real-Time Streaming SDK Example (Node.js / Browser)
async function streamBroadcastAudio() {
  const response = await fetch("${endpoint}", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${opts.apiKey}",
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify({
      voice_id: "${opts.voiceId}",
      text: ${JSON.stringify(opts.text)},
      speed: ${opts.speed},
      pitch: ${opts.pitch},
      emotion: "${opts.emotion}",
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    console.log("Received audio stream chunk:", chunk.length, "bytes");
    // Feed chunk to Web Audio API AudioContext or broadcast pipeline
  }
}

streamBroadcastAudio();`;
  }

  return `// AuraVoice Standard Unary Synthesis (Node.js)
import fs from 'node:fs/promises';

async function synthesizeSpeech() {
  const response = await fetch("${endpoint}", {
    method: "POST",
    headers: {
      "Authorization": "Bearer ${opts.apiKey}",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      voice_id: "${opts.voiceId}",
      text: ${JSON.stringify(opts.text)},
      speed: ${opts.speed},
      pitch: ${opts.pitch},
      emotion: "${opts.emotion}",
      encrypt: ${opts.encryptPayload},
    }),
  });

  const data = await response.json();
  const audioBuffer = Buffer.from(data.audio_base64, 'base64');
  await fs.writeFile('synthesized_audio.wav', audioBuffer);
  console.log("Audio written successfully! Duration:", data.duration_seconds, "s");
}

synthesizeSpeech();`;
}

export function generatePythonSnippet(opts: SnippetOptions): string {
  const endpoint = opts.isStreaming ? `${opts.baseUrl}/api/v1/synthesize/stream` : `${opts.baseUrl}/api/v1/synthesize`;

  if (opts.isStreaming) {
    return `# AuraVoice Low-Latency Streaming Client (Python)
import requests
import json

url = "${endpoint}"
headers = {
    "Authorization": "Bearer ${opts.apiKey}",
    "Content-Type": "application/json",
    "Accept": "text/event-stream"
}
payload = {
    "voice_id": "${opts.voiceId}",
    "text": ${JSON.stringify(opts.text)},
    "emotion": "${opts.emotion}",
    "speed": ${opts.speed},
    "pitch": ${opts.pitch}
}

with requests.post(url, json=payload, headers=headers, stream=True) as r:
    r.raise_for_status()
    for line in r.iter_lines():
        if line and line.startswith(b"data: "):
            chunk_data = json.loads(line[6:])
            print(f"Received audio packet: {len(chunk_data.get('pcm_chunk', ''))} bytes")
`;
  }

  return `# AuraVoice Unary Synthesis Client (Python)
import requests
import base64

url = "${endpoint}"
headers = {
    "Authorization": "Bearer ${opts.apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "voice_id": "${opts.voiceId}",
    "text": ${JSON.stringify(opts.text)},
    "emotion": "${opts.emotion}",
    "speed": ${opts.speed},
    "pitch": ${opts.pitch},
    "encryption": ${opts.encryptPayload ? '{"enabled": True}' : 'None'}
}

response = requests.post(url, json=payload, headers=headers)
response.raise_for_status()
data = response.json()

# Decode and save audio WAV
audio_bytes = base64.b64decode(data["audio_base64"])
with open("broadcast_output.wav", "wb") as f:
    f.write(audio_bytes)
print(f"Synthesized successfully. SHA-256 Checksum: {data.get('sha256')}")
`;
}
