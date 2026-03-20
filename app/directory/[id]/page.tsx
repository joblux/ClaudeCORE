'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMember } from '@/lib/auth-hooks'
import { DIRECTORY_ACCESS_ROLES, TIER_BADGE_STYLES, TIER_LABELS } from '@/types/directory'
import type { DirectoryMemberProfile } from '@/types/directory'

export default function MemberProfilePage() {
  const params = useParams()
  const id = params.id as string
  const { role, isAdmin, isLoading: authLoading } = useMember()
  const hasAccess = DIRECTORY_ACCESS_ROLES.includes((role || '') as any)

  const [member, setMember] = useState<DirectoryMemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Intro request state
  const [showIntroForm, setShowIntroForm] = useState(false)
  const [introMessage, setIntroMessage] = useState('')
  const [introSending, setIntroSending] = useState(false)
  const [introSent, setIntroSent] = useState(false)

  useEffect(() => {
    if (!hasAccess) return
    setLoading(true)
    fetch(`/api/directory/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => setMember(data.member))
      .catch(() => setError('Member not found'))
      .finally(() => setLoading(false))
  }, [id, hasAccess])

  const sendIntro = async () => {
    if (!introMessage.trim()) return
    setIntroSending(true)
    try {
      const res = await fetch('/api/directory/request-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: id, message: introMessage }),
      })
      if (res.ok) {
        setIntroSent(true)
        setShowIntroForm(false)
        setIntroMessage('')
      }
    } catch {
      // ignore
    } finally {
      setIntroSending(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div>
        <div className="bg-[#fafaf5] border-b border-[#e8e2d8] py-14">
          <div className="jl-container">
            <div className="flex items-center gap-5 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-[#e8e2d8]" />
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-[#e8e2d8] rounded w-1/3" />
                <div className="h-4 bg-[#e8e2d8] rounded w-1/2" />
                <div className="h-3 bg-[#e8e2d8] rounded w-1/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="jl-serif text-xl text-[#1a1a1a] mb-3">Access Required</p>
        <p className="text-sm text-[#888] mb-4">Directory profiles are available to Business, Insider, and Executive members.</p>
        <Link href="/directory" className="text-sm text-[#a58e28]">&larr; Back to Directory</Link>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="jl-container py-20 text-center">
        <h1 className="jl-serif text-2xl text-[#1a1a1a] mb-3">Member not found</h1>
        <Link href="/directory" className="text-sm text-[#a58e28] hover:text-[#1a1a1a]">
          &larr; Back to Directory
        </Link>
      </div>
    )
  }

  const m = member
  const displayName = m.full_name || [m.first_name, m.last_name].filter(Boolean).join(' ') || 'Member'
  const employer = m.maison || m.current_employer
  const tierStyle = TIER_BADGE_STYLES[m.role || ''] || TIER_BADGE_STYLES.pro
  const tierLabel = TIER_LABELS[m.role || ''] || 'Member'
  const canSeeLinkedin = role === 'admin' || role === 'business'
  const canRequestIntro = ['business', 'insider', 'executive'].includes(role || '')

  // Nationality to flag emoji (basic mapping)
  const flagEmoji = m.nationality ? countryToFlag(m.nationality) : null

  return (
    <div>
      {/* Profile Header */}
      <section className="bg-[#fafaf5] border-b border-[#e8e2d8] py-12 md:py-16">
        <div className="jl-container">
          <div className="text-xs text-[#999] mb-6 tracking-wide">
            <Link href="/directory" className="hover:text-[#a58e28] transition-colors">Directory</Link>
            <span className="mx-2">/</span>
            <span className="text-[#1a1a1a]">{displayName}</span>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <Avatar firstName={m.first_name} lastName={m.last_name} avatarUrl={m.avatar_url} size={120} />
            </div>
            <div className="flex-1">
              <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-2">{displayName}</h1>
              <p className="font-sans text-sm text-[#666] mb-1">
                {m.headline || m.job_title || 'Luxury Professional'}
              </p>
              {employer && (
                <p className="font-sans text-sm text-[#a58e28] mb-3">{employer}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#888]">
                {(m.city || m.country) && (
                  <span>{[m.city, m.country].filter(Boolean).join(', ')}{flagEmoji ? ` ${flagEmoji}` : ''}</span>
                )}
                {m.years_in_luxury && (
                  <span className="jl-badge text-[0.6rem]">{m.years_in_luxury} years in luxury</span>
                )}
                <span
                  className="text-[0.6rem] font-medium px-2 py-0.5 rounded-sm"
                  style={{ backgroundColor: tierStyle.bg, color: tierStyle.text }}
                >
                  {tierLabel}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4">
                {canSeeLinkedin && m.linkedin_url && (
                  <a
                    href={m.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jl-btn-outline text-xs"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content — 3 cols */}
          <div className="lg:col-span-3 space-y-8">
            {/* About */}
            {m.bio && (
              <ProfileSection title="About">
                <p className="text-sm text-[#555] leading-relaxed whitespace-pre-line">{m.bio}</p>
              </ProfileSection>
            )}

            {/* Professional Summary */}
            {(m.department || m.seniority || m.speciality || m.areas_of_expertise || (m.market_knowledge && m.market_knowledge.length > 0)) && (
              <ProfileSection title="Professional Summary">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {m.department && <InfoField label="Department" value={m.department} />}
                  {m.seniority && <InfoField label="Seniority" value={m.seniority} />}
                  {m.speciality && <InfoField label="Speciality" value={m.speciality} />}
                  {m.areas_of_expertise && <InfoField label="Areas of Expertise" value={m.areas_of_expertise} />}
                  {m.total_years_experience && <InfoField label="Total Experience" value={`${m.total_years_experience} years`} />}
                  {m.market_knowledge && m.market_knowledge.length > 0 && (
                    <InfoField label="Market Knowledge" value={m.market_knowledge.join(', ')} />
                  )}
                </div>
              </ProfileSection>
            )}

            {/* Skills & Expertise */}
            {((m.key_skills && m.key_skills.length > 0) || (m.product_categories && m.product_categories.length > 0)) && (
              <ProfileSection title="Skills & Expertise">
                {m.key_skills && m.key_skills.length > 0 && (
                  <div className="mb-4">
                    <div className="jl-label mb-2">Key Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.key_skills.map((skill, i) => (
                        <span key={i} className="jl-badge-outline text-[0.65rem]">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
                {m.product_categories && m.product_categories.length > 0 && (
                  <div>
                    <div className="jl-label mb-2">Product Categories</div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.product_categories.map((cat, i) => (
                        <span key={i} className="jl-badge text-[0.6rem]">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </ProfileSection>
            )}

            {/* Client Segments */}
            {m.client_segment_experience && m.client_segment_experience.length > 0 && (
              <ProfileSection title="Client Segment Experience">
                <div className="flex flex-wrap gap-1.5">
                  {m.client_segment_experience.map((seg, i) => (
                    <span key={i} className="jl-badge-outline text-[0.65rem]">{seg}</span>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Brands Experience */}
            {m.brands_worked_with && m.brands_worked_with.length > 0 && (
              <ProfileSection title="Brands Experience">
                <div className="flex flex-wrap gap-2">
                  {m.brands_worked_with.map((brand, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium text-[#1a1a1a] border border-[#e8e2d8] px-3 py-1.5 rounded-sm hover:border-[#a58e28] transition-colors"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Career History */}
            {m.work_experiences && m.work_experiences.length > 0 && (
              <ProfileSection title="Career History">
                <div className="space-y-4">
                  {m.work_experiences.map((w) => (
                    <div key={w.id} className="flex gap-4">
                      <div className="flex-shrink-0 w-1 bg-[#e8e2d8] rounded-full relative">
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#a58e28]" />
                      </div>
                      <div className="pb-2">
                        <h4 className="font-sans text-sm font-semibold text-[#1a1a1a]">{w.job_title}</h4>
                        <p className="text-xs text-[#a58e28]">{w.company}</p>
                        <div className="flex items-center gap-2 text-[0.65rem] text-[#999] mt-1">
                          {w.start_date && (
                            <span>
                              {formatDate(w.start_date)} — {w.is_current ? 'Present' : w.end_date ? formatDate(w.end_date) : ''}
                            </span>
                          )}
                          {(w.city || w.country) && (
                            <>
                              <span>&middot;</span>
                              <span>{[w.city, w.country].filter(Boolean).join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Education */}
            {m.education_records && m.education_records.length > 0 && (
              <ProfileSection title="Education">
                <div className="space-y-3">
                  {m.education_records.map((e) => (
                    <div key={e.id}>
                      <h4 className="font-sans text-sm font-semibold text-[#1a1a1a]">{e.institution}</h4>
                      <p className="text-xs text-[#666]">
                        {[e.degree_level, e.field_of_study].filter(Boolean).join(' in ')}
                        {e.graduation_year ? ` · ${e.graduation_year}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Languages */}
            {m.languages && m.languages.length > 0 && (
              <ProfileSection title="Languages">
                <div className="flex flex-wrap gap-2">
                  {m.languages.map((l) => (
                    <span key={l.id} className="jl-badge-outline text-[0.65rem]">
                      {l.language}
                      <span className="text-[#ccc] ml-1">· {l.proficiency}</span>
                    </span>
                  ))}
                </div>
              </ProfileSection>
            )}

            {/* Contributions */}
            {m.contribution_count > 0 && (
              <ProfileSection title="Community">
                <p className="text-sm text-[#888]">
                  {m.contribution_count} contribution{m.contribution_count !== 1 ? 's' : ''} to the JOBLUX community
                </p>
              </ProfileSection>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact CTA */}
            <div className="jl-card border-[#a58e28]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-3">
                Connect
              </h3>

              {isAdmin ? (
                <Link
                  href="/admin/dashboard"
                  className="jl-btn-gold w-full text-center block"
                >
                  Message via Admin
                </Link>
              ) : canRequestIntro && !introSent ? (
                <>
                  {!showIntroForm ? (
                    <button
                      onClick={() => setShowIntroForm(true)}
                      className="jl-btn-gold w-full"
                    >
                      Request Introduction
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={introMessage}
                        onChange={(e) => setIntroMessage(e.target.value)}
                        placeholder="Write a brief message explaining why you'd like to connect..."
                        className="jl-input w-full min-h-[80px] text-xs"
                        rows={4}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={sendIntro}
                          disabled={introSending || !introMessage.trim()}
                          className="jl-btn-primary text-xs flex-1 disabled:opacity-50"
                        >
                          {introSending ? 'Sending...' : 'Send Request'}
                        </button>
                        <button
                          onClick={() => setShowIntroForm(false)}
                          className="jl-btn-outline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : introSent ? (
                <div className="text-center py-2">
                  <p className="text-xs text-[#a58e28] font-medium mb-1">Request Sent</p>
                  <p className="text-[0.65rem] text-[#888]">JOBLUX will facilitate the introduction.</p>
                </div>
              ) : (
                <p className="text-xs text-[#888] leading-relaxed">
                  Contact requests are handled through JOBLUX to protect member privacy.
                </p>
              )}
            </div>

            {/* Back link */}
            <Link
              href="/directory"
              className="block text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors"
            >
              &larr; Back to Directory
            </Link>
          </aside>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="jl-card">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#1a1a1a] mb-4 pb-2 border-b border-[#f0ece4]">
        {title}
      </h2>
      {children}
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="jl-label mb-0.5">{label}</div>
      <p className="text-sm text-[#555]">{value}</p>
    </div>
  )
}

function Avatar({ firstName, lastName, avatarUrl, size = 120 }: { firstName: string | null; lastName: string | null; avatarUrl: string | null; size?: number }) {
  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase() || '?'
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="rounded-full object-cover border-2 border-[#a58e28]"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className="rounded-full flex items-center justify-center border-2 border-[#a58e28]"
      style={{ width: size, height: size, backgroundColor: '#1a1a1a', color: '#a58e28', fontSize: size * 0.3, fontWeight: 600 }}
    >
      {initials}
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function countryToFlag(nationality: string): string | null {
  // Basic mapping of common nationalities to flag emojis
  const map: Record<string, string> = {
    'French': '🇫🇷', 'France': '🇫🇷',
    'British': '🇬🇧', 'United Kingdom': '🇬🇧', 'UK': '🇬🇧',
    'Italian': '🇮🇹', 'Italy': '🇮🇹',
    'American': '🇺🇸', 'United States': '🇺🇸', 'USA': '🇺🇸',
    'Swiss': '🇨🇭', 'Switzerland': '🇨🇭',
    'German': '🇩🇪', 'Germany': '🇩🇪',
    'Spanish': '🇪🇸', 'Spain': '🇪🇸',
    'Japanese': '🇯🇵', 'Japan': '🇯🇵',
    'Chinese': '🇨🇳', 'China': '🇨🇳',
    'Korean': '🇰🇷', 'South Korea': '🇰🇷',
    'Emirati': '🇦🇪', 'UAE': '🇦🇪',
    'Singaporean': '🇸🇬', 'Singapore': '🇸🇬',
    'Australian': '🇦🇺', 'Australia': '🇦🇺',
    'Canadian': '🇨🇦', 'Canada': '🇨🇦',
    'Brazilian': '🇧🇷', 'Brazil': '🇧🇷',
    'Indian': '🇮🇳', 'India': '🇮🇳',
    'Dutch': '🇳🇱', 'Netherlands': '🇳🇱',
    'Belgian': '🇧🇪', 'Belgium': '🇧🇪',
    'Saudi': '🇸🇦', 'Saudi Arabia': '🇸🇦',
    'Qatari': '🇶🇦', 'Qatar': '🇶🇦',
    'Lebanese': '🇱🇧', 'Lebanon': '🇱🇧',
    'Turkish': '🇹🇷', 'Turkey': '🇹🇷',
    'Portuguese': '🇵🇹', 'Portugal': '🇵🇹',
    'Russian': '🇷🇺', 'Russia': '🇷🇺',
    'Mexican': '🇲🇽', 'Mexico': '🇲🇽',
    'Thai': '🇹🇭', 'Thailand': '🇹🇭',
    'Hong Kong': '🇭🇰',
    'Monegasque': '🇲🇨', 'Monaco': '🇲🇨',
  }
  return map[nationality] || null
}
