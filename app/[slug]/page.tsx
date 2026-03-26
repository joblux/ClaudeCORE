import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

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

export default async function PublicProfilePage({ params }: Props) {
  const { data: profile } = await supabase
    .from('profilux')
    .select('*')
    .eq('share_slug', params.slug)
    .eq('sharing_enabled', true)
    .single()

  if (!profile) notFound()

  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

        {/* MINIMAL HEADER */}
        <div style={{ background: '#111', borderBottom: '1px solid #2a2a2a', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '13px', color: '#a58e28', letterSpacing: '0.04em', fontWeight: 500 }}>JOBLUX.</div>
          <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.06em' }}>CONFIDENTIAL PROFILE</div>
        </div>

        <div style={{ maxWidth: '720px', margin: '48px auto', padding: '0 24px' }}>

          {/* PROFILE HEADER */}
          <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '32px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a1a', border: '1px solid #a58e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#a58e28', fontWeight: 500, flexShrink: 0 }}>
                {initials}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '26px', margin: '0 0 4px', color: '#fff' }}>
                  {profile.first_name} {profile.last_name}
                </h1>
                <p style={{ fontSize: '14px', color: '#888', margin: '0 0 12px', fontWeight: 300 }}>{profile.headline}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.city && <span style={{ fontSize: '11px', border: '1px solid #333', color: '#666', padding: '3px 10px', borderRadius: '2px' }}>{profile.city}</span>}
                  {profile.nationality && <span style={{ fontSize: '11px', border: '1px solid #333', color: '#666', padding: '3px 10px', borderRadius: '2px' }}>{profile.nationality}</span>}
                  {profile.languages?.slice(0, 3).map((l: string) => (
                    <span key={l} style={{ fontSize: '11px', border: '1px solid #333', color: '#666', padding: '3px 10px', borderRadius: '2px' }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
            {profile.bio && (
              <p style={{ fontSize: '14px', color: '#888', lineHeight: 1.7, fontWeight: 300, margin: 0, borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* EXPERIENCE */}
          {profile.experience?.length > 0 && (
            <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '18px', margin: '0 0 20px', color: '#fff' }}>Career history</h2>
              {profile.experience.map((exp: any, i: number) => (
                <div key={i} style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: i < profile.experience.length - 1 ? '1px solid #2a2a2a' : 'none' }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '2px' }}>{exp.role}</div>
                  <div style={{ fontSize: '13px', color: '#a58e28', marginBottom: '2px' }}>{exp.brand}{exp.group ? ` · ${exp.group}` : ''}</div>
                  <div style={{ fontSize: '12px', color: '#555' }}>{exp.from}{exp.current ? ' — Present' : exp.to ? ` — ${exp.to}` : ''}{exp.location ? ` · ${exp.location}` : ''}</div>
                </div>
              ))}
            </div>
          )}

          {/* EXPERTISE + SECTORS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {profile.specialisations?.length > 0 && (
              <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ fontSize: '11px', color: '#a58e28', letterSpacing: '0.07em', margin: '0 0 14px' }}>EXPERTISE</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.specialisations.map((s: string) => (
                    <span key={s} style={{ fontSize: '11px', border: '1px solid #a58e28', color: '#a58e28', padding: '3px 8px', borderRadius: '2px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.sectors?.length > 0 && (
              <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '24px' }}>
                <h3 style={{ fontSize: '11px', color: '#a58e28', letterSpacing: '0.07em', margin: '0 0 14px' }}>SECTORS</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {profile.sectors.map((s: string) => (
                    <span key={s} style={{ fontSize: '11px', border: '1px solid #333', color: '#666', padding: '3px 8px', borderRadius: '2px' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* MARKETS */}
          {profile.markets?.length > 0 && (
            <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '11px', color: '#a58e28', letterSpacing: '0.07em', margin: '0 0 14px' }}>MARKETS & GEOGRAPHIES</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {profile.markets.map((m: string) => (
                  <span key={m} style={{ fontSize: '11px', border: '1px solid #333', color: '#666', padding: '3px 8px', borderRadius: '2px' }}>{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* FOOTER NOTE */}
          <div style={{ textAlign: 'center', padding: '24px 0', borderTop: '1px solid #222' }}>
            <p style={{ fontSize: '11px', color: '#444', fontWeight: 300, margin: '0 0 4px' }}>
              This profile was shared privately via JOBLUX. It is not indexed by any search engine.
            </p>
            <p style={{ fontSize: '11px', color: '#333', fontWeight: 300, margin: 0 }}>
              joblux.com · Confidential luxury careers intelligence
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
