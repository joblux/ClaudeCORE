'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAdmin } from '@/lib/auth-hooks'
import sanitizeHtml from 'sanitize-html'
import dynamic from 'next/dynamic'

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
    title: '', category: 'industry-news', author_name: 'Mohammed M\'zaour',
    excerpt: '', tags: '', content: '', cover_image: '', published: false,
    hero_image_url: '', hero_image_alt: '', meta_description: '', is_featured: false,
    author_title: 'Founder, JOBLUX',
  })

  // Import states
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteCategory, setPasteCategory] = useState('industry-news')
  const [pasteContent, setPasteContent] = useState('')
  const [pasteHtml, setPasteHtml] = useState('')
  const [pasteImages, setPasteImages] = useState<Array<{ url: string; index: number; alt: string }>>([])
  const [pasteMode, setPasteMode] = useState<'empty' | 'preview'>('empty')
  const [imageUploading, setImageUploading] = useState(false)
  const [imageProgress, setImageProgress] = useState('')
  const [imageErrors, setImageErrors] = useState<string[]>([])
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

  // ── Smart Paste Handler ──
  const handleSmartPaste = useCallback((e: React.ClipboardEvent) => {
    const html = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')

    if (html && html.includes('<')) {
      e.preventDefault()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // Extract title
      const title = doc.querySelector('h1')?.textContent?.trim()
        || doc.querySelector('h2')?.textContent?.trim()
        || ''

      // Extract images (skip icons, logos, tiny images, data URIs)
      const imgs = Array.from(doc.querySelectorAll('img'))
        .map((img, i) => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || ''
          // Try srcset for largest
          const srcset = img.getAttribute('srcset')
          let bestSrc = src
          if (srcset) {
            const parts = srcset.split(',').map(s => s.trim()).filter(Boolean)
            const last = parts[parts.length - 1]?.split(' ')[0]
            if (last) bestSrc = last
          }
          return { url: bestSrc, alt: img.alt || '', index: i }
        })
        .filter(img => {
          if (!img.url || img.url.startsWith('data:')) return false
          const lc = img.url.toLowerCase()
          if (lc.includes('logo') || lc.includes('icon') || lc.includes('avatar') || lc.includes('sprite') || lc.includes('pixel') || lc.includes('tracking')) return false
          return true
        })

      // Sanitize HTML
      const clean = sanitizeHtml(doc.body.innerHTML, {
        allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'br', 'figure', 'figcaption'],
        allowedAttributes: {
          a: ['href'],
          img: ['src', 'alt', 'data-src'],
        },
        allowedSchemes: ['http', 'https'],
      })

      setPasteTitle(title)
      setPasteHtml(clean)
      setPasteImages(imgs)
      setPasteContent(doc.body.textContent?.trim() || '')
      setPasteMode('preview')
    } else {
      // Plain text — let normal paste happen, just update state
      setPasteContent(plain)
      setPasteMode('preview')
    }
  }, [])

  const handleImportWithImages = async () => {
    setImageUploading(true)
    setImageErrors([])

    let processedHtml = pasteHtml
    const slug = pasteTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'import'
    let coverImage = ''

    if (pasteImages.length > 0) {
      setImageProgress(`Uploading images... 0/${pasteImages.length}`)

      try {
        const res = await fetch('/api/admin/upload-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: pasteImages, slug }),
        })
        const data = await res.json()

        if (data.results) {
          let uploaded = 0
          const errors: string[] = []

          for (const result of data.results) {
            if (result.success && result.originalUrl && result.newUrl) {
              // Replace all occurrences of the original URL
              processedHtml = processedHtml.split(result.originalUrl).join(result.newUrl)
              uploaded++
              if (!coverImage) coverImage = result.newUrl
            } else if (!result.success) {
              errors.push(result.error || 'Unknown error')
            }
          }

          setImageProgress(`${uploaded}/${pasteImages.length} images uploaded`)
          if (errors.length > 0) {
            setImageErrors([`${errors.length} image(s) could not be imported`])
          }
        }
      } catch (err: any) {
        setImageErrors([err.message || 'Upload failed'])
      }
    }

    // Extract plain text excerpt from content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = processedHtml
    const plainExcerpt = tempDiv.textContent?.trim().slice(0, 280) || ''

    fillEditor({
      title: pasteTitle,
      content: processedHtml,
      category: pasteCategory,
      excerpt: plainExcerpt,
      cover_image: coverImage,
      hero_image_url: coverImage,
    })

    setImageUploading(false)
    setPasteMode('empty')
    setPasteHtml('')
    setPasteImages([])
    setPasteContent('')
    setPasteTitle('')
  }

  const handleImportTextOnly = () => {
    fillEditor({
      title: pasteTitle,
      content: pasteContent,
      category: pasteCategory,
      excerpt: pasteContent.slice(0, 280),
    })
    setPasteMode('empty')
    setPasteHtml('')
    setPasteImages([])
    setPasteContent('')
    setPasteTitle('')
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
    <div className="min-h-screen bg-[#fafaf5]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

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
            {pasteMode === 'empty' ? (
              <>
                <label style={LABEL}>Paste Article Content</label>
                <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
                  Copy content from any website (Cmd+A then Cmd+C), then paste here. Images will be detected automatically.
                </p>
                <div
                  contentEditable
                  onPaste={handleSmartPaste}
                  style={{
                    ...INPUT,
                    minHeight: 200,
                    resize: 'vertical',
                    lineHeight: 1.7,
                    overflow: 'auto',
                    background: '#fff',
                    cursor: 'text',
                  }}
                  suppressContentEditableWarning
                />
              </>
            ) : (
              <>
                {/* Preview after paste */}
                <label style={LABEL}>Title</label>
                <input type="text" value={pasteTitle} onChange={(e) => setPasteTitle(e.target.value)} placeholder="Article title" style={{ ...INPUT, marginBottom: 16 }} />
                <label style={LABEL}>Category</label>
                <select value={pasteCategory} onChange={(e) => setPasteCategory(e.target.value)} style={{ ...INPUT, marginBottom: 16, background: '#fff' }}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                {pasteImages.length > 0 && (
                  <div style={{ padding: '10px 14px', background: '#f5f0e0', borderRadius: 6, marginBottom: 16, fontSize: 13, color: '#8a7622' }}>
                    Found {pasteImages.length} image{pasteImages.length > 1 ? 's' : ''} from external source
                  </div>
                )}

                <label style={LABEL}>Content Preview</label>
                <div
                  style={{ ...INPUT, maxHeight: 300, overflow: 'auto', lineHeight: 1.7, marginBottom: 16, background: '#fff' }}
                  dangerouslySetInnerHTML={{ __html: pasteHtml || pasteContent.replace(/\n/g, '<br>') }}
                />

                {imageProgress && (
                  <p style={{ fontSize: 12, color: '#a58e28', marginBottom: 12 }}>{imageProgress}</p>
                )}
                {imageErrors.map((err, i) => (
                  <p key={i} style={{ fontSize: 12, color: '#cc4444', marginBottom: 8 }}>{err}</p>
                ))}

                <div style={{ display: 'flex', gap: 12 }}>
                  {pasteHtml && pasteImages.length > 0 && (
                    <button
                      onClick={handleImportWithImages}
                      disabled={imageUploading || !pasteTitle.trim()}
                      style={{ ...BTN_GOLD, background: '#a58e28', color: '#fff', opacity: imageUploading || !pasteTitle.trim() ? 0.5 : 1 }}
                    >
                      {imageUploading ? 'Uploading...' : 'Import with Images'}
                    </button>
                  )}
                  <button
                    onClick={handleImportTextOnly}
                    disabled={!pasteTitle.trim() || !(pasteContent.trim() || pasteHtml.trim())}
                    style={{ ...BTN_OUTLINE, opacity: !pasteTitle.trim() ? 0.4 : 1 }}
                  >
                    {pasteHtml ? 'Import Text Only' : 'Use This Content'}
                  </button>
                  <button
                    onClick={() => { setPasteMode('empty'); setPasteHtml(''); setPasteImages([]); setPasteContent(''); setPasteTitle('') }}
                    style={{ ...BTN_OUTLINE, color: '#999', borderColor: '#ddd' }}
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
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
          <RichTextEditor
            content={form.content}
            onChange={(html) => handleChange('content', html)}
            placeholder="Write your article here..."
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
