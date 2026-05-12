import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'
import type { PublicProjection } from '@/lib/profilux/types'

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

  // 1. profilux table = share-state lookup only (Matrix v1.1 §9 + §18.2)
  // Public profile access is gated by profilux.sharing_enabled = true.
  // Do not remove the sharing_enabled filter without security review.
  const { data: shareState } = await supabase
    .from('profilux')
    .select('email')
    .eq('share_slug', params.slug)
    .eq('sharing_enabled', true)
    .maybeSingle()

  if (!shareState?.email) notFound()

  // 2. resolve to canonical members row by email (case-insensitive)
  const { data: member } = await supabase
    .from('members')
    .select('id')
    .ilike('email', shareState.email)
    .maybeSingle()

  if (!member?.id) notFound()

  // 3. resolveProfiLux + projectFor (Matrix v1.1 §10.1 — surfaces consume projections only)
  const view = await resolveProfiLux(member.id, supabase)
  if (!view) notFound()

  const pub = projectFor(view, 'public') as PublicProjection

  const initials = `${pub.first_name?.[0] || ''}${pub.last_name?.[0] || ''}`.toUpperCase()

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>


        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* PROFILE HEADER */}
          <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '40px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px' }}>
              {pub.avatar_url ? (
                <img src={pub.avatar_url} alt={pub.first_name || ''} style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #333', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#1e1e1e', border: '0.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', fontWeight: 400, flexShrink: 0 }}>{initials}</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '10px' }}>
                  <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '30px', margin: '0 0 6px', color: '#fff' }}>
                    {pub.first_name} {pub.last_name}
                  </h1>
                  <p style={{ fontSize: '14px', color: '#fff', margin: 0, opacity: 0.7 }}>{pub.headline}</p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                  {pub.city && <span style={{ fontSize: '12px', border: '0.5px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{pub.city}</span>}
                  {pub.languages?.slice(0, 3).map((l) => (
                    <span key={l.language} style={{ fontSize: '12px', border: '0.5px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{l.language}</span>
                  ))}
                </div>
              </div>
            </div>
            {pub.bio && (
              <p style={{ fontSize: '14px', color: '#fff', lineHeight: 1.7, opacity: 0.7, margin: '24px 0 0', borderTop: '0.5px solid #1e1e1e', paddingTop: '24px' }}>
                {pub.bio}
              </p>
            )}
          </div>

          {/* CAREER + EXPERTISE grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            {/* CAREER HISTORY */}
            {pub.experiences?.length > 0 && (
              <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px', opacity: 0.5 }}>Career history</div>
                {pub.experiences.map((exp, i) => (
                  <div key={i} style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: i < pub.experiences.length - 1 ? '0.5px solid #1e1e1e' : 'none' }}>
                    {exp.job_title && (
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>{exp.job_title}</div>
                    )}
                    {/* V5: company anonymized to null - line intentionally omitted (Option C, GPT-locked) */}
                    {(exp.start_date || exp.end_date || exp.city || exp.country) && (
                      <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>
                        {exp.start_date || ''}{exp.end_date ? ` | ${exp.end_date}` : ''}
                        {(exp.city || exp.country) ? ` · ${[exp.city, exp.country].filter(Boolean).join(', ')}` : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* EXPERTISE + SECTORS */}
            <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
              {pub.expertise_tags?.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '24px' }}>
                    {pub.expertise_tags.map((s) => (
                      <span key={s} style={{ fontSize: '12px', border: '0.5px solid #444', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{s}</span>
                    ))}
                  </div>
                </>
              )}
              {pub.sectors?.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Sectors</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {pub.sectors.map((s) => (
                      <span key={s} style={{ fontSize: '12px', border: '0.5px solid #2a2a2a', color: '#ccc', padding: '5px 12px', borderRadius: '3px' }}>{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* MARKETS */}
          {pub.market_knowledge?.length > 0 && (
            <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Markets & geographies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {pub.market_knowledge.map((m) => (
                  <span key={m} style={{ fontSize: '12px', border: '0.5px solid #2a2a2a', color: '#ccc', padding: '5px 12px', borderRadius: '3px' }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div style={{ textAlign: 'center', padding: '28px 0 0', borderTop: '0.5px solid #1e1e1e' }}>
            <p style={{ fontSize: '11px', color: '#fff', opacity: 0.2, margin: '0 0 4px' }}>This profile was shared privately via JOBLUX. It is not indexed by any search engine.</p>
            <p style={{ fontSize: '10px', color: '#fff', opacity: 0.1, margin: 0 }}>joblux.com · Luxury talent intelligence</p>
          </div>

        </div>
      </div>
    </>
  )
}
