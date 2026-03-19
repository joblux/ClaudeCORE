'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

const TIERS = [
  { id: 'rising', name: 'Rising', tagline: 'Students & Interns', desc: 'Student, intern, or recent graduate exploring luxury careers.', icon: '\u2197' },
  { id: 'pro', name: 'Pro', tagline: 'Junior to Mid-Level', desc: 'Junior to mid-level professional building a luxury career.', icon: '\u25c7' },
  { id: 'professional', name: 'Pro+', tagline: 'Managers to Directors', desc: 'Manager, senior manager, or director with significant experience.', icon: '\u25c6' },
  { id: 'executive', name: 'Executive', tagline: 'VPs & C-Suite', desc: 'VP, SVP, C-suite, or senior leadership in a maison or group.', icon: '\u2605' },
  { id: 'business', name: 'Business', tagline: 'Brands & Recruiters', desc: 'Recruiting for a luxury maison, group, or agency.', icon: '\u25a3' },
  { id: 'insider', name: 'Insider', tagline: 'Influencers & Experts', desc: 'Influencer, consultant, or senior expert in luxury.', icon: '\u2726' },
]

const SENIORITY = [
  { value: '', label: 'Select level' }, { value: 'junior', label: 'Junior (0\u20133 yrs)' },
  { value: 'mid-level', label: 'Mid-Level (3\u20137 yrs)' }, { value: 'senior', label: 'Senior (7\u201312 yrs)' },
  { value: 'director', label: 'Director (12+ yrs)' }, { value: 'vp', label: 'VP' }, { value: 'c-suite', label: 'C-Suite' },
]

type Tier = 'rising' | 'pro' | 'professional' | 'executive' | 'business' | 'insider' | null

