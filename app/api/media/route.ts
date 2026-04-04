import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'admin') {
    return null
  }
  return session
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const fileType = searchParams.get('fileType')
    const orientation = searchParams.get('orientation')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Fetch distinct brand names for filter dropdown
    if (searchParams.get('distinct') === 'brands') {
      const { data } = await supabase
        .from('media_library')
        .select('brand_name')
        .not('brand_name', 'is', null)
        .not('brand_name', 'eq', '')
      const brands = [...new Set((data || []).map((r: any) => r.brand_name).filter(Boolean))]
      return NextResponse.json({ brands })
    }

    let query = supabase
      .from('media_library')
      .select('*', { count: 'exact' })

    if (source) {
      query = query.eq('source', source)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (brand) {
      query = query.eq('brand_name', brand)
    }

    if (search) {
      query = query.or(`filename.ilike.%${search}%,alt_text.ilike.%${search}%,original_filename.ilike.%${search}%,photographer_name.ilike.%${search}%`)
    }

    // File type filter based on mime_type
    if (fileType === 'image') {
      query = query.like('mime_type', 'image/%')
    } else if (fileType === 'video') {
      query = query.like('mime_type', 'video/%')
    } else if (fileType === 'audio') {
      query = query.like('mime_type', 'audio/%')
    } else if (fileType === 'document') {
      query = query.or('mime_type.like.application/pdf,mime_type.like.application/%')
    }

    // Orientation filter (images only)
    if (orientation === 'landscape') {
      query = query.not('width', 'is', null).not('height', 'is', null).gt('width', 0)
      // Can't do width > height directly in PostgREST, filter client-side below
    } else if (orientation === 'portrait') {
      query = query.not('width', 'is', null).not('height', 'is', null).gt('height', 0)
    } else if (orientation === 'square') {
      query = query.not('width', 'is', null).not('height', 'is', null)
    }

    // Sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'name') {
      query = query.order('original_filename', { ascending: true })
    } else if (sort === 'largest') {
      query = query.order('file_size', { ascending: false, nullsFirst: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // For orientation filtering, we need to fetch more and filter client-side
    if (orientation && orientation !== '') {
      // Fetch all matching, then filter, then paginate
      const { data: allData, error, count } = await query
      if (error) {
        return NextResponse.json({ error: 'Failed to fetch media', details: error.message }, { status: 500 })
      }
      let filtered = allData || []
      if (orientation === 'landscape') {
        filtered = filtered.filter((m: any) => m.width && m.height && m.width > m.height)
      } else if (orientation === 'portrait') {
        filtered = filtered.filter((m: any) => m.width && m.height && m.height > m.width)
      } else if (orientation === 'square') {
        filtered = filtered.filter((m: any) => m.width && m.height && Math.abs(m.width - m.height) / Math.max(m.width, m.height) < 0.1)
      }
      const total = filtered.length
      const items = filtered.slice(offset, offset + limit)
      return NextResponse.json({ items, total, page, limit })
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch media', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      items: data,
      total: count,
      page,
      limit,
    })
  } catch (error) {
    console.error('Media list error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const altText = formData.get('alt_text') as string | null
    const tags = formData.get('tags') as string | null
    const category = formData.get('category') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${Date.now()}-${file.name}`
    const storagePath = `uploads/${filename}`

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(storagePath)

    const insertData: Record<string, any> = {
      filename: filename,
      original_filename: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: file.type,
      source: 'upload',
    }
    if (altText) insertData.alt_text = altText
    if (tags) insertData.tags = tags.split(',').map(t => t.trim()).filter(Boolean)
    if (category) insertData.category = category

    const { data, error: insertError } = await supabase
      .from('media_library')
      .insert(insertData)
      .select()
      .maybeSingle()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to save media record', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ media: data }, { status: 201 })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, alt_text, caption, tags, category, brand_name, photographer_name } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (alt_text !== undefined) updateData.alt_text = alt_text
    if (caption !== undefined) updateData.caption = caption
    if (tags !== undefined) updateData.tags = tags
    if (category !== undefined) updateData.category = category
    if (brand_name !== undefined) updateData.brand_name = brand_name
    if (photographer_name !== undefined) updateData.photographer_name = photographer_name

    const { data, error } = await supabase
      .from('media_library')
      .update(updateData)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update media', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ media: data })
  } catch (error) {
    console.error('Media update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400 }
      )
    }

    const { data: media, error: fetchError } = await supabase
      .from('media_library')
      .select('file_url')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    const url = new URL(media.file_url)
    const pathParts = url.pathname.split('/storage/v1/object/public/media/')
    const storagePath = pathParts[1]

    if (storagePath) {
      const { error: deleteStorageError } = await supabase.storage
        .from('media')
        .remove([storagePath])

      if (deleteStorageError) {
        console.error('Failed to delete from storage:', deleteStorageError)
      }
    }

    const { error: deleteError } = await supabase
      .from('media_library')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete media record', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Media delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
