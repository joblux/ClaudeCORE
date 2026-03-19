'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const TIERS = [
  { id: 'rising', name: 'Rising', tagline: 'Students & Interns', description: 'You are a student, intern, or recent graduate exploring luxury career opportunities.', icon: '\u2197' },
  { id: 'pro', name: 'Pro', tagline: 'Junior to Mid-Level Professionals', description: 'You hold a junior to mid-level position in the luxury industry and are building your career.', icon: '\u25c7' },
  { id: 'professional', name: 'Pro+', tagline: 'Managers to Directors', description: 'You are a manager, senior manager, or director with significant luxury industry experience.', icon: '\u25c6' },
  { id: 'executive', name: 'Executive', tagline: 'VPs & C-Suite Leaders', description: 'You hold a VP, SVP, C-suite, or senior leadership position in a luxury maison or group.', icon: '\u2605' },
  { id: 'business', name: 'Business', tagline: 'Brands & Recruiters', description: 'You recruit for a luxury maison, group, or agency and want to post assignments and access talent.', icon: '\u25a3' },
  { id: 'insider', name: 'Insider', tagline: 'Influencers & Senior Experts', description: 'You are an influencer, consultant, or senior expert contributing intelligence to the luxury community.', icon: '\u2726' },
]

const SENIORITY_OPTIONS = [
  { value: '', label: 'Select level' },
  { value: 'junior', label: 'Junior (0\u20133 years)' },
  { value: 'mid-level', label: 'Mid-Level (3\u20137 years)' },
  { value: 'senior', label: 'Senior (7\u201312 years)' },
  { value: 'director', label: 'Director (12+ years)' },
  { value: 'vp', label: 'Vice President' },
  { value: 'c-suite', label: 'C-Suite' },
]

type TierId = 'rising' | 'pro' | 'professional' | 'executive' | 'business' | 'insider' | null
type PageView = 'loading' | 'registration' | 'pending'

