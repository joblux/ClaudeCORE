'use client'

import Link from 'next/link'

export default function DirectoryPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#fafaf5] px-6">
      <div className="text-center max-w-md">
        <p className="jl-overline-gold mb-4 tracking-[0.2em]">Coming Soon</p>
        <h1 className="jl-serif text-3xl md:text-4xl text-[#1a1a1a] mb-4">
          Luxury Services Directory
        </h1>
        <p className="text-sm text-[#888] leading-relaxed mb-8">
          A curated directory of premium services and professionals across the luxury industry
          is being prepared. This exclusive feature will connect our Society members with
          vetted partners and service providers.
        </p>
        <Link href="/dashboard" className="jl-btn jl-btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  )
}
