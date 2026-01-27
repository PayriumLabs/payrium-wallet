/**
 * Payrium Encryption Module
 * Secure key encryption using Web Crypto API
 * 
 * Security features:
 * - AES-256-GCM encryption
 * - PBKDF2 key derivation with high iteration count
 * - Random salt and IV for each encryption
 */

const PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;

/**
 * Convert string to Uint8Array with proper buffer type
 */
function stringToBytes(str: string): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  // Create a new Uint8Array with a proper ArrayBuffer
  const result = new Uint8Array(encoded.length);
  result.set(encoded);
  return result as Uint8Array<ArrayBuffer>;
}

/**
 * Convert ArrayBuffer to string
 */
function bytesToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

/**
 * Convert ArrayBuffer to hex string
 */
function bytesToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to Uint8Array with proper buffer type
 */
function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(hex.length / 2);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes as Uint8Array<ArrayBuffer>;
}

/**
 * Generate a random salt with proper buffer type
 */
function generateSalt(): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(SALT_LENGTH);
  const bytes = new Uint8Array(buffer);
  crypto.getRandomValues(bytes);
  return bytes as Uint8Array<ArrayBuffer>;
}

/**
 * Generate a random IV with proper buffer type
 */
function generateIV(): Uint8Array<ArrayBuffer> {
  const buffer = new ArrayBuffer(IV_LENGTH);
  const bytes = new Uint8Array(buffer);
  crypto.getRandomValues(bytes);
  return bytes as Uint8Array<ArrayBuffer>;
}

/**
 * Derive an encryption key from PIN using PBKDF2
 */
async function deriveKey(pin: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    stringToBytes(pin) as BufferSource,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: KEY_LENGTH,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt data with PIN
 */
export async function encryptData(
  data: string,
  pin: string
): Promise<{ encrypted: string; salt: string; iv: string }> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(pin, salt);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
    },
    key,
    stringToBytes(data) as BufferSource
  );

  return {
    encrypted: bytesToHex(encrypted),
    salt: bytesToHex(salt.buffer),
    iv: bytesToHex(iv.buffer),
  };
}

/**
 * Decrypt data with PIN
 */
export async function decryptData(
  encryptedHex: string,
  saltHex: string,
  ivHex: string,
  pin: string
): Promise<string> {
  const salt = hexToBytes(saltHex);
  const iv = hexToBytes(ivHex);
  const encrypted = hexToBytes(encryptedHex);
  const key = await deriveKey(pin, salt);

  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv as BufferSource,
      },
      key,
      encrypted as BufferSource
    );

    return bytesToString(decrypted);
  } catch {
    throw new Error("Invalid PIN or corrupted data");
  }
}

/**
 * Hash PIN for quick verification (not for encryption key)
 */
export async function hashPin(pin: string, salt: string): Promise<string> {
  const data = pin + salt;
  const buffer = await crypto.subtle.digest("SHA-256", stringToBytes(data) as BufferSource);
  return bytesToHex(buffer);
}

/**
 * Verify PIN against stored hash
 */
export async function verifyPinHash(
  pin: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPin(pin, salt);
  return hash === storedHash;
}

/**
 * Generate a random salt for PIN hashing
 */
export function generatePinSalt(): string {
  return bytesToHex(generateSalt().buffer);
}
