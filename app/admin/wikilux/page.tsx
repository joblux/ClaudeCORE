'use client'

import { useRequireAdmin } from '@/lib/auth-hooks'

export default function AdminWikiLuxPage() {
  useRequireAdmin()

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <p className="jl-overline-gold mb-1">Admin</p>
          <h1 className="text-2xl jl-serif font-semibold text-[#1a1a1a]">WikiLux Management</h1>
        </div>

        <div className="jl-card p-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#f5f3ed] border border-[#e8e2d8] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                stroke="#a58e28"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">Coming Soon</h2>
          <p className="text-sm text-[#888] max-w-md mx-auto">
            WikiLux brand management will be available here. You will be able to create, edit, and
            organise brand profiles, industry insights, and curated content for the JOBLUX community.
          </p>
        </div>
      </div>
    </main>
  )
}
