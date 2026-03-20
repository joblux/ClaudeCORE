'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  { value: 'EUR', label: '€ EUR' },
  { value: 'GBP', label: '£ GBP' },
  { value: 'USD', label: '$ USD' },
  { value: 'CHF', label: 'CHF' },
  { value: 'AED', label: 'AED' },
  { value: 'SGD', label: 'SGD' },
  { value: 'HKD', label: 'HKD' },
  { value: 'JPY', label: '¥ JPY' },
]

const INSIGHT_TYPES = [
  { value: 'culture', label: 'Company Culture' },
  { value: 'interview_tips', label: 'Interview Tips' },
  { value: 'career_path', label: 'Career Paths' },
  { value: 'management_style', label: 'Management Style' },
  { value: 'work_life_balance', label: 'Work-Life Balance' },
  { value: 'other', label: 'Other' },
]

type TabType = 'wikilux' | 'salary' | 'interview'

export default function ContributePage() {
  const [activeTab, setActiveTab] = useState<TabType>('wikilux')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [points, setPoints] = useState<any>(null)

  // Fetch member points on load
  useEffect(() => {
    fetch('/api/contributions/my-points')
      .then((res) => res.json())
      .then(setPoints)
      .catch(() => {})
  }, [success])

  const tabs = [
    { id: 'wikilux' as TabType, label: 'WikiLux Insight', points: 5 },
    { id: 'salary' as TabType, label: 'Salary Data', points: 10 },
    { id: 'interview' as TabType, label: 'Interview Experience', points: 10 },
  ]

  // ─── WikiLux form state ───
  const [wiki, setWiki] = useState({
    brand_name: '', insight_type: 'culture', title: '', content: '',
    role_held: '', years_at_maison: '', department: '', location: '',
    is_anonymous: false,
  })

  // ─── Salary form state ───
  const [salary, setSalary] = useState({
    brand_name: '', job_title: '', department: '', seniority: '',
    city: '', country: '', base_salary: '', salary_currency: 'EUR',
    bonus_amount: '', bonus_type: '', total_comp: '', benefits_notes: '',
    year_of_data: new Date().getFullYear().toString(),
    employment_type: 'permanent', years_experience: '',
    is_anonymous: true,
  })

  // ─── Interview form state ───
  const [interview, setInterview] = useState({
    brand_name: '', job_title: '', department: '', seniority: '',
    location: '', interview_year: new Date().getFullYear().toString(),
    process_duration: '', number_of_rounds: '',
    interview_format: '', process_description: '',
    questions_asked: '', tips: '', outcome: '', difficulty: '',
    overall_experience: '', is_anonymous: false,
  })

  const handleSubmit = async () => {
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      let payload: any = {}

      if (activeTab === 'wikilux') {
        if (!wiki.brand_name || !wiki.content) {
          throw new Error('Please fill in the maison name and your insight.')
        }
        payload = {
          contribution_type: 'wikilux_insight',
          brand_name: wiki.brand_name,
          brand_slug: wiki.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          is_anonymous: wiki.is_anonymous,
          data: {
            insight_type: wiki.insight_type,
            title: wiki.title,
            content: wiki.content,
            role_held: wiki.role_held,
            years_at_maison: wiki.years_at_maison,
            department: wiki.department,
            location: wiki.location,
          },
        }
      } else if (activeTab === 'salary') {
        if (!salary.brand_name || !salary.job_title || !salary.base_salary || !salary.city || !salary.country) {
          throw new Error('Please fill in the maison, job title, base salary, city and country.')
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
            bonus_type: salary.bonus_type,
            total_comp: salary.total_comp,
            benefits_notes: salary.benefits_notes,
            year_of_data: salary.year_of_data,
            employment_type: salary.employment_type,
            years_experience: salary.years_experience,
          },
        }
      } else if (activeTab === 'interview') {
        if (!interview.brand_name || !interview.job_title || !interview.process_description) {
          throw new Error('Please fill in the maison, job title and process description.')
        }
        payload = {
          contribution_type: 'interview_experience',
          brand_name: interview.brand_name,
          brand_slug: interview.brand_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          is_anonymous: interview.is_anonymous,
          data: {
            job_title: interview.job_title,
            department: interview.department,
            seniority: interview.seniority,
            location: interview.location,
            interview_year: interview.interview_year,
            process_duration: interview.process_duration,
            number_of_rounds: interview.number_of_rounds,
            interview_format: interview.interview_format,
            process_description: interview.process_description,
            questions_asked: interview.questions_asked,
            tips: interview.tips,
            outcome: interview.outcome,
            difficulty: interview.difficulty,
            overall_experience: interview.overall_experience,
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

      setSuccess('Thank you! Your contribution has been submitted for review. Points will be awarded once approved.')

      // Reset form
      if (activeTab === 'wikilux') setWiki({ brand_name: '', insight_type: 'culture', title: '', content: '', role_held: '', years_at_maison: '', department: '', location: '', is_anonymous: false })
      if (activeTab === 'salary') setSalary({ brand_name: '', job_title: '', department: '', seniority: '', city: '', country: '', base_salary: '', salary_currency: 'EUR', bonus_amount: '', bonus_type: '', total_comp: '', benefits_notes: '', year_of_data: new Date().getFullYear().toString(), employment_type: 'permanent', years_experience: '', is_anonymous: true })
      if (activeTab === 'interview') setInterview({ brand_name: '', job_title: '', department: '', seniority: '', location: '', interview_year: new Date().getFullYear().toString(), process_duration: '', number_of_rounds: '', interview_format: '', process_description: '', questions_asked: '', tips: '', outcome: '', difficulty: '', overall_experience: '', is_anonymous: false })

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
          <p className="jl-overline-gold mb-3">Share Your Intelligence</p>
          <h1 className="jl-serif text-3xl md:text-4xl text-[#1a1a1a] mb-3">
            Contribute to JOBLUX
          </h1>
          <p className="text-[#666] max-w-xl">
            JOBLUX is built by the luxury community. Share your insider knowledge — salary data, interview experiences, brand insights — and unlock deeper intelligence from fellow professionals.
          </p>
        </div>
      </section>

      <div className="jl-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── Left: Points Dashboard ─── */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 sticky top-24">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                Your Contribution Points
              </h2>

              {points ? (
                <>
                  <div className="text-center mb-6">
                    <p className="jl-serif text-4xl text-[#1a1a1a]">{points.points}</p>
                    <p className="text-xs text-[#999] mt-1">points earned</p>
                  </div>

                  {/* Current level */}
                  <div className="mb-4 p-3 bg-[#fafaf5] border border-[#e8e2d8] rounded-sm">
                    <p className="text-xs text-[#999]">Current Level</p>
                    <p className="text-sm font-medium text-[#1a1a1a] capitalize">{points.access_level}</p>
                  </div>

                  {/* Next level */}
                  {points.next_level && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#999] mb-1">
                        <span>Next: {points.next_level.level}</span>
                        <span>{points.next_level.points_needed} pts to go</span>
                      </div>
                      <div className="w-full h-2 bg-[#e8e2d8] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#a58e28] rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (points.points / points.next_level.points_required) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#999] mt-2">
                        Unlocks: {points.next_level.unlocks}
                      </p>
                    </div>
                  )}

                  {/* Contribution summary */}
                  <div className="mt-6 pt-4 border-t border-[#e8e2d8]">
                    <p className="text-xs text-[#999] mb-2">Your Contributions</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#666]">Approved</span>
                        <span className="text-[#1a1a1a] font-medium">{points.summary.approved}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Pending review</span>
                        <span className="text-[#a58e28]">{points.summary.pending}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Total</span>
                        <span className="text-[#1a1a1a]">{points.summary.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Points guide */}
                  <div className="mt-6 pt-4 border-t border-[#e8e2d8]">
                    <p className="text-xs text-[#999] mb-2">Points Per Contribution</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#666]">WikiLux insight</span>
                        <span className="text-[#a58e28]">+5 pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Salary data</span>
                        <span className="text-[#a58e28]">+10 pts</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Interview experience</span>
                        <span className="text-[#a58e28]">+10 pts</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#999]">Loading…</p>
              )}
            </div>
          </div>

          {/* ─── Right: Contribution Form ─── */}
          <div className="lg:col-span-2 order-1 lg:order-2">
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

            {/* ─── WikiLux Insight Form ─── */}
            {activeTab === 'wikilux' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <div>
                  <label className="jl-label">Maison <span className="text-red-500">*</span></label>
                  <input className="jl-input w-full" placeholder="e.g. Chanel, Hermès, Louis Vuitton" value={wiki.brand_name} onChange={(e) => setWiki({ ...wiki, brand_name: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Insight Type</label>
                  <select className="jl-input w-full" value={wiki.insight_type} onChange={(e) => setWiki({ ...wiki, insight_type: e.target.value })}>
                    {INSIGHT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="jl-label">Title</label>
                  <input className="jl-input w-full" placeholder="e.g. What it's really like to work at Chanel Retail" value={wiki.title} onChange={(e) => setWiki({ ...wiki, title: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Your Insight <span className="text-red-500">*</span></label>
                  <textarea className="jl-input w-full min-h-[150px]" placeholder="Share your insider knowledge about this maison — culture, career opportunities, management style, what makes it unique…" value={wiki.content} onChange={(e) => setWiki({ ...wiki, content: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Your Role</label>
                    <input className="jl-input w-full" placeholder="e.g. Store Director" value={wiki.role_held} onChange={(e) => setWiki({ ...wiki, role_held: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Years at Maison</label>
                    <input className="jl-input w-full" placeholder="e.g. 2018–2022" value={wiki.years_at_maison} onChange={(e) => setWiki({ ...wiki, years_at_maison: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Department</label>
                    <input className="jl-input w-full" placeholder="e.g. Retail, Marketing" value={wiki.department} onChange={(e) => setWiki({ ...wiki, department: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Location</label>
                    <input className="jl-input w-full" placeholder="e.g. Paris, France" value={wiki.location} onChange={(e) => setWiki({ ...wiki, location: e.target.value })} />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={wiki.is_anonymous} onChange={(e) => setWiki({ ...wiki, is_anonymous: e.target.checked })} className="accent-[#a58e28]" />
                  <span className="text-sm text-[#666]">Post anonymously</span>
                </label>
              </div>
            )}

            {/* ─── Salary Data Form ─── */}
            {activeTab === 'salary' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <p className="text-xs text-[#999] mb-2">All salary data is displayed anonymously by default. Your identity is never shared.</p>
                <div>
                  <label className="jl-label">Maison <span className="text-red-500">*</span></label>
                  <input className="jl-input w-full" placeholder="e.g. Chanel, Hermès, Louis Vuitton" value={salary.brand_name} onChange={(e) => setSalary({ ...salary, brand_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Job Title <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Retail Director" value={salary.job_title} onChange={(e) => setSalary({ ...salary, job_title: e.target.value })} />
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
                    <input className="jl-input w-full" placeholder="e.g. Retail, Marketing" value={salary.department} onChange={(e) => setSalary({ ...salary, department: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Employment Type</label>
                    <select className="jl-input w-full" value={salary.employment_type} onChange={(e) => setSalary({ ...salary, employment_type: e.target.value })}>
                      <option value="permanent">Permanent</option>
                      <option value="fixed-term">Fixed Term</option>
                      <option value="freelance">Freelance</option>
                      <option value="interim">Interim</option>
                    </select>
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
                    <label className="jl-label">Currency</label>
                    <select className="jl-input w-full" value={salary.salary_currency} onChange={(e) => setSalary({ ...salary, salary_currency: e.target.value })}>
                      {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Base Salary <span className="text-red-500">*</span></label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 95000" value={salary.base_salary} onChange={(e) => setSalary({ ...salary, base_salary: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Total Comp</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 120000" value={salary.total_comp} onChange={(e) => setSalary({ ...salary, total_comp: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Bonus Amount</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 15000" value={salary.bonus_amount} onChange={(e) => setSalary({ ...salary, bonus_amount: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Bonus Type</label>
                    <select className="jl-input w-full" value={salary.bonus_type} onChange={(e) => setSalary({ ...salary, bonus_type: e.target.value })}>
                      <option value="">Select</option>
                      <option value="annual">Annual</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="discretionary">Discretionary</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="jl-label">Benefits Notes</label>
                  <textarea className="jl-input w-full min-h-[80px]" placeholder="e.g. Company car, clothing allowance, private healthcare, staff discount…" value={salary.benefits_notes} onChange={(e) => setSalary({ ...salary, benefits_notes: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Year of Data</label>
                    <input type="number" className="jl-input w-full" value={salary.year_of_data} onChange={(e) => setSalary({ ...salary, year_of_data: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Years Experience</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 8" value={salary.years_experience} onChange={(e) => setSalary({ ...salary, years_experience: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {/* ─── Interview Experience Form ─── */}
            {activeTab === 'interview' && (
              <div className="space-y-4">
              <div className="bg-[#fafaf5] border border-[#a58e28] rounded-sm p-4 flex items-center justify-between">
                <p className="text-xs text-[#888]">See what others have shared about their interviews at luxury maisons.</p>
                <a href="/interviews" className="text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors tracking-wide whitespace-nowrap ml-4">View Interview Intelligence &rarr;</a>
              </div>
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 space-y-4">
                <div>
                  <label className="jl-label">Maison <span className="text-red-500">*</span></label>
                  <input className="jl-input w-full" placeholder="e.g. Chanel, Hermès, Louis Vuitton" value={interview.brand_name} onChange={(e) => setInterview({ ...interview, brand_name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Job Title <span className="text-red-500">*</span></label>
                    <input className="jl-input w-full" placeholder="e.g. Store Director" value={interview.job_title} onChange={(e) => setInterview({ ...interview, job_title: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Seniority</label>
                    <select className="jl-input w-full" value={interview.seniority} onChange={(e) => setInterview({ ...interview, seniority: e.target.value })}>
                      {SENIORITY_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">Location</label>
                    <input className="jl-input w-full" placeholder="e.g. Paris, France" value={interview.location} onChange={(e) => setInterview({ ...interview, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Year</label>
                    <input type="number" className="jl-input w-full" value={interview.interview_year} onChange={(e) => setInterview({ ...interview, interview_year: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="jl-label">Duration</label>
                    <input className="jl-input w-full" placeholder="e.g. 3 weeks" value={interview.process_duration} onChange={(e) => setInterview({ ...interview, process_duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Rounds</label>
                    <input type="number" className="jl-input w-full" placeholder="e.g. 4" value={interview.number_of_rounds} onChange={(e) => setInterview({ ...interview, number_of_rounds: e.target.value })} />
                  </div>
                  <div>
                    <label className="jl-label">Format</label>
                    <select className="jl-input w-full" value={interview.interview_format} onChange={(e) => setInterview({ ...interview, interview_format: e.target.value })}>
                      <option value="">Select</option>
                      <option value="in-person">In-person</option>
                      <option value="video">Video</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="jl-label">Process Description <span className="text-red-500">*</span></label>
                  <textarea className="jl-input w-full min-h-[120px]" placeholder="Describe the interview process step by step — who you met, what stages, how long each took…" value={interview.process_description} onChange={(e) => setInterview({ ...interview, process_description: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Questions Asked</label>
                  <textarea className="jl-input w-full min-h-[80px]" placeholder="Any notable or challenging questions you were asked…" value={interview.questions_asked} onChange={(e) => setInterview({ ...interview, questions_asked: e.target.value })} />
                </div>
                <div>
                  <label className="jl-label">Tips for Others</label>
                  <textarea className="jl-input w-full min-h-[80px]" placeholder="What would you tell someone interviewing at this maison?" value={interview.tips} onChange={(e) => setInterview({ ...interview, tips: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="jl-label">Outcome</label>
                    <select className="jl-input w-full" value={interview.outcome} onChange={(e) => setInterview({ ...interview, outcome: e.target.value })}>
                      <option value="">Select</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                      <option value="withdrew">Withdrew</option>
                      <option value="pending">Pending</option>
                      <option value="prefer_not_to_say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Difficulty</label>
                    <select className="jl-input w-full" value={interview.difficulty} onChange={(e) => setInterview({ ...interview, difficulty: e.target.value })}>
                      <option value="">Select</option>
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="challenging">Challenging</option>
                      <option value="very_challenging">Very Challenging</option>
                    </select>
                  </div>
                  <div>
                    <label className="jl-label">Overall Experience</label>
                    <select className="jl-input w-full" value={interview.overall_experience} onChange={(e) => setInterview({ ...interview, overall_experience: e.target.value })}>
                      <option value="">Select</option>
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={interview.is_anonymous} onChange={(e) => setInterview({ ...interview, is_anonymous: e.target.checked })} className="accent-[#a58e28]" />
                  <span className="text-sm text-[#666]">Post anonymously</span>
                </label>
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
                {submitting ? 'Submitting…' : 'Submit Contribution'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
