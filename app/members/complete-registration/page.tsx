'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

const TIER_LABELS: Record<string, string> = {
  emerging_professional: 'Emerging Professional',
  established_professional: 'Established Professional',
  senior_executive: 'Senior & Executive',
  luxury_employer: 'Luxury Employer',
  trusted_contributor: 'Trusted Contributor',
  rising: 'Emerging Professional',
  pro: 'Established Professional',
  professional: 'Established Professional',
  business: 'Luxury Employer',
  insider: 'Trusted Contributor',
}

const STEPS = [
  { num: 1, label: 'Sign in' },
  { num: 2, label: 'Tier' },
  { num: 3, label: 'Essentials' },
  { num: 4, label: 'CV' },
  { num: 5, label: 'Pending' },
]

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor","Ecuador",
  "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France",
  "Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
  "Israel","Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kosovo",
  "Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius",
  "Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland",
  "Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
  "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
  "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States",
  "Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
]

import { PHONE_CODES, detectPhoneCode } from '@/lib/phone-codes'

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [step, setStep] = useState(3)

  // Step 3 — Essentials
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneCode, setPhoneCode] = useState(() => detectPhoneCode())
  const [phoneNumber, setPhoneNumber] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  // Step 4 — CV Upload
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUploading, setCvUploading] = useState(false)
  const [cvUrl, setCvUrl] = useState('')
  const [cvError, setCvError] = useState('')
  const [savedIncomplete, setSavedIncomplete] = useState(false)

  // General
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/join')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const regCompleted = (session.user as any).registrationCompleted
      const userStatus = (session.user as any).status
      if (regCompleted && userStatus === 'pending') router.push('/members/pending')
      if (regCompleted && userStatus === 'approved') router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <div className="w-6 h-6 border border-[#333] border-t-white rounded-full animate-spin" />
    </div>
  )

  const role = (session?.user as any)?.role || ''
  const tierLabel = TIER_LABELS[role] || ''
  const fullPhone = phoneNumber ? `${phoneCode} ${phoneNumber}` : ''

  // --- Submit registration ---
  const submitRegistration = async (uploadedCvUrl?: string, memberStatus: 'pending' | 'incomplete' = 'pending') => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: role,
          firstName,
          lastName,
          phone: fullPhone,
          city,
          country,
          contactPref: 'email',
          cv_url: uploadedCvUrl || cvUrl || null,
          status: memberStatus,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Something went wrong')
      }
      await update()
      if (memberStatus === 'incomplete') {
        setSavedIncomplete(true)
        setIsSubmitting(false)
      } else {
        router.push('/members/pending')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  // --- Step 3 next ---
  const handleStep3Next = () => {
    if (!firstName || !lastName || !city || !country) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStep(4)
  }

  // --- CV upload ---
  const handleCvUpload = async (file: File) => {
    setCvFile(file)
    setCvUploading(true)
    setCvError('')
    try {
      const formData = new FormData()
      formData.append('cv', file)
      const res = await fetch('/api/members/cv-upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Upload failed')
      }
      const data = await res.json()
      setCvUrl(data.url)
      setCvUploading(false)
      await submitRegistration(data.url)
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'Upload failed')
      setCvUploading(false)
      setCvFile(null)
    }
  }

  // --- No CV right now ---
  const handleNoCv = () => {
    submitRegistration(undefined, 'incomplete')
  }

  // --- Shared styles ---
  const inputClass = 'w-full px-3 py-3 border border-[#2a2a2a] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#444] rounded-sm'
  const selectClass = 'w-full px-3 py-3 border border-[#2a2a2a] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#444] rounded-sm appearance-none'
  const labelClass = 'block text-[#aaa] uppercase tracking-widest mb-2'
  const sectionHeadClass = 'text-[#888] uppercase tracking-widest mb-4 pb-3 border-b border-[#2a2a2a]'

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[520px] bg-[#1e1e1e] border border-[#2a2a2a] rounded-sm px-9 pt-8 pb-11">

        {/* Progress bar — inside card */}
        <div className="flex items-center justify-center gap-0 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <span className={
                  'uppercase tracking-widest ' +
                  (s.num === step ? 'text-white font-bold' : s.num < step ? 'text-[#ccc]' : 'text-[#999]')
                } style={{ fontSize: '10px', letterSpacing: '0.12em' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={'w-5 h-px mx-1.5 ' + (s.num < step ? 'bg-white' : 'bg-[#333]')} />
              )}
            </div>
          ))}
        </div>

        {tierLabel && (
          <div className="text-center text-[#aaa] uppercase tracking-widest mb-7 pb-5 border-b border-[#2a2a2a]" style={{ fontSize: '10px', letterSpacing: '2px' }}>
            {tierLabel} profile
          </div>
        )}

        {error && <div className="mb-5 p-3 border border-red-800 text-red-400 rounded-sm" style={{ fontSize: '12px' }}>{error}</div>}

        {/* ========== STEP 3 — Essentials ========== */}
        {step === 3 && (
          <div>
            <h2 className="text-white text-center font-normal mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px' }}>Your essentials</h2>
            <p className="text-[#aaa] text-center mb-8" style={{ fontSize: '12px' }}>Confidential. Seen only by the JOBLUX team.</p>

            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Personal</div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>First name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="" required className={inputClass} style={{ fontSize: '13px' }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Last name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="" required className={inputClass} style={{ fontSize: '13px' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ fontSize: '9px' }}>Phone</label>
              <div className="flex gap-2">
                <select value={phoneCode} onChange={e => setPhoneCode(e.target.value)} className={selectClass} style={{ fontSize: '12px', width: '120px', flexShrink: 0 }}>
                  {PHONE_CODES.map(pc => <option key={pc.code} value={pc.code}>{pc.label}</option>)}
                </select>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="" className={inputClass} style={{ fontSize: '13px' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ fontSize: '9px' }}>City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="" required className={inputClass} style={{ fontSize: '13px' }} />
            </div>

            <div className="mb-7">
              <label className={labelClass} style={{ fontSize: '9px' }}>Country *</label>
              <select value={country} onChange={e => setCountry(e.target.value)} required className={selectClass} style={{ fontSize: '13px' }}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button type="button" onClick={handleStep3Next} className="w-full py-3.5 bg-white text-black uppercase tracking-widest font-semibold rounded-sm hover:bg-[#f0f0f0] transition-colors" style={{ fontSize: '10px', letterSpacing: '2px' }}>
              Continue
            </button>
          </div>
        )}

        {/* ========== STEP 4 — CV Upload ========== */}
        {step === 4 && (
          <div>
            <h2 className="text-white text-center font-normal mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px' }}>Upload your CV</h2>
            <p className="text-[#aaa] text-center mb-8" style={{ fontSize: '12px' }}>Strongly recommended. PDF or Word accepted.</p>

            {cvUploading || isSubmitting ? (
              <div className="flex flex-col items-center justify-start py-16">
                <div className="w-8 h-8 border-2 border-[#333] border-t-[#a58e28] rounded-full animate-spin mb-4" />
                <p className="text-[#aaa]" style={{ fontSize: '12px' }}>{cvUploading ? 'Uploading your document...' : 'Submitting your application...'}</p>
              </div>
            ) : (
              <>
                <label className="block cursor-pointer">
                  <div className={'border-2 border-dashed rounded-sm p-12 text-center transition-colors ' + (cvFile && cvUrl ? 'border-[#a58e28] bg-[#a58e2808]' : 'border-[#333] hover:border-[#555]')}>
                    {cvFile && cvUrl ? (
                      <div>
                        <div className="text-[#a58e28] mb-2" style={{ fontSize: '13px' }}>{cvFile.name}</div>
                        <div className="text-[#aaa]" style={{ fontSize: '11px' }}>Uploaded successfully</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[#aaa] mb-2" style={{ fontSize: '32px' }}>+</div>
                        <div className="text-[#ccc] mb-1" style={{ fontSize: '13px' }}>Drop your CV here or click to browse</div>
                        <div className="text-[#888]" style={{ fontSize: '11px' }}>PDF or Word (.doc, .docx)</div>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) handleCvUpload(f)
                    }}
                  />
                </label>

                {cvError && <div className="mt-4 p-3 border border-red-800 text-red-400 rounded-sm" style={{ fontSize: '12px' }}>{cvError}</div>}

                <p className="text-[#888] text-center mt-6 mb-4" style={{ fontSize: '11px' }}>
                  Don&apos;t have your CV handy? You can export it from LinkedIn, Indeed or any job platform as a PDF.
                </p>

                {savedIncomplete ? (
                  <div className="mt-4">
                    <div className="p-4 border border-[#2a2a2a] rounded-sm mb-4">
                      <p className="text-[#ccc] text-center" style={{ fontSize: '13px' }}>Your application is saved. Come back when your CV is ready.</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex-1 py-3 border border-[#2a2a2a] text-[#aaa] uppercase tracking-widest font-semibold rounded-sm hover:border-[#444] transition-colors"
                        style={{ fontSize: '10px', letterSpacing: '2px' }}
                      >
                        Save & log out
                      </button>
                      <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="flex-1 py-3 bg-white text-black uppercase tracking-widest font-semibold rounded-sm hover:bg-[#f0f0f0] transition-colors"
                        style={{ fontSize: '10px', letterSpacing: '2px' }}
                      >
                        Continue browsing
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleNoCv}
                    disabled={isSubmitting}
                    className="w-full text-center text-[#aaa] hover:text-white transition-colors disabled:opacity-50"
                    style={{ fontSize: '12px' }}
                  >
                    I don&apos;t have my CV right now &rarr;
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
