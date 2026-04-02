import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CURRENCY_SYMBOLS } from '@/lib/assignment-options'
import CareerDetailClient from './CareerDetailClient'

// ── Select fields (public only) ─────────────────────────────────────
const SELECT_FIELDS = 'id, title, slug, maison, is_confidential, city, country, region, remote_policy, department, seniority, contract_type, description, responsibilities, requirements, nice_to_haves, about_maison, salary_min, salary_max, salary_currency, salary_period, salary_display, product_category, client_segment, languages_required, clienteling_experience, travel_percentage, luxury_sector_experience, benefits, relocation_offered, visa_sponsorship, start_date, team_size, seo_title, seo_description, location, reference_number, activated_at, closing_date, bonus_commission'

// ── Helpers ──────────────────────────────────────────────────────────

function formatNum(n: number): string {
  return n.toLocaleString('en-US')
}

function getSalaryDisplay(assignment: any): string | null {
  // If salary_display has actual text (e.g. "€130K–160K + bonus"), use it directly
  if (assignment.salary_display && assignment.salary_display !== 'true' && assignment.salary_display !== 'false') {
    return assignment.salary_display
  }
  // Fallback: build from min/max
  if (!assignment.salary_min && !assignment.salary_max) return null
  const sym = (CURRENCY_SYMBOLS as any)[assignment.salary_currency || 'EUR'] || assignment.salary_currency || '€'
  if (assignment.salary_min && assignment.salary_max) {
    return `${sym}${formatNum(assignment.salary_min)} – ${sym}${formatNum(assignment.salary_max)}`
  }
  if (assignment.salary_min) return `From ${sym}${formatNum(assignment.salary_min)}`
  if (assignment.salary_max) return `Up to ${sym}${formatNum(assignment.salary_max)}`
  return null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function textToLines(text: string | null): string[] {
  if (!text) return []
  return text.split('\n').map((l) => l.trim()).filter(Boolean)
}

function mapEmploymentType(ct: string | null): string {
  if (!ct) return 'FULL_TIME'
  const lower = ct.toLowerCase()
  if (lower.includes('permanent')) return 'FULL_TIME'
  if (lower.includes('fixed')) return 'TEMPORARY'
  if (lower.includes('freelance')) return 'CONTRACTOR'
  if (lower.includes('intern')) return 'INTERN'
  return 'FULL_TIME'
}

function buildJsonLd(assignment: any): object {
  const ld: any = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: assignment.title,
    description: assignment.description || '',
    datePosted: assignment.activated_at,
    employmentType: mapEmploymentType(assignment.contract_type),
  }
  if (!assignment.is_confidential && assignment.maison) {
    ld.hiringOrganization = { '@type': 'Organization', name: assignment.maison }
  } else {
    ld.hiringOrganization = { '@type': 'Organization', name: 'Confidential | Leading Luxury Maison' }
  }
  if (assignment.city || assignment.country) {
    ld.jobLocation = {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: assignment.city, addressCountry: assignment.country },
    }
  }
  if (assignment.closing_date) ld.validThrough = assignment.closing_date
  return ld
}

