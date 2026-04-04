'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import dynamic from 'next/dynamic'
import MediaLibraryModal from '@/components/admin/MediaLibraryModal'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

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
  const [coverModalOpen, setCoverModalOpen] = useState(false)
  const [slug, setSlug] = useState('')
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
          setSlug(article.slug || '')
          setForm({
            title: article.title || '',
            category: article.category || 'bloglux',
            author_name: article.author_name || 'JOBLUX Editorial',
            excerpt: article.excerpt || '',
            tags: (article.tags || []).join(', '),
            content: article.content || '',
            cover_image: article.cover_image || article.cover_image_url || '',
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
    const plainContent = form.content.replace(/<[^>]*>/g, '').trim()
    if (!form.title.trim() || !plainContent) return
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
    <div className="min-h-screen bg-[#f5f5f5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {slug && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <a
              href={`/bloglux/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: '#666', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#111')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            >
              Preview on site &rarr;
            </a>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <input
            type="text"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Article title..."
            style={{
              width: '100%', border: 'none', outline: 'none', fontSize: 28,
              fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 400,
              color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #e8e8e8',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Category</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e8e8', outline: 'none', background: '#fff', color: '#1a1a1a' }}
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
              style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e8e8', outline: 'none', color: '#1a1a1a' }}
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
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e8e8', outline: 'none', resize: 'none', color: '#1a1a1a' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Tags (comma separated)</label>
          <input
            type="text"
            value={form.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="luxury, fashion, career"
            style={{ width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e8e8', outline: 'none', color: '#1a1a1a' }}
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Cover Image URL (optional)</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={form.cover_image}
              onChange={(e) => handleChange('cover_image', e.target.value)}
              placeholder="https://..."
              style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: '1px solid #e8e8e8', outline: 'none', color: '#1a1a1a' }}
            />
            <button
              onClick={() => setCoverModalOpen(true)}
              type="button"
              style={{
                padding: '10px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                textTransform: 'uppercase' as const, border: '1px solid #1a1a1a',
                background: '#fff', color: '#1a1a1a', cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Browse Library
            </button>
          </div>
          {form.cover_image && (
            <div style={{ marginTop: 8 }}>
              <img src={form.cover_image} alt="Cover preview" style={{ maxHeight: 120, borderRadius: 4, border: '1px solid #e8e8e8' }} />
            </div>
          )}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#666', marginBottom: 6 }}>Content</label>
          <RichTextEditor
            content={form.content}
            onChange={(html) => handleChange('content', html)}
            placeholder="Write your article here..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e8e8e8', paddingTop: 24 }}>
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
              disabled={saving || !form.title.trim()}
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
              disabled={saving || !form.title.trim()}
              style={{
                padding: '10px 24px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
                textTransform: 'uppercase' as const, border: 'none',
                background: '#1a1a1a', color: '#444', cursor: 'pointer', opacity: saving ? 0.5 : 1,
              }}
            >
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <MediaLibraryModal
        open={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        onSelect={(url) => handleChange('cover_image', url)}
      />
    </div>
  )
}
