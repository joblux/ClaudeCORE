import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import OpportunitiesClient from './OpportunitiesClient'
import type { SearchAssignment } from '@/types/search-assignment'

export const metadata: Metadata = {
  title: 'Luxury Careers — Executive Positions at Top Maisons | JOBLUX',
  description: 'Confidential executive search assignments at Hermes, LVMH, Chanel, Cartier, Rolex and 150+ luxury houses. Explore current opportunities.',
  alternates: { canonical: 'https://www.joblux.com/opportunities' },
  openGraph: {
    title: 'Opportunities | JOBLUX',
    description: 'Confidential executive search assignments across luxury.',
  },
}

export default async function OpportunitiesPage() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from('search_assignments')
    .select('id, title, slug, maison, is_confidential, city, country, remote_policy, department, seniority, contract_type, salary_min, salary_max, salary_currency, salary_period, salary_display, bonus_commission, activated_at')
    .eq('status', 'published')
    .order('activated_at', { ascending: false })

  const opportunities = (data ?? []) as SearchAssignment[]

  return <OpportunitiesClient initialOpportunities={opportunities} />
}
