import { supabaseAdmin } from '@/lib/supabase'
import { HomepageHero } from '@/components/home/HomepageHero'
import { HomepageSignals } from '@/components/home/HomepageSignals'
import { HomepageOpportunities } from '@/components/home/HomepageOpportunities'
import { HomepageBrands } from '@/components/home/HomepageBrands'
import { HomepageSalaryInsights } from '@/components/home/HomepageSalaryInsights'
import { HomepageEvents } from '@/components/home/HomepageEvents'
import { HomepageBrief } from '@/components/home/HomepageBrief'
import type { Metadata } from 'next'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'JOBLUX | Luxury career intelligence',
  description: 'Real salary data. Confidential opportunities. Market signals across 179 luxury brands. The intelligence you need to make your next move.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'Luxury career intelligence. Real salary data, confidential opportunities, and market signals across 179 luxury brands.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
}

export default async function HomePage() {
  const supabase = supabaseAdmin()

  const [
    signalsRes,
    activeCountRes,
    assignmentsRes,
    salariesRes,
    articlesRes,
    eventsRes,
    brandSignalsRes,
    brandsWikiRes,
  ] = await Promise.all([
    // Signals for ticker + signals section (limit 6 covers both)
    supabase
      .from('signals')
      .select('slug, headline, category, brand_tags, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(6),
    // Active search count for hero stat
    supabase
      .from('search_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    // Assignments for opportunities section
    supabase
      .from('search_assignments')
      .select('slug, title, description, location, seniority')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
    // Salary benchmarks
    supabase
      .from('salary_benchmarks')
      .select('job_title, brand_name, city, salary_min, salary_max, currency')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5),
    // Insights articles
    supabase
      .from('bloglux_articles')
      .select('slug, title, category, read_time_minutes, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
    // Upcoming events
    supabase
      .from('events')
      .select('slug, title, event_date, city, country, sector')
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(4),
    // Signals for brand intelligence mapping
    supabase
      .from('signals')
      .select('brand_tags, category, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(50),
    // WikiLux content for brand cards
    supabase
      .from('wikilux_content')
      .select('slug, brand_name, content, is_published')
      .eq('is_published', true),
  ])

  // Build brand intelligence: brands sorted by most recent signal
  const brandSignalMap = new Map<string, string>()
  const brandSignals = (brandSignalsRes.data || []) as { brand_tags: string[] | null; category: string; published_at: string }[]
  for (const signal of brandSignals) {
    for (const tag of (signal.brand_tags || []) as string[]) {
      const key = tag.toLowerCase()
      if (!brandSignalMap.has(key)) {
        brandSignalMap.set(key, signal.category)
      }
    }
  }

  const wikiData = (brandsWikiRes.data || []) as { slug: string; brand_name: string; content: Record<string, any> | null; is_published: boolean }[]
  const brands = wikiData
    .filter(b => brandSignalMap.has(b.brand_name.toLowerCase()))
    .map(b => {
      const c = (b.content || {}) as Record<string, any>
      return {
        slug: b.slug,
        brand_name: b.brand_name,
        tagline: (c.tagline as string) || '',
        parent_group: (c.stock?.parent_group as string) || '',
        latest_signal: brandSignalMap.get(b.brand_name.toLowerCase())!,
      }
    })
    .slice(0, 8)

  const activeSearchCount = activeCountRes.count || 0

  return (
    <div style={{ background: '#171717' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <HomepageHero activeSearchCount={activeSearchCount} />
      <HomepageSignals signals={(signalsRes.data || []).slice(0, 4)} />
      <HomepageOpportunities assignments={assignmentsRes.data || []} />
      <HomepageBrands brands={brands} />
      <HomepageSalaryInsights
        salaries={salariesRes.data || []}
        articles={articlesRes.data || []}
      />
      <HomepageEvents events={eventsRes.data || []} />
      <HomepageBrief />
    </div>
  )
}
