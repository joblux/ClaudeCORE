-- ═══════════════════════════════════════════════════
-- JOBLUX — NextAuth Tables
-- Run this in Supabase SQL Editor
-- These supplement the existing members table
-- ═══════════════════════════════════════════════════

-- ── NextAuth Accounts (OAuth provider links) ──
-- Links OAuth providers (LinkedIn, Google) to members
CREATE TABLE IF NOT EXISTS nextauth_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type TEXT NOT NULL,                    -- "oauth" | "email" | "credentials"
  provider TEXT NOT NULL,                -- "linkedin" | "google" | "email"
  provider_account_id TEXT NOT NULL,     -- Provider's user ID
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- ── NextAuth Verification Tokens (magic link) ──
CREATE TABLE IF NOT EXISTS nextauth_verification_tokens (
  identifier TEXT NOT NULL,              -- Email address
  token TEXT NOT NULL UNIQUE,            -- One-time token
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- ── Add auth columns to members table if missing ──
DO $$
BEGIN
  -- auth_provider: which OAuth provider they last used
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'auth_provider'
  ) THEN
    ALTER TABLE members ADD COLUMN auth_provider TEXT;
  END IF;

  -- avatar_url: profile picture from OAuth
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE members ADD COLUMN avatar_url TEXT;
  END IF;

  -- last_login: track activity
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE members ADD COLUMN last_login TIMESTAMPTZ;
  END IF;

  -- email_verified: for magic link verification
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE members ADD COLUMN email_verified TIMESTAMPTZ;
  END IF;
END $$;

-- ── Indexes for performance ──
CREATE INDEX IF NOT EXISTS idx_accounts_member_id
  ON nextauth_accounts(member_id);
CREATE INDEX IF NOT EXISTS idx_accounts_provider_account
  ON nextauth_accounts(provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_verification_token
  ON nextauth_verification_tokens(token);

-- ── RLS Policies ──

-- Accounts table: only service role can access (server-side only)
ALTER TABLE nextauth_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on accounts"
  ON nextauth_accounts FOR ALL
  USING (auth.role() = 'service_role');

-- Verification tokens: only service role can access
ALTER TABLE nextauth_verification_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on verification_tokens"
  ON nextauth_verification_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════
-- DONE — NextAuth tables created
-- ═══════════════════════════════════════════════════
