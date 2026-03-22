import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import InterviewsClient from './InterviewsClient'
import type { InterviewExperienceListItem, InterviewStats } from '@/types/interview'

export const metadata: Metadata = {
  title: 'Interview Intelligence — Luxury Industry Interview Experiences | JOBLUX',
  description: 'Confidential interview experiences shared by professionals who have been through the process at the industry\'s most selective maisons.',
  alternates: { canonical: 'https://www.joblux.com/interviews' },
  openGraph: {
    title: 'Interview Intelligence | JOBLUX',
    description: 'Confidential interview experiences from luxury professionals.',
  },
}

export default async function InterviewsPage() {
  const supabase = createServerSupabaseClient()

  // Fetch first page of experiences (limit 12)
  const { data: rawData, count } = await supabase
    .from('interview_experiences')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 11)

  const initialExperiences: InterviewExperienceListItem[] = (rawData || []).map((exp: any) => ({
    id: exp.id,
    brand_name: exp.brand_name || exp.company || '',
    brand_slug: exp.brand_slug || '',
    job_title: exp.job_title,
    department: exp.department,
    seniority: exp.seniority,
    location: exp.location,
    interview_year: exp.interview_year,
    number_of_rounds: exp.number_of_rounds,
    interview_format: exp.interview_format,
    difficulty: exp.difficulty,
    overall_experience: exp.overall_experience,
    outcome: exp.outcome,
    is_anonymous: true,
    created_at: exp.created_at,
  }))

  const initialTotal = count ?? initialExperiences.length

  // Fetch all experiences for stats and filter options
  const { data: allData } = await supabase
    .from('interview_experiences')
    .select('difficulty, brand_name, brand_slug, department, seniority')

  const brandSlugs = new Set<string>()
  const brandMap = new Map<string, string>()
  const deptSet = new Set<string>()
  const senioritySet = new Set<string>()

  ;(allData || []).forEach((e: any) => {
    if (e.brand_slug) {
      brandSlugs.add(e.brand_slug)
      brandMap.set(e.brand_slug, e.brand_name || e.brand_slug)
    }
    if (e.department) deptSet.add(e.department)
    if (e.seniority) senioritySet.add(e.seniority)
  })

  const initialBrands = Array.from(brandSlugs)
    .map(slug => ({ name: brandMap.get(slug) || slug, slug }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const initialDepartments = Array.from(deptSet).sort()
  const initialSeniority = Array.from(senioritySet).sort()

  const initialStats: InterviewStats = {
    total_experiences: (allData || []).length,
    unique_brands: brandSlugs.size,
    difficulty_distribution: {},
    common_formats: {},
  }

  return (
    <InterviewsClient
      initialExperiences={initialExperiences}
      initialBrands={initialBrands}
      initialStats={initialStats}
      initialTotal={initialTotal}
      initialDepartments={initialDepartments}
      initialSeniority={initialSeniority}
    />
  )
}
