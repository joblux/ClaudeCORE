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

  // Spine skill set — editorial summary: top 3 primary + up to 3 sub.
  // Source: expertise_tag labels first (curated/positioned), top up with
  // key_skill labels, dedup case-insensitively, slice top ~6.
  const spineSkills = (() => {
    const all = [
      ...(pub.expertise_tags ?? []).map(v => expertiseTagLabel(v)),
      ...(pub.key_skills ?? []).map(v => skillLabel(v)),
    ].filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    const seen = new Set<string>()
    const out: string[] = []
    for (const s of all) {
      const k = s.toLowerCase()
      if (!seen.has(k)) { seen.add(k); out.push(s) }
    }
    return out.slice(0, 6)
  })()
  const spineSkillsPrimary = spineSkills.slice(0, 3).join(', ')
  const spineSkillsSub = spineSkills.slice(3).join(' · ')

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

  // ---------- Editorial tokens (Slice 1.4 — refonte, visual only) ----------
  // Right-field zone = open block, no card. Header is a hairline strip.
  const zoneBlock: React.CSSProperties = {
    marginBottom: 34,
  }
  const zoneHeader: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontWeight: 600,
    fontSize: 10.5,
    color: '#8e8e8e',
    textTransform: 'uppercase',
    letterSpacing: 2,
    margin: 0,
    paddingBottom: 14,
    marginBottom: 20,
    borderBottom: '1px solid #282828',
  }
  // Expertise / Availability sub-row: label/value grid.
  const labelValueGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '170px 1fr',
    gap: '10px 20px',
    alignItems: 'baseline',
    fontFamily: 'Inter, sans-serif',
    fontSize: 13.5,
    lineHeight: 1.6,
  }
  const lvLabel: React.CSSProperties = { color: '#777' }
  const lvValue: React.CSSProperties = { color: '#cfcfcf' }
  const lvValueGold: React.CSSProperties = { color: '#a58e28' }
  // Spine hairline-group treatment.
  const spineGroup: React.CSSProperties = {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottom: '1px solid #282828',
  }
  const spineGroupLabel: React.CSSProperties = {
    fontFamily: 'Inter, sans-serif',
    fontSize: 10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#8e8e8e',
    marginBottom: 12,
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <style>{`@media (max-width: 768px) { .pf-public-grid { grid-template-columns: 1fr !important; } .pf-public-spine { border-right: none !important; padding: 0 !important; } }`}</style>
      <div style={{ background: '#171717', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f4f1ea' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '44px 28px 64px' }}>

          {/* Editorial dossier — spine | open field, top hairline */}
          <div
            className="pf-public-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '315px 1fr',
              gap: 30,
              alignItems: 'start',
              borderTop: '1px solid #303030',
              paddingTop: 30,
            }}
          >

            {/* LEFT SPINE — identity strip, hairline groups. No card. */}
            <aside
              className="pf-public-spine"
              style={{
                borderRight: '1px solid #282828',
                padding: '4px 28px 0 0',
              }}
            >
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: 2.4, textTransform: 'uppercase', color: '#a58e28', marginBottom: 26 }}>
                ProfiLux dossier
              </div>
              {fullName.length > 0 && (
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 400, fontSize: 36, color: '#f4f1ea', lineHeight: 1.04, letterSpacing: -0.7, marginBottom: 14 }}>
                  {fullName}
                </div>
              )}
              {hasJob && (
                <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#a58e28', lineHeight: 1.4, marginBottom: 5 }}>
                  {pub.job_title}
                </div>
              )}
              {hasEmployer && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#c7b669', lineHeight: 1.4, marginBottom: 14 }}>
                  {pub.current_employer}
                </div>
              )}
              {locationLine && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9c9c9c', lineHeight: 1.4, marginBottom: 30 }}>
                  {locationLine}
                </div>
              )}
              {/* Gold filet */}
              <div style={{ width: 48, height: 1, background: '#a58e28', opacity: 0.55, marginBottom: 26 }} />

              {(pub.email || pub.phone) && (
                <div style={spineGroup}>
                  <div style={spineGroupLabel}>Contact</div>
                  {pub.email && (
                    <a href={`mailto:${pub.email}`} style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#cfcfcf', lineHeight: 1.9, textDecoration: 'none', wordBreak: 'break-all' }}>
                      {pub.email}
                    </a>
                  )}
                  {pub.phone && (
                    <a href={`tel:${pub.phone}`} style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#cfcfcf', lineHeight: 1.9, textDecoration: 'none' }}>
                      {pub.phone}
                    </a>
                  )}
                </div>
              )}

              {spineSkills.length > 0 && (
                <div style={spineGroup}>
                  <div style={spineGroupLabel}>Skill set</div>
                  {spineSkillsPrimary && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#e8e4da', lineHeight: 1.7 }}>
                      {spineSkillsPrimary}
                    </div>
                  )}
                  {spineSkillsSub && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#9c9c9c', lineHeight: 1.6, marginTop: 6 }}>
                      {spineSkillsSub}
                    </div>
                  )}
                </div>
              )}
            </aside>

            {/* RIGHT FIELD — open editorial sections (no cards) */}
            <div style={{ minWidth: 0 }}>

              {/* Current Role — no avatar */}
              {(hasJob || hasEmployer || hasSeniority || typeof pub.total_years_experience === 'number') && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Current Role</h3>
                  {hasJob && (
                    <div style={{ fontFamily: 'Georgia, serif', fontSize: 19, color: '#f4f1ea', lineHeight: 1.3, marginBottom: 4 }}>
                      {pub.job_title}
                    </div>
                  )}
                  {hasEmployer && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5, marginBottom: 2 }}>
                      {pub.current_employer}
                    </div>
                  )}
                  {hasSeniority && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9c9c9c', lineHeight: 1.5 }}>
                      {seniorityLabel(pub.seniority)}
                    </div>
                  )}
                  {sinceLine && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#9c9c9c', lineHeight: 1.5 }}>
                      {sinceLine}
                    </div>
                  )}
                </section>
              )}

              {/* Career Path */}
              {expRows.length > 0 && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Career Path</h3>
                  {expRows.map((r, i) => {
                    const isLast = i === expRows.length - 1
                    return (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 20, marginBottom: isLast ? 0 : 22 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#777', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.5 }}>
                          {r.period ?? ''}
                        </div>
                        <div>
                          {r.role && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14.5, color: '#f4f1ea', fontWeight: 500, lineHeight: 1.45, marginBottom: 3 }}>{r.role}</div>
                          )}
                          {(r.company || r.location) && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#a58e28', lineHeight: 1.5, marginBottom: 8 }}>
                              {r.company && r.location ? `${r.company} · ${r.location}` : (r.company ?? r.location)}
                            </div>
                          )}
                          {r.description && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9c9c9c', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{r.description}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </section>
              )}

              {/* Education */}
              {pub.education.length > 0 && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Education</h3>
                  {pub.education.map((ed, i) => {
                    const isLast = i === pub.education.length - 1
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
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 20, marginBottom: isLast ? 0 : 22 }}>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#777', letterSpacing: 0.3, fontVariantNumeric: 'tabular-nums', lineHeight: 1.5 }}>
                          {periodText}
                        </div>
                        <div>
                          {primary && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#f4f1ea', fontWeight: 500, lineHeight: 1.45, marginBottom: 3 }}>{primary}</div>
                          )}
                          {instLine && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: '#a58e28', lineHeight: 1.5 }}>{instLine}</div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </section>
              )}

              {/* Languages */}
              {pub.languages.length > 0 && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Languages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {pub.languages.map((l, i) => (
                      <div key={`lg-${i}-${l.language}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#e8e4da', lineHeight: 1.5 }}>
                        <span>{l.language}</span>
                        {l.proficiency && <span style={{ color: '#9c9c9c', marginLeft: 8 }}>{l.proficiency}</span>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Expertise */}
              {expertiseFilled && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Expertise</h3>
                  <div style={labelValueGrid}>
                    {typeof pub.years_in_luxury === 'number' && (
                      <>
                        <div style={lvLabel}>Years in luxury</div>
                        <div style={lvValue}>{pub.years_in_luxury}</div>
                      </>
                    )}
                    {pub.sectors.length > 0 && (
                      <>
                        <div style={lvLabel}>Sectors</div>
                        <div style={lvValue}>{pub.sectors.map(v => sectorLabel(v)).join(' · ')}</div>
                      </>
                    )}
                    {pub.product_categories.length > 0 && (
                      <>
                        <div style={lvLabel}>Product categories</div>
                        <div style={lvValue}>{pub.product_categories.map(v => productCategoryLabel(v)).join(' · ')}</div>
                      </>
                    )}
                    {pub.expertise_tags.length > 0 && (
                      <>
                        <div style={lvLabel}>Areas of expertise</div>
                        <div style={lvValue}>{pub.expertise_tags.map(v => expertiseTagLabel(v)).join(' · ')}</div>
                      </>
                    )}
                    {pub.key_skills.length > 0 && (
                      <>
                        <div style={lvLabel}>Skills</div>
                        <div style={lvValue}>{pub.key_skills.map(v => skillLabel(v)).join(' · ')}</div>
                      </>
                    )}
                    {pub.market_knowledge.length > 0 && (
                      <>
                        <div style={lvLabel}>Markets</div>
                        <div style={lvValue}>{pub.market_knowledge.join(' · ')}</div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Clienteling */}
              {clientelingFilled && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Clienteling</h3>
                  {pub.clienteling_experience === true && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#e8e4da', lineHeight: 1.65 }}>
                      Direct clienteling experience
                    </div>
                  )}
                  {typeof pub.clienteling_description === 'string' && pub.clienteling_description.trim().length > 0 && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#9c9c9c', lineHeight: 1.65, whiteSpace: 'pre-wrap', marginTop: pub.clienteling_experience === true ? 8 : 0 }}>
                      {pub.clienteling_description}
                    </div>
                  )}
                </section>
              )}

              {/* Availability */}
              {availabilityFilled && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Availability</h3>
                  <div style={labelValueGrid}>
                    <div style={lvLabel}>Open to opportunities</div>
                    <div style={lvValueGold}>{availabilityText}</div>
                    {desiredLocations.length > 0 && (
                      <>
                        <div style={lvLabel}>Locations</div>
                        <div style={lvValue}>{desiredLocations.join(' · ')}</div>
                      </>
                    )}
                    {desiredDepartments.length > 0 && (
                      <>
                        <div style={lvLabel}>Departments</div>
                        <div style={lvValue}>{desiredDepartments.map(v => departmentLabel(v)).join(' · ')}</div>
                      </>
                    )}
                    {desiredContractTypes.length > 0 && (
                      <>
                        <div style={lvLabel}>Contract types</div>
                        <div style={lvValue}>{desiredContractTypes.map(v => contractTypeLabel(v)).join(' · ')}</div>
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* Compensation */}
              {compensationFilled && compensationText && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Compensation</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: '#a58e28', lineHeight: 1.6 }}>
                    {compensationText}
                  </div>
                </section>
              )}

              {/* Maisons */}
              {pub.brands_worked_with.length > 0 && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Maisons</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.7 }}>
                    {pub.brands_worked_with.join(' · ')}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {showCertifications && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Certifications</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.certifications.map((c, idx) => {
                      const meta = [c.institution, c.year].filter((s): s is string => typeof s === 'string' && s.trim() !== '').join(' · ')
                      return (
                        <div key={idx}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{c.title}</div>
                          {meta !== '' && (
                            <div style={{ color: '#999', marginTop: 2 }}>{meta}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Awards */}
              {showAwards && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Awards</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {pub.awards.map((a, idx) => {
                      const meta = [a.body, a.year].filter((s): s is string => typeof s === 'string' && s.trim() !== '').join(' · ')
                      return (
                        <div key={idx}>
                          <div style={{ color: '#fff', fontWeight: 600 }}>{a.title}</div>
                          {meta !== '' && (
                            <div style={{ color: '#999', marginTop: 2 }}>{meta}</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Memberships */}
              {showMemberships && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Memberships</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.7 }}>
                    {pub.memberships.join(' · ')}
                  </div>
                </section>
              )}

              {/* Strategic Initiatives */}
              {showStrategicInitiatives && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Strategic Initiatives</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pub.strategic_initiatives.map((si, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#f4f1ea', fontWeight: 500, fontSize: 13.5 }}>{si.title}</div>
                        {si.description && (
                          <div style={{ color: '#9c9c9c', marginTop: 3, lineHeight: 1.65 }}>{si.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Portfolio */}
              {showPortfolio && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Portfolio</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pub.portfolio.map((pf, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#f4f1ea', fontWeight: 500, fontSize: 13.5 }}>{pf.title}</div>
                        {pf.url && <div style={{ color: '#9c9c9c', marginTop: 3, wordBreak: 'break-all', fontSize: 12.5 }}>{pf.url}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Press & features */}
              {showPressFeatures && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Press &amp; features</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pub.press_features.map((p, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#f4f1ea', fontWeight: 500, fontSize: 13.5 }}>{p.title}</div>
                        {p.publication && <div style={{ color: '#a58e28', marginTop: 3, fontSize: 12.5 }}>{p.publication}</div>}
                        {p.url && <div style={{ color: '#9c9c9c', marginTop: 3, fontSize: 12.5, wordBreak: 'break-all' }}>{p.url}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* References */}
              {showReferences && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>References</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pub.references.map((r, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#f4f1ea', fontWeight: 500, fontSize: 13.5 }}>{r.name}</div>
                        {r.role && <div style={{ color: '#9c9c9c', marginTop: 3, fontSize: 12.5 }}>{r.role}</div>}
                        {r.company && <div style={{ color: '#a58e28', marginTop: 3, fontSize: 12.5 }}>{r.company}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Internships */}
              {showInternships && (
                <section style={zoneBlock}>
                  <h3 style={zoneHeader}>Internships</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {pub.internships.map((r, idx) => (
                      <div key={idx}>
                        <div style={{ color: '#f4f1ea', fontWeight: 500, fontSize: 13.5 }}>{r.company}</div>
                        {r.role && <div style={{ color: '#9c9c9c', marginTop: 3, fontSize: 12.5 }}>{r.role}</div>}
                        {r.period && <div style={{ color: '#a58e28', marginTop: 3, fontSize: 12.5 }}>{r.period}</div>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>

          {/* FOOTER — strings verbatim, discreet, below dossier */}
          <div style={{ textAlign: 'center', marginTop: 46, paddingTop: 30, borderTop: '1px solid #282828' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: '#9c9c9c', margin: '0 0 4px' }}>This profile was shared privately via JOBLUX. It is not indexed by any search engine.</p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: '#777', margin: 0 }}>joblux.com · Luxury talent intelligence</p>
          </div>

        </div>
      </div>
    </>
  )
}
