/**
 * Payrium Chain Configuration
 * Supported blockchain networks
 */

export interface ChainConfig {
  chainId: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  symbol: string;
  decimals: number;
  explorerUrl: string;
  explorerApiUrl?: string;
  isTestnet: boolean;
  iconColor: string;
}

export const BSC_MAINNET: ChainConfig = {
  chainId: 56,
  name: "BNB Smart Chain",
  shortName: "BSC",
  rpcUrl: process.env.NEXT_PUBLIC_BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
  symbol: "BNB",
  decimals: 18,
  explorerUrl: "https://bscscan.com",
  explorerApiUrl: "https://api.bscscan.com/api",
  isTestnet: false,
  iconColor: "#F0B90B",
};

export const BSC_TESTNET: ChainConfig = {
  chainId: 97,
  name: "BSC Testnet",
  shortName: "BSC Testnet",
  rpcUrl: process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL || "https://bsc-testnet.publicnode.com",
  symbol: "tBNB",
  decimals: 18,
  explorerUrl: "https://testnet.bscscan.com",
  explorerApiUrl: "https://api-testnet.bscscan.com/api",
  isTestnet: true,
  iconColor: "#F0B90B",
};

export const SUPPORTED_CHAINS: ChainConfig[] = [BSC_MAINNET, BSC_TESTNET];

/**
 * Get chain config by chain ID
 */
export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}

/**
 * Get active chain based on environment
 */
export function getActiveChain(): ChainConfig {
  const network = process.env.NEXT_PUBLIC_ACTIVE_NETWORK || "testnet";
  return network === "mainnet" ? BSC_MAINNET : BSC_TESTNET;
}

/**
 * Get explorer URL for transaction
 */
export function getTxExplorerUrl(chainId: number, txHash: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return "";
  return `${chain.explorerUrl}/tx/${txHash}`;
}

/**
 * Get explorer URL for address
 */
export function getAddressExplorerUrl(chainId: number, address: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return "";
  return `${chain.explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for token
 */
export function getTokenExplorerUrl(chainId: number, tokenAddress: string): string {
  const chain = getChainConfig(chainId);
  if (!chain) return "";
  return `${chain.explorerUrl}/token/${tokenAddress}`;
}
