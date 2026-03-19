'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'
import { useParams } from 'next/navigation'
import { useMember } from '@/lib/auth-hooks'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'
import type { SearchAssignment } from '@/types/search-assignment'

// ── Helpers ──────────────────────────────────────────────────────────

/** Format salary number to readable (e.g. 120000 → "120,000") */
function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

/** Build salary display string with currency symbol */
function buildSalaryRange(assignment: SearchAssignment): string | null {
  if (assignment.salary_display !== 'true') return null
  if (!assignment.salary_min && !assignment.salary_max) return null
  const sym = CURRENCY_SYMBOLS[assignment.salary_currency || 'EUR'] || assignment.salary_currency || ''
  if (assignment.salary_min && assignment.salary_max) {
    return `${sym}${formatNum(assignment.salary_min)} – ${sym}${formatNum(assignment.salary_max)}`
  }
  if (assignment.salary_min) return `From ${sym}${formatNum(assignment.salary_min)}`
  if (assignment.salary_max) return `Up to ${sym}${formatNum(assignment.salary_max)}`
  return null
}

/** Format date to readable */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

/** Map contract type to Schema.org employmentType */
function mapEmploymentType(ct: string | null): string {
  if (!ct) return 'FULL_TIME'
  const lower = ct.toLowerCase()
  if (lower.includes('permanent') || lower.includes('cdi')) return 'FULL_TIME'
  if (lower.includes('fixed') || lower.includes('cdd') || lower.includes('temporary') || lower.includes('seasonal')) return 'TEMPORARY'
  if (lower.includes('freelance') || lower.includes('consultant')) return 'CONTRACTOR'
  if (lower.includes('intern') || lower.includes('stage') || lower.includes('apprentice')) return 'INTERN'
  if (lower.includes('part-time')) return 'PART_TIME'
  return 'FULL_TIME'
}

/** Split text into lines for bullet-point display */
function textToLines(text: string | null): string[] {
  if (!text) return []
  return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

/** Generate JSON-LD structured data for Google for Jobs */
function buildJsonLd(assignment: SearchAssignment): object {
  const ld: any = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: assignment.title,
    description: assignment.description || '',
    datePosted: assignment.activated_at || assignment.created_at,
    employmentType: mapEmploymentType(assignment.contract_type),
  }

  // Hiring organisation
  if (!assignment.is_confidential && assignment.maison) {
    ld.hiringOrganization = {
      '@type': 'Organization',
      name: assignment.maison,
    }
  } else {
    ld.hiringOrganization = {
      '@type': 'Organization',
      name: 'Confidential — Leading Luxury Maison',
    }
  }

  // Job location
  if (assignment.city || assignment.country) {
    ld.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: assignment.city || undefined,
        addressCountry: assignment.country || undefined,
        streetAddress: assignment.address || undefined,
      },
    }
  }

  // Remote work type
  if (assignment.remote_policy) {
    const rp = assignment.remote_policy.toLowerCase()
    if (rp === 'remote') {
      ld.jobLocationType = 'TELECOMMUTE'
    }
  }

  // Salary
  if (assignment.salary_display === 'true' && (assignment.salary_min || assignment.salary_max)) {
    ld.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: assignment.salary_currency || 'EUR',
      value: {
        '@type': 'QuantitativeValue',
        minValue: assignment.salary_min || undefined,
        maxValue: assignment.salary_max || undefined,
        unitText: (assignment.salary_period || 'Annual').toUpperCase(),
      },
    }
  }

  // Valid through (closing date)
  if (assignment.closing_date) {
    ld.validThrough = assignment.closing_date
  }

  return ld
}

// ══════════════════════════════════════════════════════════════════════
// Page component
// ══════════════════════════════════════════════════════════════════════

