-- ============================================================
-- CV parse: pending payload column + parse history table
-- Applied: 2026-05-16
-- Phase C.1 — parse no longer mutates cv_parsed_data; resolver
-- stays blind to the pending payload until an explicit apply.
-- ============================================================

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS cv_parsed_pending jsonb DEFAULT NULL;

CREATE TABLE IF NOT EXISTS public.cv_parse_history (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  parsed_at       timestamptz NOT NULL DEFAULT now(),
  payload         jsonb NOT NULL,
  applied_at      timestamptz NULL,
  applied_by_user boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_cv_parse_history_member_parsed
  ON public.cv_parse_history(member_id, parsed_at DESC);

-- RLS: lock to service-role only. No policies — anon/auth keys cannot read.
ALTER TABLE public.cv_parse_history ENABLE ROW LEVEL SECURITY;
