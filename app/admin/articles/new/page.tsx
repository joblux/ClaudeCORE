'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRequireAdmin } from '@/lib/auth-hooks'

const CATEGORIES = [
  { value: 'bloglux', label: 'Bloglux' },
  { value: 'interview', label: 'Interview' },
  { value: 'career', label: 'Career' },
  { value: 'markets', label: 'Markets' },
  { value: 'industry', label: 'Industry' },
  { value: 'travel', label: 'Travel' },
  { value: 'salary', label: 'Salary' },
]

type ImportTab = 'write' | 'url' | 'wordpress' | 'csv' | 'paste' | 'markdown'

const TABS: { key: ImportTab; label: string }[] = [
  { key: 'write', label: '\u270d\ufe0f Write' },
  { key: 'url', label: '\ud83d\udd17 URL' },
  { key: 'wordpress', label: '\ud83d\udcc4 WordPress XML' },
  { key: 'csv', label: '\ud83d\udcca CSV' },
  { key: 'paste', label: '\ud83d\udccb Paste Text' },
  { key: 'markdown', label: '\ud83d\udcdd Markdown' },
]

interface WpPost { title: string; content: string; excerpt: string; category: string; selected: boolean }
interface CsvRow { title: string; content: string; excerpt: string; category: string; author_name: string; tags: string; published: string }

const LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: 6 }
const INPUT: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', color: '#1a1a1a' }
const BTN_GOLD: React.CSSProperties = { padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: 'none', background: '#1a1a1a', color: '#a58e28', cursor: 'pointer' }
const BTN_OUTLINE: React.CSSProperties = { padding: '10px 20px', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', border: '1px solid #1a1a1a', background: '#fff', color: '#1a1a1a', cursor: 'pointer' }
const PANEL: React.CSSProperties = { background: '#fafaf5', border: '1px solid #e8e2d8', padding: 24, marginBottom: 32 }

export default function NewArticlePage() {
  const { isAdmin, isLoading } = useRequireAdmin()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<ImportTab>('write')
  const [form, setForm] = useState({
    title: '', category: 'bloglux', author_name: 'JOBLUX Editorial',
    excerpt: '', tags: '', content: '', cover_image: '', published: false,
  })

  // Import states
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteCategory, setPasteCategory] = useState('bloglux')
  const [pasteContent, setPasteContent] = useState('')
  const [wpPosts, setWpPosts] = useState<WpPost[]>([])
  const [wpImporting, setWpImporting] = useState(false)
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [csvImporting, setCsvImporting] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ imported: number; errors: string[] } | null>(null)
  const wpFileRef = useRef<HTMLInputElement>(null)
  const csvFileRef = useRef<HTMLInputElement>(null)
  const mdFileRef = useRef<HTMLInputElement>(null)

  const handleChange = (field: string, value: string | boolean) => {
    if (field === 'excerpt' && typeof value === 'string' && value.length > 280) return
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const fillEditor = (data: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...data }))
    setActiveTab('write')
  }

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim() || !form.content.trim()) return
    setSaving(true)
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean)
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, published: publish, tags }),
    })
    if (res.ok) router.push('/admin/articles')
    setSaving(false)
  }

  // ── URL Import ──
  const handleUrlFetch = async () => {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    try {
      const res = await fetch('/api/articles/import/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput }),
      })
      const data = await res.json()
      if (data.error) { setUrlError(data.error); return }
      fillEditor({
        title: data.title || '',
        content: data.content || '',
        excerpt: data.excerpt?.slice(0, 280) || '',
        category: data.category || 'bloglux',
      })
    } catch { setUrlError('Failed to fetch') }
    finally { setUrlLoading(false) }
  }

  // ── WordPress XML ──
  const handleWpParse = () => {
    const file = wpFileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const xml = e.target?.result as string
      const parser = new DOMParser()
      const doc = parser.parseFromString(xml, 'text/xml')
      const items = doc.querySelectorAll('item')
      const posts: WpPost[] = []
      items.forEach((item) => {
        const postType = item.querySelector('post_type')?.textContent
          || item.getElementsByTagNameNS('http://wordpress.org/export/1.2/', 'post_type')[0]?.textContent
          || item.textContent?.match(/<wp:post_type>([^<]+)/)?.[1]
        const status = item.querySelector('status')?.textContent
          || item.getElementsByTagNameNS('http://wordpress.org/export/1.2/', 'status')[0]?.textContent
          || item.textContent?.match(/<wp:status>([^<]+)/)?.[1]
        if (postType === 'post' && status === 'publish') {
          const title = item.querySelector('title')?.textContent || ''
          const encoded = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')[0]?.textContent || ''
          const content = encoded.replace(/<[^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim()
          const excerptEl = item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')
          const excerpt = content.slice(0, 280)
          const cats = item.querySelectorAll('category')
          let category = 'bloglux'
          cats.forEach((c) => { if (c.getAttribute('domain') === 'category') category = c.textContent?.toLowerCase() || 'bloglux' })
          posts.push({ title, content, excerpt, category, selected: true })
        }
      })
      setWpPosts(posts)
    }
    reader.readAsText(file)
  }

  const handleWpImportSelected = () => {
    const first = wpPosts.find((p) => p.selected)
    if (first) fillEditor({ title: first.title, content: first.content, excerpt: first.excerpt, category: first.category })
  }

  const handleWpImportAll = async () => {
    const selected = wpPosts.filter((p) => p.selected)
    if (selected.length === 0) return
    setWpImporting(true)
    setBulkResult(null)
    const res = await fetch('/api/articles/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles: selected.map((p) => ({ title: p.title, content: p.content, excerpt: p.excerpt, category: p.category, published: true })) }),
    })
    const data = await res.json()
    setBulkResult(data)
    setWpImporting(false)
  }

  // ── CSV ──
  const handleCsvParse = () => {
    const file = csvFileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) return
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/"/g, ''))
      const rows: CsvRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].match(/("([^"]|"")*"|[^,]*)/g)?.map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) || []
        const row: Record<string, string> = {}
        headers.forEach((h, j) => { row[h] = vals[j] || '' })
        if (row.title && row.content) {
          rows.push({
            title: row.title, content: row.content, excerpt: row.excerpt || '',
            category: row.category || 'bloglux', author_name: row.author_name || 'JOBLUX Editorial',
            tags: row.tags || '', published: row.published || 'false',
          })
        }
      }
      setCsvRows(rows)
    }
    reader.readAsText(file)
  }

  const handleCsvImportAll = async () => {
    if (csvRows.length === 0) return
    setCsvImporting(true)
    setBulkResult(null)
    const res = await fetch('/api/articles/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articles: csvRows.map((r) => ({
          ...r, published: r.published === 'true',
          tags: r.tags.split(',').map((t) => t.trim()).filter(Boolean),
        })),
      }),
    })
    const data = await res.json()
    setBulkResult(data)
    setCsvImporting(false)
  }

  const downloadCsvTemplate = () => {
    const csv = 'title,content,excerpt,category,author_name,tags,published\n"Example Article","Your article content here. Use double quotes for multi-line.","Brief summary","bloglux","JOBLUX Editorial","luxury, fashion","false"'
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'joblux-articles-template.csv'
    a.click()
  }

  // ── Markdown ──
  const handleMdParse = () => {
    const file = mdFileRef.current?.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      let text = e.target?.result as string
      let title = '', excerpt = '', category = 'bloglux', tags = ''
      // Parse frontmatter
      if (text.startsWith('---')) {
        const end = text.indexOf('---', 3)
        if (end !== -1) {
          const fm = text.slice(3, end)
          text = text.slice(end + 3).trim()
          fm.split('\n').forEach((line) => {
            const [key, ...rest] = line.split(':')
            const val = rest.join(':').trim().replace(/^["']|["']$/g, '')
            if (key.trim() === 'title') title = val
            else if (key.trim() === 'excerpt') excerpt = val
            else if (key.trim() === 'category') category = val
            else if (key.trim() === 'tags') tags = val
          })
        }
      }
      // Convert markdown paragraphs (separated by blank lines) to plain text
      const content = text
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
        .trim()
      if (!title) {
        const firstLine = content.split('\n')[0]
        if (firstLine && firstLine.length < 200) title = firstLine
      }
      fillEditor({ title, content, excerpt: excerpt.slice(0, 280), category, tags })
    }
    reader.readAsText(file)
  }

  if (isLoading || !isAdmin) {
    return <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>Loading...</div>
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#fff', minHeight: '100vh' }}>

      {/* Top bar */}
      <div style={{ borderBottom: '2px solid #1a1a1a', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif", fontWeight: 600, fontSize: 18, color: '#1a1a1a', letterSpacing: 1 }}>JOBLUX</span>
          <span style={{ color: '#ccc', fontSize: 14 }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', letterSpacing: '0.06em', textTransform: 'uppercase' }}>New Article</span>
        </div>
        <Link href="/admin/articles" style={{ fontSize: 12, color: '#a58e28', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
          &larr; Back to Articles
        </Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── IMPORT TABS ──────────────────────── */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e2d8', marginBottom: 24 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 16px', fontSize: 12, fontWeight: 500, background: 'none', border: 'none',
                borderBottom: activeTab === tab.key ? '2px solid #a58e28' : '2px solid transparent',
                color: activeTab === tab.key ? '#1a1a1a' : '#999',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── URL PANEL ──────────────────────── */}
        {activeTab === 'url' && (
          <div style={PANEL}>
            <label style={LABEL}>Article URL</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input type="url" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://joblux.com/article/..." style={{ ...INPUT, flex: 1 }} />
              <button onClick={handleUrlFetch} disabled={urlLoading} style={{ ...BTN_GOLD, opacity: urlLoading ? 0.5 : 1 }}>
                {urlLoading ? 'Fetching...' : 'Fetch Article'}
              </button>
            </div>
            {urlError && <p style={{ fontSize: 12, color: '#cc4444', margin: 0 }}>{urlError}</p>}
            <p style={{ fontSize: 11, color: '#aaa', margin: '8px 0 0' }}>Fetches and extracts title, content and category from any public URL.</p>
          </div>
        )}

        {/* ── WORDPRESS XML PANEL ────────────── */}
        {activeTab === 'wordpress' && (
          <div style={PANEL}>
            <label style={LABEL}>WordPress Export XML</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input ref={wpFileRef} type="file" accept=".xml" style={{ ...INPUT, flex: 1 }} />
              <button onClick={handleWpParse} style={BTN_GOLD}>Parse XML</button>
            </div>
            {wpPosts.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 600, marginBottom: 12 }}>Found {wpPosts.length} published posts:</p>
                <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e8e2d8', marginBottom: 16 }}>
                  {wpPosts.map((post, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderBottom: '1px solid #f0ece4', cursor: 'pointer', fontSize: 13 }}>
                      <input type="checkbox" checked={post.selected} onChange={() => setWpPosts((prev) => prev.map((p, j) => j === i ? { ...p, selected: !p.selected } : p))} />
                      <span style={{ color: '#1a1a1a' }}>{post.title}</span>
                      <span style={{ fontSize: 10, color: '#a58e28', marginLeft: 'auto' }}>{post.category}</span>
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleWpImportSelected} style={BTN_OUTLINE}>Import First Selected</button>
                  <button onClick={handleWpImportAll} disabled={wpImporting} style={{ ...BTN_GOLD, opacity: wpImporting ? 0.5 : 1 }}>
                    {wpImporting ? 'Importing...' : `Import All (${wpPosts.filter((p) => p.selected).length})`}
                  </button>
                </div>
              </div>
            )}
            {bulkResult && (
              <div style={{ marginTop: 12, padding: 12, background: '#fff', border: '1px solid #e8e2d8', fontSize: 12 }}>
                <p style={{ color: '#1a1a1a', fontWeight: 600 }}>{bulkResult.imported} articles imported</p>
                {bulkResult.errors.length > 0 && bulkResult.errors.map((e, i) => <p key={i} style={{ color: '#cc4444', margin: '4px 0 0' }}>{e}</p>)}
              </div>
            )}
          </div>
        )}

        {/* ── CSV PANEL ──────────────────────── */}
        {activeTab === 'csv' && (
          <div style={PANEL}>
            <label style={LABEL}>CSV File</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input ref={csvFileRef} type="file" accept=".csv" style={{ ...INPUT, flex: 1 }} />
              <button onClick={handleCsvParse} style={BTN_GOLD}>Parse CSV</button>
            </div>
            <button onClick={downloadCsvTemplate} style={{ fontSize: 11, color: '#a58e28', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16, textDecoration: 'underline' }}>
              Download CSV template
            </button>
            <p style={{ fontSize: 11, color: '#aaa', marginBottom: 16 }}>Columns: title, content, excerpt, category, author_name, tags, published</p>
            {csvRows.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: '#1a1a1a', fontWeight: 600, marginBottom: 12 }}>Found {csvRows.length} articles:</p>
                <div style={{ overflow: 'auto', border: '1px solid #e8e2d8', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #1a1a1a' }}>
                        {['Title', 'Category', 'Author', 'Published'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: '#888' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f0ece4' }}>
                          <td style={{ padding: '6px 10px', color: '#1a1a1a' }}>{row.title}</td>
                          <td style={{ padding: '6px 10px', color: '#888' }}>{row.category}</td>
                          <td style={{ padding: '6px 10px', color: '#888' }}>{row.author_name}</td>
                          <td style={{ padding: '6px 10px', color: row.published === 'true' ? '#a58e28' : '#ccc' }}>{row.published === 'true' ? 'Yes' : 'No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button onClick={handleCsvImportAll} disabled={csvImporting} style={{ ...BTN_GOLD, opacity: csvImporting ? 0.5 : 1 }}>
                  {csvImporting ? 'Importing...' : `Import All (${csvRows.length})`}
                </button>
              </div>
            )}
            {bulkResult && activeTab === 'csv' && (
              <div style={{ marginTop: 12, padding: 12, background: '#fff', border: '1px solid #e8e2d8', fontSize: 12 }}>
                <p style={{ color: '#1a1a1a', fontWeight: 600 }}>{bulkResult.imported} articles imported</p>
                {bulkResult.errors.length > 0 && bulkResult.errors.map((e, i) => <p key={i} style={{ color: '#cc4444', margin: '4px 0 0' }}>{e}</p>)}
              </div>
            )}
          </div>
        )}

        {/* ── PASTE TEXT PANEL ────────────────── */}
        {activeTab === 'paste' && (
          <div style={PANEL}>
            <label style={LABEL}>Title</label>
            <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} placeholder="Article title" style={{ ...INPUT, marginBottom: 16 }} />
            <label style={LABEL}>Category</label>
            <select value={pasteCategory} onChange={(e) => setPasteCategory(e.target.value)} style={{ ...INPUT, marginBottom: 16, background: '#fff' }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <label style={LABEL}>Content</label>
            <textarea value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} rows={12} placeholder="Paste your article content here..." style={{ ...INPUT, resize: 'vertical', lineHeight: 1.7, marginBottom: 16 }} />
            <button onClick={() => fillEditor({ title: pasteTitle, content: pasteContent, category: pasteCategory, excerpt: pasteContent.slice(0, 280) })} disabled={!pasteTitle.trim() || !pasteContent.trim()} style={{ ...BTN_GOLD, opacity: !pasteTitle.trim() || !pasteContent.trim() ? 0.4 : 1 }}>
              Use This Content
            </button>
          </div>
        )}

        {/* ── MARKDOWN PANEL ─────────────────── */}
        {activeTab === 'markdown' && (
          <div style={PANEL}>
            <label style={LABEL}>Markdown File (.md)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input ref={mdFileRef} type="file" accept=".md" style={{ ...INPUT, flex: 1 }} />
              <button onClick={handleMdParse} style={BTN_GOLD}>Use This File</button>
            </div>
            <p style={{ fontSize: 11, color: '#aaa', margin: '8px 0 0' }}>
              Supports YAML frontmatter (title, excerpt, category, tags between --- markers). Body becomes article content.
            </p>
          </div>
        )}

        {/* ── EDITOR FORM ────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <input
            type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Article title..."
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 28, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, color: '#1a1a1a', padding: '8px 0', borderBottom: '1px solid #e8e2d8' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div>
            <label style={LABEL}>Category</label>
            <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} style={{ ...INPUT, background: '#fff' }}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Author</label>
            <input type="text" value={form.author_name} onChange={(e) => handleChange('author_name', e.target.value)} style={INPUT} />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={LABEL}>Excerpt</label>
            <span style={{ fontSize: 11, color: '#aaa' }}>{form.excerpt.length}/280</span>
          </div>
          <textarea value={form.excerpt} onChange={(e) => handleChange('excerpt', e.target.value)} rows={2} placeholder="Brief summary..." style={{ ...INPUT, resize: 'none' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={LABEL}>Tags (comma separated)</label>
          <input type="text" value={form.tags} onChange={(e) => handleChange('tags', e.target.value)} placeholder="luxury, fashion, career" style={INPUT} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={LABEL}>Cover Image URL (optional)</label>
          <input type="text" value={form.cover_image} onChange={(e) => handleChange('cover_image', e.target.value)} placeholder="https://..." style={INPUT} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={LABEL}>Content</label>
          <textarea
            value={form.content} onChange={(e) => handleChange('content', e.target.value)} rows={20}
            placeholder="Write your article here. Use blank lines between paragraphs."
            style={{ ...INPUT, padding: 16, fontSize: 15, lineHeight: 1.8, resize: 'vertical', color: '#333', fontFamily: "'Playfair Display', Georgia, serif", minHeight: 400 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e8e2d8', paddingTop: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#888', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.published} onChange={(e) => handleChange('published', e.target.checked)} />
            Publish immediately
          </label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => handleSave(false)} disabled={saving || !form.title.trim() || !form.content.trim()} style={{ ...BTN_OUTLINE, opacity: saving ? 0.5 : 1 }}>
              Save Draft
            </button>
            <button onClick={() => handleSave(true)} disabled={saving || !form.title.trim() || !form.content.trim()} style={{ ...BTN_GOLD, opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
