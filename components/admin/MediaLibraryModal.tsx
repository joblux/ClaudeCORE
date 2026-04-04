'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface MediaItem {
  id: string
  filename: string
  original_filename: string
  file_url: string
  thumbnail_url: string | null
  alt_text: string | null
  tags: string[]
  created_at: string
}

interface MediaLibraryModalProps {
  open: boolean
  onClose: () => void
  onSelect: (url: string) => void
}

export default function MediaLibraryModal({ open, onClose, onSelect }: MediaLibraryModalProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)
  const limit = 24
  const totalPages = Math.ceil(total / limit)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch { /* ignore */ }
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    if (open) fetchMedia()
  }, [open, fetchMedia])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    let lastUrl = ''
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      try {
        const res = await fetch('/api/media', { method: 'POST', body: form })
        const data = await res.json()
        if (data.media?.file_url) lastUrl = data.media.file_url
      } catch { /* ignore */ }
    }
    setUploading(false)
    if (lastUrl && files.length === 1) {
      onSelect(lastUrl)
      onClose()
    } else {
      fetchMedia()
    }
  }

  const handleSelect = (item: MediaItem) => {
    onSelect(item.file_url)
    onClose()
  }

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{
        position: 'relative', background: '#fff', border: '1px solid #e8e8e8',
        width: '100%', maxWidth: 800, maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        borderRadius: 4, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f5f5f5' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>Media Library</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#888', padding: '0 4px' }}>&times;</button>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e8e8e8', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by filename or tags..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #e8e8e8', outline: 'none', color: '#111', borderRadius: 3 }}
          />
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              padding: '8px 16px', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const, border: 'none', background: '#1a1a1a',
              color: '#a58e28', cursor: 'pointer', borderRadius: 3, opacity: uploading ? 0.5 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ aspectRatio: '1', background: '#f0f0f0', borderRadius: 4 }} />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: 13 }}>
              {search ? 'No images match your search' : 'No images yet — upload one above'}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: 0, border: '2px solid transparent', borderRadius: 4,
                    background: '#f5f5f5', cursor: 'pointer', overflow: 'hidden',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#a58e28')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                >
                  <div style={{ aspectRatio: '1', position: 'relative' }}>
                    <img
                      src={item.thumbnail_url || item.file_url}
                      alt={item.alt_text || item.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: '4px 6px', fontSize: 10, color: '#666', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.original_filename}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#f5f5f5' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', borderRadius: 3, opacity: page === 1 ? 0.4 : 1 }}
            >
              Previous
            </button>
            <span style={{ fontSize: 11, color: '#888' }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ fontSize: 12, padding: '4px 12px', border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', borderRadius: 3, opacity: page === totalPages ? 0.4 : 1 }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
