"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout";
import { Button, Modal } from "@/components/ui";
import { getTimeRemaining } from "@/lib/supabase";

// Mock proposal for demo
const mockProposal = {
  id: "1",
  title: "Increase Staking Rewards by 15%",
  description: `This proposal seeks to increase the staking rewards for PUM holders from the current 8% APY to 15% APY.

## Background
The current staking rewards have been at 8% since launch. As the ecosystem grows, we believe it's important to incentivize long-term holding and participation in the network.

## Proposal Details
- Increase staking APY from 8% to 15%
- Implementation timeline: 2 weeks after vote completion
- Treasury impact: Estimated 500,000 PUM per year from treasury

## Benefits
1. Increased holding incentive
2. Reduced selling pressure
3. Stronger community engagement
4. Higher TVL in staking contracts`,
  start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  snapshot_block: 35000000,
  created_by: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  status: "active" as const,
  yes_votes: 12500,
  no_votes: 3200,
  total_votes: 15700,
  yes_percentage: 79.6,
  no_percentage: 20.4,
};

export default function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteChoice, setVoteChoice] = useState<"yes" | "no" | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // In production, fetch proposal by ID
  const proposal = mockProposal;
  const isActive = proposal.status === "active";
  const votingPower = 5000; // Mock voting power

  const handleVote = async () => {
    if (!voteChoice) return;
    
    setIsVoting(true);
    
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    
    setIsVoting(false);
    setShowVoteModal(false);
    setHasVoted(true);
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <Header title="Proposal" showBack backHref="/dao" />

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        {/* Status & Time */}
        <div className="flex items-center justify-between mb-6 pt-2">
          {isActive ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 text-xs font-bold uppercase tracking-wide">Active Proposal</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className="size-2.5 rounded-full bg-slate-400"></span>
              <span className="text-slate-600 text-xs font-bold uppercase tracking-wide">Closed</span>
            </div>
          )}
          
          {isActive && (
            <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <span className="material-symbols-outlined text-[16px]">timer</span>
              <span className="text-xs font-medium">{getTimeRemaining(proposal.end_time)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-6">
          {proposal.title}
        </h1>

        {/* Voting Progress */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">bar_chart</span>
            Current Results
          </h3>
          
          <div className="space-y-4">
             {/* Yes Bar */}
             <div>
                <div className="flex justify-between items-end mb-1">
                   <span className="text-sm font-medium text-slate-700">Yes</span>
                   <span className="text-sm font-bold text-slate-900">{proposal.yes_percentage?.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 rounded-full" style={{ width: `${proposal.yes_percentage}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{proposal.yes_votes?.toLocaleString()} PUM</p>
             </div>

             {/* No Bar */}
             <div>
                <div className="flex justify-between items-end mb-1">
                   <span className="text-sm font-medium text-slate-700">No</span>
                   <span className="text-sm font-bold text-slate-900">{proposal.no_percentage?.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-red-500 rounded-full" style={{ width: `${proposal.no_percentage}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">{proposal.no_votes?.toLocaleString()} PUM</p>
             </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
               Total Votes: {proposal.total_votes?.toLocaleString()} PUM
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
             <span className="material-symbols-outlined text-slate-400">description</span>
            Description
          </h3>
          <div className="prose prose-slate max-w-none bg-white p-5 rounded-2xl border border-slate-200">
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-sm">
              {proposal.description}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-3">
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Created By</p>
              <p className="text-xs font-mono font-medium text-slate-700 truncate">
                {proposal.created_by}
              </p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Snapshot</p>
              <p className="text-sm font-mono font-medium text-slate-700">
                #{proposal.snapshot_block.toLocaleString()}
              </p>
           </div>
           <div className="col-span-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-400 mb-1 font-medium">Your Voting Power</p>
                <p className="text-lg font-bold text-blue-600">
                   {votingPower.toLocaleString()} <span className="text-xs font-normal opacity-70">PUM</span>
                </p>
              </div>
              <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                 <span className="material-symbols-outlined">bolt</span>
              </div>
           </div>
        </div>
      </div>

      {/* Vote Button */}
      {isActive && !hasVoted && (
        <div className="p-6 pb-8 bg-white border-t border-slate-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <Button onClick={() => setShowVoteModal(true)} fullWidth size="lg">
            Cast Your Vote
          </Button>
        </div>
      )}

      {hasVoted && (
        <div className="p-6 pb-8 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
              check_circle
            </span>
            <span className="font-semibold text-sm">You have voted on this proposal</span>
          </div>
        </div>
      )}

      {/* Vote Modal */}
      <Modal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        title="Cast Your Vote"
        size="sm"
      >
        <div className="space-y-6">
          <div className="text-center">
             <div className="inline-flex size-16 rounded-full bg-blue-50 items-center justify-center mb-3">
               <span className="material-symbols-outlined text-primary text-3xl">how_to_vote</span>
             </div>
             <p className="text-slate-600 text-sm">
                You are voting with <strong className="text-slate-900">{votingPower.toLocaleString()} PUM</strong>
             </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setVoteChoice("yes")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                voteChoice === "yes"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30"
              }`}
            >
              <div
                className={`size-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  voteChoice === "yes"
                    ? "border-emerald-500 bg-emerald-500"
                    : "border-slate-300"
                }`}
              >
                {voteChoice === "yes" && (
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>
                    check
                  </span>
                )}
              </div>
              <span className={`font-bold ${voteChoice === "yes" ? "text-emerald-700" : "text-slate-600"}`}>
                Vote Yes
              </span>
            </button>

            <button
              onClick={() => setVoteChoice("no")}
              className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                voteChoice === "no"
                  ? "border-red-500 bg-red-50"
                  : "border-slate-100 hover:border-red-200 hover:bg-red-50/30"
              }`}
            >
              <div
                className={`size-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                  voteChoice === "no"
                    ? "border-red-500 bg-red-500"
                    : "border-slate-300"
                }`}
              >
                {voteChoice === "no" && (
                  <span className="material-symbols-outlined text-white" style={{ fontSize: "18px" }}>
                    check
                  </span>
                )}
              </div>
              <span className={`font-bold ${voteChoice === "no" ? "text-red-700" : "text-slate-600"}`}>
                Vote No
              </span>
            </button>
          </div>

          <Button
            onClick={handleVote}
            fullWidth
            size="lg"
            disabled={!voteChoice}
            isLoading={isVoting}
          >
            Confirm Vote
          </Button>
        </div>
      </Modal>
    </div>
  );
}
