/**
 * Payrium Transaction History Module
 * Fetches and parses transaction history
 */

import { ethers } from "ethers";
import { getProvider, getChainInfo } from "../blockchain/provider";

export interface TransactionHistoryItem {
  hash: string;
  from: string;
  to: string;
  value: string;
  valueFormatted: string;
  timestamp: number;
  blockNumber: number;
  status: "success" | "failed" | "pending";
  type: "send" | "receive" | "swap" | "contract";
  tokenSymbol?: string;
  tokenAddress?: string;
  gasUsed?: string;
  gasPrice?: string;
}

/**
 * Get recent transactions for an address via RPC
 * Note: This is a simplified implementation. For production, consider using:
 * - BSCScan API
 * - Covalent API
 * - The Graph
 */
export async function getRecentTransactions(
  address: string,
  limit = 10,
  chainId?: number
): Promise<TransactionHistoryItem[]> {
  const provider = getProvider(chainId);
  const chain = getChainInfo(chainId);
  
  const transactions: TransactionHistoryItem[] = [];
  
  try {
    // Get latest block number
    const latestBlock = await provider.getBlockNumber();
    
    // Scan recent blocks (this is not efficient for production)
    // In production, use BSCScan API or indexer
    const blocksToScan = Math.min(100, latestBlock);
    
    for (let i = 0; i < blocksToScan && transactions.length < limit; i++) {
      const blockNumber = latestBlock - i;
      const block = await provider.getBlock(blockNumber, true);
      
      if (!block || !block.prefetchedTransactions) continue;
      
      for (const tx of block.prefetchedTransactions) {
        if (
          tx.from.toLowerCase() === address.toLowerCase() ||
          tx.to?.toLowerCase() === address.toLowerCase()
        ) {
          const receipt = await provider.getTransactionReceipt(tx.hash);
          
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || "",
            value: tx.value.toString(),
            valueFormatted: ethers.formatEther(tx.value),
            timestamp: block.timestamp,
            blockNumber: block.number,
            status: receipt?.status === 1 ? "success" : "failed",
            type: tx.from.toLowerCase() === address.toLowerCase() ? "send" : "receive",
            tokenSymbol: chain.symbol,
            gasUsed: receipt?.gasUsed?.toString(),
            gasPrice: tx.gasPrice?.toString(),
          });
          
          if (transactions.length >= limit) break;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching transactions:", error);
  }
  
  return transactions;
}

/**
 * Format transaction for display
 */
export function formatTransaction(tx: TransactionHistoryItem): {
  title: string;
  subtitle: string;
  amount: string;
  isPositive: boolean;
} {
  const isReceive = tx.type === "receive";
  
  return {
    title: isReceive ? "Received" : "Sent",
    subtitle: isReceive ? `From: ${formatAddressShort(tx.from)}` : `To: ${formatAddressShort(tx.to)}`,
    amount: `${isReceive ? "+" : "-"}${parseFloat(tx.valueFormatted).toFixed(4)} ${tx.tokenSymbol || "BNB"}`,
    isPositive: isReceive,
  };
}

/**
 * Format address for short display
 */
function formatAddressShort(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
