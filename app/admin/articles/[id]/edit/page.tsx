'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

const CATEGORIES = [
  { value: 'industry-news', label: 'Industry News' },
  { value: 'career-intelligence', label: 'Career Intelligence' },
  { value: 'maison-profiles', label: 'Maison Profiles' },
  { value: 'salary-compensation', label: 'Salary & Compensation' },
  { value: 'interview-insights', label: 'Interview Insights' },
  { value: 'market-trends', label: 'Market Trends' },
  { value: 'lifestyle-culture', label: 'Lifestyle & Culture' },
  { value: 'joblux-view', label: 'The JOBLUX View' },
]

export default function EditArticlePage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: 'bloglux',
    author_name: 'JOBLUX Editorial',
    excerpt: '',
    tags: '',
    content: '',
    cover_image: '',
    published: false,
  })

  useEffect(() => {
    if (!isAdmin) return
    fetch('/api/articles')
      .then((r) => r.json())
      .then((data) => {
        const article = data.articles?.find((a: { id: string }) => a.id === id)
        if (article) {
          setForm({
            title: article.title || '',
            category: article.category || 'bloglux',
            author_name: article.author_name || 'JOBLUX Editorial',
            excerpt: article.excerpt || '',
            tags: (article.tags || []).join(', '),
            content: article.content || '',
            cover_image: article.cover_image || '',
            published: !!article.published,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [isAdmin, id])

  const handleChange = (field: string, value: string | boolean) => {
    if (field === 'excerpt' && typeof value === 'string' && value.length > 280) return
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, published: publish, tags }),
    })
    if (res.ok) {
      router.push('/admin/articles')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this article permanently? This cannot be undone.')) return
    const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin/articles')
    }
  }

  if (isLoading || !isAdmin || loading) {
    return (
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>

      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", fontWeight: 600, fontSize: 18, color: '#1a1a1a', letterSpacing: 1 }}>JOBLUX</span>
          <span style={{ color: '#ccc', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>Edit Article</span>
        </div>
        <Link href="/admin/articles" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 500 }}>
          &larr; Back to Articles
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Article title..."
            style={{
              width: '100%', border: 'none', outline: 'none', fontSize: 28,
              fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400,
              color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #e8e2d8',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', background: '#fff', color: '#1a1a1a' }}
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Author</label>
            <input
              type="text"
              value={form.author_name}
              onChange={(e) => handleChange('author_name', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', color: '#1a1a1a' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666' }}>Excerpt</label>
            <span style={{ fontSize: 11, color: '#aaa' }}>{form.excerpt.length}/280</span>
          </div>
          <textarea
            value={form.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            rows={2}
            placeholder="Brief summary..."
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', resize: 'none', color: '#1a1a1a' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="luxury, fashion, career"
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', color: '#1a1a1a' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Cover Image URL (optional)</label>
          <input
            type="text"
            value={form.cover_image}
            onChange={(e) => handleChange('cover_image', e.target.value)}
            placeholder="https://..."
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', color: '#1a1a1a' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Content</label>
          <textarea
            value={form.content}
            onChange={(e) => handleChange('content', e.target.value)}
            rows={20}
            placeholder="Write your article here. Use blank lines between paragraphs."
            style={{ width: '100%', padding: '16px', fontSize: 15, lineHeight: 1.8, border: '1px solid #e8e2d8', outline: 'none', resize: 'vertical', color: '#333', fontFamily: "'Playfair Display', Georgia, serif" }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e8e2d8', paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published} onChange={(e) => handleChange('published', e.target.checked)} />
              Published
            </label>
            <button
              onClick={handleDelete}
              style={{ fontSize: 11, color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}
            >
              Delete Article
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleSave(false)}
              disabled={saving || !form.title.trim() || !form.content.trim()}
              style={{
                padding: '10px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, border: '1px solid #1a1a1a',
                background: '#fff', color: '#1a1a1a', cursor: 'pointer', opacity: saving ? 0.5 : 1,
              }}
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !form.title.trim() || !form.content.trim()}
              style={{
                padding: '10px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, border: 'none',
                background: '#1a1a1a', color: '#a58e28', cursor: 'pointer', opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
