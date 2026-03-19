'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMember } from '@/lib/auth-hooks'

const jobs: Record<string, {
  id: string; maison: string; title: string; market: string; salary: string;
  category: string; seniority: string; badge: string; is_confidential: boolean;
  contract: string; description: string; requirements: string[];
}> = {
  '1': {
    id: '1', maison: 'Major French Fashion Maison', title: 'Store Director — Paris Flagship',
    market: 'Paris · France', salary: '€110–140K + bonus', category: 'Fashion',
    seniority: 'Director', badge: 'Confidential', is_confidential: true, contract: 'Permanent',
    description: 'Lead the flagship boutique for one of France\'s most prestigious fashion houses. Full P&L responsibility, team of 45+ associates, and direct reporting to the Retail Director Europe. This role requires exceptional client relationship management, deep understanding of luxury retail operations, and the ability to represent the maison at the highest level.',
    requirements: [
      'Minimum 8 years in luxury retail, with at least 3 years as Store Director or Deputy',
      'Flagship or high-volume boutique experience required',
      'Fluent French and English; additional languages valued',
      'Proven track record managing teams of 30+ associates',
      'Strong understanding of luxury clienteling and CRM',
      'Experience with P&L management and retail KPIs',
    ],
  },
  '2': {
    id: '2', maison: 'Swiss Watch Group — Richemont', title: 'Regional Director — Gulf & Levant',
    market: 'Dubai · UAE', salary: 'AED 380–450K + package', category: 'Watches',
    seniority: 'Senior Director', badge: 'Executive', is_confidential: false, contract: 'Permanent',
    description: 'Oversee the Gulf and Levant region for a leading Richemont maison. Strategic P&L ownership across 12 points of sale, wholesale partnerships, and new market development. This role reports directly to the Managing Director Middle East & Africa and sits on the regional leadership team.',
    requirements: [
      'Minimum 10 years in luxury, with 5+ years in regional leadership roles',
      'Deep knowledge of Gulf and Levant luxury markets',
      'Experience managing multi-door retail and wholesale networks',
      'Watch or jewellery industry experience strongly preferred',
      'Arabic language skills highly valued',
      'Willingness to travel extensively across the region',
    ],
  },
  '3': {
    id: '3', maison: 'LVMH Group Brand', title: 'HR Director — Asia Pacific',
    market: 'Singapore', salary: 'SGD 200–250K', category: 'Group',
    seniority: 'Director', badge: 'Confidential', is_confidential: true, contract: 'Permanent',
    description: 'Lead the HR function across Asia Pacific for a major LVMH maison. Scope includes talent acquisition, employer branding, compensation and benefits, talent development, and employee relations across 8 markets. Partner with the regional MD and global HR leadership to drive the people strategy.',
    requirements: [
      'Minimum 10 years HR experience, with 5+ in luxury or premium retail',
      'Multi-market HR leadership experience across Asia Pacific',
      'Strong knowledge of employment law across key Asian markets',
      'Experience with LVMH group processes and tools preferred',
      'Fluent English; Mandarin or Japanese a significant advantage',
      'Track record in talent development and succession planning',
    ],
  },
  '4': {
    id: '4', maison: 'Italian Leather Goods Maison', title: 'Buying Director — RTW & Accessories',
    market: 'Milan · Italy', salary: '€95–120K + bonus', category: 'Fashion',
    seniority: 'Director', badge: 'Senior', is_confidential: false, contract: 'Permanent',
    description: 'Direct the buying strategy for RTW and accessories across all channels for a prestigious Italian leather goods house. Work closely with the creative and merchandising teams to curate seasonal assortments that balance commercial performance with brand identity. Manage a team of 6 buyers and 4 assistant buyers.',
    requirements: [
      'Minimum 8 years buying experience in luxury fashion',
      'RTW and accessories buying at director level',
      'Strong analytical skills and OTB management experience',
      'Proven ability to work with creative teams on assortment strategy',
      'Italian and English fluency required',
      'Knowledge of Italian manufacturing and supply chain',
    ],
  },
  '5': {
    id: '5', maison: 'Ultra Luxury Hotel Group', title: 'General Manager — New Property',
    market: 'London · UK', salary: '£130–160K + benefits', category: 'Hospitality',
    seniority: 'Executive', badge: 'Confidential', is_confidential: true, contract: 'Permanent',
    description: 'Lead the opening and operation of a new ultra-luxury property in central London. Full responsibility for pre-opening, recruitment, operations, and guest experience. This is a signature property for the group and requires a GM who can set the standard for service excellence at the highest level.',
    requirements: [
      'Minimum 15 years in luxury hospitality, with 5+ as General Manager',
      'Pre-opening experience required',
      'Track record at leading ultra-luxury brands (Aman, Four Seasons, Rosewood, etc.)',
      'Exceptional guest relations and service standards',
      'Strong financial acumen and P&L management',
      'London market knowledge preferred',
    ],
  },
  '6': {
    id: '6', maison: 'French Jewellery Maison', title: 'Country Manager — UK & Ireland',
    market: 'London · UK', salary: '£110–135K + bonus', category: 'Jewellery',
    seniority: 'Manager', badge: 'Senior', is_confidential: false, contract: 'Permanent',
    description: 'Lead the UK and Ireland market for a prestigious French jewellery maison. Full commercial responsibility across 4 boutiques and wholesale partnerships. Drive brand development, client engagement, and market share growth. Report to the European Managing Director.',
    requirements: [
      'Minimum 8 years in luxury retail or wholesale, with market leadership experience',
      'Jewellery or watch industry experience strongly preferred',
      'Proven track record in market development and commercial growth',
      'Strong understanding of UK luxury retail landscape',
      'Experience managing multi-door operations',
      'French language skills valued but not essential',
    ],
  },
}

