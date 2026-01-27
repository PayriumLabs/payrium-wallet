/**
 * Payrium Token Module
 * ERC-20 token interactions
 */

import { ethers, Contract, Wallet } from "ethers";
import { getProvider } from "./provider";

// ERC-20 ABI (minimal interface)
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface TokenBalance extends TokenInfo {
  balance: bigint;
  balanceFormatted: string;
}

/**
 * Get ERC-20 contract instance
 */
// ...
export function getTokenContract(
  tokenAddress: string,
  signerOrProvider?: ethers.Signer | ethers.Provider,
  chainId?: number,
): Contract {
  const provider = signerOrProvider ?? getProvider(chainId);
  return new Contract(tokenAddress, ERC20_ABI, provider);
}

/**
 * Get token info (name, symbol, decimals)
 */
export async function getTokenInfo(
  tokenAddress: string,
  chainId?: number,
): Promise<TokenInfo> {
  const contract = getTokenContract(tokenAddress, undefined, chainId);

  const [name, symbol, decimals] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
  ]);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals: Number(decimals),
  };
}

/**
 * Get token balance
 */
export async function getTokenBalance(
  tokenAddress: string,
  ownerAddress: string,
  chainId?: number,
): Promise<TokenBalance> {
  const contract = getTokenContract(tokenAddress, undefined, chainId);

  const [name, symbol, decimals, balance] = await Promise.all([
    contract.name(),
    contract.symbol(),
    contract.decimals(),
    contract.balanceOf(ownerAddress),
  ]);

  const formattedBalance = ethers.formatUnits(balance, decimals);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals: Number(decimals),
    balance,
    balanceFormatted: formattedBalance,
  };
}

/**
 * Get allowance
 */
export async function getTokenAllowance(
  tokenAddress: string,
  ownerAddress: string,
  spenderAddress: string,
  chainId?: number,
): Promise<bigint> {
  const contract = getTokenContract(tokenAddress, undefined, chainId);
  return contract.allowance(ownerAddress, spenderAddress);
}

/**
 * Approve token spending
 */
// ...
export async function approveToken(
  tokenAddress: string,
  spenderAddress: string,
  amount: bigint,
  signer: ethers.Signer,
): Promise<ethers.TransactionResponse> {
  const contract = getTokenContract(tokenAddress, signer);
  return contract.approve(spenderAddress, amount);
}

/**
 * Transfer tokens
 */
export async function transferToken(
  tokenAddress: string,
  toAddress: string,
  amount: bigint,
  signer: ethers.Signer,
): Promise<ethers.TransactionResponse> {
  const contract = getTokenContract(tokenAddress, signer);
  return contract.transfer(toAddress, amount);
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(amount: bigint, decimals: number): string {
  return ethers.formatUnits(amount, decimals);
}

/**
 * Parse token amount from string
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

/**
 * Estimate gas for token transfer
 */
export async function estimateTokenTransferGas(
  tokenAddress: string,
  fromAddress: string,
  toAddress: string,
  amount: bigint,
  chainId?: number,
): Promise<bigint> {
  const contract = getTokenContract(tokenAddress, undefined, chainId);
  return contract.transfer.estimateGas(toAddress, amount, {
    from: fromAddress,
  });
}

// Known tokens on BSC
export const PUM_TOKEN_ADDRESS =
  process.env.NEXT_PUBLIC_PUM_TOKEN_ADDRESS || "";

export const KNOWN_TOKENS: Record<number, TokenInfo[]> = {
  // BSC Mainnet
  56: [
    {
      address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD",
      symbol: "BUSD",
      decimals: 18,
    },
    {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      name: "USD Coin",
      symbol: "USDC",
      decimals: 18,
    },
    {
      address: "0x55d398326f99059fF775485246999027B3197955",
      name: "Tether USD",
      symbol: "USDT",
      decimals: 18,
    },
  ],
  // BSC Testnet
  97: [
    {
      address: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f1218", // BUSD (Testnet Faucet version)
      name: "BUSD Token",
      symbol: "BUSD",
      decimals: 18,
    },
    {
      address: "0x64544969ed7ebf5f083679233325356ebe738930", // USDC (Testnet)
      name: "USD Coin",
      symbol: "USDC",
      decimals: 18,
    },
    {
      address: "0x7ef95a43C00315264E954D98137f191379664679", // BUSD (Another common Testnet version if needed, or placeholder PUM) - Let's use PUM placeholder
      name: "Payrium",
      symbol: "PUM",
      decimals: 18,
    },
  ],
};
