'use client'

import React, { useEffect, useState } from 'react'
import type { EditorView } from '@/lib/profilux/types'

const TOTAL = 11
const SCREEN_TITLES = [
  '', 'Identity', 'Headline', 'Current Position', 'Luxury Fit',
  'Career History', 'Education & Languages', 'Skills & Markets',
  'Clienteling', 'Availability & Targets', 'Salary', 'Confirm',
]

const Null = () => <em style={{ color: '#666' }}>null</em>
const Empty = () => <em style={{ color: '#666' }}>[]</em>

const wrap: React.CSSProperties = { padding: 40, background: '#1a1a1a', color: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }
const h1Style: React.CSSProperties = { fontFamily: 'Playfair Display, serif', fontWeight: 400, fontSize: 28, marginBottom: 8 }
const sub: React.CSSProperties = { color: '#999', fontSize: 13, marginBottom: 24 }
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12, fontSize: 14, lineHeight: 1.6, maxWidth: 900 }
const label: React.CSSProperties = { color: '#999' }
const navWrap: React.CSSProperties = { marginTop: 40, display: 'flex', gap: 12, alignItems: 'center', maxWidth: 900 }
const btn: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid #333', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: 13 }
const btnDis: React.CSSProperties = { ...btn, color: '#555', borderColor: '#222', cursor: 'not-allowed' }
const card: React.CSSProperties = { border: '1px solid #2a2a2a', padding: 16, marginBottom: 8, fontSize: 13 }

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
          <div style={label}>first_name</div><div>{e.first_name ?? <Null />}</div>
          <div style={label}>last_name</div><div>{e.last_name ?? <Null />}</div>
          <div style={label}>city</div><div>{e.city ?? <Null />}</div>
          <div style={label}>country</div><div>{e.country ?? <Null />}</div>
          <div style={label}>phone</div><div>{e.phone ?? <Null />}</div>
          <div style={label}>nationality</div><div>{e.nationality ?? <Null />}</div>
        </div>
      )
      case 2: return (
        <div style={grid}>
          <div style={label}>headline</div><div>{e.headline ?? <Null />}</div>
          <div style={label}>bio</div><div>{e.bio ?? <Null />}</div>
        </div>
      )
      case 3: return (
        <div style={grid}>
          <div style={label}>job_title</div><div>{e.job_title ?? <Null />}</div>
          <div style={label}>current_employer</div><div>{e.current_employer ?? <Null />}</div>
          <div style={label}>seniority</div><div>{e.seniority ?? <Null />}</div>
          <div style={label}>total_years_experience</div><div>{e.total_years_experience ?? <Null />}</div>
        </div>
      )
      case 4: return (
        <div style={grid}>
          <div style={label}>sectors</div><div>{e.sectors.length ? e.sectors.join(', ') : <Empty />}</div>
          <div style={label}>years_in_luxury</div><div>{e.years_in_luxury ?? <Null />}</div>
          <div style={label}>product_categories</div><div>{e.product_categories.length ? e.product_categories.join(', ') : <Empty />}</div>
          <div style={label}>expertise_tags</div><div>{e.expertise_tags.length ? e.expertise_tags.join(', ') : <Empty />}</div>
        </div>
      )
      case 5: return (
        <div style={{ maxWidth: 900 }}>
          {e.experiences.length === 0 && <Empty />}
          {e.experiences.map((exp, i) => (
            <div key={i} style={card}>
              <div><strong>{exp.company ?? 'null'}</strong> — {exp.job_title ?? 'null'}</div>
              <div style={{ color: '#999', marginTop: 4 }}>{exp.city ?? '?'}, {exp.country ?? '?'} · {exp.start_date ?? '?'} → {exp.end_date ?? 'present'}</div>
              {exp.description && <div style={{ color: '#ccc', marginTop: 8 }}>{exp.description}</div>}
            </div>
          ))}
        </div>
      )
      case 6: return (
        <div style={{ maxWidth: 900 }}>
          <div style={grid}>
            <div style={label}>university</div><div>{e.university ?? <Null />}</div>
            <div style={label}>field_of_study</div><div>{e.field_of_study ?? <Null />}</div>
            <div style={label}>graduation_year</div><div>{e.graduation_year ?? <Null />}</div>
          </div>
          <div style={{ marginTop: 24, color: '#999', fontSize: 12 }}>education[]</div>
          {e.education.length === 0 && <Empty />}
          {e.education.map((ed, i) => (
            <div key={i} style={card}>
              <div><strong>{ed.institution ?? 'null'}</strong></div>
              <div style={{ color: '#999', marginTop: 4 }}>{ed.degree ?? '?'} · {ed.field_of_study ?? '?'} · {ed.graduation_year ?? '?'}</div>
            </div>
          ))}
          <div style={{ marginTop: 24, color: '#999', fontSize: 12 }}>languages[]</div>
          {e.languages.length === 0 && <Empty />}
          {e.languages.map((l, i) => (
            <div key={i} style={card}>{l.language} — {l.proficiency ?? 'null'}</div>
          ))}
        </div>
      )
      case 7: return (
        <div style={grid}>
          <div style={label}>market_knowledge</div><div>{e.market_knowledge.length ? e.market_knowledge.join(', ') : <Empty />}</div>
          <div style={label}>key_skills</div><div>{e.key_skills.length ? e.key_skills.join(', ') : <Empty />}</div>
        </div>
      )
      case 8: return (
        <div style={grid}>
          <div style={label}>clienteling_experience</div><div>{String(e.clienteling_experience ?? 'null')}</div>
          <div style={label}>clienteling_description</div><div>{e.clienteling_description ?? <Null />}</div>
        </div>
      )
      case 9: return (
        <div style={grid}>
          <div style={label}>availability</div><div>{e.availability ?? <Null />}</div>
          <div style={label}>desired_locations</div><div>{e.desired_locations.length ? e.desired_locations.join(', ') : <Empty />}</div>
          <div style={label}>desired_departments</div><div>{e.desired_departments.length ? e.desired_departments.join(', ') : <Empty />}</div>
          <div style={label}>desired_contract_types</div><div>{e.desired_contract_types.length ? e.desired_contract_types.join(', ') : <Empty />}</div>
          <div style={label}>open_to_relocation</div><div>{String(e.open_to_relocation ?? 'null')}</div>
          <div style={label}>relocation_preferences</div><div>{e.relocation_preferences ?? <Null />}</div>
        </div>
      )
      case 10: return (
        <div style={grid}>
          <div style={label}>desired_salary_min</div><div>{e.desired_salary_min ?? <Null />}</div>
          <div style={label}>desired_salary_max</div><div>{e.desired_salary_max ?? <Null />}</div>
          <div style={label}>desired_salary_currency</div><div>{e.desired_salary_currency ?? <Null />}</div>
        </div>
      )
      case 11: return (
        <div style={grid}>
          <div style={label}>profile_completeness</div><div>{e.profile_completeness}</div>
          <div style={label}>cv_meta.cv_url</div><div style={{ wordBreak: 'break-all', fontSize: 12 }}>{e.cv_meta.cv_url ?? <Null />}</div>
          <div style={label}>cv_meta.cv_parsed_at</div><div>{e.cv_meta.cv_parsed_at ?? <Null />}</div>
          <div style={label}>cv_meta.needs_review</div><div>{e.cv_meta.needs_review}</div>
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
        <span style={{ color: '#666', fontSize: 12, marginLeft: 16 }}>completeness: {e.profile_completeness}</span>
      </div>
    </div>
  )
}
