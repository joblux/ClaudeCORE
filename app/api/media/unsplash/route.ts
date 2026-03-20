import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUnsplash, mapUnsplashPhoto, UnsplashImage } from '@/lib/unsplash'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const page = parseInt(searchParams.get('page') || '1', 10)

    if (!query) {
      return NextResponse.json(
        { error: 'query parameter is required' },
        { status: 400 }
      )
    }

    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash is not configured' },
        { status: 503 }
      )
    }

    const unsplash = getUnsplash()

    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage: 20,
    })

    if (result.errors) {
      return NextResponse.json(
        { error: 'Failed to search Unsplash', details: result.errors },
        { status: 502 }
      )
    }

    const images: UnsplashImage[] = (result.response?.results || []).map(mapUnsplashPhoto)

    return NextResponse.json({
      images,
      total: result.response?.total || 0,
      total_pages: result.response?.total_pages || 0,
      page,
    })
  } catch (error) {
    console.error('Unsplash search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      unsplash_id,
      url,
      photographer,
      photographer_url,
      unsplash_url,
      alt,
      width,
      height,
    } = body

    if (!unsplash_id || !url) {
      return NextResponse.json(
        { error: 'unsplash_id and url are required' },
        { status: 400 }
      )
    }

    // Download the image from Unsplash
    const imageResponse = await fetch(url)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download image from Unsplash' },
        { status: 502 }
      )
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const extension = contentType.split('/')[1] || 'jpg'
    const filename = `unsplash-${unsplash_id}.${extension}`
    const storagePath = `uploads/${filename}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, imageBuffer, {
        contentType,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload to storage', details: uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    // Insert into media_library
    const { data, error: insertError } = await supabase
      .from('media_library')
      .insert({
        filename,
        original_filename: filename,
        file_url: urlData.publicUrl,
        file_size: imageBuffer.length,
        mime_type: contentType,
        alt_text: alt || null,
        source: 'unsplash',
        unsplash_attribution: {
          unsplash_id,
          photographer,
          photographer_url,
          unsplash_url,
          width,
          height,
        },
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save media record', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ media: data }, { status: 201 })
  } catch (error) {
    console.error('Unsplash save error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
