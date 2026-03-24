'use client'

import { useState, useCallback } from 'react'
import sanitizeHtml from 'sanitize-html'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), { ssr: false })

interface ImportResult {
  title: string
  content: string
  excerpt: string
  coverImage: string
}

interface SmartPasteImporterProps {
  onImport: (result: ImportResult) => void
  onCancel: () => void
}

const LABEL: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#666', marginBottom: 6 }
const INPUT: React.CSSProperties = { width: '100%', padding: '10px 12px', fontSize: 14, border: '1px solid #e8e2d8', outline: 'none', color: '#1a1a1a' }

export default function SmartPasteImporter({ onImport, onCancel }: SmartPasteImporterProps) {
  const [mode, setMode] = useState<'empty' | 'preview'>('empty')
  const [title, setTitle] = useState('')
  const [html, setHtml] = useState('')
  const [plainText, setPlainText] = useState('')
  const [images, setImages] = useState<Array<{ url: string; index: number }>>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedHtml = e.clipboardData.getData('text/html')
    const plain = e.clipboardData.getData('text/plain')

    if (pastedHtml && pastedHtml.includes('<')) {
      e.preventDefault()
      const parser = new DOMParser()
      const doc = parser.parseFromString(pastedHtml, 'text/html')

      const parsedTitle = doc.querySelector('h1')?.textContent?.trim()
        || doc.querySelector('h2')?.textContent?.trim()
        || ''

      const imgs = Array.from(doc.querySelectorAll('img'))
        .map((img, i) => {
          let src = img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || ''
          const srcset = img.getAttribute('srcset')
          if (srcset) {
            const parts = srcset.split(',').map(s => s.trim()).filter(Boolean)
            const last = parts[parts.length - 1]?.split(' ')[0]
            if (last) src = last
          }
          return { url: src, index: i }
        })
        .filter(img => {
          if (!img.url || img.url.startsWith('data:')) return false
          const lc = img.url.toLowerCase()
          return !(lc.includes('logo') || lc.includes('icon') || lc.includes('avatar') || lc.includes('sprite') || lc.includes('pixel') || lc.includes('tracking'))
        })

      const clean = sanitizeHtml(doc.body.innerHTML, {
        allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'a', 'ul', 'ol', 'li', 'blockquote', 'img', 'br', 'figure', 'figcaption'],
        allowedAttributes: { a: ['href'], img: ['src', 'alt', 'data-src'] },
        allowedSchemes: ['http', 'https'],
      })

      setTitle(parsedTitle)
      setHtml(clean)
      setPlainText(doc.body.textContent?.trim() || '')
      setImages(imgs)
      setMode('preview')
    } else {
      setPlainText(plain)
      setMode('preview')
    }
  }, [])

  const doImport = async (withImages: boolean) => {
    setUploading(true)
    setErrors([])

    let processedHtml = html
    let coverImage = ''
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'import'

    if (withImages && html) {
      // Re-scan edited HTML for current images
      const parser = new DOMParser()
      const editedDoc = parser.parseFromString(html, 'text/html')
      const currentImages = Array.from(editedDoc.querySelectorAll('img'))
        .map((img, i) => ({ url: img.src || img.getAttribute('data-src') || '', index: i }))
        .filter(img => img.url && !img.url.startsWith('data:'))

      if (currentImages.length > 0) {
        setProgress(`Uploading images... 0/${currentImages.length}`)
        try {
          const res = await fetch('/api/admin/upload-images', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: currentImages, slug }),
          })
          const data = await res.json()
          if (data.results) {
            let uploaded = 0
            const errs: string[] = []
            for (const result of data.results) {
              if (result.success && result.originalUrl && result.newUrl) {
                processedHtml = processedHtml.split(result.originalUrl).join(result.newUrl)
                uploaded++
                if (!coverImage) coverImage = result.newUrl
              } else if (!result.success) {
                errs.push(result.error || 'Unknown error')
              }
            }
            setProgress(`${uploaded}/${currentImages.length} images uploaded`)
            if (errs.length > 0) setErrors([`${errs.length} image(s) could not be imported`])
          }
        } catch (err: any) {
          setErrors([err.message || 'Upload failed'])
        }
      }
    }

    const finalContent = withImages ? processedHtml : (html || plainText)
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = finalContent
    const excerpt = tempDiv.textContent?.trim().slice(0, 280) || ''

    // Fallback: if no cover image from upload, grab first img from content
    if (!coverImage) {
      const firstImg = tempDiv.querySelector('img')
      if (firstImg) coverImage = firstImg.src || firstImg.getAttribute('data-src') || ''
    }

    onImport({
      title,
      content: finalContent,
      excerpt,
      coverImage,
    })

    setUploading(false)
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
      {mode === 'empty' ? (
        <>
          <label style={LABEL}>Paste Article Content</label>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
            Copy content from any website (Cmd+A then Cmd+C), then paste here. Images will be detected automatically.
          </p>
          <div
            contentEditable
            onPaste={handlePaste}
            style={{
              ...INPUT,
              minHeight: 160,
              lineHeight: 1.7,
              overflow: 'auto',
              background: '#fff',
              cursor: 'text',
            }}
            suppressContentEditableWarning
          />
          <button onClick={onCancel} className="mt-3 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
        </>
      ) : (
        <>
          <label style={LABEL}>Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Article title" style={{ ...INPUT, marginBottom: 12 }} />

          {images.length > 0 && (
            <div style={{ padding: '8px 12px', background: '#f5f0e0', borderRadius: 6, marginBottom: 12, fontSize: 13, color: '#8a7622' }}>
              Found {images.length} image{images.length > 1 ? 's' : ''} from external source
            </div>
          )}

          <label style={LABEL}>Content — edit before importing</label>
          <div style={{ marginBottom: 12 }}>
            <RichTextEditor
              content={html || plainText.replace(/\n/g, '<br>')}
              onChange={setHtml}
              placeholder="Edit the pasted content here..."
            />
          </div>

          {progress && <p style={{ fontSize: 12, color: '#2B4A3E', marginBottom: 8 }}>{progress}</p>}
          {errors.map((err, i) => <p key={i} style={{ fontSize: 12, color: '#cc4444', marginBottom: 8 }}>{err}</p>)}

          <div className="flex gap-3 mt-3">
            {html && html.includes('<img') && (
              <button
                onClick={() => doImport(true)}
                disabled={uploading || !title.trim()}
                className="text-sm bg-[#2B4A3E] text-white px-4 py-2 rounded hover:bg-[#1e3a2e] disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Import with Images'}
              </button>
            )}
            <button
              onClick={() => doImport(false)}
              disabled={uploading || !title.trim()}
              className="text-sm border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              {html ? 'Import Text Only' : 'Use This Content'}
            </button>
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
