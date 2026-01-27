"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/layout";
import { Button } from "@/components/ui";
import { useBalances } from "@/lib/hooks/useBalances";
import { useWalletStore } from "@/stores/wallet-store";
import { useSearchParams } from "next/navigation";
import { getSwapQuote, executeSwap } from "@/lib/blockchain/dex";
import { approveToken, getTokenAllowance } from "@/lib/blockchain/tokens";
import { ethers } from "ethers";
import { getProvider } from "@/lib/blockchain/provider";
import { cn } from "@/lib/utils";

export default function SwapPage() {
  const { address } = useWalletStore();
  const { native, tokens, refresh } = useBalances(address || undefined);
  
  const searchParams = useSearchParams();
  const initialFrom = searchParams.get("from") || "BNB";

  // State
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromTokenSymbol, setFromTokenSymbol] = useState(initialFrom);
  const [toTokenSymbol, setToTokenSymbol] = useState("USDC"); // Default to USDC
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Update from token if params change
  useEffect(() => {
     const fromParam = searchParams.get("from");
     if (fromParam) {
         setFromTokenSymbol(fromParam.toUpperCase());
     }
  }, [searchParams]);

  // Unified Asset Interface
  interface Asset {
      symbol: string;
      name: string;
      address: string;
      decimals: number;
      balance: string; // Formatted balance string
      balanceRaw: bigint;
      isNative?: boolean;
  }

  // Combine native + tokens for selection
  const allAssets: Asset[] = [
    { 
        symbol: native.symbol, 
        name: "Binance Coin", 
        address: "BNB", 
        decimals: 18, 
        balance: native.balance, 
        balanceRaw: native.balanceRaw,
        isNative: true 
    },
    ...tokens.map(t => ({
        symbol: t.symbol,
        name: t.name,
        address: t.address,
        decimals: t.decimals,
        balance: t.balanceFormatted,
        balanceRaw: t.balance, // TokenBalance uses 'balance' for BigInt
        isNative: false
    }))
  ];

  const fromToken = allAssets.find(t => t.symbol === fromTokenSymbol) || allAssets[0];
  const toToken = allAssets.find(t => t.symbol === toTokenSymbol) || allAssets[1];

  // Colors for UI
  const getTokenColor = (symbol: string) => {
    if (symbol === "BNB" || symbol === "tBNB") return "#F0B90B";
    if (symbol === "USDC") return "#2775CA";
    if (symbol === "PUM") return "#3B82F6";
    return "#64748B";
  };

  // 1. Fetch Quote when Amount/Tokens change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromAmount || parseFloat(fromAmount) === 0) {
        setToAmount("");
        return;
      }

      setIsLoadingQuote(true);
      try {
        const quote = await getSwapQuote(
          fromAmount,
          fromToken.address,
          toToken.address,
          fromToken.decimals,
          toToken.decimals
        );
        setToAmount(quote);
        
        // Check allowance if not native
        if (!fromToken.isNative && address) {
            // Check Router allowance
            // Using a static Router address for check
            const ROUTER = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1"; 
            const allowance = await getTokenAllowance(fromToken.address, address, ROUTER, 97);
            const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals);
            setNeedsApproval(allowance < amountWei);
        } else {
            setNeedsApproval(false);
        }

      } catch (error) {
        console.error("Quote error", error);
      } finally {
        setIsLoadingQuote(false);
      }
    };

    const timeout = setTimeout(fetchQuote, 600); // Debounce
    return () => clearTimeout(timeout);
  }, [fromAmount, fromTokenSymbol, toTokenSymbol, address]);

  const handleAmountChange = (value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  const handleSwapValues = () => {
    const temp = fromTokenSymbol;
    setFromTokenSymbol(toTokenSymbol);
    setToTokenSymbol(temp);
    setFromAmount(""); // Reset amount to be safe
    setToAmount("");
  };



  const ROUTER_ADDRESS = "0xD99D1c33F9fC3444f8101754aBC46c52416550D1";

  const getSigner = async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
          throw new Error("No crypto wallet found. Please install MetaMask.");
      }
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      return await provider.getSigner();
  };

  const handleApprove = async () => {
     setIsApproving(true);
     try {
        const signer = await getSigner();
        const amountWei = ethers.parseUnits(fromAmount, fromToken.decimals);
        const tx = await approveToken(fromToken.address, ROUTER_ADDRESS, amountWei, signer);
        await tx.wait();
        setNeedsApproval(false);
     } catch (e: any) {
         console.error(e);
         alert(e.message || "Approval failed");
     } finally {
         setIsApproving(false);
     }
  };

  const handleSwap = async () => {
      setIsSwapping(true);
      setTxHash(null);
      try {
         const signer = await getSigner();
         const tx = await executeSwap(signer, fromAmount, fromToken.address, toToken.address, fromToken.decimals);
         setTxHash(tx.hash);
         await tx.wait();
         refresh();
         setFromAmount("");
         setToAmount("");
      } catch (e: any) {
          console.error(e);
          alert(e.message || "Swap failed");
      } finally {
          setIsSwapping(false);
      }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header title="Swap" showBack backHref="/dashboard" />

      <div className="flex-1 px-6 pb-8">
        {/* From Token */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm">From</span>
            <span className="text-slate-500 text-sm">
              Balance: {parseFloat(fromToken.balance || "0").toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shrink-0 border border-slate-100 shadow-sm">
               <div
                className="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: getTokenColor(fromToken.symbol), color: fromToken.symbol.includes("BNB") ? "black" : "white" }}
              >
                {fromToken.symbol.slice(0, 1)}
              </div>
              <span className="font-semibold text-slate-900">{fromToken.symbol}</span>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "18px" }}>
                expand_more
              </span>
            </button>
            <input
              type="text"
              inputMode="decimal"
              value={fromAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-right text-2xl font-bold text-slate-900 outline-none p-0 border-none placeholder:text-slate-300 w-full min-w-0"
            />
          </div>
          <div className="flex justify-between mt-2">
            <button
               onClick={() => {
                   if (fromToken.isNative) {
                       const val = parseFloat(fromToken.balance) - 0.01;
                       setFromAmount(val > 0 ? val.toString() : "0");
                   } else {
                       setFromAmount(fromToken.balance);
                   }
               }}
               className="text-primary text-sm font-medium hover:underline"
             >
               Max
             </button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <button
            onClick={handleSwapValues}
            className="size-12 rounded-full bg-white border-4 border-background-light flex items-center justify-center shadow-md hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "24px" }}>
              swap_vert
            </span>
          </button>
        </div>

        {/* To Token */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm">To</span>
            <span className="text-slate-500 text-sm">
              Balance: {parseFloat(toToken.balance || "0").toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shrink-0 border border-slate-100 shadow-sm">
               <div
                className="size-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: getTokenColor(toToken.symbol), color: toToken.symbol.includes("BNB") ? "black" : "white" }}
              >
                {toToken.symbol.slice(0, 1)}
              </div>
              <span className="font-semibold text-slate-900">{toToken.symbol}</span>
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: "18px" }}>
                expand_more
              </span>
            </button>
            <div className="flex-1 text-right">
                {isLoadingQuote ? (
                    <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                ) : (
                    <span className={cn("text-2xl font-bold", toAmount ? "text-slate-900" : "text-slate-300")}>
                        {toAmount || "0.00"}
                    </span>
                )}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {toAmount && !isLoadingQuote && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rate</span>
              <span className="text-slate-900">
                1 {fromToken.symbol} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(4)} {toToken.symbol}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Route</span>
              <span className="text-slate-900">PancakeSwap V2 (Testnet)</span>
            </div>
          </div>
        )}

        {txHash && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-4 text-xs break-all">
             Success! Tx: {txHash}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
             {needsApproval ? (
                 <Button
                   fullWidth
                   size="lg"
                   onClick={handleApprove}
                   disabled={isApproving}
                   className="bg-slate-800"
                 >
                   {isApproving ? "Approving..." : `Approve ${fromToken.symbol}`}
                 </Button>
             ) : null}
             
             <Button
               fullWidth
               size="lg"
               onClick={handleSwap}
               disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isLoadingQuote || isSwapping || needsApproval}
             >
               {isSwapping ? "Swapping..." : !fromAmount ? "Enter Amount" : "Swap"}
             </Button>
        </div>
      </div>
    </div>
  );
}
