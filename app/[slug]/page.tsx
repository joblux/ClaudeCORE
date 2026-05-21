import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { cookies } from 'next/headers'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'
import type { PublicProjection } from '@/lib/profilux/types'
import { sectorLabel, productCategoryLabel, expertiseTagLabel, skillLabel, seniorityLabel } from '@/lib/profilux/labels'
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

  // ---------- V12 view-body precompute (PublicProjection only) ----------
  const fullName = `${pub.first_name ?? ''} ${pub.last_name ?? ''}`.trim()
  const hasJob = typeof pub.job_title === 'string' && pub.job_title.trim().length > 0
  const hasSeniority = typeof pub.seniority === 'string' && pub.seniority.trim().length > 0
  const hasCity = typeof pub.city === 'string' && pub.city.trim().length > 0
  const hasCountry = typeof pub.country === 'string' && pub.country.trim().length > 0
  const locationLine = hasCity && hasCountry
    ? `${pub.city}, ${pub.country}`
    : hasCity ? pub.city
    : hasCountry ? pub.country
    : null

  const yearOf = (d: string | null | undefined): string | null => {
    if (typeof d !== 'string') return null
    const t = d.trim()
    if (t.length === 0) return null
    const m = t.match(/^(\d{4})/)
    return m ? m[1] : null
  }

  // Career Path rows — V5: company is ALWAYS null on PublicExperience.
  // Mirror View expRows; drop the hasCo branch and never render a company token.
  type ExpRow = {
    role: string
    location: string | null
    period: string | null
    description: string | null
  }
  const expRows: ExpRow[] = (pub.experiences ?? [])
    .map((exp): ExpRow | null => {
      const hasJobT = typeof exp.job_title === 'string' && exp.job_title.trim().length > 0
      if (!hasJobT) return null
      const xCity = typeof exp.city === 'string' && exp.city.trim().length > 0 ? exp.city : null
      const xCountry = typeof exp.country === 'string' && exp.country.trim().length > 0 ? exp.country : null
      const location = xCity && xCountry ? `${xCity}, ${xCountry}` : (xCity ?? xCountry)
      const startY = yearOf(exp.start_date)
      const endY = yearOf(exp.end_date)
      const period =
        startY && endY ? `${startY}–${endY}`
        : startY ? `${startY}–present`
        : endY ? endY
        : null
      const description = typeof exp.description === 'string' && exp.description.trim().length > 0 ? exp.description : null
      return { role: exp.job_title as string, location, period, description }
    })
    .filter((r): r is ExpRow => r !== null)

  const languages = Array.isArray(pub.languages) ? pub.languages : []
  const certifications = Array.isArray(pub.certifications) ? pub.certifications : []

  const expertiseFilled =
    typeof pub.years_in_luxury === 'number' ||
    (Array.isArray(pub.sectors) && pub.sectors.length > 0) ||
    (Array.isArray(pub.product_categories) && pub.product_categories.length > 0) ||
    (Array.isArray(pub.expertise_tags) && pub.expertise_tags.length > 0) ||
    (Array.isArray(pub.key_skills) && pub.key_skills.length > 0) ||
    (Array.isArray(pub.market_knowledge) && pub.market_knowledge.length > 0)

  // Inlined ViewZone tokens (mirror app/dashboard/candidate/profilux/page.tsx
  // ViewZone, lines 241–267 — same wrap + title styles).
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

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <style>{`@media (max-width: 768px) { .pf-public-grid { flex-direction: column !important; } .pf-public-spine { width: 100% !important; } }`}</style>
      <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 28px 80px' }}>

          {/* V12 convergence — two-column View layout (left spine + right field) */}
          <div className="pf-public-grid" style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>

            {/* LEFT SPINE — identity only (no employer V3, no availability V7, no actions) */}
            <aside className="pf-public-spine" style={{ width: 300, flexShrink: 0 }}>
              {fullName.length > 0 && (
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 26, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
                  {fullName}
                </div>
              )}
              {hasJob && (
                <div style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontSize: 13.5, color: '#a58e28', lineHeight: 1.4, marginBottom: 4 }}>
                  {pub.job_title}
                </div>
              )}
              {locationLine && (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999', lineHeight: 1.4 }}>
                  {locationLine}
                </div>
              )}
            </aside>

            {/* RIGHT FIELD — Current Role · Career Path · Languages · Expertise · Certifications */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Current Role — neutral avatar (empty, employer is masked V3); no Since line */}
              {(hasJob || hasSeniority) && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Current Role</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '1px solid rgba(165,142,40,0.2)',
                      flexShrink: 0,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {hasJob && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, color: '#fff', fontWeight: 500, lineHeight: 1.3, marginBottom: 2 }}>{pub.job_title}</div>
                      )}
                      {hasSeniority && (
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4 }}>{seniorityLabel(pub.seniority)}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Career Path — V5: company is null, never rendered */}
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
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: '#fff', fontWeight: 500, lineHeight: 1.4, marginBottom: 2 }}>{r.role}</div>
                          {r.location && (
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.4, marginBottom: 6 }}>
                              {r.location}
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

              {/* Languages */}
              {languages.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Languages</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {languages.map((l, i) => (
                      <div key={`lg-${i}-${l.language}`} style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#ccc', lineHeight: 1.4 }}>
                        <span>{l.language}</span>
                        {l.proficiency && <span style={{ color: '#999', marginLeft: 8 }}>{l.proficiency}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise — 6 sub-rows, dot-separated (label helpers not importable; see report) */}
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

              {/* Certifications — no activated_sections gate on PublicProjection (expected) */}
              {certifications.length > 0 && (
                <div style={zoneWrap}>
                  <h3 style={zoneTitle}>Certifications</h3>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#a58e28', lineHeight: 1.5 }}>
                    {certifications.join(' · ')}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTER — strings verbatim, discreet, full-width below dossier */}
          <div style={{ textAlign: 'center', padding: '28px 0 0', marginTop: 48, borderTop: '0.5px solid #1e1e1e' }}>
            <p style={{ fontSize: 11, color: '#fff', opacity: 0.2, margin: '0 0 4px' }}>This profile was shared privately via JOBLUX. It is not indexed by any search engine.</p>
            <p style={{ fontSize: 10, color: '#fff', opacity: 0.1, margin: 0 }}>joblux.com · Luxury talent intelligence</p>
          </div>

        </div>
      </div>
    </>
  )
}
