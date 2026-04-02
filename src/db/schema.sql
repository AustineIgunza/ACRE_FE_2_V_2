-- Flashpoint Review Engine Schema
-- These tables track spaced repetition intervals and review sessions

-- Concept Review Tracking Table
CREATE TABLE IF NOT EXISTS concept_review_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  concept_title TEXT,
  last_reviewed_timestamp BIGINT,
  current_interval INTEGER DEFAULT 1,
  ease_multiplier DECIMAL(5,2) DEFAULT 2.5,
  next_due_timestamp BIGINT NOT NULL,
  review_phase TEXT DEFAULT 'phase-1',
  quality_of_response INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, concept_id),
  INDEX idx_user_due (user_id, next_due_timestamp),
  INDEX idx_user_phase (user_id, review_phase)
);

-- Flashpoint Review Sessions Table
CREATE TABLE IF NOT EXISTS flashpoint_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id TEXT NOT NULL,
  review_phase TEXT NOT NULL,
  user_response TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  quality_score INTEGER,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_concept (user_id, concept_id),
  INDEX idx_timestamp (timestamp)
);

-- Concepts Table (extend if needed)
CREATE TABLE IF NOT EXISTS concepts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  crisis_scenario_phase1 TEXT,
  crisis_scenario_phase2 TEXT,
  crisis_scenario_phase3 TEXT,
  flawed_proposal_phase2 TEXT,
  missing_variable_hint_phase3 TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);
