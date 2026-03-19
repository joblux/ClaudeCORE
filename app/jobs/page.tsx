import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title:       'Confidential Luxury Positions — JOBLUX',
  description: 'Confidential executive search mandates in luxury. Manager to Executive level, €100K+. Fashion, watches, hospitality, beauty and more.',
}

const jobs = [
  {
    id:       '1',
    maison:   'Major French Fashion Maison',
    title:    'Store Director — Paris Flagship',
    market:   'Paris · France',
    salary:   '€110–140K + bonus',
    category: 'Fashion',
    seniority:'Director',
    badge:    'Confidential',
  },
  {
    id:       '2',
    maison:   'Swiss Watch Group — Richemont',
    title:    'Regional Director — Gulf & Levant',
    market:   'Dubai · UAE',
    salary:   'AED 380–450K + package',
    category: 'Watches',
    seniority:'Senior Director',
    badge:    'Executive',
  },
  {
    id:       '3',
    maison:   'LVMH Group Brand',
    title:    'HR Director — Asia Pacific',
    market:   'Singapore',
    salary:   'SGD 200–250K',
    category: 'Group',
    seniority:'Director',
    badge:    'Confidential',
  },
  {
    id:       '4',
    maison:   'Italian Leather Goods Maison',
    title:    'Buying Director — RTW & Accessories',
    market:   'Milan · Italy',
    salary:   '€95–120K + bonus',
    category: 'Fashion',
    seniority:'Director',
    badge:    'Senior',
  },
  {
    id:       '5',
    maison:   'Ultra Luxury Hotel Group',
    title:    'General Manager — New Property',
    market:   'London · UK',
    salary:   '£130–160K + benefits',
    category: 'Hospitality',
    seniority:'Executive',
    badge:    'Confidential',
  },
  {
    id:       '6',
    maison:   'French Jewellery Maison',
    title:    'Country Manager — UK & Ireland',
    market:   'London · UK',
    salary:   '£110–135K + bonus',
    category: 'Jewellery',
    seniority:'Manager',
    badge:    'Senior',
  },
]

export default function JobsPage() {
  return (
    <div>
      {/* HEADER */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Confidential Positions</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Executive Search Mandates
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl mb-4">
            Manager to Executive level · €100K+ · All positions are handled with full discretion by the JOBLUX team. Salary always shown.
          </p>
          <p className="font-sans text-[0.65rem] text-[#aaa] tracking-wide">
            All positions handled with full discretion. Salary always shown.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* FILTERS */}
          <div className="lg:col-span-1">
            <div className="jl-section-label"><span>Filter</span></div>

            <div className="space-y-6">
              {[
                { label: 'Category',  options: ['All','Fashion','Watches','Jewellery','Automotive','Hospitality','Beauty'] },
                { label: 'Market',    options: ['All','Paris','London','New York','Dubai','Singapore','Milan','Tokyo']     },
                { label: 'Seniority', options: ['All','Manager','Director','Senior Director','Executive']                 },
              ].map((filter) => (
                <div key={filter.label}>
                  <label className="jl-label">{filter.label}</label>
                  <select className="jl-select">
                    {filter.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Employer CTA */}
            <div className="mt-8 p-4 bg-[#fafaf5] border border-[#e8e2d8]">
              <div className="jl-overline-gold mb-2">For Employers</div>
              <p className="font-sans text-xs text-[#666] leading-relaxed mb-3">
                Submit a confidential hiring brief. JOBLUX presents pre-screened candidates.
              </p>
              <Link href="/join?type=employer" className="jl-btn jl-btn-primary w-full justify-center text-[0.6rem] py-2">
                Submit a Brief
              </Link>
            </div>
          </div>

          {/* JOB LIST */}
          <div className="lg:col-span-3">
            <div className="jl-section-label">
              <span>{jobs.length} Open Positions</span>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="jl-card group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="jl-overline-gold">{job.maison}</span>
                        <span className="jl-badge text-[0.55rem]">{job.badge}</span>
                      </div>
                      <h3 className="jl-serif text-lg font-light text-[#1a1a1a] mb-2 group-hover:text-[#a58e28] transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4">
                        <span className="font-sans text-xs text-[#888]">📍 {job.market}</span>
                        <span className="font-sans text-xs text-[#888]">💼 {job.category}</span>
                        <span className="font-sans text-xs font-semibold text-[#1a1a1a]">{job.salary}</span>
                      </div>
                    </div>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="jl-btn jl-btn-outline flex-shrink-0 py-2 px-4 text-[0.6rem]"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Members gate */}
            <div className="mt-8 p-6 bg-[#fafaf5] border border-[#e8e2d8] text-center">
              <div className="jl-overline-gold mb-2">Members Only</div>
              <p className="font-sans text-sm text-[#666] mb-4">
                Sign in to view full position details, salary breakdown and apply directly.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/members" className="jl-btn jl-btn-primary">Sign In</Link>
                <Link href="/join" className="jl-btn jl-btn-outline">Request Access</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
