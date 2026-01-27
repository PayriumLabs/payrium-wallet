/**
 * Payrium Wallet Engine
 * Core wallet functionality using ethers.js v6
 */

import { ethers, Wallet, HDNodeWallet } from "ethers";

export interface WalletData {
  address: string;
  mnemonic: string;
}

export interface EncryptedWallet {
  address: string;
  encryptedMnemonic: string;
  salt: string;
  iv: string;
  createdAt: number;
}

/**
 * Generate a new wallet with mnemonic
 */
export function createWallet(): WalletData {
  // Generate a random mnemonic (12 words)
  const mnemonic = Wallet.createRandom().mnemonic;
  
  if (!mnemonic) {
    throw new Error("Failed to generate mnemonic");
  }
  
  // Derive wallet from mnemonic
  const wallet = Wallet.fromPhrase(mnemonic.phrase);
  
  return {
    address: wallet.address,
    mnemonic: mnemonic.phrase,
  };
}

/**
 * Validate a mnemonic phrase
 */
export function validateMnemonic(phrase: string): boolean {
  try {
    // Clean up the phrase
    const cleanPhrase = phrase.trim().toLowerCase();
    const words = cleanPhrase.split(/\s+/);
    
    // Must be 12 or 24 words
    if (words.length !== 12 && words.length !== 24) {
      return false;
    }
    
    // Try to create a wallet from the phrase - this validates it
    Wallet.fromPhrase(cleanPhrase);
    return true;
  } catch {
    return false;
  }
}

/**
 * Import wallet from mnemonic phrase
 */
export function importWallet(mnemonic: string): WalletData {
  const cleanPhrase = mnemonic.trim().toLowerCase();
  
  if (!validateMnemonic(cleanPhrase)) {
    throw new Error("Invalid mnemonic phrase");
  }
  
  const wallet = Wallet.fromPhrase(cleanPhrase);
  
  return {
    address: wallet.address,
    mnemonic: cleanPhrase,
  };
}

/**
 * Derive wallet from mnemonic (without returning the mnemonic)
 */
export function deriveWallet(mnemonic: string): HDNodeWallet {
  const cleanPhrase = mnemonic.trim().toLowerCase();
  return Wallet.fromPhrase(cleanPhrase);
}

/**
 * Get wallet from private key
 */
export function getWalletFromPrivateKey(privateKey: string): Wallet {
  return new Wallet(privateKey);
}

/**
 * Connect wallet to provider
 */
export function connectWalletToProvider(
  wallet: Wallet | HDNodeWallet,
  provider: ethers.Provider
): Wallet {
  return wallet.connect(provider) as Wallet;
}

/**
 * Format address for display (0x71C...9E3F)
 */
export function formatAddress(address: string, startChars = 4, endChars = 4): string {
  if (!address || address.length < startChars + endChars + 2) {
    return address;
  }
  return `${address.slice(0, startChars + 2)}...${address.slice(-endChars)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Checksum an address
 */
export function checksumAddress(address: string): string {
  try {
    return ethers.getAddress(address);
  } catch {
    throw new Error("Invalid address");
  }
}
