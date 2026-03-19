'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

type Tab = 'manual' | 'gmail' | 'linkedin' | 'whatsapp'

interface Contact {
  name: string
  email: string
  title?: string
  company?: string
  selected?: boolean
}

export default function InvitePage() {
  const { data: session } = useSession()
  const firstName = (session?.user as any)?.firstName || ''

  const [activeTab, setActiveTab] = useState<Tab>('manual')
  const [invitations, setInvitations] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, clicked: 0, registered: 0 })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Manual entry state
  const [manualEmails, setManualEmails] = useState('')
  const [manualContacts, setManualContacts] = useState<Contact[]>([])

  // Gmail import state
  const [gmailContacts, setGmailContacts] = useState<Contact[]>([])
  const [gmailLoading, setGmailLoading] = useState(false)
  const [gmailLoaded, setGmailLoaded] = useState(false)

  // Invite link
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Fetch existing invitations
  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch('/api/invitations')
      const data = await res.json()
      setInvitations(data.invitations || [])
      setStats(data.stats || { total: 0, clicked: 0, registered: 0 })
    } catch (err) {}
  }, [])

  useEffect(() => {
    fetchInvitations()
    // Generate invite link
    const code = (session?.user as any)?.memberId?.slice(0, 8) || 'joblux'
    setInviteLink(`https://www.luxuryrecruiter.com/join?ref=${code}`)
  }, [fetchInvitations, session])

  // ─── Manual Email Entry ───
  const parseEmails = () => {
    setError('')
    const lines = manualEmails.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean)
    const contacts: Contact[] = []

    for (const line of lines) {
      // Try to parse "Name <email>" format
      const match = line.match(/^(.+?)\s*<(.+?)>$/)
      if (match) {
        contacts.push({ name: match[1].trim(), email: match[2].trim(), selected: true })
      } else if (line.includes('@')) {
        contacts.push({ name: '', email: line, selected: true })
      }
    }

    if (contacts.length === 0) {
      setError('No valid email addresses found. Enter one email per line, or use format: Name <email>')
      return
    }

    setManualContacts(contacts)
  }

  // ─── Gmail Import ───
  const importGmailContacts = async () => {
    setGmailLoading(true)
    setError('')
    try {
      // Use Google People API via OAuth
      // First check if we have a Google token
      const res = await fetch('/api/invitations/gmail-contacts')
      const data = await res.json()

      if (data.authUrl) {
        // Need to authorize — open popup
        window.open(data.authUrl, 'gmail-auth', 'width=500,height=600')
        setError('Please authorize Gmail access in the popup window, then try again.')
        setGmailLoading(false)
        return
      }

      if (data.contacts) {
        setGmailContacts(
          data.contacts.map((c: any) => ({
            name: c.name || '',
            email: c.email,
            title: c.title || '',
            company: c.company || '',
            selected: true,
          }))
        )
        setGmailLoaded(true)
      }
    } catch (err) {
      setError('Failed to import Gmail contacts. Please try manual entry instead.')
    } finally {
      setGmailLoading(false)
    }
  }

  // ─── Send Invitations ───
  const sendInvitations = async (contacts: Contact[], source: string) => {
    setError('')
    setSuccess('')
    setSending(true)

    const selectedContacts = contacts.filter((c) => c.selected)
    if (selectedContacts.length === 0) {
      setError('No contacts selected.')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: selectedContacts.map((c) => ({
            name: c.name,
            email: c.email,
            title: c.title,
            company: c.company,
          })),
          source,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to send')

      const { summary } = data
      let msg = `${summary.sent} invitation${summary.sent !== 1 ? 's' : ''} sent!`
      if (summary.already_invited > 0) msg += ` ${summary.already_invited} already invited.`
      if (summary.already_member > 0) msg += ` ${summary.already_member} already a member.`

      setSuccess(msg)
      setManualEmails('')
      setManualContacts([])
      setGmailContacts([])
      fetchInvitations()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  // ─── Copy Link ───
  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Share Messages ───
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteLink)}`
  const whatsAppMessage = encodeURIComponent(
    `I'd like to invite you to JOBLUX — the intelligence platform for luxury professionals. Free access to salary data, brand insights, and executive positions. Join here: ${inviteLink}`
  )
  const whatsAppUrl = `https://wa.me/?text=${whatsAppMessage}`

  const tabs = [
    { id: 'manual' as Tab, label: 'Manual Entry' },
    { id: 'gmail' as Tab, label: 'Import Gmail' },
    { id: 'linkedin' as Tab, label: 'LinkedIn' },
    { id: 'whatsapp' as Tab, label: 'WhatsApp' },
  ]

  return (
    <main className="min-h-screen bg-[#fafaf5]">
      {/* Header */}
      <section className="border-b border-[#e8e2d8] bg-white">
        <div className="jl-container py-12 md:py-16">
          <p className="jl-overline-gold mb-3">Grow the Community</p>
          <h1 className="jl-serif text-3xl md:text-4xl text-[#1a1a1a] mb-3">
            Invite Colleagues
          </h1>
          <p className="text-[#666] max-w-xl">
            JOBLUX is built by invitation. Share the platform with luxury professionals in your network — the stronger the community, the richer the intelligence.
          </p>
        </div>
      </section>

      <div className="jl-container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Left: Stats ─── */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            {/* Your Invite Link */}
            <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                Your Invite Link
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="jl-input flex-1 text-xs"
                />
                <button
                  onClick={copyLink}
                  className="jl-btn jl-btn-primary text-xs px-3"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-[#999] mt-2">
                Anyone who joins using your link is linked to your profile.
              </p>
            </div>

            {/* Invite Stats */}
            <div className="bg-white border border-[#e8e2d8] rounded-sm p-6 mb-6">
              <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                Your Invitations
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#666]">Sent</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#666]">Clicked</span>
                  <span className="text-sm font-medium text-[#1a1a1a]">{stats.clicked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#666]">Registered</span>
                  <span className="text-sm font-medium text-[#a58e28]">{stats.registered}</span>
                </div>
              </div>
            </div>

            {/* Recent Invitations */}
            {invitations.length > 0 && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h2 className="text-xs font-medium tracking-widest uppercase text-[#a58e28] mb-4">
                  Recent Invitations
                </h2>
                <div className="space-y-2">
                  {invitations.slice(0, 10).map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm text-[#1a1a1a] truncate">
                          {inv.contact_name || inv.contact_email}
                        </p>
                        {inv.contact_name && (
                          <p className="text-xs text-[#999] truncate">{inv.contact_email}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-sm flex-shrink-0 ${
                          inv.status === 'registered' || inv.status === 'approved'
                            ? 'bg-green-50 text-green-700'
                            : inv.status === 'clicked'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-[#fafaf5] text-[#999]'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Right: Invite Methods ─── */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Success / Error */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
                {error}
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-[#e8e2d8] mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id)
                    setError('')
                    setSuccess('')
                  }}
                  className={`px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#a58e28] text-[#1a1a1a] font-medium'
                      : 'border-transparent text-[#999] hover:text-[#666]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ─── Manual Entry ─── */}
            {activeTab === 'manual' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">
                  Enter Email Addresses
                </h3>
                <p className="text-xs text-[#999] mb-4">
                  Paste email addresses — one per line, or comma-separated. You can also use the format: Name &lt;email@example.com&gt;
                </p>

                {manualContacts.length === 0 ? (
                  <>
                    <textarea
                      className="jl-input w-full min-h-[200px] font-mono text-sm"
                      placeholder={`sophie.laurent@chanel.com\nJean Dupont <jean.dupont@lvmh.com>\nalex@kering.com, maria@richemont.com`}
                      value={manualEmails}
                      onChange={(e) => setManualEmails(e.target.value)}
                    />
                    <button
                      onClick={parseEmails}
                      disabled={!manualEmails.trim()}
                      className={`jl-btn jl-btn-primary mt-4 ${!manualEmails.trim() ? 'opacity-40' : ''}`}
                    >
                      Review Contacts
                    </button>
                  </>
                ) : (
                  <>
                    <div className="border border-[#e8e2d8] rounded-sm divide-y divide-[#e8e2d8] mb-4">
                      {manualContacts.map((c, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#fafaf5]"
                        >
                          <input
                            type="checkbox"
                            checked={c.selected}
                            onChange={() => {
                              const updated = [...manualContacts]
                              updated[i].selected = !updated[i].selected
                              setManualContacts(updated)
                            }}
                            className="accent-[#a58e28]"
                          />
                          <div className="min-w-0">
                            {c.name && (
                              <p className="text-sm text-[#1a1a1a]">{c.name}</p>
                            )}
                            <p className="text-xs text-[#999]">{c.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setManualContacts([])}
                        className="jl-btn jl-btn-outline"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => sendInvitations(manualContacts, 'manual')}
                        disabled={sending}
                        className="jl-btn jl-btn-primary"
                      >
                        {sending
                          ? 'Sending…'
                          : `Send ${manualContacts.filter((c) => c.selected).length} Invitation${manualContacts.filter((c) => c.selected).length !== 1 ? 's' : ''}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─── Gmail Import ─── */}
            {activeTab === 'gmail' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">
                  Import from Gmail
                </h3>
                <p className="text-xs text-[#999] mb-4">
                  Connect your Google account to import your contacts. We only read contact names and emails — nothing else.
                </p>

                {!gmailLoaded ? (
                  <button
                    onClick={importGmailContacts}
                    disabled={gmailLoading}
                    className="jl-btn jl-btn-primary flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {gmailLoading ? 'Connecting…' : 'Connect Gmail'}
                  </button>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-[#1a1a1a]">
                        {gmailContacts.length} contacts found
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setGmailContacts(gmailContacts.map((c) => ({ ...c, selected: true })))}
                          className="text-xs text-[#a58e28]"
                        >
                          Select all
                        </button>
                        <button
                          onClick={() => setGmailContacts(gmailContacts.map((c) => ({ ...c, selected: false })))}
                          className="text-xs text-[#999]"
                        >
                          Deselect all
                        </button>
                      </div>
                    </div>
                    <div className="border border-[#e8e2d8] rounded-sm divide-y divide-[#e8e2d8] max-h-[400px] overflow-y-auto mb-4">
                      {gmailContacts.map((c, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#fafaf5]"
                        >
                          <input
                            type="checkbox"
                            checked={c.selected}
                            onChange={() => {
                              const updated = [...gmailContacts]
                              updated[i].selected = !updated[i].selected
                              setGmailContacts(updated)
                            }}
                            className="accent-[#a58e28]"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-[#1a1a1a] truncate">{c.name || c.email}</p>
                            {c.name && (
                              <p className="text-xs text-[#999] truncate">{c.email}</p>
                            )}
                          </div>
                          {c.company && (
                            <span className="text-xs text-[#999] flex-shrink-0">{c.company}</span>
                          )}
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => sendInvitations(gmailContacts, 'gmail')}
                      disabled={sending}
                      className="jl-btn jl-btn-primary"
                    >
                      {sending
                        ? 'Sending…'
                        : `Send ${gmailContacts.filter((c) => c.selected).length} Invitation${gmailContacts.filter((c) => c.selected).length !== 1 ? 's' : ''}`}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ─── LinkedIn ─── */}
            {activeTab === 'linkedin' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">
                  Share on LinkedIn
                </h3>
                <p className="text-xs text-[#999] mb-6">
                  Share your personal invite link with your LinkedIn network. You can post it as an update or send it directly to connections.
                </p>

                <div className="space-y-4">
                  {/* Share as post */}
                  <a
                    href={linkedInShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jl-btn jl-btn-primary flex items-center justify-center gap-2 w-full"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    Share as LinkedIn Post
                  </a>

                  {/* Copy message for DM */}
                  <div>
                    <p className="text-xs text-[#999] mb-2">Or copy this message to send directly:</p>
                    <div className="bg-[#fafaf5] border border-[#e8e2d8] rounded-sm p-4">
                      <p className="text-sm text-[#666] leading-relaxed">
                        I&apos;d like to invite you to JOBLUX — the intelligence platform for luxury professionals.
                        Free access to salary data, brand insights, and executive positions across 150+ maisons.
                        No ads, no noise — just real intelligence from the community.
                      </p>
                      <p className="text-sm text-[#a58e28] mt-2">{inviteLink}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `I'd like to invite you to JOBLUX — the intelligence platform for luxury professionals. Free access to salary data, brand insights, and executive positions across 150+ maisons. No ads, no noise — just real intelligence from the community.\n\n${inviteLink}`
                        )
                        setSuccess('Message copied to clipboard!')
                      }}
                      className="jl-btn jl-btn-outline mt-3"
                    >
                      Copy Message
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── WhatsApp ─── */}
            {activeTab === 'whatsapp' && (
              <div className="bg-white border border-[#e8e2d8] rounded-sm p-6">
                <h3 className="text-sm font-medium text-[#1a1a1a] mb-1">
                  Share via WhatsApp
                </h3>
                <p className="text-xs text-[#999] mb-6">
                  Send your invite link to contacts or groups on WhatsApp.
                </p>

                <div className="space-y-4">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="jl-btn jl-btn-primary flex items-center justify-center gap-2 w-full"
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Open WhatsApp
                  </a>

                  {/* Preview message */}
                  <div>
                    <p className="text-xs text-[#999] mb-2">Message preview:</p>
                    <div className="bg-[#fafaf5] border border-[#e8e2d8] rounded-sm p-4">
                      <p className="text-sm text-[#666] leading-relaxed">
                        I&apos;d like to invite you to JOBLUX — the intelligence platform for luxury professionals.
                        Free access to salary data, brand insights, and executive positions.
                        Join here: <span className="text-[#a58e28]">{inviteLink}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
