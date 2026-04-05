-- ============================================================
-- Soft delete: add deleted_at / deleted_by to Phase 1 tables
-- Applied: 2026-04-05
-- ============================================================

-- 1. Add soft-delete columns
ALTER TABLE wikilux_content    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE wikilux_content    ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

ALTER TABLE bloglux_articles   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE bloglux_articles   ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

ALTER TABLE contributions      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE contributions      ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

ALTER TABLE interview_experiences ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE interview_experiences ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

-- 2. Replace absolute UNIQUE on slug with partial index (active rows only)
--    This allows soft-deleted rows to coexist with new rows sharing the same slug.
ALTER TABLE wikilux_content DROP CONSTRAINT IF EXISTS wikilux_content_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_wikilux_slug_active
  ON wikilux_content(slug) WHERE deleted_at IS NULL;

-- bloglux_articles was renamed from "articles" in the dashboard;
-- constraint name may be either form.
ALTER TABLE bloglux_articles DROP CONSTRAINT IF EXISTS bloglux_articles_slug_key;
ALTER TABLE bloglux_articles DROP CONSTRAINT IF EXISTS articles_slug_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bloglux_slug_active
  ON bloglux_articles(slug) WHERE deleted_at IS NULL;

-- 3. Partial indexes for trash queries (only index deleted rows)
CREATE INDEX IF NOT EXISTS idx_wikilux_deleted
  ON wikilux_content(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bloglux_deleted
  ON bloglux_articles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contributions_deleted
  ON contributions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_interviews_deleted
  ON interview_experiences(deleted_at) WHERE deleted_at IS NOT NULL;

-- 4. Update RLS policies — exclude soft-deleted rows from public reads
--    Service role bypasses RLS so /admin/trash still works.

-- wikilux_content
DROP POLICY IF EXISTS "Anyone can read wikilux content" ON wikilux_content;
CREATE POLICY "Anyone can read wikilux content" ON wikilux_content
  FOR SELECT USING (deleted_at IS NULL);

-- bloglux_articles (policy name may be either form after table rename)
DROP POLICY IF EXISTS "Anyone can read published articles" ON bloglux_articles;
DROP POLICY IF EXISTS "Public read published articles" ON bloglux_articles;
CREATE POLICY "Anyone can read published articles" ON bloglux_articles
  FOR SELECT USING (published = true AND deleted_at IS NULL);

-- interview_experiences
DROP POLICY IF EXISTS "Public read interview_experiences" ON interview_experiences;
CREATE POLICY "Public read interview_experiences" ON interview_experiences
  FOR SELECT USING (deleted_at IS NULL);

-- contributions (created outside migrations — verify exact USING clause
-- in Supabase dashboard before running; the original is documented as
-- "own + approved", i.e. member_id = auth.uid() OR status = 'approved')
DROP POLICY IF EXISTS "Members read own contributions" ON contributions;
CREATE POLICY "Members read own contributions" ON contributions
  FOR SELECT USING (
    deleted_at IS NULL
    AND (member_id = auth.uid() OR status = 'approved')
  );