export default function JobDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { isAuthenticated } = useMember()
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState('')

  const job = jobs[id]

  if (!job) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Position not found.</p>
        <Link href="/jobs" className="jl-overline-gold mt-4 inline-block hover:underline">&larr; All Positions</Link>
      </div>
    )
  }

  const handleApply = async () => {
    if (!isAuthenticated) return
    setApplying(true)
    setError('')
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      if (res.ok) {
        setApplied(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Something went wrong')
    } finally {
      setApplying(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <Link href="/jobs" className="jl-overline text-[#a58e28] hover:underline mb-4 inline-block">&larr; All Positions</Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="jl-overline-gold">{job.maison}</span>
            {job.is_confidential && <span className="jl-badge text-[0.55rem]">Confidential</span>}
            <span className="jl-badge-outline text-[0.55rem]">{job.seniority}</span>
          </div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 font-sans text-sm text-[#888]">
            <span>{job.market}</span>
            <span>&middot;</span>
            <span>{job.category}</span>
            <span>&middot;</span>
            <span>{job.contract}</span>
          </div>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="jl-section-label"><span>Position Overview</span></div>
            <p className="font-sans text-sm text-[#333] leading-relaxed mb-10">
              {job.description}
            </p>

            <div className="jl-section-label"><span>Requirements</span></div>
            <ul className="space-y-3 mb-10">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#a58e28] mt-0.5 flex-shrink-0">&bull;</span>
                  <span className="font-sans text-sm text-[#555] leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>

            {job.is_confidential && (
              <div className="p-4 bg-[#fafaf5] border border-[#e8e2d8] mb-10">
                <p className="font-sans text-xs text-[#888] leading-relaxed">
                  <strong className="text-[#1a1a1a]">Confidential mandate.</strong> The maison name will be disclosed after initial screening. All applications are handled with full discretion by the JOBLUX team.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="border border-[#e8e2d8] p-5 mb-6">
              <div className="space-y-4">
                {([
                  ['Compensation', job.salary],
                  ['Seniority', job.seniority],
                  ['Category', job.category],
                  ['Market', job.market],
                  ['Contract', job.contract],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-[#f0ece4] pb-3 last:border-0 last:pb-0">
                    <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">{label}</span>
                    <span className="font-sans text-sm font-medium text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {isAuthenticated ? (
              applied ? (
                <div className="p-4 bg-[#fafaf5] border border-[#a58e28] text-center">
                  <p className="font-sans text-sm text-[#a58e28] font-medium">Interest submitted</p>
                  <p className="font-sans text-xs text-[#888] mt-1">The JOBLUX team will be in touch.</p>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="jl-btn jl-btn-gold w-full justify-center disabled:opacity-50"
                  >
                    {applying ? 'Submitting...' : 'Express Interest'}
                  </button>
                  {error && <p className="font-sans text-xs text-red-500 mt-2 text-center">{error}</p>}
                  <p className="font-sans text-[0.6rem] text-[#aaa] mt-3 text-center leading-relaxed">
                    Your profile will be shared with the JOBLUX team. The maison will not see your details until you approve.
                  </p>
                </div>
              )
            ) : (
              <div className="p-4 bg-[#222222] text-center">
                <div className="jl-overline-gold mb-2">Members Only</div>
                <p className="font-sans text-xs text-[#888] mb-3">Sign in to view full details and apply.</p>
                <div className="flex items-center justify-center gap-2">
                  <Link href="/members" className="jl-btn jl-btn-gold text-[0.6rem] py-1.5 px-3">Sign In</Link>
                  <Link href="/join" className="jl-btn jl-btn-ghost text-[0.6rem] py-1.5 px-3">Join</Link>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
