'use client'

import { useState, useEffect } from 'react'
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
  // Fashion & Lifestyle
  'Fashion & Apparel', 'Leather Goods & Accessories', 'Footwear', 'Eyewear', 'Lingerie & Swimwear',
  // Watches & Jewellery
  'Fine Jewellery', 'Watches & Horology', 'High Jewellery', 'Silverware',
  // Beauty & Wellness
  'Perfumes & Cosmetics', 'Skincare', 'Hair & Grooming', 'Wellness & Spa',
  // Hospitality & Travel
  'Luxury Hotels & Resorts', 'Private Members Clubs', 'Cruise & Yachting', 'Private Aviation', 'Travel Retail',
  // Food & Beverage
  'Fine Dining & Gastronomy', 'Wines & Champagne', 'Spirits & Cognac', 'Gourmet & Epicerie',
  // Art & Culture
  'Art & Collectibles', 'Auction Houses', 'Galleries & Museums', 'Cultural Events',
  // Real Estate & Interior
  'Luxury Real Estate', 'Interior Design & Architecture', 'Furniture & Décor', 'Lighting',
  // Financial & Professional
  'Private Banking & Wealth Management', 'Family Office', 'Luxury Consulting', 'Legal for Luxury',
  // Automotive & Mobility
  'Luxury Automotive', 'Supercars', 'Motorcycles', 'Electric Luxury',
  // Tech & Innovation
  'Luxury Tech', 'Wearables', 'Digital Luxury',
  // Multi-channel
  'Multi-brand Retail', 'Department Stores', 'Concept Stores', 'Franchise & Licensing', 'Sustainability & Circular Luxury',
]

