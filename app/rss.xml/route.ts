import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.luxuryrecruiter.com'
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, meta_description, excerpt, category, author_name, created_at, updated_at, hero_image_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(50)

  const escapeXml = (str: string) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const items = (articles || []).map((a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${baseUrl}/bloglux/${a.slug}</link>
      <guid isPermaLink="true">${baseUrl}/bloglux/${a.slug}</guid>
      <description><![CDATA[${a.meta_description || a.excerpt || ''}]]></description>
      <category>${escapeXml(a.category || '')}</category>
      <author>${escapeXml(a.author_name || 'JOBLUX')}</author>
      <pubDate>${new Date(a.published_at || a.created_at).toUTCString()}</pubDate>${a.hero_image_url ? `
      <enclosure url="${escapeXml(a.hero_image_url)}" type="image/jpeg"/>` : ''}
    </item>`).join('')

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>JOBLUX | BlogLux — Luxury Industry Intelligence</title>
    <link>${baseUrl}/bloglux</link>
    <description>Intelligence, analysis, and insights for luxury industry professionals. Careers, salaries, brand profiles, and market trends.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.svg</url>
      <title>JOBLUX</title>
      <link>${baseUrl}</link>
    </image>${items}
  </channel>
</rss>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
