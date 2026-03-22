import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'

interface Job {
  id: string
  slug: string | null
  title: string
  maison: string | null
  is_confidential: boolean
  city: string | null
  country: string | null
  seniority: string | null
}

export async function LatestJobs() {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from('search_assignments')
    .select('id, slug, title, maison, is_confidential, city, country, seniority')
    .eq('status', 'published')
    .order('activated_at', { ascending: false })
    .limit(4)

  const jobs: Job[] = data || []

  if (jobs.length === 0) return null

  return (
    <div>
      <div className="jl-section-label"><span>Assignments</span></div>
      <div className="space-y-0">
        {jobs.map((job) => {
          const displayMaison = job.is_confidential ? 'Confidential Maison' : job.maison || 'JOBLUX'
          const location = [job.city, job.country].filter(Boolean).join(' · ')
          return (
            <Link
              key={job.id}
              href={`/opportunities/${job.slug || job.id}`}
              className="block py-3 border-b border-[#f5f0e8] last:border-0 hover:bg-[#fafaf5] transition-colors -mx-1 px-1"
            >
              <div className="jl-overline-gold mb-1">{displayMaison}</div>
              <div className="jl-serif text-sm text-[#1a1a1a] mb-1">{job.title}</div>
              <div className="flex items-center justify-between">
                <div className="font-sans text-[0.65rem] text-[#aaa]">{location}</div>
                {job.seniority && <span className="jl-badge text-[0.55rem]">{job.seniority}</span>}
              </div>
            </Link>
          )
        })}
      </div>
      <Link href="/opportunities" className="inline-block mt-3 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        All assignments →
      </Link>
    </div>
  )
}