// ── generateMetadata ────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data: assignment } = await supabase
    .from('search_assignments')
    .select('title, maison, is_confidential, city, country, description, seo_title, seo_description')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!assignment) return { title: 'Position Not Found | JOBLUX' }

  const displayMaison = assignment.is_confidential ? 'Leading Luxury Maison' : assignment.maison || 'JOBLUX'
  const location = [assignment.city, assignment.country].filter(Boolean).join(', ')
  const title = assignment.seo_title || `${assignment.title} at ${displayMaison} | ${location} | JOBLUX`
  const desc = assignment.seo_description || (assignment.description || '').slice(0, 160)

  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.joblux.com/careers/${params.slug}` },
    openGraph: { title, description: desc },
  }
}

// ══════════════════════════════════════════════════════════════════════
// Page component (Server)
// ══════════════════════════════════════════════════════════════════════

export default async function CareerDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createServerSupabaseClient()
  const { data: assignment } = await supabase
    .from('search_assignments')
    .select(SELECT_FIELDS)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!assignment) notFound()

  const displayMaison = assignment.is_confidential
    ? 'Confidential Maison'
    : assignment.maison || 'JOBLUX'
  const salary = getSalaryDisplay(assignment)
  const jsonLd = buildJsonLd(assignment)
  const responsibilityLines = textToLines(assignment.responsibilities)
  const requirementLines = textToLines(assignment.requirements)
  const niceToHaveLines = textToLines(assignment.nice_to_haves)
  const locationStr = [assignment.city, assignment.country].filter(Boolean).join(', ')
  const seniorityLabel = assignment.seniority ? assignment.seniority.charAt(0).toUpperCase() + assignment.seniority.slice(1) : ''

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-[#1a1a1a] min-h-screen">
        {/* ── Header section ──────────────────────────────────────── */}
        <div className="border-b border-[#2a2a2a] py-8 lg:py-10">
          <div className="max-w-[1200px] mx-auto px-7">
            <Link href="/careers" className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] hover:underline mb-4 inline-block">
              &larr; All assignments
            </Link>

            {assignment.department && (
              <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">{assignment.department}</div>
            )}

            <h1 className="text-4xl font-normal text-white mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {assignment.title}
            </h1>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {!assignment.is_confidential && assignment.maison && assignment.maison !== 'Confidential' ? (
                <span className="text-[13px] text-[#a58e28]">{assignment.maison}</span>
              ) : (
                <span className="text-[13px] text-[#999]">Confidential Maison</span>
              )}
              {assignment.is_confidential && (
                <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded bg-[rgba(165,142,40,0.1)] text-[#a58e28] border border-[rgba(165,142,40,0.2)]">
                  CONFIDENTIAL
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              {locationStr && (
                <span className="text-[13px] text-[#999]">{locationStr}</span>
              )}
              {assignment.contract_type && (
                <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] border border-[#2a2a2a] uppercase">
                  {assignment.contract_type}
                </span>
              )}
              {seniorityLabel && (
                <span className="text-[10px] font-semibold tracking-[1.5px] px-2 py-0.5 rounded bg-[#222] text-[#ccc] border border-[#2a2a2a]">
                  {seniorityLabel}
                </span>
              )}
              {assignment.region && (
                <span className="text-[13px] text-[#777]">{assignment.region}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mt-3">
              {assignment.reference_number && (
                <span className="text-[11px] text-[#777]">Ref: {assignment.reference_number}</span>
              )}
              {assignment.activated_at && (
                <span className="text-[11px] text-[#777]">Posted {formatDate(assignment.activated_at)}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────── */}
        <div className="max-w-[1200px] mx-auto px-7 py-8 lg:py-10">
          <div className="lg:grid lg:grid-cols-[1fr_360px] gap-8">

            {/* Left column */}
            <div>

              {/* Salary */}
              {salary && (
                <div className="p-5 bg-[#222] border border-[#2a2a2a] rounded-xl mb-8">
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-2">Compensation</div>
                  <p className="text-2xl text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{salary}</p>
                  {assignment.salary_period && assignment.salary_period !== 'Annual' && assignment.salary_period !== 'annual' && (
                    <p className="text-xs text-[#999] mt-1">{assignment.salary_period}</p>
                  )}
                  {assignment.bonus_commission && (
                    <p className="text-sm text-[#999] mt-2">{assignment.bonus_commission}</p>
                  )}
                </div>
              )}

              {/* About the Role */}
              {assignment.description && (
                <>
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">About the Role</div>
                  <div className="text-[15px] text-[#ccc] leading-[1.8] mb-10 whitespace-pre-line">
                    {assignment.description}
                  </div>
                </>
              )}

              {/* Key Responsibilities */}
              {responsibilityLines.length > 0 && (
                <>
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">Key Responsibilities</div>
                  <ul className="space-y-3 mb-10">
                    {responsibilityLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="text-sm text-[#ccc] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Requirements */}
              {requirementLines.length > 0 && (
                <>
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">Requirements</div>
                  <ul className="space-y-3 mb-10">
                    {requirementLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="text-sm text-[#ccc] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Nice to Have */}
              {niceToHaveLines.length > 0 && (
                <>
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">Nice to Have</div>
                  <ul className="space-y-3 mb-10">
                    {niceToHaveLines.map((line, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                        <span className="text-sm text-[#ccc] leading-relaxed">{line}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* About the Maison */}
              {assignment.about_maison && !assignment.is_confidential && (
                <>
                  <div className="text-[10px] text-[#a58e28] uppercase tracking-[0.14em] mb-3">About the Maison</div>
                  <div className="text-[15px] text-[#ccc] leading-[1.8] mb-10 whitespace-pre-line">
                    {assignment.about_maison}
                  </div>
                </>
              )}

              {/* Confidential notice */}
              {assignment.is_confidential && (
                <div className="p-4 bg-[#222] border border-[#2a2a2a] rounded-xl mb-10">
                  <p className="text-xs text-[#999] leading-relaxed">
                    <strong className="text-white">Confidential assignment.</strong> The maison name will be disclosed after initial screening. All expressions of interest are handled with full discretion by the JOBLUX team.
                  </p>
                </div>
              )}
            </div>

            {/* ── Right sidebar ─────────────────────────────────────── */}
            <div className="lg:sticky lg:top-[88px] lg:self-start">
              {/* Details panel */}
              <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5 lg:p-6 mb-6">
                <div className="space-y-4">

                  {/* Benefits */}
                  {assignment.benefits && assignment.benefits.length > 0 && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-2">Benefits</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.benefits.map((b: string) => (
                          <span key={b} className="text-[10px] text-[#ccc] px-2 py-0.5 rounded border border-[#333] bg-[#1a1a1a]">{b}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {assignment.languages_required && assignment.languages_required.length > 0 && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-2">Languages</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.languages_required.map((l: string) => (
                          <span key={l} className="text-[10px] text-[#ccc] px-2 py-0.5 rounded border border-[#333] bg-[#1a1a1a]">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Product Categories */}
                  {assignment.product_category && assignment.product_category.length > 0 && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-2">Product Categories</span>
                      <div className="flex flex-wrap gap-1.5">
                        {assignment.product_category.map((pc: string) => (
                          <span key={pc} className="text-[10px] text-[#ccc] px-2 py-0.5 rounded border border-[#333] bg-[#1a1a1a]">{pc}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Travel */}
                  {assignment.travel_percentage && (
                    <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em]">Travel</span>
                      <span className="text-sm text-[#ccc]">{assignment.travel_percentage}</span>
                    </div>
                  )}

                  {/* Relocation / Visa */}
                  {(assignment.relocation_offered || assignment.visa_sponsorship) && (
                    <div className="border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em] block mb-2">Support</span>
                      <div className="space-y-1">
                        {assignment.relocation_offered && (
                          <p className="text-sm text-[#ccc]">Relocation package offered</p>
                        )}
                        {assignment.visa_sponsorship && (
                          <p className="text-sm text-[#ccc]">Visa sponsorship available</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Luxury Experience */}
                  {assignment.luxury_sector_experience && (
                    <div className="flex justify-between border-b border-[#2a2a2a] pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em]">Luxury Experience</span>
                      <span className="text-sm text-[#ccc]">{assignment.luxury_sector_experience}</span>
                    </div>
                  )}

                  {/* Client Segment */}
                  {assignment.client_segment && (
                    <div className="flex justify-between pb-3">
                      <span className="text-[10px] text-[#999] uppercase tracking-[0.14em]">Client Segment</span>
                      <span className="text-sm text-[#ccc]">{assignment.client_segment}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Call to Action ──────────────── */}
              <CareerDetailClient assignmentId={assignment.id} />
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
