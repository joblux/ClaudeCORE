'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export default function CandidateSettingsPage() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch('/api/members/delete', { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || 'Failed to delete account')
      }
      await signOut({ callbackUrl: '/' })
    } catch (e: any) {
      setError(e?.message || 'Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1200px] mx-auto px-7 pt-10 pb-16">
        <div className="mb-8">
          <Link
            href="/dashboard/candidate"
            className="text-xs text-[#999] hover:text-[#ccc] transition-colors"
          >
            ← Back to dashboard
          </Link>
          <h1
            className="text-2xl font-normal text-white mt-3 mb-1"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Settings
          </h1>
          <p className="text-sm text-[#999]">Manage your account preferences.</p>
        </div>

        <div className="space-y-5">
          {/* Account preferences */}
          <section className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-2">
              ACCOUNT PREFERENCES
            </div>
            <p className="text-sm text-[#ccc] mb-1">Notifications and contact settings</p>
            <p className="text-xs text-[#999]">
              Granular preferences will live here. Nothing to configure yet.
            </p>
          </section>

          {/* Matching consent */}
          <section className="bg-[#222] border border-[#2a2a2a] rounded-xl p-5">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#a58e28] mb-2">
              MATCHING CONSENT
            </div>
            <p className="text-sm text-[#ccc] mb-1">Confidential opportunity matching</p>
            <p className="text-xs text-[#999]">
              You will be able to opt in or out of confidential matching here. The toggle ships
              with the matching engine.
            </p>
          </section>

          {/* Delete account */}
          <section className="bg-[#222] border border-[rgba(244,67,54,0.25)] rounded-xl p-5">
            <div className="text-[10px] font-semibold tracking-[2px] text-[#f44336] mb-2">
              DELETE ACCOUNT
            </div>
            <p className="text-sm text-[#ccc] mb-1">Permanently remove your access</p>
            <p className="text-xs text-[#999] mb-4 max-w-xl leading-relaxed">
              Your profile will be deactivated immediately. Active share links are disabled and
              you will be signed out. This cannot be undone from the dashboard.
            </p>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-xs text-[#f44336] border border-[rgba(244,67,54,0.4)] rounded px-3 py-1.5 hover:bg-[rgba(244,67,54,0.08)] transition-colors"
            >
              Delete my account
            </button>
            {error && (
              <p className="text-xs text-[#f44336] mt-3">{error}</p>
            )}
          </section>
        </div>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => (deleting ? null : setConfirmOpen(false))}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg max-w-md w-full mx-4 p-6 shadow-2xl"
          >
            <h3 className="text-[#e0e0e0] text-base font-medium mb-3">Delete your account?</h3>
            <p className="text-[#999] text-sm mb-6 leading-relaxed">
              Your profile will be deactivated and any active share links disabled. You will be
              signed out immediately.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="text-[12px] text-[#999] hover:text-[#ccc] px-4 py-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-[12px] font-semibold text-white bg-[#f44336] hover:bg-[#d83a30] px-4 py-2 rounded uppercase tracking-wider disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
