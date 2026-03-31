'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useMember } from '@/lib/auth-hooks'

const SENIORITY_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'Vice President' },
  { value: 'c-suite', label: 'C-Suite' },
]

const CURRENCIES = [
  { value: 'EUR', label: '\u20ac EUR' }, { value: 'GBP', label: '\u00a3 GBP' },
  { value: 'USD', label: '$ USD' }, { value: 'CHF', label: 'CHF' },
  { value: 'AED', label: 'AED' }, { value: 'SGD', label: 'SGD' },
  { value: 'HKD', label: 'HKD' }, { value: 'JPY', label: '\u00a5 JPY' },
]

const DEPARTMENTS = [
  '', 'Retail', 'Marketing', 'Digital', 'Buying & Merchandising', 'Creative', 'Supply Chain',
  'Finance', 'HR', 'PR & Communications', 'E-commerce', 'Operations', 'General Management', 'Other',
]

const SIGNAL_TYPES = [
  { value: '', label: 'Select type' }, { value: 'hiring_wave', label: 'Hiring wave' },
  { value: 'restructuring', label: 'Restructuring' }, { value: 'new_opening', label: 'New opening' },
  { value: 'leadership_change', label: 'Leadership change' }, { value: 'other', label: 'Other' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Select source' }, { value: 'firsthand', label: 'Firsthand' },
  { value: 'colleague', label: 'Colleague' }, { value: 'industry_contact', label: 'Industry contact' },
  { value: 'public_report', label: 'Public report' },
]

const STORAGE_KEY = 'joblux_contribute_draft'
type TabType = 'salary' | 'interview' | 'signal'

export default function ContributePage() {
  const { isAuthenticated, isLoading, isApproved, isNew } = useMember()

  const [activeTab, setActiveTab] = useState<TabType>('salary')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [restoredDraft, setRestoredDraft] = useState(false)
  const [points, setPoints] = useState<any>(null)

  const [salary, setSalary] = useState({
    brand_name: '', job_title: '', department: '', seniority: '',
    city: '', country: '', base_salary: '', salary_max: '',
    salary_currency: 'EUR', bonus_amount: '', years_experience: '',
  })

  const [interview, setInterview] = useState({
    brand_name: '', job_title: '', city: '',
    number_of_rounds: '', interview_format: '',
    difficulty: '', questions_asked: '', tips: '',
    outcome: '', interview_year: new Date().getFullYear().toString(),
  })

  const [signal, setSignal] = useState({
    brand_name: '', signal_type: '', description: '', source: '', city: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/contributions/my-points').then(r => r.json()).then(setPoints).catch(() => {})
    }
  }, [isAuthenticated, success])

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.tab) setActiveTab(draft.tab)
        if (draft.salary) setSalary(draft.salary)
        if (draft.interview) setInterview(draft.interview)
        if (draft.signal) setSignal(draft.signal)
        setRestoredDraft(true)
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch {}
  }, [])

  const saveDraft = () => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tab: activeTab, salary, interview, signal })) } catch {}
  }

  const tabs = [
    { id: 'salary' as TabType, label: 'Salary data', points: 10 },
    { id: 'interview' as TabType, label: 'Interview experience', points: 10 },
    { id: 'signal' as TabType, label: 'Market signal', points: 10 },
  ]

  const handleSubmit = async () => {
    setError(''); setSuccess('')
    if (!isAuthenticated) { saveDraft(); setShowAuthModal(true); return }
    if (isNew) { saveDraft(); window.location.href = '/select-profile'; return }
    if (!isApproved) { setError('Your profile is pending approval. You can submit once approved.'); return }

    setSubmitting(true)
    try {
      let payload: any = {}
      if (activeTab === 'salary') {
        if (!salary.job_title || !salary.brand_name || !salary.city || !salary.country || !salary.base_salary) throw new Error('Please fill in job title, maison, city, country, and base salary.')
        payload = { contribution_type: 'salary_data', brand_name: salary.brand_name, brand_slug: salary.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), is_anonymous: true, data: { job_title: salary.job_title, department: salary.department, seniority: salary.seniority, city: salary.city, country: salary.country, base_salary: salary.base_salary, salary_currency: salary.salary_currency, bonus_amount: salary.bonus_amount, total_comp: salary.salary_max, years_experience: salary.years_experience } }
      } else if (activeTab === 'interview') {
        if (!interview.brand_name || !interview.job_title || !interview.city || !interview.number_of_rounds || !interview.interview_year) throw new Error('Please fill in maison, job title, city, number of rounds, and year.')
        payload = { contribution_type: 'interview_experience', brand_name: interview.brand_name, brand_slug: interview.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), is_anonymous: true, data: { job_title: interview.job_title, location: interview.city, number_of_rounds: interview.number_of_rounds, interview_format: interview.interview_format, difficulty: interview.difficulty, questions_asked: interview.questions_asked, tips: interview.tips, outcome: interview.outcome, interview_year: interview.interview_year, process_description: interview.tips || interview.questions_asked || 'Contributed via form' } }
      } else if (activeTab === 'signal') {
        if (!signal.description) throw new Error('Please describe the market signal.')
        payload = { contribution_type: 'wikilux_insight', brand_name: signal.brand_name || 'Market Signal', brand_slug: (signal.brand_name || 'market-signal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), is_anonymous: true, data: { insight_type: 'market_signal', title: `${SIGNAL_TYPES.find(s => s.value === signal.signal_type)?.label || 'Signal'}: ${signal.brand_name || 'Industry'}`, content: signal.description, location: signal.city, department: signal.source ? `Source: ${SOURCE_OPTIONS.find(s => s.value === signal.source)?.label || signal.source}` : null } }
      }

      const res = await fetch('/api/contributions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to submit') }

      setSuccess('Thank you. Your contribution is under review by JOBLUX.')
      setRestoredDraft(false)
      setSalary({ brand_name: '', job_title: '', department: '', seniority: '', city: '', country: '', base_salary: '', salary_max: '', salary_currency: 'EUR', bonus_amount: '', years_experience: '' })
      setInterview({ brand_name: '', job_title: '', city: '', number_of_rounds: '', interview_format: '', difficulty: '', questions_asked: '', tips: '', outcome: '', interview_year: new Date().getFullYear().toString() })
      setSignal({ brand_name: '', signal_type: '', description: '', source: '', city: '' })
    } catch (err: any) { setError(err.message) } finally { setSubmitting(false) }
  }

  const ic = 'w-full bg-[#3d3d3d] border border-[#4a4a4a] rounded-md px-3.5 py-2.5 text-[13px] text-[#ccc] placeholder-[#666] outline-none focus:border-[#777] transition-colors'
  const sc = `${ic} appearance-none`
  const lc = 'text-[11px] text-[#999] mb-1.5 block'

  return (
    <main className="min-h-screen bg-[#333]">
      {/* Header */}
      <section className="border-b border-[#444]">
        <div className="max-w-[1200px] mx-auto px-7 py-10">
          <h1 className="text-[28px] font-normal text-white mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Intelligence is built on contribution
          </h1>
          <p className="text-[14px] text-[#999] max-w-xl leading-relaxed">
            JOBLUX is free because professionals contribute what they know. A salary figure. An interview experience. A market signal. Every contribution sharpens the intelligence for everyone.
          </p>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-7 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-8">

          {/* ─── Main: Form ─── */}
          <div>
            {restoredDraft && (
              <div className="mb-5 p-4 bg-[rgba(165,142,40,0.08)] border border-[rgba(165,142,40,0.2)] text-[13px] text-[#ccc] rounded-lg">
                Your contribution is ready — confirm and submit.
              </div>
            )}
            {success && (
              <div className="mb-5 p-4 bg-[rgba(29,158,117,0.08)] border border-[rgba(29,158,117,0.2)] text-[13px] text-[#ccc] rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-5 p-4 bg-[rgba(226,75,74,0.08)] border border-[rgba(226,75,74,0.2)] text-[13px] text-[#E24B4A] rounded-lg">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-[#444] mb-5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
                  className={`px-4 py-3 text-[13px] transition-colors border-b-2 -mb-px ${activeTab === tab.id ? 'border-white text-white font-medium' : 'border-transparent text-[#777] hover:text-[#999]'}`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-[11px] text-[#a58e28]">+{tab.points}</span>
                </button>
              ))}
            </div>

            {/* ─── Salary Form ─── */}
            {activeTab === 'salary' && (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-5 space-y-3">
                <p className="text-[11px] text-[#999] mb-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Your contribution is anonymous. Only JOBLUX can verify the source.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Job title <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. Retail Director" value={salary.job_title} onChange={e => setSalary({ ...salary, job_title: e.target.value })} /></div>
                  <div><span className={lc}>Brand / Maison <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. Chanel" value={salary.brand_name} onChange={e => setSalary({ ...salary, brand_name: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>City <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. Paris" value={salary.city} onChange={e => setSalary({ ...salary, city: e.target.value })} /></div>
                  <div><span className={lc}>Country <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. France" value={salary.country} onChange={e => setSalary({ ...salary, country: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><span className={lc}>Currency <span className="text-[#E24B4A]">*</span></span><select className={sc} value={salary.salary_currency} onChange={e => setSalary({ ...salary, salary_currency: e.target.value })}>{CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                  <div><span className={lc}>Salary min <span className="text-[#E24B4A]">*</span></span><input type="number" className={ic} placeholder="65000" value={salary.base_salary} onChange={e => setSalary({ ...salary, base_salary: e.target.value })} /></div>
                  <div><span className={lc}>Salary max</span><input type="number" className={ic} placeholder="85000" value={salary.salary_max} onChange={e => setSalary({ ...salary, salary_max: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Bonus / Commission</span><input type="number" className={ic} placeholder="15000" value={salary.bonus_amount} onChange={e => setSalary({ ...salary, bonus_amount: e.target.value })} /></div>
                  <div><span className={lc}>Seniority</span><select className={sc} value={salary.seniority} onChange={e => setSalary({ ...salary, seniority: e.target.value })}>{SENIORITY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Department</span><select className={sc} value={salary.department} onChange={e => setSalary({ ...salary, department: e.target.value })}>{DEPARTMENTS.map(d => <option key={d} value={d}>{d || 'Select department'}</option>)}</select></div>
                  <div><span className={lc}>Years in role</span><input type="number" className={ic} placeholder="3" value={salary.years_experience} onChange={e => setSalary({ ...salary, years_experience: e.target.value })} /></div>
                </div>
              </div>
            )}

            {/* ─── Interview Form ─── */}
            {activeTab === 'interview' && (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-5 space-y-3">
                <p className="text-[11px] text-[#999] mb-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={1.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Your contribution is anonymous. Only JOBLUX can verify the source.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Brand / Maison <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. Cartier" value={interview.brand_name} onChange={e => setInterview({ ...interview, brand_name: e.target.value })} /></div>
                  <div><span className={lc}>Job title applied for <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. Boutique Director" value={interview.job_title} onChange={e => setInterview({ ...interview, job_title: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>City <span className="text-[#E24B4A]">*</span></span><input className={ic} placeholder="e.g. London" value={interview.city} onChange={e => setInterview({ ...interview, city: e.target.value })} /></div>
                  <div><span className={lc}>Year of interview <span className="text-[#E24B4A]">*</span></span><input type="number" className={ic} value={interview.interview_year} onChange={e => setInterview({ ...interview, interview_year: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><span className={lc}>Rounds <span className="text-[#E24B4A]">*</span></span><input type="number" className={ic} placeholder="4" value={interview.number_of_rounds} onChange={e => setInterview({ ...interview, number_of_rounds: e.target.value })} /></div>
                  <div><span className={lc}>Format</span><select className={sc} value={interview.interview_format} onChange={e => setInterview({ ...interview, interview_format: e.target.value })}><option value="">Select</option><option value="phone">Phone</option><option value="video">Video</option><option value="in-person">In-person</option><option value="case_study">Case study</option><option value="panel">Panel</option><option value="mixed">Mixed</option></select></div>
                  <div><span className={lc}>Difficulty (1–5)</span><select className={sc} value={interview.difficulty} onChange={e => setInterview({ ...interview, difficulty: e.target.value })}><option value="">Select</option><option value="1">1 — Easy</option><option value="2">2 — Fairly easy</option><option value="3">3 — Moderate</option><option value="4">4 — Challenging</option><option value="5">5 — Very challenging</option></select></div>
                </div>
                <div><span className={lc}>Questions asked</span><textarea className={`${ic} min-h-[80px]`} placeholder="Notable or challenging questions you were asked..." value={interview.questions_asked} onChange={e => setInterview({ ...interview, questions_asked: e.target.value })} /></div>
                <div><span className={lc}>Tips / Advice</span><textarea className={`${ic} min-h-[80px]`} placeholder="What would you tell someone interviewing at this maison?" value={interview.tips} onChange={e => setInterview({ ...interview, tips: e.target.value })} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Outcome</span><select className={sc} value={interview.outcome} onChange={e => setInterview({ ...interview, outcome: e.target.value })}><option value="">Select</option><option value="offered">Offer received</option><option value="rejected">Rejected</option><option value="withdrew">Withdrew</option><option value="pending">Pending</option></select></div>
                  <div />
                </div>
              </div>
            )}

            {/* ─── Market Signal Form ─── */}
            {activeTab === 'signal' && (
              <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-5 space-y-3">
                <p className="text-[11px] text-[#999] mb-3 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
                  Share what you are hearing. All signals are reviewed before publishing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Brand / Maison</span><input className={ic} placeholder="e.g. Gucci, LVMH Group" value={signal.brand_name} onChange={e => setSignal({ ...signal, brand_name: e.target.value })} /></div>
                  <div><span className={lc}>Signal type</span><select className={sc} value={signal.signal_type} onChange={e => setSignal({ ...signal, signal_type: e.target.value })}>{SIGNAL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                </div>
                <div><span className={lc}>Description <span className="text-[#E24B4A]">*</span></span><textarea className={`${ic} min-h-[110px]`} placeholder="Describe the market signal — what you know, when, and why it matters..." value={signal.description} onChange={e => setSignal({ ...signal, description: e.target.value })} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className={lc}>Source</span><select className={sc} value={signal.source} onChange={e => setSignal({ ...signal, source: e.target.value })}>{SOURCE_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                  <div><span className={lc}>City / Region</span><input className={ic} placeholder="e.g. Paris, EMEA" value={signal.city} onChange={e => setSignal({ ...signal, city: e.target.value })} /></div>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-white text-[#333] text-[13px] font-medium rounded-md hover:bg-[#e0e0e0] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting\u2026' : 'Submit contribution'}
              </button>
            </div>
          </div>

          {/* ─── Sidebar ─── */}
          <div>
            <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-5 sticky top-24">
              {isAuthenticated && points ? (
                <>
                  <p className="text-[10px] tracking-[1.5px] text-[#bbb] uppercase mb-4">Your points</p>
                  <div className="text-center mb-4">
                    <p className="text-[32px] font-normal text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{points.points}</p>
                    <p className="text-[11px] text-[#999] mt-1">points earned</p>
                  </div>
                  {points.next_level && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-[#777] mb-1">
                        <span>Next: {points.next_level.level}</span>
                        <span>{points.next_level.points_needed} pts to go</span>
                      </div>
                      <div className="w-full h-1 bg-[#444] rounded-full overflow-hidden">
                        <div className="h-full bg-[#a58e28] rounded-full transition-all" style={{ width: `${Math.min(100, (points.points / points.next_level.points_required) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-[#3a3a3a]">
                    <p className="text-[10px] text-[#999] mb-2">Your contributions</p>
                    <div className="space-y-1 text-[12px]">
                      <div className="flex justify-between"><span className="text-[#999]">Approved</span><span className="text-[#ccc]">{points.summary?.approved || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#999]">Pending</span><span className="text-[#a58e28]">{points.summary?.pending || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#999]">Total</span><span className="text-[#ccc]">{points.summary?.total || 0}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[10px] tracking-[1.5px] text-[#bbb] uppercase mb-4">How it works</p>
                  <div className="space-y-3 text-[12px] text-[#999] mb-5">
                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[rgba(165,142,40,0.1)] text-[#a58e28] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">1</span>
                      <span>Fill out the form with your data</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[rgba(165,142,40,0.1)] text-[#a58e28] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">2</span>
                      <span>Sign in to submit</span>
                    </div>
                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-[rgba(165,142,40,0.1)] text-[#a58e28] text-[10px] font-semibold flex items-center justify-center flex-shrink-0">3</span>
                      <span>JOBLUX reviews and publishes</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#3a3a3a]">
                    <p className="text-[10px] text-[#999] mb-2">Points per contribution</p>
                    <div className="space-y-1 text-[12px]">
                      <div className="flex justify-between"><span className="text-[#999]">Salary data</span><span className="text-[#a58e28]">+10 pts</span></div>
                      <div className="flex justify-between"><span className="text-[#999]">Interview experience</span><span className="text-[#a58e28]">+10 pts</span></div>
                      <div className="flex justify-between"><span className="text-[#999]">Market signal</span><span className="text-[#a58e28]">+10 pts</span></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ─── Auth Modal ─── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] max-w-md w-full p-8 rounded-xl">
            <h2 className="text-[18px] font-medium text-white mb-2 text-center">
              Sign in to submit
            </h2>
            <p className="text-[13px] text-[#999] text-center mb-6 leading-relaxed">
              Your data has been saved. Sign in and you&apos;ll return here to submit.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/contribute' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#3d3d3d] text-[#ccc] text-[13px] font-medium rounded-lg border border-[#4a4a4a] hover:border-[#666] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.04 24.04 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="block mx-auto mt-5 text-[12px] text-[#777] hover:text-[#ccc] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
