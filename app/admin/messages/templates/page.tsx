'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRequireAdmin } from '@/lib/auth-hooks'
import { TEMPLATE_CATEGORIES, MERGE_FIELDS } from '@/types/messaging'
import type { MessageTemplate } from '@/types/messaging'

const allCategories = [
  ...TEMPLATE_CATEGORIES.candidate.map((c) => ({ ...c, type: 'candidate' as const })),
  ...TEMPLATE_CATEGORIES.client.map((c) => ({ ...c, type: 'client' as const })),
]

const SAMPLE_MERGE_DATA: Record<string, string> = {
  '{{candidate_name}}': 'Alexandra Dupont',
  '{{candidate_first_name}}': 'Alexandra',
  '{{opportunity_title}}': 'Regional Director, EMEA',
  '{{maison}}': 'Maison Cartier',
  '{{city}}': 'Paris',
  '{{recruiter_name}}': 'Sophie Laurent',
  '{{client_name}}': 'Henri Beaumont',
  '{{interview_date}}': 'March 28, 2026',
  '{{salary_range}}': '120,000 - 150,000 EUR',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface TemplateForm {
  name: string
  category: string
  participant_type: 'candidate' | 'client'
  subject: string
  body: string
}

const emptyForm: TemplateForm = {
  name: '',
  category: '',
  participant_type: 'candidate',
  subject: '',
  body: '',
}

export default function AdminMessageTemplatesPage() {
  const { isAdmin, isLoading: authLoading } = useRequireAdmin()
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState<TemplateForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const fetchTemplates = useCallback(() => {
    setLoading(true)
    fetch('/api/messages/templates')
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    fetchTemplates()
  }, [isAdmin, fetchTemplates])

  const startCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setIsCreating(true)
    setPreviewHtml(null)
  }

  const startEdit = (template: MessageTemplate) => {
    setIsCreating(false)
    setEditingId(template.id)
    setForm({
      name: template.name,
      category: template.category,
      participant_type: template.participant_type,
      subject: template.subject,
      body: template.body,
    })
    setPreviewHtml(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setForm(emptyForm)
    setPreviewHtml(null)
  }

  const insertMergeField = (field: string) => {
    const textarea = bodyRef.current
    if (!textarea) {
      setForm((f) => ({ ...f, body: f.body + field }))
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const before = form.body.slice(0, start)
    const after = form.body.slice(end)
    const newBody = before + field + after
    setForm((f) => ({ ...f, body: newBody }))
    // Restore cursor position after the inserted field
    requestAnimationFrame(() => {
      textarea.selectionStart = textarea.selectionEnd = start + field.length
      textarea.focus()
    })
  }

  const handlePreview = () => {
    let rendered = form.body
    for (const [key, val] of Object.entries(SAMPLE_MERGE_DATA)) {
      rendered = rendered.replaceAll(key, val)
    }
    setPreviewHtml(rendered)
  }

  const handleSave = async () => {
    if (!form.name || !form.category || !form.subject || !form.body) return
    setSaving(true)
    try {
      const url = editingId
        ? `/api/messages/templates/${editingId}`
        : '/api/messages/templates'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        cancelEdit()
        fetchTemplates()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This action cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/messages/templates/${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (editingId === id) cancelEdit()
        fetchTemplates()
      }
    } finally {
      setDeleting(null)
    }
  }

  // Group templates by category
  const grouped = templates.reduce<Record<string, MessageTemplate[]>>((acc, t) => {
    const key = t.category
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})

  const getCategoryLabel = (key: string): string => {
    const found = allCategories.find((c) => c.key === key)
    return found ? found.label : key
  }

  const getCategoryType = (key: string): string => {
    const found = allCategories.find((c) => c.key === key)
    return found ? found.type : 'candidate'
  }

  if (authLoading || !isAdmin) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  const isEditorOpen = isCreating || editingId !== null

  return (
    <div className="min-h-screen bg-[#0d1117]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#a58e28', margin: '0 0 6px 0' }}>
              Template Library
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Message Templates</h1>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              {templates.length} {templates.length === 1 ? 'template' : 'templates'}
            </p>
          </div>
          <button
            onClick={startCreate}
            disabled={isEditorOpen}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isEditorOpen ? '#ccc' : '#1a1a1a', color: isEditorOpen ? '#888' : '#a58e28',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
              padding: '10px 20px', border: 'none', cursor: isEditorOpen ? 'default' : 'pointer',
            }}
          >
            + New Template
          </button>
        </div>

        {/* Editor */}
        {isEditorOpen && (
          <div style={{
            border: '1px solid #e8e2d8', padding: 24, marginBottom: 32, background: '#faf9f6',
          }}>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#a58e28', margin: '0 0 16px 0' }}>
              {editingId ? 'Edit Template' : 'New Template'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Template Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. First Contact - Luxury Retail"
                  style={inputStyle}
                />
              </div>

              {/* Participant type */}
              <div>
                <label style={labelStyle}>Participant Type</label>
                <select
                  value={form.participant_type}
                  onChange={(e) => setForm((f) => ({ ...f, participant_type: e.target.value as 'candidate' | 'client', category: '' }))}
                  style={inputStyle}
                >
                  <option value="candidate">Candidate</option>
                  <option value="client">Client</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Category */}
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="">Select category...</option>
                  <optgroup label="Candidate">
                    {TEMPLATE_CATEGORIES.candidate.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Client">
                    {TEMPLATE_CATEGORIES.client.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label style={labelStyle}>Subject Line</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="e.g. An exciting opportunity at {{maison}}"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Body */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Message Body</label>
              <textarea
                ref={bodyRef}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder="Write your template message here. Use merge fields below to personalise."
                style={{ ...inputStyle, minHeight: 200, resize: 'vertical' }}
              />
            </div>

            {/* Merge fields */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Merge Fields (click to insert)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {MERGE_FIELDS.map((field) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => insertMergeField(field)}
                    style={{
                      background: '#1a1a1a', color: '#a58e28', border: 'none',
                      padding: '5px 12px', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                      letterSpacing: '0.04em', fontFamily: 'monospace',
                    }}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {previewHtml !== null && (
              <div style={{
                background: '#fff', border: '1px solid #e8e2d8', padding: 20, marginBottom: 20,
                fontSize: 13, color: '#1a1a1a', lineHeight: 1.7, whiteSpace: 'pre-wrap',
              }}>
                <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#a58e28', margin: '0 0 12px 0' }}>
                  Preview (with sample data)
                </p>
                {previewHtml}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.category || !form.subject || !form.body}
                style={{
                  background: saving ? '#888' : '#1a1a1a', color: '#a58e28',
                  border: 'none', padding: '10px 24px', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: saving ? 'default' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>

              <button
                onClick={handlePreview}
                style={{
                  background: '#fff', color: '#1a1a1a', border: '1px solid #e8e2d8',
                  padding: '10px 24px', fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer',
                }}
              >
                Preview
              </button>

              <button
                onClick={cancelEdit}
                style={{
                  background: 'transparent', color: '#888', border: 'none',
                  padding: '10px 16px', fontSize: 12, cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              {editingId && (
                <button
                  onClick={() => handleDelete(editingId)}
                  disabled={deleting === editingId}
                  style={{
                    marginLeft: 'auto', background: 'transparent', color: '#d32f2f',
                    border: '1px solid #d32f2f', padding: '10px 20px', fontSize: 11,
                    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                    cursor: deleting === editingId ? 'default' : 'pointer',
                  }}
                >
                  {deleting === editingId ? 'Deleting...' : 'Delete Template'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Template list */}
        {loading ? (
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', padding: 40 }}>Loading templates...</p>
        ) : templates.length === 0 && !isEditorOpen ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: 14, color: '#888', marginBottom: 12 }}>No templates yet.</p>
            <button
              onClick={startCreate}
              style={{
                background: '#1a1a1a', color: '#a58e28', border: 'none',
                padding: '10px 24px', fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase' as const, cursor: 'pointer',
              }}
            >
              Create Your First Template
            </button>
          </div>
        ) : (
          Object.entries(grouped).map(([categoryKey, categoryTemplates]) => (
            <div key={categoryKey} style={{ marginBottom: 28 }}>
              {/* Category header */}
              <div style={{ borderTop: '2px solid #a58e28', paddingTop: 10, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                    {getCategoryLabel(categoryKey)}
                  </h3>
                  <span style={{
                    fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const,
                    padding: '2px 8px', background: getCategoryType(categoryKey) === 'client' ? '#f0ece4' : '#1a1a1a',
                    color: getCategoryType(categoryKey) === 'client' ? '#888' : '#a58e28',
                  }}>
                    {getCategoryType(categoryKey)}
                  </span>
                </div>
              </div>

              {/* Templates in this category */}
              {categoryTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => {
                    if (editingId !== template.id && !isCreating) startEdit(template)
                  }}
                  style={{
                    border: editingId === template.id ? '1px solid #a58e28' : '1px solid #f0ece4',
                    padding: '14px 18px', marginBottom: 8, cursor: 'pointer',
                    background: editingId === template.id ? '#faf9f6' : '#fff',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', flex: 1 }}>
                      {template.name}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                      padding: '2px 8px', background: '#f5f4f0', color: '#888',
                    }}>
                      {getCategoryLabel(template.category)}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                      padding: '2px 8px',
                      background: template.participant_type === 'client' ? '#f0ece4' : '#1a1a1a',
                      color: template.participant_type === 'client' ? '#888' : '#a58e28',
                    }}>
                      {template.participant_type}
                    </span>
                    <span style={{ fontSize: 11, color: '#aaa' }}>
                      {formatDate(template.updated_at)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, color: '#888', margin: '6px 0 0 0',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {template.body.split('\n')[0].slice(0, 120)}
                  </p>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Shared styles
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 13,
  border: '1px solid #e8e2d8',
  background: '#fff',
  color: '#1a1a1a',
  fontFamily: 'Inter, system-ui, sans-serif',
  boxSizing: 'border-box',
}
