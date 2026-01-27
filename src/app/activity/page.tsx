"use client";

import { useState } from "react";
import { Header, SideNav, BottomNav } from "@/components/layout";
import { Card, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    type: "receive" as const,
    amount: "0.5",
    symbol: "BNB",
    from: "0x1234...abcd",
    to: "0x71C7...9E3F",
    timestamp: Date.now() - 30 * 60 * 1000,
    status: "success" as const,
  },
  {
    id: "2",
    type: "send" as const,
    amount: "100",
    symbol: "USDC",
    from: "0x71C7...9E3F",
    to: "0x5678...efgh",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    status: "success" as const,
  },
  {
    id: "3",
    type: "swap" as const,
    amount: "0.1",
    symbol: "BNB",
    toAmount: "63.5",
    toSymbol: "USDC",
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    status: "success" as const,
  },
  {
    id: "4",
    type: "send" as const,
    amount: "500",
    symbol: "PUM",
    from: "0x71C7...9E3F",
    to: "0x9abc...ijkl",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: "pending" as const,
  },
];

type Transaction = typeof mockTransactions[0];

export default function ActivityPage() {
  const [transactions] = useState(mockTransactions);
  const [isLoading] = useState(false);

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="flex h-screen bg-background-light">
      <SideNav />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="relative w-full md:max-w-none max-w-md mx-auto h-full bg-surface-light flex flex-col">
          <Header title="Activity" />

          <div className="flex-1 overflow-y-auto px-6 py-4 pb-32 md:pb-8 no-scrollbar">
            {/* Group by Date */}
            <div className="space-y-6">
              
              {/* Today */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Today</h3>
                
                {/* Empty State */}
                <div className="hidden flex flex-col items-center justify-center p-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <span 
                      className="material-symbols-outlined text-slate-300 mb-3"
                      style={{ fontSize: "40px" }}
                    >
                      history
                    </span>
                  <p className="text-slate-500">No transactions yet</p>
                </div>

                {/* Transactions List */}
                <div className="space-y-3">
                  <TransactionItem 
                    type="send"
                    title="Sent BNB"
                    subtitle="To: 0x71...9E3F"
                    amount="-0.5 BNB"
                    status="completed"
                    date="10:30 AM"
                  />
                  <TransactionItem 
                    type="receive"
                    title="Received USDT"
                    subtitle="From: 0x82...1A4B"
                    amount="+500.00 USDT"
                    status="completed"
                    date="09:15 AM"
                  />
                   <TransactionItem 
                    type="swap"
                    title="Swapped BNB to CAKE"
                    subtitle="PancakeSwap"
                    amount="-1.2 BNB"
                    status="pending"
                    date="08:45 AM"
                  />
                </div>
              </div>

              {/* Yesterday */}
               <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Yesterday</h3>
                <div className="space-y-3">
                  <TransactionItem 
                    type="contract"
                    title="Contract Interaction"
                    subtitle="Approve USDT"
                    amount="$0.05 Fee"
                    status="completed"
                    date="Yesterday"
                  />
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

function TransactionItem({
  type,
  title,
  subtitle,
  amount,
  status,
  date,
}: {
  type: "send" | "receive" | "swap" | "contract";
  title: string;
  subtitle: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
}) {
  const getIcon = () => {
    switch (type) {
      case "send": return "arrow_upward";
      case "receive": return "arrow_downward";
      case "swap": return "swap_vert";
      case "contract": return "integration_instructions";
    }
  };

  const getColors = () => {
    const isPending = status === "pending";
    const isReceive = type === "receive";
    
    if (isPending) return "bg-amber-100 text-amber-600";
    if (isReceive) return "bg-green-100 text-green-600";
    return "bg-slate-100 text-slate-600";
  };

  const cssColors = getColors();

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
       <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", cssColors)}>
         <span className={cn("material-symbols-outlined", status === "pending" && "animate-spin-slow")} style={{ fontSize: "20px" }}>
           {status === "pending" ? "sync" : getIcon()}
         </span>
       </div>

       <div className="flex-1 min-w-0">
         <div className="flex justify-between items-start mb-0.5">
            <p className="text-slate-900 font-medium">{title}</p>
            {status === "pending" && (
              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                Pending
              </span>
            )}
         </div>
         <p className="text-slate-500 text-xs truncate max-w-[140px]">{subtitle}</p>
       </div>

       <div className="text-right">
          <p className={cn(
            "font-bold text-sm",
            type === "receive" 
                ? "text-green-600" 
                : "text-slate-900"
          )}>
            {amount}
          </p>
          <p className="text-slate-400 text-xs">{date}</p>
       </div>
    </div>
  );
}
