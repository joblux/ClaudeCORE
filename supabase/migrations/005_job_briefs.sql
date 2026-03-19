-- Migration: 005_job_briefs.sql
-- Creates the job_briefs table for real job postings

CREATE TABLE IF NOT EXISTS job_briefs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Core fields
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  maison          TEXT NOT NULL,
  
  -- Location
  location        TEXT NOT NULL,
  city            TEXT,
  country         TEXT,
  remote_policy   TEXT CHECK (remote_policy IN ('on-site', 'hybrid', 'remote', 'flexible')),
  
  -- Role details
  contract_type   TEXT NOT NULL CHECK (contract_type IN ('permanent', 'fixed-term', 'freelance', 'interim', 'internship')),
  seniority       TEXT NOT NULL CHECK (seniority IN ('intern', 'junior', 'mid-level', 'senior', 'director', 'vp', 'c-suite')),
  department      TEXT,
  reports_to      TEXT,
  
  -- Content
  description     TEXT NOT NULL,
  responsibilities TEXT,
  requirements    TEXT,
  qualifications  TEXT,
  
  -- Salary
  salary_min      INTEGER,
  salary_max      INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  salary_display  TEXT,  -- e.g. "€100K–€130K" or "Competitive" or NULL to hide
  
  -- Visibility & access
  is_confidential BOOLEAN DEFAULT FALSE,  -- Only visible to Professional+ and above
  status          TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  
  -- SEO fields for job indexing (Google for Jobs, Indeed, etc.)
  seo_title       TEXT,       -- Custom title for search engines (falls back to title)
  seo_description TEXT,       -- Meta description for search engines
  seo_keywords    TEXT,       -- Comma-separated keywords
  structured_data BOOLEAN DEFAULT TRUE,  -- Whether to output JSON-LD structured data
  
  -- Metadata
  posted_by       UUID REFERENCES members(id),
  published_at    TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for slug lookups
CREATE INDEX IF NOT EXISTS idx_job_briefs_slug ON job_briefs(slug);

-- Index for listing queries (status + date)
CREATE INDEX IF NOT EXISTS idx_job_briefs_status ON job_briefs(status, published_at DESC);

-- Index for confidential filtering
CREATE INDEX IF NOT EXISTS idx_job_briefs_confidential ON job_briefs(is_confidential);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_job_briefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_job_briefs_updated_at
  BEFORE UPDATE ON job_briefs
  FOR EACH ROW
  EXECUTE FUNCTION update_job_briefs_updated_at();

-- Enable Row Level Security
ALTER TABLE job_briefs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read published non-confidential briefs
CREATE POLICY "Public can view published briefs"
  ON job_briefs FOR SELECT
  USING (status = 'published' AND is_confidential = FALSE);

-- Policy: Admins can do everything
CREATE POLICY "Admins full access"
  ON job_briefs FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);
