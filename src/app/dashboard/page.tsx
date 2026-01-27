"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useWalletStore } from "@/stores/wallet-store";
import { useBalances } from "@/lib/hooks/useBalances";
import { cn } from "@/lib/utils";

// Mock prices for estimation on Testnet
const MOCK_PRICES: Record<string, number> = {
  BNB: 650.20,
  tBNB: 650.20,
  USDC: 1.00,
  BUSD: 1.00,
  PUM: 0.12,
};

export default function DashboardPage() {
  const { address } = useWalletStore();
  const { native, tokens, loading, refresh } = useBalances(address || undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate Total Balance
  const totalBalanceUSD = useMemo(() => {
    let total = 0;
    // Native
    const nativePrice = MOCK_PRICES[native.symbol] || 0;
    total += parseFloat(native.balance) * nativePrice;

    // Tokens
    tokens.forEach(t => {
      const price = MOCK_PRICES[t.symbol] || 0;
      total += parseFloat(t.balanceFormatted) * price;
    });

    return total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [native, tokens]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 1000); // Min visual loading
  };

  // Combine native and tokens for list
  const allAssets = [
    {
      symbol: native.symbol,
      name: "Binance Coin", // Hardcoded for niceness
      balanceFormatted: native.balance,
      balanceRaw: native.balance, // Reuse for consistency check
      decimals: 18,
      isNative: true
    },
    ...tokens
  ];

  // Side Nav Component (Inline for perfect porting)
  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full justify-between shrink-0">
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center gap-3 px-2">
          <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl size-10 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined" style={{ fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[#0F172A] text-base font-bold">Payrium</h1>
            <p className="text-[#64748B] text-xs">Simple Payments on BSC</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] font-medium">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <p className="text-sm leading-normal">Dashboard</p>
          </Link>
          <Link href="/activity" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors group">
             <span className="material-symbols-outlined group-hover:text-[#3B82F6]">receipt_long</span>
             <p className="text-sm font-medium leading-normal">Activity</p>
          </Link>
          <Link href="/dao" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors group">
            <span className="material-symbols-outlined group-hover:text-[#3B82F6]">how_to_vote</span>
            <p className="text-sm font-medium leading-normal">DAO</p>
          </Link>
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link href="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors group">
              <span className="material-symbols-outlined group-hover:text-[#3B82F6]">settings</span>
              <p className="text-sm font-medium leading-normal">Settings</p>
            </Link>
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAFC] cursor-pointer transition-colors">
          <div className="size-9 rounded-full bg-slate-100 border-2 border-white overflow-hidden">
             {/* Placeholder Avatar */}
             <div className="w-full h-full bg-slate-200"></div>
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-[#0F172A] text-sm font-medium truncate">User Wallet</p>
            <p className="text-[#64748B] text-xs truncate" suppressHydrationWarning>{address}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-[18px] ml-auto">expand_more</span>
        </div>
      </div>
    </aside>
  );

  const BottomNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 pb-safe flex justify-between items-center z-50">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[#3B82F6] w-14 relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#3B82F6] rounded-b-full"></div>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
        <span className="text-[10px] font-bold">Dashboard</span>
      </Link>
      <Link href="/activity" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#3B82F6] transition-colors w-14 group">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">receipt_long</span>
        <span className="text-[10px] font-medium">Activity</span>
      </Link>
      <Link href="/dao" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#3B82F6] transition-colors w-14 group">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">how_to_vote</span>
        <span className="text-[10px] font-medium">DAO</span>
      </Link>
      <Link href="/settings" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#3B82F6] transition-colors w-14 group">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
        <span className="text-[10px] font-medium">Settings</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex h-screen w-full bg-[#F5F6F8]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Device Container - Simulating the exact structure of Dashboard MO.html */}
        <div className="relative w-full md:max-w-none max-w-md mx-auto h-full bg-[#FAFAFA] md:bg-[#F5F6F8] flex flex-col shadow-2xl shadow-black/[0.02]">
          
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-5 z-10 sticky top-0 bg-white/80 backdrop-blur-md">
             <div className="flex items-center gap-2 text-[#0F172A]">
               <div className="size-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white md:hidden shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]">
                 <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>account_balance_wallet</span>
               </div>
               <h2 className="text-lg font-bold leading-tight tracking-tight">Payrium</h2>
             </div>
             <div className="flex items-center gap-3">
               <button 
                  onClick={handleRefresh}
                  className="flex items-center justify-center size-9 rounded-full bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors"
                  title="Refresh Balance"
                >
                 <span className={cn("material-symbols-outlined", (loading || isRefreshing) && "animate-spin")} style={{ fontSize: "20px" }}>refresh</span>
               </button>
               <button className="flex items-center justify-center size-9 rounded-full bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] transition-colors">
                 <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>notifications</span>
               </button>
               <div className="size-9 rounded-full bg-[#F1F5F9] border-2 border-white overflow-hidden">
                 <div className="w-full h-full bg-slate-200"></div>
               </div>
             </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-[5rem] md:pb-8">
            
            {/* Balance Section */}
            <div className="flex flex-col items-center justify-center pt-4 pb-6 px-4">
              <p className="text-[#64748B] text-sm font-medium leading-normal mb-1">Total Balance</p>
              <h1 className="text-[#0F172A] tracking-tight text-4xl font-bold leading-tight mb-2">
                ${totalBalanceUSD}
              </h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/10 rounded-full">
                <span className="material-symbols-outlined text-[#10B981]" style={{ fontSize: "16px" }}>trending_up</span>
                <span className="text-xs font-semibold text-[#047857]">Testnet Mode</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-8">
              <div className="flex justify-between gap-4">
                <Link href="/send" className="group flex flex-1 flex-col items-center gap-2">
                  <div className="size-14 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-active:scale-95 group-hover:-translate-y-0.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_upward</span>
                  </div>
                  <span className="text-xs font-semibold text-[#334155]">Send</span>
                </Link>
                <Link href="/receive" className="group flex flex-1 flex-col items-center gap-2">
                  <div className="size-14 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-active:scale-95 group-hover:-translate-y-0.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>arrow_downward</span>
                  </div>
                  <span className="text-xs font-semibold text-[#334155]">Receive</span>
                </Link>
                <Link href="/swap" className="group flex flex-1 flex-col items-center gap-2">
                  <div className="size-14 rounded-2xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center shadow-sm transition-transform group-active:scale-95 group-hover:-translate-y-0.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>swap_horiz</span>
                  </div>
                  <span className="text-xs font-semibold text-[#334155]">Swap</span>
                </Link>
                <button className="group flex flex-1 flex-col items-center gap-2">
                  <div className="size-14 rounded-2xl bg-[#F1F5F9] text-[#0F172A] flex items-center justify-center shadow-sm transition-transform group-active:scale-95 group-hover:-translate-y-0.5">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>more_horiz</span>
                  </div>
                  <span className="text-xs font-semibold text-[#334155]">More</span>
                </button>
              </div>
            </div>

            {/* Network Selector */}
            <div className="px-6 mb-6">
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#F1F5F9] pl-3 pr-4 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined text-[#64748B]" style={{ fontSize: "18px" }}>public</span>
                  <p className="text-[#475569] text-sm font-semibold">All Networks</p>
                </button>
                <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#0F172A] pl-3 pr-4 shadow-md">
                  <div className="size-4 rounded-full bg-[#F0B90B] flex items-center justify-center text-[8px] text-black font-bold">B</div>
                  <p className="text-white text-sm font-semibold">BSC Testnet</p>
                </button>
              </div>
            </div>

            {/* Assets List */}
            <div className="px-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[#0F172A] text-lg font-bold">Assets</h3>
                <button className="text-[#3B82F6] text-sm font-semibold hover:underline">Manage</button>
              </div>
              
              <div className="flex flex-col gap-3">
                {allAssets.map((asset) => {
                  const price = MOCK_PRICES[asset.symbol] || 0;
                  const value = (parseFloat(asset.balanceFormatted) * price).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  
                  // Color mapping
                  const color = asset.symbol === "BNB" || asset.symbol === "tBNB" ? "#F0B90B" :
                                asset.symbol === "USDC" ? "#2775CA" :
                                asset.symbol === "PUM" ? "#3B82F6" : "#64748B";

                  return (
                    <Link href={`/token/${asset.symbol}`} key={asset.symbol + (asset.isNative ? "native" : "token")}>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div 
                            className="size-10 rounded-full flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform"
                            style={{ backgroundColor: color, color: color === "#F0B90B" ? "black" : "white" }}
                          >
                            {asset.symbol.slice(0, 1)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[#0F172A] font-bold text-sm">{asset.name || asset.symbol}</span>
                            <span className="text-[#64748B] text-xs font-medium">{parseFloat(asset.balanceFormatted).toFixed(4)} {asset.symbol}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[#0F172A] font-bold text-sm">${value}</span>
                          <span className="text-[#94A3B8] text-xs font-medium">Testnet</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* DAO Promo */}
            <div className="px-6 mt-4 mb-6">
              <div className="w-full h-32 rounded-xl relative overflow-hidden group cursor-pointer bg-[#2563EB]">
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-5 flex flex-col justify-end">
                   <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm self-start px-2 py-0.5 rounded mb-1">DAO Voting</span>
                   <h4 className="text-white font-bold text-base">New Governance Proposal</h4>
                   <p className="text-white/80 text-xs">Vote on the new staking rewards program.</p>
                 </div>
              </div>
            </div>
          </div>

          <BottomNav />
        </div>
      </main>
    </div>
  );
}