export default function PendingPage() {
  const { data: session, update } = useSession()
  const regCompleted = (session?.user as any)?.registrationCompleted

  const firstName = (session?.user as any)?.firstName || ''
  const [step, setStep] = useState<1 | 2>(1)
  const [tier, setTier] = useState<Tier>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [f, setF] = useState({
    city: '', country: '', linkedin_url: '', phone: '', bio: '',
    job_title: '', maison: '', seniority: '', years_in_luxury: '', department: '',
    hiring_needs: '', speciality: '', consulting_firm: '', areas_of_expertise: '',
    university: '', field_of_study: '', graduation_year: '',
  })

  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }))

  const submit = async () => {
    setError('')
    if (!f.city || !f.country) { setError('City and country are required.'); return }
    if ((tier === 'pro' || tier === 'professional' || tier === 'executive') && (!f.job_title || !f.maison)) { setError('Role and maison are required.'); return }
    if (tier === 'business' && !f.maison) { setError('Company/maison is required.'); return }
    if (tier === 'insider' && !f.speciality) { setError('Speciality is required.'); return }
    if (tier === 'rising' && !f.university) { setError('University is required.'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, ...f,
          years_in_luxury: f.years_in_luxury ? parseInt(f.years_in_luxury) : null,
          graduation_year: f.graduation_year ? parseInt(f.graduation_year) : null,
        }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      // Refresh the session so registrationCompleted updates
      await update()
      setSubmitted(true)
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  // ── PENDING APPROVAL VIEW ──
  if (regCompleted || submitted) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h2 className="jl-serif text-3xl text-[#1a1a1a] mb-2">JOBLUX</h2>
          <p className="text-sm tracking-[0.2em] uppercase text-[#a58e28] mb-10">Luxury Talents Intelligence</p>
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="jl-serif text-xl text-[#1a1a1a] mb-2">Pending Approval</h3>
            <p className="text-sm text-[#666] mb-4">{firstName ? `Thank you, ${firstName}.` : 'Thank you.'} Your membership is under review.</p>
            <p className="text-xs text-[#999]">Every JOBLUX member is personally approved. You will receive an email once confirmed.</p>
          </div>
          <Link href="/" className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mt-6 inline-block">&larr; Return to homepage</Link>
        </div>
      </main>
    )
  }

  // ── REGISTRATION FORM VIEW ──
  return (
    <main className="min-h-screen bg-[#fafaf5] flex flex-col items-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.3em] uppercase text-[#a58e28] mb-3">JOBLUX Membership</p>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mb-2">{step === 1 ? 'Choose Your Tier' : 'Complete Your Profile'}</h1>
          <p className="text-[#666] text-sm max-w-md mx-auto">{step === 1 ? 'Select the tier that best describes your position.' : 'Tell us about yourself so we can review your application.'}</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step === 1 ? 'bg-[#a58e28] text-white' : 'bg-[#1a1a1a] text-[#a58e28]'}`}>1</div>
          <div className="w-8 h-px bg-[#e8e2d8]" />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${step === 2 ? 'bg-[#a58e28] text-white' : 'bg-[#e8e2d8] text-[#999]'}`}>2</div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm text-center">{error}</div>}

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {TIERS.map((t) => (
                <button key={t.id} onClick={() => setTier(t.id as Tier)} className={`text-left p-5 border rounded-sm transition-all ${tier === t.id ? 'bg-white border-[#a58e28] shadow-sm' : 'bg-white border-[#e8e2d8] hover:border-[#a58e28]/50'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{t.icon}</span>
                    {tier === t.id && <span className="w-5 h-5 rounded-full bg-[#a58e28] flex items-center justify-center"><svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></span>}
                  </div>
                  <h3 className="text-sm font-medium text-[#1a1a1a]">{t.name}</h3>
                  <p className="text-xs text-[#a58e28] mb-1">{t.tagline}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button onClick={() => { if (tier) { setStep(2); setError('') } }} disabled={!tier} className={`jl-btn jl-btn-primary px-10 ${!tier ? 'opacity-40 cursor-not-allowed' : ''}`}>Continue</button>
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mb-6">&larr; Change tier ({TIERS.find((t) => t.id === tier)?.name})</button>
            <div className="space-y-6">

              {/* Common */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Basic Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="jl-label">City <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Paris" value={f.city} onChange={(e) => set('city', e.target.value)} /></div>
                    <div><label className="jl-label">Country <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. France" value={f.country} onChange={(e) => set('country', e.target.value)} /></div>
                  </div>
                  <div><label className="jl-label">LinkedIn</label><input className="jl-input w-full" placeholder="https://linkedin.com/in/..." value={f.linkedin_url} onChange={(e) => set('linkedin_url', e.target.value)} /></div>
                  <div><label className="jl-label">Phone</label><input className="jl-input w-full" placeholder="+33 6 12 34 56 78" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></div>
                  <div><label className="jl-label">Short Bio</label><textarea className="jl-input w-full min-h-[80px]" placeholder="A few words about your background..." value={f.bio} onChange={(e) => set('bio', e.target.value)} /></div>
                </div>
              </div>

              {/* Pro */}
              {tier === 'pro' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Professional Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Role <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Sales Associate" value={f.job_title} onChange={(e) => set('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Current Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Chanel, Dior" value={f.maison} onChange={(e) => set('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="jl-label">Seniority</label><select className="jl-input w-full" value={f.seniority} onChange={(e) => set('seniority', e.target.value)}>{SENIORITY.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 3" value={f.years_in_luxury} onChange={(e) => set('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Department</label><input className="jl-input w-full" placeholder="e.g. Retail" value={f.department} onChange={(e) => set('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pro+ */}
              {tier === 'professional' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Manager / Director Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Role <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Retail Director" value={f.job_title} onChange={(e) => set('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Current Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Chanel, LVMH" value={f.maison} onChange={(e) => set('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div><label className="jl-label">Seniority</label><select className="jl-input w-full" value={f.seniority} onChange={(e) => set('seniority', e.target.value)}>{SENIORITY.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 10" value={f.years_in_luxury} onChange={(e) => set('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Department</label><input className="jl-input w-full" placeholder="e.g. Marketing" value={f.department} onChange={(e) => set('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Executive */}
              {tier === 'executive' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Executive Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Current Title <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. VP Retail, CEO" value={f.job_title} onChange={(e) => set('job_title', e.target.value)} /></div>
                      <div><label className="jl-label">Maison / Group <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. LVMH, Kering" value={f.maison} onChange={(e) => set('maison', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Years in Luxury</label><input type="number" className="jl-input w-full" placeholder="e.g. 15" value={f.years_in_luxury} onChange={(e) => set('years_in_luxury', e.target.value)} /></div>
                      <div><label className="jl-label">Division</label><input className="jl-input w-full" placeholder="e.g. Global Retail" value={f.department} onChange={(e) => set('department', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Business */}
              {tier === 'business' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Recruitment Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Company / Maison <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Kering" value={f.maison} onChange={(e) => set('maison', e.target.value)} /></div>
                      <div><label className="jl-label">Your Role</label><input className="jl-input w-full" placeholder="e.g. Talent Manager" value={f.job_title} onChange={(e) => set('job_title', e.target.value)} /></div>
                    </div>
                    <div><label className="jl-label">Hiring Needs</label><textarea className="jl-input w-full min-h-[80px]" placeholder="What roles are you hiring for?" value={f.hiring_needs} onChange={(e) => set('hiring_needs', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {/* Insider */}
              {tier === 'insider' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Consulting Details</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Speciality <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. Executive Search" value={f.speciality} onChange={(e) => set('speciality', e.target.value)} /></div>
                      <div><label className="jl-label">Firm</label><input className="jl-input w-full" placeholder="e.g. Independent" value={f.consulting_firm} onChange={(e) => set('consulting_firm', e.target.value)} /></div>
                    </div>
                    <div><label className="jl-label">Areas of Expertise</label><textarea className="jl-input w-full min-h-[80px]" placeholder="e.g. Luxury retail, C-suite placement..." value={f.areas_of_expertise} onChange={(e) => set('areas_of_expertise', e.target.value)} /></div>
                  </div>
                </div>
              )}

              {/* Rising */}
              {tier === 'rising' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Academic Details</h2>
                  <div className="space-y-4">
                    <div><label className="jl-label">University / School <span className="text-red-500">*</span></label><input className="jl-input w-full" placeholder="e.g. ESSEC, Polimoda" value={f.university} onChange={(e) => set('university', e.target.value)} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="jl-label">Field of Study</label><input className="jl-input w-full" placeholder="e.g. Luxury Brand Management" value={f.field_of_study} onChange={(e) => set('field_of_study', e.target.value)} /></div>
                      <div><label className="jl-label">Graduation Year</label><input type="number" className="jl-input w-full" placeholder="e.g. 2026" value={f.graduation_year} onChange={(e) => set('graduation_year', e.target.value)} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="text-center pt-4">
                <button onClick={submit} disabled={saving} className="jl-btn jl-btn-primary px-10">{saving ? 'Submitting\u2026' : 'Submit Application'}</button>
                <p className="text-xs text-[#999] mt-3">Every JOBLUX membership is personally reviewed.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
