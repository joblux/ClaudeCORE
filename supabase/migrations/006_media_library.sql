-- Media Library table for JOBLUX admin
CREATE TABLE IF NOT EXISTS media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'upload',
  unsplash_attribution JSONB,
  uploaded_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_library_source ON media_library(source);

-- RLS
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media" ON media_library FOR SELECT USING (true);
CREATE POLICY "Admin insert media" ON media_library FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin update media" ON media_library FOR UPDATE USING (true);
CREATE POLICY "Admin delete media" ON media_library FOR DELETE USING (true);

-- Add images column to wikilux_brands for caching Unsplash images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'wikilux_brands'
  ) THEN
    CREATE TABLE wikilux_brands (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      brand_name TEXT NOT NULL,
      images JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE wikilux_brands ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public read wikilux_brands" ON wikilux_brands FOR SELECT USING (true);
    CREATE POLICY "Service write wikilux_brands" ON wikilux_brands FOR ALL USING (true);
  ELSE
    ALTER TABLE wikilux_brands ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
  END IF;
END $$;
