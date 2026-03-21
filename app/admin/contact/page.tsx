'use client'

import { useState, useEffect } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'

interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  admin_notes: string | null
  created_at: string
}

const STATUS_COLORS: Record<string, string> = {
  new: '#a58e28',
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

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contact')
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchMessages() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null)
  }

  const filtered = filterStatus
    ? messages.filter(m => m.status === filterStatus)
    : messages

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="jl-overline-gold mb-1">Support</div>
        <h1 className="jl-serif text-2xl font-light text-[#1a1a1a]">Contact Messages</h1>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="jl-select text-xs w-36">
          <option value="">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="archived">Archived</option>
        </select>
        <span className="text-xs text-[#888]">{filtered.length} message{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-[#e8e2d8] border-t-[#a58e28] rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-[#888] py-8 text-center">No messages</p>
            ) : filtered.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelected(m); if (m.status === 'new') updateStatus(m.id, 'read') }}
                className={`jl-card w-full text-left ${selected?.id === m.id ? 'border-[#a58e28]' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-xs font-medium text-[#1a1a1a]">{m.name}</span>
                  <span className="text-[0.55rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_COLORS[m.status] || '#888', backgroundColor: (STATUS_COLORS[m.status] || '#888') + '15' }}>{m.status}</span>
                </div>
                <div className="font-sans text-[0.65rem] text-[#a58e28] mb-1">{m.subject}</div>
                <div className="font-sans text-xs text-[#888] truncate">{m.message}</div>
                <div className="font-sans text-[0.6rem] text-[#ccc] mt-1">{new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && (
            <div className="jl-card sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-sans text-sm font-semibold text-[#1a1a1a]">{selected.name}</div>
                  <a href={`mailto:${selected.email}`} className="font-sans text-xs text-[#a58e28]">{selected.email}</a>
                </div>
                <span className="text-[0.55rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_COLORS[selected.status] || '#888', backgroundColor: (STATUS_COLORS[selected.status] || '#888') + '15' }}>{selected.status}</span>
              </div>
              <div className="jl-overline mb-2">{selected.subject}</div>
              <p className="font-sans text-sm text-[#555] leading-relaxed mb-6 whitespace-pre-line">{selected.message}</p>
              <div className="flex items-center gap-2 pt-4 border-t border-[#e8e2d8]">
                <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`} className="jl-btn jl-btn-primary text-[0.6rem]">Reply</a>
                {selected.status !== 'replied' && (
                  <button onClick={() => updateStatus(selected.id, 'replied')} className="jl-btn jl-btn-outline text-[0.6rem]">Mark Replied</button>
                )}
                <button onClick={() => updateStatus(selected.id, 'archived')} className="text-xs text-[#888] hover:text-[#555]">Archive</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
