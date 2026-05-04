'use client'

import React, { useEffect, useState } from 'react'
import type { EditorView } from '@/lib/profilux/types'

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

export default function ProfiluxPage() {
  const [editor, setEditor] = useState<EditorView | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)

  useEffect(() => {
    fetch('/api/profilux')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setEditor(data.editor ?? null)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={wrap}>Loading…</div>
  if (error) return <div style={{ ...wrap, color: '#ff6b6b' }}>Error: {error}</div>
  if (!editor) return <div style={wrap}>No editor data.</div>

  const e = editor

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
        <div style={grid}>
          <div style={label}>Job title</div><div>{e.job_title ?? <NotSet />}</div>
          <div style={label}>Current employer</div><div>{e.current_employer ?? <NotSet />}</div>
          <div style={label}>Seniority</div><div>{e.seniority ?? <NotSet />}</div>
          <div style={label}>Years of experience</div><div>{e.total_years_experience ?? <NotSet />}</div>
        </div>
      )
      case 4: return (
        <div style={grid}>
          <div style={label}>Sectors</div><div>{e.sectors.length ? e.sectors.join(', ') : <NoneSel />}</div>
          <div style={label}>Years in luxury</div><div>{e.years_in_luxury ?? <NotSet />}</div>
          <div style={label}>Product categories</div><div>{e.product_categories.length ? e.product_categories.join(', ') : <NoneSel />}</div>
          <div style={label}>Areas of expertise</div><div>{e.expertise_tags.length ? e.expertise_tags.join(', ') : <NoneSel />}</div>
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
            <div style={label}>University</div><div>{e.university ?? <NotSet />}</div>
            <div style={label}>Field of study</div><div>{e.field_of_study ?? <NotSet />}</div>
            <div style={label}>Graduation year</div><div>{e.graduation_year ?? <NotSet />}</div>
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
        <div style={grid}>
          <div style={label}>Clienteling experience</div><div>{e.clienteling_experience ? 'Yes' : <NotSet />}</div>
          <div style={label}>Clienteling background</div><div>{e.clienteling_description ?? <NotSet />}</div>
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
        <div style={grid}>
          <div style={label}>Target compensation (min)</div><div>{e.desired_salary_min ?? <NotSet />}</div>
          <div style={label}>Target compensation (max)</div><div>{e.desired_salary_max ?? <NotSet />}</div>
          <div style={label}>Currency</div><div>{e.desired_salary_currency ?? <NotSet />}</div>
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
