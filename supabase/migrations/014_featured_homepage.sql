-- Add featured_homepage flag to bloglux_articles
-- Applied directly to Supabase on 2026-03-21
ALTER TABLE bloglux_articles ADD COLUMN IF NOT EXISTS featured_homepage BOOLEAN DEFAULT false;
