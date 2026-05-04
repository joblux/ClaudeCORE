'use client'

import React, { useEffect, useState } from 'react'
import type { EditorView } from '@/lib/profilux/types'
import { PROFILUX_SENIORITY_OPTIONS, PROFILUX_PRODUCT_CATEGORY_OPTIONS, PROFILUX_EXPERTISE_TAG_OPTIONS, PROFILUX_CURRENCY_OPTIONS } from '@/lib/profilux/vocabulary'

const TOTAL = 11
const SCREEN_TITLES = [
  '', 'Identity', 'Headline', 'Current Position', 'Luxury Fit',
  'Career History', 'Education & Languages', 'Skills & Markets',
  'Clienteling', 'Availability & Targets', 'Compensation', 'Confirm',
]

const NotSet = () => <em style={{ color: '#666' }}>Not specified</em>
const NoneSel = () => <em style={{ color: '#666' }}>None selected</em>
const Hint = ({ children }: { children: React.ReactNode }) => <em style={{ color: '#888' }}>{children}</em>

const wrap: React.CSSProperties = { padding: 40, background: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }
const h1Style: React.CSSProperties = { fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 28, marginBottom: 8 }
const sub: React.CSSProperties = { color: '#999', fontSize: 13, marginBottom: 24 }
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '240px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6, maxWidth: 900 }
const label: React.CSSProperties = { color: '#999' }
const navWrap: React.CSSProperties = { marginTop: 40, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 900 }
const btn: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }
const btnDis: React.CSSProperties = { ...btn, color: '#555', borderColor: '#222', cursor: 'not-allowed' }
const card: React.CSSProperties = { border: '1px solid #2a2a2a', padding: 16, marginBottom: 8, fontSize: 13 }
const sectionLabel: React.CSSProperties = { marginTop: 24, color: '#999', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }
const input: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 10px', fontFamily: 'Inter, sans-serif', fontSize: 14, width: '100%', maxWidth: 400, outline: 'none' }
const select: React.CSSProperties = { ...input, appearance: 'none', backgroundImage: 'linear-gradient(45deg, transparent 50%, #999 50%), linear-gradient(135deg, #999 50%, transparent 50%)', backgroundPosition: 'calc(100% - 14px) 50%, calc(100% - 9px) 50%', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat', paddingRight: 28 }
const saveBtn: React.CSSProperties = { ...btn, background: '#fff', color: '#1a1a1a', borderColor: '#fff' }
const saveBtnDis: React.CSSProperties = { ...saveBtn, opacity: 0.5, cursor: 'not-allowed' }
const chip: React.CSSProperties = { background: 'transparent', color: '#ccc', border: '1px solid #444', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 999 }
const chipActive: React.CSSProperties = { ...chip, background: 'rgba(165, 142, 40, 0.15)', color: '#fff', borderColor: '#a58e28' }

type Screen3Draft = {
  job_title: string
  current_employer: string
  seniority: string
  total_years_experience: string
}

type Screen4Draft = {
  years_in_luxury: string
  product_categories: string[]
  expertise_tags: string[]
}

type Screen8Draft = {
  clienteling_experience: boolean | null
  clienteling_description: string
}

type Screen6Draft = {
  university: string
  field_of_study: string
  graduation_year: string
}

type Screen10Draft = {
  desired_salary_min: number | null
  desired_salary_max: number | null
  desired_salary_currency: string | null
}

function draftFrom(e: EditorView): Screen3Draft {
  return {
    job_title: e.job_title ?? '',
    current_employer: e.current_employer ?? '',
    seniority: e.seniority ?? '',
    total_years_experience: e.total_years_experience != null ? String(e.total_years_experience) : '',
  }
}

function draftFrom4(e: EditorView): Screen4Draft {
  return {
    years_in_luxury: e.years_in_luxury == null ? '' : String(e.years_in_luxury),
    product_categories: e.product_categories ?? [],
    expertise_tags: e.expertise_tags ?? [],
  }
}

function draftFrom8(e: EditorView): Screen8Draft {
  return {
    clienteling_experience: e.clienteling_experience,
    clienteling_description: e.clienteling_description ?? '',
  }
}

function draftFrom6(e: EditorView): Screen6Draft {
  return {
    university: e.university ?? '',
    field_of_study: e.field_of_study ?? '',
    graduation_year: e.graduation_year == null ? '' : String(e.graduation_year),
  }
}

const draftFrom10 = (e: EditorView): Screen10Draft => ({
  desired_salary_min: e.desired_salary_min,
  desired_salary_max: e.desired_salary_max,
  desired_salary_currency: e.desired_salary_currency,
})

export default function ProfiluxPage() {
  const [editor, setEditor] = useState<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<Screen3Draft>({ job_title: '', current_employer: '', seniority: '', total_years_experience: '' })
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [draft4, setDraft4] = useState<Screen4Draft>({ years_in_luxury: '', product_categories: [], expertise_tags: [] })
  const [saving4, setSaving4] = useState(false)
  const [savedAt4, setSavedAt4] = useState<number | null>(null)
  const [saveError4, setSaveError4] = useState<string | null>(null)
  const [draft8, setDraft8] = useState<Screen8Draft>({ clienteling_experience: null, clienteling_description: '' })
  const [saving8, setSaving8] = useState(false)
  const [savedAt8, setSavedAt8] = useState<number | null>(null)
  const [saveError8, setSaveError8] = useState<string | null>(null)
  const [draft6, setDraft6] = useState<Screen6Draft>({ university: '', field_of_study: '', graduation_year: '' })
  const [saving6, setSaving6] = useState(false)
  const [savedAt6, setSavedAt6] = useState<number | null>(null)
  const [saveError6, setSaveError6] = useState<string | null>(null)
  const [draft10, setDraft10] = useState<Screen10Draft | null>(null)
  const [saving10, setSaving10] = useState(false)
  const [savedAt10, setSavedAt10] = useState<number | null>(null)
  const [saveError10, setSaveError10] = useState<string | null>(null)

  const refetch = async () => {
    const res = await fetch('/api/profilux')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const e: EditorView | null = data.editor ?? null
    setEditor(e)
    if (e) {
      setDraft(draftFrom(e))
      setDraft4(draftFrom4(e))
      setDraft8(draftFrom8(e))
      setDraft6(draftFrom6(e))
      setDraft10(draftFrom10(e))
    }
    return e
  }

  useEffect(() => {
    refetch().catch((e) => setError(String(e))).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={wrap}>Loading…</div>
  if (error) return <div style={{ ...wrap, color: '#ff6b6b' }}>Error: {error}</div>
  if (!editor) return <div style={wrap}>No editor data.</div>

  const e = editor

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    try {
      const yearsRaw = draft.total_years_experience.trim()
      const yearsNum = yearsRaw === '' ? null : Number(yearsRaw)
      const body: Record<string, unknown> = {
        job_title: draft.job_title,
        current_employer: draft.current_employer,
        seniority: draft.seniority,
        total_years_experience: yearsNum != null && Number.isFinite(yearsNum) && yearsNum >= 0 ? yearsNum : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError(String(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleSave4() {
    setSaving4(true)
    setSaveError4(null)
    try {
      const yearsRaw = draft4.years_in_luxury.trim()
      const yearsNum = yearsRaw === '' ? null : Number(yearsRaw)
      const body: Record<string, unknown> = {
        years_in_luxury: yearsNum != null && Number.isFinite(yearsNum) && yearsNum >= 0 ? yearsNum : null,
        product_categories: draft4.product_categories,
        expertise_tags: draft4.expertise_tags,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt4(Date.now())
      setTimeout(() => setSavedAt4((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError4(String(err))
    } finally {
      setSaving4(false)
    }
  }

  async function handleSave8() {
    setSaving8(true)
    setSaveError8(null)
    try {
      const exp = draft8.clienteling_experience
      const descRaw = draft8.clienteling_description.trim()
      const body: Record<string, unknown> = {
        clienteling_experience: exp,
        clienteling_description: exp === true && descRaw !== '' ? descRaw : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt8(Date.now())
      setTimeout(() => setSavedAt8((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError8(String(err))
    } finally {
      setSaving8(false)
    }
  }

  async function handleSave6() {
    setSaving6(true)
    setSaveError6(null)
    try {
      const yearRaw = draft6.graduation_year.trim()
      const yearNum = yearRaw === '' ? null : Number(yearRaw)
      const body: Record<string, unknown> = {
        university: draft6.university,
        field_of_study: draft6.field_of_study,
        graduation_year: yearNum != null && Number.isFinite(yearNum) && yearNum >= 0 ? yearNum : null,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt6(Date.now())
      setTimeout(() => setSavedAt6((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError6(String(err))
    } finally {
      setSaving6(false)
    }
  }

  async function handleSave10() {
    if (!draft10) return
    setSaving10(true)
    setSaveError10(null)
    try {
      const body: Record<string, unknown> = {
        desired_salary_min: draft10.desired_salary_min,
        desired_salary_max: draft10.desired_salary_max,
        desired_salary_currency: draft10.desired_salary_currency,
      }
      const res = await fetch('/api/profilux', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await refetch()
      setSavedAt10(Date.now())
      setTimeout(() => setSavedAt10((t) => (t && Date.now() - t >= 2000 ? null : t)), 2100)
    } catch (err) {
      setSaveError10(String(err))
    } finally {
      setSaving10(false)
    }
  }

  function renderStep() {
    switch (step) {
      case 1: return (
        <div style={grid}>
          <div style={label}>First name</div><div>{e.first_name ?? <NotSet />}</div>
          <div style={label}>Last name</div><div>{e.last_name ?? <NotSet />}</div>
          <div style={label}>City</div><div>{e.city ?? <NotSet />}</div>
          <div style={label}>Country</div><div>{e.country ?? <NotSet />}</div>
          <div style={label}>Phone</div><div>{e.phone ?? <NotSet />}</div>
          <div style={label}>Nationality</div><div>{e.nationality ?? <NotSet />}</div>
        </div>
      )
      case 2: return (
        <div style={grid}>
          <div style={label}>Headline</div><div>{e.headline ?? <NotSet />}</div>
          <div style={label}>Bio</div><div>{e.bio ?? <NotSet />}</div>
        </div>
      )
      case 3: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Job title</div>
            <div><input style={input} value={draft.job_title} onChange={(ev) => setDraft({ ...draft, job_title: ev.target.value })} placeholder="e.g. Boutique Director" /></div>
            <div style={label}>Current employer</div>
            <div><input style={input} value={draft.current_employer} onChange={(ev) => setDraft({ ...draft, current_employer: ev.target.value })} placeholder="e.g. Hermès" /></div>
            <div style={label}>Seniority</div>
            <div>
              <select style={select} value={draft.seniority} onChange={(ev) => setDraft({ ...draft, seniority: ev.target.value })}>
                <option value="">— Select seniority —</option>
                {PROFILUX_SENIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div style={label}>Years of experience</div>
            <div><input style={input} type="number" min={0} value={draft.total_years_experience} onChange={(ev) => setDraft({ ...draft, total_years_experience: ev.target.value })} placeholder="e.g. 12" /></div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving ? saveBtnDis : saveBtn} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {savedAt && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError}</span>}
          </div>
        </div>
      )
      case 4: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Sectors</div><div>{e.sectors.length ? e.sectors.join(', ') : <NoneSel />}</div>
            <div style={label}>Years in luxury</div>
            <div><input style={input} type="number" min={0} value={draft4.years_in_luxury} onChange={(ev) => setDraft4({ ...draft4, years_in_luxury: ev.target.value })} placeholder="e.g. 8" /></div>
          </div>
          <div style={sectionLabel}>Product categories</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_PRODUCT_CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft4.product_categories.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft4({ ...draft4, product_categories: draft4.product_categories.includes(o.value) ? draft4.product_categories.filter(v => v !== o.value) : [...draft4.product_categories, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={sectionLabel}>Areas of expertise</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {PROFILUX_EXPERTISE_TAG_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                style={draft4.expertise_tags.includes(o.value) ? chipActive : chip}
                onClick={() => setDraft4({ ...draft4, expertise_tags: draft4.expertise_tags.includes(o.value) ? draft4.expertise_tags.filter(v => v !== o.value) : [...draft4.expertise_tags, o.value] })}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving4 ? saveBtnDis : saveBtn} disabled={saving4} onClick={handleSave4}>
              {saving4 ? 'Saving…' : 'Save'}
            </button>
            {savedAt4 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError4 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError4}</span>}
          </div>
        </div>
      )
      case 5: return (
        <div style={{ maxWidth: 900 }}>
          {e.experiences.length === 0 && <NoneSel />}
          {e.experiences.map((exp, i) => (
            <div key={i} style={card}>
              <div><strong>{exp.company ?? 'Unknown'}</strong> — {exp.job_title ?? 'Role not specified'}</div>
              <div style={{ color: '#999', marginTop: 4 }}>{exp.city ?? '—'}, {exp.country ?? '—'} · {exp.start_date ?? '—'} → {exp.end_date ?? 'Present'}</div>
              {exp.description && <div style={{ color: '#ccc', marginTop: 8 }}>{exp.description}</div>}
            </div>
          ))}
        </div>
      )
      case 6: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>University</div>
            <div><input style={input} value={draft6.university} onChange={(ev) => setDraft6({ ...draft6, university: ev.target.value })} placeholder="e.g. Swiss School of Business" /></div>
            <div style={label}>Field of study</div>
            <div><input style={input} value={draft6.field_of_study} onChange={(ev) => setDraft6({ ...draft6, field_of_study: ev.target.value })} placeholder="e.g. Business Administration" /></div>
            <div style={label}>Graduation year</div>
            <div><input style={input} type="number" min={0} value={draft6.graduation_year} onChange={(ev) => setDraft6({ ...draft6, graduation_year: ev.target.value })} placeholder="e.g. 2018" /></div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving6 ? saveBtnDis : saveBtn} disabled={saving6} onClick={handleSave6}>
              {saving6 ? 'Saving…' : 'Save'}
            </button>
            {savedAt6 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError6 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError6}</span>}
          </div>
          <div style={sectionLabel}>Education</div>
          {e.education.length === 0 && <NoneSel />}
          {e.education.map((ed, i) => (
            <div key={i} style={card}>
              <div><strong>{ed.institution ?? 'Unknown'}</strong></div>
              <div style={{ color: '#999', marginTop: 4 }}>{ed.degree ?? '—'} · {ed.field_of_study ?? '—'} · {ed.graduation_year ?? '—'}</div>
            </div>
          ))}
          <div style={sectionLabel}>Languages</div>
          {e.languages.length === 0 && <NoneSel />}
          {e.languages.map((l, i) => (
            <div key={i} style={card}>{l.language} — {l.proficiency ?? <NotSet />}</div>
          ))}
        </div>
      )
      case 7: return (
        <div style={grid}>
          <div style={label}>Markets</div><div>{e.market_knowledge.length ? e.market_knowledge.join(', ') : <Hint>Add markets to improve matching</Hint>}</div>
          <div style={label}>Skills</div><div>{e.key_skills.length ? e.key_skills.join(', ') : <Hint>Add skills to improve matching</Hint>}</div>
        </div>
      )
      case 8: return (
        <div style={{ maxWidth: 900 }}>
          <div style={sectionLabel}>Clienteling experience</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button
              type="button"
              style={draft8.clienteling_experience === true ? chipActive : chip}
              onClick={() => setDraft8(prev => prev.clienteling_experience === true
                ? { clienteling_experience: null, clienteling_description: '' }
                : { clienteling_experience: true, clienteling_description: prev.clienteling_description })}
            >
              Yes
            </button>
            <button
              type="button"
              style={draft8.clienteling_experience === false ? chipActive : chip}
              onClick={() => setDraft8(prev => ({
                clienteling_experience: prev.clienteling_experience === false ? null : false,
                clienteling_description: '',
              }))}
            >
              No
            </button>
          </div>

          {draft8.clienteling_experience === true && (
            <>
              <div style={sectionLabel}>Background description</div>
              <textarea
                style={{ ...input, maxWidth: 600, fontFamily: 'Inter, sans-serif', minHeight: 80, resize: 'vertical' }}
                rows={3}
                value={draft8.clienteling_description}
                onChange={(ev) => setDraft8(prev => ({ ...prev, clienteling_description: ev.target.value }))}
                placeholder="Briefly describe your clienteling experience"
              />
            </>
          )}

          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving8 ? saveBtnDis : saveBtn} disabled={saving8} onClick={handleSave8}>
              {saving8 ? 'Saving…' : 'Save'}
            </button>
            {savedAt8 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError8 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError8}</span>}
          </div>
        </div>
      )
      case 9: return (
        <div style={grid}>
          <div style={label}>Availability</div><div>{e.availability ?? <NotSet />}</div>
          <div style={label}>Target locations</div><div>{e.desired_locations.length ? e.desired_locations.join(', ') : <NoneSel />}</div>
          <div style={label}>Target departments</div><div>{e.desired_departments.length ? e.desired_departments.join(', ') : <NoneSel />}</div>
          <div style={label}>Contract types</div><div>{e.desired_contract_types.length ? e.desired_contract_types.join(', ') : <NoneSel />}</div>
          <div style={label}>Open to relocation</div><div>{e.open_to_relocation ? 'Yes' : <NotSet />}</div>
          <div style={label}>Relocation preferences</div><div>{e.relocation_preferences ?? <NotSet />}</div>
        </div>
      )
      case 10: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>Target compensation (min)</div>
            <div><input style={input} type="number" min={0} value={draft10?.desired_salary_min ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_min: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 80000" /></div>
            <div style={label}>Target compensation (max)</div>
            <div><input style={input} type="number" min={0} value={draft10?.desired_salary_max ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_max: ev.target.value === '' ? null : Number(ev.target.value) }))} placeholder="e.g. 120000" /></div>
            <div style={label}>Currency</div>
            <div>
              <select style={input} value={draft10?.desired_salary_currency ?? ''} onChange={(ev) => setDraft10(d => d && ({ ...d, desired_salary_currency: ev.target.value === '' ? null : ev.target.value }))}>
                <option value="">— Not specified —</option>
                {PROFILUX_CURRENCY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={saving10 || !draft10 ? saveBtnDis : saveBtn} disabled={saving10 || !draft10} onClick={handleSave10}>
              {saving10 ? 'Saving…' : 'Save'}
            </button>
            {savedAt10 && <span style={{ color: '#1D9E75', fontSize: 13 }}>Saved</span>}
            {saveError10 && <span style={{ color: '#ff6b6b', fontSize: 13 }}>{saveError10}</span>}
          </div>
        </div>
      )
      case 11: return (
        <div style={grid}>
          <div style={label}>Profile completeness</div><div>{e.profile_completeness}%</div>
          <div style={label}>CV file</div><div style={{ wordBreak: 'break-all', fontSize: 12 }}>{e.cv_meta.cv_url ?? <NotSet />}</div>
          <div style={label}>CV last parsed</div><div>{e.cv_meta.cv_parsed_at ?? <NotSet />}</div>
          <div style={label}>Items to review</div><div>{e.cv_meta.needs_review}</div>
        </div>
      )
      default: return null
    }
  }

  return (
    <div style={wrap}>
      <h1 style={h1Style}>ProfiLux — {SCREEN_TITLES[step]}</h1>
      <div style={sub}>Screen {step} / {TOTAL}</div>
      {renderStep()}
      <div style={navWrap}>
        <button style={step === 1 ? btnDis : btn} disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>← Prev</button>
        <button style={step === TOTAL ? btnDis : btn} disabled={step === TOTAL} onClick={() => setStep(s => Math.min(TOTAL, s + 1))}>Next →</button>
        <span style={{ color: '#666', fontSize: 12, marginLeft: 16 }}>Completeness: {e.profile_completeness}%</span>
      </div>
    </div>
  )
}
