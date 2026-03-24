'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface Photo {
  id: string
  url: string
  alt: string | null
  caption: string | null
  credit: string | null
  is_cover: boolean
  sort_order: number
}

interface Props {
  hotelId: string
  hotelSlug: string
  hotelName: string
}

export default function HotelPhotoManager({ hotelId, hotelSlug, hotelName }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState('')
  const [warnings, setWarnings] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const zipRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const fetchPhotos = useCallback(async () => {
    const res = await fetch(`/api/admin/hotel-photos?hotel_id=${hotelId}`)
    const data = await res.json()
    if (data.photos) setPhotos(data.photos)
  }, [hotelId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  // Individual file upload
  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setError('')
    setWarnings([])
    setUploadProgress(`Uploading ${files.length} photo${files.length > 1 ? 's' : ''}...`)

    const formData = new FormData()
    formData.append('hotel_id', hotelId)
    formData.append('hotel_slug', hotelSlug)
    formData.append('hotel_name', hotelName)
    for (const file of Array.from(files)) {
      formData.append('files', file)
    }

    try {
      const res = await fetch('/api/admin/hotel-photos', { method: 'POST', body: formData })
      const data = await res.json()
      const failed = data.results?.filter((r: any) => !r.success) || []
      if (failed.length > 0) {
        setError(`${failed.length} file(s) failed`)
      }
      fetchPhotos()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    }
    setUploadProgress('')
    setUploading(false)
  }

  // Zip upload — uploads to Supabase Storage first, then processes server-side
  const uploadZip = async (file: File) => {
    setUploading(true)
    setError('')
    setWarnings([])
    setUploadProgress('Uploading zip to storage...')

    try {
      // Step 1: Upload zip directly to Supabase Storage (bypasses Vercel body limit)
      const zipPath = `temp/${Date.now()}-${file.name}`
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error: uploadErr } = await sb.storage
        .from('hotel-images')
        .upload(zipPath, file, { upsert: true })

      if (uploadErr) {
        setError('Failed to upload zip: ' + uploadErr.message)
        setUploading(false)
        return
      }

      // Step 2: Call API to process the zip from storage
      setUploadProgress('Processing zip...')
      const res = await fetch('/api/admin/hotel-photos/bulk-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zipPath,
          hotel_id: hotelId,
          hotel_slug: hotelSlug,
          hotel_name: hotelName,
        }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setUploadProgress(`Done: ${data.uploaded} uploaded${data.failed > 0 ? `, ${data.failed} failed` : ''}`)
        if (data.warnings?.length > 0) setWarnings(data.warnings)
        fetchPhotos()
      }
    } catch (err: any) {
      setError(err.message || 'Zip upload failed')
    }
    setUploading(false)
  }

  const handleFileSelect = () => {
    const files = fileRef.current?.files
    if (files?.length) uploadFiles(files)
  }

  const handleZipSelect = () => {
    const file = zipRef.current?.files?.[0]
    if (file) uploadZip(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      uploadZip(files[0])
    } else if (files.length > 0) {
      uploadFiles(files)
    }
  }

  const setCover = async (id: string) => {
    await fetch('/api/admin/hotel-photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_cover: true }),
    })
    fetchPhotos()
  }

  const updateCaption = async (id: string, caption: string) => {
    await fetch('/api/admin/hotel-photos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, caption }),
    })
  }

  const deletePhoto = async (id: string) => {
    await fetch('/api/admin/hotel-photos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPhotos()
  }

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const newPhotos = [...photos]
    const target = index + direction
    if (target < 0 || target >= newPhotos.length) return
    ;[newPhotos[index], newPhotos[target]] = [newPhotos[target], newPhotos[index]]
    const reordered = newPhotos.map((p, i) => ({ id: p.id, sort_order: i }))
    setPhotos(newPhotos.map((p, i) => ({ ...p, sort_order: i })))

    await fetch('/api/admin/hotel-photos/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: reordered }),
    })
  }

  return (
    <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Photos ({photos.length})</h3>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-5 text-center mb-3 transition-colors"
        style={{ borderColor: dragOver ? '#2B4A3E' : '#e0d9ca', backgroundColor: dragOver ? '#f0ede4' : '#fafaf5' }}
      >
        <p className="text-sm text-gray-500 mb-2">
          {uploading ? uploadProgress : 'Drop photos or a zip file here'}
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-xs bg-[#2B4A3E] text-white px-3 py-1.5 rounded hover:bg-[#1e3a2e] disabled:opacity-50"
          >
            Browse Photos
          </button>
          <button
            onClick={() => zipRef.current?.click()}
            disabled={uploading}
            className="text-xs border border-[#2B4A3E] text-[#2B4A3E] px-3 py-1.5 rounded hover:bg-[#2B4A3E]/5 disabled:opacity-50"
          >
            Upload Zip
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">JPG, PNG, WebP, TIF · Max 10MB/image · Zip max 200MB</p>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileSelect} className="hidden" />
        <input ref={zipRef} type="file" accept=".zip" onChange={handleZipSelect} className="hidden" />
      </div>

      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      {warnings.map((w, i) => <p key={i} className="text-xs text-amber-600 mb-1">{w}</p>)}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group" style={{ border: photo.is_cover ? '2px solid #B8975C' : '1px solid #e8e2d8', borderRadius: 6, overflow: 'hidden' }}>
              <img
                src={photo.url}
                alt={photo.alt || photo.caption || ''}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />

              {/* Cover badge */}
              {photo.is_cover && (
                <span className="absolute top-1.5 left-1.5 text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: '#B8975C', color: '#fff' }}>
                  Cover
                </span>
              )}

              {/* Star — set as cover (top-left, always visible) */}
              {!photo.is_cover && (
                <button
                  onClick={() => setCover(photo.id)}
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white/70 hover:text-yellow-400 hover:bg-black/60 transition-colors"
                  title="Set as cover"
                  style={{ fontSize: 12 }}
                >
                  ★
                </button>
              )}

              {/* Delete — top-right, always visible */}
              <button
                onClick={() => deletePhoto(photo.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded bg-black/40 flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-black/60 transition-colors"
                title="Delete"
                style={{ fontSize: 11 }}
              >
                ✕
              </button>

              {/* Reorder — bottom-right, on hover */}
              <div className="absolute bottom-8 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {i > 0 && (
                  <button onClick={() => movePhoto(i, -1)} className="w-5 h-5 rounded bg-black/40 text-white/70 hover:text-white text-[10px] flex items-center justify-center">←</button>
                )}
                {i < photos.length - 1 && (
                  <button onClick={() => movePhoto(i, 1)} className="w-5 h-5 rounded bg-black/40 text-white/70 hover:text-white text-[10px] flex items-center justify-center">→</button>
                )}
              </div>

              {/* Caption */}
              <div className="px-1.5 py-1">
                <input
                  type="text"
                  defaultValue={photo.caption || ''}
                  onBlur={e => updateCaption(photo.id, e.target.value)}
                  placeholder="Caption..."
                  className="w-full text-[10px] text-gray-500 border-none outline-none bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
