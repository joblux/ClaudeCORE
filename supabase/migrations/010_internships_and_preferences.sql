-- Phase 12: Internship listings
CREATE TABLE IF NOT EXISTS internship_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by UUID NOT NULL REFERENCES members(id),
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected', 'expired', 'closed')),
  company_name TEXT NOT NULL,
  company_website TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  department TEXT,
  description TEXT NOT NULL,
  responsibilities TEXT,
  requirements TEXT,
  nice_to_haves TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  remote_policy TEXT DEFAULT 'on_site'
    CHECK (remote_policy IN ('on_site', 'hybrid', 'remote')),
  duration TEXT NOT NULL,
  start_date TEXT,
  is_paid BOOLEAN DEFAULT false,
  compensation_details TEXT,
  luxury_sector TEXT,
  product_categories TEXT[],
  languages_required TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  structured_data JSONB,
  reviewed_by UUID REFERENCES members(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE internship_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved internships" ON internship_listings FOR SELECT USING (true);
CREATE POLICY "Service manage internships" ON internship_listings FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_internship_status ON internship_listings(status);
CREATE INDEX IF NOT EXISTS idx_internship_submitted_by ON internship_listings(submitted_by);
CREATE INDEX IF NOT EXISTS idx_internship_slug ON internship_listings(slug);

-- Phase 12: Opportunity preferences
CREATE TABLE IF NOT EXISTS opportunity_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) UNIQUE,
  preferred_sectors TEXT[],
  preferred_locations JSONB DEFAULT '[]',
  preferred_seniority TEXT[],
  preferred_departments TEXT[],
  preferred_contract_types TEXT[],
  open_to_internships BOOLEAN DEFAULT false,
  open_to_remote BOOLEAN DEFAULT false,
  min_salary INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  alerts_enabled BOOLEAN DEFAULT false,
  alert_frequency TEXT DEFAULT 'weekly'
    CHECK (alert_frequency IN ('instant', 'weekly', 'off')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opportunity_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read own preferences" ON opportunity_preferences FOR SELECT USING (true);
CREATE POLICY "Service manage preferences" ON opportunity_preferences FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_opp_prefs_member ON opportunity_preferences(member_id);
