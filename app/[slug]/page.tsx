import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'
import type { PublicProjection } from '@/lib/profilux/types'
import {
  sectorLabel,
  productCategoryLabel,
  expertiseTagLabel,
  skillLabel,
  seniorityLabel,
  availabilityLabel,
  departmentLabel,
  contractTypeLabel,
} from '@/lib/profilux/labels'
import { readUnlockCookie, UNLOCK_COOKIE_NAME } from '@/lib/share/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false },
}

interface Props {
  params: { slug: string }
}

export default async function PublicProfilePage({ params }: Props) {
  // Opt out of Next's fetch/route cache so the sharing_enabled gate is
  // re-evaluated on every request. Without this, a stale cached render
  // can keep an unshared profile reachable even after the toggle flips off.
  noStore()

  // share_links is the source of truth for public slug resolution.

  const { data: link } = await supabase
    .from('share_links')
    .select('id, member_id, sharing_enabled, password_hash, expires_at')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!link) notFound()
  if (!link.sharing_enabled) notFound()

  if (link.expires_at) {
    const todayIso = new Date().toISOString().slice(0, 10)
    if (link.expires_at < todayIso) {
      redirect(`/${params.slug}/expired`)
    }
  }

  if (link.password_hash) {
    const cookieJar = cookies()
    const raw = cookieJar.get(UNLOCK_COOKIE_NAME)?.value
    if (!readUnlockCookie(raw, params.slug)) {
      redirect(`/${params.slug}/password`)
    }
  }

  const memberId = link.member_id
  const activeShareLinkId = link.id

  if (!memberId) notFound()

  const view = await resolveProfiLux(memberId, supabase)
  if (!view) notFound()

  const pub = projectFor(view, 'public') as PublicProjection

  // Anonymous view tracking — best-effort, never breaks render.
  try {
    await supabase
      .from('share_views')
      .insert({ share_link_id: activeShareLinkId })
  } catch {
    // swallow — analytics best-effort
  }

  // ---------- Precompute (PublicProjection only) ----------
  const fullName = `${pub.first_name ?? ''} ${pub.last_name ?? ''}`.trim()
  const hasJob = typeof pub.job_title === 'string' && pub.job_title.trim().length > 0
  const hasEmployer = typeof pub.current_employer === 'string' && pub.current_employer.trim().length > 0
  const hasSeniority = typeof pub.seniority === 'string' && pub.seniority.trim().length > 0
  const hasCity = typeof pub.city === 'string' && pub.city.trim().length > 0
  const hasCountry = typeof pub.country === 'string' && pub.country.trim().length > 0
  const locationLine = hasCity && hasCountry
    ? `${pub.city}, ${pub.country}`
    : hasCity ? pub.city
    : hasCountry ? pub.country
    : null

  // Career Path rows — full experiences, real company names.
  const yearOf = (d: string | null | undefined): string | null => {
    if (typeof d !== 'string') return null
    const t = d.trim()
    if (t.length === 0) return null
    const m = t.match(/^(\d{4})/)
    return m ? m[1] : null
  }
  type ExpRow = {
    role: string | null
    company: string | null
    location: string | null
    period: string | null
    description: string | null
  }
  const expRows: ExpRow[] = (pub.experiences ?? []).map((exp): ExpRow | null => {
    const hasJobT = typeof exp.job_title === 'string' && exp.job_title.trim().length > 0
    const hasCo = typeof exp.company === 'string' && exp.company.trim().length > 0
    if (!hasJobT && !hasCo) return null
    const role = hasJobT ? exp.job_title : null
    const company = hasCo ? exp.company : null
    const xCity = typeof exp.city === 'string' && exp.city.trim().length > 0 ? exp.city : null
    const xCountry = typeof exp.country === 'string' && exp.country.trim().length > 0 ? exp.country : null
    const location = xCity && xCountry ? `${xCity}, ${xCountry}` : (xCity ?? xCountry)
    const startY = yearOf(exp.start_date)
    const endY = yearOf(exp.end_date)
    const isCurrent = exp.is_current === true
    const period =
      startY && isCurrent ? `${startY}–present`
      : startY && endY ? `${startY}–${endY}`
      : startY ? `${startY}–present`
      : endY ? endY
      : null
    const description = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : null
    return { role, company, location, period, description }
  }).filter((r): r is ExpRow => r !== null)

  // Current Role "Since" line — from the current experience, mirrors View 3049–3061.
  const currentExp = (pub.experiences ?? []).find(
    x => x.is_current === true && typeof x.start_date === 'string' && x.start_date.trim().length > 0,
  )
  const sinceLine = (() => {
    if (!currentExp || typeof currentExp.start_date !== 'string') return null
    const sd = currentExp.start_date.trim()
    if (sd.length === 0) return null
    const m = sd.match(/^(\d{4})-(\d{2})/)
    if (m) {
      const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
      const monthIdx = parseInt(m[2], 10) - 1
      if (monthIdx >= 0 && monthIdx < 12) return `Since ${months[monthIdx]} ${m[1]}`
    }
    return `Since ${sd}`
  })()

  const empInitial = hasEmployer ? pub.current_employer!.charAt(0).toUpperCase() : ''

  const expertiseFilled =
    typeof pub.years_in_luxury === 'number' ||
    pub.sectors.length > 0 ||
    pub.product_categories.length > 0 ||
    pub.expertise_tags.length > 0 ||
    pub.key_skills.length > 0 ||
    pub.market_knowledge.length > 0

  const clientelingFilled =
    pub.clienteling_experience === true ||
    (typeof pub.clienteling_description === 'string' && pub.clienteling_description.trim().length > 0)

  const availabilityText = availabilityLabel(
    pub.availability as 'active' | 'open' | 'passive' | 'unavailable' | null,
  )
  const availabilityFilled = typeof pub.availability === 'string' && pub.availability.trim().length > 0 && availabilityText !== null

  const compensationFilled =
    typeof pub.desired_salary_min === 'number' ||
    typeof pub.desired_salary_max === 'number' ||
    (typeof pub.desired_salary_currency === 'string' && pub.desired_salary_currency.trim().length > 0)

  const compensationText = (() => {
    if (!compensationFilled) return null
    const cur = typeof pub.desired_salary_currency === 'string' && pub.desired_salary_currency.trim().length > 0 ? pub.desired_salary_currency : ''
    const min = typeof pub.desired_salary_min === 'number' ? pub.desired_salary_min : null
    const max = typeof pub.desired_salary_max === 'number' ? pub.desired_salary_max : null
    const fmt = (n: number) => n.toLocaleString('en-US')
    if (min !== null && max !== null) return `${cur ? cur + ' ' : ''}${fmt(min)} – ${fmt(max)}`.trim()
    if (min !== null) return `From ${cur ? cur + ' ' : ''}${fmt(min)}`.trim()
    if (max !== null) return `Up to ${cur ? cur + ' ' : ''}${fmt(max)}`.trim()
    return cur || null
  })()

  const desiredLocations = pub.desired_locations ?? []
  const desiredDepartments = pub.desired_departments ?? []
  const desiredContractTypes = pub.desired_contract_types ?? []

  // Library zone activation — gated on activated_sections + non-empty array.
  const has = (id: string) => Array.isArray(pub.activated_sections) && pub.activated_sections.includes(id)
  const showCertifications        = has('certifications')        && pub.certifications.length > 0
  const showAwards                = has('awards')                && pub.awards.length > 0
  const showMemberships           = has('memberships')           && pub.memberships.length > 0
  const showStrategicInitiatives  = has('strategic_initiatives') && pub.strategic_initiatives.length > 0
  const showPortfolio             = has('portfolio')             && pub.portfolio.length > 0
  const showPressFeatures         = has('press_features')        && pub.press_features.length > 0
  const showReferences            = has('references')            && pub.references.length > 0
  const showInternships           = has('internships')           && pub.internships.length > 0

  // Inlined ViewZone tokens (mirrors candidate page lines 241–267).
  const zoneWrap: React.CSSProperties = {
    background: '#222',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '24px 26px',
    marginBottom: 18,
  }
  const zoneTitle: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: 10.5,
    color: '#8e8e8e',
    textTransform: 'uppercase',
    letterSpacing: 1.8,
    margin: 0,
    paddingBottom: 14,
    marginBottom: 18,
    borderBottom: '0.5px solid #2a2a2a',
  }
  const sectionLabel: React.CSSProperties = {
    marginTop: 24,
    color: '#999',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Inter, sans-serif',
  }
  const dotList: React.CSSProperties = {
    marginTop: 8,
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    color: '#ccc',
    lineHeight: 1.5,
  }
  const goldDotList: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 13,
    color: '#a58e28',
    lineHeight: 1.5,
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <style>{`@media (max-width: 768px) { .pf-public-grid { flex-direction: column !important; } .pf-public-spine { width: 100% !important; } }`}</style>
      <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 80px' }}>

          {/* Two-column dossier — left spine (identity) + right field (zones) */}
          <div className="pf-public-grid" style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>

            {/* LEFT SPINE — identity. No Edit/Manage/PDF actions. */}
            <aside className="pf-public-spine" style={{ width: 300, flexShrink: 0 }}>
              {fullName.length > 0 && (
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                  {fullName}
                </div>
              )}
              {hasJob && (
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 13.5, color: '#a58e28', lineHeight: 1.4 }}>
                  {pub.job_title}
                </div>
              )}
              {hasEmployer && (
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 13.5, color: '#a58e28', lineHeight: 1.4, marginBottom: 4 }}>
                  {pub.current_employer}
                </div>
              )}
              {locationLine && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>
                  {locationLine}
                </div>
              )}
            </aside>

            {/* RIGHT FIELD — zones in View order */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Current Role */}
              {(hasJob || hasEmployer || hasSeniority || typeof pub.total_years_experience === 'number') && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Current Role</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(165,142,40,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Playfair Display, serif',
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: '#a58e28',
                    }}>
                      {empInitial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {hasJob && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff', fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{pub.job_title}</div>
                      )}
                      {hasEmployer && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4, marginBottom: 2 }}>{pub.current_employer}</div>
                      )}
                      {hasSeniority && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>{seniorityLabel(pub.seniority)}</div>
                      )}
                      {sinceLine && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>{sinceLine}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Career Path */}
              {expRows.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Career Path</h3>
                  {expRows.map((r, i) => {
                    const isLast = i === expRows.length - 1
                    const rowStyle: React.CSSProperties = isLast
                      ? { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }
                      : { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #2a2a2a' }
                    return (
                      <div key={i} style={rowStyle}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8e8e8e', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                          {r.period ?? ''}
                        </div>
                        <div>
                          {r.role && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{r.role}</div>
                          )}
                          {(r.company || r.location) && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4, marginBottom: 6 }}>
                              {r.company && r.location ? `${r.company} · ${r.location}` : (r.company ?? r.location)}
                            </div>
                          )}
                          {r.description && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8e8e8e', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.description}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Education */}
              {pub.education.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Education</h3>
                  {pub.education.map((ed, i) => {
                    const isLast = i === pub.education.length - 1
                    const rowStyle: React.CSSProperties = isLast
                      ? { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 0, paddingBottom: 0, borderBottom: 'none' }
                      : { display: 'grid', gridTemplateColumns: '108px 1fr', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid #2a2a2a' }
                    const primary = (typeof ed.degree === 'string' && ed.degree.trim().length > 0)
                      ? ed.degree
                      : (typeof ed.field_of_study === 'string' && ed.field_of_study.trim().length > 0)
                        ? ed.field_of_study
                        : null
                    const hasSY = typeof ed.start_year === 'number'
                    const hasGY = typeof ed.graduation_year === 'number'
                    const periodText =
                      hasSY && hasGY ? `${ed.start_year}–${ed.graduation_year}`
                      : hasGY ? String(ed.graduation_year)
                      : hasSY ? String(ed.start_year)
                      : ''
                    const edCity = typeof ed.city === 'string' && ed.city.trim().length > 0 ? ed.city : null
                    const instLine = ed.institution
                      ? (edCity ? `${ed.institution} · ${edCity}` : ed.institution)
                      : null
                    return (
                      <div key={i} style={rowStyle}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#8e8e8e', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}>
                          {periodText}
                        </div>
                        <div>
                          {primary && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{primary}</div>
                          )}
                          {instLine && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4 }}>{instLine}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Languages */}
              {pub.languages.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Languages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pub.languages.map((l, i) => (
                      <div key={`lg-${i}-${l.language}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.4 }}>
                        <span>{l.language}</span>
                        {l.proficiency && <span style={{ color: '#999', marginLeft: 8 }}>{l.proficiency}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise */}
              {expertiseFilled && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Expertise</h3>
                  {typeof pub.years_in_luxury === 'number' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
                      <div style={{ color: '#999' }}>Years in luxury</div>
                      <div>{pub.years_in_luxury}</div>
                    </div>
                  )}
                  {pub.sectors.length > 0 && (
                    <>
                      <div style={sectionLabel}>Sectors</div>
                      <div style={dotList}>{pub.sectors.map(v => sectorLabel(v)).join(' · ')}</div>
                    </>
                  )}
                  {pub.product_categories.length > 0 && (
                    <>
                      <div style={sectionLabel}>Product categories</div>
                      <div style={dotList}>{pub.product_categories.map(v => productCategoryLabel(v)).join(' · ')}</div>
                    </>
                  )}
                  {pub.expertise_tags.length > 0 && (
                    <>
                      <div style={sectionLabel}>Areas of expertise</div>
                      <div style={dotList}>{pub.expertise_tags.map(v => expertiseTagLabel(v)).join(' · ')}</div>
                    </>
                  )}
                  {pub.key_skills.length > 0 && (
                    <>
                      <div style={sectionLabel}>Skills</div>
                      <div style={dotList}>{pub.key_skills.map(v => skillLabel(v)).join(' · ')}</div>
                    </>
                  )}
                  {pub.market_knowledge.length > 0 && (
                    <>
                      <div style={sectionLabel}>Markets</div>
                      <div style={dotList}>{pub.market_knowledge.join(' · ')}</div>
                    </>
                  )}
                </div>
              )}

              {/* Clienteling */}
              {clientelingFilled && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Clienteling</h3>
                  {pub.clienteling_experience === true && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                      Direct clienteling experience
                    </div>
                  )}
                  {typeof pub.clienteling_description === 'string' && pub.clienteling_description.trim().length > 0 && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#8e8e8e', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: pub.clienteling_experience === true ? 8 : 0 }}>
                      {pub.clienteling_description}
                    </div>
                  )}
                </div>
              )}

              {/* Availability */}
              {availabilityFilled && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Availability</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>
                      Open to opportunities
                    </div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5, textAlign: 'right' }}>
                      {availabilityText}
                    </div>
                  </div>
                  {desiredLocations.length > 0 && (
                    <>
                      <div style={sectionLabel}>Locations</div>
                      <div style={dotList}>{desiredLocations.join(' · ')}</div>
                    </>
                  )}
                  {desiredDepartments.length > 0 && (
                    <>
                      <div style={sectionLabel}>Departments</div>
                      <div style={dotList}>{desiredDepartments.map(v => departmentLabel(v)).join(' · ')}</div>
                    </>
                  )}
                  {desiredContractTypes.length > 0 && (
                    <>
                      <div style={sectionLabel}>Contract types</div>
                      <div style={dotList}>{desiredContractTypes.map(v => contractTypeLabel(v)).join(' · ')}</div>
                    </>
                  )}
                </div>
              )}

              {/* Compensation */}
              {compensationFilled && compensationText && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Compensation</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                    {compensationText}
                  </div>
                </div>
              )}

              {/* Maisons */}
              {pub.brands_worked_with.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Maisons</h3>
                  <div style={goldDotList}>
                    {pub.brands_worked_with.join(' · ')}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {showCertifications && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Certifications</h3>
                  <div style={goldDotList}>
                    {pub.certifications.join(' · ')}
                  </div>
                </div>
              )}

              {/* Awards */}
              {showAwards && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Awards</h3>
                  <div style={goldDotList}>
                    {pub.awards.join(' · ')}
                  </div>
                </div>
              )}

              {/* Memberships */}
              {showMemberships && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Memberships</h3>
                  <div style={goldDotList}>
                    {pub.memberships.join(' · ')}
                  </div>
                </div>
              )}

              {/* Strategic Initiatives */}
              {showStrategicInitiatives && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Strategic Initiatives</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.strategic_initiatives.map((si, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{si.title}</div>
                        {si.description && (
                          <div style={{ color: '#999', marginTop: 2 }}>{si.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {showPortfolio && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Portfolio</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.portfolio.map((pf, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{pf.title}</div>
                        {pf.url && <div style={{ color: '#999', marginTop: 2, wordBreak: 'break-all' }}>{pf.url}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Press & features */}
              {showPressFeatures && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Press &amp; features</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.press_features.map((p, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{p.title}</div>
                        {p.publication && <div style={{ color: '#a58e28', marginTop: 2, fontSize: 12 }}>{p.publication}</div>}
                        {p.url && <div style={{ color: '#999', marginTop: 2, fontSize: 12, wordBreak: 'break-all' }}>{p.url}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* References */}
              {showReferences && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>References</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.references.map((r, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{r.name}</div>
                        {r.role && <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.role}</div>}
                        {r.company && <div style={{ color: '#a58e28', marginTop: 2, fontSize: 12 }}>{r.company}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {showInternships && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Internships</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.internships.map((r, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#fff', fontWeight: 600 }}>{r.company}</div>
                        {r.role && <div style={{ color: '#999', marginTop: 2, fontSize: 12 }}>{r.role}</div>}
                        {r.period && <div style={{ color: '#a58e28', marginTop: 2, fontSize: 12 }}>{r.period}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER — strings verbatim, discreet, below dossier */}
          <div style={{ textAlign: 'center', padding: '28px 0 0', marginTop: 48, borderTop: '0.5px solid #1e1e1e' }}>
            <p style={{ fontSize: 11, color: '#fff', opacity: 0.2, margin: '0 0 4px' }}>This profile was shared privately via JOBLUX. It is not indexed by any search engine.</p>
            <p style={{ fontSize: 10, color: '#fff', opacity: 0.1, margin: 0 }}>joblux.com · Luxury talent intelligence</p>
          </div>

        </div>
      </div>
    </>
  )
}
