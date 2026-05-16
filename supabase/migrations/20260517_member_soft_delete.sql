-- ============================================================
-- Member lifecycle: soft-delete substrate
-- Doctrine: docs/PROFILUX_MATRIX_V1.md §25
-- Applied: 2026-05-17
--
-- Pre-flight verified 2026-05-16:
--   - members_email_key UNIQUE (email) constraint name confirmed
--   - idx_members_email non-unique btree exists and is preserved
--   - 13 members, 0 NULL emails, 0 empty emails, 0 case-insensitive duplicates
--   - members.deleted_at + members.deleted_by both absent
--   - Proposed index names both free
--   - RLS enabled, 6 policies present; 2 own-scoped policies tightened below
-- ============================================================

ALTER TABLE public.members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS deleted_by UUID NULL;

CREATE INDEX IF NOT EXISTS idx_members_deleted_at_partial
  ON public.members(deleted_at) WHERE deleted_at IS NOT NULL;

ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email_active
  ON public.members(lower(email)) WHERE deleted_at IS NULL;

DROP POLICY IF EXISTS "Members read own" ON public.members;
CREATE POLICY "Members read own" ON public.members
  FOR SELECT
  USING (auth_user_id = auth.uid() AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Members update own" ON public.members;
CREATE POLICY "Members update own" ON public.members
  FOR UPDATE
  USING (auth_user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (auth_user_id = auth.uid() AND deleted_at IS NULL);
