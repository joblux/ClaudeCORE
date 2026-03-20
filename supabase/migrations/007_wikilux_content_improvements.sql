-- Add regeneration tracking to wikilux_content
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ;
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0;
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS content_version INTEGER DEFAULT 1;

-- Add editorial notes to wikilux_content
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS editorial_notes TEXT;
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS editorial_updated_at TIMESTAMPTZ;
ALTER TABLE wikilux_content ADD COLUMN IF NOT EXISTS editorial_updated_by UUID;
