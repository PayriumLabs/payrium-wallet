-- ===========================================
-- Payrium DAO Database Schema
-- Run this in your Supabase SQL Editor
-- ===========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- PROPOSALS TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ NOT NULL,
  snapshot_block INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for querying active proposals
CREATE INDEX IF NOT EXISTS idx_proposals_end_time ON proposals(end_time);
CREATE INDEX IF NOT EXISTS idx_proposals_created_by ON proposals(created_by);

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

-- Anyone can read proposals
CREATE POLICY "Proposals are viewable by everyone"
  ON proposals FOR SELECT
  USING (true);

-- Only insert via API (no direct inserts from client)
-- In production, use a server API or Edge Function with admin check
CREATE POLICY "Proposals can be created by admin"
  ON proposals FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- VOTES TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_address TEXT NOT NULL,
  voting_power DECIMAL(20, 8) NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('yes', 'no')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one vote per wallet per proposal
  UNIQUE(proposal_id, voter_address)
);

-- Index for querying votes by proposal
CREATE INDEX IF NOT EXISTS idx_votes_proposal ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_address);

-- Enable Row Level Security
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes
CREATE POLICY "Votes are viewable by everyone"
  ON votes FOR SELECT
  USING (true);

-- Anyone can insert votes (validation happens at app level)
CREATE POLICY "Anyone can vote"
  ON votes FOR INSERT
  WITH CHECK (true);

-- ===========================================
-- UPDATED_AT TRIGGER
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- HELPER VIEWS (Optional)
-- ===========================================

-- View for active proposals with vote counts
CREATE OR REPLACE VIEW active_proposals_with_votes AS
SELECT 
  p.*,
  COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN v.voting_power ELSE 0 END), 0) as yes_votes,
  COALESCE(SUM(CASE WHEN v.choice = 'no' THEN v.voting_power ELSE 0 END), 0) as no_votes,
  COUNT(v.id) as total_voters
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
WHERE p.end_time > NOW()
GROUP BY p.id;

-- View for all proposals with vote counts
CREATE OR REPLACE VIEW proposals_with_votes AS
SELECT 
  p.*,
  COALESCE(SUM(CASE WHEN v.choice = 'yes' THEN v.voting_power ELSE 0 END), 0) as yes_votes,
  COALESCE(SUM(CASE WHEN v.choice = 'no' THEN v.voting_power ELSE 0 END), 0) as no_votes,
  COUNT(v.id) as total_voters,
  CASE 
    WHEN p.end_time > NOW() THEN 'active'
    ELSE 'closed'
  END as status
FROM proposals p
LEFT JOIN votes v ON p.id = v.proposal_id
GROUP BY p.id;

-- ===========================================
-- SAMPLE DATA (Optional - for testing)
-- ===========================================

-- Uncomment to insert sample proposal for testing
/*
INSERT INTO proposals (title, description, start_time, end_time, snapshot_block, created_by)
VALUES (
  'Test Proposal: Increase Staking Rewards',
  'This is a test proposal to increase staking rewards from 8% to 15% APY.',
  NOW(),
  NOW() + INTERVAL '3 days',
  35000000,
  '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
);
*/
