/**
 * Payrium Provider Module
 * Blockchain provider and signer management
 */

import { ethers, JsonRpcProvider, Wallet, HDNodeWallet } from "ethers";
import { getActiveChain, getChainConfig, ChainConfig } from "./chains";

let currentProvider: JsonRpcProvider | null = null;
let currentChainId: number | null = null;

/**
 * Get or create provider for active chain
 */
export function getProvider(chainId?: number): JsonRpcProvider {
  const targetChainId = chainId ?? getActiveChain().chainId;
  
  // Return existing provider if chain matches
  if (currentProvider && currentChainId === targetChainId) {
    return currentProvider;
  }
  
  const chain = getChainConfig(targetChainId);
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${targetChainId}`);
  }
  
  currentProvider = new JsonRpcProvider(chain.rpcUrl, {
    chainId: chain.chainId,
    name: chain.name,
  });
  currentChainId = targetChainId;
  
  return currentProvider;
}

/**
 * Create a signer from wallet
 */
export function getSigner(wallet: Wallet | HDNodeWallet, chainId?: number): Wallet {
  const provider = getProvider(chainId);
  return wallet.connect(provider) as Wallet;
}

/**
 * Get current block number
 */
export async function getBlockNumber(chainId?: number): Promise<number> {
  const provider = getProvider(chainId);
  return provider.getBlockNumber();
}

/**
 * Get gas price
 */
export async function getGasPrice(chainId?: number): Promise<bigint> {
  const provider = getProvider(chainId);
  const feeData = await provider.getFeeData();
  return feeData.gasPrice ?? 0n;
}

/**
 * Get native balance
 */
export async function getNativeBalance(address: string, chainId?: number): Promise<bigint> {
  const provider = getProvider(chainId);
  return provider.getBalance(address);
}

/**
 * Format native balance for display
 */
export function formatNativeBalance(balance: bigint, decimals = 18): string {
  return ethers.formatUnits(balance, decimals);
}

/**
 * Parse native amount to wei
 */
export function parseNativeAmount(amount: string, decimals = 18): bigint {
  return ethers.parseUnits(amount, decimals);
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txHash: string,
  confirmations = 1,
  chainId?: number
): Promise<ethers.TransactionReceipt | null> {
  const provider = getProvider(chainId);
  return provider.waitForTransaction(txHash, confirmations);
}

/**
 * Get transaction receipt
 */
export async function getTransactionReceipt(
  txHash: string,
  chainId?: number
): Promise<ethers.TransactionReceipt | null> {
  const provider = getProvider(chainId);
  return provider.getTransactionReceipt(txHash);
}

/**
 * Get transaction details
 */
export async function getTransaction(
  txHash: string,
  chainId?: number
): Promise<ethers.TransactionResponse | null> {
  const provider = getProvider(chainId);
  return provider.getTransaction(txHash);
}

/**
 * Estimate gas for transaction
 */
export async function estimateGas(
  tx: ethers.TransactionRequest,
  chainId?: number
): Promise<bigint> {
  const provider = getProvider(chainId);
  return provider.estimateGas(tx);
}

/**
 * Get chain info
 */
export function getChainInfo(chainId?: number): ChainConfig {
  const targetChainId = chainId ?? getActiveChain().chainId;
  const chain = getChainConfig(targetChainId);
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${targetChainId}`);
  }
  return chain;
}
