-- ============================================================
-- ProfiLux: section_visibility + masked_fields jsonb columns
-- Applied: 2026-05-15
-- ============================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS section_visibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS masked_fields      jsonb NOT NULL DEFAULT '{}'::jsonb;
