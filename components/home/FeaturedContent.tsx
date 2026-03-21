'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Article {
  title: string
  slug: string
  category: string
  excerpt: string | null
  published_at: string | null
  read_time_minutes: number | null
  cover_image_url: string | null
}

interface InterviewRow {
  id: string
  job_title: string
  brand_name: string | null
  brand_slug: string | null
  location: string | null
  difficulty: string | null
  overall_experience: string | null
  interview_year: number | null
  number_of_rounds: number | null
}

interface SalaryRow {
  job_title: string
  brand_name: string | null
  city: string | null
  currency: string | null
  salary_min: number | null
  salary_max: number | null
  seniority: string | null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatK(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K`
  return String(n)
}

function buildRange(row: SalaryRow): string {
  const sym = CURRENCY_SYMBOLS[row.currency || 'EUR'] || row.currency || ''
  if (row.salary_min && row.salary_max) return `${sym}${formatK(row.salary_min)}–${formatK(row.salary_max)}`
  if (row.salary_min) return `From ${sym}${formatK(row.salary_min)}`
  if (row.salary_max) return `Up to ${sym}${formatK(row.salary_max)}`
  return ''
}

const DIFFICULTY_DOTS: Record<string, number> = {
  'Easy': 1, 'Moderate': 2, 'Challenging': 3, 'Difficult': 4, 'Very Difficult': 5,
}

export function FeaturedContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [interviews, setInterviews] = useState<InterviewRow[]>([])
  const [salaries, setSalaries] = useState<SalaryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      // Fetch articles
      const { data: featured } = await supabase
        .from('bloglux_articles')
        .select('title, slug, category, excerpt, published_at, read_time_minutes, cover_image_url')
        .eq('status', 'published')
        .eq('featured_homepage', true)
        .order('published_at', { ascending: false })
        .limit(8)

      if (featured && featured.length >= 6) {
        setArticles(featured)
      } else {
        // Fallback: most recent published
        const { data: recent } = await supabase
          .from('bloglux_articles')
          .select('title, slug, category, excerpt, published_at, read_time_minutes, cover_image_url')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(8)
        setArticles(recent || [])
      }

      // Fetch interview experiences
      const { data: intData } = await supabase
        .from('interview_experiences')
        .select('id, job_title, brand_name, brand_slug, location, difficulty, overall_experience, interview_year, number_of_rounds')
        .order('created_at', { ascending: false })
        .limit(3)
      setInterviews(intData || [])

      // Fetch salary highlights (diverse roles)
      const { data: salData } = await supabase
        .from('salary_benchmarks')
        .select('job_title, brand_name, city, currency, salary_min, salary_max, seniority')
        .order('salary_max', { ascending: false })
        .limit(4)
      setSalaries(salData || [])

      setLoading(false)
    }
    fetchAll()
  }, [])

  const lead = articles[0]
  const others = articles.slice(1)

  return (
    <div className="space-y-10">

      {/* ── LEAD STORY ─────────────────────────────────────────── */}
      <div>
        <div className="jl-section-label">
          <span>Latest Intelligence</span>
        </div>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#888]">Loading articles...</p>
          </div>
        ) : !lead ? (
          <div className="py-8 text-center">
            <p className="text-sm text-[#888]">No articles published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-[#e8e2d8]">
            {/* Lead text */}
            <div>
              <div className="jl-overline-gold mb-3">{lead.category}</div>
              <h2 className="jl-serif text-2xl font-light text-[#1a1a1a] leading-snug mb-3 hover:text-[#a58e28] transition-colors">
                <Link href={`/bloglux/${lead.slug}`}>{lead.title}</Link>
              </h2>
              {lead.excerpt && (
                <p className="font-sans text-sm text-[#666] leading-relaxed mb-3">
                  {lead.excerpt}
                </p>
              )}
              <div className="jl-overline">
                {formatDate(lead.published_at)}
                {lead.read_time_minutes && <> &nbsp;·&nbsp; {lead.read_time_minutes} min read</>}
              </div>
            </div>

            {/* Lead visual */}
            {lead.cover_image_url ? (
              <div className="relative bg-[#fafaf5] border border-[#e8e2d8] min-h-[180px] overflow-hidden">
                <Image
                  src={lead.cover_image_url}
                  alt={lead.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ) : (
              <div className="bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center min-h-[180px]">
                <div className="text-center">
                  <div className="jl-serif text-3xl font-light tracking-[0.2em] text-[#a58e28] uppercase">Intelligence</div>
                  <div className="jl-overline mt-2">JOBLUX · 2026</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ARTICLE LIST ───────────────────────────────────────── */}
      {others.length > 0 && (
        <div>
          <div className="jl-section-label">
            <span>Bloglux</span>
          </div>

          <div className="space-y-0">
            {others.map((article, i) => (
              <div
                key={article.slug}
                className="flex items-start gap-4 py-4 border-b border-[#f0ece4] last:border-0"
              >
                <div className="flex-1">
                  <div className="jl-overline-gold mb-1.5">{article.category}</div>
                  <h3 className="jl-serif text-base font-light text-[#1a1a1a] leading-snug mb-1.5 hover:text-[#a58e28] transition-colors">
                    <Link href={`/bloglux/${article.slug}`}>{article.title}</Link>
                  </h3>
                  <div className="jl-overline">
                    {formatDate(article.published_at)}
                    {article.read_time_minutes && <> &nbsp;·&nbsp; {article.read_time_minutes} min read</>}
                  </div>
                </div>
                <div className="jl-serif text-3xl font-light text-[#e8e2d8] leading-none flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/bloglux"
            className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
          >
            More from Bloglux →
          </Link>
        </div>
      )}

      {/* ── INTERVIEWS ─────────────────────────────────────────── */}
      <div>
        <div className="jl-section-label">
          <span>Interview Intelligence</span>
        </div>

        {interviews.length > 0 ? (
          <div className="space-y-0">
            {interviews.map((exp) => {
              const dots = exp.difficulty ? (DIFFICULTY_DOTS[exp.difficulty] || 0) : 0
              return (
                <Link
                  key={exp.id}
                  href={`/interviews/${exp.brand_slug || ''}`}
                  className="flex items-start gap-4 py-4 border-b border-[#f0ece4] last:border-0 group"
                >
                  <div className="w-12 h-12 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                    <span className="jl-serif text-sm text-[#a58e28]">
                      {(exp.brand_name || '??').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="jl-overline-gold mb-1">{exp.brand_name || 'Luxury Maison'}</div>
                    <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5 group-hover:text-[#a58e28] transition-colors">
                      {exp.job_title}
                    </div>
                    <div className="flex items-center gap-3 text-[0.65rem] text-[#aaa]">
                      {exp.location && <span>{exp.location}</span>}
                      {exp.number_of_rounds && <span>{exp.number_of_rounds} rounds</span>}
                      {exp.interview_year && <span>{exp.interview_year}</span>}
                    </div>
                    {dots > 0 && (
                      <div className="flex gap-0.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map(j => (
                          <span
                            key={j}
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: j <= dots ? '#a58e28' : '#e8e2d8' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <Link href="/interviews" className="block group">
            <div className="flex items-start gap-4 p-5 border border-[#e8e2d8] hover:border-[#a58e28] transition-colors">
              <div className="w-14 h-14 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <span className="jl-serif text-lg text-[#a58e28]">IN</span>
              </div>
              <div className="flex-1">
                <div className="jl-overline-gold mb-1">Coming Soon</div>
                <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5">Interview Intelligence</div>
                <p className="font-sans text-xs text-[#888] leading-relaxed">
                  Real interview experiences from luxury professionals, contributed by members.
                </p>
              </div>
            </div>
          </Link>
        )}

        <Link
          href="/interviews"
          className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
        >
          More interviews →
        </Link>
      </div>

      {/* ── SALARY INTELLIGENCE PREVIEW ────────────────────────── */}
      {salaries.length > 0 && (
        <div>
          <div className="jl-section-label">
            <span>Salary Intelligence</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {salaries.map((s, i) => (
              <div key={i} className="p-4 border border-[#e8e2d8] bg-white">
                <div className="jl-overline-gold mb-1">{s.brand_name || 'Luxury Maison'}</div>
                <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5">{s.job_title}</div>
                <div className="font-sans text-[0.65rem] text-[#aaa] mb-2">
                  {[s.city, s.seniority].filter(Boolean).join(' · ')}
                </div>
                <div className="font-sans text-base font-semibold text-[#1a1a1a]">{buildRange(s)}</div>
              </div>
            ))}
          </div>

          <Link
            href="/salaries"
            className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
          >
            Full salary guide →
          </Link>
        </div>
      )}

    </div>
  )
}
