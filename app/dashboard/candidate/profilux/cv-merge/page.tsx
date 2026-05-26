'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================================
// Shared chrome — preserved from prior upload-only flow
// ============================================================

const wrap: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '0 28px 80px',
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
  marginBottom: 48,
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
  userSelect: 'none',
}

const pillBase: React.CSSProperties = {
  background: 'transparent',
  color: '#777',
  padding: '5px 12px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  letterSpacing: 0.2,
  borderRadius: 6,
  display: 'inline-block',
  cursor: 'default',
}

const segGroup: React.CSSProperties = {
  display: 'inline-flex',
  background: '#222',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  padding: 3,
  gap: 2,
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: 1,
}
const segBtn = (active: boolean): React.CSSProperties => ({
  background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
  color: active ? '#fff' : '#777',
  padding: '5px 12px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  letterSpacing: 0.2,
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
})

const headerRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 32,
  paddingBottom: 24,
}

const eyebrow: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 11,
  color: '#a58e28',
  letterSpacing: 1.4,
  textTransform: 'uppercase',
  marginBottom: 14,
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontWeight: 400,
  fontSize: 32,
  color: '#fff',
  lineHeight: 1.25,
  marginBottom: 14,
}

const lede: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 14,
  color: '#ccc',
  lineHeight: 1.6,
  maxWidth: 540,
  margin: 0,
}

const cancelLink: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#ccc',
  textDecoration: 'none',
  background: 'transparent',
  border: '1px solid #333',
  padding: '8px 16px',
  borderRadius: 6,
  flexShrink: 0,
  display: 'inline-block',
  cursor: 'pointer',
}

const hairline: React.CSSProperties = {
  borderTop: '0.5px solid #2a2a2a',
  marginBottom: 28,
}

// ============================================================
// Upload state styles
// ============================================================

const dropZone: React.CSSProperties = {
  border: '1.5px dashed rgba(165, 142, 40, 0.35)',
  borderRadius: 16,
  padding: '48px 32px',
  textAlign: 'center',
  background: 'rgba(165, 142, 40, 0.025)',
  width: '100%',
}

const arrowRing: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: '1px solid rgba(165, 142, 40, 0.5)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 18,
  color: '#a58e28',
  fontSize: 18,
  lineHeight: 1,
}

const uploadHeadline: React.CSSProperties = {
  fontFamily: 'Playfair Display, serif',
  fontWeight: 400,
  fontSize: 22,
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
  padding: '10px 22px',
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

// ============================================================
// Review state styles (mirror SectionCard chrome in Edit tab)
// ============================================================

const sectionCard: React.CSSProperties = {
  background: '#1c1c1c',
  border: '0.5px solid #2a2a2a',
  borderRadius: 12,
  padding: 24,
  marginBottom: 14,
}

const sectionEyebrow: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: '#8e8e8e',
  letterSpacing: 1.6,
  textTransform: 'uppercase',
  fontFamily: 'Inter, sans-serif',
  marginBottom: 18,
  paddingBottom: 14,
  borderBottom: '0.5px solid rgba(255,255,255,0.04)',
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: 12,
  borderRadius: 6,
}

const checkboxLabel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  flex: 1,
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: '#ccc',
  lineHeight: 1.5,
}


const badge: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  padding: '3px 8px',
  borderRadius: 4,
  flexShrink: 0,
  alignSelf: 'flex-start',
  marginTop: 1,
}

const badgeAdded: React.CSSProperties = {
  ...badge,
  background: 'rgba(29, 158, 117, 0.15)',
  color: '#1D9E75',
  border: '1px solid rgba(29, 158, 117, 0.3)',
}

const badgeChanged: React.CSSProperties = {
  ...badge,
  background: 'rgba(165, 142, 40, 0.1)',
  color: '#a58e28',
  border: '1px solid rgba(165, 142, 40, 0.3)',
}

const badgeMatched: React.CSSProperties = {
  ...badge,
  background: 'transparent',
  color: '#777',
  border: '1px solid #2a2a2a',
}

const currentVal: React.CSSProperties = {
  color: '#999',
  fontStyle: 'italic',
}

const arrowSep: React.CSSProperties = {
  color: '#555',
  margin: '0 8px',
}

const pendingVal: React.CSSProperties = {
  color: '#fff',
}

const meta: React.CSSProperties = {
  color: '#999',
  fontSize: 12,
  marginTop: 2,
}

const actionRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 32,
  paddingTop: 24,
  borderTop: '0.5px solid #2a2a2a',
}

