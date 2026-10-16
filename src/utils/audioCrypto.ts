/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EncryptedAudioPayload {
  version: string;
  algorithm: 'AES-256-GCM';
  iv: string; // Base64
  ciphertext: string; // Base64
  authTag: string; // Base64
  salt?: string; // Base64
  sha256Checksum: string; // Hex string of original plaintext
  encryptedAt: string;
  metadata: {
    audioFormat: string;
    sampleRate: number;
    durationSeconds?: number;
    voiceId: string;
    projectId?: string;
  };
}

/**
 * Convert Uint8Array or ArrayBuffer to base64 string
 */
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Calculate SHA-256 checksum hex string for given buffer
 */
export async function calculateSha256(data: ArrayBuffer | Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Derive an AES-GCM 256-bit CryptoKey from a secret passphrase or random bytes
 */
export async function deriveKeyFromSecret(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a cryptographically secure random 256-bit AES-GCM key
 */
export async function generateRandomKey(): Promise<{ key: CryptoKey; rawKeyHex: string }> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  const rawKeyHex = Array.from(new Uint8Array(exported))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return { key, rawKeyHex };
}

/**
 * Import a raw hex key back to CryptoKey
 */
export async function importRawHexKey(rawKeyHex: string): Promise<CryptoKey> {
  const match = rawKeyHex.match(/.{1,2}/g);
  if (!match || match.length !== 32) {
    throw new Error('Invalid key format. Must be a 64-character hex string (32 bytes).');
  }
  const rawBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));
  return crypto.subtle.importKey('raw', rawBytes, 'AES-GCM', true, ['encrypt', 'decrypt']);
}

/**
 * Encrypt audio buffer with AES-256-GCM
 */
export async function encryptAudioBuffer(
  audioBytes: Uint8Array | ArrayBuffer,
  keyOrSecret: CryptoKey | string,
  metadata: EncryptedAudioPayload['metadata']
): Promise<EncryptedAudioPayload> {
  const originalBytes = audioBytes instanceof Uint8Array ? audioBytes : new Uint8Array(audioBytes);
  const sha256Checksum = await calculateSha256(originalBytes);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
  let cryptoKey: CryptoKey;
  let saltBase64: string | undefined = undefined;

  if (typeof keyOrSecret === 'string') {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    saltBase64 = bufferToBase64(salt);
    cryptoKey = await deriveKeyFromSecret(keyOrSecret, salt);
  } else {
    cryptoKey = keyOrSecret;
  }

  // Encrypt with 128-bit authentication tag
  const encryptedResult = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128,
    },
    cryptoKey,
    originalBytes as unknown as BufferSource
  );

  // In Web Crypto API AES-GCM, the ciphertext includes the 16-byte tag at the end
  const encryptedBytes = new Uint8Array(encryptedResult);
  const tagLengthBytes = 16;
  const ciphertextBytes = encryptedBytes.slice(0, encryptedBytes.length - tagLengthBytes);
  const tagBytes = encryptedBytes.slice(encryptedBytes.length - tagLengthBytes);

  return {
    version: '1.0',
    algorithm: 'AES-256-GCM',
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(ciphertextBytes),
    authTag: bufferToBase64(tagBytes),
    salt: saltBase64,
    sha256Checksum,
    encryptedAt: new Date().toISOString(),
    metadata,
  };
}

/**
 * Decrypt an EncryptedAudioPayload back to plain audio buffer and verify integrity
 */
export async function decryptAudioPayload(
  payload: EncryptedAudioPayload,
  keyOrSecret: CryptoKey | string
): Promise<{ audioBytes: Uint8Array; verifiedChecksum: boolean }> {
  if (payload.algorithm !== 'AES-256-GCM') {
    throw new Error(`Unsupported algorithm: ${payload.algorithm}`);
  }

  const iv = base64ToBuffer(payload.iv);
  const ciphertext = base64ToBuffer(payload.ciphertext);
  const authTag = base64ToBuffer(payload.authTag);

  // Combine ciphertext and tag for Web Crypto AES-GCM decrypt
  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);

  let cryptoKey: CryptoKey;
  if (typeof keyOrSecret === 'string') {
    if (!payload.salt) {
      throw new Error('Salt missing from payload required for passphrase decryption.');
    }
    const salt = base64ToBuffer(payload.salt);
    cryptoKey = await deriveKeyFromSecret(keyOrSecret, salt);
  } else {
    cryptoKey = keyOrSecret;
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as unknown as BufferSource,
      tagLength: 128,
    },
    cryptoKey,
    combined as unknown as BufferSource
  );

  const decryptedBytes = new Uint8Array(decryptedBuffer);
  const currentChecksum = await calculateSha256(decryptedBytes);
  const verifiedChecksum = currentChecksum.toLowerCase() === payload.sha256Checksum.toLowerCase();

  if (!verifiedChecksum) {
    throw new Error('Integrity verification failed: SHA-256 checksum mismatch.');
  }

  return {
    audioBytes: decryptedBytes,
    verifiedChecksum: true,
  };
}