export default function PendingPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [view, setView] = useState<PageView>('loading')
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTier, setSelectedTier] = useState<TierId>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    city: '', country: '', linkedin_url: '', phone: '', bio: '',
    job_title: '', maison: '', seniority: '', years_in_luxury: '', department: '',
    hiring_needs: '', speciality: '', consulting_firm: '', areas_of_expertise: '',
    university: '', field_of_study: '', graduation_year: '',
  })

  const firstName = (session?.user as any)?.firstName || session?.user?.name?.split(' ')[0] || null

  // Check registration_completed on load
  useEffect(() => {
    if (sessionStatus !== 'authenticated' || !session?.user?.email) return
    fetch(`/api/members/profile?email=${encodeURIComponent(session.user.email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.member?.registration_completed) {
          setView('pending')
        } else {
          setView('registration')
        }
      })
      .catch(() => setView('pending'))
  }, [sessionStatus, session])

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleContinue = () => {
    if (!selectedTier) return
    setStep(2)
    setError('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!form.city || !form.country) { setError('Please fill in your city and country.'); return }
    if ((selectedTier === 'professional' || selectedTier === 'pro' || selectedTier === 'executive') && (!form.job_title || !form.maison)) { setError('Please fill in your current role and maison.'); return }
    if (selectedTier === 'business' && !form.maison) { setError('Please fill in your company or maison.'); return }
    if (selectedTier === 'insider' && !form.speciality) { setError('Please fill in your speciality.'); return }
    if (selectedTier === 'rising' && !form.university) { setError('Please fill in your university or school.'); return }

    setSaving(true)
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier, ...form,
          years_in_luxury: form.years_in_luxury ? parseInt(form.years_in_luxury) : null,
          graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
        }),
      })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to submit') }
      setView('pending')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // ── LOADING ──
  if (view === 'loading') {
    return (
      <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <p className="text-sm text-[#888]">Loading...</p>
      </main>
    )
  }

  // ── PENDING APPROVAL ──
  if (view === 'pending') {
    return (
      <main className="min-h-screen bg-[#f5f4f0] flex items-center justify-center px-4">
        <div className="w-full max-w-[420px] text-center">
          <div className="mb-10">
            <h1 className="text-4xl font-semibold text-[#1a1a1a] tracking-[3px]" style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif" }}>JOBLUX</h1>
            <p className="text-[11px] text-[#a58e28] tracking-[4px] uppercase mt-1">Luxury Talents Intelligence</p>
          </div>
          <div className="bg-white border border-[#e8e6df] rounded-sm p-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#fdf8e8] flex items-center justify-center">
              <svg className="w-8 h-8 text-[#a58e28]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl text-[#1a1a1a] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Pending Approval</h2>
            <p className="text-sm text-[#777] leading-relaxed mb-4">
              {firstName ? `Thank you for registering, ${firstName}. Your membership is under review.` : 'Your membership is under review.'}
            </p>
            <p className="text-xs text-[#999] leading-relaxed">
              Every JOBLUX member is personally approved. You&apos;ll receive an email once your access is confirmed.
            </p>
          </div>
          <a href="/" className="inline-block mt-6 text-xs text-[#a58e28] hover:text-[#1a1a1a] transition-colors">&larr; Return to homepage</a>
        </div>
      </main>
    )
  }

  // ── REGISTRATION FORM ──
  return (
    <main className="min-h-screen bg-[#fafaf5] flex flex-col items-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.3em] uppercase text-[#a58e28] mb-3">JOBLUX Membership</p>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mb-2">
            {step === 1 ? 'Choose Your Membership Tier' : 'Complete Your Profile'}
          </h1>
          <p className="text-[#666] text-sm max-w-md mx-auto">
            {step === 1 ? 'Select the tier that best describes your current position in the luxury industry.' : 'Tell us about yourself so we can review your application.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step === 1 ? 'bg-[#a58e28] text-white' : 'bg-[#1a1a1a] text-[#a58e28]'}`}>1</div>
          <div className="w-8 h-px bg-[#e8e2d8]" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'bg-[#a58e28] text-white' : 'bg-[#e8e2d8] text-[#999]'}`}>2</div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm text-center">{error}</div>}

        {/* STEP 1: Tier Selection */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {TIERS.map((tier) => (
                <button key={tier.id} onClick={() => setSelectedTier(tier.id as TierId)} className={`text-left p-5 border rounded-sm transition-all ${selectedTier === tier.id ? 'bg-white border-[#a58e28] shadow-sm' : 'bg-white border-[#e8e2d8] hover:border-[#a58e28]/50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{tier.icon}</span>
                    {selectedTier === tier.id && (
                      <span className="w-5 h-5 rounded-full bg-[#a58e28] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-[#1a1a1a]">{tier.name}</h3>
                  <p className="text-xs text-[#a58e28] mb-1">{tier.tagline}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{tier.description}</p>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={handleContinue} disabled={!selectedTier} className={`jl-btn jl-btn-primary px-10 ${!selectedTier ? 'opacity-40 cursor-not-allowed' : ''}`}>Continue</button>
            </div>
          </>
        )}

        {/* STEP 2: Profile Form */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mb-6">
              &larr; Change tier ({TIERS.find((t) => t.id === selectedTier)?.name})
            </button>

            <div className="space-y-6">
              {/* Common Fields */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Basic Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="jl-label">City <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Paris" value={form.city} onChange={(e) => updateField('city', e.target.value)} /></div>
                    <div><label className="jl-label">Country <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. France" value={form.country} onChange={(e) => updateField('country', e.target.value)} /></div>
                  </div>
                  <div><label className="jl-label">LinkedIn Profile</label><input className="jl-input w-full" placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin_url} onChange={(e) => updateField('linkedin_url', e.target.value)} /></div>
                  <div><label className="jl-label">Phone</label><input className="jl-input w-full" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} /></div>
                  <div><label className="jl-label">Short Bio</label><textarea className="jl-input w-full min-h-[80px]" placeholder="A few words about your background and what brings you to JOBLUX\u2026" value={form.bio} onChange={(e) => updateField('bio', e.target.value)} /></div>
                </div>
              </div>

              {/* Pro Fields */}
              {selectedTier === 'pro' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Professional Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Role <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Sales Associate" value={form.job_title} onChange={(e) => updateField('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Current Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Chanel, Dior" value={form.maison} onChange={(e) => updateField('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="jl-label">Seniority</label><select className="jl-input w-full" value={form.seniority} onChange={(e) => updateField('seniority', e.target.value)}>{SENIORITY_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 3" value={form.years_in_luxury} onChange={(e) => updateField('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Department</label><input className="jl-input w-full" placeholder="e.g. Retail" value={form.department} onChange={(e) => updateField('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pro+ Fields */}
              {selectedTier === 'professional' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Manager / Director Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Role <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Retail Director" value={form.job_title} onChange={(e) => updateField('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Current Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Chanel, LVMH" value={form.maison} onChange={(e) => updateField('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="jl-label">Seniority</label><select className="jl-input w-full" value={form.seniority} onChange={(e) => updateField('seniority', e.target.value)}>{SENIORITY_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 10" value={form.years_in_luxury} onChange={(e) => updateField('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Department</label><input className="jl-input w-full" placeholder="e.g. Marketing, Digital" value={form.department} onChange={(e) => updateField('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Executive Fields */}
              {selectedTier === 'executive' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Executive Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Title <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. VP Retail, CEO" value={form.job_title} onChange={(e) => updateField('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Maison / Group <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. LVMH, Kering" value={form.maison} onChange={(e) => updateField('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 15" value={form.years_in_luxury} onChange={(e) => updateField('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Department / Division</label><input className="jl-input w-full" placeholder="e.g. Global Retail" value={form.department} onChange={(e) => updateField('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Fields */}
              {selectedTier === 'business' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Recruitment Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Company / Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Kering, Richemont" value={form.maison} onChange={(e) => updateField('maison', e.target.value)} /></div>
                      <div><label className="jl-label">Your Role</label><input className="jl-input w-full" placeholder="e.g. Talent Acquisition Manager" value={form.job_title} onChange={(e) => updateField('job_title', e.target.value)} /></div>
                    </div>
                    <div><label className="jl-label">Hiring Needs</label><textarea className="jl-input w-full min-h-[80px]" placeholder="What roles are you hiring for?" value={form.hiring_needs} onChange={(e) => updateField('hiring_needs', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {/* Insider Fields */}
              {selectedTier === 'insider' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Consulting Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Speciality <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Executive Search" value={form.speciality} onChange={(e) => updateField('speciality', e.target.value)} /></div>
                      <div><label className="jl-label">Firm</label><input className="jl-input w-full" placeholder="e.g. Firm name, or Independent" value={form.consulting_firm} onChange={(e) => updateField('consulting_firm', e.target.value)} /></div>
                    </div>
                    <div><label className="jl-label">Areas of Expertise</label><textarea className="jl-input w-full min-h-[80px]" placeholder="e.g. Luxury retail transformation, C-suite placement\u2026" value={form.areas_of_expertise} onChange={(e) => updateField('areas_of_expertise', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {/* Rising Fields */}
              {selectedTier === 'rising' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Academic Details</h2>
                  <div className="space-y-4">
                    <div><label className="jl-label">University / School <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. ESSEC, Polimoda, IFM" value={form.university} onChange={(e) => updateField('university', e.target.value)} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Field of Study</label><input className="jl-input w-full" placeholder="e.g. Luxury Brand Management" value={form.field_of_study} onChange={(e) => updateField('field_of_study', e.target.value)} /></div>
                      <div><label className="jl-label">Graduation Year</label><input type="number" className="jl-input w-full" placeholder="e.g. 2026" value={form.graduation_year} onChange={(e) => updateField('graduation_year', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="text-center pt-4">
                <button onClick={handleSubmit} disabled={saving} className="jl-btn jl-btn-primary px-10">
                  {saving ? 'Submitting\u2026' : 'Submit Application'}
                </button>
                <p className="text-xs text-[#999] mt-3">Every JOBLUX membership is personally reviewed. You will be notified once approved.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
