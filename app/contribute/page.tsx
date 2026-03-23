'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useMember } from '@/lib/auth-hooks'

const SENIORITY_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'intern', label: 'Intern' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid-level', label: 'Mid-Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'Vice President' },
  { value: 'c-suite', label: 'C-Suite' },
]

const CURRENCIES = [
  { value: 'EUR', label: '\u20ac EUR' },
  { value: 'GBP', label: '\u00a3 GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'AED', label: 'AED' },
  { value: 'SGD', label: 'SGD' },
  { value: 'HKD', label: 'HKD' },
  { value: 'JPY', label: '\u00a5 JPY' },
]

const DEPARTMENTS = [
  '', 'Retail', 'Marketing', 'Digital', 'Buying & Merchandising', 'Creative', 'Supply Chain',
  'Finance', 'HR', 'PR & Communications', 'E-commerce', 'Operations', 'General Management', 'Other',
]

const SIGNAL_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'hiring_wave', label: 'Hiring wave' },
  { value: 'restructuring', label: 'Restructuring' },
  { value: 'new_opening', label: 'New opening' },
  { value: 'leadership_change', label: 'Leadership change' },
  { value: 'other', label: 'Other' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Select source' },
  { value: 'firsthand', label: 'Firsthand' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'industry_contact', label: 'Industry contact' },
  { value: 'public_report', label: 'Public report' },
]

const STORAGE_KEY = 'joblux_contribute_draft'

type TabType = 'salary' | 'interview' | 'signal'

