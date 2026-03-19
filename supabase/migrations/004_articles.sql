CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'bloglux',
  author_name TEXT NOT NULL DEFAULT 'JOBLUX Editorial',
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  read_time INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published articles" ON articles FOR SELECT USING (published = true);
CREATE POLICY "Service role manages articles" ON articles FOR ALL USING (auth.role() = 'service_role');
