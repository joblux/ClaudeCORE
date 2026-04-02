'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

interface ContactMessage {
  id: string
  member_id: string | null
  name: string
  email: string
  category: string
  subcategory: string | null
  message: string
  status: string
  admin_notes: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: '#444',
  read: '#555',
  replied: '#2a7a3c',
  archived: '#888',
}

export default function AdminContactPage() {
  useRequireAdmin()
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    fetch('/api/admin/contact')
      .then(r => r.json())
      .then(data => setMessages(data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
  }

  const filtered = messages.filter(m => {
    if (filterStatus && m.status !== filterStatus) return false
    if (filterCategory && m.category !== filterCategory) return false
    return true
  })

  const categories = [...new Set(messages.map(m => m.category))].sort()

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="jl-overline-gold mb-1">Support</div>
        <h1 className="jl-serif text-2xl font-light text-[#1a1a1a]">Contact Messages</h1>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="jl-select text-xs w-32">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="jl-select text-xs w-40">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs text-[#666666]">{filtered.length} message{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2 max-h-[80vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-[#666666] py-8 text-center">No messages</p>
            ) : filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); if (m.status === 'new') updateStatus(m.id, 'read') }}
                className={`jl-card w-full text-left ${selected?.id === m.id ? 'border-[#e8e8e8]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-xs font-medium text-[#1a1a1a]">{m.name}</span>
                    {m.member_id && (
                      <Link href={`/admin?search=${encodeURIComponent(m.email)}`} onClick={(e) => e.stopPropagation()} className="text-[#444444]" title="View profile">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </Link>
                    )}
                  </div>
                  <span className="text-[0.55rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_COLORS[m.status] || '#888', backgroundColor: (STATUS_COLORS[m.status] || '#888') + '15' }}>{m.status}</span>
                </div>
                <div className="font-sans text-[0.65rem] text-[#444444] mb-0.5">{m.category}{m.subcategory ? ` › ${m.subcategory}` : ''}</div>
                <div className="font-sans text-xs text-[#666666] truncate">{m.message}</div>
                <div className="font-sans text-[0.6rem] text-[#444444] mt-1">{new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="jl-card sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-sans text-sm font-semibold text-[#1a1a1a]">{selected.name}</div>
                  <div className="font-sans text-xs text-[#666666]">{selected.email}</div>
                </div>
                <span className="text-[0.55rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_COLORS[selected.status] || '#888', backgroundColor: (STATUS_COLORS[selected.status] || '#888') + '15' }}>{selected.status}</span>
              </div>
              <div className="jl-overline-gold mb-1">{selected.category}{selected.subcategory ? ` › ${selected.subcategory}` : ''}</div>
              <p className="font-sans text-sm text-[#555] leading-relaxed mb-6 whitespace-pre-line">{selected.message}</p>
              <div className="font-sans text-[0.6rem] text-[#444444] mb-4">{new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div className="flex items-center gap-2 pt-4 border-t border-[#e8e8e8]">
                <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: JOBLUX | ${selected.category}${selected.subcategory ? ' | ' + selected.subcategory : ''}`)}`} className="jl-btn jl-btn-primary text-[0.6rem]">Reply</a>
                {selected.status !== 'replied' && (
                  <button onClick={() => updateStatus(selected.id, 'replied')} className="jl-btn jl-btn-outline text-[0.6rem]">Mark Replied</button>
                )}
                <button onClick={() => updateStatus(selected.id, 'archived')} className="text-xs text-[#666666] hover:text-[#555]">Archive</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