const applyBtn: React.CSSProperties = {
  background: '#fff',
  color: '#1a1a1a',
  border: '1px solid #fff',
  padding: '10px 22px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  letterSpacing: 0.3,
  cursor: 'pointer',
  borderRadius: 6,
  fontWeight: 600,
}

const rejectLink: React.CSSProperties = {
  background: 'transparent',
  color: '#999',
  border: 'none',
  padding: '8px 0',
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'underline',
}

// ============================================================
// Types (inline — match /diff response shape)
// ============================================================

type IdentityField =
  | 'first_name'
  | 'last_name'
  | 'city'
  | 'country'
  | 'nationality'
  | 'phone'
  | 'headline'
  | 'bio'

type IdentityEntry = {
  field: IdentityField
  current: string | null
  pending: string
  status: 'unchanged' | 'changed' | 'added'
}

type CollectionStatus = 'matched' | 'added'

type ExperienceEntry = {
  index: number
  key: string
  status: CollectionStatus
  item: {
    job_title?: string | null
    company?: string | null
    city?: string | null
    country?: string | null
    start_date?: string | null
    end_date?: string | null
    is_current?: boolean
    description?: string | null
  }
}

type EducationEntry = {
  signature: string
  status: CollectionStatus
  item: {
    institution?: string | null
    degree_level?: string | null
    field_of_study?: string | null
    graduation_year?: number | null
    city?: string | null
    country?: string | null
  }
}

type LanguageEntry = {
  key: string
  status: CollectionStatus
  item: {
    language?: string | null
    proficiency?: string | null
  }
}

type SectorEntry = {
  sector: string
  status: CollectionStatus
}

type DiffResponse = {
  pending: { parsed_at: string | null; source: any } | null
  diff: {
    identity: IdentityEntry[]
    experiences: ExperienceEntry[]
    education: EducationEntry[]
    languages: LanguageEntry[]
    sectors: SectorEntry[]
  } | null
}

const IDENTITY_LABELS: Record<IdentityField, string> = {
  first_name: 'First name',
  last_name: 'Last name',
  city: 'City',
  country: 'Country',
  nationality: 'Nationality',
  phone: 'Phone',
  headline: 'Headline',
  bio: 'Bio',
}

type Mode = 'loading' | 'upload' | 'review' | 'applying' | 'rejecting'

