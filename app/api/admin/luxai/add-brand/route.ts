import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { generateBrandContent } from '@/lib/luxai/regenerateBrand'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = (session?.user as { role?: string } | undefined)?.role
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { brand_name } = await request.json()
    if (!brand_name || brand_name.trim().length < 2) {
      return NextResponse.json({ success: false, message: 'Brand name required (min 2 characters)' }, { status: 400 })
    }

    const name = brand_name.trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

    // Check if brand already exists
    const { data: existing } = await supabase
      .from('wikilux_content')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ success: false, message: `Brand "${name}" already exists (slug: ${slug})` }, { status: 409 })
    }

    // Create the brand row with empty content
    const { error } = await supabase.from('wikilux_content').insert({
      slug,
      brand_name: name,
      content: {},
      status: 'approved',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (error) throw error

    // Now trigger AI generation for this brand
    let generated = false
    try {
      await generateBrandContent(slug, name, 'approved')
      generated = true
    } catch (e) {
      console.log(`[LUXAI] Auto-generation failed for ${slug}, brand created as empty draft`)
    }

    return NextResponse.json({
      success: true,
      message: generated
        ? `Brand "${name}" created and content generated | check approval queue`
        : `Brand "${name}" created as empty draft | generate content manually`,
      data: { slug, brand_name: name, generated }
    })
  } catch (error: any) {
    console.error('Add brand error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
