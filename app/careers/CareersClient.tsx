'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Pagination from '@/components/ui/Pagination'

const ASSIGNMENTS_PAGE_SIZE = 10

const TAB_SLUG_MAP: Record<string, string> = { 'interview-experiences': 'interview' }
const TAB_TO_SLUG: Record<string, string> = { 'assignments': '', 'interview': 'interview-experiences' }

interface Assignment {
  id: string
  slug: string
  title: string
  description: string
  maison: string
  location: string
  city: string
  country: string
  region: string
  seniority: string
  contract_type: string
  salary_display: string
  is_confidential: boolean
  activated_at: string
}

interface Interview {
  id: string
  brand_name: string
  brand_slug: string
  job_title: string
  department: string
  seniority: string
  location: string
  interview_year: number
  number_of_rounds: number
  interview_format: string
  difficulty: number
  overall_experience: string
  outcome: string
}

interface CareersClientProps {
  assignments: Assignment[]
  interviews: Interview[]
}

export default function CareersClient({
  assignments,
  interviews,
}: CareersClientProps) {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab') || ''
  const activeTab = TAB_SLUG_MAP[tabParam] || 'assignments'

  // Assignments pagination
  const [assignmentsPage, setAssignmentsPage] = useState(1)
  useEffect(() => { setAssignmentsPage(1) }, [activeTab])
  const assignmentsPageCount = Math.max(1, Math.ceil(assignments.length / ASSIGNMENTS_PAGE_SIZE))
  const safeAssignmentsPage = Math.min(assignmentsPage, assignmentsPageCount)
  const assignmentsStart = (safeAssignmentsPage - 1) * ASSIGNMENTS_PAGE_SIZE
  const visibleAssignments = assignments.slice(assignmentsStart, assignmentsStart + ASSIGNMENTS_PAGE_SIZE)

  // Interview filters
  const [interviewSearch, setInterviewSearch] = useState('')
  const [interviewBrand, setInterviewBrand] = useState('all')
  const [interviewDept, setInterviewDept] = useState('all')
  const [interviewLevel, setInterviewLevel] = useState('all')
  const [interviewYear, setInterviewYear] = useState('all')
  const [interviewDifficulty, setInterviewDifficulty] = useState('all')

  // Interview detail modal
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null)
  const [interviewDetail, setInterviewDetail] = useState<any>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Filter interviews
  const filteredInterviews = interviews.filter(i => {
    if (interviewSearch && !i.brand_name.toLowerCase().includes(interviewSearch.toLowerCase()) && !i.job_title.toLowerCase().includes(interviewSearch.toLowerCase())) return false
    if (interviewBrand !== 'all' && i.brand_slug !== interviewBrand) return false
    if (interviewDept !== 'all' && i.department !== interviewDept) return false
    if (interviewLevel !== 'all' && i.seniority !== interviewLevel) return false
    if (interviewYear !== 'all' && String(i.interview_year) !== interviewYear) return false
    if (interviewDifficulty !== 'all' && String(i.difficulty) !== interviewDifficulty) return false
    return true
  })

  // Handle interview detail view
  const handleViewInterview = async (interview: Interview) => {
    if (!session) return
    setSelectedInterview(interview)
    setLoadingDetail(true)
    try {
      const res = await fetch('/api/luxai/interview-detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interview.id }),
      })
      const data = await res.json()
      setInterviewDetail(data)
    } catch (error) {
      console.error('Interview detail error:', error)
    }
    setLoadingDetail(false)
  }

  // Extract unique filter options
  const uniqueInterviewBrands = Array.from(new Set(interviews.map(i => i.brand_slug)))
  const interviewBrandNameBySlug = new Map(interviews.map(i => [i.brand_slug, i.brand_name]))
  const uniqueInterviewDepts = Array.from(new Set(interviews.map(i => i.department)))
  const uniqueInterviewLevels = Array.from(new Set(interviews.map(i => i.seniority)))
  const uniqueInterviewYears = Array.from(new Set(interviews.map(i => String(i.interview_year))))

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-7 pb-16">
        <h1 className="text-[32px] font-normal text-white mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Careers
        </h1>
        <p className="text-sm text-[#999] mb-1">
          Confidential opportunities, salary intelligence, and interview preparation
        </p>
        <p className="text-[11px] text-[#777] mb-4">Real career experiences combined with structured intelligence.</p>

        {/* Main Tabs */}
        <div className="flex border-b border-[#2a2a2a] mb-5 gap-0">
          {[
            { id: 'assignments', label: 'Assignments', count: String(assignments.length) },
            { id: 'interview', label: 'Interview prep', count: `${interviews.length} experiences` },
          ].map(tab => {
            const tabSlug = TAB_TO_SLUG[tab.id]
            const href = tabSlug ? `/careers?tab=${tabSlug}` : '/careers'
            return (
              <Link
                key={tab.id}
                href={href}
                scroll={false}
                className="pb-3 mr-8 text-sm relative transition-colors whitespace-nowrap"
                style={{ color: activeTab === tab.id ? '#fff' : '#666' }}
              >
                {tab.label}
                <span className="text-[11px] ml-1" style={{ color: '#555' }}>{tab.count}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1D9E75]" />
                )}
              </Link>
            )
          })}
        </div>

        {/* TAB 1: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div>
            {/* Info banner */}
            <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-3 flex items-start gap-4 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-sm flex-shrink-0">🔒</div>
              <p className="text-xs text-[#999] leading-relaxed">
                <span className="text-[#ccc] font-medium">These are exclusive JOBLUX search assignments.</span> Brand names are disclosed after initial screening to protect the confidentiality of all parties. Every role is verified, active, and at manager level or above.
              </p>
            </div>

            {/* Assignment cards */}
            <div className="space-y-2">
              {visibleAssignments.map(a => {
                const isNew = a.activated_at && (Date.now() - new Date(a.activated_at).getTime()) < 7 * 24 * 3600000
                const displayMaison = a.is_confidential ? null : a.maison
                const locationStr = a.location || [a.city, a.country].filter(Boolean).join(', ')
                return (
                  <Link key={a.id} href={`/careers/${a.slug || a.id}`} className="block">
                    <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {a.seniority && <span className="text-[10px] font-bold tracking-[1.5px] text-[#fff]">{a.seniority.toUpperCase()}</span>}
                          {isNew && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-[#1D9E75] text-[#1D9E75]" style={{ background: 'rgba(29,158,117,0.08)' }}>
                              NEW
                            </span>
                          )}
                        </div>
                        {a.salary_display && (
                          <div className="text-sm font-medium text-[#fff]">{a.salary_display}</div>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-white mb-1 leading-snug">{a.title}</h3>
                      {displayMaison && displayMaison !== 'Confidential' && <p className="text-xs text-[#999] mb-1">{displayMaison}</p>}
                      {a.description && <p className="text-sm text-[#999] leading-relaxed mb-2 line-clamp-2">{a.description}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        {locationStr && <span className="text-[11px] text-[#999]">{locationStr}</span>}
                        {a.contract_type && (
                          <>
                            <span className="text-[11px] text-[#777]">·</span>
                            <span className="text-[11px] text-[#999] capitalize">{a.contract_type}</span>
                          </>
                        )}
                        {a.region && (
                          <>
                            <span className="text-[11px] text-[#777]">·</span>
                            <span className="text-[11px] text-[#999]">{a.region}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <Pagination
              page={safeAssignmentsPage}
              pageCount={assignmentsPageCount}
              onPageChange={setAssignmentsPage}
              theme="dark"
            />
          </div>
        )}


        {/* TAB 3: INTERVIEW PREP */}
        {activeTab === 'interview' && (
          <div>
            {/* Stats */}
            <div className="flex gap-4 items-center text-xs text-[#777] uppercase tracking-wide mb-2.5">
              <span>{interviews.length} experiences</span>
              <span className="text-[#777]">·</span>
              <span>{uniqueInterviewBrands.length} maisons</span>
              <span className="text-[#777]">·</span>
              <span>Last updated March 2026</span>
            </div>

            <div className="grid grid-cols-[1fr_290px] gap-6">
              <div>
                {/* Filters */}
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 stroke-[#666]" viewBox="0 0 24 24" fill="none" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search brand..."
                      value={interviewSearch}
                      onChange={e => setInterviewSearch(e.target.value)}
                      className="w-full bg-[#222] border border-[#2a2a2a] rounded-lg text-[12.5px] py-2 pl-10 pr-3.5 text-white placeholder-[#666] outline-none focus:border-[#1D9E75]"
                    />
                  </div>
                </div>

                <div className="flex gap-1.5 mb-2 flex-wrap">
                  <select value={interviewBrand} onChange={e => setInterviewBrand(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[12px] py-1.5 px-2.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Maisons</option>
                    {uniqueInterviewBrands.map(b => <option key={b} value={b}>{interviewBrandNameBySlug.get(b) || b}</option>)}
                  </select>
                  <select value={interviewDept} onChange={e => setInterviewDept(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[12px] py-1.5 px-2.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Departments</option>
                    {uniqueInterviewDepts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={interviewLevel} onChange={e => setInterviewLevel(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[12px] py-1.5 px-2.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Levels</option>
                    {uniqueInterviewLevels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select value={interviewYear} onChange={e => setInterviewYear(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[12px] py-1.5 px-2.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Years</option>
                    {uniqueInterviewYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={interviewDifficulty} onChange={e => setInterviewDifficulty(e.target.value)} className="bg-[#222] border border-[#2a2a2a] rounded-lg text-[12px] py-1.5 px-2.5 text-white outline-none focus:border-[#1D9E75]">
                    <option value="all">All Difficulty</option>
                    {[1, 2, 3, 4, 5].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="text-xs text-[#777] mb-2.5">{filteredInterviews.length} experiences</div>

                {/* Cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  {filteredInterviews.map(i => (
                    <div key={i.id} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-3.5 hover:border-[#3a3a3a] transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <div className="text-sm font-medium text-white mb-1">{i.brand_name}</div>
                          <div className="text-xs text-[#999]">{i.job_title}</div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(d => (
                            <div key={d} className={`w-2 h-2 rounded-full ${d <= i.difficulty ? 'bg-[#1D9E75]' : 'bg-[#2a2a2a]'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#777] mb-2">{i.department} · {i.seniority} · {i.location}</div>
                      <div className="flex gap-2 flex-wrap mb-2.5">
                        <span className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{i.interview_year}</span>
                        <span className="bg-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#999]">{i.number_of_rounds} rounds</span>
                        <span className="border border-[#2a2a2a] rounded px-2 py-1 text-[10px] text-[#777]">{i.interview_format}</span>
                      </div>
                      <div className="pt-2.5 border-t border-[#2a2a2a]">
                        {session ? (
                          <button
                            onClick={() => handleViewInterview(i)}
                            className="text-white text-xs hover:underline"
                          >
                            View Details →
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-[#777] text-xs">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2"/>
                              <path d="M7 11V7a5 5 0 0110 0v4"/>
                            </svg>
                            Sign in to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div>
                <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-3.5 mb-2.5">
                  <h3 className="text-base font-normal mb-2" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Contribute Your Experience</h3>
                  <p className="text-xs text-[#999] leading-relaxed mb-2.5">Contribute your interview experience | it takes one minute and strengthens the intelligence for everyone.</p>
                  <Link href="/contribute" className="block w-full bg-[#1D9E75] text-white text-[13px] font-semibold py-2 rounded-md text-center hover:bg-[#17855f] transition-colors">
                    Contribute
                  </Link>
                </div>

                <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-3.5 mb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-2.5">Top Interviewed Maisons</h3>
                  <div className="space-y-2 text-xs text-[#999]">
                    {uniqueInterviewBrands.slice(0, 5).map((b, i) => (
                      <div key={b}><span className="text-[#777] mr-2">{String(i + 1).padStart(2, '0')}</span>{interviewBrandNameBySlug.get(b) || b}</div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#222] border border-[#2a2a2a] rounded-lg p-3.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#999] mb-2.5">How It Works</h3>
                  <ol className="space-y-2">
                    {[
                      'Contribute your interview experience anonymously',
                      'Earn points upon approval by our team',
                      'Unlock detailed interview intelligence',
                    ].map((text, i) => (
                      <li key={i} className="flex gap-2.5 text-xs text-[#999] leading-relaxed">
                        <span className="text-[#777] font-semibold flex-shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <span>{text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interview Detail Modal */}
        {selectedInterview && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto py-10 px-4">
            <div className="bg-[#1a1a1a] max-w-3xl w-full rounded-xl">
              <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4 flex justify-between items-center rounded-t-xl">
                <h2 className="text-xl font-normal" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{selectedInterview.brand_name}</h2>
                <button onClick={() => setSelectedInterview(null)} className="text-[#999] hover:text-white text-2xl leading-none">×</button>
              </div>

              {loadingDetail ? (
                <div className="p-10 text-center text-[#999]">Loading details...</div>
              ) : interviewDetail ? (
                <div className="p-6 space-y-4">
                  <div className="bg-[#222] border border-[#2a2a2a] rounded-xl p-6">
                    <div className="text-base text-[#999] mb-4">{selectedInterview.job_title}</div>
                    <div className="flex gap-6 flex-wrap text-xs text-[#777]">
                      <span>{selectedInterview.department}</span>
                      <span>{selectedInterview.seniority}</span>
                      <span>{selectedInterview.location}</span>
                      <span>{selectedInterview.interview_year}</span>
                      <span>{selectedInterview.number_of_rounds} rounds</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(d => (
                          <div key={d} className={`w-2 h-2 rounded-full ${d <= selectedInterview.difficulty ? 'bg-[#1D9E75]' : 'bg-[#2a2a2a]'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {interviewDetail.sections?.map((section: any, i: number) => (
                    <div key={i} className="bg-[#222] border border-[#2a2a2a] rounded-xl p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-[#999] mb-3">{section.title}</h3>
                      <div className="text-sm text-[#ccc] leading-relaxed whitespace-pre-line">{section.content}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
