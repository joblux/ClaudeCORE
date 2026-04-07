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
  description: 'Real salary data. Confidential opportunities. Market signals across 180+ luxury brands. The intelligence you need to make your next move.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'Luxury career intelligence. Real salary data, confidential opportunities, and market signals across 180+ luxury brands.',
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
    brandsWikiRes,
  ] = await Promise.all([
    // Signals for ticker + signals section
    supabase
      .from('signals')
      .select('slug, headline, category, brand_tags, published_at', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(8),
    // Active search count for hero stat
    supabase
      .from('search_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    // Assignments for opportunities section
    supabase
      .from('search_assignments')
      .select('slug, title, description, location, seniority')
      .eq('status', 'published')
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
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .limit(3),
    // Upcoming events
    supabase
      .from('events')
      .select('slug, title, event_date, location_city, location_country, sector', { count: 'exact' })
      .eq('is_published', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(4),
    // WikiLux content for brand cards
    supabase
      .from('wikilux_content')
      .select('slug, brand_name, content, is_published, updated_at')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(8),
  ])

  const wikiData = (brandsWikiRes.data || []) as { slug: string; brand_name: string; content: Record<string, any> | null; is_published: boolean }[]
  const brands = wikiData.map(b => {
    const c = (b.content || {}) as Record<string, any>
    return {
      slug: b.slug,
      brand_name: b.brand_name,
      tagline: (c.tagline as string) || '',
      parent_group: (c.stock?.parent_group as string) || '',
      latest_signal: '',
    }
  })

  const activeSearchCount = activeCountRes.count || 0

  return (
    <div style={{ background: '#171717' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <HomepageHero
        assignmentCount={activeSearchCount}
        signalCount={signalsRes.count || 54}
        eventCount={eventsRes.count || 9}
        articleCount={articlesRes.data?.length || 29}
      />
      <HomepageSalaryInsights
        salaries={salariesRes.data || []}
        articles={articlesRes.data || []}
      />
      <HomepageOpportunities assignments={assignmentsRes.data || []} />
      <HomepageBrands brands={brands} />
      <HomepageSignals signals={(signalsRes.data || []).slice(0, 8)} />
      <HomepageEvents events={(eventsRes.data || []).map((e: any) => ({ ...e, city: e.location_city, country: e.location_country }))} />
      <HomepageBrief />
    </div>
  )
}
