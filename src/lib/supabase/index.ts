export { getSupabaseClient, isSupabaseConfigured } from "./client";
export { 
  getProposals, 
  getProposal, 
  createProposal, 
  submitVote, 
  hasVoted, 
  getVotes,
  hasDAOAccess,
  getVotingPower,
  isDAOAdmin,
  getProposalStatus,
  getTimeRemaining
} from "./dao";
export type { Proposal, Vote, CreateProposalParams } from "./dao";
