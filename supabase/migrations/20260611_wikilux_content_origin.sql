-- WikiLux provenance migration (lane 14650938, approved Mo+GPT)
-- Locked form (docs/WIKILUX_ENGINE_DESIGN_V1.md §1): fiche-level content_origin
-- as DB column; source_url/source_ref stay inside content jsonb per fact/section.
-- Nullable, no default, no backfill — rejected rows stay archive-dead with NULL.
-- Allowed values mirror the signals.content_origin convention.

ALTER TABLE public.wikilux_content
  ADD COLUMN content_origin text
  CONSTRAINT wikilux_content_content_origin_check
  CHECK (content_origin IN ('seed', 'rss', 'ai', 'sourced'));
