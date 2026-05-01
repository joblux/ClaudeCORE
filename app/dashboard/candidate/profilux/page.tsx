'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Experience' },
  { id: 3, label: 'Expertise & Languages' },
  { id: 4, label: 'Sectors' },
  { id: 5, label: 'Salary' },
  { id: 6, label: 'Availability' },
  { id: 7, label: 'Share' },
]

const SECTORS = [
  'Fashion & Apparel', 'Leather Goods & Accessories', 'Footwear', 'Eyewear',
  'Fine Jewellery', 'Watches & Horology', 'High Jewellery',
  'Perfumes & Cosmetics', 'Skincare', 'Hair & Grooming', 'Wellness & Spa',
  'Luxury Hotels & Resorts', 'Private Members Clubs', 'Cruise & Yachting', 'Private Aviation',
  'Fine Dining & Gastronomy', 'Wines & Champagne', 'Spirits & Cognac',
  'Art & Collectibles', 'Auction Houses', 'Galleries & Museums',
  'Luxury Real Estate', 'Interior Design & Architecture',
  'Private Banking & Wealth Management', 'Family Office', 'Luxury Consulting',
  'Luxury Automotive', 'Supercars', 'Electric Luxury',
  'Luxury Tech', 'Wearables', 'Digital Luxury',
  'Multi-brand Retail', 'Department Stores', 'Concept Stores',
]

const SPECIALISATIONS = [
  'Client Advisor', 'Sales Management', 'Key Account Management', 'Business Development',
  'Store Management', 'Area & Regional Management', 'Retail Excellence',
  'Creative Direction', 'Fashion Design', 'Art Direction',
  'Buying', 'Merchandising', 'Product Development',
  'Brand Management', 'Communications & PR', 'Digital Marketing',
  'HR & Talent', 'Training & Development', 'Recruitment',
  'Finance & Controlling', 'Strategy & Consulting',
  'IT & Digital', 'Data & Analytics',
  'Supply Chain & Logistics', 'Operations',
  'Team Leadership', 'Commercial Strategy', 'Client Experience',
]

const MARKETS = [
  'France', 'Western Europe', 'Middle East', 'Asia Pacific', 'Americas', 'Global (open to relocation)',
]

const LANGUAGES = [
  'French', 'English', 'Italian', 'Spanish', 'Arabic', 'Mandarin', 'Japanese',
  'German', 'Russian', 'Portuguese', 'Korean', 'Dutch', 'Turkish', 'Swedish',
  'Polish', 'Hindi', 'Greek', 'Romanian', 'Czech',
]

const AVAILABILITY = [
  { value: 'active', label: 'Actively looking', desc: 'Open to opportunities now' },
  { value: 'open', label: 'Considering opportunities', desc: 'Not actively searching but will consider' },
  { value: 'passive', label: 'Passively exploring', desc: 'Happy where I am but curious' },
  { value: 'unavailable', label: 'Not available', desc: 'Not open to opportunities at this time' },
]

interface Experience {
  id: string
  role: string
  brand: string
  group: string
  location: string
  from: string
  to: string
  current: boolean
}

interface ProfileData {
  firstName: string
  lastName: string
  city: string
  nationality: string
  headline: string
  bio: string
  experience: Experience[]
  specialisations: string[]
  languages: string[]
  sectors: string[]
  markets: string[]
  salaryExpectation: number
  salaryCurrency: string
  availability: string
  sharingEnabled: boolean
  shareSlug: string
}

