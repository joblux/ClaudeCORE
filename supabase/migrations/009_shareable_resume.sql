-- Shareable Résumé — Phase 11

-- Add résumé fields to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS resume_slug TEXT UNIQUE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS resume_public BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS resume_show_email BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS resume_show_phone BOOLEAN DEFAULT FALSE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS resume_headline TEXT;

-- Ensure avatar_url exists
ALTER TABLE members ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE INDEX IF NOT EXISTS idx_members_resume_slug ON members(resume_slug);
