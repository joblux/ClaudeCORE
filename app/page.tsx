import { createServerSupabaseClient } from '@/lib/supabase-server'
import { HomepageHero } from '@/components/home/HomepageHero'
import { HomepageSignals } from '@/components/home/HomepageSignals'
import { HomepageBrands } from '@/components/home/HomepageBrands'
import { HomepageSalaryInsights } from '@/components/home/HomepageSalaryInsights'
import { HomepageOpportunities } from '@/components/home/HomepageOpportunities'
import { HomepageEvents } from '@/components/home/HomepageEvents'
import { HomepageBrief } from '@/components/home/HomepageBrief'
import type { Metadata } from 'next'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'JOBLUX | Luxury career intelligence',
  description: 'Real salary data. Confidential opportunities. Market signals across 150+ luxury brands. The intelligence you need to make your next move.',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'JOBLUX',
  url: 'https://www.joblux.com',
  logo: 'https://www.joblux.com/favicon.svg',
  description: 'Luxury career intelligence. Real salary data, confidential opportunities, and market signals across 150+ luxury brands.',
  foundingDate: '2006',
  founder: { '@type': 'Person', name: "Mohammed M'zaour" },
  address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient()

  const [signalsRes, brandsRes, salariesRes, articlesRes, assignmentsRes, eventsRes] = await Promise.all([
    supabase
      .from('signals')
      .select('id, category, confidence, headline, context_paragraph, brand_tags, published_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(4),
    supabase
      .from('wikilux_content')
      .select('id, slug, brand_name, content')
      .order('updated_at', { ascending: false })
      .limit(8),
    supabase
      .from('salary_benchmarks')
      .select('id, job_title, brand_name, city, currency, salary_min, salary_max')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('bloglux_articles')
      .select('id, slug, title, excerpt, category, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3),
    supabase
      .from('search_assignments')
      .select('id, slug, title, description, seniority, location, salary_min, salary_max, salary_currency')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('events')
      .select('id, slug, name, location_city, location_country, sector, start_date')
      .eq('is_published', true)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(4),
  ])

  return (
    <div className="bg-[#1a1a1a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <HomepageHero />
      <HomepageSignals signals={signalsRes.data || []} />
      <HomepageBrands brands={brandsRes.data || []} />
      <HomepageSalaryInsights
        salaries={salariesRes.data || []}
        articles={articlesRes.data || []}
      />
      <HomepageOpportunities assignments={assignmentsRes.data || []} />
      <HomepageEvents events={eventsRes.data || []} />
      <HomepageBrief />
    </div>
  )
}
