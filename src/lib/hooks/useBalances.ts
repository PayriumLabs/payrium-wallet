import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getProvider } from "../blockchain/provider";
import { 
  KNOWN_TOKENS, 
  getTokenBalance, 
  TokenBalance, 
  TokenInfo, 
  getTokenInfo 
} from "../blockchain/tokens";
import { getActiveChain, ChainConfig } from "../blockchain/chains";

export interface BalanceState {
  native: {
    symbol: string;
    balance: string;
    balanceRaw: bigint;
  };
  tokens: TokenBalance[];
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 15000; // 15 seconds

export function useBalances(address?: string) {
  const [data, setData] = useState<BalanceState>({
    native: { symbol: "BNB", balance: "0.00", balanceRaw: BigInt(0) },
    tokens: [],
    loading: false,
    error: null,
  });

  const fetchBalances = useCallback(async () => {
    if (!address) return;

    setData((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const chain = getActiveChain();
      const provider = getProvider(chain.chainId);

      // 1. Fetch Native Balance (BNB)
      let nativeBalanceFormatted = data.native.balance;
      let nativeBalanceRaw = data.native.balanceRaw;

      try {
        const raw = await provider.getBalance(address);
        nativeBalanceRaw = raw;
        nativeBalanceFormatted = ethers.formatEther(raw);
      } catch (err) {
        console.warn("Failed to fetch native balance:", err);
      }

      // 2. Get Known Tokens for this chain
      const knownTokens = KNOWN_TOKENS[chain.chainId] || [];
      const tokenMap = new Map<string, TokenInfo>(); // Use map to deduplicate
      
      knownTokens.forEach(t => tokenMap.set(t.address.toLowerCase(), t));

      // 3. Discover Tokens via BscScan (Token Transfer Events)
      try {
        if (chain.explorerApiUrl) {
          let discoveryUrl = `${chain.explorerApiUrl}?module=account&action=tokentx&address=${address}&page=1&offset=50&sort=desc`;
          const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
          if (apiKey) {
            discoveryUrl += `&apikey=${apiKey}`;
          }

          const response = await fetch(discoveryUrl);
          
          if (!response.ok) {
              throw new Error(`BscScan API Error: ${response.statusText}`);
          }
          
          const scanData = await response.json();
          
          if (scanData.status === "1" && Array.isArray(scanData.result)) {
            const discoveredAddresses = new Set<string>();
            scanData.result.forEach((tx: any) => {
               if (!tokenMap.has(tx.contractAddress.toLowerCase())) {
                 discoveredAddresses.add(tx.contractAddress);
               }
            });

            const discoveredList = Array.from(discoveredAddresses).slice(0, 5);
            
            for (const tokenAddr of discoveredList) {
               try {
                 const info = await getTokenInfo(tokenAddr, chain.chainId);
                 tokenMap.set(tokenAddr.toLowerCase(), info);
               } catch (e) {
                 console.warn(`Failed to fetch info for token ${tokenAddr}`, e);
               }
            }
          }
        }
      } catch (err) {
        console.warn("Failed to discover tokens via BscScan", err);
      }

      // 4. Fetch Balances for ALL tokens (Known + Discovered)
      const allTokens = Array.from(tokenMap.values());
      const balances: TokenBalance[] = [];

      await Promise.all(allTokens.map(async (token) => {
        try {
          const bal = await getTokenBalance(token.address, address, chain.chainId);
          if (bal) balances.push(bal);
        } catch (e) {
             console.warn(`Failed to fetch balance for ${token.symbol}`, e);
        }
      }));

      setData({
        native: {
          symbol: chain.symbol,
          balance: nativeBalanceFormatted,
          balanceRaw: nativeBalanceRaw,
        },
        tokens: balances,
        loading: false,
        error: null,
      });

    } catch (err: any) {
      console.error("Error in useBalances critical path:", err);
      setData((prev) => ({ 
        ...prev, 
        loading: false, 
        error: err.message || "Failed to fetch balances" 
      }));
    } finally  {
         // Ensure loading is false
         setData(prev => ({ ...prev, loading: false }));
    }
  }, [address]);

  // Initial fetch and interval
  useEffect(() => {
    fetchBalances();
    
    const intervalId = setInterval(fetchBalances, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchBalances]);

  return {
    ...data,
    refresh: fetchBalances,
  };
}
