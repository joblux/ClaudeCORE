'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { INTERNSHIP_STATUSES } from '@/types/internship'
import type { InternshipListing } from '@/types/internship'

const GOLD = '#444'
const BLACK = '#1a1a1a'
const CREAM = '#fafaf5'
const BORDER = '#e8e8e8'

const STATUS_COLORS: Record<string, string> = {
  pending_review: '#444',
  approved: '#2a7a3c',
  rejected: '#cc4444',
  expired: '#888',
  closed: '#555',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function remotePolicyLabel(val: string): string {
  const map: Record<string, string> = { on_site: 'On-site', hybrid: 'Hybrid', remote: 'Remote' }
  return map[val] || val
}

function textToLines(text: string | null): string[] {
  if (!text) return []
  return text.split('\n').map(l => l.trim()).filter(Boolean)
}

export default function AdminInternshipDetailPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [internship, setInternship] = useState<InternshipListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Action state
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => {
    if (!isAdmin || !id) return
    fetch(`/api/internships/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load')
        return r.json()
      })
      .then(data => {
        setInternship(data)
        setAdminNotes(data.admin_notes || '')
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [isAdmin, id])

  const handleApprove = async () => {
    if (!confirm('Approve this internship listing? It will become publicly visible.')) return
    setApproving(true)
    try {
      const res = await fetch(`/api/internships/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (!res.ok) throw new Error('Failed to approve')
      const updated = await res.json()
      setInternship(updated)
    } catch {
      alert('Failed to approve. Please try again.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/internships/${id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejection_reason: rejectionReason }),
      })
      if (!res.ok) throw new Error('Failed to reject')
      const updated = await res.json()
      setInternship(updated)
      setShowRejectModal(false)
      setRejectionReason('')
    } catch {
      alert('Failed to reject. Please try again.')
    } finally {
      setRejecting(false)
    }
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const res = await fetch(`/api/internships/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_notes: adminNotes }),
      })
      if (!res.ok) throw new Error('Failed to save notes')
    } catch {
      alert('Failed to save notes.')
    } finally {
      setSavingNotes(false)
    }
  }

  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14, background: CREAM, minHeight: '100vh' }}>
        Loading...
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#999', fontSize: 14, background: CREAM, minHeight: '100vh' }}>
        Loading internship...
      </div>
    )
  }

  if (error || !internship) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', background: CREAM, minHeight: '100vh' }}>
        <p style={{ color: '#cc4444', fontSize: 14, marginBottom: 16 }}>{error || 'Internship not found.'}</p>
        <Link href="/admin/internships" style={{ color: GOLD, fontSize: 13 }}>&larr; Back to Internships</Link>
      </div>
    )
  }

  const statusColor = STATUS_COLORS[internship.status] || '#888'
  const statusLabel = INTERNSHIP_STATUSES.find(s => s.value === internship.status)?.label || internship.status
  const isPending = internship.status === 'pending_review'
  const responsibilityLines = textToLines(internship.responsibilities)
  const requirementLines = textToLines(internship.requirements)
  const niceToHaveLines = textToLines(internship.nice_to_haves)

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: CREAM, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${BORDER}`, background: '#fff', padding: '24px 32px 20px' }}>
        <Link
          href="/admin/internships"
          style={{ fontSize: 13, color: GOLD, textDecoration: 'none' }}
        >
          &larr; Back to Internships
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <h1 className="jl-serif" style={{ fontSize: 28, fontWeight: 700, color: BLACK, margin: 0, flex: 1 }}>
            {internship.title}
          </h1>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 600,
              background: `${statusColor}18`,
              color: statusColor,
            }}
          >
            {statusLabel}
          </span>
        </div>
        <p style={{ fontSize: 14, color: '#666', margin: '4px 0 0' }}>
          {internship.company_name} &mdash; {[internship.city, internship.country].filter(Boolean).join(', ')}
        </p>
      </header>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
          {/* Left column -- all fields */}
          <div>
            {/* Description */}
            {internship.description && (
              <div style={{ marginBottom: 24 }}>
                <div className="jl-section-label"><span>Description</span></div>
                <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {internship.description}
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {responsibilityLines.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="jl-section-label"><span>Responsibilities</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {responsibilityLines.map((line, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: '#555' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>&bull;</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {requirementLines.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="jl-section-label"><span>Requirements</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {requirementLines.map((line, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: '#555' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>&bull;</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nice to Haves */}
            {niceToHaveLines.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div className="jl-section-label"><span>Nice to Have</span></div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {niceToHaveLines.map((line, i) => (
                    <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 14, color: '#555' }}>
                      <span style={{ color: GOLD, flexShrink: 0 }}>&bull;</span>
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details grid */}
            <div style={{ marginBottom: 24 }}>
              <div className="jl-section-label"><span>Internship Details</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', fontSize: 14 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Duration</span>
                  <p style={{ color: BLACK, margin: '2px 0 0' }}>{internship.duration}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Remote Policy</span>
                  <p style={{ color: BLACK, margin: '2px 0 0' }}>{remotePolicyLabel(internship.remote_policy)}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Start Date</span>
                  <p style={{ color: BLACK, margin: '2px 0 0' }}>{internship.start_date || '\u2014'}</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Compensation</span>
                  <p style={{ color: BLACK, margin: '2px 0 0' }}>
                    {internship.is_paid ? `Paid${internship.compensation_details ? ` \u2014 ${internship.compensation_details}` : ''}` : 'Unpaid'}
                  </p>
                </div>
                {internship.department && (
                  <div>
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Department</span>
                    <p style={{ color: BLACK, margin: '2px 0 0' }}>{internship.department}</p>
                  </div>
                )}
                {internship.luxury_sector && (
                  <div>
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Luxury Sector</span>
                    <p style={{ color: BLACK, margin: '2px 0 0' }}>{internship.luxury_sector}</p>
                  </div>
                )}
                {internship.company_website && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Website</span>
                    <p style={{ margin: '2px 0 0' }}>
                      <a href={internship.company_website} target="_blank" rel="noopener noreferrer" style={{ color: GOLD, fontSize: 13 }}>
                        {internship.company_website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Languages & Product Categories */}
            {(internship.languages_required?.length > 0 || internship.product_categories?.length > 0) && (
              <div style={{ marginBottom: 24 }}>
                <div className="jl-section-label"><span>Luxury Context</span></div>
                {internship.languages_required?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Languages</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {internship.languages_required.map(l => (
                        <span key={l} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: `1px solid ${BORDER}`, color: '#666' }}>{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {internship.product_categories?.length > 0 && (
                  <div>
                    <span style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 6 }}>Product Categories</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {internship.product_categories.map(pc => (
                        <span key={pc} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, border: `1px solid ${BORDER}`, color: '#666' }}>{pc}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column -- submitter info + actions */}
          <div>
            {/* Submitter info card */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: GOLD, margin: '0 0 12px' }}>
                Submitter
              </h3>
              <div style={{ fontSize: 14, color: BLACK, fontWeight: 600 }}>
                {internship.submitter?.full_name || '\u2014'}
              </div>
              {internship.submitter?.email && (
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{internship.submitter.email}</div>
              )}
              {internship.submitter?.maison && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{internship.submitter.maison}</div>
              )}
              <div style={{ fontSize: 12, color: '#999', marginTop: 8, borderTop: `1px solid ${BORDER}`, paddingTop: 8 }}>
                Submitted {formatDate(internship.created_at)}
              </div>
            </div>

            {/* Review actions */}
            {isPending ? (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: GOLD, margin: '0 0 16px' }}>
                  Review Actions
                </h3>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="jl-btn jl-btn-gold"
                  style={{
                    width: '100%',
                    marginBottom: 8,
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 6,
                    background: GOLD,
                    color: '#fff',
                    cursor: approving ? 'not-allowed' : 'pointer',
                    opacity: approving ? 0.6 : 1,
                  }}
                >
                  {approving ? 'Approving...' : 'Approve Listing'}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: `1px solid #cc4444`,
                    borderRadius: 6,
                    background: 'transparent',
                    color: '#cc4444',
                    cursor: 'pointer',
                  }}
                >
                  Reject Listing
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: GOLD, margin: '0 0 12px' }}>
                  Review Decision
                </h3>
                <div style={{ fontSize: 13 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${statusColor}18`,
                      color: statusColor,
                      marginBottom: 8,
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                {internship.reviewed_at && (
                  <p style={{ fontSize: 12, color: '#888', margin: '4px 0' }}>
                    Reviewed on {formatDate(internship.reviewed_at)}
                  </p>
                )}
                {internship.reviewed_by && (
                  <p style={{ fontSize: 12, color: '#888', margin: '4px 0' }}>
                    Reviewed by: {internship.reviewed_by}
                  </p>
                )}
                {internship.rejection_reason && (
                  <div style={{ marginTop: 8, padding: 10, background: '#fef2f2', borderRadius: 6, fontSize: 13, color: '#cc4444' }}>
                    <strong>Reason:</strong> {internship.rejection_reason}
                  </div>
                )}
              </div>
            )}

            {/* Admin notes */}
            <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: GOLD, margin: '0 0 12px' }}>
                Admin Notes
              </h3>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Internal notes about this listing..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '8px 12px',
                  fontSize: 13,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: BLACK,
                  resize: 'vertical',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                style={{
                  marginTop: 8,
                  padding: '6px 16px',
                  fontSize: 12,
                  fontWeight: 600,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: '#666',
                  cursor: savingNotes ? 'not-allowed' : 'pointer',
                }}
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 480,
              padding: 32,
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h2 className="jl-serif" style={{ fontSize: 22, fontWeight: 700, color: BLACK, margin: '0 0 4px' }}>
              Reject Listing
            </h2>
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
              Provide a reason for rejecting this internship listing.
            </p>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Rejection Reason
            </label>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="Explain why this listing is being rejected..."
              style={{
                width: '100%',
                minHeight: 120,
                padding: '8px 12px',
                fontSize: 13,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                background: '#fff',
                color: BLACK,
                resize: 'vertical',
                marginBottom: 20,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            />

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowRejectModal(false); setRejectionReason('') }}
                style={{
                  padding: '9px 20px',
                  fontSize: 13,
                  fontWeight: 600,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  background: '#fff',
                  color: '#666',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || rejecting}
                style={{
                  padding: '9px 24px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: rejectionReason.trim() ? '#cc4444' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: rejectionReason.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {rejecting ? 'Rejecting...' : 'Reject Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
