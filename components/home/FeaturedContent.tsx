'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'


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
  brand_name: string
  location: string | null
  tips: string | null
  overall_experience: string | null
}

function formatDate(d: string | null): string {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}


export function FeaturedContent() {
  const [articles, setArticles] = useState<Article[]>([])
  const [interviews, setInterviews] = useState<InterviewRow[]>([])
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

      // Fetch interview experiences with brand name from contributions
      const { data: intData } = await supabase
        .from('interview_experiences')
        .select('id, job_title, location, tips, overall_experience, contributions!inner(brand_name)')
        .order('created_at', { ascending: false })
        .limit(3)

      if (intData && intData.length > 0) {
        setInterviews(intData.map((e: any) => {
          const c = Array.isArray(e.contributions) ? e.contributions[0] : e.contributions
          return {
            id: e.id,
            job_title: e.job_title,
            brand_name: c?.brand_name || e.brand_name || '',
            location: e.location,
            tips: e.tips,
            overall_experience: e.overall_experience,
          }
        }))
      } else {
        // Fallback: try without join (brand_name may be on the row directly)
        const { data: fallback } = await supabase
          .from('interview_experiences')
          .select('id, job_title, brand_name, location, tips, overall_experience')
          .order('created_at', { ascending: false })
          .limit(3)
        setInterviews((fallback || []).map((e: any) => ({
          id: e.id,
          job_title: e.job_title,
          brand_name: e.brand_name || '',
          location: e.location,
          tips: e.tips,
          overall_experience: e.overall_experience,
        })))
      }

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
          <div className="space-y-4">
            {interviews.map((exp) => {
              // Extract first tip as a quote
              let firstTip: string | null = null
              if (exp.tips) {
                try {
                  const parsed = JSON.parse(exp.tips)
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    firstTip = String(parsed[0]).trim()
                  } else {
                    firstTip = exp.tips.split('\n').map(l => l.trim()).filter(Boolean)[0] || null
                  }
                } catch {
                  firstTip = exp.tips.split('\n').map(l => l.trim()).filter(Boolean)[0] || null
                }
              }
              const initials = (exp.brand_name || '??').slice(0, 2).toUpperCase()

              return (
                <Link key={exp.id} href="/interviews" className="block group">
                  <div className="flex items-start gap-4 p-5 border border-[#e8e2d8] hover:border-[#a58e28] transition-colors">
                    <div className="w-14 h-14 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                      <span className="jl-serif text-lg text-[#a58e28]">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="jl-overline-gold mb-1">{exp.brand_name || 'Luxury Maison'}</div>
                      <div className="font-sans text-sm font-medium text-[#1a1a1a] mb-0.5">{exp.job_title}</div>
                      <div className="jl-overline mb-3">{exp.location || ''}</div>
                      {firstTip && (
                        <p className="jl-serif text-sm text-[#555] leading-relaxed italic">
                          &ldquo;{firstTip}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="font-sans text-sm text-[#888] py-4">
            Real interview experiences from luxury professionals, contributed by professionals.
          </p>
        )}

        <Link
          href="/interviews"
          className="inline-block mt-4 font-sans text-[0.7rem] font-semibold tracking-[0.1em] uppercase text-[#a58e28] hover:text-[#9a6f0a] transition-colors"
        >
          More interviews →
        </Link>
      </div>

    </div>
  )
}