export default function OpportunityDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { isAuthenticated } = useMember()

  const [assignment, setAssignment] = useState<SearchAssignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // Application state
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [applyError, setApplyError] = useState('')

  // Fetch the opportunity
  useEffect(() => {
    fetch(`/api/opportunities/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => setAssignment(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  // Handle express interest
  const handleApply = async () => {
    if (!isAuthenticated || !assignment) return
    setApplying(true)
    setApplyError('')
    try {
      const res = await fetch('/api/opportunities/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: assignment.id }),
      })
      if (res.ok) {
        setApplied(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setApplyError(data.error || 'Something went wrong')
      }
    } catch {
      setApplyError('Something went wrong')
    } finally {
      setApplying(false)
    }
  }

  // ── Loading / Not found states ─────────────────────────────────
  if (loading) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="text-sm text-[#888]">Loading position...</p>
      </div>
    )
  }

  if (notFound || !assignment) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Position not found.</p>
        <Link href="/opportunities" className="jl-overline-gold mt-4 inline-block hover:underline">
          &larr; All Opportunities
        </Link>
      </div>
    )
  }

  // ── Derived data ───────────────────────────────────────────────
  const displayMaison = assignment.is_confidential
    ? 'Confidential — Leading Luxury Maison'
    : assignment.maison || 'JOBLUX'
  const salary = buildSalaryRange(assignment)
  const jsonLd = buildJsonLd(assignment)
  const responsibilityLines = textToLines(assignment.responsibilities)
  const requirementLines = textToLines(assignment.requirements)
  const niceToHaveLines = textToLines(assignment.nice_to_haves)
  const pageTitle = assignment.seo_title || `${assignment.title} — JOBLUX`
  const pageDescription = assignment.seo_description || (assignment.description || '').slice(0, 160)

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <>
      {/* SEO meta tags + JSON-LD structured data */}
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      {/* Also inject JSON-LD via a script tag in the body for SSR fallback */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        {/* ── Header section ──────────────────────────────────────── */}
        <div className="border-b-2 border-[#1a1a1a] py-10">
          <div className="jl-container">
            <Link href="/opportunities" className="jl-overline text-[#a58e28] hover:underline mb-4 inline-block">
              &larr; All Opportunities
            </Link>

            {/* Department overline */}
            {assignment.department && (
              <div className="jl-overline-gold mb-3">{assignment.department}</div>
            )}

            {/* Title */}
            <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
              {assignment.title}
            </h1>

            {/* Maison name */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="jl-overline-gold">{displayMaison}</span>
              {assignment.is_confidential && (
                <span className="jl-badge text-[0.55rem]">Confidential</span>
              )}
            </div>

            {/* Meta details */}
            <div className="flex flex-wrap gap-3 items-center">
              {/* Location */}
              {(assignment.city || assignment.country) && (
                <span className="font-sans text-sm text-[#888]">
                  {[assignment.city, assignment.country].filter(Boolean).join(', ')}
                </span>
              )}

              {/* Remote policy badge */}
              {assignment.remote_policy && (
                <span className="jl-badge-outline text-[0.55rem]">{assignment.remote_policy}</span>
              )}

              {/* Contract type */}
              {assignment.contract_type && (
                <span className="jl-badge text-[0.55rem]">{assignment.contract_type}</span>
              )}

              {/* Seniority */}
              {assignment.seniority && (
                <span className="jl-badge-outline text-[0.55rem]">{assignment.seniority}</span>
              )}
            </div>

            {/* Reference number + posted date */}
            <div className="flex flex-wrap gap-4 mt-3">
              {assignment.reference_number && (
                <span className="font-sans text-xs text-[#bbb]">
                  Ref: {assignment.reference_number}
                </span>
              )}
              {assignment.activated_at && (
                <span className="font-sans text-xs text-[#bbb]">
                  Posted {formatDate(assignment.activated_at)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────── */}
        <div className="jl-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Left column — description sections */}
            <div className="lg:col-span-2">

              {/* Salary section */}
              {salary && (
                <div className="p-5 bg-[#fafaf5] border border-[#e8e2d8] mb-8">
                  <div className="jl-overline-gold mb-2">Compensation</div>
                  <p className="jl-serif text-2xl text-[#1a1a1a]">{salary}</p>
                  {assignment.salary_period && assignment.salary_period !== 'Annual' && (
                    <p className="text-xs text-[#888] mt-1">{assignment.salary_period}</p>
                  )}
                  {assignment.bonus_commission && (
                    <p className="text-sm text-[#666] mt-2">{assignment.bonus_commission}</p>
                  )}
                </div>
              )}

              {/* About the Role */}
              {assignment.description && (
                <>
                  <div className="jl-section-label"><span>About the Role</span></div>
                  <div className="font-sans text-sm text-[#333] leading-relaxed mb-10 whitespace-pre-line">
                    {assignment.description}
                  </div>
                </>
              )}

              {/* Key Responsibilities */}
              {responsibilityLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Key Responsibilities</span></div>
                  <ul className="space-y-3 mb-10">
                    {responsibilityLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Requirements */}
              {requirementLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Requirements</span></div>
                  <ul className="space-y-3 mb-10">
                    {requirementLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Nice to Have */}
              {niceToHaveLines.length > 0 && (
                <>
                  <div className="jl-section-label"><span>Nice to Have</span></div>
                  <ul className="space-y-3 mb-10">
                    {niceToHaveLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="font-sans text-sm text-[#555] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* About the Maison — only if not confidential and has content */}
              {assignment.about_maison && !assignment.is_confidential && (
                <>
                  <div className="jl-section-label"><span>About the Maison</span></div>
                  <div className="font-sans text-sm text-[#333] leading-relaxed mb-10 whitespace-pre-line">
                    {assignment.about_maison}
                  </div>
                </>
              )}

              {/* Confidential notice */}
              {assignment.is_confidential && (
                <div className="p-4 bg-[#fafaf5] border border-[#e8e2d8] mb-10">
                  <p className="font-sans text-xs text-[#888] leading-relaxed">
                    <strong className="text-[#1a1a1a]">Confidential opportunity.</strong> The maison name will be disclosed after initial screening. All applications are handled with full discretion by the JOBLUX team.
                  </p>
                </div>
              )}
            </div>

            {/* ── Right sidebar ─────────────────────────────────────── */}
            <div>
              {/* Details panel */}
              <div className="border border-[#e8e2d8] p-5 mb-6">
                <div className="space-y-4">
                  {/* Benefits */}
                  {assignment.benefits && assignment.benefits.length > 0 && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Benefits</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.benefits.map((b) => (
                          <span key={b} className="jl-badge-outline text-[0.55rem]">{b}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages Required */}
                  {assignment.languages_required && assignment.languages_required.length > 0 && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Languages</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.languages_required.map((l) => (
                          <span key={l} className="jl-badge-outline text-[0.55rem]">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Categories */}
                  {assignment.product_category && assignment.product_category.length > 0 && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Product Categories</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.product_category.map((pc) => (
                          <span key={pc} className="jl-badge-outline text-[0.55rem]">{pc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel */}
                  {assignment.travel_percentage && (
                    <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Travel</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{assignment.travel_percentage}</span>
                    </div>
                  )}

                  {/* Relocation / Visa */}
                  {(assignment.relocation_offered || assignment.visa_sponsorship) && (
                    <div className="border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider block mb-2">Support</span>
                      <div className="space-y-1">
                        {assignment.relocation_offered && (
                          <p className="font-sans text-sm text-[#1a1a1a]">Relocation package offered</p>
                        )}
                        {assignment.visa_sponsorship && (
                          <p className="font-sans text-sm text-[#1a1a1a]">Visa sponsorship available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Luxury Experience */}
                  {assignment.luxury_sector_experience && (
                    <div className="flex justify-between border-b border-[#f0ece4] pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Luxury Experience</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{assignment.luxury_sector_experience}</span>
                    </div>
                  )}

                  {/* Client Segment */}
                  {assignment.client_segment && (
                    <div className="flex justify-between pb-3">
                      <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Client Segment</span>
                      <span className="font-sans text-sm text-[#1a1a1a]">{assignment.client_segment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Call to Action ──────────────────────────────────── */}
              {isAuthenticated ? (
                applied ? (
                  <div className="p-4 bg-[#fafaf5] border border-[#a58e28] text-center">
                    <p className="font-sans text-sm text-[#a58e28] font-medium">Interest submitted</p>
                    <p className="font-sans text-xs text-[#888] mt-1">The JOBLUX team will be in touch.</p>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="jl-btn jl-btn-gold w-full justify-center disabled:opacity-50"
                    >
                      {applying ? 'Submitting...' : 'Express Interest'}
                    </button>
                    {applyError && (
                      <p className="font-sans text-xs text-red-500 mt-2 text-center">{applyError}</p>
                    )}
                    <p className="font-sans text-[0.6rem] text-[#aaa] mt-3 text-center leading-relaxed">
                      Your profile will be shared with the JOBLUX team. The maison will not see your details until you approve.
                    </p>
                  </div>
                )
              ) : (
                <div className="p-4 bg-[#222222] text-center">
                  <div className="jl-overline-gold mb-2">Members Only</div>
                  <p className="font-sans text-xs text-[#888] mb-3">
                    Sign in to view full details and express interest.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Link href="/members" className="jl-btn jl-btn-gold text-[0.6rem] py-1.5 px-3">Sign In</Link>
                    <Link href="/join" className="jl-btn jl-btn-ghost text-[0.6rem] py-1.5 px-3">Join</Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
