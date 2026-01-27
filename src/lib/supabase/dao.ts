/**
 * Payrium DAO Module
 * Handles proposals, voting, and governance
 */

import { getSupabaseClient, isSupabaseConfigured } from "./client";
import { getTokenBalance, PUM_TOKEN_ADDRESS } from "../blockchain/tokens";
import { getBlockNumber } from "../blockchain/provider";

export interface Proposal {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  snapshot_block: number;
  created_by: string;
  created_at: string;
  // Computed fields
  status?: "active" | "closed" | "upcoming";
  yes_votes?: number;
  no_votes?: number;
  total_votes?: number;
  yes_percentage?: number;
  no_percentage?: number;
}

export interface Vote {
  id: string;
  proposal_id: string;
  voter_address: string;
  voting_power: number;
  choice: "yes" | "no";
  created_at: string;
}

export interface CreateProposalParams {
  title: string;
  description: string;
  durationDays?: number;
  creatorAddress: string;
}

const ADMIN_WALLET_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || "";
const DEFAULT_PROPOSAL_DURATION_DAYS = 3;

/**
 * Check if address is DAO admin
 */
export function isDAOAdmin(address: string): boolean {
  if (!ADMIN_WALLET_ADDRESS) return false;
  return address.toLowerCase() === ADMIN_WALLET_ADDRESS.toLowerCase();
}

/**
 * Check if user has PUM tokens (DAO access)
 */
export async function hasDAOAccess(address: string, chainId?: number): Promise<boolean> {
  if (!PUM_TOKEN_ADDRESS) return false;
  
  try {
    const balance = await getTokenBalance(PUM_TOKEN_ADDRESS, address, chainId);
    return balance.balance > 0n;
  } catch {
    return false;
  }
}

/**
 * Get user's voting power (PUM balance at snapshot)
 */
export async function getVotingPower(
  address: string,
  snapshotBlock?: number,
  chainId?: number
): Promise<number> {
  if (!PUM_TOKEN_ADDRESS) return 0;
  
  try {
    // Note: For accurate snapshot voting, you'd need to query balance at a specific block
    // This simplified version uses current balance
    const balance = await getTokenBalance(PUM_TOKEN_ADDRESS, address, chainId);
    return parseFloat(balance.balanceFormatted);
  } catch {
    return 0;
  }
}

/**
 * Get proposal status based on timestamps
 */
export function getProposalStatus(proposal: Proposal): "active" | "closed" | "upcoming" {
  const now = new Date();
  const startTime = new Date(proposal.start_time);
  const endTime = new Date(proposal.end_time);
  
  if (now < startTime) return "upcoming";
  if (now > endTime) return "closed";
  return "active";
}

/**
 * Get time remaining for proposal
 */
export function getTimeRemaining(endTime: string): string {
  const end = new Date(endTime);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  
  if (diff <= 0) return "Ended";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

/**
 * Get all proposals
 */
export async function getProposals(): Promise<Proposal[]> {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured");
    return [];
  }
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
  
  // Add computed status
  return (data || []).map((proposal: Proposal) => ({
    ...proposal,
    status: getProposalStatus(proposal),
  }));
}

/**
 * Get single proposal with vote counts
 */
export async function getProposal(id: string): Promise<Proposal | null> {
  if (!isSupabaseConfigured()) return null;
  
  const supabase = getSupabaseClient();
  
  // Get proposal
  const { data: proposal, error: proposalError } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .single();
  
  if (proposalError || !proposal) {
    console.error("Error fetching proposal:", proposalError);
    return null;
  }
  
  // Get votes
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("*")
    .eq("proposal_id", id);
  
  if (votesError) {
    console.error("Error fetching votes:", votesError);
  }
  
  // Calculate vote totals
  const yesVotes = (votes || [])
    .filter((v: Vote) => v.choice === "yes")
    .reduce((sum: number, v: Vote) => sum + v.voting_power, 0);
  
  const noVotes = (votes || [])
    .filter((v: Vote) => v.choice === "no")
    .reduce((sum: number, v: Vote) => sum + v.voting_power, 0);
  
  const totalVotes = yesVotes + noVotes;
  
  return {
    ...proposal,
    status: getProposalStatus(proposal),
    yes_votes: yesVotes,
    no_votes: noVotes,
    total_votes: totalVotes,
    yes_percentage: totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0,
    no_percentage: totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0,
  };
}

/**
 * Create a new proposal (admin only)
 */
export async function createProposal(params: CreateProposalParams): Promise<Proposal | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }
  
  // Verify admin
  if (!isDAOAdmin(params.creatorAddress)) {
    throw new Error("Only admin can create proposals");
  }
  
  const supabase = getSupabaseClient();
  
  // Get current block for snapshot
  const snapshotBlock = await getBlockNumber();
  
  // Calculate proposal duration
  const durationDays = params.durationDays || DEFAULT_PROPOSAL_DURATION_DAYS;
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      title: params.title,
      description: params.description,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      snapshot_block: snapshotBlock,
      created_by: params.creatorAddress,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating proposal:", error);
    throw new Error("Failed to create proposal");
  }
  
  return data;
}

/**
 * Check if user has voted on proposal
 */
export async function hasVoted(proposalId: string, voterAddress: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("votes")
    .select("id")
    .eq("proposal_id", proposalId)
    .eq("voter_address", voterAddress.toLowerCase())
    .single();
  
  return !error && !!data;
}

/**
 * Submit a vote
 */
export async function submitVote(
  proposalId: string,
  voterAddress: string,
  choice: "yes" | "no",
  chainId?: number
): Promise<Vote | null> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase not configured");
  }
  
  // Check if already voted
  const alreadyVoted = await hasVoted(proposalId, voterAddress);
  if (alreadyVoted) {
    throw new Error("You have already voted on this proposal");
  }
  
  // Get proposal to check if active
  const proposal = await getProposal(proposalId);
  if (!proposal) {
    throw new Error("Proposal not found");
  }
  
  if (proposal.status !== "active") {
    throw new Error("Proposal is not active");
  }
  
  // Get voting power
  const votingPower = await getVotingPower(voterAddress, proposal.snapshot_block, chainId);
  if (votingPower <= 0) {
    throw new Error("You need PUM tokens to vote");
  }
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("votes")
    .insert({
      proposal_id: proposalId,
      voter_address: voterAddress.toLowerCase(),
      voting_power: votingPower,
      choice,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error submitting vote:", error);
    throw new Error("Failed to submit vote");
  }
  
  return data;
}

/**
 * Get votes for a proposal
 */
export async function getVotes(proposalId: string): Promise<Vote[]> {
  if (!isSupabaseConfigured()) return [];
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("created_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching votes:", error);
    return [];
  }
  
  return data || [];
}
