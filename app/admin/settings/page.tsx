'use client'

import { useRequireAdmin } from '@/lib/auth-hooks'

export default function SettingsPage() {
  const { isAdmin, isLoading } = useRequireAdmin()

  if (isLoading) return <div className="p-8 text-sm text-[#999]">Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="p-6 max-w-[960px]">
      <div className="mb-6">
        <h2 className="text-[18px] font-semibold text-[#111] mb-1">Platform Settings</h2>
        <p className="text-[13px] text-[#888]">Configuration and operational controls.</p>
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5 mb-4">
        <h3 className="text-[14px] font-semibold text-[#111] mb-2">Maintenance mode</h3>
        <p className="text-[13px] text-[#888] leading-relaxed">
          Use the toggle in the sidebar footer to switch the site between live and offline mode.
        </p>
      </div>

      <div className="bg-white border border-[#e8e8e8] rounded-lg p-5">
        <h3 className="text-[14px] font-semibold text-[#111] mb-2">Planned settings</h3>
        <ul className="text-[13px] text-[#666] space-y-1.5 list-disc list-inside">
          <li>Default approval mode (manual / AI-assisted)</li>
          <li>Email notification preferences</li>
          <li>Contribution point thresholds</li>
          <li>LuxAI generation defaults</li>
          <li>SEO and metadata controls</li>
        </ul>
      </div>
    </div>
  )
}
