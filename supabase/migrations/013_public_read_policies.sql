-- ============================================================
-- Public read policies for content tables
-- Applied directly to Supabase on 2026-03-21
-- ============================================================

-- interview_experiences: public read for /interviews page
-- (RLS was enabled but no SELECT policy existed)
CREATE POLICY IF NOT EXISTS "Public read interview_experiences" ON interview_experiences
  FOR SELECT USING (true);

-- salary_contributions: public read for salary aggregation
-- (RLS was enabled but no SELECT policy existed)
CREATE POLICY IF NOT EXISTS "Public read salary_contributions" ON salary_contributions
  FOR SELECT USING (true);

-- Note: bloglux_articles already has "Public read published articles" policy
-- Note: salary_benchmarks already has "Anyone can read salary benchmarks" policy
-- Note: wikilux_content already has "Anyone can read wikilux_content" policy
-- Note: contributions already has "Members read own contributions" policy (own + approved)
