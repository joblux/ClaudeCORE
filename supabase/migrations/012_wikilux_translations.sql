-- Add translations column to wikilux_content for multi-language support
-- Stores translations keyed by language code: { "fr": {...}, "ar": {...}, ... }
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}'::jsonb;
