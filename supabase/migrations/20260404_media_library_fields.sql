-- Add category, brand_name, photographer_name to media_library
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS brand_name TEXT;
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS photographer_name TEXT;

CREATE INDEX IF NOT EXISTS idx_media_library_category ON media_library(category);
CREATE INDEX IF NOT EXISTS idx_media_library_brand ON media_library(brand_name);
