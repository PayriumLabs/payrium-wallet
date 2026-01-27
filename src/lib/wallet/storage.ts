/**
 * Payrium Secure Storage Module
 * Handles encrypted wallet storage in localStorage
 */

import { encryptData, decryptData, hashPin, verifyPinHash, generatePinSalt } from "./encryption";

const STORAGE_KEYS = {
  WALLET_DATA: "payrium_wallet_data",
  PIN_HASH: "payrium_pin_hash",
  PIN_SALT: "payrium_pin_salt",
  WALLET_META: "payrium_wallet_meta",
};

export interface StoredWalletData {
  encryptedMnemonic: string;
  salt: string;
  iv: string;
  address: string;
}

export interface WalletMeta {
  address: string;
  createdAt: number;
  lastUnlockedAt: number | null;
  name: string;
}

/**
 * Check if wallet exists in storage
 */
export function hasStoredWallet(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.WALLET_DATA) !== null;
}

/**
 * Store encrypted wallet data
 */
export async function storeWallet(
  mnemonic: string,
  address: string,
  pin: string,
  walletName = "My Wallet"
): Promise<void> {
  // Encrypt the mnemonic
  const { encrypted, salt, iv } = await encryptData(mnemonic, pin);

  // Store encrypted wallet data
  const walletData: StoredWalletData = {
    encryptedMnemonic: encrypted,
    salt,
    iv,
    address,
  };
  localStorage.setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(walletData));

  // Store PIN hash for quick verification
  const pinSalt = generatePinSalt();
  const pinHash = await hashPin(pin, pinSalt);
  localStorage.setItem(STORAGE_KEYS.PIN_HASH, pinHash);
  localStorage.setItem(STORAGE_KEYS.PIN_SALT, pinSalt);

  // Store wallet metadata
  const meta: WalletMeta = {
    address,
    createdAt: Date.now(),
    lastUnlockedAt: null,
    name: walletName,
  };
  localStorage.setItem(STORAGE_KEYS.WALLET_META, JSON.stringify(meta));
}

/**
 * Get stored wallet data (encrypted)
 */
export function getStoredWalletData(): StoredWalletData | null {
  if (typeof window === "undefined") return null;
  
  const data = localStorage.getItem(STORAGE_KEYS.WALLET_DATA);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Get wallet metadata
 */
export function getWalletMeta(): WalletMeta | null {
  if (typeof window === "undefined") return null;
  
  const data = localStorage.getItem(STORAGE_KEYS.WALLET_META);
  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Verify PIN without decrypting wallet
 */
export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(STORAGE_KEYS.PIN_HASH);
  const salt = localStorage.getItem(STORAGE_KEYS.PIN_SALT);

  if (!storedHash || !salt) {
    return false;
  }

  return verifyPinHash(pin, salt, storedHash);
}

/**
 * Unlock wallet and get mnemonic
 */
export async function unlockWallet(pin: string): Promise<string> {
  const walletData = getStoredWalletData();
  if (!walletData) {
    throw new Error("No wallet found");
  }

  // Verify PIN first (fast check)
  const isValid = await verifyPin(pin);
  if (!isValid) {
    throw new Error("Invalid PIN");
  }

  // Decrypt mnemonic
  const mnemonic = await decryptData(
    walletData.encryptedMnemonic,
    walletData.salt,
    walletData.iv,
    pin
  );

  // Update last unlocked timestamp
  const meta = getWalletMeta();
  if (meta) {
    meta.lastUnlockedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.WALLET_META, JSON.stringify(meta));
  }

  return mnemonic;
}

/**
 * Get stored wallet address (without unlocking)
 */
export function getStoredAddress(): string | null {
  const walletData = getStoredWalletData();
  return walletData?.address ?? null;
}

/**
 * Change PIN
 */
export async function changePin(currentPin: string, newPin: string): Promise<boolean> {
  try {
    // Verify current PIN
    const isValid = await verifyPin(currentPin);
    if (!isValid) {
      return false;
    }

    // Get and decrypt mnemonic with current PIN
    const walletData = getStoredWalletData();
    if (!walletData) {
      return false;
    }

    const mnemonic = await decryptData(
      walletData.encryptedMnemonic,
      walletData.salt,
      walletData.iv,
      currentPin
    );

    // Re-encrypt with new PIN
    const { encrypted, salt, iv } = await encryptData(mnemonic, newPin);

    // Update wallet data
    const newWalletData: StoredWalletData = {
      ...walletData,
      encryptedMnemonic: encrypted,
      salt,
      iv,
    };
    localStorage.setItem(STORAGE_KEYS.WALLET_DATA, JSON.stringify(newWalletData));

    // Update PIN hash
    const pinSalt = generatePinSalt();
    const pinHash = await hashPin(newPin, pinSalt);
    localStorage.setItem(STORAGE_KEYS.PIN_HASH, pinHash);
    localStorage.setItem(STORAGE_KEYS.PIN_SALT, pinSalt);

    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all wallet data (logout/reset)
 */
export function clearWalletData(): void {
  localStorage.removeItem(STORAGE_KEYS.WALLET_DATA);
  localStorage.removeItem(STORAGE_KEYS.PIN_HASH);
  localStorage.removeItem(STORAGE_KEYS.PIN_SALT);
  localStorage.removeItem(STORAGE_KEYS.WALLET_META);
}

/**
 * Export mnemonic (requires PIN confirmation)
 */
export async function exportMnemonic(pin: string): Promise<string> {
  return unlockWallet(pin);
}

/**
 * Get stored mnemonic with PIN verification
 */
export async function getStoredMnemonic(pin: string): Promise<string | null> {
  try {
    const walletData = getStoredWalletData();
    if (!walletData) {
      return null;
    }

    const mnemonic = await decryptData(
      walletData.encryptedMnemonic,
      walletData.salt,
      walletData.iv,
      pin
    );

    return mnemonic;
  } catch {
    return null;
  }
}
