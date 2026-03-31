'use client'

import { useEffect, useState } from 'react'

export default function LUXAISettingsPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/luxai/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(data.settings || {
          signal_generation_enabled: true,
          signal_daily_target: 6,
          salary_benchmark_enabled: true,
          salary_compare_enabled: true,
          salary_calculator_enabled: true,
          salary_require_approval: false,
          interview_generation_enabled: true,
          interview_require_approval: true,
          model: 'claude-haiku-3-5-20241022',
          max_tokens: 1500
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/luxai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      alert('Settings saved successfully')
    } catch (error) {
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-[900px]">
        <div className="mb-8">
          <h2 className="text-[28px] font-semibold text-[#111] mb-2">LUXAI Settings</h2>
          <p className="text-sm text-[#666]">Configure AI generation parameters and automation rules</p>
        </div>

        {/* Signal Generation */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
          <h3 className="text-base font-semibold text-[#111] mb-4">Signal Generation</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Auto-generate daily signals</div>
              <div className="text-xs text-[#666]">LUXAI will generate 5-8 signals per day based on news sources</div>
            </div>
            <button
              onClick={() => setSettings({...settings, signal_generation_enabled: !settings.signal_generation_enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.signal_generation_enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.signal_generation_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Target signals per day</div>
              <div className="text-xs text-[#666]">Number of signals to generate daily</div>
            </div>
            <input
              type="number"
              value={settings.signal_daily_target}
              onChange={(e) => setSettings({...settings, signal_daily_target: parseInt(e.target.value)})}
              className="w-20 px-2.5 py-1.5 border border-[#e8e8e8] rounded text-sm"
              min="1"
              max="20"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">News sources</div>
              <div className="text-xs text-[#666]">WWD, BOF, Vogue Business, FT, Bloomberg, Reuters</div>
            </div>
            <button className="px-4 py-2 bg-white border border-[#e8e8e8] rounded-md text-sm font-medium text-[#111] hover:bg-[#f5f5f5] transition-colors">
              Configure
            </button>
          </div>
        </div>

        {/* Salary Intelligence */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
          <h3 className="text-base font-semibold text-[#111] mb-4">Salary Intelligence</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Enable benchmark tool</div>
              <div className="text-xs text-[#666]">Allow LUXAI to generate salary benchmarks</div>
            </div>
            <button
              onClick={() => setSettings({...settings, salary_benchmark_enabled: !settings.salary_benchmark_enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.salary_benchmark_enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.salary_benchmark_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Enable compare tool</div>
              <div className="text-xs text-[#666]">Allow LUXAI to generate salary comparisons</div>
            </div>
            <button
              onClick={() => setSettings({...settings, salary_compare_enabled: !settings.salary_compare_enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.salary_compare_enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.salary_compare_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Enable calculator tool</div>
              <div className="text-xs text-[#666]">Allow LUXAI to generate personalized estimates</div>
            </div>
            <button
              onClick={() => setSettings({...settings, salary_calculator_enabled: !settings.salary_calculator_enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.salary_calculator_enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.salary_calculator_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Require approval for salary tools</div>
              <div className="text-xs text-[#666]">All salary outputs go through approval queue</div>
            </div>
            <button
              onClick={() => setSettings({...settings, salary_require_approval: !settings.salary_require_approval})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.salary_require_approval ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.salary_require_approval ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Interview Intelligence */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-5">
          <h3 className="text-base font-semibold text-[#111] mb-4">Interview Intelligence</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Generate interview details</div>
              <div className="text-xs text-[#666]">LUXAI expands basic interview data into full experiences</div>
            </div>
            <button
              onClick={() => setSettings({...settings, interview_generation_enabled: !settings.interview_generation_enabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.interview_generation_enabled ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.interview_generation_enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Require approval for interview content</div>
              <div className="text-xs text-[#666]">All interview details go through approval queue</div>
            </div>
            <button
              onClick={() => setSettings({...settings, interview_require_approval: !settings.interview_require_approval})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.interview_require_approval ? 'bg-[#10B981]' : 'bg-[#e8e8e8]'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.interview_require_approval ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* AI Model */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-8">
          <h3 className="text-base font-semibold text-[#111] mb-4">AI Model</h3>
          
          <div className="flex items-center justify-between py-3 border-b border-[#f5f5f5]">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Primary model</div>
              <div className="text-xs text-[#666]">Claude Haiku 3.5 (recommended for cost)</div>
            </div>
            <select
              value={settings.model}
              onChange={(e) => setSettings({...settings, model: e.target.value})}
              className="px-2.5 py-1.5 border border-[#e8e8e8] rounded text-sm"
            >
              <option value="claude-haiku-3-5-20241022">Claude Haiku 3.5</option>
              <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <div className="text-sm font-medium text-[#111] mb-1">Max tokens per request</div>
              <div className="text-xs text-[#666]">Cost control limit</div>
            </div>
            <input
              type="number"
              value={settings.max_tokens}
              onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})}
              className="w-24 px-2.5 py-1.5 border border-[#e8e8e8] rounded text-sm"
              min="100"
              max="10000"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#111] text-white rounded-md text-sm font-medium hover:bg-[#333] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  )
}
