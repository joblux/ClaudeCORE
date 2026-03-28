'use client'

import { useState, useEffect } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'

interface PendingComment {
  id: string
  content: string
  created_at: string
  article_title: string
  article_slug: string
  member_name: string
  member_email: string
}

export default function AdminCommentsPage() {
  useRequireAdmin()
  const [comments, setComments] = useState<PendingComment[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const fetchComments = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/comments')
      const data = await res.json()
      setComments(data.comments || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchComments() }, [])

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActing(id)
    await fetch('/api/admin/comments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    setComments(prev => prev.filter(c => c.id !== id))
    setActing(null)
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="jl-overline-gold mb-1">BlogLux</div>
        <h1 className="jl-serif text-2xl font-light text-[#1a1a1a]">Comment Moderation</h1>
      </div>

      {loading ? (
        <div className="text-center py-16"><div className="inline-block w-8 h-8 border-2 border-[#e8e8e8] border-t-[#111] rounded-full animate-spin" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-16">
          <p className="jl-serif text-lg text-[#1a1a1a] mb-2">No pending comments</p>
          <p className="text-sm text-[#666666]">All comments have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-[#666666]">{comments.length} pending comment{comments.length !== 1 ? 's' : ''}</p>
          {comments.map((c) => (
            <div key={c.id} className="jl-card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-sans text-xs font-medium text-[#1a1a1a]">{c.member_name}</span>
                  <span className="font-sans text-[0.6rem] text-[#aaa] ml-2">{c.member_email}</span>
                </div>
                <span className="font-sans text-[0.6rem] text-[#444444]">
                  {new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="font-sans text-[0.65rem] text-[#444444] mb-2">on: {c.article_title}</div>
              <p className="font-sans text-sm text-[#555] leading-relaxed mb-4">{c.content}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(c.id, 'approve')}
                  disabled={acting === c.id}
                  className="jl-btn jl-btn-primary text-[0.6rem] py-1.5 px-3"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(c.id, 'reject')}
                  disabled={acting === c.id}
                  className="text-xs text-red-500 hover:text-red-700 px-2"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
