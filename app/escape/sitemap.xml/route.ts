import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE = 'https://joblux.com'

export async function GET() {
  const [articles, itineraries, hotels, cities, cruises] = await Promise.all([
    supabase.from('escape_articles').select('slug, published_at').eq('published', true),
    supabase.from('escape_itineraries').select('slug').eq('published', true),
    supabase.from('escape_hotels').select('slug').eq('published', true),
    supabase.from('escape_city_guides').select('slug').eq('published', true),
    supabase.from('escape_cruises').select('slug').eq('published', true),
  ])

  const urls: { loc: string; lastmod?: string; priority?: string }[] = [
    { loc: '/escape', priority: '1.0' },
    { loc: '/escape/itineraries', priority: '0.9' },
    { loc: '/escape/hotels', priority: '0.9' },
    { loc: '/escape/cities', priority: '0.8' },
    { loc: '/escape/cruises', priority: '0.8' },
    { loc: '/escape/deals', priority: '0.7' },
    { loc: '/escape/plan', priority: '0.8' },
  ]

  for (const a of articles.data || []) {
    urls.push({ loc: `/escape/blog/${a.slug}`, lastmod: a.published_at, priority: '0.8' })
  }
  for (const i of itineraries.data || []) {
    urls.push({ loc: `/escape/itineraries/${i.slug}`, priority: '0.9' })
  }
  for (const h of hotels.data || []) {
    urls.push({ loc: `/escape/hotels/${h.slug}`, priority: '0.8' })
  }
  for (const c of cities.data || []) {
    urls.push({ loc: `/escape/cities/${c.slug}`, priority: '0.8' })
  }
  for (const cr of cruises.data || []) {
    urls.push({ loc: `/escape/cruises/${cr.slug}`, priority: '0.8' })
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE}${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${new Date(u.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <priority>${u.priority || '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
