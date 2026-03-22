'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

const SECTORS = [
  { name: 'Fashion & leather goods', tooltip: 'Haute couture, ready-to-wear, leather goods, accessories, eyewear, textiles' },
  { name: 'Watches & jewellery', tooltip: 'Haute horlogerie, fine jewellery, high jewellery, writing instruments' },
  { name: 'Perfumes & cosmetics', tooltip: 'Fine fragrances, makeup, skincare, niche perfumery' },
  { name: 'Wines & spirits', tooltip: 'Champagne, cognac, fine wines, premium spirits, fine dining' },
  { name: 'Hospitality & travel', tooltip: 'Palace hotels, luxury resorts, cruises, luxury travel, fine dining' },
  { name: 'Automotive', tooltip: 'Luxury and prestige automobiles, supercars, hypercars' },
  { name: 'Aviation & yachting', tooltip: 'Private jets, luxury yachts, charter services, superyacht builders' },
  { name: 'Real estate', tooltip: 'Luxury property, branded residences, prime development' },
  { name: 'Design', tooltip: 'Interior design, architecture, luxury furniture, retail design, art de vivre' },
  { name: 'Art & auction houses', tooltip: 'Fine art, galleries, auction houses, cultural institutions' },
  { name: 'Media & publishing', tooltip: 'Luxury media, fashion press, luxury digital platforms, editorial' },
  { name: 'Technology for luxury', tooltip: 'Digital innovation, luxury e-commerce, AI for luxury, blockchain authentication' },
]

const DOMAINS = [
  { name: 'Retail & client experience', tooltip: 'Store management, client advisors, clienteling, CRM, after-sales' },
  { name: 'Sales & business development', tooltip: 'Wholesale, key accounts, B2B, regional sales, partnerships' },
  { name: 'Creative & design', tooltip: 'Artistic direction, fashion design, product design, textile, colour' },
  { name: 'Craftsmanship & production', tooltip: 'Artisan m\u00e9tiers, atelier, manufacturing, quality control' },
  { name: 'Buying & merchandising', tooltip: 'Product assortment, pricing, allocation, category management' },
  { name: 'Visual merchandising', tooltip: 'Store design, windows, display, in-store experience, retail architecture' },
  { name: 'Marketing & communications', tooltip: 'Brand strategy, campaigns, content, media, social media' },
  { name: 'PR & events', tooltip: 'Press relations, fashion shows, launches, influencer, VIP relations' },
  { name: 'Digital & e-commerce', tooltip: 'Online retail, digital marketing, CRM tech, omnichannel, data' },
  { name: 'Supply chain & logistics', tooltip: 'Sourcing, purchasing, planning, distribution, warehouse' },
  { name: 'Finance & legal', tooltip: 'Controlling, audit, tax, M&A, IP protection, compliance' },
  { name: 'Human resources & talent', tooltip: 'Talent acquisition, L&D, employer branding, compensation' },
  { name: 'Strategy & consulting', tooltip: 'Business strategy, transformation, market intelligence, advisory' },
  { name: 'Technology & IT', tooltip: 'Software, cybersecurity, AI, blockchain, systems, infrastructure' },
  { name: 'Research & innovation', tooltip: 'R&D, formulation, materials science, sustainability innovation' },
  { name: 'General management', tooltip: 'CEO, COO, MD, country manager, regional director, P&L ownership' },
]

const PRO_PLUS_SENIORITY = [
  { value: '', label: 'Select seniority' },
  { value: 'mid-level', label: 'Mid-level (3\u20137 yrs)' },
  { value: 'senior', label: 'Senior (7\u201312 yrs)' },
  { value: 'director', label: 'Director (12+ yrs)' },
]

const COMPANY_SIZE = [
  { value: '', label: 'Select size' },
  { value: '1-50', label: '1\u201350' },
  { value: '50-200', label: '50\u2013200' },
  { value: '200-1000', label: '200\u20131,000' },
  { value: '1000+', label: '1,000+' },
]

type Tier = 'rising' | 'pro' | 'professional' | 'executive' | 'business' | 'insider' | null

