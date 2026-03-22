'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMember } from '@/lib/auth-hooks'

const PROFILES = [
  {
    key: 'rising',
    overline: 'RISING',
    title: 'Emerging Professional',
    description:
      'For those at the beginning of their luxury journey — analysts, assistants, coordinators, and recent graduates.',
    approval: 'Auto-approved',
    features: [
      'Salary intelligence across markets',
      'Interview experiences at major maisons',
      'Brand intelligence — 500+ houses',
      'The Brief — biweekly intelligence digest',
      'Contribute salary data & experiences',
    ],
    cta: 'Select Rising',
    featured: false,
    autoApprove: true,
  },
  {
    key: 'pro',
    overline: 'PRO',
    title: 'Established Professional',
    description:
      'For mid-level professionals building real traction in luxury — managers, specialists, buyers, and boutique leaders.',
    approval: 'Auto-approved',
    features: [
      'Everything in Rising',
      'Deeper benchmarks by market & sector',
      'Track sectors & brands of interest',
      'Save intelligence for later reference',
      'Express interest in search assignments',
    ],
    cta: 'Select Pro',
    featured: true,
    autoApprove: true,
  },
  {
    key: 'professional',
    overline: 'PRO+',
    title: 'Senior & Executive',
    description:
      'For senior professionals and leadership profiles whose experience carries greater strategic relevance across the sector.',
    approval: 'Auto-approved',
    features: [
      'Everything in Pro',
      'Comprehensive sector-level intelligence',
      'Strategic compensation visibility',
      'Priority for confidential assignments',
      'Deepest intelligence layer',
    ],
    cta: 'Select Pro+',
    featured: false,
    autoApprove: true,
  },
  {
    key: 'business',
    overline: 'BUSINESS',
    title: 'Luxury Employer',
    description:
      'For brands, maisons, and operators seeking manager-and-up hiring support through JOBLUX.',
    approval: 'Requires approval',
    features: [
      'Submit confidential search briefs',
      'Market compensation intelligence',
      'Work with JOBLUX recruitment consultants',
      'Talent movement signals across sectors',
      'Dedicated account discretion',
    ],
    cta: 'Request Business Access',
    featured: false,
    autoApprove: false,
  },
  {
    key: 'insider',
    overline: 'INSIDER',
    title: 'Trusted Contributor',
    description:
      'For experienced professionals, content partners, and intelligence contributors whose knowledge strengthens the ecosystem.',
    approval: 'Reviewed by JOBLUX',
    features: [
      'Shape the intelligence ecosystem directly',
      'Contribute insights & editorial perspective',
      'Deepest access to all intelligence layers',
      'Review and enrich platform intelligence',
      'Recognised as a trusted industry voice',
    ],
    cta: 'Request Insider Access',
    featured: false,
    autoApprove: false,
  },
]

export default function SelectProfilePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useMember()
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Redirect if not authenticated
  if (!isLoading && !isAuthenticated) {
    router.push('/join')
    return null
  }

  const handleSelect = async (profileKey: string) => {
    setSubmitting(profileKey)
    setError('')
    try {
      const res = await fetch('/api/members/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: profileKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }

      const profile = PROFILES.find((p) => p.key === profileKey)
      if (profile?.autoApprove) {
        router.push('/dashboard')
      } else {
        router.push('/members/pending')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f4f0]">
        <div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  const topRow = PROFILES.slice(0, 3)
  const bottomRow = PROFILES.slice(3)

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <div className="bg-[#1a1a1a] py-14 md:py-20">
        <div className="jl-container text-center">
          <div className="jl-overline-gold mb-4 tracking-[0.2em]">Access Profiles</div>
          <h1 className="jl-serif text-3xl md:text-5xl font-light text-white mb-5 leading-tight max-w-3xl mx-auto">
            Access begins with the right profile.
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-2xl mx-auto leading-relaxed">
            Your profile shapes how you move through the JOBLUX ecosystem.
            Access is free for now. Depth grows through contribution.
          </p>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="bg-[#f5f4f0] py-12 lg:py-16">
        <div className="jl-container">

          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 text-center">
              <p className="font-sans text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Top row — Rising, Pro, Pro+ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {topRow.map((profile) => (
              <ProfileCard
                key={profile.key}
                profile={profile}
                submitting={submitting}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Bottom row — Business, Insider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {bottomRow.map((profile) => (
              <ProfileCard
                key={profile.key}
                profile={profile}
                submitting={submitting}
                onSelect={handleSelect}
              />
            ))}
          </div>

          {/* Bottom note */}
          <div className="border-t border-[#e8e2d8] pt-8 text-center">
            <p className="font-sans text-xs text-[#888] leading-relaxed max-w-xl mx-auto">
              All access profiles are free for now. Depth increases through contribution,
              relevance, and role. If your profile changes over time, you can request a
              different access profile later.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileCard({
  profile,
  submitting,
  onSelect,
}: {
  profile: (typeof PROFILES)[number]
  submitting: string | null
  onSelect: (key: string) => void
}) {
  const isSubmitting = submitting === profile.key
  const isDisabled = submitting !== null

  return (
    <div className="relative">
      {/* "Most common" badge for Pro */}
      {profile.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-block bg-[#a58e28] text-white text-[0.55rem] font-semibold tracking-[0.15em] uppercase px-3 py-1">
            Most common
          </span>
        </div>
      )}

      <div
        className={`bg-white rounded-xl p-6 lg:p-7 h-full flex flex-col transition-all duration-200 ${
          profile.featured
            ? 'border-2 border-[#a58e28] shadow-md hover:shadow-lg'
            : 'border border-[#e8e2d8] hover:border-[#a58e28] hover:shadow-md'
        }`}
      >
        {/* Overline */}
        <div className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-2">
          {profile.overline}
        </div>

        {/* Title */}
        <h3 className="jl-serif text-xl font-light text-[#1a1a1a] mb-2">
          {profile.title}
        </h3>

        {/* Description */}
        <p className="font-sans text-xs text-[#888] leading-relaxed mb-4">
          {profile.description}
        </p>

        {/* Approval label */}
        <p className="font-sans text-[0.6rem] text-[#aaa] italic mb-5">
          {profile.approval}
        </p>

        {/* Features */}
        <ul className="space-y-2.5 mb-6 flex-1">
          {profile.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span
                className="w-[5px] h-[5px] rounded-full bg-[#a58e28] mt-1.5 flex-shrink-0"
              />
              <span className="font-sans text-xs text-[#666] leading-relaxed">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onSelect(profile.key)}
          disabled={isDisabled}
          className={`w-full py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase transition-colors disabled:opacity-50 ${
            profile.featured
              ? 'bg-[#a58e28] text-white hover:bg-[#8a7622]'
              : 'border border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white'
          }`}
        >
          {isSubmitting ? 'Processing...' : profile.cta}
        </button>
      </div>
    </div>
  )
}
