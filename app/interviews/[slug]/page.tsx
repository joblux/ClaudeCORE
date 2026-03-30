'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useMember } from '@/lib/auth-hooks'
import { DIFFICULTY_SCALE, EXPERIENCE_SENTIMENT, OUTCOME_LABELS } from '@/types/interview'
import type { InterviewExperienceListItem, BrandInterviewSummary } from '@/types/interview'

export default function BrandInterviewsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const detailId = searchParams.get('detail')
  const { isAuthenticated, memberId } = useMember()

  const [brand, setBrand] = useState<{ name: string; slug: string; sector: string | null } | null>(null)
  const [summary, setSummary] = useState<BrandInterviewSummary | null>(null)
  const [experiences, setExperiences] = useState<InterviewExperienceListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(detailId)
  const [detailData, setDetailData] = useState<Record<string, any>>({})
  const [detailLoading, setDetailLoading] = useState<string | null>(null)
  const limit = 20

  const fetchBrand = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/interviews/${slug}?page=${page}&limit=${limit}`)
      if (!res.ok) { setLoading(false); return }
      const data = await res.json()
      setBrand(data.brand)
      setSummary(data.summary)
      setExperiences(data.experiences || [])
      setTotal(data.total || 0)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [slug, page])

  useEffect(() => { fetchBrand() }, [fetchBrand])

  const fetchDetail = async (id: string) => {
    if (detailData[id]) { setExpandedId(id); return }
    setDetailLoading(id)
    try {
      const res = await fetch(`/api/interviews/${slug}/detail/${id}`)
      if (res.ok) {
        const data = await res.json()
        setDetailData(prev => ({ ...prev, [id]: data.experience }))
      } else {
        const err = await res.json()
        setDetailData(prev => ({ ...prev, [id]: { error: err.error, required_level: err.required_level } }))
      }
    } catch {
      setDetailData(prev => ({ ...prev, [id]: { error: 'Failed to load details' } }))
    } finally {
      setDetailLoading(null)
      setExpandedId(id)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading) {
    return (
      <div>
        <div className="bg-[#222222] py-16">
          <div className="jl-container">
            <div className="h-4 bg-[#333] rounded w-32 mb-4 animate-pulse" />
            <div className="h-10 bg-[#333] rounded w-64 mb-3 animate-pulse" />
            <div className="h-4 bg-[#333] rounded w-48 animate-pulse" />
          </div>
        </div>
        <div className="jl-container py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="jl-card animate-pulse">
                <div className="h-5 bg-[#f0ece4] rounded w-2/3 mb-3" />
                <div className="h-4 bg-[#f0ece4] rounded w-1/2 mb-2" />
                <div className="h-3 bg-[#f0ece4] rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="jl-container py-20 text-center">
        <h1 className="jl-serif text-2xl text-[#1a1a1a] mb-3">Brand not found</h1>
        <Link href="/interviews" className="text-sm text-[#a58e28] hover:text-[#1a1a1a]">
          &larr; Back to Interview Intelligence
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Brand Header */}
      <section className="bg-[#222222] py-14 md:py-20">
        <div className="jl-container">
          <div className="text-xs text-[#999] mb-4 tracking-wide">
            <Link href="/interviews" className="hover:text-[#a58e28] transition-colors">Interviews</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{brand.name}</span>
          </div>
          <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-3">{brand.name}</h1>
          <div className="flex items-center gap-3">
            {brand.sector && (
              <span className="jl-badge-gold text-[0.6rem]">{brand.sector}</span>
            )}
            <Link
              href={`/wikilux/${brand.slug}`}
              className="text-xs text-[#a58e28] hover:text-white transition-colors"
            >
              View full profile on WikiLux &rarr;
            </Link>
          </div>
        </div>
      </section>

      <div className="jl-container py-10">
        {summary && summary.total_experiences > 0 ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              <StatBox label="Experiences" value={String(summary.total_experiences)} />
              <StatBox
                label="Avg Difficulty"
                value={
                  <DifficultyDotsLarge
                    difficulty={getMostCommonKey(summary.difficulty_breakdown)}
                  />
                }
              />
              <StatBox label="Typical Rounds" value={summary.avg_rounds ? String(summary.avg_rounds) : '—'} />
              <StatBox label="Common Format" value={summary.common_format || '—'} />
              <StatBox label="Departments" value={summary.common_departments.length ? summary.common_departments.slice(0, 2).join(', ') : '—'} />
              <StatBox
                label="Years"
                value={summary.year_range ? `${summary.year_range.min}–${summary.year_range.max}` : '—'}
              />
            </div>

            {/* Experience Cards */}
            <div className="space-y-4">
              {experiences.map((exp) => {
                const isExpanded = expandedId === exp.id
                const detail = detailData[exp.id]
                const isLoadingDetail = detailLoading === exp.id
                const sentiment = exp.overall_experience ? EXPERIENCE_SENTIMENT[exp.overall_experience] : null
                const outcomeLabel = exp.outcome ? OUTCOME_LABELS[exp.outcome] || exp.outcome : null

                return (
                  <div key={exp.id} className="jl-card">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="jl-serif text-lg text-[#1a1a1a] mb-1">{exp.job_title}</h3>
                        <div className="flex flex-wrap gap-1.5 text-xs text-[#888] mb-3">
                          {exp.department && <span>{exp.department}</span>}
                          {exp.department && exp.seniority && <span>&middot;</span>}
                          {exp.seniority && <span>{exp.seniority}</span>}
                          {(exp.department || exp.seniority) && exp.location && <span>&middot;</span>}
                          {exp.location && <span>{exp.location}</span>}
                        </div>
                      </div>
                      <DifficultyDots difficulty={exp.difficulty} />
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {exp.interview_year && <span className="jl-badge text-[0.6rem]">{exp.interview_year}</span>}
                      {exp.number_of_rounds && <span className="jl-badge text-[0.6rem]">{exp.number_of_rounds} round{exp.number_of_rounds !== 1 ? 's' : ''}</span>}
                      {exp.interview_format && <span className="jl-badge-outline text-[0.6rem]">{exp.interview_format}</span>}
                      {sentiment && (
                        <span
                          className="text-[0.6rem] font-medium px-2 py-0.5 rounded-sm"
                          style={{ backgroundColor: sentiment.color + '15', color: sentiment.color }}
                        >
                          {sentiment.label}
                        </span>
                      )}
                      {outcomeLabel && <span className="text-[0.6rem] text-[#888] px-2 py-0.5">{outcomeLabel}</span>}
                    </div>

                    {/* Expandable detail */}
                    {isExpanded && detail && !detail.error && (
                      <div className="border-t border-[#f0ece4] pt-4 mt-3 space-y-4">
                        {detail.process_duration && (
                          <div>
                            <div className="jl-label mb-1">Process Duration</div>
                            <p className="text-sm text-[#999]">{detail.process_duration}</p>
                          </div>
                        )}
                        {detail.process_description && (
                          <div>
                            <div className="jl-label mb-1">Process Description</div>
                            <p className="text-sm text-[#999] leading-relaxed whitespace-pre-line">{detail.process_description}</p>
                          </div>
                        )}
                        {detail.questions_asked && (
                          <div>
                            <div className="jl-label mb-1">Questions Asked</div>
                            <p className="text-sm text-[#999] leading-relaxed whitespace-pre-line">{detail.questions_asked}</p>
                          </div>
                        )}
                        {detail.tips && (
                          <div>
                            <div className="jl-label mb-1">Tips</div>
                            <p className="text-sm text-[#999] leading-relaxed whitespace-pre-line">{detail.tips}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {isExpanded && detail && detail.error && (
                      <div className="border-t border-[#f0ece4] pt-4 mt-3">
                        <div className="bg-[#fafaf5] border border-[#e8e2d8] rounded p-4 text-center">
                          <p className="text-sm text-[#888] mb-2">{detail.error}</p>
                          <Link href="/contribute" className="jl-btn-gold text-xs">
                            Contribute to Earn Points
                          </Link>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-[#f0ece4] pt-3 mt-3 flex items-center justify-between">
                      {isAuthenticated ? (
                        <button
                          onClick={() => {
                            if (isExpanded) { setExpandedId(null) }
                            else { fetchDetail(exp.id) }
                          }}
                          disabled={isLoadingDetail}
                          className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide disabled:opacity-50"
                        >
                          {isLoadingDetail ? 'Loading...' : isExpanded ? 'Collapse' : 'View Details \u2192'}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-[#999]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          <Link href="/contribute" className="hover:text-[#a58e28] transition-colors">
                            Contribute to unlock
                          </Link>
                        </span>
                      )}
                      <span className="text-[0.6rem] text-[#ccc]">
                        {new Date(exp.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="jl-btn text-xs disabled:opacity-30"
                >
                  Previous
                </button>
                <span className="text-xs text-[#888] px-4">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="jl-btn text-xs disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state for brand */
          <div className="text-center py-16 max-w-md mx-auto">
            <div className="jl-overline-gold mb-4">Be The First</div>
            <h2 className="jl-serif text-2xl text-[#1a1a1a] mb-3">
              No interview experiences for {brand.name} yet
            </h2>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              Share your experience interviewing at {brand.name} and earn 10 points towards unlocking intelligence across all maisons.
            </p>
            <Link href="/contribute" className="jl-btn-primary">
              Share Your Experience
            </Link>
          </div>
        )}

        {/* Access Gate CTA */}
        {isAuthenticated && summary && summary.total_experiences > 0 && (
          <div className="mt-10 border border-[#a58e28] rounded p-6 text-center bg-[#fafaf5]">
            <p className="jl-serif text-lg text-[#1a1a1a] mb-2">Unlock Full Interview Details</p>
            <p className="text-xs text-[#888] mb-4">
              Contribute your own experiences to earn points and access detailed process descriptions, questions asked, and insider tips.
            </p>
            <Link href="/contribute" className="jl-btn-gold">
              Contribute &amp; Earn Points
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border border-[#e8e2d8] rounded p-4 text-center">
      <div className="jl-label mb-1">{label}</div>
      <div className="text-sm font-semibold text-[#1a1a1a]">{value}</div>
    </div>
  )
}

function DifficultyDots({ difficulty }: { difficulty: string | null }) {
  const level = difficulty ? (DIFFICULTY_SCALE[difficulty] || 0) : 0
  return (
    <div className="flex gap-0.5" title={difficulty || 'Unknown'}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: i <= level ? '#a58e28' : '#e8e2d8' }}
        />
      ))}
    </div>
  )
}

function DifficultyDotsLarge({ difficulty }: { difficulty: string | null }) {
  const level = difficulty ? (DIFFICULTY_SCALE[difficulty] || 0) : 0
  return (
    <div className="flex gap-1 justify-center" title={difficulty || ''}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          className="inline-block w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: i <= level ? '#a58e28' : '#e8e2d8' }}
        />
      ))}
    </div>
  )
}

function getMostCommonKey(obj: Record<string, number>): string | null {
  let max = 0
  let key: string | null = null
  for (const [k, v] of Object.entries(obj)) {
    if (v > max) { max = v; key = k }
  }
  return key
}
