'use client'

import React, { useRef, useState } from 'react'
import Link from 'next/link'

const wrap: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 28px',
  background: '#1a1a1a',
  color: '#fff',
  minHeight: '100vh',
  fontFamily: 'Inter, sans-serif',
}

const sceneBand: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '20px 0 16px',
  marginBottom: 40,
  borderBottom: '1px solid #2a2a2a',
}

const breadcrumb: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#999',
  letterSpacing: 0.2,
  textDecoration: 'none',
}

const pillGroup: React.CSSProperties = {
  display: 'inline-flex',
  background: '#222',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  padding: 3,
}

const pillBase: React.CSSProperties = {
  background: 'transparent',
  color: '#999',
  border: 'none',
  padding: '5px 12px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  letterSpacing: 0.2,
  cursor: 'pointer',
  borderRadius: 6,
  textDecoration: 'none',
  display: 'inline-block',
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  color: '#a58e28',
  letterSpacing: 1.2,
  textTransform: 'uppercase',
  marginBottom: 12,
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontWeight: 400,
  fontSize: 32,
  color: '#fff',
  lineHeight: 1.25,
  marginBottom: 12,
}

const lede: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: '#ccc',
  lineHeight: 1.6,
  maxWidth: 640,
  marginBottom: 32,
}

const dropZone: React.CSSProperties = {
  border: '1.5px dashed rgba(165, 142, 40, 0.5)',
  borderRadius: 10,
  padding: '56px 24px',
  textAlign: 'center',
  background: 'rgba(165, 142, 40, 0.03)',
  marginBottom: 16,
}

const arrowStyle: React.CSSProperties = {
  fontSize: 28,
  color: '#a58e28',
  marginBottom: 16,
  lineHeight: 1,
}

const uploadHeadline: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontWeight: 400,
  fontSize: 20,
  color: '#fff',
  marginBottom: 8,
}

const uploadHint: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#999',
  marginBottom: 24,
}

const chooseBtn: React.CSSProperties = {
  background: '#fff',
  color: '#1a1a1a',
  border: '1px solid #fff',
  padding: '10px 20px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  letterSpacing: 0.3,
  cursor: 'pointer',
  borderRadius: 4,
}

const selectedLine: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: '#ccc',
  marginTop: 18,
}

const metaLine: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: '#777',
  marginBottom: 32,
}

const cancelLink: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#999',
  textDecoration: 'none',
}

export default function CvMergePage() {
  const [filename, setFilename] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  function openPicker() {
    inputRef.current?.click()
  }

  function onFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]
    if (f) setFilename(f.name)
  }

  return (
    <div style={wrap}>
      <div style={sceneBand}>
        <Link href="/dashboard/candidate/profilux" style={breadcrumb}>
          ← Dashboard · ProfiLux · CV merge
        </Link>
        <div role="tablist" style={pillGroup}>
          <Link href="/dashboard/candidate/profilux" role="tab" style={pillBase}>View</Link>
          <Link href="/dashboard/candidate/profilux" role="tab" style={pillBase}>Edit</Link>
          <Link href="/dashboard/candidate/profilux" role="tab" style={pillBase}>Manage</Link>
        </div>
      </div>

      <div style={{ maxWidth: 720 }}>
        <div style={eyebrow}>CV RE-UPLOAD</div>
        <h1 style={titleStyle}>Review changes before they’re applied</h1>
        <p style={lede}>
          Your existing ProfiLux is never silently overwritten. Choose which detected changes to merge, field by field.
        </p>

        <div style={dropZone}>
          <div style={arrowStyle} aria-hidden="true">↑</div>
          <div style={uploadHeadline}>Upload your latest CV</div>
          <div style={uploadHint}>PDF, DOC or DOCX · Up to 10 MB</div>
          <button type="button" style={chooseBtn} onClick={openPicker}>
            Choose file
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
          {filename && (
            <div style={selectedLine}>Selected: {filename}</div>
          )}
        </div>

        <div style={metaLine}>Last upload: —</div>

        <Link href="/dashboard/candidate/profilux" style={cancelLink}>Cancel</Link>
      </div>
    </div>
  )
}
