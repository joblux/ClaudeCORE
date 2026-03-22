import { config } from 'dotenv'
config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

// Verify env
const required = ['WIKILUX_API_KEY', 'NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'UNSPLASH_ACCESS_KEY']
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing env var: ${key}`); process.exit(1) }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const anthropic = new Anthropic({ apiKey: process.env.WIKILUX_API_KEY! })

interface ArticleTopic {
  title: string
  category: string
  featured: boolean
}

const TOPICS: ArticleTopic[] = [
  // Industry Moves
  { title: 'The Great Luxury Reshuffle: How Executive Musical Chairs Are Reshaping Fashion Houses', category: 'Industry Moves', featured: true },
  { title: "Why LVMH's Quiet Reorganisation Signals a New Era for Luxury Conglomerates", category: 'Industry Moves', featured: false },
  { title: 'From Hermès to Independents: The Rise of Family-Owned Luxury in a Corporate World', category: 'Industry Moves', featured: false },
  { title: 'Creative Director Tenure: Why the Average Stay Has Halved in a Decade', category: 'Industry Moves', featured: false },
  { title: 'The M&A Playbook: How Luxury Groups Are Acquiring Their Way to Dominance', category: 'Industry Moves', featured: false },
  // Career Intelligence
  { title: 'The Luxury Skill Gap: What Hiring Managers Actually Look for in 2026', category: 'Career Intelligence', featured: true },
  { title: 'Beyond the Boutique: Non-Traditional Career Paths in Luxury', category: 'Career Intelligence', featured: false },
  { title: "Salary Transparency in Luxury: Why the Industry's Biggest Taboo Is Finally Breaking", category: 'Career Intelligence', featured: false },
  { title: 'The CRM Revolution: How Client Advisors Became the Most Valuable Luxury Asset', category: 'Career Intelligence', featured: false },
  { title: 'Relocating for Luxury: The Complete Guide to Career Mobility in Fashion and Watches', category: 'Career Intelligence', featured: false },
  // Culture & Heritage
  { title: 'Inside the Atelier: How Haute Couture Craftsmanship Survives in the Digital Age', category: 'Culture & Heritage', featured: true },
  { title: 'The Apprenticeship Renaissance: Luxury Houses Betting on Artisan Training', category: 'Culture & Heritage', featured: false },
  { title: 'Patrimoine and Profit: Balancing Heritage Preservation with Commercial Growth', category: 'Culture & Heritage', featured: false },
  { title: 'The Savoir-Faire Economy: Why Craftsmanship Skills Command Premium Salaries', category: 'Culture & Heritage', featured: false },
  { title: "From Geneva to Grasse: A Tour of Luxury's Most Important Workshops", category: 'Culture & Heritage', featured: false },
  // Market Insights
  { title: 'The Middle East Luxury Boom: Career Opportunities in a $12 Billion Market', category: 'Market Insights', featured: true },
  { title: "China's Luxury Workforce: What the Talent Migration Means for Global Brands", category: 'Market Insights', featured: false },
  { title: 'Luxury Real Estate and Lifestyle: The Convergence Creating New C-Suite Roles', category: 'Market Insights', featured: false },
  { title: 'The Quiet Luxury Index: Measuring What Consumers Really Want in 2026', category: 'Market Insights', featured: false },
  { title: 'Second-Hand, First Class: How Resale Is Reshaping Luxury Talent Needs', category: 'Market Insights', featured: false },
  // The Future of Luxury
  { title: 'AI in the Maison: How Luxury Houses Are Integrating Technology Without Losing Soul', category: 'The Future of Luxury', featured: true },
  { title: 'Sustainability Officers: The Newest Power Role in Luxury Organisations', category: 'The Future of Luxury', featured: false },
  { title: 'Gen Z and the Luxury Workplace: Rethinking Retention in an Industry Built on Tradition', category: 'The Future of Luxury', featured: false },
  { title: 'The Direct-to-Consumer Shift: Why Luxury Brands Are Hiring More Tech Than Retail', category: 'The Future of Luxury', featured: false },
  { title: "Luxury 2030: The Roles That Don't Exist Yet but Will Define the Next Decade", category: 'The Future of Luxury', featured: false },
]

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

async function fetchCoverImage(topic: string): Promise<string | null> {
  try {
    const query = `${topic} luxury editorial`
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
    )
    const data = await res.json()
    return data.results?.[0]?.urls?.regular || null
  } catch {
    return null
  }
}

async function main() {
  console.log('BlogLux Article Seeding')
  console.log('=======================')
  console.log(`Articles to generate: ${TOPICS.length}`)
  console.log('')

  // Check existing
  const { data: existing } = await supabase.from('bloglux_articles').select('slug')
  const existingSlugs = new Set((existing || []).map((r) => r.slug))

  let success = 0
  const failed: string[] = []
  const now = Date.now()

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i]
    const slug = slugify(topic.title)

    if (existingSlugs.has(slug)) {
      console.log(`[${i + 1}/${TOPICS.length}] Skipping (exists): ${topic.title.substring(0, 50)}...`)
      continue
    }

    try {
      process.stdout.write(`[${i + 1}/${TOPICS.length}] Generating: ${topic.title.substring(0, 50)}... `)

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `Write a luxury industry editorial article for JOBLUX | Luxury Industry Careers Intelligence.

Title: "${topic.title}"
Category: ${topic.category}

Return ONLY valid JSON (no markdown, no backticks):
{
  "excerpt": "2-sentence summary, max 150 characters",
  "body": "Full HTML article body, 800-1200 words. Use <h2>, <h3>, <p> tags. Write in authoritative editorial style like Business of Fashion. Include specific examples, data points, and industry insights. Do NOT use markdown — only HTML tags.",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "reading_time": 5
}

Write for luxury industry professionals. Be authoritative, specific, and insightful.`
        }],
      })

      const text = message.content[0].type === 'text' ? message.content[0].text : ''
      const cleaned = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim()
      const article = JSON.parse(cleaned)

      // Stagger dates: most recent first
      const daysAgo = Math.floor((i / TOPICS.length) * 90)
      const publishedAt = new Date(now - daysAgo * 86400000).toISOString()

      const coverImage = await fetchCoverImage(topic.category)

      const { error } = await supabase.from('bloglux_articles').upsert({
        title: topic.title,
        slug,
        excerpt: (article.excerpt || '').substring(0, 150),
        body: article.body,
        category: topic.category,
        author_name: 'JOBLUX Editorial',
        cover_image_url: coverImage,
        status: 'published',
        published_at: publishedAt,
        read_time_minutes: article.reading_time || 5,
        tags: article.tags || [],
      }, { onConflict: 'slug' })

      if (error) throw new Error(error.message)

      console.log('saved')
      success++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`FAILED: ${msg}`)
      failed.push(topic.title)
    }

    if (i < TOPICS.length - 1) {
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  console.log('')
  console.log('BlogLux Seeding Complete')
  console.log('========================')
  console.log(`${success} generated, ${failed.length} failed`)
  if (failed.length > 0) {
    console.log(`Failed: ${failed.join(', ')}`)
  }
}

main().catch((err) => { console.error('Fatal error:', err); process.exit(1) })
