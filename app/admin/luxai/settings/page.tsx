'use client'

import { useEffect, useState } from 'react'

interface LuxaiSettings {
  auto_approve_signals: boolean
  auto_approve_salary: boolean
  auto_approve_interview: boolean
  generation_enabled: boolean
  daily_generation_limit: number
  model: string
  temperature: number
  content_types: string[]
}

const DEFAULT_SETTINGS: LuxaiSettings = {
  auto_approve_signals: false,
  auto_approve_salary: false,
  auto_approve_interview: false,
  generation_enabled: true,
  daily_generation_limit: 50,
  model: 'gpt-4o',
  temperature: 0.7,
  content_types: ['signal', 'salary_benchmark', 'interview_detail'],
}

export default function LUXAISettingsPage() {
  const [settings, setSettings] = useState<LuxaiSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/luxai/settings')
      .then(r => r.json())
      .then(data => {
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/api/admin/luxai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Failed to save settings')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-[800px]">
        <h2 className="text-2xl font-semibold text-[#111] mb-2">LUXAI Settings</h2>
        <p className="text-sm text-[#666] mb-8">Configure AI generation and approval workflows</p>

        {/* Generation */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">Generation</h3>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#111] font-medium">Enable Generation</div>
                <div className="text-xs text-[#999] mt-0.5">Allow LUXAI to generate new content</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, generation_enabled: !s.generation_enabled }))}
                className={`relative w-10 h-[22px] rounded-full transition-colors ${
                  settings.generation_enabled ? 'bg-[#10B981]' : 'bg-[#d4d4d4]'
                }`}
              >
                <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform shadow-sm ${
                  settings.generation_enabled ? 'translate-x-[18px]' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div>
              <label className="text-sm text-[#111] font-medium block mb-1.5">Daily Generation Limit</label>
              <input
                type="number"
                value={settings.daily_generation_limit}
                onChange={e => setSettings(s => ({ ...s, daily_generation_limit: parseInt(e.target.value) || 0 }))}
                className="w-32 px-3 py-2 text-sm border border-[#e8e8e8] rounded-md focus:outline-none focus:border-[#111]"
              />
              <p className="text-xs text-[#999] mt-1">Maximum items generated per day</p>
            </div>

            <div>
              <label className="text-sm text-[#111] font-medium block mb-1.5">Model</label>
              <select
                value={settings.model}
                onChange={e => setSettings(s => ({ ...s, model: e.target.value }))}
                className="w-48 px-3 py-2 text-sm border border-[#e8e8e8] rounded-md focus:outline-none focus:border-[#111] bg-white"
              >
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="claude-sonnet-4-20250514">Claude Sonnet</option>
                <option value="claude-haiku-4-5-20251001">Claude Haiku</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-[#111] font-medium block mb-1.5">Temperature: {settings.temperature}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.temperature}
                onChange={e => setSettings(s => ({ ...s, temperature: parseFloat(e.target.value) }))}
                className="w-64"
              />
              <p className="text-xs text-[#999] mt-1">Lower = more focused, Higher = more creative</p>
            </div>
          </div>
        </div>

        {/* Auto-Approval */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">Auto-Approval</h3>
          <p className="text-xs text-[#999] mb-5">Skip the approval queue and publish automatically</p>

          <div className="space-y-4">
            {[
              { key: 'auto_approve_signals' as const, label: 'Signals', desc: 'Market, talent, brand & finance signals' },
              { key: 'auto_approve_salary' as const, label: 'Salary Intelligence', desc: 'Benchmarks, comparisons & calculators' },
              { key: 'auto_approve_interview' as const, label: 'Interview Details', desc: 'AI-generated interview content' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-1">
                <div>
                  <div className="text-sm text-[#111]">{item.label}</div>
                  <div className="text-xs text-[#999] mt-0.5">{item.desc}</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key] }))}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    settings[item.key] ? 'bg-[#10B981]' : 'bg-[#d4d4d4]'
                  }`}
                >
                  <span className={`absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white transition-transform shadow-sm ${
                    settings[item.key] ? 'translate-x-[18px]' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content Types */}
        <div className="bg-white border border-[#e8e8e8] rounded-lg p-6 mb-8">
          <h3 className="text-sm font-semibold text-[#111] mb-4 uppercase tracking-wide">Active Content Types</h3>

          <div className="space-y-3">
            {[
              { value: 'signal', label: 'Signals' },
              { value: 'salary_benchmark', label: 'Salary Benchmarks' },
              { value: 'salary_compare', label: 'Salary Comparisons' },
              { value: 'salary_calculator', label: 'Salary Calculator' },
              { value: 'interview_detail', label: 'Interview Details' },
            ].map(ct => (
              <label key={ct.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.content_types.includes(ct.value)}
                  onChange={e => {
                    setSettings(s => ({
                      ...s,
                      content_types: e.target.checked
                        ? [...s.content_types, ct.value]
                        : s.content_types.filter(t => t !== ct.value),
                    }))
                  }}
                  className="w-4 h-4 rounded border-[#d4d4d4]"
                />
                <span className="text-sm text-[#111]">{ct.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#111] text-white text-sm font-medium px-6 py-2.5 rounded-md hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-sm text-[#10B981] font-medium">Settings saved</span>}
        </div>
      </div>
    </div>
  )
}
