CREATE TABLE IF NOT EXISTS wikilux_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  brand_name TEXT NOT NULL,
  content JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wikilux_slug ON wikilux_content(slug);

ALTER TABLE wikilux_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read wikilux content" ON wikilux_content FOR SELECT USING (true);
CREATE POLICY "Service role manages wikilux" ON wikilux_content FOR ALL USING (auth.role() = 'service_role');
