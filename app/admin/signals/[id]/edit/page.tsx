'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

const FIELDS = [
  { key: 'headline', label: 'Headline', type: 'text' },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'category', label: 'Category', type: 'text' },
  { key: 'source_name', label: 'Source name', type: 'text' },
  { key: 'source_url', label: 'Source URL', type: 'text' },
  { key: 'what_happened', label: 'What happened', type: 'textarea' },
  { key: 'why_it_matters', label: 'Why it matters', type: 'textarea' },
  { key: 'context_paragraph', label: 'Context paragraph', type: 'textarea' },
  { key: 'career_implications', label: 'Career implications', type: 'textarea' },
] as const

export default function AdminSignalEditPage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = params?.id as string

  const [signal, setSignal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin || !id) return
    fetch(`/api/admin/signals/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.signal) setSignal(data.signal)
        else setError(data.error || 'Failed to load signal')
      })
      .finally(() => setLoading(false))
  }, [isAdmin, id])

  const update = (key: string, value: any) => {
    setSignal((prev: any) => ({ ...prev, [key]: value }))
  }

  const save = async () => {
    setSaving(true)
    setError(null)

    const updates: Record<string, any> = {}
    for (const f of FIELDS) updates[f.key] = signal[f.key] ?? null

    // brand_tags as comma-separated string in input → array on save
    if (typeof signal.brand_tags === 'string') {
      updates.brand_tags = signal.brand_tags
        .split(',')
        .map((t: string) => t.trim())
        .filter(Boolean)
    } else {
      updates.brand_tags = signal.brand_tags || []
    }
    updates.is_published = !!signal.is_published
    updates.is_pinned = !!signal.is_pinned

    const res = await fetch(`/api/admin/signals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) setError(data.error || 'Save failed')
    else router.push('/admin/signals')
    setSaving(false)
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <div className="text-sm text-[#999]">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) return null
  if (!signal) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] px-6 py-5 lg:px-8">
        <p className="text-sm text-red-600">{error || 'Signal not found.'}</p>
        <Link href="/admin/signals" className="text-xs text-[#444] underline mt-3 inline-block">
          ← Back to Signals
        </Link>
      </div>
    )
  }

  const brandTagsValue = Array.isArray(signal.brand_tags)
    ? signal.brand_tags.join(', ')
    : signal.brand_tags || ''

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <div className="px-6 py-5 lg:px-8 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <Link href="/admin/signals" className="text-xs text-[#999] hover:text-[#444] transition-colors">
              ← Back to Signals
            </Link>
            <h1 className="text-xl font-medium text-[#1a1a1a] mt-1">Edit signal</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="bg-white border border-[#e8e8e8] rounded-xl p-6 space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">
                {f.label}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  value={signal[f.key] ?? ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  rows={3}
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:border-[#bbb] transition-colors"
                />
              ) : (
                <input
                  type="text"
                  value={signal[f.key] ?? ''}
                  onChange={(e) => update(f.key, e.target.value)}
                  className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:border-[#bbb] transition-colors"
                />
              )}
            </div>
          ))}

          <div>
            <label className="block text-[11px] font-medium text-[#666] uppercase tracking-wide mb-1.5">
              Brand tags (comma-separated)
            </label>
            <input
              type="text"
              value={brandTagsValue}
              onChange={(e) => update('brand_tags', e.target.value)}
              className="w-full border border-[#e8e8e8] rounded-lg px-3 py-2 text-sm bg-white text-[#1a1a1a] focus:outline-none focus:border-[#bbb] transition-colors"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-[#444]">
              <input
                type="checkbox"
                checked={!!signal.is_published}
                onChange={(e) => update('is_published', e.target.checked)}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-[#444]">
              <input
                type="checkbox"
                checked={!!signal.is_pinned}
                onChange={(e) => update('is_pinned', e.target.checked)}
              />
              Pinned
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-[11px] font-semibold tracking-wide uppercase bg-[#111111] text-white rounded-lg hover:bg-[#8a7622] transition-colors disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link
            href="/admin/signals"
            className="text-[11px] font-medium text-[#444] uppercase tracking-wide hover:text-[#8a7622] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
