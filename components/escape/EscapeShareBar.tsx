'use client'

import { useState } from 'react'

export default function EscapeShareBar({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false)
  const [showSend, setShowSend] = useState(false)
  const [sendForm, setSendForm] = useState({ email: '', name: '', message: '' })

  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : ''

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Share request submitted!\nTo: ${sendForm.email}\nFrom: ${sendForm.name}\nMessage: ${sendForm.message || '(none)'}`)
  }

  const iconStyle = { width: 20, height: 20, fill: 'currentColor' }

  return (
    <div>
      <div className="flex items-center gap-3">
        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.01a9.865 9.865 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374A9.86 9.86 0 0 1 2.15 12.01C2.15 6.558 6.58 2.13 12.05 2.13c2.634 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zM20.52 3.449C18.24 1.226 15.24 0 12.05 0 5.464 0 .104 5.334.101 11.893c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.652a11.9 11.9 0 0 0 5.71 1.454h.005c6.585 0 11.946-5.336 11.949-11.896.002-3.176-1.234-6.165-3.479-8.457z" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">WhatsApp</span>
        </a>

        {/* X / Twitter */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">X</span>
        </a>

        {/* LinkedIn */}
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zM6.873 20.452H3.8V9h3.073v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">LinkedIn</span>
        </a>

        {/* Facebook */}
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">Facebook</span>
        </a>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">{copied ? 'Copied!' : 'Copy'}</span>
        </button>

        {/* Send to a friend */}
        <button
          onClick={() => setShowSend(!showSend)}
          className="flex flex-col items-center group"
        >
          <svg style={iconStyle} className="text-[#999] group-hover:text-[#B8975C] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span className="text-[10px] text-[#bbb] mt-1">Send</span>
        </button>
      </div>

      {/* Send to a friend form */}
      {showSend && (
        <form
          onSubmit={handleSend}
          className="mt-4 p-4 border border-[#333] rounded-lg bg-[#1a1a1a] flex flex-col gap-3 max-w-md transition-all"
        >
          <h4 className="text-sm font-medium text-[#ccc]">Send to a friend</h4>
          <input
            type="email"
            required
            placeholder="Friend's email"
            value={sendForm.email}
            onChange={(e) => setSendForm({ ...sendForm, email: e.target.value })}
            className="px-3 py-2 text-sm bg-[#111] border border-[#333] rounded text-white placeholder:text-[#666] focus:outline-none focus:border-[#B8975C]"
          />
          <input
            type="text"
            required
            placeholder="Your name"
            value={sendForm.name}
            onChange={(e) => setSendForm({ ...sendForm, name: e.target.value })}
            className="px-3 py-2 text-sm bg-[#111] border border-[#333] rounded text-white placeholder:text-[#666] focus:outline-none focus:border-[#B8975C]"
          />
          <textarea
            placeholder="Message (optional)"
            value={sendForm.message}
            onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
            rows={3}
            className="px-3 py-2 text-sm bg-[#111] border border-[#333] rounded text-white placeholder:text-[#666] focus:outline-none focus:border-[#B8975C] resize-none"
          />
          <button
            type="submit"
            className="self-start px-4 py-2 text-sm bg-[#B8975C] text-black rounded hover:bg-[#a3854e] transition-colors font-medium"
          >
            Send
          </button>
        </form>
      )}
    </div>
  )
}
