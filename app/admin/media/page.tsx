'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface MediaItem {
  id: string
  filename: string
  original_filename: string
  file_url: string
  thumbnail_url: string | null
  file_size: number | null
  mime_type: string | null
  width: number | null
  height: number | null
  alt_text: string | null
  caption: string | null
  tags: string[]
  source: string
  category: string | null
  brand_name: string | null
  photographer_name: string | null
  unsplash_attribution: any
  created_at: string
}

const CATEGORIES = ['article', 'brand', 'signal', 'event', 'escape', 'editorial', 'general']
const FILE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Documents' },
]
const SOURCES = [
  { value: '', label: 'All Sources' },
  { value: 'upload', label: 'Upload' },
  { value: 'unsplash', label: 'Unsplash' },
]
const ORIENTATIONS = [
  { value: '', label: 'All Orientations' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'square', label: 'Square' },
]
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'largest', label: 'Largest file' },
]

function formatBytes(bytes: number | null) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileKind(mime: string | null): 'image' | 'video' | 'audio' | 'document' {
  if (!mime) return 'document'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

// Inline SVG icons for non-image media
function VideoIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}
function AudioIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </svg>
  )
}
function FileIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

const INPUT: React.CSSProperties = { padding: '7px 10px', fontSize: 12, border: '1px solid #e8e8e8', outline: 'none', color: '#111', background: '#fff', borderRadius: 3 }
const SELECT: React.CSSProperties = { ...INPUT, appearance: 'auto' as any }
const LABEL: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888', marginBottom: 4 }
const BTN: React.CSSProperties = { padding: '7px 14px', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid #e8e8e8', background: '#fff', color: '#111', cursor: 'pointer', borderRadius: 3 }
const BTN_PRIMARY: React.CSSProperties = { ...BTN, background: '#111', color: '#fff', borderColor: '#111' }
const BTN_DANGER: React.CSSProperties = { ...BTN, color: '#c44', borderColor: '#c44' }

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<string[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [fileType, setFileType] = useState('')
  const [source, setSource] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [orientation, setOrientation] = useState('')
  const [sort, setSort] = useState('newest')

  // Detail panel
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [editAlt, setEditAlt] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  // Upload
  const [uploadStep, setUploadStep] = useState<'idle' | 'form'>('idle')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadAlt, setUploadAlt] = useState('')
  const [uploadTags, setUploadTags] = useState('')
  const [uploadCategory, setUploadCategory] = useState('general')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const limit = 24
  const totalPages = Math.ceil(total / limit)
  const hasFilters = search || fileType || source || category || brand || orientation

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit), sort })
    if (search) params.set('search', search)
    if (fileType) params.set('fileType', fileType)
    if (source) params.set('source', source)
    if (category) params.set('category', category)
    if (brand) params.set('brand', brand)
    if (orientation) params.set('orientation', orientation)
    try {
      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search, fileType, source, category, brand, orientation, sort])

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/media?distinct=brands')
      const data = await res.json()
      setBrands(data.brands || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchMedia() }, [fetchMedia])
  useEffect(() => { fetchBrands() }, [fetchBrands])

  // --- Detail panel actions ---
  const openDetail = (item: MediaItem) => {
    setSelected(item)
    setEditAlt(item.alt_text || '')
    setEditTags((item.tags || []).join(', '))
    setEditCategory(item.category || 'general')
    setCopied(false)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    await fetch('/api/media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selected.id,
        alt_text: editAlt,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        category: editCategory,
      }),
    })
    setSaving(false)
    setSelected(null)
    fetchMedia()
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!confirm('Delete this file permanently? This cannot be undone.')) return
    await fetch(`/api/media?id=${selected.id}`, { method: 'DELETE' })
    setSelected(null)
    fetchMedia()
  }

  const handleCopyUrl = () => {
    if (!selected) return
    navigator.clipboard.writeText(selected.file_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- Upload ---
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadFile(files[0])
    setUploadAlt('')
    setUploadTags('')
    setUploadCategory('general')
    setUploadStep('form')
  }

  const handleUploadSubmit = async () => {
    if (!uploadFile) return
    setUploading(true)
    const form = new FormData()
    form.append('file', uploadFile)
    if (uploadAlt) form.append('alt_text', uploadAlt)
    if (uploadTags) form.append('tags', uploadTags)
    if (uploadCategory) form.append('category', uploadCategory)
    await fetch('/api/media', { method: 'POST', body: form })
    setUploading(false)
    setUploadStep('idle')
    setUploadFile(null)
    fetchMedia()
  }

  const cancelUpload = () => {
    setUploadStep('idle')
    setUploadFile(null)
  }

  // --- Thumbnail renderer ---
  const renderThumb = (item: MediaItem) => {
    const kind = getFileKind(item.mime_type)
    if (kind === 'image') {
      return (
        <img
          src={item.thumbnail_url || item.file_url}
          alt={item.alt_text || item.filename}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
        />
      )
    }
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e8e8' }}>
        {kind === 'video' && <VideoIcon />}
        {kind === 'audio' && <AudioIcon />}
        {kind === 'document' && <FileIcon />}
      </div>
    )
  }

  // --- Detail preview ---
  const renderPreview = (item: MediaItem) => {
    const kind = getFileKind(item.mime_type)
    if (kind === 'image') {
      return <img src={item.file_url} alt={item.alt_text || item.filename} style={{ width: '100%', maxHeight: 300, objectFit: 'contain', background: '#f5f5f5', borderRadius: 3 }} />
    }
    if (kind === 'video') {
      return <video src={item.file_url} controls style={{ width: '100%', maxHeight: 300, background: '#000', borderRadius: 3 }} />
    }
    if (kind === 'audio') {
      return (
        <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 3, textAlign: 'center' }}>
          <AudioIcon />
          <audio src={item.file_url} controls style={{ width: '100%', marginTop: 12 }} />
        </div>
      )
    }
    return (
      <div style={{ padding: 24, background: '#f5f5f5', borderRadius: 3, textAlign: 'center' }}>
        <FileIcon />
        <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>{item.mime_type || 'Document'}</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Main content */}
      <div style={{ flex: 1, padding: '24px 28px', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: '#111', margin: 0 }}>Media Library</h1>
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
              {hasFilters ? `${total} result${total !== 1 ? 's' : ''} (filtered)` : `${total} file${total !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*,audio/*,.pdf"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files)}
            />
            <button onClick={() => fileRef.current?.click()} style={BTN_PRIMARY}>Upload</button>
          </div>
        </div>

        {/* Upload form */}
        {uploadStep === 'form' && uploadFile && (
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>
              Upload: {uploadFile.name} <span style={{ fontWeight: 400, color: '#888' }}>({formatBytes(uploadFile.size)})</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={LABEL}>Alt text</label>
                <input value={uploadAlt} onChange={e => setUploadAlt(e.target.value)} placeholder="Describe the file..." style={{ ...INPUT, width: '100%' }} />
              </div>
              <div>
                <label style={LABEL}>Tags (comma separated)</label>
                <input value={uploadTags} onChange={e => setUploadTags(e.target.value)} placeholder="luxury, fashion" style={{ ...INPUT, width: '100%' }} />
              </div>
              <div>
                <label style={LABEL}>Category</label>
                <select value={uploadCategory} onChange={e => setUploadCategory(e.target.value)} style={{ ...SELECT, width: '100%' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleUploadSubmit} disabled={uploading} style={{ ...BTN_PRIMARY, opacity: uploading ? 0.5 : 1 }}>
                {uploading ? 'Uploading...' : 'Save'}
              </button>
              <button onClick={cancelUpload} style={BTN}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20, alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 200px', maxWidth: 240 }}>
            <input
              type="text"
              placeholder="Search filename, alt, photographer..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ ...INPUT, width: '100%' }}
            />
          </div>
          <select value={fileType} onChange={e => { setFileType(e.target.value); setPage(1) }} style={{ ...SELECT, width: 110 }}>
            {FILE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={source} onChange={e => { setSource(e.target.value); setPage(1) }} style={{ ...SELECT, width: 110 }}>
            {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1) }} style={{ ...SELECT, width: 110 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          {brands.length > 0 && (
            <select value={brand} onChange={e => { setBrand(e.target.value); setPage(1) }} style={{ ...SELECT, width: 130 }}>
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <select value={orientation} onChange={e => { setOrientation(e.target.value); setPage(1) }} style={{ ...SELECT, width: 130 }}>
            {ORIENTATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }} style={{ ...SELECT, width: 110 }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); setFileType(''); setSource(''); setCategory(''); setBrand(''); setOrientation(''); setPage(1) }}
              style={{ ...BTN, fontSize: 10, padding: '6px 10px', color: '#888' }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '1', background: '#e8e8e8', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 13 }}>
            {hasFilters ? 'No files match your filters' : 'No media yet — upload files above'}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {items.map(item => (
                <button
                  key={item.id}
                  onClick={() => openDetail(item)}
                  style={{
                    padding: 0, border: selected?.id === item.id ? '2px solid #111' : '1px solid #e8e8e8',
                    borderRadius: 4, background: '#fff', cursor: 'pointer', overflow: 'hidden', textAlign: 'left',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <div style={{ aspectRatio: '1', position: 'relative', overflow: 'hidden' }}>
                    {renderThumb(item)}
                  </div>
                  <div style={{ padding: '6px 8px', borderTop: '1px solid #e8e8e8' }}>
                    <div style={{ fontSize: 11, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.original_filename}
                    </div>
                    <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>
                      {item.source}{item.category && item.category !== 'general' ? ` / ${item.category}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ ...BTN, opacity: page === 1 ? 0.3 : 1 }}>Previous</button>
                <span style={{ fontSize: 11, color: '#888' }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ ...BTN, opacity: page === totalPages ? 0.3 : 1 }}>Next</button>
              </div>
            )}
          </>
        )}

        <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
      </div>

      {/* Detail panel */}
      {selected && (
        <div style={{ width: 340, borderLeft: '1px solid #e8e8e8', background: '#fff', padding: 20, overflow: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Details</span>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888', padding: 0 }}>&times;</button>
          </div>

          {/* Preview */}
          <div style={{ marginBottom: 16 }}>
            {renderPreview(selected)}
          </div>

          {/* Info rows */}
          <div style={{ fontSize: 11, color: '#888', marginBottom: 16, lineHeight: 1.8 }}>
            <div><strong style={{ color: '#111' }}>Filename:</strong> {selected.original_filename}</div>
            {selected.mime_type && <div><strong style={{ color: '#111' }}>Type:</strong> {selected.mime_type}</div>}
            {selected.width && selected.height && <div><strong style={{ color: '#111' }}>Dimensions:</strong> {selected.width} &times; {selected.height}</div>}
            <div><strong style={{ color: '#111' }}>Size:</strong> {formatBytes(selected.file_size)}</div>
            <div><strong style={{ color: '#111' }}>Source:</strong> {selected.source}</div>
            {selected.brand_name && <div><strong style={{ color: '#111' }}>Brand:</strong> {selected.brand_name}</div>}
            <div><strong style={{ color: '#111' }}>Uploaded:</strong> {new Date(selected.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
            {selected.photographer_name && <div><strong style={{ color: '#111' }}>Photographer:</strong> {selected.photographer_name}</div>}
            {selected.unsplash_attribution && (
              <div>
                <strong style={{ color: '#111' }}>Unsplash:</strong>{' '}
                Photo by {selected.unsplash_attribution.photographer}
              </div>
            )}
          </div>

          {/* Editable fields */}
          <div style={{ marginBottom: 12 }}>
            <label style={LABEL}>Alt text</label>
            <input value={editAlt} onChange={e => setEditAlt(e.target.value)} style={{ ...INPUT, width: '100%' }} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={LABEL}>Tags (comma separated)</label>
            <input value={editTags} onChange={e => setEditTags(e.target.value)} style={{ ...INPUT, width: '100%' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={LABEL}>Category</label>
            <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ ...SELECT, width: '100%' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={handleSave} disabled={saving} style={{ ...BTN_PRIMARY, width: '100%', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={handleCopyUrl} style={{ ...BTN, width: '100%' }}>
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <button onClick={handleDelete} style={{ ...BTN_DANGER, width: '100%' }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
