'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const STEPS = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Experience' },
  { id: 3, label: 'Expertise' },
  { id: 4, label: 'Languages' },
  { id: 5, label: 'Sectors' },
  { id: 6, label: 'Salary' },
  { id: 7, label: 'Availability' },
  { id: 8, label: 'Visibility' },
  { id: 9, label: 'Share' },
]

const SECTORS = [
  'Fashion & Apparel', 'Watches & Jewellery', 'Perfumes & Cosmetics',
  'Fine Dining & Hospitality', 'Retail Excellence', 'Private Banking',
  'Real Estate', 'Art & Collectibles', 'Yachting & Aviation', 'Wines & Spirits',
]

const SPECIALISATIONS = [
  'Retail Management', 'Client Experience', 'Team Leadership', 'Merchandising',
  'Visual Identity', 'Training & Development', 'Commercial Strategy', 'Operations',
]

const MARKETS = [
  'France', 'Western Europe', 'Middle East', 'Asia Pacific', 'Americas', 'Global (open to relocation)',
]

const LANGUAGES = [
  'French', 'English', 'Italian', 'Spanish', 'Arabic', 'Mandarin', 'Japanese', 'German', 'Russian', 'Portuguese',
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
  availability: string
  sharingEnabled: boolean
  shareSlug: string
}

