import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import type { Metadata } from 'next'

// ── Supabase client (server-side, service role) ─────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ── Types ───────────────────────────────────────────────────────────

interface WorkExperience {
  id: string
  company: string | null
  job_title: string | null
  city: string | null
  country: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  description: string | null
}

interface EducationRecord {
  id: string
  institution: string | null
  degree_level: string | null
  field_of_study: string | null
  graduation_year: number | null
}

interface MemberLanguage {
  id: string
  language: string
  proficiency: string
}

interface MemberSector {
  id: string
  sector: string
}

interface ResumeData {
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  city: string | null
  country: string | null
  open_to_relocation: boolean
  role: string | null
  resume_headline: string | null
  resume_show_email: boolean
  resume_show_phone: boolean
  email?: string
  phone?: string
  work_experiences: WorkExperience[]
  education_records: EducationRecord[]
  languages: MemberLanguage[]
  sectors: MemberSector[]
}

// ── Tier labels (never use "Member") ────────────────────────────────

const TIER_LABELS: Record<string, string> = {
  rising: 'Rising',
  pro: 'Pro',
  professional: 'Established Professional',
  executive: 'Executive',
  business: 'Business',
  insider: 'Insider',
  admin: 'Founder',
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatMonthYear(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function getInitials(first: string | null, last: string | null): string {
  const f = first?.trim()?.[0] || ''
  const l = last?.trim()?.[0] || ''
  return (f + l).toUpperCase() || '?'
}

// ── Data fetching ───────────────────────────────────────────────────

async function fetchResume(slug: string): Promise<ResumeData | null> {
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select(
      'id, first_name, last_name, avatar_url, city, country, open_to_relocation, role, resume_headline, resume_show_email, resume_show_phone, email, phone'
    )
    .eq('resume_slug', slug)
    .eq('resume_public', true)
    .maybeSingle()

  if (memberError || !member) return null

  const memberId = member.id

  const [workExp, education, languages, sectors] = await Promise.all([
    supabase
      .from('work_experiences')
      .select('*')
      .eq('member_id', memberId)
      .order('start_date', { ascending: false }),
    supabase
      .from('education_records')
      .select('*')
      .eq('member_id', memberId)
      .order('graduation_year', { ascending: false }),
    supabase
      .from('member_languages')
      .select('*')
      .eq('member_id', memberId),
    supabase
      .from('member_sectors')
      .select('*')
      .eq('member_id', memberId)
      .then((res) => {
        if (res.error?.code === '42P01' || res.error?.message?.includes('does not exist')) {
          return { data: [], error: null }
        }
        return res
      }),
  ])

  const resume: ResumeData = {
    first_name: member.first_name,
    last_name: member.last_name,
    avatar_url: member.avatar_url,
    city: member.city,
    country: member.country,
    open_to_relocation: member.open_to_relocation ?? false,
    role: member.role,
    resume_headline: member.resume_headline,
    resume_show_email: member.resume_show_email ?? false,
    resume_show_phone: member.resume_show_phone ?? false,
    work_experiences: workExp.data || [],
    education_records: education.data || [],
    languages: languages.data || [],
    sectors: sectors.data || [],
  }

  if (member.resume_show_email) resume.email = member.email
  if (member.resume_show_phone) resume.phone = member.phone

  return resume
}

// ── Metadata ────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const resume = await fetchResume(params.slug)

  if (!resume) {
    return { title: 'Resume Not Found | JOBLUX' }
  }

  const name = [resume.first_name, resume.last_name].filter(Boolean).join(' ') || 'Professional'
  const currentRole =
    resume.work_experiences.find((w) => w.is_current)?.job_title ||
    resume.work_experiences[0]?.job_title ||
    'Luxury Professional'

  return {
    title: `${name} — ${currentRole} | JOBLUX`,
    description:
      resume.resume_headline || 'Luxury professional on JOBLUX | Luxury Industry Careers Intelligence',
    robots: { index: false, follow: false },
    openGraph: {
      images: [
        `https://www.luxuryrecruiter.com/api/og?title=${encodeURIComponent(name)}&subtitle=${encodeURIComponent(currentRole)}&type=page`,
      ],
    },
  }
}

// ── Page component ──────────────────────────────────────────────────

export default async function ResumePage({
  params,
}: {
  params: { slug: string }
}) {
  const resume = await fetchResume(params.slug)

  if (!resume) notFound()

  const fullName =
    [resume.first_name, resume.last_name].filter(Boolean).join(' ') || 'Professional'
  const initials = getInitials(resume.first_name, resume.last_name)
  const tierLabel = TIER_LABELS[resume.role || ''] || null

  // Determine current role from work experiences
  const currentExp =
    resume.work_experiences.find((w) => w.is_current) || resume.work_experiences[0] || null
  const currentRole = currentExp?.job_title || null
  const currentCompany = currentExp?.company || null

  const location = [resume.city, resume.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="bg-[#3a3a3a] px-6 py-4 flex items-center justify-between">
        <span
          className="text-[#a58e28] text-lg tracking-[0.25em] uppercase"
          style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}
        >
          JOBLUX
        </span>
        <span className="text-[#888] text-xs tracking-wide">Luxury Industry Careers Intelligence</span>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="max-w-[960px] mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col md:flex-row gap-10">
          {/* ── Left sidebar ─────────────────────────────────── */}
          <aside className="flex flex-col items-center md:items-start md:w-[200px] shrink-0">
            {/* Avatar */}
            {resume.avatar_url ? (
              <Image
                src={resume.avatar_url}
                alt={fullName}
                width={160}
                height={200}
                className="rounded-xl border-2 border-[#a58e28] object-cover w-[100px] h-[124px] md:w-[160px] md:h-[200px]"
              />
            ) : (
              <div className="rounded-xl border-2 border-[#a58e28] bg-[#3a3a3a] flex items-center justify-center w-[100px] h-[124px] md:w-[160px] md:h-[200px]">
                <span
                  className="text-[#a58e28] text-3xl md:text-4xl"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  {initials}
                </span>
              </div>
            )}

            {/* Location */}
            {location && (
              <p className="mt-4 text-sm text-[#888] text-center md:text-left">{location}</p>
            )}

            {/* Open to relocation */}
            {resume.open_to_relocation && (
              <span className="mt-2 inline-block text-xs bg-[#e8e2d8] text-[#6b6240] px-3 py-1 rounded-full">
                Open to relocation
              </span>
            )}

            {/* Languages */}
            {resume.languages.length > 0 && (
              <div className="mt-6 w-full">
                <h3
                  className="text-xs uppercase tracking-widest text-[#888] mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Languages
                </h3>
                <ul className="space-y-1">
                  {resume.languages.map((lang) => (
                    <li key={lang.id} className="text-sm text-[#3a3a3a]">
                      <span className="font-medium">{lang.language}</span>
                      <span className="text-[#888] ml-1 text-xs capitalize">
                        ({lang.proficiency})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sectors */}
            {resume.sectors.length > 0 && (
              <div className="mt-6 w-full">
                <h3
                  className="text-xs uppercase tracking-widest text-[#888] mb-2"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Sectors
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {resume.sectors.map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-[#3a3a3a] text-[#a58e28] px-2.5 py-1 rounded"
                    >
                      {s.sector}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* ── Right content ────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Name */}
            <h1
              className="text-[#1a1a1a] text-2xl md:text-[24px] leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {fullName}
            </h1>

            {/* Tier badge */}
            {tierLabel && (
              <span className="mt-2 inline-block text-xs bg-[#3a3a3a] text-[#a58e28] px-3 py-1 rounded-full">
                {tierLabel}
              </span>
            )}

            {/* Current role + company */}
            {(currentRole || currentCompany) && (
              <p className="mt-3 text-[#555] text-base">
                {currentRole}
                {currentRole && currentCompany && ' at '}
                {currentCompany && <span className="font-semibold">{currentCompany}</span>}
              </p>
            )}

            {/* ── About ──────────────────────────────────────── */}
            {resume.resume_headline && (
              <section className="mt-8">
                <h2
                  className="text-sm uppercase tracking-widest text-[#888] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  About
                </h2>
                <p className="text-[#3a3a3a] text-sm leading-relaxed font-sans">
                  {resume.resume_headline}
                </p>
              </section>
            )}

            {/* ── Career ─────────────────────────────────────── */}
            {resume.work_experiences.length > 0 && (
              <section className="mt-10">
                <h2
                  className="text-sm uppercase tracking-widest text-[#888] mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Career
                </h2>
                <div className="space-y-5">
                  {resume.work_experiences.map((exp) => {
                    const startStr = formatMonthYear(exp.start_date)
                    const endStr = exp.is_current ? 'Present' : formatMonthYear(exp.end_date)
                    const dateRange = [startStr, endStr].filter(Boolean).join(' — ')
                    const expLocation = [exp.city, exp.country].filter(Boolean).join(', ')

                    return (
                      <div
                        key={exp.id}
                        className={`pl-4 ${
                          exp.is_current
                            ? 'border-l-2 border-[#a58e28]'
                            : 'border-l-2 border-[#e8e2d8]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-semibold text-[#1a1a1a] text-sm">
                            {exp.company || 'Company'}
                          </p>
                          {dateRange && (
                            <span className="text-xs text-[#888] whitespace-nowrap shrink-0">
                              {dateRange}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#555] mt-0.5">
                          {exp.job_title}
                          {expLocation && (
                            <span className="text-[#888]"> · {expLocation}</span>
                          )}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-[#888] mt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* ── Education ──────────────────────────────────── */}
            {resume.education_records.length > 0 && (
              <section className="mt-10">
                <h2
                  className="text-sm uppercase tracking-widest text-[#888] mb-4"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Education
                </h2>
                <div className="space-y-4">
                  {resume.education_records.map((edu) => (
                    <div
                      key={edu.id}
                      className="pl-4 border-l-2 border-[#e8e2d8]"
                    >
                      <p className="font-semibold text-[#1a1a1a] text-sm">
                        {edu.institution || 'Institution'}
                      </p>
                      <p className="text-sm text-[#555] mt-0.5">
                        {[edu.degree_level, edu.field_of_study].filter(Boolean).join(' in ')}
                        {edu.graduation_year && (
                          <span className="text-[#888]"> · {edu.graduation_year}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Contact ────────────────────────────────────── */}
            {(resume.email || resume.phone) && (
              <section className="mt-10">
                <h2
                  className="text-sm uppercase tracking-widest text-[#888] mb-3"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                >
                  Contact
                </h2>
                <div className="space-y-1 text-sm text-[#3a3a3a]">
                  {resume.email && (
                    <p>
                      <a
                        href={`mailto:${resume.email}`}
                        className="text-[#a58e28] hover:underline"
                      >
                        {resume.email}
                      </a>
                    </p>
                  )}
                  {resume.phone && <p>{resume.phone}</p>}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[#e8e2d8] px-6 py-5 flex items-center justify-between max-w-[960px] mx-auto">
        <span className="text-xs text-[#888]">
          R&eacute;sum&eacute; shared by {fullName}
        </span>
        <span className="text-xs text-[#a58e28]">luxuryrecruiter.com</span>
      </footer>
    </div>
  )
}
