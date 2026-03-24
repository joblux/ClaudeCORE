import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import AdmZip from 'adm-zip'
import sharp from 'sharp'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'hotel-images'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']
const JUNK_PATTERNS = ['__MACOSX', '.DS_Store', 'thumbs.db', 'desktop.ini', '.BridgeSort']

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (!data) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

function cleanFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, '')          // remove extension
    .replace(/[_-]+/g, ' ')           // underscores/hyphens to spaces
    .replace(/\s+/g, ' ')             // collapse multiple spaces
    .replace(/\(\d+\)/g, '')          // remove (1), (2) etc
    .replace(/\s*\d+\s*$/, '')        // remove trailing numbers
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()) // title case
}

function getExt(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase()
}

function isJunk(path: string): boolean {
  return JUNK_PATTERNS.some(p => path.includes(p))
}

function basename(path: string): string {
  return path.split('/').pop() || path
}

export async function POST(req: NextRequest) {
  try {
    await ensureBucket()

    const formData = await req.formData()
    const file = formData.get('file') as File
    const hotelId = formData.get('hotel_id') as string
    const hotelSlug = formData.get('hotel_slug') as string
    const hotelName = formData.get('hotel_name') as string || ''

    if (!file || !hotelId || !hotelSlug) {
      return NextResponse.json({ error: 'file, hotel_id, and hotel_slug required' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const zip = new AdmZip(buffer)
    const entries = zip.getEntries()

    // Get current max sort_order
    const { data: existing } = await supabase
      .from('escape_hotel_photos')
      .select('sort_order')
      .eq('hotel_id', hotelId)
      .order('sort_order', { ascending: false })
      .limit(1)

    let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1
    const isFirstUpload = nextOrder === 0

    const timestamp = Date.now()
    let uploaded = 0
    let failed = 0
    const photos: any[] = []
    const warnings: string[] = []

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      if (entry.isDirectory) continue
      if (isJunk(entry.entryName)) continue

      const ext = getExt(entry.entryName)
      if (!IMAGE_EXTS.includes(ext)) continue

      const name = basename(entry.entryName)
      let imgBuffer = entry.getData()

      if (imgBuffer.length > MAX_IMAGE_SIZE) {
        warnings.push(`${name}: skipped (over 10MB)`)
        failed++
        continue
      }

      if (imgBuffer.length < 100) continue // skip tiny files

      let uploadExt = ext === '.jpeg' ? '.jpg' : ext
      let contentType = 'image/jpeg'

      // Convert .tif to .jpg
      if (ext === '.tif' || ext === '.tiff') {
        try {
          imgBuffer = await sharp(imgBuffer).jpeg({ quality: 85 }).toBuffer()
          uploadExt = '.jpg'
          contentType = 'image/jpeg'
        } catch {
          warnings.push(`${name}: could not convert TIFF`)
          failed++
          continue
        }
      } else if (ext === '.png') {
        contentType = 'image/png'
      } else if (ext === '.webp') {
        contentType = 'image/webp'
      }

      const cleanName = name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase()
      const storagePath = `hotels/${hotelSlug}/${timestamp}-${nextOrder}-${cleanName}${uploadExt === ext ? '' : uploadExt}`

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, imgBuffer, { contentType, upsert: true })

      if (uploadErr) {
        warnings.push(`${name}: upload failed`)
        failed++
        continue
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
      const caption = cleanFilename(name)

      const { data: photo, error: dbErr } = await supabase
        .from('escape_hotel_photos')
        .insert({
          hotel_id: hotelId,
          url: urlData.publicUrl,
          alt: caption,
          caption,
          credit: hotelName ? `Photo courtesy of ${hotelName}` : null,
          is_cover: isFirstUpload && nextOrder === 0,
          sort_order: nextOrder,
        })
        .select()
        .single()

      if (dbErr) {
        warnings.push(`${name}: db error`)
        failed++
      } else {
        photos.push(photo)
        uploaded++
      }

      nextOrder++
    }

    return NextResponse.json({ uploaded, failed, photos, warnings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Zip processing failed' }, { status: 500 })
  }
}
