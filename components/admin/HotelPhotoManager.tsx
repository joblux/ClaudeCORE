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
  const fileRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const fetchPhotos = useCallback(async () => {
    const res = await fetch(`/api/admin/hotel-photos?hotel_id=${hotelId}`)
    const data = await res.json()
    if (data.photos) setPhotos(data.photos)
  }, [hotelId])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const uploadFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setError('')
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
        setError(`${failed.length} file(s) failed: ${failed.map((f: any) => f.error).join(', ')}`)
      }
      setUploadProgress('')
      fetchPhotos()
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    }
    setUploading(false)
  }

  const handleFileSelect = () => {
    const files = fileRef.current?.files
    if (files?.length) uploadFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files)
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
    if (!confirm('Delete this photo?')) return
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
        ref={dropRef}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors cursor-pointer"
        style={{ borderColor: dragOver ? '#2B4A3E' : '#e0d9ca', backgroundColor: dragOver ? '#f0ede4' : '#fafaf5' }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-sm text-gray-500">
          {uploading ? uploadProgress : 'Drop photos here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 10MB each · Up to 20 at once</p>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group" style={{ border: photo.is_cover ? '2px solid #B8975C' : '1px solid #e8e2d8', borderRadius: 8, overflow: 'hidden' }}>
              <img
                src={photo.url}
                alt={photo.alt || photo.caption || ''}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />

              {/* Cover badge */}
              {photo.is_cover && (
                <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: '#B8975C', color: '#fff' }}>
                  Cover
                </span>
              )}

              {/* Actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!photo.is_cover && (
                  <button
                    onClick={() => setCover(photo.id)}
                    className="w-7 h-7 rounded bg-white/90 flex items-center justify-center text-xs hover:bg-yellow-50"
                    title="Set as cover"
                  >
                    ★
                  </button>
                )}
                {i > 0 && (
                  <button
                    onClick={() => movePhoto(i, -1)}
                    className="w-7 h-7 rounded bg-white/90 flex items-center justify-center text-xs hover:bg-gray-100"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                {i < photos.length - 1 && (
                  <button
                    onClick={() => movePhoto(i, 1)}
                    className="w-7 h-7 rounded bg-white/90 flex items-center justify-center text-xs hover:bg-gray-100"
                    title="Move right"
                  >
                    →
                  </button>
                )}
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="w-7 h-7 rounded bg-white/90 flex items-center justify-center text-xs text-red-500 hover:bg-red-50"
                  title="Delete"
                >
                  ✕
                </button>
              </div>

              {/* Caption input */}
              <div className="p-2">
                <input
                  type="text"
                  defaultValue={photo.caption || ''}
                  onBlur={e => updateCaption(photo.id, e.target.value)}
                  placeholder="Caption..."
                  className="w-full text-xs text-gray-600 border-none outline-none bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