export default function ContributePage() {
  const { isAuthenticated, isLoading, isApproved, isNew, role } = useMember()
  const isBusiness = role === 'business'

  const [activeTab, setActiveTab] = useState<TabType>(isBusiness ? 'signal' : 'salary')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [restoredDraft, setRestoredDraft] = useState(false)
  const [points, setPoints] = useState<any>(null)

  // ─── Salary form state ───
  const [salary, setSalary] = useState({
    brand_name: '', job_title: '', department: '', seniority: '',
    city: '', country: '', base_salary: '', salary_max: '',
    salary_currency: 'EUR', bonus_amount: '',
    years_experience: '',
    is_anonymous: true,
  })

  // ─── Interview form state ───
  const [interview, setInterview] = useState({
    brand_name: '', job_title: '', city: '',
    number_of_rounds: '', interview_format: '',
    difficulty: '', questions_asked: '', tips: '',
    outcome: '', interview_year: new Date().getFullYear().toString(),
    is_anonymous: false,
  })

  // ─── Market Signal form state ───
  const [signal, setSignal] = useState({
    brand_name: '', signal_type: '', description: '',
    source: '', city: '',
  })

  // Set initial tab based on business tier
  useEffect(() => {
    if (!isLoading && isBusiness) setActiveTab('signal')
  }, [isLoading, isBusiness])

  // Fetch points for logged-in users
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/contributions/my-points')
        .then((r) => r.json())
        .then(setPoints)
        .catch(() => {})
    }
  }, [isAuthenticated, success])

  // Restore draft from sessionStorage
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
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        tab: activeTab, salary, interview, signal,
      }))
    } catch {}
  }

  const tabs = isBusiness
    ? [{ id: 'signal' as TabType, label: 'Market Signal', points: 10 }]
    : [
        { id: 'salary' as TabType, label: 'Salary Data', points: 10 },
        { id: 'interview' as TabType, label: 'Interview Experience', points: 10 },
        { id: 'signal' as TabType, label: 'Market Signal', points: 10 },
      ]

  const handleSubmit = async () => {
    setError('')
    setSuccess('')

    // Not logged in → save draft, show auth modal
    if (!isAuthenticated) {
      saveDraft()
      setShowAuthModal(true)
      return
    }

    // Logged in but new (no tier) → redirect to select-profile
    if (isNew) {
      saveDraft()
      window.location.href = '/select-profile'
      return
    }

    // Logged in but not approved
    if (!isApproved) {
      setError('Your profile is pending approval. You can submit once approved.')
      return
    }

    setSubmitting(true)

    try {
      let payload: any = {}

      if (activeTab === 'salary') {
        if (!salary.job_title || !salary.brand_name || !salary.city || !salary.country || !salary.base_salary) {
          throw new Error('Please fill in job title, maison, city, country, and base salary.')
        }
        payload = {
          contribution_type: 'salary_data',
          brand_name: salary.brand_name,
          brand_slug: salary.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          is_anonymous: salary.is_anonymous,
          data: {
            job_title: salary.job_title,
            department: salary.department,
            seniority: salary.seniority,
            city: salary.city,
            country: salary.country,
            base_salary: salary.base_salary,
            salary_currency: salary.salary_currency,
            bonus_amount: salary.bonus_amount,
            total_comp: salary.salary_max,
            years_experience: salary.years_experience,
          },
        }
      } else if (activeTab === 'interview') {
        if (!interview.brand_name || !interview.job_title || !interview.city || !interview.number_of_rounds || !interview.interview_year) {
          throw new Error('Please fill in maison, job title, city, number of rounds, and year.')
        }
        payload = {
          contribution_type: 'interview_experience',
          brand_name: interview.brand_name,
          brand_slug: interview.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          is_anonymous: interview.is_anonymous,
          data: {
            job_title: interview.job_title,
            location: interview.city,
            number_of_rounds: interview.number_of_rounds,
            interview_format: interview.interview_format,
            difficulty: interview.difficulty,
            questions_asked: interview.questions_asked,
            tips: interview.tips,
            outcome: interview.outcome,
            interview_year: interview.interview_year,
            process_description: interview.tips || interview.questions_asked || 'Contributed via form',
          },
        }
      } else if (activeTab === 'signal') {
        if (!signal.description) {
          throw new Error('Please describe the market signal.')
        }
        payload = {
          contribution_type: 'wikilux_insight',
          brand_name: signal.brand_name || 'Market Signal',
          brand_slug: (signal.brand_name || 'market-signal').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          is_anonymous: false,
          data: {
            insight_type: 'market_signal',
            title: `${SIGNAL_TYPES.find(s => s.value === signal.signal_type)?.label || 'Signal'}: ${signal.brand_name || 'Industry'}`,
            content: signal.description,
            location: signal.city,
            department: signal.source ? `Source: ${SOURCE_OPTIONS.find(s => s.value === signal.source)?.label || signal.source}` : null,
          },
        }
      }

      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSuccess('Thank you. Your contribution is under review by JOBLUX.')
      setRestoredDraft(false)

      // Reset forms
      setSalary({ brand_name: '', job_title: '', department: '', seniority: '', city: '', country: '', base_salary: '', salary_max: '', salary_currency: 'EUR', bonus_amount: '', years_experience: '', is_anonymous: true })
      setInterview({ brand_name: '', job_title: '', city: '', number_of_rounds: '', interview_format: '', difficulty: '', questions_asked: '', tips: '', outcome: '', interview_year: new Date().getFullYear().toString(), is_anonymous: false })
      setSignal({ brand_name: '', signal_type: '', description: '', source: '', city: '' })

    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* Header */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="jl-container py-12 md:py-16">
          <p className="jl-overline-gold mb-3">CONTRIBUTE</p>
          <h1 className="jl-serif text-3xl md:text-4xl text-[#1a1a1a] mb-3">
            Intelligence is built on contribution
          </h1>
          <p className="text-[#666] max-w-xl">
            JOBLUX is free because professionals contribute what they know. A salary figure. An interview experience. A market signal. Every contribution sharpens the intelligence for everyone.
          </p>
        </div>
      </section>

      <div className="jl-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Left: Sidebar ─── */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 sticky top-24">

              {isAuthenticated && points ? (
                <>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                    Your Contribution Points
                  </h2>
                  <div className="text-center mb-6">
                    <p className="jl-serif text-4xl text-[#1a1a1a]">{points.points}</p>
                    <p className="text-xs text-[#999] mt-1">points earned</p>
                  </div>
                  {points.next_level && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#999] mb-1">
                        <span>Next: {points.next_level.level}</span>
                        <span>{points.next_level.points_needed} pts to go</span>
                      </div>
                      <div className="w-full h-2 bg-[#e8e2d8] rounded-full overflow-hidden">
                        <div className="h-full bg-[#a58e28] rounded-full transition-all" style={{ width: `${Math.min(100, (points.points / points.next_level.points_required) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-[#e8e2d8]">
                    <p className="text-xs text-[#999] mb-2">Your Contributions</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-[#666]">Approved</span><span className="text-[#1a1a1a] font-medium">{points.summary?.approved || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#666]">Pending</span><span className="text-[#a58e28]">{points.summary?.pending || 0}</span></div>
                      <div className="flex justify-between"><span className="text-[#666]">Total</span><span className="text-[#1a1a1a]">{points.summary?.total || 0}</span></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                    How it works
                  </h2>
                  <div className="space-y-4 text-sm text-[#666]">
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#a58e28]/10 text-[#a58e28] text-xs font-semibold flex items-center justify-center flex-shrink-0">1</span>
                      <span>Fill out the form with your data</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#a58e28]/10 text-[#a58e28] text-xs font-semibold flex items-center justify-center flex-shrink-0">2</span>
                      <span>Create a free profile to submit</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#a58e28]/10 text-[#a58e28] text-xs font-semibold flex items-center justify-center flex-shrink-0">3</span>
                      <span>Your contribution is reviewed by JOBLUX</span>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#e8e2d8]">
                    <p className="text-xs text-[#999] mb-2">Points Per Contribution</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-[#666]">Salary data</span><span className="text-[#a58e28]">+10 pts</span></div>
                      <div className="flex justify-between"><span className="text-[#666]">Interview experience</span><span className="text-[#a58e28]">+10 pts</span></div>
                      <div className="flex justify-between"><span className="text-[#666]">Market signal</span><span className="text-[#a58e28]">+10 pts</span></div>
                    </div>
                  </div>
                </>
              )}

              {/* Business CTA */}
              {isBusiness && (
                <div className="mt-6 pt-4 border-t border-[#e8e2d8]">
                  <Link
                    href="/admin/briefs/new"
                    className="block text-center border border-[#a58e28] text-[#a58e28] text-xs font-semibold tracking-[0.1em] uppercase px-4 py-3 hover:bg-[#a58e28] hover:text-white transition-colors"
                  >
                    Submit a Search Assignment &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ─── Right: Contribution Form ─── */}
          <div className="lg:col-span-2 order-1 lg:order-2">

            {/* Restored draft banner */}
            {restoredDraft && (
              <div className="mb-6 p-4 bg-[#a58e28]/10 border border-[#a58e28] text-sm text-[#1a1a1a] rounded-sm">
                Your contribution is ready &mdash; confirm and submit.
              </div>
            )}

            {/* Success / Error */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-[#e8e2d8] mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError(''); setSuccess('') }}
                  className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#a58e28] text-[#1a1a1a] font-medium'
                      : 'border-transparent text-[#999] hover:text-[#666]'
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs text-[#a58e28]">+{tab.points}</span>
                </button>
              ))}
            </div>

            {/* ─── Salary Data Form ─── */}
            {activeTab === 'salary' && !isBusiness && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <p className="text-xs text-[#999] mb-2">All salary data is displayed anonymously. Your identity is never shared.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Job Title <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Retail Director" value={salary.job_title} onChange={(e) => setSalary({ ...salary, job_title: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Brand / Maison <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Chanel, Herm\u00e8s" value={salary.brand_name} onChange={(e) => setSalary({ ...salary, brand_name: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">City <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Paris" value={salary.city} onChange={(e) => setSalary({ ...salary, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Country <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. France" value={salary.country} onChange={(e) => setSalary({ ...salary, country: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="jl-label">Currency <span className="text-red-500">*</span></label>
                    <select className="jl-input w-full" value={salary.salary_currency} onChange={(e) => setSalary({ ...salary, salary_currency: e.target.value })}>
                      {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Salary Min <span className="text-red-500">*</span></label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 65000" value={salary.base_salary} onChange={(e) => setSalary({ ...salary, base_salary: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Salary Max</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 85000" value={salary.salary_max} onChange={(e) => setSalary({ ...salary, salary_max: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Bonus / Commission</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 15000" value={salary.bonus_amount} onChange={(e) => setSalary({ ...salary, bonus_amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Seniority</label>
                    <select className="jl-input w-full" value={salary.seniority} onChange={(e) => setSalary({ ...salary, seniority: e.target.value })}>
                      {SENIORITY_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Department</label>
                    <select className="jl-input w-full" value={salary.department} onChange={(e) => setSalary({ ...salary, department: e.target.value })}>
                      {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || 'Select department'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Years in Role</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 3" value={salary.years_experience} onChange={(e) => setSalary({ ...salary, years_experience: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Interview Experience Form ─── */}
            {activeTab === 'interview' && !isBusiness && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Brand / Maison <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Chanel, Herm\u00e8s" value={interview.brand_name} onChange={(e) => setInterview({ ...interview, brand_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Job Title Applied For <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Store Director" value={interview.job_title} onChange={(e) => setInterview({ ...interview, job_title: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">City <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Paris" value={interview.city} onChange={(e) => setInterview({ ...interview, city: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Year of Interview <span className="text-red-500">*</span></label>
                    <input type="number" className="jl-input w-full" value={interview.interview_year} onChange={(e) => setInterview({ ...interview, interview_year: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="jl-label">Number of Rounds <span className="text-red-500">*</span></label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 4" value={interview.number_of_rounds} onChange={(e) => setInterview({ ...interview, number_of_rounds: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Format</label>
                    <select className="jl-input w-full" value={interview.interview_format} onChange={(e) => setInterview({ ...interview, interview_format: e.target.value })}>
                      <option value="">Select</option>
                      <option value="phone">Phone</option>
                      <option value="video">Video</option>
                      <option value="in-person">In-person</option>
                      <option value="case_study">Case study</option>
                      <option value="panel">Panel</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Difficulty (1-5)</label>
                    <select className="jl-input w-full" value={interview.difficulty} onChange={(e) => setInterview({ ...interview, difficulty: e.target.value })}>
                      <option value="">Select</option>
                      <option value="1">1 &mdash; Easy</option>
                      <option value="2">2 &mdash; Fairly easy</option>
                      <option value="3">3 &mdash; Moderate</option>
                      <option value="4">4 &mdash; Challenging</option>
                      <option value="5">5 &mdash; Very challenging</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="jl-label">Questions Asked</label>
                  <textarea className="jl-input w-full min-h-[80px]" placeholder="Notable or challenging questions you were asked..." value={interview.questions_asked} onChange={(e) => setInterview({ ...interview, questions_asked: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Tips / Advice</label>
                  <textarea className="jl-input w-full min-h-[80px]" placeholder="What would you tell someone interviewing at this maison?" value={interview.tips} onChange={(e) => setInterview({ ...interview, tips: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Outcome</label>
                  <select className="jl-input w-full" value={interview.outcome} onChange={(e) => setInterview({ ...interview, outcome: e.target.value })}>
                    <option value="">Select</option>
                    <option value="offered">Offer received</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrew">Withdrew</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={interview.is_anonymous} onChange={(e) => setInterview({ ...interview, is_anonymous: e.target.checked })} className="accent-[#a58e28]" />
                  <span className="text-sm text-[#666]">Post anonymously</span>
                </label>
              </div>
            )}

            {/* ─── Market Signal Form ─── */}
            {activeTab === 'signal' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Brand / Maison</label>
                    <input className="jl-input w-full" placeholder="e.g. Chanel (optional)" value={signal.brand_name} onChange={(e) => setSignal({ ...signal, brand_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Signal Type</label>
                    <select className="jl-input w-full" value={signal.signal_type} onChange={(e) => setSignal({ ...signal, signal_type: e.target.value })}>
                      {SIGNAL_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="jl-label">Description <span className="text-red-500">*</span></label>
                  <textarea className="jl-input w-full min-h-[120px]" placeholder="Describe the market signal &mdash; what you know, when, and why it matters..." value={signal.description} onChange={(e) => setSignal({ ...signal, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Source</label>
                    <select className="jl-input w-full" value={signal.source} onChange={(e) => setSignal({ ...signal, source: e.target.value })}>
                      {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">City / Region</label>
                    <input className="jl-input w-full" placeholder="e.g. Paris, EMEA" value={signal.city} onChange={(e) => setSignal({ ...signal, city: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="jl-btn jl-btn-primary"
              >
                {submitting ? 'Submitting\u2026' : 'Submit Contribution'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Auth Modal ─── */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white max-w-md w-full p-8 rounded-sm shadow-xl">
            <h2 className="jl-serif text-xl text-[#1a1a1a] mb-2 text-center">
              To submit your contribution, create your JOBLUX profile.
            </h2>
            <p className="text-sm text-[#666] text-center mb-6">
              Your data has been saved. Sign in and you&rsquo;ll return here to submit.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/contribute' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white text-[#1a1a1a] text-sm font-medium rounded-sm border border-[#e8e6df] hover:bg-[#f5f4f0] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.04 24.04 0 000 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                Continue with Google
              </button>
              <button
                onClick={() => signIn('linkedin', { callbackUrl: '/contribute' })}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0A66C2] text-white text-sm font-medium rounded-sm hover:bg-[#004182] transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                Continue with LinkedIn
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="block mx-auto mt-4 text-sm text-[#999] hover:text-[#1a1a1a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
