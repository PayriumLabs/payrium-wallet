"use client";

import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { Button } from "@/components/ui";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useWalletStore } from "@/stores/wallet-store";
import { useBalances } from "@/lib/hooks/useBalances";
import { cn } from "@/lib/utils";
import { getActiveChain, getTxExplorerUrl } from "@/lib/blockchain/chains";
import { ethers } from "ethers";

export default function TokenDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  
  const { address } = useWalletStore();
  const { native, tokens } = useBalances(address || undefined);

  const token = useMemo(() => {
    // Check if it's native BNB
    if (symbol === "BNB" || symbol === "TBNB") {
       return {
          symbol: native.symbol,
          name: "Binance Coin",
          balance: native.balance,
          balanceRaw: native.balanceRaw,
          decimals: 18,
          isNative: true,
          color: "bg-[#F0B90B]",
          textColor: "text-black",
          price: 650.20, // Mock
          address: "BNB" // Placeholder address for native
       };
    }
    // Check tokens
    const found = tokens.find(t => t.symbol.toUpperCase() === symbol);
    if (found) {
        return {
            symbol: found.symbol,
            name: found.name,
            address: found.address,
            decimals: found.decimals,
            balance: found.balanceFormatted, // Normalize to string
            balanceRaw: found.balance,      // Normalize to bigint
            isNative: false,
            color: "bg-slate-100",
            textColor: "text-black",
            price: 1.00 // Mock default price as 1 for now
        };
    }
    // Fallback or loading state could be better, for now return a dummy or redirect
    return null; 
  }, [symbol, native, tokens]);

  // Transaction History State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!token || !address) return;

    const fetchHistory = async () => {
        setLoadingTx(true);
        setError(null);
        try {
            const chain = getActiveChain();
            if (!chain.explorerApiUrl) {
                console.warn("No explorer API URL found for chain", chain.chainId);
                return;
            }

            let url = "";
            let params = `&address=${address}&page=1&offset=20&sort=desc`;
            
            const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY;
            if (apiKey) {
                params += `&apikey=${apiKey}`;
            }
            
            if (token.isNative) {
                url = `${chain.explorerApiUrl}?module=account&action=txlist${params}`;
            } else {
                url = `${chain.explorerApiUrl}?module=account&action=tokentx&contractaddress=${token.address}${params}`;
            }

            console.log("Fetching txs from:", url);

            const response = await fetch(url);
            const data = await response.json();
            
            console.log("BscScan output:", data);

            if (data.status === "1" && Array.isArray(data.result)) {
                setTransactions(data.result);
            } else if (data.message === "No transactions found") {
                setTransactions([]);
            } else {
                setTransactions([]);
                if (data.status === "0" && data.message !== "No transactions found") {
                     setError(data.result || data.message || "Failed to fetch transactions");
                }
            }
        } catch (e: any) {
            console.error("Failed to fetch txs", e);
            setError(e.message || "Network error");
        } finally {
            setLoadingTx(false);
        }
    };
    
    fetchHistory();
  }, [token, address, refreshKey]);

  if (!token) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <p className="text-slate-500">Token not found</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
       {/* Desktop Header Custom */}
       <header className="hidden md:flex items-center gap-2 px-8 py-6 text-sm border-b border-slate-100 bg-white sticky top-0 z-20">
          <Link href="/dashboard" className="text-slate-500 hover:text-primary transition-colors">Dashboard</Link>
          <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          <span className="text-slate-500">Assets</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
          <span className="text-slate-900 font-medium">{token.symbol}</span>
      </header>

      {/* Mobile Header */}
      <div className="md:hidden">
         <Header title={`${token.symbol}`} showBack backHref="/dashboard" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6 animate-in-slide-up">
          
          {/* Main Balance Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden text-center">
             {/* Background Decoration */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-slate-50 rounded-full blur-[80px] -mt-32 pointer-events-none opacity-60"></div>

             <div className="relative z-10 flex flex-col items-center">
                <div className={cn(
                    "size-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg shadow-black/5 mb-4",
                    token.color, token.textColor
                )}>
                    {token.symbol === "BNB" || token.symbol === "tBNB" ? "BNB" : token.symbol[0]}
                </div>
                
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                    {parseFloat(token.balance || "0").toFixed(4)} <span className="text-xl text-slate-500 font-medium">{token.symbol}</span>
                </h1>
                <p className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-sm">
                   ≈ ${(parseFloat(token.balance || "0") * (token.price || 1)).toFixed(2)} USD
                </p>

                {/* Actions Row */}
                <div className="grid grid-cols-3 gap-4 w-full max-w-sm mt-8">
                   <Link href={`/send?token=${token.symbol}`} className="flex flex-col items-center gap-2 group">
                      <div className="size-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                         <span className="material-symbols-outlined text-[24px]">arrow_upward</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">Send</span>
                   </Link>
                   <Link href="/receive" className="flex flex-col items-center gap-2 group">
                      <div className="size-14 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm group-hover:border-blue-300 group-hover:shadow-md transition-all">
                         <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">Receive</span>
                   </Link>
                   <Link href={`/swap?from=${token.symbol}`} className="flex flex-col items-center gap-2 group">
                      <div className="size-14 rounded-2xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shadow-sm group-hover:border-blue-300 group-hover:shadow-md transition-all">
                         <span className="material-symbols-outlined text-[24px]">swap_horiz</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700">Swap</span>
                   </Link>
                </div>
             </div>
          </div>

          {/* Recent Activity */}
          <div className="pb-8">
             <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                    <button 
                        onClick={() => setRefreshKey(k => k + 1)}     
                        className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                        title="Refresh"
                    >
                         <span className={cn("material-symbols-outlined text-[20px]", loadingTx && "animate-spin")}>refresh</span>
                    </button>
                </div>
                <div className="text-sm font-semibold text-slate-400">
                    {loadingTx ? "Updating..." : `${transactions.length} transactions`}
                </div>
             </div>
             
             {error && (
                 <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-4 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">error</span>
                     {error}
                 </div>
             )}
             
             {loadingTx && transactions.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
             ) : transactions.length === 0 && !error ? (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden min-h-[200px] flex flex-col items-center justify-center text-center p-8">
                    <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-slate-300 text-[32px]">history</span>
                    </div>
                    <p className="text-slate-900 font-bold mb-1">No transactions found</p>
                    <p className="text-slate-500 text-sm max-w-[200px]">
                        Transactions for this asset will appear here.
                    </p>
                </div>
             ) : (
                <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden">
                    {transactions.map((tx) => {
                        const isSent = tx.from.toLowerCase() === address?.toLowerCase();
                        const date = new Date(parseInt(tx.timeStamp) * 1000).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                        
                        // Robust formatting
                        let valueFormatted = "0.00";
                        try {
                           valueFormatted = ethers.formatUnits(tx.value || "0", token.decimals || 18);
                        } catch (err) {
                           console.warn("Error formatting tx value", err);
                           valueFormatted = "0.00";
                        }
                        
                        return (
                            <a 
                              key={tx.hash} 
                              href={getTxExplorerUrl(getActiveChain().chainId, tx.hash)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "size-10 rounded-full flex items-center justify-center",
                                        isSent ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-600"
                                    )}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {isSent ? "arrow_outward" : "call_received"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-900">
                                            {isSent ? "Sent" : "Received"}
                                        </span>
                                        <span className="text-xs font-medium text-slate-500">{date}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={cn(
                                        "text-sm font-bold block",
                                        isSent ? "text-slate-900" : "text-emerald-600"
                                    )}>
                                        {isSent ? "-" : "+"}{parseFloat(valueFormatted).toFixed(4)} {token.symbol}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded text-white inline-block mt-0.5",
                                        tx.isError === "0" ? "bg-emerald-400" : "bg-red-400"
                                    )}>
                                        {tx.isError === "0" ? "Success" : "Failed"}
                                    </span>
                                </div>
                            </a>
                        );
                    })}
                </div>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}
