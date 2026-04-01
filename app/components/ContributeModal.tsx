'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ContributeModalProps {
  brandSlug: string
  brandName: string
  isOpen: boolean
  onClose: () => void
}

export default function ContributeModal({ brandSlug, brandName, isOpen, onClose }: ContributeModalProps) {
  const { data: session } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: '',
    correction: '',
    source: ''
  })

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || ''
      }))
    }
  }, [session])

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false)
      if (!session?.user) {
        setFormData({
          name: '',
          email: '',
          issue: '',
          correction: '',
          source: ''
        })
      } else {
        setFormData(prev => ({
          ...prev,
          issue: '',
          correction: '',
          source: ''
        }))
      }
    }
  }, [isOpen, session])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_slug: brandSlug,
          user_id: (session?.user as any)?.memberId || null,
          contributor_name: formData.name,
          contributor_email: formData.email,
          issue_description: formData.issue,
          suggested_correction: formData.correction,
          source_url: formData.source || null
        })
      })

      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        alert('Error submitting contribution: ' + data.message)
      }
    } catch (error) {
      alert('Failed to submit contribution. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#fff',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px 28px',
          borderBottom: '0.5px solid #e8e8e8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>
              Contribute a Correction
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
              Help us improve {brandName}'s page
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#999',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '28px' }}>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#111'
                }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Smith"
                  disabled={!!session?.user}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: session?.user ? '#f9f9f9' : '#fff',
                    cursor: session?.user ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#111'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. john@example.com"
                  disabled={!!session?.user}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    background: session?.user ? '#f9f9f9' : '#fff',
                    cursor: session?.user ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#111'
                }}>
                  What's incorrect? *
                </label>
                <textarea
                  required
                  value={formData.issue}
                  onChange={(e) => setFormData({...formData, issue: e.target.value})}
                  placeholder="e.g. The founding year is listed as 1837 but it should be 1847"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#111'
                }}>
                  Suggested Correction *
                </label>
                <textarea
                  required
                  value={formData.correction}
                  onChange={(e) => setFormData({...formData, correction: e.target.value})}
                  placeholder="e.g. Founded in 1847, not 1837"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#111'
                }}>
                  Source / Proof (Optional)
                </label>
                <input
                  type="url"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  placeholder="https://example.com/proof"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid #e8e8e8',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <div style={{ marginTop: '6px', fontSize: '12px', color: '#999' }}>
                  Link to a reliable source that supports your correction
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? '#999' : '#111',
                  color: '#fff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: submitting ? 'not-allowed' : 'pointer'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Contribution'}
              </button>

              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#F7F3E8',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#78350F',
                lineHeight: 1.6
              }}>
                <strong>How it works:</strong> Our team reviews all contributions within 48 hours. 
                {session?.user 
                  ? " You'll receive a notification in your dashboard and via email when your contribution is reviewed."
                  : " We'll email you when your contribution is reviewed."
                }
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ECFDF5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '32px'
              }}>
                ✓
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 500, color: '#111' }}>
                Thank you for contributing!
              </h3>
              <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666', lineHeight: 1.6 }}>
                We'll review your suggestion within 48 hours and update the page if appropriate.
                {session?.user 
                  ? " Track the status in your dashboard."
                  : " We'll send you an email when it's reviewed."
                }
              </p>
              <button
                onClick={onClose}
                style={{
                  background: '#111',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
