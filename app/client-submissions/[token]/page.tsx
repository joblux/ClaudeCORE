import { createClient } from '@supabase/supabase-js'
import { notFound, redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { resolveProfiLux } from '@/lib/profilux/resolveProfiLux'
import { projectFor } from '@/lib/profilux/projectFor'
import type { ClientProjection } from '@/lib/profilux/types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic'

export const metadata = {
  robots: { index: false, follow: false },
}

/**
 * /client-submissions/[token] — Pack E.6.1c
 *
 * Tokenized, opportunity-bound client dossier render.
 * - Token is the credential. No auth session required.
 * - Expiry + revocation both redirect to /expired (collapsed UX).
 * - Reads through resolveProfiLux + projectFor('client') per MATRIX §10.1.
 * - No view tracking in v1 (deferred to E.6.5 per GPT lock).
 * - Visual lock: light premium dossier, cream + gold, no avatar.
 */

interface Props {
  params: { token: string }
}

export default async function ClientSubmissionPage({ params }: Props) {
  noStore()

  const { data: sub } = await supabase
    .from('client_submissions')
    .select('id, application_id, token, client_business_name, client_recipient_name, client_recipient_role, recruiter_email, recruiter_note, expires_at, revoked_at, created_at')
    .eq('token', params.token)
    .maybeSingle()

  if (!sub) notFound()
  if (sub.revoked_at) redirect(`/client-submissions/${params.token}/expired`)
  if (sub.expires_at && new Date(sub.expires_at).getTime() <= Date.now()) {
    redirect(`/client-submissions/${params.token}/expired`)
  }

  const { data: app } = await supabase
    .from('applications')
    .select('id, member_id, search_assignment_id')
    .eq('id', sub.application_id)
    .maybeSingle()

  if (!app || !app.member_id) notFound()

  let assignmentTitle: string | null = null
  if (app.search_assignment_id) {
    const { data: sa } = await supabase
      .from('search_assignments')
      .select('title')
      .eq('id', app.search_assignment_id)
      .maybeSingle()
    assignmentTitle = sa?.title ?? null
  }

  const view = await resolveProfiLux(app.member_id, supabase)
  if (!view) notFound()

  const client = projectFor(view, 'client') as ClientProjection
  if (!client.first_name || !client.last_name) notFound()

  // ---- helpers (presentation only) ----
  const cityLine = [client.city, client.country].filter(Boolean).join(', ')

  const currentSubline = [
    client.current_employer,
    typeof client.years_in_luxury === 'number' ? `${client.years_in_luxury} years in luxury` : null,
    client.seniority,
  ].filter(Boolean).join(' · ')

  const languagesLine = client.languages
    .map(l => l.language + (l.proficiency ? ` (${l.proficiency})` : ''))
    .join(' · ')

  const expYearRange = (start: string | null, end: string | null) => {
    const s = start ? start.slice(0, 4) : ''
    const e = end ? end.slice(0, 4) : (start ? 'Present' : '')
    return s || e ? `${s}${s && e ? ' – ' : ''}${e}` : ''
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="referrer" content="no-referrer" />
      <div style={{ background: '#f5f2eb', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: '#2a2a2a', padding: '40px 16px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', background: '#faf7f0', borderRadius: 12, padding: '40px 44px', border: '0.5px solid rgba(165,142,40,0.15)' }}>

          {/* BRAND BAR */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: 24, borderBottom: '0.5px solid rgba(0,0,0,0.08)' }}>
            <img src="/logos/joblux-gold.svg" alt="JOBLUX" style={{ height: 28, width: 'auto' }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 4 }}>PREPARED FOR</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 14, color: '#1a1a1a', fontStyle: 'italic', marginBottom: 2 }}>{sub.client_business_name}</div>
              <div style={{ fontSize: 12, color: '#5a5a5a' }}>
                {sub.client_recipient_name}{sub.client_recipient_role ? ` · ${sub.client_recipient_role}` : ''}
              </div>
            </div>
          </div>

          {/* IDENTITY */}
          <div style={{ padding: '36px 0 24px' }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.1 }}>
              {client.first_name} {client.last_name}
            </div>
            {client.headline && (
              <div style={{ fontSize: 14, color: '#5a5a5a', fontStyle: 'italic', marginBottom: 4 }}>{client.headline}</div>
            )}
            {cityLine && (
              <div style={{ fontSize: 13, color: '#888' }}>{cityLine}</div>
            )}
          </div>

          {/* OPPORTUNITY — hide entire band if no assignment */}
          {assignmentTitle && (
            <div style={{ padding: '18px 22px', background: 'rgba(165,142,40,0.06)', borderLeft: '2px solid #a58e28', marginBottom: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#7a6818', marginBottom: 6 }}>OPPORTUNITY</div>
              <div style={{ fontSize: 14, color: '#2a2a2a' }}>{assignmentTitle}</div>
            </div>
          )}

          {/* RECRUITER NOTE — hide entire card if note absent */}
          {sub.recruiter_note && (
            <div style={{ padding: '20px 22px', background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.08)', marginBottom: 36, borderRadius: 4 }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 10 }}>RECRUITER NOTE</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: '#2a2a2a' }}>{sub.recruiter_note}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 14, fontStyle: 'italic' }}>— {sub.recruiter_email}</div>
            </div>
          )}

          {/* CURRENT POSITION — only if anything to show */}
          {(client.job_title || currentSubline) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>CURRENT POSITION</div>
              {client.job_title && <div style={{ fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>{client.job_title}</div>}
              {currentSubline && <div style={{ fontSize: 13, color: '#5a5a5a' }}>{currentSubline}</div>}
            </div>
          )}

          {/* EXPERTISE */}
          {client.expertise_tags.length > 0 && (
            <div style={{ paddingTop: 22, marginBottom: 24, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 14 }}>EXPERTISE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {client.expertise_tags.map(tag => (
                  <span key={tag} style={{ fontSize: 12, padding: '5px 14px', background: '#ffffff', border: '0.5px solid rgba(0,0,0,0.12)', borderRadius: 20, color: '#2a2a2a' }}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* CAREER HISTORY */}
          {client.experiences.length > 0 && (
            <div style={{ paddingTop: 22, marginBottom: 24, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 14 }}>CAREER HISTORY</div>
              {client.experiences.map((exp, i) => {
                const sub = [exp.company, expYearRange(exp.start_date, exp.end_date), [exp.city, exp.country].filter(Boolean).join(', ')].filter(Boolean).join(' · ')
                return (
                  <div key={i} style={{ marginBottom: i < client.experiences.length - 1 ? 16 : 0 }}>
                    {exp.job_title && <div style={{ fontSize: 14, color: '#1a1a1a' }}>{exp.job_title}</div>}
                    {sub && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{sub}</div>}
                  </div>
                )
              })}
            </div>
          )}

          {/* LANGUAGES */}
          {client.languages.length > 0 && (
            <div style={{ paddingTop: 22, marginBottom: 24, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>LANGUAGES</div>
              <div style={{ fontSize: 13, color: '#2a2a2a' }}>{languagesLine}</div>
            </div>
          )}

          {/* EDUCATION */}
          {client.education.length > 0 && (
            <div style={{ paddingTop: 22, marginBottom: 32, borderTop: '0.5px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 10, letterSpacing: '1.5px', color: '#888', marginBottom: 12 }}>EDUCATION</div>
              {client.education.map((edu, i) => {
                const left = [edu.degree_level, edu.field_of_study].filter(Boolean).join(' ')
                const line = [left, edu.institution].filter(Boolean).join(' · ')
                return (
                  <div key={i} style={{ fontSize: 13, color: '#2a2a2a', marginBottom: i < client.education.length - 1 ? 6 : 0 }}>{line}</div>
                )
              })}
            </div>
          )}

          {/* FOOTER */}
          <div style={{ paddingTop: 24, borderTop: '0.5px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>Prepared by {sub.recruiter_email}</div>
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 6, letterSpacing: '1.2px' }}>LUXURY TALENT INTELLIGENCE</div>
          </div>

        </div>
      </div>
    </>
  )
}
