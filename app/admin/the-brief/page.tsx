'use client'

import { useRequireAdmin } from '@/lib/auth-hooks'
import Link from 'next/link'

export default function TheBriefAdmin() {
  const { isAdmin, isLoading } = useRequireAdmin()

  if (isLoading) return <div className="p-8 text-sm text-[#999]">Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="p-6 max-w-[960px]">
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-[#111] mb-1">The Brief</h2>
        <p className="text-[13px] text-[#888]">
          Biweekly newsletter — industry moves, salary intelligence, new positions, WikiLux spotlight, market signals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#999] mb-1">Status</div>
          <div className="text-[15px] font-medium text-[#111]">Pre-launch</div>
        </div>
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#999] mb-1">Frequency</div>
          <div className="text-[15px] font-medium text-[#111]">Biweekly</div>
        </div>
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
          <div className="text-[11px] uppercase tracking-wider text-[#999] mb-1">Public page</div>
          <Link href="/the-brief" className="text-[15px] font-medium text-[#111] hover:underline">/the-brief</Link>
        </div>
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-4">
        <h3 className="text-[14px] font-semibold text-[#111] mb-2">Newsletter content</h3>
        <p className="text-[13px] text-[#888] leading-relaxed mb-4">
          Each issue covers six sections: Industry Moves, Salary Intelligence, New Positions, WikiLux Spotlight, Market Intelligence, and Travel & Lifestyle.
        </p>
        <div className="text-[12px] text-[#aaa] bg-[#f9f9f9] border border-[#eee] rounded px-3 py-2">
          Issue creation, scheduling, and subscriber management will be built here. The public subscribe form exists at /the-brief but the backend endpoint is not yet wired.
        </div>
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
        <h3 className="text-[14px] font-semibold text-[#111] mb-2">Planned features</h3>
        <ul className="text-[13px] text-[#666] space-y-1.5 list-disc list-inside">
          <li>Issue editor and preview</li>
          <li>Subscriber list management</li>
          <li>Send / schedule / archive</li>
          <li>Open rate and engagement tracking</li>
        </ul>
      </div>
    </div>
  )
}
