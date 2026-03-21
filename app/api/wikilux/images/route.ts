import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getUnsplash, mapUnsplashPhoto } from '@/lib/unsplash'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')
    const sector = searchParams.get('sector') || ''

    if (!brand) {
      return NextResponse.json(
        { error: 'brand query parameter is required' },
        { status: 400 }
      )
    }

    const slug = brand.toLowerCase().replace(/\s+/g, '-')

    // Check cache first — maybeSingle returns null when no row exists
    const { data: cached } = await supabase
      .from('wikilux_brands')
      .select('images')
      .eq('slug', slug)
      .maybeSingle()

    if (cached?.images && Array.isArray(cached.images) && cached.images.length > 0) {
      return NextResponse.json({ images: cached.images })
    }

    // Handle missing Unsplash key gracefully
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      return NextResponse.json({ images: [] })
    }

    const unsplash = getUnsplash()
    const query = `${brand} luxury ${sector}`.trim()

    const result = await unsplash.search.getPhotos({
      query,
      perPage: 5,
    })

    if (result.errors) {
      return NextResponse.json(
        { error: 'Failed to search Unsplash', details: result.errors },
        { status: 502 }
      )
    }

    const images = (result.response?.results || []).map(mapUnsplashPhoto)

    // Cache images — try wikilux_brands first, fall back silently
    try {
      // First try to update an existing row (avoids column mismatch on insert)
      const { error: updateError } = await supabase
        .from('wikilux_brands')
        .update({ images })
        .eq('slug', slug)

      if (updateError) {
        // Row may not exist — try upsert with minimal columns
        const { error: upsertError } = await supabase
          .from('wikilux_brands')
          .upsert(
            { slug, brand_name: brand, images },
            { onConflict: 'slug' }
          )
        if (upsertError) {
          console.error('[wikilux/images] Cache write failed:', JSON.stringify(upsertError))
        }
      }
    } catch (e) {
      // Never block image delivery due to cache failure
      console.error('[wikilux/images] Cache write exception:', e)
    }

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Wikilux images error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
