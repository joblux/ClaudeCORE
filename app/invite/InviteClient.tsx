'use client'

import { useState, useEffect } from 'react'

export default function InviteClient() {
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/invite/generate')
      .then((r) => r.json())
      .then((data) => {
        if (data.inviteUrl) setInviteUrl(data.inviteUrl)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCopy = async () => {
    if (!inviteUrl) return
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const linkedInShareUrl = inviteUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(inviteUrl)}`
    : '#'

  return (
    <div>
      <div className="border-b-2 border-[#1a1a1a] py-10">
        <div className="jl-container">
          <div className="jl-overline-gold mb-3">Member Referral</div>
          <h1 className="jl-serif text-3xl md:text-4xl font-light text-[#1a1a1a] mb-3">
            Invite a Colleague
          </h1>
          <p className="font-sans text-sm text-[#888] max-w-xl">
            Share your personal invite link with luxury professionals who would benefit from joining JOBLUX.
          </p>
        </div>
      </div>

      <div className="jl-container py-10">
        <div className="max-w-lg">

          {loading ? (
            <p className="font-sans text-sm text-[#888]">Generating your invite link...</p>
          ) : (
            <>
              <div className="jl-section-label"><span>Your Invite Link</span></div>

              {/* Copy input */}
              <div className="flex border border-[#e8e2d8] mb-4">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-4 py-3 font-sans text-sm text-[#1a1a1a] bg-[#fafaf5] outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-5 bg-[#1a1a1a] text-[#a58e28] font-sans text-[0.65rem] font-bold tracking-widest uppercase hover:bg-[#111111] transition-colors flex-shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>

              {/* Share on LinkedIn */}
              <a
                href={linkedInShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="jl-btn jl-btn-outline w-full justify-center mb-6"
              >
                Share on LinkedIn
              </a>

              <p className="font-sans text-[0.65rem] text-[#aaa] leading-relaxed">
                People you invite go through the same approval process. All members are personally reviewed.
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
