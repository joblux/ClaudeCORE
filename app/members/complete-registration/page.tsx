'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const TIER_LABELS: Record<string, string> = {
  rising: 'Rising', pro: 'Pro', professional: 'Pro+', business: 'Business', insider: 'Insider',
}

const STEPS = [
  { num: 1, label: 'Sign in' },
  { num: 2, label: 'Profile' },
  { num: 3, label: 'Essentials' },
  { num: 4, label: 'CV upload' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Pending' },
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

const SECTORS = [
  'Fashion & Leather Goods','Watches & Jewellery','Beauty & Fragrance','Hospitality & Hotels',
  'Art & Culture','Automotive & Yachts','Real Estate & Architecture','Spirits & Wine',
  'Retail & Distribution','Consulting & Services',
]

const DOMAINS = [
  'Retail & Client Experience','Buying & Merchandising','Marketing & Communications','Product & Design',
  'Finance & Controlling','HR & Talent','Operations & Supply Chain','Digital & E-commerce',
  'Executive Leadership','Wholesale & Distribution','PR & Events','Legal & Compliance',
]

type Position = { title: string; company: string; dates: string }
type Education = { institution: string; degree: string; dates: string }

export default function CompleteRegistrationPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  // Step state
  const [step, setStep] = useState(3)

  // Step 3 — Essentials
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [nationality, setNationality] = useState('')

  // Step 4 — CV
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvParsing, setCvParsing] = useState(false)
  const [cvError, setCvError] = useState('')

  // Step 5 — Extracted + editable
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [positions, setPositions] = useState<Position[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [sectors, setSectors] = useState<string[]>([])
  const [domains, setDomains] = useState<string[]>([])
  const [contactPref, setContactPref] = useState('email')

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

  // --- Handlers ---

  const handleStep3Next = () => {
    if (!firstName || !lastName || !city || !country || !nationality) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setStep(4)
  }

  const handleCvUpload = async (file: File) => {
    setCvFile(file)
    setCvParsing(true)
    setCvError('')
    try {
      const formData = new FormData()
      formData.append('cv', file)
      const res = await fetch('/api/members/cv-parse', { method: 'POST', body: formData })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to parse CV')
      }
      const data = await res.json()
      const ex = data.extracted
      if (ex.currentJobTitle) setJobTitle(ex.currentJobTitle)
      if (ex.currentCompany) setCompany(ex.currentCompany)
      if (ex.positions?.length) setPositions(ex.positions)
      if (ex.education?.length) setEducation(ex.education)
      if (ex.certifications?.length) setCertifications(ex.certifications)
      if (ex.languages?.length) setLanguages(ex.languages)
      setCvParsing(false)
      setStep(5)
    } catch (err: unknown) {
      setCvError(err instanceof Error ? err.message : 'Failed to parse CV')
      setCvParsing(false)
    }
  }

  const handleSubmit = async () => {
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
          phone: contactPref === 'phone' ? phone : (phone || ''),
          city,
          country,
          nationality,
          jobTitle,
          company,
          contactPref,
          positions,
          education,
          certifications,
          languages,
          sectors: sectors.map((s, i) => ({ name: s, rank: i + 1 })),
          domains: domains.map((d, i) => ({ name: d, rank: i + 1 })),
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Something went wrong')
      }
      await update()
      router.push('/members/pending')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsSubmitting(false)
    }
  }

  const toggleMulti = (list: string[], setList: (v: string[]) => void, item: string, max: number) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item))
    } else if (list.length < max) {
      setList([...list, item])
    }
  }

  // --- Shared styles ---
  const inputClass = 'w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333] rounded-sm'
  const selectClass = 'w-full px-3 py-3 border border-[#1e1e1e] bg-[#0f0f0f] text-[#ccc] outline-none focus:border-[#333] rounded-sm appearance-none'
  const labelClass = 'block text-[#444] uppercase tracking-widest mb-2'
  const sectionHeadClass = 'text-[#333] uppercase tracking-widest mb-4 pb-3 border-b border-[#1a1a1a]'

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[520px] bg-[#141414] border border-[#1e1e1e] px-9 py-11">

        {/* Progress bar — Steps 1-6 */}
        <div className="flex items-center justify-center gap-0 mb-9">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex items-center gap-1.5">
                <div className={
                  'w-5 h-5 rounded-full flex items-center justify-center font-bold ' +
                  (s.num < step ? 'bg-white text-black' : s.num === step ? 'bg-[#a58e28] text-black' : 'bg-[#1e1e1e] text-[#444]')
                } style={{ fontSize: '9px' }}>
                  {s.num < step ? '✓' : s.num}
                </div>
                <span className={
                  'uppercase tracking-widest ' +
                  (s.num === step ? 'text-white font-semibold' : 'text-[#444]')
                } style={{ fontSize: '9px' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={'w-4 h-px mx-1 ' + (s.num < step ? 'bg-white' : 'bg-[#2a2a2a]')} />
              )}
            </div>
          ))}
        </div>

        {tierLabel && (
          <div className="text-center text-[#444] uppercase tracking-widest mb-7 pb-5 border-b border-[#1a1a1a]" style={{ fontSize: '10px', letterSpacing: '2px' }}>
            {tierLabel} profile
          </div>
        )}

        {error && <div className="mb-5 p-3 border border-[#2a2a2a] text-[#888] rounded-sm" style={{ fontSize: '12px' }}>{error}</div>}

        {/* ========== STEP 3 — Essentials ========== */}
        {step === 3 && (
          <div>
            <h2 className="text-white text-center font-normal mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px' }}>Your essentials</h2>
            <p className="text-[#444] text-center mb-8" style={{ fontSize: '12px' }}>Confidential. Seen only by the JOBLUX team.</p>

            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Personal</div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>First name *</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Sophie" required className={inputClass} style={{ fontSize: '13px' }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Last name *</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Leclerc" required className={inputClass} style={{ fontSize: '13px' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ fontSize: '9px' }}>Phone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" className={inputClass} style={{ fontSize: '13px' }} />
            </div>

            <div className="mb-4">
              <label className={labelClass} style={{ fontSize: '9px' }}>City *</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Paris" required className={inputClass} style={{ fontSize: '13px' }} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-7">
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Country *</label>
                <select value={country} onChange={e => setCountry(e.target.value)} required className={selectClass} style={{ fontSize: '13px' }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Nationality *</label>
                <select value={nationality} onChange={e => setNationality(e.target.value)} required className={selectClass} style={{ fontSize: '13px' }}>
                  <option value="">Select nationality</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
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
            <p className="text-[#444] text-center mb-8" style={{ fontSize: '12px' }}>We'll extract your experience to pre-fill your profile. PDF or Word accepted.</p>

            {cvParsing ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#333] border-t-[#a58e28] rounded-full animate-spin mb-4" />
                <p className="text-[#555]" style={{ fontSize: '12px' }}>Parsing your document...</p>
              </div>
            ) : (
              <>
                <label className="block cursor-pointer">
                  <div className={'border-2 border-dashed rounded-sm p-12 text-center transition-colors ' + (cvFile ? 'border-[#a58e28] bg-[#a58e2808]' : 'border-[#2a2a2a] hover:border-[#444]')}>
                    {cvFile ? (
                      <div>
                        <div className="text-[#a58e28] mb-2" style={{ fontSize: '13px' }}>{cvFile.name}</div>
                        <div className="text-[#444]" style={{ fontSize: '11px' }}>Click to change file</div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-[#555] mb-2" style={{ fontSize: '32px' }}>+</div>
                        <div className="text-[#555] mb-1" style={{ fontSize: '13px' }}>Drop your CV here or click to browse</div>
                        <div className="text-[#333]" style={{ fontSize: '11px' }}>PDF or Word (.doc, .docx)</div>
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

                {cvError && <div className="mt-4 p-3 border border-[#2a2a2a] text-[#888] rounded-sm" style={{ fontSize: '12px' }}>{cvError}</div>}

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full mt-6 text-center text-[#444] hover:text-[#666] transition-colors"
                  style={{ fontSize: '12px' }}
                >
                  Skip for now &rarr;
                </button>
              </>
            )}
          </div>
        )}

        {/* ========== STEP 5 — Review & Complete ========== */}
        {step === 5 && (
          <div>
            <h2 className="text-white text-center font-normal mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '22px' }}>Review & complete</h2>
            <p className="text-[#444] text-center mb-8" style={{ fontSize: '12px' }}>Verify extracted information. Edit any field below.</p>

            {/* Current position */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Current position</div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Job title</label>
                <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Retail Manager" className={inputClass} style={{ fontSize: '13px' }} />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: '9px' }}>Company</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Hermes" className={inputClass} style={{ fontSize: '13px' }} />
              </div>
            </div>

            {/* Previous positions */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Previous positions</div>
            {positions.length === 0 && (
              <p className="text-[#333] mb-4" style={{ fontSize: '11px' }}>No positions detected. Add them manually below.</p>
            )}
            {positions.map((pos, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-3">
                <input type="text" value={pos.title} onChange={e => { const p = [...positions]; p[i] = { ...p[i], title: e.target.value }; setPositions(p) }} placeholder="Title" className={inputClass} style={{ fontSize: '12px' }} />
                <input type="text" value={pos.company} onChange={e => { const p = [...positions]; p[i] = { ...p[i], company: e.target.value }; setPositions(p) }} placeholder="Company" className={inputClass} style={{ fontSize: '12px' }} />
                <div className="flex gap-1">
                  <input type="text" value={pos.dates} onChange={e => { const p = [...positions]; p[i] = { ...p[i], dates: e.target.value }; setPositions(p) }} placeholder="Dates" className={inputClass + ' flex-1'} style={{ fontSize: '12px' }} />
                  <button type="button" onClick={() => setPositions(positions.filter((_, j) => j !== i))} className="text-[#333] hover:text-[#666] px-1" style={{ fontSize: '14px' }}>&times;</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setPositions([...positions, { title: '', company: '', dates: '' }])} className="text-[#444] hover:text-[#666] mb-5" style={{ fontSize: '11px' }}>+ Add position</button>

            {/* Education */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Education</div>
            {education.length === 0 && (
              <p className="text-[#333] mb-4" style={{ fontSize: '11px' }}>No education detected. Add entries manually below.</p>
            )}
            {education.map((edu, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-3">
                <input type="text" value={edu.institution} onChange={e => { const ed = [...education]; ed[i] = { ...ed[i], institution: e.target.value }; setEducation(ed) }} placeholder="Institution" className={inputClass} style={{ fontSize: '12px' }} />
                <input type="text" value={edu.degree} onChange={e => { const ed = [...education]; ed[i] = { ...ed[i], degree: e.target.value }; setEducation(ed) }} placeholder="Degree" className={inputClass} style={{ fontSize: '12px' }} />
                <div className="flex gap-1">
                  <input type="text" value={edu.dates} onChange={e => { const ed = [...education]; ed[i] = { ...ed[i], dates: e.target.value }; setEducation(ed) }} placeholder="Dates" className={inputClass + ' flex-1'} style={{ fontSize: '12px' }} />
                  <button type="button" onClick={() => setEducation(education.filter((_, j) => j !== i))} className="text-[#333] hover:text-[#666] px-1" style={{ fontSize: '14px' }}>&times;</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setEducation([...education, { institution: '', degree: '', dates: '' }])} className="text-[#444] hover:text-[#666] mb-5" style={{ fontSize: '11px' }}>+ Add education</button>

            {/* Certifications */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Certifications</div>
            {certifications.length === 0 && (
              <p className="text-[#333] mb-4" style={{ fontSize: '11px' }}>No certifications detected.</p>
            )}
            {certifications.map((cert, i) => (
              <div key={i} className="flex gap-1 mb-2">
                <input type="text" value={cert} onChange={e => { const c = [...certifications]; c[i] = e.target.value; setCertifications(c) }} placeholder="Certification" className={inputClass + ' flex-1'} style={{ fontSize: '12px' }} />
                <button type="button" onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} className="text-[#333] hover:text-[#666] px-1" style={{ fontSize: '14px' }}>&times;</button>
              </div>
            ))}
            <button type="button" onClick={() => setCertifications([...certifications, ''])} className="text-[#444] hover:text-[#666] mb-5" style={{ fontSize: '11px' }}>+ Add certification</button>

            {/* Languages */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Languages</div>
            {languages.length === 0 && (
              <p className="text-[#333] mb-4" style={{ fontSize: '11px' }}>No languages detected.</p>
            )}
            {languages.map((lang, i) => (
              <div key={i} className="flex gap-1 mb-2">
                <input type="text" value={lang} onChange={e => { const l = [...languages]; l[i] = e.target.value; setLanguages(l) }} placeholder="Language" className={inputClass + ' flex-1'} style={{ fontSize: '12px' }} />
                <button type="button" onClick={() => setLanguages(languages.filter((_, j) => j !== i))} className="text-[#333] hover:text-[#666] px-1" style={{ fontSize: '14px' }}>&times;</button>
              </div>
            ))}
            <button type="button" onClick={() => setLanguages([...languages, ''])} className="text-[#444] hover:text-[#666] mb-7" style={{ fontSize: '11px' }}>+ Add language</button>

            {/* Sectors — max 3 */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Sectors <span className="text-[#555] normal-case tracking-normal">(select up to 3)</span></div>
            <div className="flex flex-wrap gap-2 mb-7">
              {SECTORS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleMulti(sectors, setSectors, s, 3)}
                  className={'px-3 py-2 border rounded-sm transition-colors ' + (sectors.includes(s) ? 'border-[#a58e28] text-[#a58e28] bg-[#a58e2810]' : 'border-[#1e1e1e] text-[#555] hover:border-[#333]')}
                  style={{ fontSize: '11px' }}
                >{s}</button>
              ))}
            </div>

            {/* Domains — max 2 */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>Domains <span className="text-[#555] normal-case tracking-normal">(select up to 2)</span></div>
            <div className="flex flex-wrap gap-2 mb-7">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleMulti(domains, setDomains, d, 2)}
                  className={'px-3 py-2 border rounded-sm transition-colors ' + (domains.includes(d) ? 'border-[#a58e28] text-[#a58e28] bg-[#a58e2810]' : 'border-[#1e1e1e] text-[#555] hover:border-[#333]')}
                  style={{ fontSize: '11px' }}
                >{d}</button>
              ))}
            </div>

            {/* Contact preference */}
            <div className={sectionHeadClass} style={{ fontSize: '9px', letterSpacing: '2px' }}>How should we reach you</div>
            <div className={'flex items-start gap-3 p-3 border cursor-pointer mb-2 rounded-sm ' + (contactPref === 'email' ? 'border-[#333] bg-[#141414]' : 'border-[#1a1a1a] bg-[#111]')} onClick={() => setContactPref('email')}>
              <div className={'w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 ' + (contactPref === 'email' ? 'border-[#777]' : 'border-[#2a2a2a]')} style={contactPref === 'email' ? { background: 'radial-gradient(circle, #fff 40%, transparent 40%)' } : {}} />
              <div>
                <div className="text-[#aaa] font-medium" style={{ fontSize: '12px' }}>Email only</div>
                <div className="text-[#444] mt-0.5" style={{ fontSize: '11px' }}>We reach out when relevant opportunities arise</div>
              </div>
            </div>
            <div className={'flex items-start gap-3 p-3 border cursor-pointer mb-7 rounded-sm ' + (contactPref === 'phone' ? 'border-[#333] bg-[#141414]' : 'border-[#1a1a1a] bg-[#111]')} onClick={() => setContactPref('phone')}>
              <div className={'w-3.5 h-3.5 rounded-full border flex-shrink-0 mt-0.5 ' + (contactPref === 'phone' ? 'border-[#777]' : 'border-[#2a2a2a]')} style={contactPref === 'phone' ? { background: 'radial-gradient(circle, #fff 40%, transparent 40%)' } : {}} />
              <div>
                <div className="text-[#aaa] font-medium" style={{ fontSize: '12px' }}>Email and phone</div>
                <div className="text-[#444] mt-0.5" style={{ fontSize: '11px' }}>For time-sensitive or confidential assignments</div>
              </div>
            </div>

            {/* Privacy */}
            <div className="border-l border-[#2a2a2a] pl-4 mb-7">
              <p className="text-[#333] leading-relaxed" style={{ fontSize: '11px' }}>Your data is confidential. Never sold, never shared without your explicit consent, never used for advertising. Delete your profile at any time.</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(4)} className="px-6 py-3.5 border border-[#1e1e1e] text-[#555] uppercase tracking-widest font-semibold rounded-sm hover:border-[#333] transition-colors" style={{ fontSize: '10px', letterSpacing: '2px' }}>
                Back
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3.5 bg-white text-black uppercase tracking-widest font-semibold disabled:opacity-40 rounded-sm hover:bg-[#f0f0f0] transition-colors" style={{ fontSize: '10px', letterSpacing: '2px' }}>
                {isSubmitting ? 'Submitting...' : 'Submit my request'}
              </button>
            </div>
            <p className="text-center mt-4 text-[#2e2e2e]" style={{ fontSize: '11px' }}>All profiles are reviewed by the JOBLUX team.</p>
          </div>
        )}
      </div>
    </main>
  )
}
