import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceFormatted: string;
  usdValue: string;
  price: number;
  priceChange24h: number;
  logoUrl?: string;
}

interface WalletState {
  // Wallet data
  address: string | null;
  isUnlocked: boolean;
  hasWallet: boolean;
  
  // Chain info
  chainId: number;
  chainName: string;
  
  // Balances
  nativeBalance: string;
  nativeBalanceFormatted: string;
  tokens: TokenBalance[];
  totalUsdValue: string;
  
  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Actions
  setAddress: (address: string | null) => void;
  setUnlocked: (unlocked: boolean) => void;
  setHasWallet: (hasWallet: boolean) => void;
  setChain: (chainId: number, chainName: string) => void;
  setNativeBalance: (balance: string, formatted: string) => void;
  setTokens: (tokens: TokenBalance[]) => void;
  setTotalUsdValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  address: "0x71C...9E3F",
  isUnlocked: true,
  hasWallet: true,
  chainId: 56,
  chainName: "BNB Smart Chain",
  nativeBalance: "3850000000000000000", // 3.85 BNB
  nativeBalanceFormatted: "3.85",
  tokens: [
    {
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      symbol: "USDC",
      name: "USD Coin",
      decimals: 18,
      balance: "1200000000000000000000",
      balanceFormatted: "1,200.00",
      usdValue: "1,200.00",
      price: 1,
      priceChange24h: 0,
      logoUrl: undefined
    },
    {
      address: "0xPayriumTokenAddress",
      symbol: "PUM",
      name: "Payrium",
      decimals: 18,
      balance: "5000000000000000000000",
      balanceFormatted: "5,000",
      usdValue: "581.30",
      price: 0.11626,
      priceChange24h: 5.4,
      logoUrl: undefined
    }
  ],
  totalUsdValue: "4,231.50",
  isLoading: false,
  isRefreshing: false,
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAddress: (address) => set({ address }),
      setUnlocked: (isUnlocked) => set({ isUnlocked }),
      setHasWallet: (hasWallet) => set({ hasWallet }),
      setChain: (chainId, chainName) => set({ chainId, chainName }),
      setNativeBalance: (nativeBalance, nativeBalanceFormatted) => 
        set({ nativeBalance, nativeBalanceFormatted }),
      setTokens: (tokens) => set({ tokens }),
      setTotalUsdValue: (totalUsdValue) => set({ totalUsdValue }),
      setLoading: (isLoading) => set({ isLoading }),
      setRefreshing: (isRefreshing) => set({ isRefreshing }),
      
      reset: () => set(initialState),
    }),
    {
      name: "payrium-wallet-store",
      partialize: (state) => ({
        address: state.address,
        hasWallet: state.hasWallet,
        chainId: state.chainId,
        chainName: state.chainName,
      }),
    }
  )
);
