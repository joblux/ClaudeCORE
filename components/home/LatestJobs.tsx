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
      <div className="jl-section-label">
        <span>Confidential Search Assignments</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {jobs.map((job) => {
          const displayMaison = job.is_confidential
            ? 'Confidential Maison'
            : job.maison || 'JOBLUX'
          const location = [job.city, job.country].filter(Boolean).join(' · ')
          return (
            <Link
              key={job.id}
              href={`/opportunities/${job.slug || job.id}`}
              className="block border border-[#e8e2d8] p-4 hover:border-[#a58e28] transition-colors"
            >
              <div className="jl-overline-gold mb-2">{displayMaison}</div>
              <div className="jl-serif text-sm text-[#1a1a1a] mb-2">{job.title}</div>
              <div className="flex items-center justify-between">
                <div className="font-sans text-[0.65rem] text-[#aaa]">{location}</div>
                {job.seniority && (
                  <span className="jl-badge text-[0.55rem]">{job.seniority}</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <p className="font-sans text-[0.6rem] text-[#aaa] italic mb-3">All assignments handled with full discretion by JOBLUX.</p>
      <Link href="/opportunities" className="font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors">
        View all assignments →
      </Link>
    </div>
  )
}
