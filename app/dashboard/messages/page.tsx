'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRequireApproved, useMember } from '@/lib/auth-hooks'
import type { Conversation, Message } from '@/types/messaging'

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function CandidateMessagesPage() {
  useRequireApproved()
  const { memberId, name, isLoading: authLoading, isAuthenticated } = useMember()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [replyBody, setReplyBody] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(() => {
    setLoading(true)
    fetch('/api/messages/my-conversations')
      .then((res) => res.json())
      .then((data) => setConversations(data.conversations || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isAuthenticated || !memberId) return
    fetchConversations()
  }, [isAuthenticated, memberId, fetchConversations])

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id)
    setLoadingMessages(true)
    setReplyBody('')
    try {
      const res = await fetch(`/api/messages/conversations/${id}`)
      const data = await res.json()
      setMessages(data.messages || [])

      // Mark as read
      fetch(`/api/messages/conversations/${id}/read`, { method: 'POST' }).catch(() => {})
    } catch {
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    if (!replyBody.trim() || !activeId || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/messages/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'candidate',
          sender_name: name || 'Candidate',
          body: replyBody.trim(),
        }),
      })
      if (res.ok) {
        setReplyBody('')
        // Refresh messages and conversation list
        openConversation(activeId)
        fetchConversations()
      }
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeConversation = conversations.find((c) => c.id === activeId)

  if (authLoading) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        <p>Please sign in to view your messages.</p>
        <Link href="/members" style={{ color: '#a58e28', fontSize: 13 }}>Sign In</Link>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", fontWeight: 600, fontSize: 18, color: '#1a1a1a', letterSpacing: 1 }}>JOBLUX</span>
          <span style={{ color: '#ccc', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Messages</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#a58e28', margin: '0 0 6px 0' }}>
            Your Messages
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Messages</h1>
        </div>

        {loading ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>Loading conversations...</p>
        ) : conversations.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            border: '1px solid #f0ece4', background: '#faf9f6',
          }}>
            <p style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 500, marginBottom: 8 }}>No messages yet.</p>
            <p style={{ fontSize: 13, color: '#888', maxWidth: 420, margin: '0 auto', lineHeight: 1.7 }}>
              When a JOBLUX recruiter contacts you about an opportunity, your messages will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: activeId ? '320px 1fr' : '1fr', gap: 0, border: '1px solid #e8e2d8', minHeight: 520 }}>
            {/* Conversation list */}
            <div style={{
              borderRight: activeId ? '1px solid #e8e2d8' : 'none',
              overflowY: 'auto', maxHeight: 600,
              display: activeId ? undefined : 'block',
            }}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f0ece4',
                    cursor: 'pointer',
                    background: activeId === conv.id ? '#faf9f6' : '#fff',
                    borderLeft: activeId === conv.id ? '3px solid #a58e28' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <span style={{
                      fontSize: 13, fontWeight: conv.unread_count > 0 ? 700 : 500,
                      color: '#1a1a1a', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {conv.subject || 'No subject'}
                    </span>
                    <span style={{ fontSize: 10, color: '#aaa', marginLeft: 8, whiteSpace: 'nowrap' }}>
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  {conv.search_assignment && (
                    <p style={{ fontSize: 11, color: '#a58e28', margin: '0 0 3px 0', fontWeight: 500 }}>
                      {conv.search_assignment.title}
                      {conv.search_assignment.maison ? ` \u2014 ${conv.search_assignment.maison}` : ''}
                    </p>
                  )}
                  <p style={{
                    fontSize: 12, color: '#888', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {conv.last_message_preview || 'No messages yet'}
                  </p>
                  {conv.unread_count > 0 && (
                    <span style={{
                      display: 'inline-block', marginTop: 4,
                      background: '#a58e28', color: '#fff', fontSize: 9, fontWeight: 700,
                      padding: '1px 7px', borderRadius: 8,
                    }}>
                      {conv.unread_count} new
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Message thread */}
            {activeId && (
              <div style={{ display: 'flex', flexDirection: 'column', height: 600 }}>
                {/* Thread header */}
                <div style={{
                  padding: '14px 20px', borderBottom: '1px solid #e8e2d8',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                      {activeConversation?.subject || 'Conversation'}
                    </h3>
                    {activeConversation?.search_assignment && (
                      <p style={{ fontSize: 11, color: '#a58e28', margin: '2px 0 0 0' }}>
                        {activeConversation.search_assignment.title}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveId(null)}
                    style={{
                      background: 'transparent', border: 'none', color: '#888',
                      fontSize: 12, cursor: 'pointer', padding: '4px 8px',
                    }}
                  >
                    Close
                  </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                  {loadingMessages ? (
                    <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>No messages in this conversation.</p>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_type === 'candidate'
                      return (
                        <div
                          key={msg.id}
                          style={{
                            marginBottom: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwn ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div style={{
                            maxWidth: '75%',
                            padding: '12px 16px',
                            background: isOwn ? '#1a1a1a' : '#faf9f6',
                            color: isOwn ? '#e8e2d8' : '#1a1a1a',
                            border: isOwn ? 'none' : '1px solid #f0ece4',
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isOwn ? '#a58e28' : '#888' }}>
                                {msg.sender_type === 'recruiter' ? 'JOBLUX Recruiter' : msg.sender_name}
                              </span>
                              <span style={{ fontSize: 10, color: isOwn ? '#888' : '#aaa', marginLeft: 12 }}>
                                {formatMessageTime(msg.sent_at)}
                              </span>
                            </div>
                            <p style={{
                              fontSize: 13, lineHeight: 1.7, margin: 0,
                              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            }}>
                              {msg.body}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply box */}
                <div style={{
                  padding: '12px 20px', borderTop: '1px solid #e8e2d8',
                  display: 'flex', gap: 10, alignItems: 'flex-end',
                }}>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your reply..."
                    rows={2}
                    style={{
                      flex: 1, padding: '10px 12px', fontSize: 13,
                      border: '1px solid #e8e2d8', background: '#fff', color: '#1a1a1a',
                      fontFamily: 'Inter, system-ui, sans-serif', resize: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyBody.trim() || sending}
                    style={{
                      background: !replyBody.trim() || sending ? '#ccc' : '#1a1a1a',
                      color: !replyBody.trim() || sending ? '#888' : '#a58e28',
                      border: 'none', padding: '10px 20px', fontSize: 11, fontWeight: 600,
                      letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                      cursor: !replyBody.trim() || sending ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