export default function ProfiluxPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAddExp, setShowAddExp] = useState(false)
  const [newExp, setNewExp] = useState<Partial<Experience>>({ current: false })
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [cvParsedAt, setCvParsedAt] = useState<string | null>(null)
  const [parsing, setParsing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [needsReviewCount, setNeedsReviewCount] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    city: '',
    nationality: '',
    headline: '',
    bio: '',
    experience: [],
    specialisations: [],
    languages: [],
    sectors: [],
    markets: [],
    salaryExpectation: 0,
    salaryCurrency: 'EUR',
    availability: 'open',
    sharingEnabled: false,
    shareSlug: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profilux')
        if (res.ok) {
          const data = await res.json()
          if (data.profile) {
            setProfile(prev => ({ ...prev, ...data.profile }))
          }
        }
      } catch {}
    }
    if (status === 'authenticated') fetchProfile()
  }, [status])

  useEffect(() => {
    const fetchCvState = async () => {
      try {
        const res = await fetch('/api/members/me')
        if (res.ok) {
          const data = await res.json()
          setCvUrl(data?.cv_url ?? null)
          setCvParsedAt(data?.cv_parsed_at ?? null)
        }
      } catch {}
    }
    if (status === 'authenticated') fetchCvState()
  }, [status])

  const completedSteps = [
    profile.firstName?.trim() && profile.lastName?.trim() && profile.city?.trim() ? 1 : null,
    profile.experience?.length > 0 ? 2 : null,
    profile.specialisations?.length > 0 ? 3 : null,
    profile.sectors?.length > 0 ? 4 : null,
    profile.salaryExpectation > 0 ? 5 : null,
    profile.availability?.trim() ? 6 : null,
    profile.availability?.trim() && profile.salaryExpectation > 0 ? 7 : null,
  ].filter(Boolean) as number[]
  const completeness = Math.round((completedSteps.length / 7) * 100)
  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference - (completeness / 100) * circumference

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
    } catch {}
    setSaving(false)
  }

  const handleCopyLink = () => {
    if (profile.shareSlug) {
      navigator.clipboard.writeText(`https://joblux.com/${profile.shareSlug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEmailShare = () => {
    if (profile.shareSlug) {
      const subject = encodeURIComponent('My JOBLUX Profile')
      const body = encodeURIComponent(`Please find my professional profile here: https://joblux.com/${profile.shareSlug}`)
      window.location.href = `mailto:?subject=${subject}&body=${body}`
    }
  }

  const handleResetLink = async () => {
    try {
      const res = await fetch('/api/profilux/reset-link', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setProfile(prev => ({ ...prev, shareSlug: data.slug }))
      }
    } catch {}
  }

  const handleToggleSharing = async (enabled: boolean) => {
    if (completeness !== 100 && enabled) return
    setProfile(prev => ({ ...prev, sharingEnabled: enabled }))
    if (enabled && !profile.shareSlug) {
      try {
        const res = await fetch('/api/profilux/reset-link', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          setProfile(prev => ({ ...prev, shareSlug: data.slug, sharingEnabled: true }))
        }
      } catch {}
    }
  }

  const applyCvPrefill = (parsed: any) => {
    if (!parsed || typeof parsed !== 'object') return
    const id = parsed.identity ?? {}
    setProfile(prev => {
      const patch: any = {}
      if (!prev.firstName?.trim() && typeof id.first_name === 'string' && id.first_name.trim()) patch.firstName = id.first_name
      if (!prev.lastName?.trim() && typeof id.last_name === 'string' && id.last_name.trim()) patch.lastName = id.last_name
      if (!prev.city?.trim() && typeof id.city === 'string' && id.city.trim()) patch.city = id.city
      if (!prev.nationality?.trim() && typeof id.nationality === 'string' && id.nationality.trim()) patch.nationality = id.nationality
      return { ...prev, ...patch }
    })
  }

  const mapParseError = (code: string | null): string => {
    switch (code) {
      case 'M6_NO_CV_UPLOADED': return 'Upload a CV first.'
      case 'M6_DOC_FORMAT_UNSUPPORTED': return 'Use PDF or .docx.'
      case 'M6_CV_TEXT_TOO_SHORT': return 'We could not read your CV. Try a text-based PDF.'
      case 'M6_PARSER_TIMEOUT': return 'Parsing timed out. Try again.'
      case 'M6_PARSER_FAILED':
      case 'M6_PARSER_INVALID_OUTPUT': return 'Parsing failed. Try again.'
      default: return 'Something went wrong. Try again.'
    }
  }

  const handleUploadClick = () => {
    setUploadError(null)
    fileInputRef.current?.click()
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const fd = new FormData()
      fd.append('cv', file)
      const res = await fetch('/api/members/cv-upload', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        const newPath = data?.path ?? data?.cv_url ?? null
        setCvUrl(newPath ?? 'uploaded')
        setCvParsedAt(null)
        setNeedsReviewCount(null)
      } else {
        setUploadError('Upload failed. Try again.')
      }
    } catch {
      setUploadError('Upload failed. Try again.')
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleParse = async () => {
    setParsing(true)
    setParseError(null)
    try {
      const res = await fetch('/api/members/cv-parse', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data?.success) {
        setCvParsedAt(typeof data?.parsed_at === 'string' ? data.parsed_at : new Date().toISOString())
        setNeedsReviewCount(typeof data?.needs_review_count === 'number' ? data.needs_review_count : null)
        applyCvPrefill(data?.parsed)
      } else {
        setParseError(mapParseError(data?.error ?? null))
      }
    } catch {
      setParseError(mapParseError(null))
    }
    setParsing(false)
  }

  const addExperience = () => {
    if (!newExp.role || !newExp.brand) return
    const entry: Experience = {
      id: Date.now().toString(),
      role: newExp.role || '',
      brand: newExp.brand || '',
      group: newExp.group || '',
      location: newExp.location || '',
      from: newExp.from || '',
      to: newExp.to || '',
      current: newExp.current || false,
    }
    setProfile(prev => ({ ...prev, experience: [...prev.experience, entry] }))
    setNewExp({ current: false })
    setShowAddExp(false)
  }

  const removeExperience = (id: string) => {
    setProfile(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }))
  }

  const formatSalary = (val: number, currency: string) => {
    const symbols: Record<string, string> = { EUR: '\u20ac', USD: '$', GBP: '\u00a3', AED: 'AED ' }
    const sym = symbols[currency] || '\u20ac'
    if (val >= 1000) return `${sym}${Math.round(val / 1000)}K`
    return `${sym}${val}`
  }

  const initials = profile.firstName && profile.lastName
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : (session?.user?.name ? session.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '?')

  const tipText: Record<number, { label: string; text: string }> = {
    1: { label: 'YOUR IDENTITY', text: 'Your personal information is only visible to the JOBLUX team. It is never published or shared without your consent.' },
    2: { label: 'YOUR HISTORY', text: 'Career history helps Mo understand your trajectory and match you to the right level of search assignment.' },
    3: { label: 'YOUR EXPERTISE', text: 'Functional expertise and languages are key matching criteria for search assignments across markets.' },
    4: { label: 'WHY THIS MATTERS', text: 'Sector and geography tags are how Mo matches you to confidential search assignments. The more precise, the better.' },
    5: { label: 'CONFIDENTIAL', text: 'Salary expectation is used only by Mo to ensure you are matched to appropriately scoped opportunities. Never shown publicly.' },
    6: { label: 'YOUR STATUS', text: 'Your availability status updates your matching priority. You can change this at any time from your dashboard.' },
    7: { label: 'FULL CONTROL', text: 'Share your profile only with people you choose. Reset the link at any time to instantly revoke access.' },
  }

  if (status === 'loading') return null

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#2a2a2a', border: '1px solid #3a3a3a',
    borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px',
    fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', color: '#1D9E75', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600, textTransform: 'uppercase' as const,
  }
  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    border: `1px solid ${active ? '#ffffff' : '#333'}`,
    color: active ? '#ffffff' : '#aaa',
    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
    fontFamily: 'Inter, sans-serif',
  })
  const navBtn = (dir: 'prev' | 'next'): React.CSSProperties => ({
    background: dir === 'next' ? '#ffffff' : 'transparent',
    border: dir === 'next' ? 'none' : '1px solid #444',
    color: dir === 'next' ? '#000' : '#aaa',
    fontSize: '13px', fontWeight: dir === 'next' ? 500 : 400,
    padding: '10px 24px', borderRadius: '4px', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  })

  const parsedDateLabel = (cvParsedAt && !isNaN(new Date(cvParsedAt).getTime()))
    ? new Date(cvParsedAt).toLocaleDateString()
    : 'recently'

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 32px' }}>

        {/* TOP BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px' }}>
          <div style={{ background: '#111111', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0' }}>
            <Link href="/dashboard" style={{ fontSize: '14px', color: '#aaa', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'Inter, sans-serif' }}>
              ← Dashboard
            </Link>
            <div style={{ fontSize: '17px', color: '#fff', letterSpacing: '0.08em', fontWeight: 500, fontFamily: 'Playfair Display, serif' }}>Profilux</div>
            <div style={{ width: '120px' }} />
          </div>
          <div style={{ background: '#111111', borderBottom: '1px solid #2a2a2a' }} />
        </div>

        {/* STEPS BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px', marginBottom: '32px' }}>
          <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '16px 0', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  color: currentStep === step.id ? '#fff' : completedSteps.includes(step.id) ? '#1D9E75' : '#666',
                  borderBottom: currentStep === step.id ? '2px solid #fff' : '2px solid transparent',
                  fontWeight: currentStep === step.id ? 500 : 400,
                  letterSpacing: '0.04em', whiteSpace: 'nowrap', flex: 1, textAlign: 'center' as const,
                }}
              >
                {completedSteps.includes(step.id) && currentStep !== step.id ? '\u2713 ' : ''}{step.label}
              </button>
            ))}
          </div>
          <div style={{ background: '#111', borderBottom: '1px solid #1e1e1e' }} />
        </div>

        {/* CV CARD — Phase 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px', marginBottom: '24px' }}>
          <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '20px 24px' }}>
            <div style={{ fontSize: '10px', color: '#1D9E75', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase' }}>CV</div>

            {!cvUrl && (
              <>
                <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px', fontWeight: 300 }}>Upload your CV to prefill your profile.</div>
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  style={{ background: '#fff', border: 'none', color: '#000', fontSize: '12px', padding: '8px 18px', borderRadius: '4px', cursor: uploading ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: uploading ? 0.5 : 1 }}
                >
                  {uploading ? 'Uploading...' : 'Upload CV'}
                </button>
              </>
            )}

            {cvUrl && !cvParsedAt && (
              <>
                <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px', fontWeight: 300 }}>
                  CV uploaded. <button onClick={handleUploadClick} disabled={uploading} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '13px', textDecoration: 'underline', textUnderlineOffset: '3px', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>{uploading ? 'Uploading...' : 'Replace'}</button>
                </div>
                <button
                  onClick={handleParse}
                  disabled={parsing}
                  style={{ background: '#fff', border: 'none', color: '#000', fontSize: '12px', padding: '8px 18px', borderRadius: '4px', cursor: parsing ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: parsing ? 0.5 : 1 }}
                >
                  {parsing ? 'Parsing...' : 'Parse CV'}
                </button>
              </>
            )}

            {cvUrl && cvParsedAt && (
              <>
                <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '14px', fontWeight: 300 }}>
                  CV parsed {parsedDateLabel}. <button onClick={handleUploadClick} disabled={uploading} style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '13px', textDecoration: 'underline', textUnderlineOffset: '3px', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}>{uploading ? 'Uploading...' : 'Replace'}</button>
                </div>
                <button
                  onClick={handleParse}
                  disabled={parsing}
                  style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', fontSize: '12px', padding: '8px 18px', borderRadius: '4px', cursor: parsing ? 'default' : 'pointer', fontFamily: 'Inter, sans-serif', opacity: parsing ? 0.5 : 1 }}
                >
                  {parsing ? 'Parsing...' : 'Re-parse'}
                </button>
              </>
            )}

            {(parseError || uploadError) && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#ff6b6b' }}>{parseError || uploadError}</div>
            )}

            {needsReviewCount !== null && needsReviewCount > 0 && (
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#888' }}>{needsReviewCount} {needsReviewCount === 1 ? 'item' : 'items'} to review</div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileSelected}
              style={{ display: 'none' }}
            />
          </div>
          <div />
        </div>

        {/* MAIN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '32px', paddingBottom: '80px' }}>

          {/* LEFT - STEPS CONTENT */}
          <div>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Personal information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>First name</label>
                    <input style={inputStyle} value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
                  </div>
                  <div>
                    <label style={labelStyle}>Last name</label>
                    <input style={inputStyle} value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Headline</label>
                  <input style={inputStyle} value={profile.headline} onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))} placeholder="e.g. Director of Retail, LVMH Group" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input style={inputStyle} value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Paris" />
                  </div>
                  <div>
                    <label style={labelStyle}>Nationality</label>
                    <input style={inputStyle} value={profile.nationality} onChange={e => setProfile(p => ({ ...p, nationality: e.target.value }))} placeholder="French" />
                  </div>
                </div>
                <div style={{ marginBottom: '28px' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' as const }} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="A brief professional introduction..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => { handleSave(); setCurrentStep(2) }} style={navBtn('next')}>Experience</button>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Career history</h2>
                {profile.experience.map(exp => (
                  <div key={exp.id} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '14px 16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{exp.role}</div>
                      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{exp.brand}{exp.group ? ` - ${exp.group}` : ''}{exp.location ? ` - ${exp.location}` : ''}</div>
                      <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{exp.from}{exp.current ? ' - Present' : exp.to ? ` - ${exp.to}` : ''}</div>
                    </div>
                    <button onClick={() => removeExperience(exp.id)} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '16px' }}>x</button>
                  </div>
                ))}
                {showAddExp ? (
                  <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '4px', padding: '18px', marginBottom: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Role / Title</label>
                        <input style={inputStyle} value={newExp.role || ''} onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))} placeholder="Director of Retail" />
                      </div>
                      <div>
                        <label style={labelStyle}>Brand</label>
                        <input style={inputStyle} value={newExp.brand || ''} onChange={e => setNewExp(p => ({ ...p, brand: e.target.value }))} placeholder="Chanel" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>Group (optional)</label>
                        <input style={inputStyle} value={newExp.group || ''} onChange={e => setNewExp(p => ({ ...p, group: e.target.value }))} placeholder="Chanel Group" />
                      </div>
                      <div>
                        <label style={labelStyle}>Location</label>
                        <input style={inputStyle} value={newExp.location || ''} onChange={e => setNewExp(p => ({ ...p, location: e.target.value }))} placeholder="Paris" />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={labelStyle}>From (year)</label>
                        <input style={inputStyle} value={newExp.from || ''} onChange={e => setNewExp(p => ({ ...p, from: e.target.value }))} placeholder="2018" />
                      </div>
                      <div>
                        <label style={labelStyle}>To (year)</label>
                        <input style={inputStyle} value={newExp.to || ''} onChange={e => setNewExp(p => ({ ...p, to: e.target.value }))} placeholder="2023" disabled={newExp.current} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <input type="checkbox" id="current" checked={newExp.current || false} onChange={e => setNewExp(p => ({ ...p, current: e.target.checked }))} />
                      <label htmlFor="current" style={{ fontSize: '12px', color: '#aaa', cursor: 'pointer' }}>Current position</label>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={addExperience} style={{ background: '#fff', border: 'none', color: '#000', fontSize: '12px', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add</button>
                      <button onClick={() => { setShowAddExp(false); setNewExp({ current: false }) }} style={{ background: 'transparent', border: '1px solid #444', color: '#aaa', fontSize: '12px', padding: '8px 18px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddExp(true)} style={{ background: 'transparent', border: '1px dashed #333', color: '#666', fontSize: '12px', padding: '10px 0', width: '100%', borderRadius: '4px', cursor: 'pointer', marginBottom: '28px', fontFamily: 'Inter, sans-serif' }}>
                    + Add position
                  </button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(1)} style={navBtn('prev')}>Personal</button>
                  <button onClick={() => { handleSave(); setCurrentStep(3) }} style={navBtn('next')}>Expertise</button>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Expertise & Languages</h2>
                <p style={{ fontSize: '13px', color: '#666', fontWeight: 300, margin: '0 0 24px', lineHeight: 1.7 }}>Select your functional areas and languages.</p>
                <label style={labelStyle}>Functional expertise</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {SPECIALISATIONS.map(s => (
                    <button key={s} onClick={() => setProfile(p => ({ ...p, specialisations: toggle(p.specialisations, s) }))} style={pillStyle(profile.specialisations.includes(s))}>
                      {s}
                    </button>
                  ))}
                </div>
                <label style={labelStyle}>Languages</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => setProfile(p => ({ ...p, languages: toggle(p.languages, l) }))} style={pillStyle(profile.languages.includes(l))}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(2)} style={navBtn('prev')}>Experience</button>
                  <button onClick={() => { handleSave(); setCurrentStep(4) }} style={navBtn('next')}>Sectors</button>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Sectors & Markets</h2>
                <p style={{ fontSize: '13px', color: '#666', fontWeight: 300, margin: '0 0 24px', lineHeight: 1.7 }}>Select the luxury sectors and geographies you operate in.</p>
                <label style={labelStyle}>Sectors</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {SECTORS.map(s => (
                    <button key={s} onClick={() => setProfile(p => ({ ...p, sectors: toggle(p.sectors, s) }))} style={pillStyle(profile.sectors.includes(s))}>
                      {s}
                    </button>
                  ))}
                </div>
                <label style={labelStyle}>Markets & Geographies</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {MARKETS.map(m => (
                    <button key={m} onClick={() => setProfile(p => ({ ...p, markets: toggle(p.markets, m) }))} style={pillStyle(profile.markets.includes(m))}>
                      {m}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(3)} style={navBtn('prev')}>Expertise</button>
                  <button onClick={() => { handleSave(); setCurrentStep(5) }} style={navBtn('next')}>Salary</button>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Salary expectation</h2>
                <p style={{ fontSize: '13px', color: '#666', fontWeight: 300, margin: '0 0 24px', lineHeight: 1.7 }}>Used only by Mo to match you to appropriately scoped opportunities. Never shown publicly.</p>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <select value={profile.salaryCurrency} onChange={e => setProfile(p => ({ ...p, salaryCurrency: e.target.value }))} style={{ ...inputStyle, width: '100px' }}>
                    {['EUR', 'USD', 'GBP', 'AED', 'CHF'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input type="range" min={40000} max={500000} step={5000} value={profile.salaryExpectation} onChange={e => setProfile(p => ({ ...p, salaryExpectation: Number(e.target.value) }))} style={{ flex: 1 }} />
                </div>
                <div style={{ textAlign: 'center', fontSize: '24px', color: '#fff', fontWeight: 300, marginBottom: '8px' }}>
                  {profile.salaryExpectation > 0 ? formatSalary(profile.salaryExpectation, profile.salaryCurrency) : 'Drag to set'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '28px' }}><span>40K</span><span>500K+</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(4)} style={navBtn('prev')}>Sectors</button>
                  <button onClick={() => { handleSave(); setCurrentStep(6) }} style={navBtn('next')}>Availability</button>
                </div>
              </div>
            )}

            {/* STEP 6 */}
            {currentStep === 6 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Availability</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {AVAILABILITY.map(opt => (
                    <button key={opt.value} onClick={() => setProfile(p => ({ ...p, availability: opt.value }))}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', border: `1px solid ${profile.availability === opt.value ? '#ffffff' : '#2a2a2a'}`, background: 'transparent', borderRadius: '4px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${profile.availability === opt.value ? '#ffffff' : '#444'}`, marginTop: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {profile.availability === opt.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff' }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', color: profile.availability === opt.value ? '#fff' : '#bbb', marginBottom: '3px' }}>{opt.label}</div>
                        <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(5)} style={navBtn('prev')}>Salary</button>
                  <button onClick={() => { handleSave(); setCurrentStep(7) }} style={navBtn('next')}>Share</button>
                </div>
              </div>
            )}

            {/* STEP 7 */}
            {currentStep === 7 && (
              <div style={{ marginBottom: '20px' }}>

                {/* COMPLETION HEADER */}
                <div style={{ background: '#111', border: `1px solid ${completeness === 100 ? '#1D9E75' : '#2a2a2a'}`, borderRadius: '8px', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: completeness === 100 ? '#1D9E75' : '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: completeness === 100 ? '20px' : '13px', color: '#fff', fontWeight: 500, flexShrink: 0 }}>
                    {completeness === 100 ? '\u2713' : `${completeness}%`}
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '22px', color: '#fff', margin: '0 0 4px' }}>
                      {completeness === 100 ? 'Profile complete' : `${completeness}% complete`}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#aaa', margin: 0, lineHeight: 1.7 }}>
                      {completeness === 100 ? 'JOBLUX will now match you to confidential search assignments.' : 'Complete all steps below to unlock sharing and matching.'}
                    </p>
                  </div>
                </div>

                {/* MISSING STEPS */}
                {completeness < 100 && (
                  <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '24px 28px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '16px' }}>What&apos;s missing</div>
                    {(!profile.firstName?.trim() || !profile.lastName?.trim()) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>First and last name</div>
                        <button onClick={() => setCurrentStep(1)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Personal &rarr;</button>
                      </div>
                    )}
                    {profile.experience?.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>Career history</div>
                        <button onClick={() => setCurrentStep(2)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Experience &rarr;</button>
                      </div>
                    )}
                    {profile.specialisations?.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>Functional expertise</div>
                        <button onClick={() => setCurrentStep(3)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Expertise &rarr;</button>
                      </div>
                    )}
                    {profile.sectors?.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>Sectors</div>
                        <button onClick={() => setCurrentStep(4)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Sectors &rarr;</button>
                      </div>
                    )}
                    {profile.salaryExpectation === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1e1e1e' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>Salary expectation</div>
                        <button onClick={() => setCurrentStep(5)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Salary &rarr;</button>
                      </div>
                    )}
                    {!profile.availability?.trim() && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#333', flexShrink: 0 }} />
                        <div style={{ fontSize: '13px', color: '#aaa', flex: 1 }}>Availability</div>
                        <button onClick={() => setCurrentStep(6)} style={{ fontSize: '12px', color: '#1D9E75', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Go to Availability &rarr;</button>
                      </div>
                    )}
                  </div>
                )}

                {/* 6-PANEL GRID - dimmed until 100% */}
                <div style={{ opacity: completeness === 100 ? 1 : 0.25, pointerEvents: completeness === 100 ? 'auto' : 'none' as const }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>

                    {/* PANEL 1 */}
                    <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Profile</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2a2a2a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#aaa', flexShrink: 0 }}>
                          {profile.firstName?.[0] || ''}{profile.lastName?.[0] || ''}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{profile.firstName} {profile.lastName}</div>
                          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>{profile.headline || 'No headline yet'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', flex: 1, marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #1e1e1e' }}>
                          <span style={{ color: '#aaa' }}>Sectors</span>
                          <span style={{ color: '#ccc' }}>{profile.sectors?.slice(0, 2).join(' - ') || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid #1e1e1e' }}>
                          <span style={{ color: '#aaa' }}>Markets</span>
                          <span style={{ color: '#ccc' }}>{profile.markets?.slice(0, 2).join(' - ') || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0' }}>
                          <span style={{ color: '#aaa' }}>Availability</span>
                          <span style={{ color: '#1D9E75' }}>{profile.availability ? 'Considering opportunities' : '-'}</span>
                        </div>
                      </div>
                      {profile.shareSlug && profile.sharingEnabled ? (
                        <a href={`/${profile.shareSlug}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', padding: '9px', border: '0.5px solid #1D9E75', borderRadius: '5px', fontSize: '12px', color: '#1D9E75', textDecoration: 'none' }}>
                          View public profile
                        </a>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '9px', border: '0.5px solid #2a2a2a', borderRadius: '5px', fontSize: '12px', color: '#555' }}>
                          Enable sharing to view
                        </div>
                      )}
                    </div>

                    {/* PANEL 2 */}
                    <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Download</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '16px', color: '#fff', margin: '0 0 8px' }}>Export PDF</h3>
                        <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8, margin: '0 0 16px' }}>Download a formatted JOBLUX profile document.</p>
                        <div style={{ background: '#0f0f0f', border: '0.5px solid #222', borderRadius: '5px', padding: '12px' }}>
                          <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '3px' }}>PDF - Formatted document</div>
                          <div style={{ fontSize: '11px', color: '#666' }}>Name - Role - Experience - Expertise</div>
                        </div>
                      </div>
                      <button onClick={handleSave} disabled={saving} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px', background: 'transparent', border: '0.5px solid #444', borderRadius: '5px', fontSize: '12px', color: '#ccc', cursor: 'pointer', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>
                        {saving ? 'Saving...' : 'Download PDF'}
                      </button>
                    </div>

                    {/* PANEL 3 */}
                    <div style={{ background: '#141414', border: `0.5px solid ${profile.sharingEnabled ? '#1D9E75' : '#2a2a2a'}`, borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: profile.sharingEnabled ? '#1D9E75' : '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>
                        {profile.sharingEnabled ? 'Sharing active' : 'Enable sharing'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '16px', color: '#fff', margin: '0 0 8px' }}>Private link</h3>
                        <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8, margin: '0 0 16px' }}>Generate a private link to share with specific people.</p>
                        <div style={{ background: '#0f0f0f', border: '0.5px solid #222', borderRadius: '5px', padding: '12px' }}>
                          <div style={{ fontSize: '12px', color: profile.sharingEnabled ? '#1D9E75' : '#ccc', marginBottom: '3px' }}>
                            {profile.sharingEnabled ? 'Sharing enabled' : 'Profile is private'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#666' }}>
                            {profile.sharingEnabled ? 'Link is active' : 'Toggle on to generate your private link'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#ccc' }}>Enable sharing</span>
                        <label style={{ position: 'relative', width: '44px', height: '24px', flexShrink: 0, cursor: 'pointer' }}>
                          <input type="checkbox" checked={profile.sharingEnabled} onChange={e => handleToggleSharing(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                          <span style={{ position: 'absolute', inset: 0, background: profile.sharingEnabled ? '#1D9E75' : '#2a2a2a', borderRadius: '12px', border: `1px solid ${profile.sharingEnabled ? '#1D9E75' : '#333'}` }}>
                            <span style={{ position: 'absolute', width: '18px', height: '18px', left: profile.sharingEnabled ? '22px' : '2px', top: '2px', background: '#fff', borderRadius: '50%', transition: '0.2s' }} />
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* PANEL 4 */}
                    <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Copy link</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '16px', color: '#fff', margin: '0 0 8px' }}>Copy to clipboard</h3>
                        <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8, margin: '0 0 16px' }}>Copy your link and paste it anywhere.</p>
                        <div style={{ background: '#0f0f0f', border: '0.5px solid #222', borderRadius: '5px', padding: '12px' }}>
                          <span style={{ fontSize: '12px', color: '#aaa', fontFamily: 'monospace' }}>
                            {profile.shareSlug ? `joblux.com/${profile.shareSlug}` : 'joblux.com/p/-'}
                          </span>
                        </div>
                      </div>
                      <button onClick={handleCopyLink} disabled={!profile.sharingEnabled || !profile.shareSlug} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px', background: 'transparent', border: '0.5px solid #444', borderRadius: '5px', fontSize: '12px', color: !profile.sharingEnabled ? '#555' : '#ccc', cursor: !profile.sharingEnabled ? 'not-allowed' : 'pointer', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>
                        {copied ? 'Copied!' : 'Copy to clipboard'}
                      </button>
                    </div>

                    {/* PANEL 5 */}
                    <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Send by email</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '16px', color: '#fff', margin: '0 0 8px' }}>Email your profile</h3>
                        <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8, margin: '0 0 16px' }}>Opens your email client with your profile link pre-filled.</p>
                        <div style={{ background: '#0f0f0f', border: '0.5px solid #222', borderRadius: '5px', padding: '10px' }}>
                          <div style={{ fontSize: '11px', color: '#666' }}>Link sent directly - discreet and personal</div>
                        </div>
                      </div>
                      <button onClick={handleEmailShare} disabled={!profile.sharingEnabled || !profile.shareSlug} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px', background: 'transparent', border: '0.5px solid #444', borderRadius: '5px', fontSize: '12px', color: !profile.sharingEnabled ? '#555' : '#ccc', cursor: !profile.sharingEnabled ? 'not-allowed' : 'pointer', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>
                        Send profile
                      </button>
                    </div>

                    {/* PANEL 6 */}
                    <div style={{ background: '#141414', border: '0.5px solid #2a2a2a', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: '14px' }}>Reset link</div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '16px', color: '#fff', margin: '0 0 8px' }}>Generate new link</h3>
                        <p style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.8, margin: '0 0 16px' }}>Instantly revoke access from anyone who had your previous link.</p>
                        <div style={{ background: '#0f0f0f', border: '0.5px solid #222', borderRadius: '5px', padding: '12px' }}>
                          <div style={{ fontSize: '11px', color: '#666', lineHeight: 1.6 }}>Use this if you want to revoke access from a previous share.</div>
                        </div>
                      </div>
                      <button onClick={handleResetLink} disabled={!profile.sharingEnabled || !profile.shareSlug} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '10px', background: 'transparent', border: '0.5px solid #444', borderRadius: '5px', fontSize: '12px', color: !profile.sharingEnabled ? '#555' : '#ccc', cursor: !profile.sharingEnabled ? 'not-allowed' : 'pointer', marginTop: '16px', fontFamily: 'Inter, sans-serif' }}>
                        Generate new link
                      </button>
                    </div>

                  </div>
                </div>

                {/* Back nav */}
                <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid #2a2a2a', paddingTop: '20px', marginTop: '20px' }}>
                  <button onClick={() => setCurrentStep(6)} style={navBtn('prev')}>Availability</button>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT - SIDEBAR */}
          <div style={{ position: 'sticky', top: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2a2a2a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#aaa', marginBottom: '10px' }}>
                {initials}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#fff', marginBottom: '2px' }}>
                {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your name'}
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '10px', fontWeight: 300 }}>
                {profile.headline || 'Your headline'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                {profile.sectors.slice(0, 2).map(s => (
                  <span key={s} style={{ fontSize: '9px', border: '1px solid #333', color: '#aaa', padding: '2px 7px', borderRadius: '2px' }}>{s}</span>
                ))}
                {profile.city && <span style={{ fontSize: '9px', border: '1px solid #333', color: '#aaa', padding: '2px 7px', borderRadius: '2px' }}>{profile.city}</span>}
              </div>
              <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '12px' }}>
                {[
                  { k: 'Experience', v: profile.experience.length > 0 ? `${profile.experience.length} position${profile.experience.length > 1 ? 's' : ''}` : 'None added' },
                  { k: 'Languages', v: profile.languages.length > 0 ? profile.languages.slice(0, 3).join(', ') : 'None added' },
                  { k: 'Availability', v: AVAILABILITY.find(a => a.value === profile.availability)?.label || 'Not set' },
                  { k: 'Sharing', v: profile.sharingEnabled ? 'Link active' : 'Private' },
                ].map(row => (
                  <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '7px' }}>
                    <span style={{ color: '#aaa' }}>{row.k}</span>
                    <span style={{ color: '#ccc' }}>{row.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '10px', marginTop: '4px', fontSize: '10px', color: '#555', fontWeight: 300 }}>
                Profile preview - as seen by JOBLUX
              </div>
            </div>

            <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '0.08em', marginBottom: '9px' }}>
                {tipText[currentStep]?.label || 'NOTE'}
              </div>
              <div style={{ fontSize: '12px', color: '#aaa', lineHeight: 1.7, fontWeight: 300 }}>
                {tipText[currentStep]?.text || ''}
              </div>
            </div>

            <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '18px', textAlign: 'center' }}>
              <svg width="52" height="52" viewBox="0 0 52 52" style={{ marginBottom: '8px' }}>
                <circle cx="26" cy="26" r="20" fill="none" stroke="#1e1e1e" strokeWidth="3" />
                <circle cx="26" cy="26" r="20" fill="none" stroke="#1D9E75" strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 26 26)"
                />
                <text x="26" y="31" textAnchor="middle" fontSize="11" fill="#fff" fontFamily="Inter, sans-serif">{completeness}%</text>
              </svg>
              <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 300 }}>
                {completeness === 100 ? 'Profile complete' : `${7 - completedSteps.length} step${7 - completedSteps.length !== 1 ? 's' : ''} remaining`}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
