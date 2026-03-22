'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useMember } from '@/lib/auth-hooks'

interface Comment {
  id: string
  content: string
  created_at: string
  contributor_name: string
  contributor_tier: string
  replies?: Comment[]
}

interface Props {
  articleId: string
  articleTitle: string
  articleSlug: string
}

const TIER_LABELS: Record<string, string> = {
  basic: 'Member', rising: 'Rising', pro: 'Pro', professional: 'Pro+',
  executive: 'Executive', business: 'Business', insider: 'Insider',
}

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'today'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export default function ArticleInteractions({ articleId, articleTitle, articleSlug }: Props) {
  const { isAuthenticated, isApproved } = useMember()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [posting, setPosting] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Track view
    fetch(`/api/articles/${articleId}/views`, { method: 'POST' }).catch(() => {})

    // Fetch comments
    fetch(`/api/articles/${articleId}/comments`)
      .then(r => r.json())
      .then(data => setComments(data.comments || []))
      .catch(() => {})
  }, [articleId])

  const submitComment = async (parentId?: string) => {
    const text = parentId ? replyText : commentText
    if (text.length < 10) return
    setPosting(true)
    try {
      await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, parent_id: parentId || null }),
      })
      setCommentSuccess(true)
      setCommentText('')
      setReplyText('')
      setReplyTo(null)
    } catch {}
    setPosting(false)
  }

  const shareUrl = `https://www.luxuryrecruiter.com/bloglux/${articleSlug}`

  return (
    <>
      {/* ── SOCIAL SHARING ─────────────────────────────── */}
      <div className="border-t border-[#e8e2d8]">
        <div className="jl-container py-6">
          <div className="max-w-[720px] mx-auto">
            <div className="flex items-center gap-4">
              <span className="font-sans text-[0.65rem] text-[#888] uppercase tracking-wider">Share</span>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[#888] hover:text-[#a58e28] transition-colors" title="Share on LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(articleTitle + ' ' + shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[#888] hover:text-[#a58e28] transition-colors" title="Share on WhatsApp"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(articleTitle)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[#888] hover:text-[#a58e28] transition-colors" title="Share on X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="text-[#888] hover:text-[#a58e28] transition-colors text-xs font-sans tracking-wide"
              >
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── COMMENTS ───────────────────────────────────── */}
      <div className="border-t border-[#e8e2d8]">
        <div className="jl-container py-10">
          <div className="max-w-[720px] mx-auto">
            <div className="jl-section-label"><span>Discussion</span></div>

            {/* Comment input */}
            {isAuthenticated && isApproved ? (
              <div className="mb-8">
                {commentSuccess ? (
                  <div className="p-4 bg-[#fafaf5] border border-[#e8e2d8] text-center">
                    <p className="font-sans text-sm text-[#888]">Comment submitted for moderation. It will appear once approved.</p>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="jl-input w-full min-h-[80px] resize-y mb-2"
                    />
                    <button
                      onClick={() => submitComment()}
                      disabled={posting || commentText.length < 10}
                      className="jl-btn jl-btn-primary text-xs disabled:opacity-40"
                    >
                      {posting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="mb-8 p-4 bg-[#fafaf5] border border-[#e8e2d8] text-center">
                <p className="font-sans text-sm text-[#888]">
                  <Link href="/join" className="text-[#a58e28] hover:underline">Request access</Link> to join the discussion.
                </p>
              </div>
            )}

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    <div className="jl-card">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-sans text-xs font-medium text-[#1a1a1a]">{comment.contributor_name}</span>
                        <span className="jl-badge-outline text-[0.5rem]">{TIER_LABELS[comment.contributor_tier] || 'Member'}</span>
                        <span className="font-sans text-[0.6rem] text-[#ccc] ml-auto">{timeAgo(comment.created_at)}</span>
                      </div>
                      <p className="font-sans text-sm text-[#555] leading-relaxed">{comment.content}</p>
                      {isAuthenticated && isApproved && (
                        <button
                          onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyText('') }}
                          className="font-sans text-[0.65rem] text-[#a58e28] mt-2 hover:underline"
                        >
                          Reply
                        </button>
                      )}
                    </div>

                    {/* Reply input */}
                    {replyTo === comment.id && (
                      <div className="ml-8 mt-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="jl-input w-full min-h-[60px] resize-y mb-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setReplyTo(null)} className="text-xs text-[#888]">Cancel</button>
                          <button
                            onClick={() => submitComment(comment.id)}
                            disabled={posting || replyText.length < 10}
                            className="jl-btn jl-btn-primary text-[0.6rem] py-1 px-3 disabled:opacity-40"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Nested replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-8 mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="jl-card border-l-2 border-[#a58e28]">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-sans text-xs font-medium text-[#1a1a1a]">{reply.contributor_name}</span>
                              <span className="font-sans text-[0.6rem] text-[#ccc]">{timeAgo(reply.created_at)}</span>
                            </div>
                            <p className="font-sans text-xs text-[#555] leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="font-sans text-sm text-[#888] text-center py-4">No comments yet. Be the first to share your thoughts.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
