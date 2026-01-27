"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header, SideNav, BottomNav } from "@/components/layout";
import { Card, Skeleton } from "@/components/ui";
import { getProposals, getTimeRemaining, Proposal } from "@/lib/supabase";

// Mock proposals for demo
const mockProposals: Proposal[] = [
  {
    id: "1",
    title: "Increase Staking Rewards by 15%",
    description: "This proposal seeks to increase the staking rewards for PUM holders from the current 8% APY to 15% APY...",
    start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    snapshot_block: 35000000,
    created_by: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    yes_votes: 12500,
    no_votes: 3200,
    total_votes: 15700,
    yes_percentage: 79.6,
    no_percentage: 20.4,
  },
  {
    id: "2",
    title: "Add USDT Support for Swaps",
    description: "Proposal to integrate USDT trading pairs into the Payrium swap interface...",
    start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    snapshot_block: 34900000,
    created_by: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "closed",
    yes_votes: 25000,
    no_votes: 5000,
    total_votes: 30000,
    yes_percentage: 83.3,
    no_percentage: 16.7,
  },
];

export default function DAOPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");

  useEffect(() => {
    // In production, fetch from Supabase
    // For now, use mock data
    setProposals(mockProposals);
    setIsLoading(false);
  }, []);

  const activeProposals = proposals.filter((p) => p.status === "active");
  const closedProposals = proposals.filter((p) => p.status === "closed");
  const displayedProposals = activeTab === "active" ? activeProposals : closedProposals;

  return (
    <div className="flex h-screen w-full">
      <SideNav />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="relative w-full md:max-w-none max-w-md mx-auto h-full bg-surface-light flex flex-col">
          <Header title="DAO Governance" />

          <div className="flex-1 overflow-y-auto no-scrollbar pb-nav-safe">
            {/* Voting Power Card */}
            <div className="px-6 py-4">
              <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm">Your Voting Power</p>
                    <p className="text-2xl font-bold">5,000 PUM</p>
                  </div>
                  <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                      how_to_vote
                    </span>
                  </div>
                </div>
                <p className="text-white/60 text-xs">
                  Your voting power is based on your PUM token balance at the snapshot block.
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-6">
              <div className="flex p-1 bg-slate-100 rounded-xl relative">
                <div 
                  className={`absolute inset-y-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${
                    activeTab === "active" ? "left-1" : "left-[calc(50%+4px)]"
                  }`}
                />
                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex-1 relative z-10 py-2 text-sm font-semibold transition-colors duration-300 ${
                    activeTab === "active" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Active Deals
                </button>
                <button
                  onClick={() => setActiveTab("closed")}
                  className={`flex-1 relative z-10 py-2 text-sm font-semibold transition-colors duration-300 ${
                    activeTab === "closed" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Closed History
                </button>
              </div>
            </div>

            {/* Proposals List */}
            <div className="px-6 space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </>
              ) : displayedProposals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-slate-300" style={{ fontSize: "32px" }}>
                      inbox
                    </span>
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">No {activeTab} proposals</h3>
                  <p className="text-slate-500 text-sm">
                    {activeTab === "active" 
                      ? "There are no active governance proposals at the moment." 
                      : "No past proposals found in history."}
                  </p>
                </div>
              ) : (
                displayedProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))
              )}
            </div>

            <div className="h-8" />
          </div>

          <BottomNav />
        </div>
      </main>
    </div>
  );
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  const isActive = proposal.status === "active";
  
  return (
    <Link href={`/dao/${proposal.id}`}>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all p-5 group cursor-pointer">
        {/* Status Header */}
        <div className="flex items-center justify-between mb-4">
          {isActive ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/60">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wide">Active</span>
            </div>
          ) : (
             <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
              <span className="size-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 text-xs font-semibold uppercase tracking-wide">Closed</span>
            </div>
          )}

          {isActive && (
            <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {getTimeRemaining(proposal.end_time)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
          {proposal.title}
        </h3>

        {/* Description preview */}
        <p className="text-slate-500 text-sm line-clamp-2 mb-5 leading-relaxed">
          {proposal.description}
        </p>

        {/* Voting progress */}
        <div className="bg-slate-50 rounded-xl p-3">
          <div className="flex justify-between text-xs mb-2">
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="size-1.5 rounded-full bg-green-500"></span>
              Yes {proposal.yes_percentage?.toFixed(1)}%
            </span>
            <span className="flex items-center gap-1.5 text-slate-700 font-medium">
              <span className="size-1.5 rounded-full bg-red-500"></span>
              No {proposal.no_percentage?.toFixed(1)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${proposal.yes_percentage}%` }}
            />
            <div
              className="bg-red-500 h-full"
              style={{ width: `${proposal.no_percentage}%` }}
            />
          </div>
           <div className="mt-2 text-right">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {proposal.total_votes?.toLocaleString()} Votes
              </span>
           </div>
        </div>
      </div>
    </Link>
  );
}
