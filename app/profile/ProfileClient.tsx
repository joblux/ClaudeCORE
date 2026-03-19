'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ProfileData {
  first_name: string
  last_name: string
  title: string
  company: string
  city: string
  country: string
  bio: string
  linkedin_url: string
  phone: string
  email: string
  role: string
  status: string
}

const emptyProfile: ProfileData = {
  first_name: '', last_name: '', title: '', company: '',
  city: '', country: '', bio: '', linkedin_url: '', phone: '',
  email: '', role: '', status: '',
}

export default function ProfileClient({ email }: { email: string }) {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile)
  const [form, setForm] = useState<ProfileData>(emptyProfile)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch(`/api/members/profile?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.member) {
          setProfile(data.member)
          setForm(data.member)
        }
      })
      .finally(() => setLoading(false))
  }, [email])

  const handleEdit = () => {
    setForm({ ...profile })
    setEditing(true)
  }

  const handleCancel = () => {
    setForm({ ...profile })
    setEditing(false)
  }

  const handleChange = (field: keyof ProfileData, value: string) => {
    if (field === 'bio' && value.length > 280) return
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/members/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          first_name: form.first_name,
          last_name: form.last_name,
          title: form.title,
          company: form.company,
          city: form.city,
          country: form.country,
          bio: form.bio,
          linkedin_url: form.linkedin_url,
          phone: form.phone,
        }),
      })
      if (res.ok) {
        setProfile({ ...form })
        setEditing(false)
        setToast('Profile updated')
        setTimeout(() => setToast(''), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="jl-container py-20 text-center">
        <p className="font-sans text-sm text-[#888]">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="flex items-start justify-between">
            <div>
              <div className="jl-overline-gold mb-3">Your Profile</div>
              <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a]">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="font-sans text-sm text-[#888] mt-1">
                {profile.role === 'admin' ? 'Administrator' : 'Member'} &middot; {profile.email}
              </p>
            </div>
            {!editing && (
              <button onClick={handleEdit} className="jl-btn jl-btn-outline text-[0.6rem]">
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="max-w-2xl">

          {editing ? (
            /* ── EDIT MODE ────────────────────── */
            <div>
              <div className="jl-section-label"><span>Edit Details</span></div>
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="jl-label">First Name *</label>
                    <input className="jl-input" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Last Name *</label>
                    <input className="jl-input" value={form.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="jl-label">Current Title</label>
                    <input className="jl-input" placeholder="e.g. Store Director" value={form.title} onChange={(e) => handleChange('title', e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Current Maison / Company</label>
                    <input className="jl-input" placeholder="e.g. Herm\u00e8s" value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="jl-label">City *</label>
                    <input className="jl-input" value={form.city} onChange={(e) => handleChange('city', e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Country *</label>
                    <input className="jl-input" value={form.country} onChange={(e) => handleChange('country', e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="jl-label mb-0">Bio</label>
                    <span className="font-sans text-[0.6rem] text-[#aaa]">{form.bio.length}/280</span>
                  </div>
                  <textarea
                    className="jl-input resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="A brief introduction..."
                  />
                </div>
                <div>
                  <label className="jl-label">LinkedIn URL</label>
                  <input className="jl-input" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={(e) => handleChange('linkedin_url', e.target.value)} />
                </div>
                <div>
                  <label className="jl-label">Phone (optional)</label>
                  <input className="jl-input" type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name || !form.city || !form.country} className="jl-btn jl-btn-primary disabled:opacity-40">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={handleCancel} className="jl-btn jl-btn-outline">Cancel</button>
              </div>
            </div>
          ) : (
            /* ── VIEW MODE ────────────────────── */
            <div>
              <div className="jl-section-label"><span>Account Details</span></div>
              <div className="space-y-0 mb-10">
                {([
                  ['Name', `${profile.first_name} ${profile.last_name}`],
                  ['Email', profile.email],
                  ['Title', profile.title],
                  ['Maison / Company', profile.company],
                  ['Location', [profile.city, profile.country].filter(Boolean).join(', ')],
                  ['Bio', profile.bio],
                  ['LinkedIn', profile.linkedin_url],
                  ['Phone', profile.phone],
                  ['Status', profile.status],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between py-3 border-b border-[#f0ece4]">
                    <span className="font-sans text-xs text-[#888] uppercase tracking-wider">{label}</span>
                    <span className="font-sans text-sm text-[#1a1a1a] text-right max-w-[60%]">
                      {value || <span className="text-[#ccc]">&mdash;</span>}
                    </span>
                  </div>
                ))}
              </div>

              <div className="jl-section-label"><span>Quick Links</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard" className="jl-card group">
                  <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Dashboard</h3>
                  <p className="font-sans text-xs text-[#888] mt-1">Back to your dashboard</p>
                </Link>
                <Link href="/jobs" className="jl-card group">
                  <h3 className="font-sans text-sm font-semibold text-[#1a1a1a] group-hover:text-[#a58e28] transition-colors">Job Briefs</h3>
                  <p className="font-sans text-xs text-[#888] mt-1">Browse confidential assignments</p>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a1a] text-[#a58e28] font-sans text-sm px-5 py-3 shadow-lg z-50" style={{ animation: 'toastIn 200ms ease-out' }}>
          {toast}
          <style jsx>{`
            @keyframes toastIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  )
}
