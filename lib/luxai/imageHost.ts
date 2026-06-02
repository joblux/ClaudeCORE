import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const BUCKET = 'article-images'
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']
const TIMEOUT = 10000 // 10s per image

export async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (!data) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

function extFromType(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
    'image/webp': 'webp', 'image/avif': 'avif', 'image/svg+xml': 'svg',
  }
  return map[mime] || 'jpg'
}

export async function fetchAndUpload(url: string, path: string): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JOBLUXBot/1.0)' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const mime = contentType.split(';')[0].trim()
    if (!ALLOWED_TYPES.includes(mime)) throw new Error(`Unsupported type: ${mime}`)

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_SIZE) throw new Error('File too large')
    if (buffer.byteLength < 100) throw new Error('File too small')

    const ext = extFromType(mime)
    const fullPath = `${path}.${ext}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fullPath, Buffer.from(buffer), {
        contentType: mime,
        upsert: true,
      })
    if (error) throw new Error(error.message)

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)
    return urlData.publicUrl
  } finally {
    clearTimeout(timer)
  }
}
