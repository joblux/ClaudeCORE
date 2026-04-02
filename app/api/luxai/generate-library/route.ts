import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { slug } = await request.json()
    if (!slug) return NextResponse.json({ success: false, message: 'slug required' }, { status: 400 })

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
    if (!unsplashKey) return NextResponse.json({ success: false, message: 'UNSPLASH_ACCESS_KEY not configured in Coolify' }, { status: 500 })

    const { data: brand } = await supabase.from('wikilux_content').select('brand_name').eq('slug', slug).maybeSingle()
    if (!brand) return NextResponse.json({ success: false, message: 'Brand not found' }, { status: 404 })
    const brandName = brand.brand_name

    const queries = [
      `${brandName} luxury boutique`,
      `${brandName} fashion products`,
      `${brandName} store interior`,
    ]

    const allPhotos: any[] = []
    for (const query of queries) {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      )
      if (res.ok) {
        const data = await res.json()
        for (const photo of (data.results || [])) {
          allPhotos.push({
            unsplash_id: photo.id,
            url: photo.urls?.regular,
            thumbnail_url: photo.urls?.small,
            alt_text: photo.alt_description || `${brandName} image`,
            photographer_name: photo.user?.name,
            photographer_url: `${photo.user?.links?.html}?utm_source=joblux&utm_medium=referral`,
            photo_url: `${photo.links?.html}?utm_source=joblux&utm_medium=referral`,
            width: photo.width,
            height: photo.height,
            search_query: query,
          })
        }
      }
      await new Promise(r => setTimeout(r, 200))
    }

    const seen = new Set()
    const unique = allPhotos.filter(p => {
      if (seen.has(p.unsplash_id)) return false
      seen.add(p.unsplash_id)
      return true
    }).slice(0, 12)

    const inserted = []
    for (const photo of unique) {
      const { data: row, error } = await supabase.from('media_library').insert({
        brand_slug: slug,
        brand_name: brandName,
        mime_type: 'image/jpeg',
        source: 'unsplash',
        unsplash_id: photo.unsplash_id,
        file_url: photo.url,
        thumbnail_url: photo.thumbnail_url,
        alt_text: photo.alt_text,
        photographer_name: photo.photographer_name,
        photographer_url: photo.photographer_url,
        photo_url: photo.photo_url,
        width: photo.width,
        height: photo.height,
        status: 'pending',
        metadata: { search_query: photo.search_query }
      }).select().maybeSingle()
      if (!error && row) inserted.push(row)
    }

    await supabase.from('luxai_history').insert({
      type: 'library_curation',
      model: 'unsplash-api',
      prompt: `Curate images for ${brandName}`,
      response: { slug, count: inserted.length },
      tokens_used: 0,
      cost_usd: 0,
      status: 'success'
    })

    return NextResponse.json({
      success: true,
      message: `${inserted.length} images curated for ${brandName} — pending approval`,
      data: { count: inserted.length }
    })
  } catch (error: any) {
    console.error('Library curation error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