export default function ProfiluxPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
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
    salaryExpectation: 80000,
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
            const completed: number[] = []
            if (data.profile.firstName) completed.push(1)
            if (data.profile.experience?.length > 0) completed.push(2)
            if (data.profile.specialisations?.length > 0) completed.push(3)
            if (data.profile.languages?.length > 0) completed.push(4)
            if (data.profile.sectors?.length > 0) completed.push(5)
            if (data.profile.salaryExpectation) completed.push(6)
            if (data.profile.availability) completed.push(7)
            setCompletedSteps(completed)
          }
        }
      } catch {}
    }
    if (status === 'authenticated') fetchProfile()
  }, [status])

  const completeness = Math.round((completedSteps.length / 9) * 100)
  const circumference = 2 * Math.PI * 22
  const strokeDashoffset = circumference - (completeness / 100) * circumference

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]

  const markComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step])
    }
  }

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
    markComplete(2)
  }

  const removeExperience = (id: string) => {
    setProfile(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== id) }))
  }

  const formatSalary = (val: number) => {
    if (val >= 1000) return `€${Math.round(val / 1000)}K`
    return `€${val}`
  }

  if (status === 'loading') return null

  return (
    <div style={{ background: '#1a1a1a', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#fff' }}>

      {/* TOP BAR */}
      <div style={{ background: '#111', borderBottom: '1px solid #2a2a2a', padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard/candidate" style={{ color: '#666', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ← Dashboard
          </Link>
          <div style={{ width: '1px', height: '16px', background: '#333' }} />
          <div style={{ fontSize: '13px', color: '#888' }}>
            Profilux <span style={{ color: '#333', margin: '0 4px' }}>·</span>
            <span style={{ color: '#a58e28' }}>Building your profile</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ background: '#222', border: '1px solid #a58e28', color: '#a58e28', fontSize: '11px', letterSpacing: '0.08em', padding: '3px 10px', borderRadius: '3px', fontWeight: 500 }}>
            {(session?.user as any)?.role?.toUpperCase() || 'MEMBER'}
          </span>
          <button onClick={handleSave} disabled={saving} style={{ background: 'transparent', border: '1px solid #333', color: '#888', fontSize: '12px', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          <button onClick={() => window.print()} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '12px', fontWeight: 500, padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
            ↓ Export PDF
          </button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '32px', margin: '0 0 6px', color: '#fff' }}>
              Your <span style={{ fontStyle: 'italic', color: '#a58e28' }}>intelligence</span> profile
            </h1>
            <p style={{ fontSize: '14px', color: '#666', margin: 0, fontWeight: 300 }}>
              A confidential professional dossier, visible only to JOBLUX and who you choose to share with.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '11px', color: '#555', letterSpacing: '0.06em', marginBottom: '8px' }}>PROFILE COMPLETENESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '22px', fontWeight: 400, color: '#fff' }}>{completeness}%</div>
                <div style={{ fontSize: '11px', color: '#555' }}>{completedSteps.length} of 9 sections</div>
              </div>
              <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#2a2a2a" strokeWidth="4" />
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#a58e28" strokeWidth="4"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#a58e28', fontWeight: 500 }}>
                  {completeness}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STEPS NAV */}
      <div style={{ borderBottom: '1px solid #222', padding: '0 32px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'stretch' }}>
              <button
                onClick={() => setCurrentStep(step.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 18px',
                  background: 'transparent', border: 'none', borderBottom: currentStep === step.id ? '2px solid #a58e28' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: completedSteps.includes(step.id) || currentStep === step.id ? '#a58e28' : '#2a2a2a',
                  border: `1px solid ${completedSteps.includes(step.id) || currentStep === step.id ? '#a58e28' : '#333'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', color: completedSteps.includes(step.id) || currentStep === step.id ? '#000' : '#555', fontWeight: 500,
                }}>
                  {completedSteps.includes(step.id) ? '✓' : step.id}
                </div>
                <span style={{
                  fontSize: '13px',
                  color: currentStep === step.id ? '#fff' : completedSteps.includes(step.id) ? '#888' : '#555',
                  fontWeight: currentStep === step.id ? 500 : 400,
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {step.label}
                </span>
              </button>
              {i < STEPS.length - 1 && <div style={{ width: '1px', background: '#222', margin: '12px 0', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>

        <div>
          {/* STEP 1: PERSONAL */}
          {currentStep === 1 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: 0 }}>Personal information</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>FIRST NAME</div>
                  <input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Sophie"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>LAST NAME</div>
                  <input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Laurent"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>CURRENT CITY</div>
                  <input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))}
                    placeholder="Paris, France"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>NATIONALITY</div>
                  <input value={profile.nationality} onChange={e => setProfile(p => ({ ...p, nationality: e.target.value }))}
                    placeholder="French"
                    style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>PROFESSIONAL HEADLINE</div>
                <input value={profile.headline} onChange={e => setProfile(p => ({ ...p, headline: e.target.value }))}
                  placeholder="Senior Retail Manager · LVMH · Paris"
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>SHORT BIO <span style={{ color: '#444' }}>(optional)</span></div>
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                  placeholder="A brief summary of your professional background and what you bring to a role..."
                  rows={3}
                  style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '10px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => { markComplete(1); setCurrentStep(2) }}
                  style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Experience →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: EXPERIENCE */}
          {currentStep === 2 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Career history</h2>
              {profile.experience.map(exp => (
                <div key={exp.id} style={{ border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{exp.role}</div>
                      <div style={{ fontSize: '13px', color: '#a58e28', marginTop: '2px' }}>{exp.brand}{exp.group ? ` · ${exp.group}` : ''}</div>
                      <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>{exp.from}{exp.current ? ' — Present' : exp.to ? ` — ${exp.to}` : ''}{exp.location ? ` · ${exp.location}` : ''}</div>
                    </div>
                    <button onClick={() => removeExperience(exp.id)} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Remove</button>
                  </div>
                </div>
              ))}

              {showAddExp ? (
                <div style={{ border: '1px solid #a58e28', borderRadius: '4px', padding: '20px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>ROLE TITLE</div>
                      <input value={newExp.role || ''} onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))} placeholder="Senior Retail Manager"
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>BRAND</div>
                      <input value={newExp.brand || ''} onChange={e => setNewExp(p => ({ ...p, brand: e.target.value }))} placeholder="Louis Vuitton"
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>GROUP <span style={{ color: '#444' }}>(optional)</span></div>
                      <input value={newExp.group || ''} onChange={e => setNewExp(p => ({ ...p, group: e.target.value }))} placeholder="LVMH"
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>LOCATION</div>
                      <input value={newExp.location || ''} onChange={e => setNewExp(p => ({ ...p, location: e.target.value }))} placeholder="Paris"
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>FROM</div>
                      <input value={newExp.from || ''} onChange={e => setNewExp(p => ({ ...p, from: e.target.value }))} placeholder="Jan 2020"
                        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '6px' }}>TO</div>
                      <input value={newExp.to || ''} onChange={e => setNewExp(p => ({ ...p, to: e.target.value }))} placeholder="Dec 2023" disabled={newExp.current}
                        style={{ width: '100%', background: newExp.current ? '#111' : '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', color: newExp.current ? '#444' : '#fff', fontSize: '13px', padding: '9px 12px', fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#888', marginBottom: '16px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newExp.current || false} onChange={e => setNewExp(p => ({ ...p, current: e.target.checked }))} />
                    This is my current position
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={addExperience} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '12px', fontWeight: 500, padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add position</button>
                    <button onClick={() => setShowAddExp(false)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '12px', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowAddExp(true)} style={{ border: '1px dashed #333', background: 'transparent', color: '#555', fontSize: '12px', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', width: '100%', marginBottom: '24px' }}>
                  + Add position
                </button>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => setCurrentStep(1)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Personal</button>
                <button onClick={() => { markComplete(2); setCurrentStep(3) }} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Expertise →</button>
              </div>
            </div>
          )}

          {/* STEP 3: EXPERTISE */}
          {currentStep === 3 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Areas of expertise</h2>
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>FUNCTIONAL SPECIALISATIONS</div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Your area of professional expertise.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                {SPECIALISATIONS.map(s => (
                  <button key={s} onClick={() => setProfile(p => ({ ...p, specialisations: toggle(p.specialisations, s) }))}
                    style={{ padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${profile.specialisations.includes(s) ? '#a58e28' : '#333'}`, color: profile.specialisations.includes(s) ? '#a58e28' : '#888', background: profile.specialisations.includes(s) ? 'rgba(165,142,40,0.08)' : 'transparent', fontFamily: 'Inter, sans-serif' }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 0 24px' }} />
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>LANGUAGES</div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Languages you work in professionally.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {LANGUAGES.map(l => (
                  <button key={l} onClick={() => setProfile(p => ({ ...p, languages: toggle(p.languages, l) }))}
                    style={{ padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${profile.languages.includes(l) ? '#a58e28' : '#333'}`, color: profile.languages.includes(l) ? '#a58e28' : '#888', background: profile.languages.includes(l) ? 'rgba(165,142,40,0.08)' : 'transparent', fontFamily: 'Inter, sans-serif' }}>
                    {l}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => setCurrentStep(2)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Experience</button>
                <button onClick={() => { markComplete(3); markComplete(4); setCurrentStep(5) }} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Sectors →</button>
              </div>
            </div>
          )}

          {/* STEP 5: SECTORS */}
          {currentStep === 5 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Sectors & geographies</h2>
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>SECTORS OF EXPERTISE</div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Select all that apply. This shapes which search assignments are matched to you.</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setProfile(p => ({ ...p, sectors: toggle(p.sectors, s) }))}
                    style={{ padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${profile.sectors.includes(s) ? '#a58e28' : '#333'}`, color: profile.sectors.includes(s) ? '#a58e28' : '#888', background: profile.sectors.includes(s) ? 'rgba(165,142,40,0.08)' : 'transparent', fontFamily: 'Inter, sans-serif' }}>
                    {s}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid #2a2a2a', margin: '0 0 24px' }} />
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '8px' }}>MARKETS & GEOGRAPHIES</div>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '14px', fontWeight: 300 }}>Where are you open to working?</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {MARKETS.map(m => (
                  <button key={m} onClick={() => setProfile(p => ({ ...p, markets: toggle(p.markets, m) }))}
                    style={{ padding: '7px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', border: `1px solid ${profile.markets.includes(m) ? '#a58e28' : '#333'}`, color: profile.markets.includes(m) ? '#a58e28' : '#888', background: profile.markets.includes(m) ? 'rgba(165,142,40,0.08)' : 'transparent', fontFamily: 'Inter, sans-serif' }}>
                    {m}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                <button onClick={() => setCurrentStep(3)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Expertise</button>
                <button onClick={() => { markComplete(5); setCurrentStep(6) }} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Salary →</button>
              </div>
            </div>
          )}

          {/* STEP 6: SALARY */}
          {currentStep === 6 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Salary expectation</h2>
              <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, margin: '0 0 28px', lineHeight: 1.7 }}>This is used by Mo to match you to appropriately scoped search assignments. It is never shown publicly.</p>
              <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.06em', marginBottom: '16px' }}>ANNUAL GROSS SALARY EXPECTATION</div>
              <div style={{ textAlign: 'center', fontSize: '28px', color: '#a58e28', fontWeight: 400, marginBottom: '16px' }}>
                {formatSalary(profile.salaryExpectation)} / year
              </div>
              <input type="range" min="40000" max="500000" step="5000" value={profile.salaryExpectation}
                onChange={e => setProfile(p => ({ ...p, salaryExpectation: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#a58e28', marginBottom: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#555', marginBottom: '28px' }}>
                <span>€40K</span><span>€500K+</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(5)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Sectors</button>
                <button onClick={() => { markComplete(6); setCurrentStep(7) }} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Availability →</button>
              </div>
            </div>
          )}

          {/* STEP 7: AVAILABILITY */}
          {currentStep === 7 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 24px' }}>Availability</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {AVAILABILITY.map(opt => (
                  <button key={opt.value} onClick={() => setProfile(p => ({ ...p, availability: opt.value }))}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', border: `1px solid ${profile.availability === opt.value ? '#a58e28' : '#2a2a2a'}`, background: profile.availability === opt.value ? 'rgba(165,142,40,0.04)' : 'transparent', borderRadius: '4px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1px solid ${profile.availability === opt.value ? '#a58e28' : '#444'}`, marginTop: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profile.availability === opt.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a58e28' }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', color: profile.availability === opt.value ? '#fff' : '#bbb', marginBottom: '3px' }}>{opt.label}</div>
                      <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setCurrentStep(6)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Salary</button>
                <button onClick={() => { markComplete(7); setCurrentStep(9) }} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '10px 28px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Share →</button>
              </div>
            </div>
          )}

          {/* STEP 9: SHARE */}
          {currentStep === 9 && (
            <div style={{ background: '#222', border: '1px solid #a58e28', borderRadius: '6px', padding: '28px', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '20px', margin: '0 0 8px' }}>Profile sharing</h2>
              <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, margin: '0 0 28px', lineHeight: 1.7 }}>
                Your profile is private by default. You decide if, when, and with whom you share it. JOBLUX never shares, publishes, or uses your information without your explicit action.
              </p>

              <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a58e28', fontSize: '14px', flexShrink: 0 }}>🔒</div>
                <div>
                  <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '3px' }}>Your profile is private</div>
                  <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>Not visible to anyone. Not indexed by Google, Bing, or any search engine.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#ccc' }}>Enable sharing</div>
                  <div style={{ fontSize: '11px', color: '#555', fontWeight: 300, marginTop: '2px' }}>Activate your private link to share with specific people</div>
                </div>
                <label style={{ position: 'relative', width: '40px', height: '22px', flexShrink: 0, cursor: 'pointer' }}>
                  <input type="checkbox" checked={profile.sharingEnabled} onChange={e => handleToggleSharing(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, background: profile.sharingEnabled ? 'rgba(165,142,40,0.2)' : '#2a2a2a', borderRadius: '11px', border: `1px solid ${profile.sharingEnabled ? '#a58e28' : '#333'}`, transition: '0.2s' }}>
                    <span style={{ position: 'absolute', width: '16px', height: '16px', left: profile.sharingEnabled ? '20px' : '2px', top: '2px', background: profile.sharingEnabled ? '#a58e28' : '#555', borderRadius: '50%', transition: '0.2s' }} />
                  </span>
                </label>
              </div>

              {profile.sharingEnabled && profile.shareSlug && (
                <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '16px 18px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      joblux.com/<span style={{ color: '#a58e28' }}>{profile.shareSlug}</span>
                    </div>
                    <button onClick={handleResetLink} style={{ background: 'transparent', border: 'none', color: '#444', fontSize: '11px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'underline', flexShrink: 0 }}>Reset link</button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#444', fontWeight: 300, lineHeight: 1.6 }}>
                    Resetting generates a new link and <span style={{ color: '#666' }}>instantly revokes</span> anyone who had the previous one.
                  </div>
                </div>
              )}

              {profile.sharingEnabled && (
                <>
                  <div style={{ borderTop: '1px solid #2a2a2a', margin: '24px 0' }} />
                  <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.07em', marginBottom: '12px' }}>SHARE VIA</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {[
                      { icon: '⎘', title: 'Copy link', desc: 'Copy your private profile URL to clipboard', action: handleCopyLink },
                      { icon: '↓', title: 'Download PDF', desc: 'Export a formatted JOBLUX profile document', action: handleSave },
                      { icon: '✉', title: 'Send by email', desc: 'Opens your email client with your profile link pre-filled', action: handleEmailShare },
                    ].map(btn => (
                      <button key={btn.title} onClick={btn.action}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', width: '100%' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#a58e28', flexShrink: 0 }}>{btn.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: '#ccc', marginBottom: '2px' }}>
                            {btn.title === 'Copy link' && copied ? '✓ Copied!' : btn.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#555', fontWeight: 300 }}>{btn.desc}</div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#333' }}>→</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '18px 20px' }}>
                <div style={{ fontSize: '10px', color: '#a58e28', letterSpacing: '0.08em', marginBottom: '12px' }}>OUR COMMITMENT TO YOU</div>
                {[
                  'Your profile is never indexed by Google, Bing, or any search engine',
                  'JOBLUX never shares your data with third parties',
                  'Your profile is never used to promote JOBLUX publicly',
                  'You can delete your profile and all data at any time',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#555', fontWeight: 300, lineHeight: 1.6, marginBottom: '8px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a58e28', flexShrink: 0, marginTop: '7px' }} />
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '24px' }}>
                <button onClick={() => setCurrentStep(7)} style={{ background: 'transparent', border: '1px solid #333', color: '#666', fontSize: '13px', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>← Availability</button>
              </div>
            </div>
          )}

          {/* COMPLETION */}
          {currentStep === 9 && completedSteps.length >= 7 && (
            <div style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '1px solid #a58e28', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '18px', color: '#a58e28' }}>✓</div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: '22px', color: '#fff', margin: '0 0 8px' }}>Profile complete</h2>
              <p style={{ fontSize: '13px', color: '#555', fontWeight: 300, lineHeight: 1.7, margin: '0 0 24px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                Your intelligence profile is ready. Mo will review it and match you to relevant search assignments confidentially.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => window.print()} style={{ background: '#a58e28', border: 'none', color: '#000', fontSize: '13px', fontWeight: 500, padding: '11px 26px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>↓ Export as PDF</button>
                <Link href={`/${profile.shareSlug || ''}`} style={{ background: 'transparent', border: '1px solid #333', color: '#888', fontSize: '13px', padding: '11px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'none', display: 'inline-block' }}>View my profile →</Link>
                <Link href="/dashboard/candidate" style={{ background: 'transparent', border: '1px solid #333', color: '#888', fontSize: '13px', padding: '11px 20px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', textDecoration: 'none', display: 'inline-block' }}>← Dashboard</Link>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#222', border: '1px solid #a58e28', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#a58e28', marginBottom: '14px', fontWeight: 500 }}>
              {profile.firstName ? profile.firstName[0].toUpperCase() : '?'}{profile.lastName ? profile.lastName[0].toUpperCase() : ''}
            </div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', color: '#fff', marginBottom: '2px' }}>
              {profile.firstName || profile.lastName ? `${profile.firstName} ${profile.lastName}`.trim() : 'Your name'}
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: 300 }}>
              {profile.headline || 'Your headline'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              <span style={{ fontSize: '10px', border: '1px solid #a58e28', color: '#a58e28', padding: '3px 8px', borderRadius: '2px', letterSpacing: '0.04em' }}>
                {(session?.user as any)?.role?.toUpperCase() || 'MEMBER'}
              </span>
              {profile.sectors.slice(0, 2).map(s => (
                <span key={s} style={{ fontSize: '10px', border: '1px solid #333', color: '#666', padding: '3px 8px', borderRadius: '2px' }}>{s.split(' ')[0]}</span>
              ))}
              {profile.city && <span style={{ fontSize: '10px', border: '1px solid #333', color: '#666', padding: '3px 8px', borderRadius: '2px' }}>{profile.city.split(',')[0]}</span>}
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: '14px' }}>
              {[
                { key: 'Experience', val: profile.experience.length > 0 ? `${profile.experience.length} position${profile.experience.length > 1 ? 's' : ''}` : 'Not set' },
                { key: 'Languages', val: profile.languages.length > 0 ? profile.languages.slice(0, 3).map(l => l.slice(0, 2).toUpperCase()).join(' · ') : 'Not set' },
                { key: 'Availability', val: AVAILABILITY.find(a => a.value === profile.availability)?.label || 'Not set' },
                { key: 'Sharing', val: profile.sharingEnabled ? 'Link active' : 'Private' },
              ].map(row => (
                <div key={row.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: '#555' }}>{row.key}</span>
                  <span style={{ color: '#888' }}>{row.val}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid #222', paddingTop: '12px', marginTop: '4px', fontSize: '11px', color: '#555', textAlign: 'center', fontWeight: 300 }}>
              Profile preview · as seen by JOBLUX
            </div>
          </div>

          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '10px', color: '#a58e28', letterSpacing: '0.08em', marginBottom: '10px' }}>
              {currentStep === 1 && 'YOUR IDENTITY'}
              {currentStep === 2 && 'YOUR HISTORY'}
              {currentStep === 3 && 'YOUR EXPERTISE'}
              {currentStep === 5 && 'WHY THIS MATTERS'}
              {currentStep === 6 && 'CONFIDENTIAL'}
              {currentStep === 7 && 'YOUR STATUS'}
              {currentStep === 9 && 'FULL CONTROL'}
            </div>
            <div style={{ fontSize: '12px', color: '#555', lineHeight: 1.7, fontWeight: 300 }}>
              {currentStep === 1 && 'Your personal information is only visible to the JOBLUX team. It is never published or shared without your consent.'}
              {currentStep === 2 && 'Career history helps Mo understand your trajectory and match you to the right level of search assignment.'}
              {currentStep === 3 && 'Functional expertise and languages are key matching criteria for search assignments across markets.'}
              {currentStep === 5 && 'Sector and geography tags are how Mo matches you to confidential search assignments. The more precise you are, the better the match quality.'}
              {currentStep === 6 && 'Salary expectation is used only by Mo to ensure you are matched to appropriately scoped opportunities. It is never shown publicly.'}
              {currentStep === 7 && 'Your availability status updates your matching priority. You can change this at any time from your dashboard.'}
              {currentStep === 9 && 'Share your profile only with people you choose. Reset the link at any time to instantly revoke access.'}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
