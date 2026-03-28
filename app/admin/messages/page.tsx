'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import type {
  Conversation,
  Message,
  MessageTemplate,
  MessageAttachment,
} from '@/types/messaging'
import { TEMPLATE_CATEGORIES } from '@/types/messaging'

// ---------------------------------------------------------------------------
// Design tokens (JOBLUX palette)
// ---------------------------------------------------------------------------
const GOLD = '#444'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e8e8'
const MUTED = '#888'
const LEFT_WIDTH = 350

// ---------------------------------------------------------------------------
// Filter tab type
// ---------------------------------------------------------------------------
type FilterTab = 'all' | 'candidates' | 'clients' | 'unread'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Relative time display for conversation list ("2h", "Yesterday", "Mar 15") */
function relativeTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Full timestamp for message bubbles */
function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/** Initials from a full name */
function initials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/** Human-readable file size */
function fileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

/** Participant display name from conversation */
function participantName(c: Conversation): string {
  if (c.participant_type === 'candidate' && c.member?.full_name) {
    return c.member.full_name
  }
  return c.client_name || c.client_email || 'Unknown'
}

// ===========================================================================
// MAIN PAGE COMPONENT
// ===========================================================================
export default function AdminMessagesPage() {
  const { isAdmin, isLoading: authLoading, name: recruiterName } = useRequireAdmin()

  // ---- Conversations list state -------------------------------------------
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // ---- Active conversation state ------------------------------------------
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeConvo, setActiveConvo] = useState<Conversation | null>(null)
  const [convoLoading, setConvoLoading] = useState(false)

  // ---- Compose state ------------------------------------------------------
  const [composeBody, setComposeBody] = useState('')
  const [sending, setSending] = useState(false)
  const composeRef = useRef<HTMLTextAreaElement>(null)
  const threadEndRef = useRef<HTMLDivElement>(null)

  // ---- Template selector --------------------------------------------------
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  // ---- New message modal --------------------------------------------------
  const [showNewModal, setShowNewModal] = useState(false)

  // ---- Status menu --------------------------------------------------------
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  // =========================================================================
  // DATA FETCHING
  // =========================================================================

  /** Fetch the conversations list with current filters */
  const fetchConversations = useCallback(async () => {
    if (!isAdmin) return
    setListLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab === 'candidates') params.set('participant_type', 'candidate')
      if (activeTab === 'clients') params.set('participant_type', 'client')
      if (activeTab === 'unread') params.set('unread', 'true')
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/messages/conversations?${params.toString()}`)
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {
      setConversations([])
    } finally {
      setListLoading(false)
    }
  }, [isAdmin, activeTab, searchQuery])

  /** Fetch a single conversation with all messages */
  const fetchConversation = useCallback(
    async (id: string) => {
      if (!isAdmin) return
      setConvoLoading(true)
      try {
        const res = await fetch(`/api/messages/conversations/${id}`)
        const data: Conversation = await res.json()
        setActiveConvo(data)

        // Mark as read (fire-and-forget)
        fetch(`/api/messages/conversations/${id}/read`, { method: 'POST' })
      } catch {
        setActiveConvo(null)
      } finally {
        setConvoLoading(false)
      }
    },
    [isAdmin],
  )

  /** Fetch templates (lazy, once) */
  const fetchTemplates = useCallback(async () => {
    if (templatesLoaded) return
    try {
      const res = await fetch('/api/messages/templates')
      const data = await res.json()
      setTemplates(data.templates || [])
      setTemplatesLoaded(true)
    } catch {
      /* silent */
    }
  }, [templatesLoaded])

  // ---- Initial load + refetch on filter change ----------------------------
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ---- Polling: refetch list every 30 seconds -----------------------------
  useEffect(() => {
    if (!isAdmin) return
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [isAdmin, fetchConversations])

  // ---- When active conversation changes, fetch it -------------------------
  useEffect(() => {
    if (activeId) fetchConversation(activeId)
  }, [activeId, fetchConversation])

  // ---- Auto-scroll message thread to bottom -------------------------------
  useEffect(() => {
    if (activeConvo?.messages) {
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [activeConvo?.messages])

  // =========================================================================
  // ACTIONS
  // =========================================================================

  /** Send a message in the active conversation */
  const handleSend = async () => {
    if (!composeBody.trim() || !activeId || sending) return
    setSending(true)
    try {
      await fetch(`/api/messages/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: composeBody }),
      })
      setComposeBody('')
      // Refresh conversation + list
      await Promise.all([fetchConversation(activeId), fetchConversations()])
    } catch {
      /* could show error toast */
    } finally {
      setSending(false)
    }
  }

  /** Keyboard shortcut: Ctrl/Cmd+Enter to send */
  const handleComposeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  /** Select a template and render it into the compose area */
  const handleSelectTemplate = async (template: MessageTemplate) => {
    try {
      // Build merge context from the active conversation
      const mergeData: Record<string, string> = {}
      if (activeConvo) {
        mergeData.candidate_name = activeConvo.member?.full_name || ''
        mergeData.candidate_first_name = (activeConvo.member?.full_name || '').split(' ')[0]
        mergeData.opportunity_title = activeConvo.search_assignment?.title || ''
        mergeData.maison = activeConvo.search_assignment?.maison || ''
        mergeData.client_name = activeConvo.client_name || ''
        mergeData.recruiter_name = recruiterName || ''
      }

      const res = await fetch('/api/messages/templates/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template.id, merge_data: mergeData }),
      })
      const data = await res.json()
      setComposeBody(data.body || template.body)
    } catch {
      // Fallback: insert raw template body
      setComposeBody(template.body)
    }
    setShowTemplates(false)
  }

  /** Update conversation status (archive / close) */
  const handleStatusChange = async (newStatus: 'active' | 'archived' | 'closed') => {
    if (!activeId) return
    try {
      await fetch(`/api/messages/conversations/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      await Promise.all([fetchConversation(activeId), fetchConversations()])
    } catch {
      /* silent */
    }
    setShowStatusMenu(false)
  }

  // =========================================================================
  // AUTH GUARD
  // =========================================================================
  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: MUTED, fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* ================================================================= */}
      {/* TWO-PANEL LAYOUT                                                  */}
      {/* ================================================================= */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* =============================================================== */}
        {/* LEFT PANEL — Conversation List                                  */}
        {/* =============================================================== */}
        <div
          className="jl-panel-left"
          style={{
            width: LEFT_WIDTH,
            minWidth: LEFT_WIDTH,
            maxWidth: LEFT_WIDTH,
            borderRight: `1px solid ${BORDER}`,
            display: 'flex',
            flexDirection: 'column',
            background: CREAM,
          }}
        >
          {/* Left header */}
          <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: BLACK }}>Messages</h2>
              <button
                className="jl-btn-primary"
                onClick={() => setShowNewModal(true)}
                style={{
                  background: BLACK,
                  color: GOLD,
                  border: 'none',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  cursor: 'pointer',
                }}
              >
                + New Message
              </button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'candidates', label: 'Candidates' },
                  { key: 'clients', label: 'Clients' },
                  { key: 'unread', label: 'Unread' },
                ] as { key: FilterTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.key ? `2px solid ${GOLD}` : '2px solid transparent',
                    padding: '4px 0',
                    fontSize: 12,
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    color: activeTab === tab.key ? BLACK : MUTED,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <input
              className="jl-input"
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: 12,
                border: `1px solid ${BORDER}`,
                background: '#fff',
                color: BLACK,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Conversation list (scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {listLoading ? (
              <p style={{ padding: 20, textAlign: 'center', fontSize: 12, color: MUTED }}>Loading...</p>
            ) : conversations.length === 0 ? (
              <p style={{ padding: 20, textAlign: 'center', fontSize: 12, color: MUTED }}>No conversations found.</p>
            ) : (
              conversations.map((convo) => {
                const isSelected = convo.id === activeId
                const isUnread = convo.unread_count > 0
                const name = participantName(convo)

                return (
                  <div
                    key={convo.id}
                    onClick={() => setActiveId(convo.id)}
                    className="jl-convo-item"
                    style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${BORDER}`,
                      cursor: 'pointer',
                      background: isSelected ? '#fff' : 'transparent',
                      borderLeft: isSelected ? `3px solid ${GOLD}` : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10 }}>
                      {/* Avatar / initials circle */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: BLACK,
                          color: GOLD,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 13,
                          fontWeight: 600,
                          flexShrink: 0,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {convo.member?.avatar_url ? (
                          <img
                            src={convo.member.avatar_url}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          initials(name)
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Top row: name + time */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isUnread ? 700 : 500,
                              color: BLACK,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: 180,
                            }}
                          >
                            {name}
                          </span>
                          <span style={{ fontSize: 10, color: MUTED, flexShrink: 0 }}>
                            {relativeTime(convo.last_message_at)}
                          </span>
                        </div>

                        {/* Subject line */}
                        {convo.subject && (
                          <div
                            style={{
                              fontSize: 12,
                              color: BLACK,
                              fontWeight: isUnread ? 600 : 400,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: 2,
                            }}
                          >
                            {convo.subject}
                          </div>
                        )}

                        {/* Last message preview */}
                        {convo.last_message_preview && (
                          <div
                            style={{
                              fontSize: 11,
                              color: MUTED,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {convo.last_message_preview}
                          </div>
                        )}

                        {/* Tags row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          {/* Participant type tag */}
                          <span
                            className="jl-tag"
                            style={{
                              fontSize: 9,
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              padding: '1px 6px',
                              background: convo.participant_type === 'candidate' ? '#f0f0ea' : '#eef0f5',
                              color: convo.participant_type === 'candidate' ? '#555' : '#446',
                            }}
                          >
                            {convo.participant_type}
                          </span>

                          {/* Assignment reference */}
                          {convo.search_assignment && (
                            <span style={{ fontSize: 9, color: MUTED }}>
                              {convo.search_assignment.reference_number || convo.search_assignment.title}
                            </span>
                          )}

                          {/* Unread badge */}
                          {isUnread && (
                            <span
                              className="jl-badge-unread"
                              style={{
                                marginLeft: 'auto',
                                background: GOLD,
                                color: '#fff',
                                fontSize: 9,
                                fontWeight: 700,
                                borderRadius: '50%',
                                width: 18,
                                height: 18,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {convo.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* =============================================================== */}
        {/* RIGHT PANEL — Conversation Detail                               */}
        {/* =============================================================== */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', minWidth: 0 }}>
          {!activeId ? (
            /* --------------------------------------------------------------- */
            /* Empty state                                                     */
            /* --------------------------------------------------------------- */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: MUTED }}>
              <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>&#9993;</div>
              <p style={{ fontSize: 14, margin: 0 }}>Select a conversation or start a new one</p>
            </div>
          ) : convoLoading || !activeConvo ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: 13 }}>
              Loading conversation...
            </div>
          ) : (
            <>
              {/* ------------------------------------------------------------- */}
              {/* Conversation header bar                                        */}
              {/* ------------------------------------------------------------- */}
              <div
                className="jl-convo-header"
                style={{
                  padding: '14px 20px',
                  borderBottom: `1px solid ${BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  {/* Name + type badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: BLACK }}>
                      {participantName(activeConvo)}
                    </h3>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        background: activeConvo.participant_type === 'candidate' ? '#f0f0ea' : '#eef0f5',
                        color: activeConvo.participant_type === 'candidate' ? '#555' : '#446',
                      }}
                    >
                      {activeConvo.participant_type}
                    </span>
                    {/* Status badge */}
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        background: activeConvo.status === 'active' ? '#e8f5e9' : '#f5f4f0',
                        color: activeConvo.status === 'active' ? '#2a7a3c' : MUTED,
                      }}
                    >
                      {activeConvo.status}
                    </span>
                  </div>

                  {/* Subject */}
                  {activeConvo.subject && (
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#555' }}>
                      {activeConvo.subject}
                    </p>
                  )}

                  {/* Assignment link */}
                  {activeConvo.search_assignment && (
                    <Link
                      href={`/admin/assignments/new?id=${activeConvo.search_assignment_id}`}
                      style={{ fontSize: 11, color: GOLD, textDecoration: 'none', fontWeight: 500 }}
                    >
                      {activeConvo.search_assignment.maison
                        ? `${activeConvo.search_assignment.maison} — `
                        : ''}
                      {activeConvo.search_assignment.title}
                      {activeConvo.search_assignment.reference_number
                        ? ` (${activeConvo.search_assignment.reference_number})`
                        : ''}
                    </Link>
                  )}
                </div>

                {/* Right-side controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {/* View Profile link for candidates */}
                  {activeConvo.participant_type === 'candidate' && activeConvo.member_id && (
                    <Link
                      href={`/admin/members/${activeConvo.member_id}`}
                      className="jl-link"
                      style={{ fontSize: 11, color: GOLD, textDecoration: 'none', fontWeight: 500 }}
                    >
                      View Profile
                    </Link>
                  )}

                  {/* "..." menu for status changes */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowStatusMenu(!showStatusMenu)}
                      style={{
                        background: 'none',
                        border: `1px solid ${BORDER}`,
                        borderRadius: 4,
                        padding: '4px 10px',
                        fontSize: 16,
                        cursor: 'pointer',
                        color: MUTED,
                        lineHeight: 1,
                      }}
                    >
                      &#8943;
                    </button>
                    {showStatusMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: 0,
                          marginTop: 4,
                          background: '#fff',
                          border: `1px solid ${BORDER}`,
                          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                          zIndex: 50,
                          minWidth: 140,
                        }}
                      >
                        {(['active', 'archived', 'closed'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              background: activeConvo.status === s ? CREAM : 'transparent',
                              border: 'none',
                              padding: '8px 14px',
                              fontSize: 12,
                              color: BLACK,
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                            }}
                          >
                            {s === 'archived' ? 'Archive' : s === 'closed' ? 'Close' : 'Reopen'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* Message thread (scrollable)                                    */}
              {/* ------------------------------------------------------------- */}
              <div
                className="jl-message-thread"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px 24px',
                  background: CREAM,
                }}
              >
                {(activeConvo.messages || []).map((msg: Message) => {
                  const isRecruiter = msg.sender_type === 'recruiter'
                  const isSystem = msg.sender_type === 'system'

                  // System messages: centered, muted, italic
                  if (isSystem) {
                    return (
                      <div
                        key={msg.id}
                        className="jl-msg-system"
                        style={{
                          textAlign: 'center',
                          margin: '12px 0',
                          fontSize: 11,
                          color: MUTED,
                          fontStyle: 'italic',
                        }}
                      >
                        {msg.body}
                        <div style={{ fontSize: 10, marginTop: 2, color: '#bbb' }}>
                          {formatTimestamp(msg.sent_at || msg.created_at)}
                        </div>
                      </div>
                    )
                  }

                  // Normal messages: recruiter right-aligned, others left-aligned
                  return (
                    <div
                      key={msg.id}
                      className={isRecruiter ? 'jl-msg-recruiter' : 'jl-msg-external'}
                      style={{
                        display: 'flex',
                        justifyContent: isRecruiter ? 'flex-end' : 'flex-start',
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '65%',
                          minWidth: 120,
                        }}
                      >
                        {/* Sender name */}
                        <div
                          style={{
                            fontSize: 10,
                            color: MUTED,
                            marginBottom: 3,
                            textAlign: isRecruiter ? 'right' : 'left',
                            fontWeight: 500,
                          }}
                        >
                          {msg.sender_name}
                        </div>

                        {/* Message bubble */}
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: isRecruiter ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                            background: isRecruiter ? BLACK : '#fff',
                            color: isRecruiter ? '#fff' : BLACK,
                            border: isRecruiter ? 'none' : `1px solid ${BORDER}`,
                            fontSize: 13,
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.body}
                        </div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {msg.attachments.map((att: MessageAttachment) => (
                              <a
                                key={att.id}
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="jl-attachment"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '6px 10px',
                                  border: `1px solid ${BORDER}`,
                                  background: '#fff',
                                  textDecoration: 'none',
                                  fontSize: 11,
                                  color: BLACK,
                                }}
                              >
                                <span style={{ fontSize: 14 }}>&#128206;</span>
                                <span style={{ fontWeight: 500 }}>{att.file_name}</span>
                                {att.file_size && (
                                  <span style={{ color: MUTED, fontSize: 10 }}>
                                    {fileSize(att.file_size)}
                                  </span>
                                )}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div
                          style={{
                            fontSize: 10,
                            color: '#bbb',
                            marginTop: 4,
                            textAlign: isRecruiter ? 'right' : 'left',
                          }}
                        >
                          {formatTimestamp(msg.sent_at || msg.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                {/* Scroll anchor */}
                <div ref={threadEndRef} />
              </div>

              {/* ------------------------------------------------------------- */}
              {/* Compose bar (sticky bottom)                                    */}
              {/* ------------------------------------------------------------- */}
              <div
                className="jl-compose-bar"
                style={{
                  borderTop: `1px solid ${BORDER}`,
                  padding: '12px 20px',
                  background: '#fff',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                {/* Template selector overlay */}
                {showTemplates && (
                  <TemplateSelector
                    templates={templates}
                    participantType={activeConvo.participant_type}
                    onSelect={handleSelectTemplate}
                    onClose={() => setShowTemplates(false)}
                  />
                )}

                {/* Textarea */}
                <textarea
                  ref={composeRef}
                  className="jl-input"
                  placeholder="Type your message... (Ctrl+Enter to send)"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  onKeyDown={handleComposeKeyDown}
                  style={{
                    width: '100%',
                    minHeight: 60,
                    maxHeight: 200,
                    padding: '10px 12px',
                    fontSize: 13,
                    border: `1px solid ${BORDER}`,
                    background: CREAM,
                    color: BLACK,
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    lineHeight: 1.5,
                    fontFamily: 'inherit',
                  }}
                />

                {/* Action buttons row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => {
                      fetchTemplates()
                      setShowTemplates(!showTemplates)
                    }}
                    style={{
                      background: 'none',
                      border: `1px solid ${BORDER}`,
                      padding: '6px 12px',
                      fontSize: 11,
                      color: '#555',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    Use Template
                  </button>

                  <label
                    className="jl-btn-attach"
                    style={{
                      background: 'none',
                      border: `1px solid ${BORDER}`,
                      padding: '6px 12px',
                      fontSize: 11,
                      color: '#555',
                      cursor: 'pointer',
                      fontWeight: 500,
                      display: 'inline-block',
                    }}
                  >
                    Attach
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file || !activeId) return
                        const formData = new FormData()
                        formData.append('file', file)
                        try {
                          await fetch(`/api/messages/conversations/${activeId}/attachments`, {
                            method: 'POST',
                            body: formData,
                          })
                        } catch {
                          /* silent */
                        }
                      }}
                    />
                  </label>

                  <div style={{ flex: 1 }} />

                  <button
                    className="jl-btn-gold"
                    onClick={handleSend}
                    disabled={!composeBody.trim() || sending}
                    style={{
                      background: GOLD,
                      color: '#fff',
                      border: 'none',
                      padding: '8px 20px',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: composeBody.trim() && !sending ? 'pointer' : 'not-allowed',
                      opacity: composeBody.trim() && !sending ? 1 : 0.5,
                    }}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* NEW MESSAGE MODAL                                                 */}
      {/* ================================================================= */}
      {showNewModal && (
        <NewMessageModal
          recruiterName={recruiterName || ''}
          onClose={() => setShowNewModal(false)}
          onCreated={(convoId: string) => {
            setShowNewModal(false)
            setActiveId(convoId)
            fetchConversations()
          }}
        />
      )}
    </div>
  )
}

// ===========================================================================
// TEMPLATE SELECTOR COMPONENT
// ===========================================================================
function TemplateSelector({
  templates,
  participantType,
  onSelect,
  onClose,
}: {
  templates: MessageTemplate[]
  participantType: 'candidate' | 'client'
  onSelect: (t: MessageTemplate) => void
  onClose: () => void
}) {
  // Group templates by category, filtered by participant type
  const filtered = templates.filter((t) => t.participant_type === participantType)
  const categories = TEMPLATE_CATEGORIES[participantType]

  // Build a map: category key -> templates
  const grouped: Record<string, MessageTemplate[]> = {}
  for (const cat of categories) {
    grouped[cat.key] = filtered.filter((t) => t.category === cat.key)
  }

  return (
    <div
      className="jl-template-overlay"
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 20,
        right: 20,
        marginBottom: 4,
        background: '#fff',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
        maxHeight: 360,
        overflowY: 'auto',
        zIndex: 60,
      }}
    >
      {/* Header */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: BLACK, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Templates
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 16 }}>
          &times;
        </button>
      </div>

      {/* Template list grouped by category */}
      {categories.map((cat) => {
        const items = grouped[cat.key] || []
        if (items.length === 0) return null
        return (
          <div key={cat.key}>
            <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {cat.label}
            </div>
            {items.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelect(t)}
                className="jl-template-item"
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '8px 14px',
                  fontSize: 12,
                  color: BLACK,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontWeight: 500 }}>{t.name}</span>
                {t.subject && (
                  <span style={{ color: MUTED, marginLeft: 8, fontSize: 11 }}>
                    — {t.subject}
                  </span>
                )}
              </button>
            ))}
          </div>
        )
      })}

      {/* Fallback if no templates exist */}
      {filtered.length === 0 && (
        <p style={{ padding: 20, textAlign: 'center', fontSize: 12, color: MUTED }}>
          No templates available for {participantType}s.
        </p>
      )}
    </div>
  )
}

// ===========================================================================
// NEW MESSAGE MODAL COMPONENT
// ===========================================================================
function NewMessageModal({
  recruiterName,
  onClose,
  onCreated,
}: {
  recruiterName: string
  onClose: () => void
  onCreated: (conversationId: string) => void
}) {
  const [participantType, setParticipantType] = useState<'candidate' | 'client'>('candidate')

  // Candidate search
  const [memberSearch, setMemberSearch] = useState('')
  const [memberResults, setMemberResults] = useState<{ id: string; full_name: string; email: string }[]>([])
  const [selectedMember, setSelectedMember] = useState<{ id: string; full_name: string; email: string } | null>(null)
  const [memberSearching, setMemberSearching] = useState(false)

  // Client fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientCompany, setClientCompany] = useState('')

  // Shared fields
  const [assignmentId, setAssignmentId] = useState('')
  const [assignments, setAssignments] = useState<{ id: string; title: string; reference_number: string | null }[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Template selector state
  const [showTemplates, setShowTemplates] = useState(false)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [templatesLoaded, setTemplatesLoaded] = useState(false)

  // Fetch assignments on mount
  useEffect(() => {
    fetch('/api/assignments?status=active')
      .then((r) => r.json())
      .then((data) => setAssignments(data.assignments || []))
      .catch(() => {})
  }, [])

  // Debounced member search
  useEffect(() => {
    if (participantType !== 'candidate' || memberSearch.length < 2) {
      setMemberResults([])
      return
    }
    const timeout = setTimeout(async () => {
      setMemberSearching(true)
      try {
        const res = await fetch(`/api/members/search?q=${encodeURIComponent(memberSearch)}`)
        const data = await res.json()
        setMemberResults(data.members || [])
      } catch {
        setMemberResults([])
      } finally {
        setMemberSearching(false)
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [memberSearch, participantType])

  // Fetch templates (lazy, once)
  const fetchTemplates = async () => {
    if (templatesLoaded) return
    try {
      const res = await fetch('/api/messages/templates')
      const data = await res.json()
      setTemplates(data.templates || [])
      setTemplatesLoaded(true)
    } catch {
      /* silent */
    }
  }

  /** Handle template selection for the new message modal */
  const handleSelectTemplate = async (template: MessageTemplate) => {
    try {
      const mergeData: Record<string, string> = {
        candidate_name: selectedMember?.full_name || '',
        candidate_first_name: (selectedMember?.full_name || '').split(' ')[0],
        client_name: clientName,
        recruiter_name: recruiterName,
      }
      const selAssignment = assignments.find((a) => a.id === assignmentId)
      if (selAssignment) {
        mergeData.opportunity_title = selAssignment.title
      }

      const res = await fetch('/api/messages/templates/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template_id: template.id, merge_data: mergeData }),
      })
      const data = await res.json()
      setBody(data.body || template.body)
      if (template.subject && !subject) setSubject(template.subject)
    } catch {
      setBody(template.body)
    }
    setShowTemplates(false)
  }

  /** Submit the new conversation */
  const handleSubmit = async () => {
    if (submitting) return
    // Validation
    if (participantType === 'candidate' && !selectedMember) return
    if (participantType === 'client' && (!clientEmail || !clientName)) return
    if (!body.trim()) return

    setSubmitting(true)
    try {
      const payload: Record<string, unknown> = {
        participant_type: participantType,
        subject: subject || null,
        body,
        search_assignment_id: assignmentId || null,
      }
      if (participantType === 'candidate') {
        payload.member_id = selectedMember!.id
      } else {
        payload.client_name = clientName
        payload.client_email = clientEmail
        payload.client_company = clientCompany || null
      }

      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.conversation?.id) {
        onCreated(data.conversation.id)
      }
    } catch {
      /* could show error */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="jl-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="jl-modal"
        style={{
          background: '#fff',
          width: 520,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          position: 'relative',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: BLACK }}>New Message</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 20 }}>
            &times;
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '20px 24px' }}>

          {/* Participant type radio */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Recipient Type
            </label>
            <div style={{ display: 'flex', gap: 16 }}>
              {(['candidate', 'client'] as const).map((type) => (
                <label
                  key={type}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: BLACK, cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="participant_type"
                    checked={participantType === type}
                    onChange={() => {
                      setParticipantType(type)
                      setSelectedMember(null)
                      setMemberSearch('')
                    }}
                    style={{ accentColor: GOLD }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Candidate: member search */}
          {participantType === 'candidate' && (
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Candidate
              </label>
              {selectedMember ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', border: `1px solid ${BORDER}`, background: CREAM }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: BLACK }}>{selectedMember.full_name}</span>
                  <span style={{ fontSize: 11, color: MUTED }}>{selectedMember.email}</span>
                  <button
                    onClick={() => { setSelectedMember(null); setMemberSearch('') }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 14 }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <>
                  <input
                    className="jl-input"
                    type="text"
                    placeholder="Search by name or email..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      fontSize: 13,
                      border: `1px solid ${BORDER}`,
                      background: '#fff',
                      color: BLACK,
                      boxSizing: 'border-box',
                    }}
                  />
                  {/* Results dropdown */}
                  {(memberResults.length > 0 || memberSearching) && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: '100%',
                        background: '#fff',
                        border: `1px solid ${BORDER}`,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        zIndex: 10,
                        maxHeight: 200,
                        overflowY: 'auto',
                      }}
                    >
                      {memberSearching && (
                        <p style={{ padding: '8px 12px', fontSize: 12, color: MUTED, margin: 0 }}>Searching...</p>
                      )}
                      {memberResults.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMember(m)
                            setMemberSearch('')
                            setMemberResults([])
                          }}
                          style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            background: 'none',
                            border: 'none',
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: BLACK,
                          }}
                        >
                          <span style={{ fontWeight: 500 }}>{m.full_name}</span>
                          <span style={{ color: MUTED, marginLeft: 8 }}>{m.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Client: manual entry fields */}
          {participantType === 'client' && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Client Name *
                </label>
                <input
                  className="jl-input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1px solid ${BORDER}`, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Email *
                </label>
                <input
                  className="jl-input"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1px solid ${BORDER}`, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                  Company
                </label>
                <input
                  className="jl-input"
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1px solid ${BORDER}`, boxSizing: 'border-box' }}
                />
              </div>
            </>
          )}

          {/* Assignment selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Assignment (optional)
            </label>
            <select
              className="jl-input"
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1px solid ${BORDER}`, background: '#fff', boxSizing: 'border-box' }}
            >
              <option value="">— None —</option>
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.reference_number ? `[${a.reference_number}] ` : ''}{a.title}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              Subject
            </label>
            <input
              className="jl-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject..."
              style={{ width: '100%', padding: '8px 12px', fontSize: 13, border: `1px solid ${BORDER}`, boxSizing: 'border-box' }}
            />
          </div>

          {/* Body */}
          <div style={{ marginBottom: 16, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Message *
              </label>
              <button
                onClick={() => {
                  fetchTemplates()
                  setShowTemplates(!showTemplates)
                }}
                style={{ background: 'none', border: 'none', fontSize: 11, color: GOLD, cursor: 'pointer', fontWeight: 500 }}
              >
                Use Template
              </button>
            </div>

            {/* Template overlay for modal */}
            {showTemplates && (
              <div
                style={{
                  position: 'absolute',
                  top: 24,
                  right: 0,
                  width: 300,
                  background: '#fff',
                  border: `1px solid ${BORDER}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  maxHeight: 260,
                  overflowY: 'auto',
                  zIndex: 20,
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: BLACK, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Templates</span>
                  <button onClick={() => setShowTemplates(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 14 }}>&times;</button>
                </div>
                {templates
                  .filter((t) => t.participant_type === participantType)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTemplate(t)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        padding: '7px 12px',
                        fontSize: 12,
                        color: BLACK,
                        cursor: 'pointer',
                      }}
                    >
                      {t.name}
                    </button>
                  ))}
              </div>
            )}

            <textarea
              className="jl-input"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                background: CREAM,
                color: BLACK,
                resize: 'vertical',
                boxSizing: 'border-box',
                lineHeight: 1.5,
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Modal footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: `1px solid ${BORDER}`,
              padding: '8px 20px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: MUTED,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            className="jl-btn-gold"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: GOLD,
              color: '#fff',
              border: 'none',
              padding: '8px 24px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {submitting ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