interface RankedItem {
  name: string
  rank: number
}

function RankedChips({
  items,
  selected,
  onToggle,
}: {
  items: { name: string; tooltip: string }[]
  selected: RankedItem[]
  onToggle: (name: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const sel = selected.find((s) => s.name === item.name)
        return (
          <button
            key={item.name}
            type="button"
            title={item.tooltip}
            onClick={() => onToggle(item.name)}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all min-h-[44px] ${
              sel
                ? 'bg-[#1a1a1a] border-[#a58e28] text-[#a58e28]'
                : 'bg-white border-[#e8e2d8] text-[#666] hover:border-[#a58e28]/50'
            }`}
          >
            {sel && (
              <span className="w-5 h-5 rounded-full bg-[#a58e28] text-[#1a1a1a] text-xs font-bold flex items-center justify-center flex-shrink-0">
                {sel.rank}
              </span>
            )}
            <span>{item.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (value: string) => {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  return (
    <div
      className="jl-input w-full flex flex-wrap gap-2 cursor-text min-h-[44px]"
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#a58e28] text-[#a58e28] text-sm"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(i)
            }}
            className="text-[#a58e28] hover:text-white ml-1"
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input) }}
        placeholder={tags.length === 0 ? (placeholder || 'Type and press Enter') : ''}
        className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
      />
    </div>
  )
}

export default function PendingPage() {
  const { data: session, update } = useSession()
  const regCompleted = (session?.user as any)?.registrationCompleted

  const firstName = (session?.user as any)?.firstName || ''
  const [step, setStep] = useState<1 | 2>(1)
  const [tier, setTier] = useState<Tier>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [approved, setApproved] = useState(false)

  // Ranked multi-selects
  const [selectedSectors, setSelectedSectors] = useState<RankedItem[]>([])
  const [selectedDomains, setSelectedDomains] = useState<RankedItem[]>([])

  // Basic info
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')

  // Contact & sharing
  const [contactPref, setContactPref] = useState<'email' | 'email_phone'>('email')
  const [phone, setPhone] = useState('')
  const [shareableProfile, setShareableProfile] = useState<'no' | 'yes'>('no')

  // Rising fields
  const [university, setUniversity] = useState('')
  const [fieldOfStudy, setFieldOfStudy] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [seekingRole, setSeekingRole] = useState('')

  // Pro fields
  const [proRole, setProRole] = useState('')
  const [proMaison, setProMaison] = useState('')
  const [proDepartment, setProDepartment] = useState('')

  // Pro+ fields
  const [proPlusRole, setProPlusRole] = useState('')
  const [proPlusMaison, setProPlusMaison] = useState('')
  const [proPlusSeniority, setProPlusSeniority] = useState('')
  const [proPlusYears, setProPlusYears] = useState('')

  // Executive fields
  const [execTitle, setExecTitle] = useState('')
  const [execMaison, setExecMaison] = useState('')
  const [execYears, setExecYears] = useState('')

  // Business fields
  const [bizCompany, setBizCompany] = useState('')
  const [bizEmail, setBizEmail] = useState('')
  const [bizRole, setBizRole] = useState('')
  const [bizDepartment, setBizDepartment] = useState('')
  const [bizWebsite, setBizWebsite] = useState('')
  const [bizSize, setBizSize] = useState('')
  const [bizHeardFrom, setBizHeardFrom] = useState('')

  // Insider fields
  const [insSpeciality, setInsSpeciality] = useState('')
  const [insFirm, setInsFirm] = useState('')
  const [insExpertise, setInsExpertise] = useState<string[]>([])
  const [insYears, setInsYears] = useState('')
  const [insWebsite, setInsWebsite] = useState('')
  const [insHeardFrom, setInsHeardFrom] = useState('')

  const toggleRankedItem = useCallback(
    (list: RankedItem[], setList: (items: RankedItem[]) => void, name: string) => {
      const existing = list.find((i) => i.name === name)
      if (existing) {
        const removed = list.filter((i) => i.name !== name)
        setList(removed.map((item, idx) => ({ ...item, rank: idx + 1 })))
      } else {
        setList([...list, { name, rank: list.length + 1 }])
      }
    },
    []
  )

  // Polling for approval
  useEffect(() => {
    if (!submitted && !regCompleted) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/members/profile')
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'approved' || data.member?.status === 'approved') {
            setApproved(true)
            clearInterval(interval)
          }
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [submitted, regCompleted])

  const validate = (): string | null => {
    if (!city || !country) return 'City and country are required.'
    if (selectedSectors.length < 1) return 'Please select at least one luxury sector.'
    if (selectedDomains.length < 1) return 'Please select at least one domain of activity.'

    if (tier === 'rising') {
      if (!university) return 'University / school is required.'
      if (!fieldOfStudy) return 'Field of study is required.'
      if (!graduationYear) return 'Graduation year is required.'
      if (!seekingRole) return 'Role or position you\u2019re seeking is required.'
    }
    if (tier === 'pro') {
      if (!proRole) return 'Current or most recent role is required.'
      if (!proMaison) return 'Current or most recent maison / employer is required.'
      if (!proDepartment) return 'Department is required.'
    }
    if (tier === 'professional') {
      if (!proPlusRole) return 'Current or most recent role is required.'
      if (!proPlusMaison) return 'Current or most recent maison / employer is required.'
      if (!proPlusSeniority) return 'Seniority is required.'
      if (!proPlusYears) return 'Years in luxury is required.'
    }
    if (tier === 'executive') {
      if (!execTitle) return 'Current or most recent title is required.'
      if (!execMaison) return 'Maison / group is required.'
      if (!execYears) return 'Years in luxury is required.'
    }
    if (tier === 'business') {
      if (!bizCompany) return 'Company / maison is required.'
      if (!bizEmail) return 'Professional / company email is required.'
      if (!bizRole) return 'Your role / title is required.'
      if (!bizDepartment) return 'Department is required.'
      if (!bizWebsite) return 'Company website is required.'
      if (!bizSize) return 'Company size is required.'
      if (!bizHeardFrom) return 'Please tell us how you heard about JOBLUX.'
    }
    if (tier === 'insider') {
      if (!insSpeciality) return 'Speciality is required.'
      if (!insFirm) return 'Firm / company is required.'
      if (insExpertise.length < 2) return 'Please add at least 2 areas of expertise.'
      if (!insYears) return 'Years in luxury is required.'
      if (!insHeardFrom) return 'Please tell us how you heard about JOBLUX.'
    }

    if (contactPref === 'email_phone' && !phone) return 'Phone number is required when selecting "Email + Phone".'

    return null
  }

  const buildPayload = () => {
    const base: Record<string, any> = {
      tier,
      city,
      country,
      sectors: selectedSectors,
      domains: selectedDomains,
      contact_preference: contactPref,
      shareable_profile: shareableProfile === 'yes',
    }

    if (contactPref === 'email_phone') base.phone = phone

    if (tier === 'rising') {
      base.university = university
      base.field_of_study = fieldOfStudy
      base.graduation_year = parseInt(graduationYear)
      base.seeking_role = seekingRole
    }
    if (tier === 'pro') {
      base.job_title = proRole
      base.maison = proMaison
      base.department = proDepartment
    }
    if (tier === 'professional') {
      base.job_title = proPlusRole
      base.maison = proPlusMaison
      base.seniority = proPlusSeniority
      base.years_in_luxury = parseInt(proPlusYears)
    }
    if (tier === 'executive') {
      base.job_title = execTitle
      base.maison = execMaison
      base.years_in_luxury = parseInt(execYears)
    }
    if (tier === 'business') {
      base.maison = bizCompany
      base.company_email = bizEmail
      base.job_title = bizRole
      base.department = bizDepartment
      base.company_website = bizWebsite
      base.company_size = bizSize
      base.heard_from = bizHeardFrom
    }
    if (tier === 'insider') {
      base.speciality = insSpeciality
      base.consulting_firm = insFirm
      base.expertise_tags = insExpertise
      base.years_in_luxury = parseInt(insYears)
      base.website = insWebsite || null
      base.heard_from = insHeardFrom
    }

    return base
  }

  const submit = async () => {
    setError('')
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed')
      }
      await update()
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // ── APPROVED VIEW ──
  if (approved) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h2 className="jl-serif text-3xl text-[#1a1a1a] mb-2">JOBLUX</h2>
          <p className="text-sm tracking-[0.2em] uppercase text-[#a58e28] mb-10">Luxury Industry Careers Intelligence</p>
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#fafaf5] border border-[#a58e28] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="jl-serif text-xl text-[#1a1a1a] mb-2">Welcome to the Society</h3>
            <p className="text-sm text-[#666] mb-6">
              {firstName ? `Congratulations, ${firstName}.` : 'Congratulations.'} Your account has been approved.
            </p>
            <Link href="/dashboard" className="jl-btn jl-btn-primary px-10 inline-block">
              Enter Dashboard
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ── PENDING APPROVAL VIEW ──
  if (regCompleted || submitted) {
    return (
      <main className="min-h-screen bg-[#fafaf5] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h2 className="jl-serif text-3xl text-[#1a1a1a] mb-2">JOBLUX</h2>
          <p className="text-sm tracking-[0.2em] uppercase text-[#a58e28] mb-10">Luxury Industry Careers Intelligence</p>
          <div className="bg-white border border-[#e8e2d8] rounded-sm p-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="jl-serif text-xl text-[#1a1a1a] mb-2">Pending Approval</h3>
            <p className="text-sm text-[#666] mb-4">
              {firstName ? `Thank you, ${firstName}.` : 'Thank you.'} Your application is under review.
            </p>
            <p className="text-xs text-[#999]">
              Every JOBLUX member is personally approved. You will receive an email once confirmed.
            </p>
          </div>
          <Link href="/" className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mt-6 inline-block">
            &larr; Return to homepage
          </Link>
        </div>
      </main>
    )
  }

  // ── REGISTRATION FORM VIEW ──
  return (
    <main className="min-h-screen bg-[#fafaf5] flex flex-col items-center px-6 py-12">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <p className="text-sm tracking-[0.3em] uppercase text-[#a58e28] mb-3">JOBLUX Society</p>
          <h1 className="jl-serif text-2xl md:text-3xl text-[#1a1a1a] mb-2">
            {step === 1 ? 'Choose Your Tier' : 'Complete Your Profile'}
          </h1>
          <p className="text-[#666] text-sm max-w-md mx-auto">
            {step === 1
              ? 'Select the tier that best describes your position.'
              : 'Tell us about yourself so we can review your application.'}
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              step === 1 ? 'bg-[#a58e28] text-white' : 'bg-[#1a1a1a] text-[#a58e28]'
            }`}
          >
            1
          </div>
          <div className="w-8 h-px bg-[#e8e2d8]" />
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              step === 2 ? 'bg-[#a58e28] text-white' : 'bg-[#e8e2d8] text-[#999]'
            }`}
          >
            2
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm text-center">
            {error}
          </div>
        )}

        {/* STEP 1 — Tier Selection */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTier(t.id as Tier)}
                  className={`text-left p-5 border rounded-sm transition-all ${
                    tier === t.id
                      ? 'bg-white border-[#a58e28] shadow-sm'
                      : 'bg-white border-[#e8e2d8] hover:border-[#a58e28]/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-lg">{t.icon}</span>
                    {tier === t.id && (
                      <span className="w-5 h-5 rounded-full bg-[#a58e28] flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-[#1a1a1a]">{t.name}</h3>
                  <p className="text-xs text-[#a58e28] mb-1">{t.tagline}</p>
                  <p className="text-xs text-[#666] leading-relaxed">{t.desc}</p>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => {
                  if (tier) {
                    setStep(2)
                    setError('')
                  }
                }}
                disabled={!tier}
                className={`jl-btn jl-btn-primary px-10 ${!tier ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — Full Form */}
        {step === 2 && (
          <>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-[#a58e28] hover:text-[#1a1a1a] transition-colors mb-6"
            >
              &larr; Change tier ({TIERS.find((t) => t.id === tier)?.name})
            </button>
            <div className="space-y-6">
              {/* A) Basic Info */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="jl-label">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="jl-input w-full"
                      placeholder="e.g. Paris"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="jl-label">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="jl-input w-full"
                      placeholder="e.g. France"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* B) Luxury Sectors */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-2">
                  Luxury Sectors <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-[#999] mb-4">
                  Tap to select and rank your sectors by preference. Hover for details.
                </p>
                <RankedChips
                  items={SECTORS}
                  selected={selectedSectors}
                  onToggle={(name) => toggleRankedItem(selectedSectors, setSelectedSectors, name)}
                />
              </div>

              {/* C) Domains of Activity */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-2">
                  Domains of Activity <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-[#999] mb-4">
                  Tap to select and rank your domains by preference. Hover for details.
                </p>
                <RankedChips
                  items={DOMAINS}
                  selected={selectedDomains}
                  onToggle={(name) => toggleRankedItem(selectedDomains, setSelectedDomains, name)}
                />
              </div>

              {/* D) Tier-Specific Fields */}

              {/* Rising */}
              {tier === 'rising' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">Academic Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="jl-label">
                        University / School <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="jl-input w-full"
                        placeholder="e.g. ESSEC, Polimoda"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Field of Study <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Luxury Brand Management"
                          value={fieldOfStudy}
                          onChange={(e) => setFieldOfStudy(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Graduation Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className="jl-input w-full"
                          placeholder="e.g. 2026"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        Role or position you're seeking <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="jl-input w-full"
                        placeholder="e.g. Marketing Intern, Junior Buyer"
                        value={seekingRole}
                        onChange={(e) => setSeekingRole(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pro */}
              {tier === 'pro' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                    Professional Details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Current or most recent role <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Sales Associate"
                          value={proRole}
                          onChange={(e) => setProRole(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Current or most recent maison / employer <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Chanel, Dior"
                          value={proMaison}
                          onChange={(e) => setProMaison(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="jl-input w-full"
                        placeholder="e.g. Retail"
                        value={proDepartment}
                        onChange={(e) => setProDepartment(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Pro+ */}
              {tier === 'professional' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                    Manager / Director Details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Current or most recent role <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Retail Director"
                          value={proPlusRole}
                          onChange={(e) => setProPlusRole(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Current or most recent maison / employer <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Chanel, LVMH"
                          value={proPlusMaison}
                          onChange={(e) => setProPlusMaison(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Seniority <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="jl-input w-full"
                          value={proPlusSeniority}
                          onChange={(e) => setProPlusSeniority(e.target.value)}
                        >
                          {PRO_PLUS_SENIORITY.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="jl-label">
                          Years in luxury <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className="jl-input w-full"
                          placeholder="e.g. 10"
                          value={proPlusYears}
                          onChange={(e) => setProPlusYears(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Executive */}
              {tier === 'executive' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                    Executive Details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Current or most recent title <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. VP Retail, CEO"
                          value={execTitle}
                          onChange={(e) => setExecTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Maison / Group <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. LVMH, Kering"
                          value={execMaison}
                          onChange={(e) => setExecMaison(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        Years in luxury <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        className="jl-input w-full"
                        placeholder="e.g. 15"
                        value={execYears}
                        onChange={(e) => setExecYears(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Business */}
              {tier === 'business' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                    Business Details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Company / Maison <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Kering"
                          value={bizCompany}
                          onChange={(e) => setBizCompany(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Professional / company email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="jl-input w-full"
                          placeholder="you@company.com"
                          value={bizEmail}
                          onChange={(e) => setBizEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Your role / title <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Talent Manager"
                          value={bizRole}
                          onChange={(e) => setBizRole(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Human Resources"
                          value={bizDepartment}
                          onChange={(e) => setBizDepartment(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Company website <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="https://www.company.com"
                          value={bizWebsite}
                          onChange={(e) => setBizWebsite(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Company size <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="jl-input w-full"
                          value={bizSize}
                          onChange={(e) => setBizSize(e.target.value)}
                        >
                          {COMPANY_SIZE.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        How did you hear about JOBLUX? <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="jl-input w-full"
                        placeholder="e.g. LinkedIn, a colleague, event..."
                        value={bizHeardFrom}
                        onChange={(e) => setBizHeardFrom(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Insider */}
              {tier === 'insider' && (
                <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                  <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                    Insider Details
                  </h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Speciality <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder='e.g. Executive Search'
                          value={insSpeciality}
                          onChange={(e) => setInsSpeciality(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">
                          Firm / company or &ldquo;Independent&rdquo; <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="e.g. Independent"
                          value={insFirm}
                          onChange={(e) => setInsFirm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        Areas of expertise <span className="text-red-500">*</span>{' '}
                        <span className="text-[#999] font-normal">(at least 2 — type and press Enter)</span>
                      </label>
                      <TagInput
                        tags={insExpertise}
                        onChange={setInsExpertise}
                        placeholder="e.g. Luxury retail, C-suite placement..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="jl-label">
                          Years in luxury <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          className="jl-input w-full"
                          placeholder="e.g. 12"
                          value={insYears}
                          onChange={(e) => setInsYears(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="jl-label">Website, blog, or portfolio link</label>
                        <input
                          className="jl-input w-full"
                          placeholder="https://..."
                          value={insWebsite}
                          onChange={(e) => setInsWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="jl-label">
                        How did you hear about JOBLUX? <span className="text-red-500">*</span>
                      </label>
                      <input
                        className="jl-input w-full"
                        placeholder="e.g. LinkedIn, a colleague, event..."
                        value={insHeardFrom}
                        onChange={(e) => setInsHeardFrom(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* F) Privacy Reassurance */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#fafaf5] border border-[#e8e2d8] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#a58e28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">Your data belongs to you.</h3>
                  <p className="text-xs text-[#666] leading-relaxed">
                    Your profile is never visible on Google, never shared with third parties, and never sold. You
                    control who sees it — and you can change these settings anytime.
                  </p>
                </div>
              </div>

              {/* E) Contact & Sharing */}
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-5">
                  Contact &amp; Sharing
                </h2>
                <div className="space-y-5">
                  {/* Contact preference */}
                  <div>
                    <label className="jl-label">
                      Contact preference <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactPref"
                          checked={contactPref === 'email'}
                          onChange={() => setContactPref('email')}
                          className="accent-[#a58e28]"
                        />
                        <span className="text-sm text-[#1a1a1a]">Email only</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactPref"
                          checked={contactPref === 'email_phone'}
                          onChange={() => setContactPref('email_phone')}
                          className="accent-[#a58e28]"
                        />
                        <span className="text-sm text-[#1a1a1a]">Email + Phone</span>
                      </label>
                    </div>
                    {contactPref === 'email_phone' && (
                      <div className="mt-3">
                        <label className="jl-label">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="jl-input w-full"
                          placeholder="+33 6 12 34 56 78"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {/* Shareable profile */}
                  <div>
                    <label className="jl-label">
                      Shareable profile link <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="shareableProfile"
                          checked={shareableProfile === 'no'}
                          onChange={() => setShareableProfile('no')}
                          className="accent-[#a58e28]"
                        />
                        <span className="text-sm text-[#1a1a1a]">No thanks</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="shareableProfile"
                          checked={shareableProfile === 'yes'}
                          onChange={() => setShareableProfile('yes')}
                          className="accent-[#a58e28]"
                        />
                        <span className="text-sm text-[#1a1a1a]">Yes, generate a link I can share</span>
                      </label>
                    </div>
                    <p className="text-xs text-[#999] mt-2">
                      Your profile is always visible to the JOBLUX team. A shareable link lets you send your profile to
                      anyone you choose — but it's never indexed by Google.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="text-center pt-4">
                <button onClick={submit} disabled={saving} className="jl-btn jl-btn-primary px-10">
                  {saving ? 'Submitting\u2026' : 'Submit Application'}
                </button>
                <p className="text-xs text-[#999] mt-3">Every JOBLUX application is personally reviewed.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
