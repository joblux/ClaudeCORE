'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const TIER_LABELS: Record<string, string> = {
  member: 'Member', senior: 'Senior', executive: 'Executive', business: 'Business', insider: 'Insider',
}

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const { status } = useSession()
  const [tier, setTier] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [contactPref, setContactPref] = useState('email')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('joblux_tier') || '' : ''
    setTier(saved)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/join')
  }, [status, router])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-6 h-6 border border-[#333] border-t-white rounded-full animate-spin" />
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName || !jobTitle || !company) { setError('All fields are required.'); return }
    if (contactPref === 'phone' && !phone) { setError('Please enter your phone number.'); return }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier || 'member', firstName, lastName, jobTitle, company, contactPref, phone: contactPref === 'phone' ? phone : '' }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error || 'Something went wrong') }
      if (typeof window !== 'undefined') sessionStorage.removeItem('joblux_tier')
      router.push('/members/pending')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  const tierLabel = TIER_LABELS[tier] || ''

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[480px] bg-[#141414] border border-[#1e1e1e] px-9 py-11">

        <div className="text-center mb-9">
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', color: '#a58e28', letterSpacing: '2px' }}>JOBLUX.</span>
        </div>

        <div className="flex items-center justify-center gap-0 mb-9">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black font-bold" style={{ fontSize: '9px' }}>&#10003;</div>
            <span className="text-white uppercase tracking-widest" style={{ fontSize: '10px' }}>Who are you</span>
          </div>
          <div className="w-8 h-px bg-white mx-1.5" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black font-bold" style={{ fontSize: '9px' }}>&#10003;</div>
            <span className="text-white uppercase tracking-widest" style={{ fontSize: '10px' }}>Sign in</span>
          </div>
          <div className="w-8 h-px bg-white mx-1.5" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-black font-bold" style={{ fontSize: '9px' }}>3</div>
            <span className="text-white uppercase tracking-widest font-semibold" style={{ fontSize: '10px' }}>Your details</span>
          </div>
        </div>

        {tierLabel && (
          <div className="text-center text-[#333] uppercase tracking-widest mb-7 pb-5 border-b border-[#1a1a1a]" style={{ fontSize: '10px', letterSpacing: '2px' }}>
            {tierLabel} profile
          </div>
        )}

        <h2 className="text-white text-center font-normal mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px' }}>A few details</h2>
        <p className="text-[#333] text-center mb-8" style={{ fontSize: '12px' }}>Confidential. Seen only by the JOBLUX team.</p>

        {error && <div className="mb-5 p-3 border border-[#2a2a2a] text-[#555]" style={{ fontSize: '12px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="text-[#333] uppercase tracking-widest mb-4 pb-3 border-b border-[#1a1a1a]" style={{ fontSize: '9px', letterSpacing: '2px' }}>Personal</div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-[#333] uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>First name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sophie" required className="w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333]" style={{ fontSize: '13px' }} />
            </div>
            <div>
              <label className="block text-[#333] uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Last name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Leclerc" required className="w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333]" style={{ fontSize: '13px' }} />
            </div>
          </div>

          <div className="text-[#333] uppercase tracking-widest mb-4 pb-3 border-b border-[#1a1a1a]" style={{ fontSize: '9px', letterSpacing: '2px' }}>Professional</div>
          <div className="mb-3">
            <label className="block text-[#333] uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Current job title</label>
            <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Retail Manager" required className="w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333]" style={{ fontSize: '13px' }} />
          </div>
          <div className="mb-6">
            <label className="block text-[#333] uppercase tracking-widest mb-2" style={{ fontSize: '9px' }}>Current company</label>
            <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Hermes" required className="w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333]" style={{ fontSize: '13px' }} />
          </div>

          <div className="text-[#333] uppercase tracking-widest mb-4 pb-3 border-b border-[#1a1a1a]" style={{ fontSize: '9px', letterSpacing: '2px' }}>How should we reach you</div>

          <div className={"flex items-start gap-3 p-3 border cursor-pointer mb-2 " + (contactPref === 'email' ? 'border-[#333] bg-[#141414]' : 'border-[#1a1a1a] bg-[#111]')} onClick={() => setContactPref('email')}>
            <div className={"w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 " + (contactPref === 'email' ? 'border-[#777]' : 'border-[#2a2a2a]')} style={contactPref === 'email' ? { background: 'radial-gradient(circle, #fff 40%, transparent 40%)' } : {}} />
            <div>
              <div className="text-[#aaa] font-medium" style={{ fontSize: '12px' }}>Email only</div>
              <div className="text-[#333] mt-0.5" style={{ fontSize: '11px' }}>We reach out when relevant opportunities arise</div>
            </div>
          </div>

          <div className={"flex items-start gap-3 p-3 border cursor-pointer mb-6 " + (contactPref === 'phone' ? 'border-[#333] bg-[#141414]' : 'border-[#1a1a1a] bg-[#111]')} onClick={() => setContactPref('phone')}>
            <div className={"w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 " + (contactPref === 'phone' ? 'border-[#777]' : 'border-[#2a2a2a]')} style={contactPref === 'phone' ? { background: 'radial-gradient(circle, #fff 40%, transparent 40%)' } : {}} />
            <div className="flex-1">
              <div className="text-[#aaa] font-medium" style={{ fontSize: '12px' }}>Email and phone</div>
              <div className="text-[#333] mt-0.5" style={{ fontSize: '11px' }}>For time-sensitive or confidential assignments</div>
              {contactPref === 'phone' && (
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className="w-full mt-2 px-3 py-2 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333]" style={{ fontSize: '12px' }} onClick={e => e.stopPropagation()} />
              )}
            </div>
          </div>

          <div className="border-l border-[#2a2a2a] pl-4 mb-6">
            <p className="text-[#2e2e2e] leading-relaxed" style={{ fontSize: '11px' }}>Your data is confidential. Never sold, never shared without your explicit consent, never used for advertising. Delete your profile at any time.</p>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-white text-black uppercase tracking-widest font-semibold disabled:opacity-40" style={{ fontSize: '10px', letterSpacing: '2px' }}>
            {isSubmitting ? 'Submitting...' : 'Submit my request'}
          </button>
          <p className="text-center mt-4 text-[#222]" style={{ fontSize: '11px' }}>All profiles are reviewed by the JOBLUX team.</p>
        </form>
      </div>
    </main>
  )
}
