import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Image from 'next/image'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const metadata = {
  robots: { index: false, follow: false },
}

interface Props {
  params: { slug: string }
}

const AVAILABILITY_LABELS: Record<string, string> = {
  active: 'Actively looking',
  open: 'Considering opportunities',
  passive: 'Passively exploring',
  unavailable: 'Not available',
}

export default async function PublicProfilePage({ params }: Props) {
  const { data: profile } = await supabase
    .from('profilux')
    .select('*')
    .eq('share_slug', params.slug)
    .eq('sharing_enabled', true)
    .single()

  if (!profile) notFound()

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
  const availabilityLabel = AVAILABILITY_LABELS[profile.availability] || ''

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div style={{ background: '#0f0f0f', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

        {/* HEADER */}
        <div style={{ background: '#0a0a0a', borderBottom: '0.5px solid #1e1e1e', padding: '0 40px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <img src="/joblux-header.png" alt="JOBLUX" style={{ height: '22px' }} />
            <span style={{ fontSize: '10px', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Profilux</span>
          </div>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 40px 80px' }}>

          {/* PROFILE HEADER */}
          <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '40px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px' }}>
              {profile.photo_url ? (
                <img src={profile.photo_url} alt={profile.first_name} style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '0.5px solid #333', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: '#1e1e1e', border: '0.5px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', color: '#fff', fontWeight: 400, flexShrink: 0 }}>{initials}</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '30px', margin: '0 0 6px', color: '#fff' }}>
                      {profile.first_name} {profile.last_name}
                    </h1>
                    <p style={{ fontSize: '14px', color: '#fff', margin: 0, opacity: 0.7 }}>{profile.headline}</p>
                  </div>
                  {availabilityLabel && (
                    <span style={{ fontSize: '10px', color: '#1D9E75', border: '0.5px solid #1D9E75', padding: '5px 12px', borderRadius: '3px', letterSpacing: '0.06em', whiteSpace: 'nowrap', marginTop: '4px' }}>
                      {availabilityLabel}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
                  {profile.city && <span style={{ fontSize: '12px', border: '0.5px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{profile.city}</span>}
                  {profile.nationality && <span style={{ fontSize: '12px', border: '0.5px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{profile.nationality}</span>}
                  {profile.languages?.slice(0, 3).map((l: string) => (
                    <span key={l} style={{ fontSize: '12px', border: '0.5px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
            {profile.bio && (
              <p style={{ fontSize: '14px', color: '#fff', lineHeight: 1.7, opacity: 0.7, margin: '24px 0 0', borderTop: '0.5px solid #1e1e1e', paddingTop: '24px' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* CAREER + EXPERTISE grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

            {/* CAREER HISTORY */}
            {profile.experience?.length > 0 && (
              <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
                <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '20px', opacity: 0.5 }}>Career history</div>
                {profile.experience.map((exp: any, i: number) => (
                  <div key={i} style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: i < profile.experience.length - 1 ? '0.5px solid #1e1e1e' : 'none' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '4px' }}>{exp.role}</div>
                    <div style={{ fontSize: '13px', color: '#fff', marginBottom: '4px', opacity: 0.7 }}>{exp.brand}{exp.group ? ` · ${exp.group}` : ''}</div>
                    <div style={{ fontSize: '11px', color: '#fff', opacity: 0.4 }}>{exp.from}{exp.current ? ' | Present' : exp.to ? ` | ${exp.to}` : ''}{exp.location ? ` · ${exp.location}` : ''}</div>
                  </div>
                ))}
              </div>
            )}

            {/* EXPERTISE + SECTORS */}
            <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px' }}>
              {profile.specialisations?.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Expertise</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '24px' }}>
                    {profile.specialisations.map((s: string) => (
                      <span key={s} style={{ fontSize: '12px', border: '0.5px solid #444', color: '#fff', padding: '5px 12px', borderRadius: '3px' }}>{s}</span>
                    ))}
                  </div>
                </>
              )}
              {profile.sectors?.length > 0 && (
                <>
                  <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Sectors</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {profile.sectors.map((s: string) => (
                      <span key={s} style={{ fontSize: '12px', border: '0.5px solid #2a2a2a', color: '#ccc', padding: '5px 12px', borderRadius: '3px' }}>{s}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* MARKETS */}
          {profile.markets?.length > 0 && (
            <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '28px', marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', color: '#fff', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px', opacity: 0.5 }}>Markets & geographies</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {profile.markets.map((m: string) => (
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