export default function CvMergePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const [mode, setMode] = useState<Mode>('loading')
  const [diff, setDiff] = useState<DiffResponse['diff']>(null)
  const [error, setError] = useState<string | null>(null)

  // Upload-state UI
  const [filename, setFilename] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing] = useState(false)

  // Review-state selections
  const [identitySel, setIdentitySel] = useState<Set<IdentityField>>(new Set())
  const [expSel, setExpSel] = useState<Set<number>>(new Set())
  const [eduSel, setEduSel] = useState<Set<string>>(new Set())
  const [langSel, setLangSel] = useState<Set<string>>(new Set())
  const [sectorSel, setSectorSel] = useState<Set<string>>(new Set())

  const loadDiff = useCallback(async (): Promise<DiffResponse | null> => {
    try {
      const res = await fetch('/api/members/cv-merge/diff')
      if (!res.ok) {
        setError('Could not load CV merge state.')
        return null
      }
      const data = (await res.json()) as DiffResponse
      return data
    } catch {
      setError('Could not load CV merge state.')
      return null
    }
  }, [])

  const seedSelections = (d: DiffResponse['diff']) => {
    if (!d) return
    setIdentitySel(new Set(d.identity.filter((e) => e.status === 'added').map((e) => e.field)))
    setExpSel(new Set(d.experiences.filter((e) => e.status === 'added').map((e) => e.index)))
    setEduSel(new Set(d.education.filter((e) => e.status === 'added').map((e) => e.signature)))
    setLangSel(new Set(d.languages.filter((e) => e.status === 'added').map((e) => e.key)))
    setSectorSel(new Set(d.sectors.filter((e) => e.status === 'added').map((e) => e.sector)))
  }

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const data = await loadDiff()
      if (cancelled) return
      if (!data || data.pending === null || data.diff === null) {
        setMode('upload')
        return
      }
      setDiff(data.diff)
      seedSelections(data.diff)
      setMode('review')
    })()
    return () => {
      cancelled = true
    }
  }, [loadDiff])

  function openPicker() {
    if (uploading || parsing) return
    inputRef.current?.click()
  }

  async function onFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]
    if (!f) return
    setFilename(f.name)
    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('cv', f)
      const upRes = await fetch('/api/members/cv-upload', { method: 'POST', body: fd })
      if (!upRes.ok) {
        setError('Upload failed. Try again.')
        setUploading(false)
        return
      }
      setUploading(false)
      setParsing(true)
      const parseRes = await fetch('/api/members/cv-parse', { method: 'POST' })
      const parseData = await parseRes.json().catch(() => ({} as any))
      if (!parseRes.ok || !parseData?.success) {
        setError('CV uploaded, but parsing failed. Return to ProfiLux and try parsing again.')
        setParsing(false)
        return
      }
      setParsing(false)
      // C.4: after a successful parse, transition to review state by re-fetching
      // the diff. No redirect — the user reviews and applies/rejects on this page.
      setMode('loading')
      const data = await loadDiff()
      if (!data || data.pending === null || data.diff === null) {
        // Edge case: pending vanished between parse and re-fetch (race or external apply).
        setMode('upload')
        return
      }
      setDiff(data.diff)
      seedSelections(data.diff)
      setMode('review')
    } catch {
      setError('Upload failed. Try again.')
      setUploading(false)
      setParsing(false)
    } finally {
      if (ev.target) ev.target.value = ''
    }
  }

  async function handleApply() {
    if (!diff) return
    setMode('applying')
    setError(null)
    try {
      const accept: Record<string, any> = {}
      if (identitySel.size > 0) {
        accept.identity = Object.fromEntries([...identitySel].map((f) => [f, true]))
      }
      if (expSel.size > 0) accept.experiences = [...expSel]
      if (eduSel.size > 0) accept.education = [...eduSel]
      if (langSel.size > 0) accept.languages = [...langSel]
      if (sectorSel.size > 0) accept.sectors = [...sectorSel]

      const res = await fetch('/api/members/cv-merge/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accept }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || `Apply failed (${res.status})`)
        setMode('review')
        return
      }
      router.push('/dashboard/candidate/profilux')
    } catch (err) {
      setError(String(err))
      setMode('review')
    }
  }

  async function handleReject() {
    setMode('rejecting')
    setError(null)
    try {
      const res = await fetch('/api/members/cv-merge/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any))
        setError(typeof data?.error === 'string' ? data.error : `HTTP ${res.status}`)
        setMode('review')
        return
      }
      router.push('/dashboard/candidate/profilux')
    } catch (err) {
      setError(String(err))
      setMode('review')
    }
  }

  function setMembership<T>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T, include: boolean) {
    setter((prev) => {
      const next = new Set(prev)
      if (include) next.add(value)
      else next.delete(value)
      return next
    })
  }
  const Segmented = ({
    inLabel, outLabel, isIn, onPick,
  }: { inLabel: string; outLabel: string; isIn: boolean; onPick: (include: boolean) => void }) => (
    <span style={segGroup}>
      <button type="button" style={segBtn(isIn)} onClick={() => onPick(true)}>{inLabel}</button>
      <button type="button" style={segBtn(!isIn)} onClick={() => onPick(false)}>{outLabel}</button>
    </span>
  )

  // ----------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------

  const renderUpload = () => (
    <>
      <div style={headerRow}>
        <div>
          <div style={eyebrow}>CV RE-UPLOAD</div>
          <h1 style={titleStyle}>Re-upload your CV</h1>
          <p style={lede}>
            Your CV will be re-parsed and your ProfiLux refreshed.
          </p>
        </div>
        <Link href="/dashboard/candidate/profilux" style={cancelLink}>Cancel</Link>
      </div>

      <div style={hairline} />

      <div style={dropZone}>
        <div style={arrowRing} aria-hidden="true">↑</div>
        <div style={uploadHeadline}>Upload your latest CV</div>
        <div style={uploadHint}>PDF, DOC or DOCX · Up to 10 MB</div>
        <button
          type="button"
          style={{
            ...chooseBtn,
            opacity: uploading || parsing ? 0.6 : 1,
            cursor: uploading || parsing ? 'not-allowed' : 'pointer',
          }}
          onClick={openPicker}
          disabled={uploading || parsing}
        >
          {uploading ? 'Uploading…' : parsing ? 'Parsing…' : 'Choose file'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        {filename && <div style={selectedLine}>Selected: {filename}</div>}
        {error && <div style={{ marginTop: 18, fontSize: 12, color: '#ff6b6b' }}>{error}</div>}
      </div>
    </>
  )

  const renderIdentitySection = () => {
    if (!diff) return null
    const entries = diff.identity.filter((e) => e.status !== 'unchanged')
    if (entries.length === 0) return null
    return (
      <div style={sectionCard}>
        <div style={sectionEyebrow}>Identity</div>
        {entries.map((e) => (
          <div key={e.field} style={rowStyle}>
            <span style={checkboxLabel}>
              <span style={{ color: '#fff', fontWeight: 500, minWidth: 110 }}>
                {IDENTITY_LABELS[e.field]}
              </span>
              <span>
                {e.current ? <span style={currentVal}>{e.current}</span> : <span style={currentVal}>—</span>}
                <span style={arrowSep}>→</span>
                <span style={pendingVal}>{e.pending}</span>
              </span>
            </span>
            <span style={e.status === 'added' ? badgeAdded : badgeChanged}>{e.status}</span>
            <Segmented
              inLabel={e.status === 'added' ? 'Add' : 'Apply new'}
              outLabel={e.status === 'added' ? 'Skip' : 'Keep existing'}
              isIn={identitySel.has(e.field)}
              onPick={(include) => setMembership(setIdentitySel, e.field, include)}
            />
          </div>
        ))}
      </div>
    )
  }

  const renderExperiencesSection = () => {
    if (!diff || diff.experiences.length === 0) return null
    return (
      <div style={sectionCard}>
        <div style={sectionEyebrow}>Experiences</div>
        {diff.experiences.map((e) => {
          const company = e.item.company ?? 'Unknown company'
          const jobTitle = e.item.job_title ?? 'Untitled role'
          const start = e.item.start_date ?? '—'
          const end = e.item.is_current ? 'Present' : (e.item.end_date ?? '—')
          if (e.status === 'matched') {
            return (
              <div key={e.index} style={rowStyle}>
                <span style={checkboxLabel}>
                  <span>
                    <span style={pendingVal}>{company}</span>
                    <span style={arrowSep}>·</span>
                    <span style={{ color: '#ccc' }}>{jobTitle}</span>
                    <div style={meta}>{start} → {end}</div>
                  </span>
                </span>
                <span style={badgeMatched}>matched</span>
              </div>
            )
          }
          return (
            <div key={e.index} style={rowStyle}>
              <span style={checkboxLabel}>
                <span>
                  <span style={pendingVal}>{company}</span>
                  <span style={arrowSep}>·</span>
                  <span style={{ color: '#ccc' }}>{jobTitle}</span>
                  <div style={meta}>{start} → {end}</div>
                </span>
              </span>
              <span style={badgeAdded}>added</span>
              <Segmented
                inLabel="Import"
                outLabel="Don't import"
                isIn={expSel.has(e.index)}
                onPick={(include) => setMembership(setExpSel, e.index, include)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const renderEducationSection = () => {
    if (!diff || diff.education.length === 0) return null
    return (
      <div style={sectionCard}>
        <div style={sectionEyebrow}>Education</div>
        {diff.education.map((e) => {
          const inst = e.item.institution ?? '—'
          const fos = e.item.field_of_study ?? null
          const gy = e.item.graduation_year ?? null
          const subtitle = [fos, gy != null ? String(gy) : null].filter(Boolean).join(' · ')
          if (e.status === 'matched') {
            return (
              <div key={e.signature} style={rowStyle}>
                <span style={checkboxLabel}>
                  <span>
                    <span style={pendingVal}>{inst}</span>
                    {subtitle && <div style={meta}>{subtitle}</div>}
                  </span>
                </span>
                <span style={badgeMatched}>matched</span>
              </div>
            )
          }
          return (
            <div key={e.signature} style={rowStyle}>
              <span style={checkboxLabel}>
                <span>
                  <span style={pendingVal}>{inst}</span>
                  {subtitle && <div style={meta}>{subtitle}</div>}
                </span>
              </span>
              <span style={badgeAdded}>added</span>
              <Segmented
                inLabel="Import"
                outLabel="Don't import"
                isIn={eduSel.has(e.signature)}
                onPick={(include) => setMembership(setEduSel, e.signature, include)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const renderLanguagesSection = () => {
    if (!diff || diff.languages.length === 0) return null
    return (
      <div style={sectionCard}>
        <div style={sectionEyebrow}>Languages</div>
        {diff.languages.map((e) => {
          const lang = e.item.language ?? e.key
          const prof = e.item.proficiency ?? null
          const display = prof ? `${lang} — ${prof}` : String(lang)
          if (e.status === 'matched') {
            return (
              <div key={e.key} style={rowStyle}>
                <span style={checkboxLabel}>
                  <span style={pendingVal}>{display}</span>
                </span>
                <span style={badgeMatched}>matched</span>
              </div>
            )
          }
          return (
            <div key={e.key} style={rowStyle}>
              <span style={checkboxLabel}>
                <span style={pendingVal}>{display}</span>
              </span>
              <span style={badgeAdded}>added</span>
              <Segmented
                inLabel="Import"
                outLabel="Don't import"
                isIn={langSel.has(e.key)}
                onPick={(include) => setMembership(setLangSel, e.key, include)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const renderSectorsSection = () => {
    if (!diff || diff.sectors.length === 0) return null
    return (
      <div style={sectionCard}>
        <div style={sectionEyebrow}>Sectors</div>
        {diff.sectors.map((e) => {
          if (e.status === 'matched') {
            return (
              <div key={e.sector} style={rowStyle}>
                <span style={checkboxLabel}>
                  <span style={pendingVal}>{e.sector}</span>
                </span>
                <span style={badgeMatched}>matched</span>
              </div>
            )
          }
          return (
            <div key={e.sector} style={rowStyle}>
              <span style={checkboxLabel}>
                <span style={pendingVal}>{e.sector}</span>
              </span>
              <span style={badgeAdded}>added</span>
              <Segmented
                inLabel="Import"
                outLabel="Don't import"
                isIn={sectorSel.has(e.sector)}
                onPick={(include) => setMembership(setSectorSel, e.sector, include)}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const totalSelected =
    identitySel.size + expSel.size + eduSel.size + langSel.size + sectorSel.size

  const renderReview = () => (
    <>
      <div style={headerRow}>
        <div>
          <div style={eyebrow}>CV MERGE</div>
          <h1 style={titleStyle}>Review your re-parsed CV</h1>
          <p style={lede}>
            For each item, choose what to do. Nothing is changed unless you choose it.
          </p>
        </div>
        <button
          type="button"
          style={cancelLink}
          onClick={() => router.push('/dashboard/candidate/profilux')}
        >
          Cancel
        </button>
      </div>

      <div style={hairline} />

      {renderIdentitySection()}
      {renderExperiencesSection()}
      {renderEducationSection()}
      {renderLanguagesSection()}
      {renderSectorsSection()}

      {error && (
        <div
          style={{
            marginTop: 24,
            padding: '12px 16px',
            background: 'rgba(255, 107, 107, 0.08)',
            border: '1px solid rgba(255, 107, 107, 0.35)',
            borderRadius: 6,
            color: '#ff6b6b',
            fontSize: 13,
            fontFamily: 'Inter, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {error}
        </div>
      )}

      <div style={actionRow}>
        <button
          type="button"
          style={rejectLink}
          onClick={() => { if (window.confirm('Discard analysis? This permanently clears the parsed CV results. Your uploaded CV file is kept and can be re-analyzed.')) handleReject() }}
          disabled={mode === 'applying' || mode === 'rejecting'}
        >
          {mode === 'rejecting' ? 'Discarding…' : 'Discard analysis'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#999' }}>
            {totalSelected} changes will apply
          </span>
          <button
            type="button"
            style={{
              ...applyBtn,
              opacity: mode === 'applying' || totalSelected === 0 ? 0.6 : 1,
              cursor: mode === 'applying' || totalSelected === 0 ? 'not-allowed' : 'pointer',
            }}
            onClick={handleApply}
            disabled={mode === 'applying' || totalSelected === 0}
          >
            {mode === 'applying' ? 'Applying…' : 'Apply selected'}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div style={wrap}>
      <div style={sceneBand}>
        <Link href="/dashboard/candidate/profilux" style={breadcrumb}>
          ← Dashboard · ProfiLux · CV merge
        </Link>
        <div role="tablist" aria-hidden="true" style={pillGroup}>
          <span role="tab" style={pillBase}>View</span>
          <span role="tab" style={pillBase}>Edit</span>
          <span role="tab" style={pillBase}>Manage</span>
        </div>
      </div>

      {mode === 'loading' && (
        <div style={{ color: '#999', fontFamily: 'Inter, sans-serif', fontSize: 14, padding: '40px 0' }}>
          Loading…
        </div>
      )}
      {mode === 'upload' && renderUpload()}
      {(mode === 'review' || mode === 'applying' || mode === 'rejecting') && renderReview()}
    </div>
  )
}
