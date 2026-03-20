-- BlogLux Upgrade — Phase 11

-- Extend articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_alt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_caption TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS hero_image_source TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_title TEXT DEFAULT 'JOBLUX Editorial';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_avatar_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS related_article_ids UUID[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bloglux_featured ON articles(is_featured);

-- Comments table
CREATE TABLE IF NOT EXISTS bloglux_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE,
  parent_id UUID REFERENCES bloglux_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bloglux_comments_article ON bloglux_comments(article_id);
ALTER TABLE bloglux_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read approved comments" ON bloglux_comments FOR SELECT USING (is_approved = true);
CREATE POLICY "Service manage comments" ON bloglux_comments FOR ALL USING (true);

-- Reactions table
CREATE TABLE IF NOT EXISTS bloglux_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, member_id, reaction_type)
);
ALTER TABLE bloglux_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read reactions" ON bloglux_reactions FOR SELECT USING (true);
CREATE POLICY "Service manage reactions" ON bloglux_reactions FOR ALL USING (true);

-- Authors table
CREATE TABLE IF NOT EXISTS bloglux_authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bloglux_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read authors" ON bloglux_authors FOR SELECT USING (true);
CREATE POLICY "Service manage authors" ON bloglux_authors FOR ALL USING (true);

INSERT INTO bloglux_authors (name, title, bio, is_primary)
VALUES ('Mohammed M''zaour', 'Founder, JOBLUX', 'Founder of JOBLUX — Luxury Talents Society. Connecting exceptional talent with the world''s most prestigious maisons.', TRUE)
ON CONFLICT DO NOTHING;
