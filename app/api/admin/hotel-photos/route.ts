import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET = 'hotel-images'
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET)
  if (!data) {
    await supabase.storage.createBucket(BUCKET, { public: true })
  }
}

// GET — list photos for a hotel
export async function GET(req: NextRequest) {
  const hotelId = req.nextUrl.searchParams.get('hotel_id')
  if (!hotelId) return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('escape_hotel_photos')
    .select('*')
    .eq('hotel_id', hotelId)
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photos: data })
}

// POST — upload photos (multipart form)
export async function POST(req: NextRequest) {
  await ensureBucket()

  const formData = await req.formData()
  const hotelId = formData.get('hotel_id') as string
  const hotelSlug = formData.get('hotel_slug') as string
  const hotelName = formData.get('hotel_name') as string || ''

  if (!hotelId || !hotelSlug) {
    return NextResponse.json({ error: 'hotel_id and hotel_slug required' }, { status: 400 })
  }

  // Get current max sort_order
  const { data: existing } = await supabase
    .from('escape_hotel_photos')
    .select('sort_order')
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: false })
    .limit(1)

  let nextOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const files = formData.getAll('files') as File[]
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }

  const results: any[] = []

  for (const file of files) {
    if (!ALLOWED.includes(file.type)) {
      results.push({ name: file.name, success: false, error: 'Unsupported type' })
      continue
    }
    if (file.size > MAX_SIZE) {
      results.push({ name: file.name, success: false, error: 'File too large (max 10MB)' })
      continue
    }

    const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1]
    const path = `hotels/${hotelSlug}/${Date.now()}-${nextOrder}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadErr) {
      results.push({ name: file.name, success: false, error: uploadErr.message })
      continue
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

    // Check if this is the first photo (make it cover)
    const isCover = nextOrder === 0

    const { data: photo, error: dbErr } = await supabase
      .from('escape_hotel_photos')
      .insert({
        hotel_id: hotelId,
        url: urlData.publicUrl,
        credit: hotelName ? `Photo courtesy of ${hotelName}` : null,
        is_cover: isCover,
        sort_order: nextOrder,
      })
      .select()
      .single()

    if (dbErr) {
      results.push({ name: file.name, success: false, error: dbErr.message })
    } else {
      results.push({ name: file.name, success: true, photo })
    }

    nextOrder++
  }

  return NextResponse.json({ results })
}

// PATCH — update a photo (caption, credit, is_cover)
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, caption, credit, alt, is_cover } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // If setting as cover, clear other covers first
  if (is_cover === true) {
    const { data: photo } = await supabase
      .from('escape_hotel_photos')
      .select('hotel_id')
      .eq('id', id)
      .single()

    if (photo) {
      await supabase
        .from('escape_hotel_photos')
        .update({ is_cover: false })
        .eq('hotel_id', photo.hotel_id)
    }
  }

  const update: Record<string, any> = {}
  if (caption !== undefined) update.caption = caption
  if (credit !== undefined) update.credit = credit
  if (alt !== undefined) update.alt = alt
  if (is_cover !== undefined) update.is_cover = is_cover

  const { data, error } = await supabase
    .from('escape_hotel_photos')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ photo: data })
}

// DELETE — remove a photo
export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Get photo URL to delete from storage
  const { data: photo } = await supabase
    .from('escape_hotel_photos')
    .select('url')
    .eq('id', id)
    .single()

  if (photo?.url) {
    // Extract path from URL
    const url = new URL(photo.url)
    const path = url.pathname.split(`/storage/v1/object/public/${BUCKET}/`)[1]
    if (path) {
      await supabase.storage.from(BUCKET).remove([path])
    }
  }

  const { error } = await supabase
    .from('escape_hotel_photos')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
