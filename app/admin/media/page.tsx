'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

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
  unsplash_attribution: any
  created_at: string
}

interface UnsplashResult {
  id: string
  url: string
  thumb: string
  alt: string | null
  width: number
  height: number
  photographer: string
  photographer_url: string
  unsplash_url: string
  download_location: string
}

type View = 'library' | 'unsplash'

export default function AdminMediaPage() {
  const [view, setView] = useState<View>('library')
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Unsplash search state
  const [unsplashQuery, setUnsplashQuery] = useState('')
  const [unsplashResults, setUnsplashResults] = useState<UnsplashResult[]>([])
  const [unsplashLoading, setUnsplashLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  // Edit state
  const [editAlt, setEditAlt] = useState('')
  const [editCaption, setEditCaption] = useState('')
  const [editTags, setEditTags] = useState('')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.set('search', search)
    if (sourceFilter) params.set('source', sourceFilter)
    try {
      const res = await fetch(`/api/media?${params}`)
      const data = await res.json()
      setItems(data.items || [])
      setTotal(data.total || 0)
    } catch {}
    setLoading(false)
  }, [page, search, sourceFilter])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      await fetch('/api/media', { method: 'POST', body: form })
    }
    setUploading(false)
    fetchMedia()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image permanently?')) return
    await fetch(`/api/media?id=${id}`, { method: 'DELETE' })
    setSelected(null)
    fetchMedia()
  }

  const handleSave = async () => {
    if (!selected) return
    await fetch('/api/media', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: selected.id,
        alt_text: editAlt,
        caption: editCaption,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      }),
    })
    setSelected(null)
    fetchMedia()
  }

  const openEdit = (item: MediaItem) => {
    setSelected(item)
    setEditAlt(item.alt_text || '')
    setEditCaption(item.caption || '')
    setEditTags((item.tags || []).join(', '))
  }

  // Unsplash search
  const searchUnsplash = async () => {
    if (!unsplashQuery.trim()) return
    setUnsplashLoading(true)
    try {
      const res = await fetch(`/api/media/unsplash?query=${encodeURIComponent(unsplashQuery)}`)
      const data = await res.json()
      setUnsplashResults(data.images || [])
    } catch {}
    setUnsplashLoading(false)
  }

  const saveUnsplash = async (img: UnsplashResult) => {
    setSaving(img.id)
    // Trigger Unsplash download event (required by API guidelines)
    await fetch(`/api/media/unsplash/download?download_location=${encodeURIComponent(img.download_location)}`, { method: 'POST' })
    await fetch('/api/media/unsplash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unsplash_id: img.id,
        url: img.url,
        photographer: img.photographer,
        photographer_url: img.photographer_url,
        unsplash_url: img.unsplash_url,
        alt: img.alt,
        width: img.width,
        height: img.height,
      }),
    })
    setSaving(null)
  }

  const sourceBadge = (source: string) => {
    if (source === 'unsplash') return 'jl-badge-gold'
    if (source === 'ai_generated') return 'jl-badge-outline'
    return 'jl-badge'
  }

  return (
    <div className="min-h-screen bg-[#fafaf5]">
      <div className="px-6 py-5 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-[#1a1a1a]">Media Library</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} file{total !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('library')}
            className={`jl-btn text-xs ${view === 'library' ? 'jl-btn-primary' : 'jl-btn-outline'}`}
          >
            Library
          </button>
          <button
            onClick={() => setView('unsplash')}
            className={`jl-btn text-xs ${view === 'unsplash' ? 'jl-btn-primary' : 'jl-btn-outline'}`}
          >
            Unsplash
          </button>
        </div>
      </div>

      {view === 'library' ? (
        <>
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="jl-input w-48 text-xs"
            />
            <select
              value={sourceFilter}
              onChange={(e) => { setSourceFilter(e.target.value); setPage(1) }}
              className="jl-select text-xs w-36"
            >
              <option value="">All Sources</option>
              <option value="upload">Uploads</option>
              <option value="unsplash">Unsplash</option>
              <option value="ai_generated">AI Generated</option>
            </select>
            <div className="flex-1" />
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="jl-btn jl-btn-gold text-xs"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#f0ece4] animate-pulse rounded-lg" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-16">
              <p className="jl-serif text-xl text-[#1a1a1a] mb-2">No media yet</p>
              <p className="text-sm text-[#888]">Upload images or import from Unsplash</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-[#888] mb-3">{total} file{total !== 1 ? 's' : ''}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openEdit(item)}
                    className="jl-card group text-left p-0 overflow-hidden"
                  >
                    <div className="aspect-square relative bg-[#fafaf5]">
                      <Image
                        src={item.thumbnail_url || item.file_url}
                        alt={item.alt_text || item.filename}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs text-[#1a1a1a] truncate">{item.original_filename}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`${sourceBadge(item.source)} text-[0.5rem]`}>{item.source}</span>
                        <span className="text-[0.6rem] text-[#ccc]">
                          {new Date(item.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="jl-btn text-xs disabled:opacity-30">Previous</button>
                  <span className="text-xs text-[#888] px-4">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="jl-btn text-xs disabled:opacity-30">Next</button>
                </div>
              )}
            </>
          )}

          {/* Edit Modal */}
          {selected && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-[#1a1a1a]/60" onClick={() => setSelected(null)} />
              <div className="relative bg-white border border-[#e8e2d8] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
                <div className="aspect-video relative bg-[#fafaf5] mb-4">
                  <Image
                    src={selected.file_url}
                    alt={selected.alt_text || selected.filename}
                    fill
                    className="object-contain"
                    sizes="500px"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="jl-label">Alt Text</label>
                    <input className="jl-input w-full" value={editAlt} onChange={(e) => setEditAlt(e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Caption</label>
                    <input className="jl-input w-full" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} />
                  </div>
                  <div>
                    <label className="jl-label">Tags (comma separated)</label>
                    <input className="jl-input w-full" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
                  </div>
                  {selected.unsplash_attribution && (
                    <div className="text-xs text-[#888]">
                      Photo by{' '}
                      <a href={selected.unsplash_attribution.photographer_url} target="_blank" rel="noopener noreferrer" className="text-[#a58e28]">
                        {selected.unsplash_attribution.photographer}
                      </a>{' '}
                      on{' '}
                      <a href={selected.unsplash_attribution.unsplash_url} target="_blank" rel="noopener noreferrer" className="text-[#a58e28]">
                        Unsplash
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e8e2d8]">
                  <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                  <div className="flex gap-2">
                    <button onClick={() => setSelected(null)} className="jl-btn jl-btn-outline text-xs">Cancel</button>
                    <button onClick={handleSave} className="jl-btn jl-btn-primary text-xs">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Unsplash Search Panel */
        <>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Search Unsplash — luxury fashion, hotel lobby..."
              value={unsplashQuery}
              onChange={(e) => setUnsplashQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchUnsplash()}
              className="jl-input flex-1"
            />
            <button onClick={searchUnsplash} disabled={unsplashLoading} className="jl-btn jl-btn-primary text-xs">
              {unsplashLoading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {unsplashResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {unsplashResults.map((img) => (
                <div key={img.id} className="jl-card p-0 overflow-hidden">
                  <div className="aspect-square relative bg-[#fafaf5]">
                    <Image
                      src={img.thumb}
                      alt={img.alt || 'Unsplash photo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="text-[0.65rem] text-[#888] truncate mb-2">
                      Photo by <a href={img.photographer_url} target="_blank" rel="noopener noreferrer" className="text-[#a58e28]">{img.photographer}</a>
                    </div>
                    <button
                      onClick={() => saveUnsplash(img)}
                      disabled={saving === img.id}
                      className="jl-btn jl-btn-gold text-[0.6rem] w-full py-1.5"
                    >
                      {saving === img.id ? 'Saving...' : 'Add to Library'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!unsplashLoading && unsplashResults.length === 0 && unsplashQuery && (
            <div className="text-center py-16">
              <p className="text-sm text-[#888]">Search Unsplash for high-quality images</p>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  )
}
