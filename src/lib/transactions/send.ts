/**
 * Payrium Send Transaction Module
 * Handles sending native tokens and ERC-20 tokens
 */

import { ethers, Wallet, TransactionResponse, TransactionReceipt } from "ethers";
import { getProvider, estimateGas, getGasPrice } from "../blockchain/provider";
import { transferToken, getTokenBalance, parseTokenAmount, estimateTokenTransferGas } from "../blockchain/tokens";
import { isValidAddress, checksumAddress } from "../wallet/wallet-engine";

export interface SendTransactionParams {
  to: string;
  amount: string;
  tokenAddress?: string; // If undefined, send native token
  signer: Wallet;
  chainId?: number;
}

export interface TransactionResult {
  success: boolean;
  txHash?: string;
  receipt?: TransactionReceipt;
  error?: string;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: bigint;
  totalCostFormatted: string;
}

/**
 * Validate send parameters
 */
export function validateSendParams(to: string, amount: string): { valid: boolean; error?: string } {
  // Validate address
  if (!to || !isValidAddress(to)) {
    return { valid: false, error: "Invalid recipient address" };
  }

  // Validate amount
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return { valid: false, error: "Invalid amount" };
  }

  return { valid: true };
}

/**
 * Estimate gas for native token transfer
 */
export async function estimateNativeTransferGas(
  from: string,
  to: string,
  amount: string,
  chainId?: number
): Promise<GasEstimate> {
  const provider = getProvider(chainId);
  
  const toAddress = checksumAddress(to);
  const value = ethers.parseEther(amount);
  
  const [gasLimit, gasPrice] = await Promise.all([
    estimateGas({ from, to: toAddress, value }, chainId),
    getGasPrice(chainId),
  ]);
  
  const totalCost = gasLimit * gasPrice;
  
  return {
    gasLimit,
    gasPrice,
    totalCost,
    totalCostFormatted: ethers.formatEther(totalCost),
  };
}

/**
 * Estimate gas for token transfer
 */
export async function estimateTokenSendGas(
  tokenAddress: string,
  from: string,
  to: string,
  amount: string,
  decimals: number,
  chainId?: number
): Promise<GasEstimate> {
  const toAddress = checksumAddress(to);
  const amountWei = parseTokenAmount(amount, decimals);
  
  const [gasLimit, gasPrice] = await Promise.all([
    estimateTokenTransferGas(tokenAddress, from, toAddress, amountWei, chainId),
    getGasPrice(chainId),
  ]);
  
  const totalCost = gasLimit * gasPrice;
  
  return {
    gasLimit,
    gasPrice,
    totalCost,
    totalCostFormatted: ethers.formatEther(totalCost),
  };
}

/**
 * Send native token (BNB)
 */
export async function sendNativeToken(
  params: SendTransactionParams
): Promise<TransactionResult> {
  try {
    const { to, amount, signer, chainId } = params;
    
    // Validate params
    const validation = validateSendParams(to, amount);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const toAddress = checksumAddress(to);
    const value = ethers.parseEther(amount);
    
    // Get gas estimate
    const gasEstimate = await estimateNativeTransferGas(
      signer.address,
      toAddress,
      amount,
      chainId
    );
    
    // Connect signer to provider
    const provider = getProvider(chainId);
    const connectedSigner = signer.connect(provider);
    
    // Send transaction
    const tx: TransactionResponse = await connectedSigner.sendTransaction({
      to: toAddress,
      value,
      gasLimit: gasEstimate.gasLimit,
      gasPrice: gasEstimate.gasPrice,
    });
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      receipt: receipt ?? undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Transaction failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Send ERC-20 token
 */
export async function sendToken(
  params: SendTransactionParams
): Promise<TransactionResult> {
  try {
    const { to, amount, tokenAddress, signer, chainId } = params;
    
    if (!tokenAddress) {
      return { success: false, error: "Token address is required" };
    }
    
    // Validate params
    const validation = validateSendParams(to, amount);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    
    const toAddress = checksumAddress(to);
    
    // Get token info for decimals
    const tokenBalance = await getTokenBalance(tokenAddress, signer.address, chainId);
    const amountWei = parseTokenAmount(amount, tokenBalance.decimals);
    
    // Check balance
    if (amountWei > tokenBalance.balance) {
      return { success: false, error: "Insufficient token balance" };
    }
    
    // Connect signer to provider
    const provider = getProvider(chainId);
    const connectedSigner = signer.connect(provider);
    
    // Transfer tokens
    const tx = await transferToken(tokenAddress, toAddress, amountWei, connectedSigner as Wallet);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    return {
      success: true,
      txHash: tx.hash,
      receipt: receipt ?? undefined,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Transaction failed";
    return { success: false, error: errorMessage };
  }
}

/**
 * Send transaction (auto-detect native or token)
 */
export async function sendTransaction(
  params: SendTransactionParams
): Promise<TransactionResult> {
  if (params.tokenAddress) {
    return sendToken(params);
  }
  return sendNativeToken(params);
}