const SPECIALISATIONS = [
  // Sales & Client
  'Client Advisor', 'Sales Management', 'Key Account Management', 'Business Development',
  'Wholesale', 'Travel Retail', 'Concession Management', 'Pop-up & Events Sales',
  'VIP & Private Client', 'After-Sales & Repair',
  // Retail Operations
  'Store Management', 'Area & Regional Management', 'Retail Excellence', 'VM & Display',
  'Loss Prevention', 'Retail Analytics', 'Omnichannel', 'E-commerce Operations',
  // Creative & Design
  'Creative Direction', 'Fashion Design', 'Jewellery & Watchmaking Design', 'Art Direction',
  'Styling', 'Textile & Materials', 'Packaging Design', 'Set & Window Design',
  // Product & Buying
  'Buying', 'Merchandising', 'Product Development', 'Planning & Allocation',
  'Licensing', 'Sourcing & Production',
  // Marketing & Comms
  'Brand Management', 'Communications & PR', 'Digital Marketing', 'Social Media & Content',
  'Influencer & Ambassador', 'Events & Experiential', 'CRM & Loyalty', 'Editorial',
  // People & Culture
  'HR & Talent', 'Training & Development', 'Recruitment', 'Retail Coaching', 'Diversity & Inclusion',
  // Finance & Strategy
  'Finance & Controlling', 'Strategy & Consulting', 'M&A', 'Investor Relations',
  'Legal & Compliance', 'Sustainability & CSR',
  // Tech & Data
  'IT & Digital', 'Data & Analytics', 'CRM Systems', 'ERP & Retail Tech',
  // Supply Chain
  'Supply Chain & Logistics', 'Operations', 'Sourcing', 'Quality Control',
  // Other
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
  { value: 'open', label: 'Open to approaches', desc: 'Not actively searching but will consider' },
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
    if (status === 'unauthenticated') router.push('/members')
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

  // Live completeness — recalculates on every profile change
  const completedSteps = [
    profile.firstName?.trim() && profile.lastName?.trim() && profile.city?.trim() ? 1 : null,
    profile.experience?.length > 0 ? 2 : null,
    profile.specialisations?.length > 0 ? 3 : null,
    profile.sectors?.length > 0 ? 4 : null,
    profile.salaryExpectation > 0 ? 5 : null,
    profile.availability?.trim() ? 6 : null,
    profile.sharingEnabled ? 7 : null,
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
    const symbols: Record<string, string> = { EUR: '€', USD: '$', GBP: '£', AED: 'AED ' }
    const sym = symbols[currency] || '€'
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
    fontSize: '10px', color: '#9B6B4A', letterSpacing: '0.1em', marginBottom: '8px', display: 'block', fontWeight: 600, textTransform: 'uppercase' as const,
  }
  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    border: `1px solid ${active ? '#ffffff' : '#333'}`,
    color: active ? '#ffffff' : '#888',
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

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* TOP BAR — py-28px, no Export PDF */}
      <div style={{ background: '#111111', borderBottom: '1px solid #2a2a2a', padding: '0 32px' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/dashboard/candidate" style={{ color: '#aaa', fontSize: '12px', textDecoration: 'none' }}>
              ⟵ Dashboard
            </Link>
            <div style={{ width: '1px', height: '14px', background: '#2a2a2a' }} />
            <span style={{ fontSize: '12px', color: '#999' }}>
              Profilux · <span style={{ color: '#ccc' }}>Building your profile</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'transparent', border: '1px solid #9B6B4A', color: '#9B6B4A',
              fontSize: '10px', letterSpacing: '0.1em', padding: '4px 12px', fontWeight: 600,
              borderRadius: '3px',
            }}>
              {(({ emerging_professional: 'Emerging Pro', established_professional: 'Established Pro', senior_executive: 'Senior & Executive', luxury_employer: 'Luxury Employer', trusted_contributor: 'Trusted Contributor', professional: 'Established Pro', business: 'Luxury Employer', insider: 'Trusted Contributor', member: 'Member', executive: 'Senior & Executive', admin: 'Admin' } as any)[(session?.user as any)?.role] || (session?.user as any)?.role?.toUpperCase() || 'MEMBER')}
            </span>
            <button onClick={handleSave} disabled={saving} style={{
              background: '#ffffff', border: 'none', color: '#000',
              fontSize: '11px', fontWeight: 700, padding: '6px 14px', borderRadius: '4px',
              cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            }}>
              {saving ? 'Saving...' : 'Save draft'}
            </button>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #222', padding: '0 32px' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '22px 0 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px',
        }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '28px', margin: '0 0 5px', color: '#fff' }}>
              Your <span style={{ fontStyle: 'italic', color: '#ffffff' }}>intelligence</span> profile
            </h1>
            <p style={{ fontSize: '13px', color: '#555', margin: 0, fontWeight: 300 }}>
              A confidential professional dossier, visible only to JOBLUX and who you choose to share with.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.06em', marginBottom: '4px' }}>PROFILE COMPLETENESS</div>
              <div style={{ fontSize: '20px', color: '#fff' }}>{completeness}%</div>
              <div style={{ fontSize: '10px', color: '#555' }}>{completedSteps.length} of 7 sections</div>
            </div>
            <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
              <svg width="48" height="48" viewBox="0 0 48 48" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="24" cy="24" r="20" fill="none" stroke="#2a2a2a" strokeWidth="3.5" />
                <circle cx="24" cy="24" r="20" fill="none" stroke="#ffffff" strokeWidth="3.5"
                  strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#ffffff', fontWeight: 500 }}>
                {completeness}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div style={{ background: '#1a1a1a', borderBottom: '1px solid #222', padding: '0 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'stretch' }}>
              <button
                onClick={() => setCurrentStep(step.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '13px 18px',
                  background: 'transparent', border: 'none',
                  borderBottom: currentStep === step.id ? '2px solid #ffffff' : completedSteps.includes(step.id) ? '2px solid #9B6B4A' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: completedSteps.includes(step.id) ? '#9B6B4A' : currentStep === step.id ? '#ffffff' : '#222',
                  border: `1px solid ${completedSteps.includes(step.id) ? '#9B6B4A' : currentStep === step.id ? '#ffffff' : '#444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px',
                  color: completedSteps.includes(step.id) ? '#000' : currentStep === step.id ? '#000' : '#555', fontWeight: 700,
                }}>
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                <span style={{
                  fontSize: '12px', fontFamily: 'Inter, sans-serif',
                  color: completedSteps.includes(step.id) ? '#9B6B4A' : currentStep === step.id ? '#ffffff' : '#666', fontWeight: completedSteps.includes(step.id) || currentStep === step.id ? 600 : 500,
                }}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && <div style={{ width: '1px', background: '#222', margin: '10px 0', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: '28px 32px', minHeight: 'calc(100vh - 280px)' }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start',
        }}>

          {/* FORM COLUMN */}
          <div>

            {/* STEP 1: PERSONAL */}
            {currentStep === 1 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Personal information</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={labelStyle}>FIRST NAME</label><input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} placeholder="·" style={inputStyle} /></div>
                  <div><label style={labelStyle}>LAST NAME</label><input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} placeholder="·" style={inputStyle} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div><label style={labelStyle}>CURRENT CITY</label><input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="·" style={inputStyle} /></div>
                  <div><label style={labelStyle}>NATIONALITY</label><input value={profile.nationality} onChange={e => setProfile(p => ({ ...p, nationality: e.target.value }))} placeholder="·" style={inputStyle} /></div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>PROFESSIONAL HEADLINE</label>
                  <input value={profile.headline} onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))} placeholder="·" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>SHORT BIO <span style={{ color: '#444', fontSize: '10px' }}>(optional)</span></label>
                  <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="·" rows={3} style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => { setCurrentStep(2) }} style={navBtn('next')}>Experience →</button>
                </div>
              </div>
            )}

            {/* STEP 2: EXPERIENCE */}
            {currentStep === 2 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Career history</h2>
                {profile.experience.map(exp => (
                  <div key={exp.id} style={{ border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{exp.role}</div>
                        <div style={{ fontSize: '13px', color: '#cccccc', marginTop: '2px' }}>{exp.brand}{exp.group ? ` · ${exp.group}` : ''}</div>
                        <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{exp.from}{exp.current ? ' — Present' : exp.to ? ` — ${exp.to}` : ''}{exp.location ? ` · ${exp.location}` : ''}</div>
                      </div>
                      <button onClick={() => removeExperience(exp.id)} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Remove</button>
                    </div>
                  </div>
                ))}
                {showAddExp ? (
                  <div style={{ border: '1px solid #333', borderRadius: '4px', padding: '20px', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {[
                        { label: 'ROLE TITLE', key: 'role', placeholder: 'Senior Retail Manager' },
                        { label: 'BRAND', key: 'brand', placeholder: 'Louis Vuitton' },
                        { label: 'GROUP (optional)', key: 'group', placeholder: 'LVMH' },
                        { label: 'LOCATION', key: 'location', placeholder: 'Paris' },
                        { label: 'FROM', key: 'from', placeholder: 'Jan 2020' },
                        { label: 'TO', key: 'to', placeholder: 'Dec 2023' },
                      ].map(f => (
                        <div key={f.key}>
                          <label style={{ ...labelStyle, fontSize: '10px' }}>{f.label}</label>
                          <input value={(newExp as any)[f.key] || ''} onChange={e => setNewExp(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} disabled={f.key === 'to' && !!newExp.current} style={{ ...inputStyle, background: f.key === 'to' && newExp.current ? '#111' : '#1a1a1a', color: f.key === 'to' && newExp.current ? '#444' : '#fff' }} />
                        </div>
                      ))}
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '16px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={newExp.current || false} onChange={e => setNewExp(p => ({ ...p, current: e.target.checked }))} />
                      This is my current position
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={addExperience} style={navBtn('next')}>Add position</button>
                      <button onClick={() => setShowAddExp(false)} style={navBtn('prev')}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddExp(true)} style={{ border: '1px dashed #333', background: 'transparent', color: '#555', fontSize: '12px', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', marginBottom: '24px' }}>
                    + Add position
                  </button>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px', marginTop: '8px' }}>
                  <button onClick={() => setCurrentStep(1)} style={navBtn('prev')}>← Personal</button>
                  <button onClick={() => { setCurrentStep(3) }} style={navBtn('next')}>Expertise →</button>
                </div>
              </div>
            )}

            {/* STEP 3: EXPERTISE & LANGUAGES */}
            {currentStep === 3 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Expertise & languages</h2>
                <label style={labelStyle}>FUNCTIONAL SPECIALISATIONS</label>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Your area of professional expertise.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {SPECIALISATIONS.map(s => <button key={s} onClick={() => setProfile(p => ({ ...p, specialisations: toggle(p.specialisations, s) }))} style={pillStyle(profile.specialisations.includes(s))}>{s}</button>)}
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 0 24px' }} />
                <label style={labelStyle}>LANGUAGES</label>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Languages you work in professionally.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {LANGUAGES.map(l => <button key={l} onClick={() => setProfile(p => ({ ...p, languages: toggle(p.languages, l) }))} style={pillStyle(profile.languages.includes(l))}>{l}</button>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(2)} style={navBtn('prev')}>← Experience</button>
                  <button onClick={() => { setCurrentStep(4) }} style={navBtn('next')}>Sectors →</button>
                </div>
              </div>
            )}

            {/* STEP 4: SECTORS */}
            {currentStep === 4 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Sectors & geographies</h2>
                <label style={labelStyle}>SECTORS OF EXPERTISE</label>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Select all that apply.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                  {SECTORS.map(s => <button key={s} onClick={() => setProfile(p => ({ ...p, sectors: toggle(p.sectors, s) }))} style={pillStyle(profile.sectors.includes(s))}>{s}</button>)}
                </div>
                <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 0 24px' }} />
                <label style={labelStyle}>MARKETS & GEOGRAPHIES</label>
                <p style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Where are you open to working?</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {MARKETS.map(m => <button key={m} onClick={() => setProfile(p => ({ ...p, markets: toggle(p.markets, m) }))} style={pillStyle(profile.markets.includes(m))}>{m}</button>)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(3)} style={navBtn('prev')}>← Expertise</button>
                  <button onClick={() => { setCurrentStep(5) }} style={navBtn('next')}>Salary →</button>
                </div>
              </div>
            )}

            {/* STEP 5: SALARY */}
            {currentStep === 5 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Salary expectation</h2>
                <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, margin: '0 0 28px', lineHeight: 1.7 }}>Used by Mo to match you to appropriately scoped search assignments. Never shown publicly.</p>
                <label style={labelStyle}>ANNUAL GROSS SALARY EXPECTATION</label>
                <div style={{ textAlign: 'center', fontSize: '28px', color: '#ffffff', fontWeight: 400, margin: '16px 0' }}>{formatSalary(profile.salaryExpectation, profile.salaryCurrency)} / year</div>
                <input type="range" min="0" max="500000" step="5000" value={profile.salaryExpectation} onChange={e => setProfile(p => ({ ...p, salaryExpectation: Number(e.target.value) }))} style={{ width: '100%', accentColor: '#ffffff', marginBottom: '8px' }} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                  {['EUR', 'USD', 'GBP', 'AED'].map(c => (
                    <button key={c} onClick={() => setProfile(p => ({ ...p, salaryCurrency: c }))} style={{ padding: '6px 16px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${profile.salaryCurrency === c ? '#ffffff' : '#333'}`, color: profile.salaryCurrency === c ? '#ffffff' : '#666', background: profile.salaryCurrency === c ? 'rgba(255,255,255,0.08)' : 'transparent', fontFamily: 'Inter, sans-serif' }}>{c}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '28px' }}><span>€40K</span><span>€500K+</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(4)} style={navBtn('prev')}>← Sectors</button>
                  <button onClick={() => { setCurrentStep(6) }} style={navBtn('next')}>Availability →</button>
                </div>
              </div>
            )}

            {/* STEP 6: AVAILABILITY */}
            {currentStep === 6 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Availability</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {AVAILABILITY.map(opt => (
                    <button key={opt.value} onClick={() => setProfile(p => ({ ...p, availability: opt.value }))}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', border: `1px solid ${profile.availability === opt.value ? '#ffffff' : '#2a2a2a'}`, background: profile.availability === opt.value ? 'rgba(165,142,40,0.04)' : 'transparent', borderRadius: '4px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
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
                  <button onClick={() => setCurrentStep(5)} style={navBtn('prev')}>← Salary</button>
                  <button onClick={() => { setCurrentStep(7) }} style={navBtn('next')}>Share →</button>
                </div>
              </div>
            )}

            {/* STEP 7: SHARE */}
            {currentStep === 7 && (
              <div style={{ background: '#222', border: '1px solid #333', borderRadius: '6px', padding: '28px', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Profile sharing</h2>
                <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, margin: '0 0 28px', lineHeight: 1.7 }}>Your profile is private by default. You decide if, when, and with whom you share it.</p>
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '13px', flexShrink: 0 }}>🔒</div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '2px' }}>Your profile is private</div>
                    <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>Not indexed by Google, Bing, or any search engine.</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#ccc' }}>Enable sharing</div>
                    <div style={{ fontSize: '11px', color: '#555', fontWeight: 300, marginTop: '2px' }}>Activate your private link to share with specific people</div>
                  </div>
                  <label style={{ position: 'relative', width: '40px', height: '22px', flexShrink: 0, cursor: 'pointer' }}>
                    <input type="checkbox" checked={profile.sharingEnabled} onChange={e => handleToggleSharing(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                    <span style={{ position: 'absolute', inset: 0, background: completeness !== 100 ? '#1a1a1a' : profile.sharingEnabled ? 'rgba(255,255,255,0.15)' : '#2a2a2a', borderRadius: '11px', border: `1px solid ${completeness !== 100 ? '#333' : profile.sharingEnabled ? '#ffffff' : '#333'}` }}>
                      <span style={{ position: 'absolute', width: '16px', height: '16px', left: profile.sharingEnabled ? '20px' : '2px', top: '2px', background: profile.sharingEnabled ? '#ffffff' : '#555', borderRadius: '50%', transition: '0.2s' }} />
                    </span>
                  </label>
                </div>
                {profile.sharingEnabled && profile.shareSlug && (
                  <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '14px 16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>joblux.com/<span style={{ color: '#ffffff' }}>{profile.shareSlug}</span></span>
                      <button onClick={handleResetLink} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', flexShrink: 0 }}>Reset link</button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#444', fontWeight: 300, lineHeight: 1.6 }}>Resetting instantly revokes anyone who had the previous link.</div>
                  </div>
                )}
                {profile.sharingEnabled && (
                  <>
                    <div style={{ borderTop: '1px solid #2a2a2a', margin: '20px 0 16px' }} />
                    <label style={labelStyle}>SHARE VIA</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                      {[
                        { icon: '⎘', title: copied ? '✓ Copied!' : 'Copy link', desc: 'Copy your private profile URL to clipboard', action: handleCopyLink },
                        { icon: '↓', title: 'Download PDF', desc: 'Export a formatted JOBLUX profile document', action: handleSave },
                        { icon: '✉', title: 'Send by email', desc: 'Opens your email client with your profile link pre-filled', action: handleEmailShare },
                      ].map(btn => (
                        <button key={btn.title} onClick={btn.action} style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '13px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#aaaaaa', flexShrink: 0 }}>{btn.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '2px' }}>{btn.title}</div>
                            <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>{btn.desc}</div>
                          </div>
                          <span style={{ fontSize: '12px', color: '#333' }}>→</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px 18px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.08em', marginBottom: '10px' }}>OUR COMMITMENT TO YOU</div>
                  {[
                    'Your profile is never indexed by Google, Bing, or any search engine',
                    'JOBLUX never shares your data with third parties',
                    'Your profile is never used to promote JOBLUX publicly',
                    'You can delete your profile and all data at any time',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#555', fontWeight: 300, lineHeight: 1.6, marginBottom: '7px' }}>
                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#444', flexShrink: 0, marginTop: '7px' }} />
                      {item}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid #2a2a2a', paddingTop: '20px' }}>
                  <button onClick={() => setCurrentStep(6)} style={navBtn('prev')}>← Availability</button>
                </div>
              </div>
            )}

            {/* COMPLETION */}
            {currentStep === 7 && completedSteps.length >= 6 && (
              <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '32px 28px', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '18px', color: '#ffffff' }}>✓</div>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '22px', color: '#fff', margin: '0 0 8px' }}>Profile complete</h2>
                <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, lineHeight: 1.7, margin: '0 0 24px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Your intelligence profile is ready. Mo will review it and match you to relevant search assignments confidentially.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={handleSave} style={{ background: '#ffffff', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '11px 26px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>↓ Download profile</button>
                  <Link href={`/${profile.shareSlug || ''}`} style={{ background: 'transparent', border: '1px solid #333', color: '#888', fontSize: '13px', padding: '11px 20px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>View my profile →</Link>
                  <Link href="/dashboard/candidate" style={{ background: 'transparent', border: '1px solid #333', color: '#888', fontSize: '13px', padding: '11px 20px', borderRadius: '4px', textDecoration: 'none', display: 'inline-block' }}>⟵ Dashboard</Link>
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR — no gold on avatar or badge */}
          <div style={{ position: 'sticky', top: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2a2a2a', border: '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#888', marginBottom: '12px', fontWeight: 500 }}>
                {initials}
              </div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '15px', color: '#fff', marginBottom: '2px' }}>
                {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your name'}
              </div>
              <div style={{ fontSize: '11px', color: '#777', marginBottom: '10px', fontWeight: 300 }}>
                {profile.headline || 'Your headline'}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
                <span style={{ fontSize: '9px', border: '1px solid #444', color: '#777', padding: '2px 7px', borderRadius: '2px' }}>
                  {(({ emerging_professional: 'Emerging Pro', established_professional: 'Established Pro', senior_executive: 'Senior & Executive', luxury_employer: 'Luxury Employer', trusted_contributor: 'Trusted Contributor', professional: 'Established Pro', business: 'Luxury Employer', insider: 'Trusted Contributor', member: 'Member', executive: 'Senior & Executive', admin: 'Admin' } as any)[(session?.user as any)?.role] || (session?.user as any)?.role?.toUpperCase() || 'MEMBER')}
                </span>
                {profile.sectors.slice(0, 2).map(s => (
                  <span key={s} style={{ fontSize: '9px', border: '1px solid #333', color: '#555', padding: '2px 7px', borderRadius: '2px' }}>{s.split(' ')[0]}</span>
                ))}
                {profile.city && <span style={{ fontSize: '9px', border: '1px solid #333', color: '#555', padding: '2px 7px', borderRadius: '2px' }}>{profile.city.split(',')[0]}</span>}
              </div>
              <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '12px' }}>
                {[
                  { k: 'Experience', v: profile.experience.length > 0 ? `${profile.experience.length} position${profile.experience.length > 1 ? 's' : ''}` : 'Not set' },
                  { k: 'Languages', v: profile.languages.length > 0 ? profile.languages.slice(0, 3).map(l => l.slice(0, 2).toUpperCase()).join(' · ') : 'Not set' },
                  { k: 'Availability', v: AVAILABILITY.find(a => a.value === profile.availability)?.label || 'Not set' },
                  { k: 'Sharing', v: profile.sharingEnabled ? 'Link active' : 'Private' },
                ].map(row => (
                  <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '7px' }}>
                    <span style={{ color: '#555' }}>{row.k}</span>
                    <span style={{ color: '#777' }}>{row.v}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '10px', marginTop: '4px', fontSize: '10px', color: '#3a3a3a', textAlign: 'center', fontWeight: 300 }}>
                Profile preview · as seen by JOBLUX
              </div>
            </div>
            <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '18px' }}>
              <div style={{ fontSize: '10px', color: '#666', letterSpacing: '0.08em', marginBottom: '9px' }}>
                {tipText[currentStep]?.label || 'NOTE'}
              </div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.7, fontWeight: 300 }}>
                {tipText[currentStep]?.text || ''}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
