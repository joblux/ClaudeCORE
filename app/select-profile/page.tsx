'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const PROFILES = [
  {
    key: 'rising', overline: 'RISING', title: 'Emerging Professional',
    description: 'For those at the beginning of their luxury journey — analysts, assistants, coordinators, and recent graduates.',
    approval: 'Reviewed by JOBLUX', featured: false,
    features: ['Salary intelligence across markets','Interview experiences at major maisons','Brand intelligence — 500+ houses','The Brief — biweekly intelligence digest','Contribute salary data & experiences'],
    cta: 'Select Rising',
  },
  {
    key: 'pro', overline: 'PRO', title: 'Established Professional',
    description: 'For mid-level professionals building real traction in luxury — managers, specialists, buyers, and boutique leaders.',
    approval: 'Reviewed by JOBLUX', featured: false,
    features: ['Everything in Rising','Deeper benchmarks by market & sector','Track sectors & brands of interest','Save intelligence for later reference','Express interest in search assignments'],
    cta: 'Select Pro',
  },
  {
    key: 'professional', overline: 'SENIOR & EXECUTIVE', title: 'Senior & Executive',
    description: 'For senior professionals and leadership profiles whose experience carries greater strategic relevance.',
    approval: 'Reviewed by JOBLUX', featured: false,
    features: ['Everything in Pro','Comprehensive sector-level intelligence','Strategic compensation visibility','Priority for confidential assignments','Deepest intelligence layer'],
    cta: 'Select Senior & Executive',
  },

  {
    key: 'insider', overline: 'INSIDER', title: 'Trusted Contributor',
    description: 'For experienced professionals, content partners, and intelligence contributors whose knowledge strengthens the ecosystem.',
    approval: 'Reviewed by JOBLUX', featured: false,
    features: ['Shape the intelligence ecosystem directly','Contribute insights & editorial perspective','Deepest access to all intelligence layers','Review and enrich platform intelligence','Recognised as a trusted industry voice'],
    cta: 'Request Insider Access',
  },
]

export default function SelectProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [error, setError] = useState('')



  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const regCompleted = (session.user as any).registrationCompleted
      const userStatus = (session.user as any).status
      if (regCompleted && userStatus === 'approved') router.push('/dashboard')
      else if (regCompleted && userStatus === 'pending') router.push('/members/pending')
    }
  }, [status, session, router])

  const handleSelect = async (profileKey: string) => {
    if (status === 'unauthenticated') {
      router.push('/join?tier=' + profileKey)
      return
    }
    setSubmitting(profileKey)
    setError('')
    try {
      const res = await fetch('/api/members/set-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: profileKey }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      router.push('/members/complete-registration')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setSubmitting(null)
    }
  }

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-start bg-[#1a1a1a]">
        <div className="w-8 h-8 border-2 border-[#2a2a2a] border-t-[#a58e28] rounded-full animate-spin" />
      </div>
    )
  }

  const topRow = PROFILES.slice(0, 3)
  const bottomRow = PROFILES.slice(3)

  return (
    <div className="min-h-screen">
      <div className="bg-[#1a1a1a] py-8 md:py-10">
        <div className="max-w-[1200px] mx-auto px-7 text-center">
          <div className="text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#a58e28] mb-4">Step 2 of 5 — Select your profile</div>
          <h1 className="text-2xl md:text-4xl font-light text-white mb-5 leading-tight max-w-3xl mx-auto" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Access begins with the right profile.
          </h1>
          <p className="text-sm text-[#ccc] max-w-2xl mx-auto leading-relaxed">Your profile shapes how you move through JOBLUX. Access is free. Depth grows through contribution.</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] py-12 lg:py-16">
        <div className="max-w-[1200px] mx-auto px-7">
          {error && (
            <div className="mb-8 p-4 border border-red-200 bg-red-50 text-center rounded-sm">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {PROFILES.map((profile) => <ProfileCard key={profile.key} profile={profile} submitting={submitting} onSelect={handleSelect} />)}
          </div>
          <div className="border-t border-[#2a2a2a] pt-8 text-center">
            <p className="text-xs text-[#ccc] leading-relaxed max-w-xl mx-auto">All profiles are free. Depth increases through contribution and relevance. If your profile changes over time, you can request a different access level later.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileCard({ profile, submitting, onSelect }: { profile: (typeof PROFILES)[number]; submitting: string | null; onSelect: (key: string) => void }) {
  const isSubmitting = submitting === profile.key
  const isDisabled = submitting !== null
  return (
    <div className="relative">
      <div className="bg-[#222] rounded-xl p-6 lg:p-7 h-full flex flex-col transition-all duration-200 border border-[#2a2a2a] hover:border-[#a58e28] hover:shadow-md">
        <div className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-[#a58e28] mb-2">{profile.overline}</div>
        <h3 className="text-xl font-light text-white mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{profile.title}</h3>
        <p className="text-xs text-[#ccc] leading-relaxed mb-4">{profile.description}</p>
        <p className="text-[0.6rem] text-[#aaa] italic mb-5">{profile.approval}</p>
        <ul className="space-y-2.5 mb-6 flex-1">
          {profile.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#a58e28] mt-1.5 flex-shrink-0" />
              <span className="text-xs text-[#ccc] leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
        <button onClick={() => onSelect(profile.key)} disabled={isDisabled}
          className="w-full py-3 text-[0.7rem] font-semibold tracking-[0.1em] uppercase transition-colors disabled:opacity-50 border border-[#555] text-[#ccc] hover:bg-[#333]">
          {isSubmitting ? 'Saving...' : profile.cta}
        </button>
      </div>
    </div>
  )
}
