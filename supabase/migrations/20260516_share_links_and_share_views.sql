-- ============================================================
-- ProfiLux share hardening — B.1.1 substrate
-- Applied: 2026-05-16
-- Creates share_links + share_views tables.
-- Backfills existing profilux.share_slug rows.
-- Legacy profilux.share_slug + profilux.sharing_enabled remain
-- in place (dual-read cutover; legacy drop deferred to B.1.4).
-- Security: RLS on + service-role only (explicit REVOKE/GRANT).
-- ============================================================

-- ---- share_links ----

CREATE TABLE IF NOT EXISTS public.share_links (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  slug             text NOT NULL UNIQUE,
  sharing_enabled  boolean NOT NULL DEFAULT false,
  password_hash    text NULL,
  password_salt    text NULL,
  expires_at       date NULL,
  rotated_from     text NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT share_links_password_pair_chk
    CHECK (
      (password_hash IS NULL AND password_salt IS NULL)
      OR
      (password_hash IS NOT NULL AND password_salt IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_share_links_member_id
  ON public.share_links(member_id);

ALTER TABLE public.share_links ENABLE ROW LEVEL SECURITY;

-- ---- share_views ----

CREATE TABLE IF NOT EXISTS public.share_views (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id  uuid NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  viewed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_share_views_link_viewed
  ON public.share_views(share_link_id, viewed_at DESC);

ALTER TABLE public.share_views ENABLE ROW LEVEL SECURITY;

-- ---- Explicit REVOKE / GRANT (service-role only) ----

REVOKE ALL ON public.share_links FROM anon, authenticated;
REVOKE ALL ON public.share_views FROM anon, authenticated;
GRANT ALL ON public.share_links TO service_role;
GRANT ALL ON public.share_views TO service_role;

-- ---- Backfill from legacy profilux.share_slug ----

INSERT INTO public.share_links (member_id, slug, sharing_enabled, created_at, updated_at)
SELECT
  m.id,
  p.share_slug,
  COALESCE(p.sharing_enabled, false),
  COALESCE(p.created_at, now()),
  COALESCE(p.created_at, now())
FROM public.profilux p
JOIN public.members m ON LOWER(m.email) = LOWER(p.email)
WHERE p.share_slug IS NOT NULL
ON CONFLICT (slug) DO NOTHING;
