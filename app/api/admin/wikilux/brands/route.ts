import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - List all brands
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('wikilux_content')
      .select('slug, brand_name, status, is_published, last_regenerated_at, regeneration_count, content_version')
      .order('brand_name')
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      brands: data || []
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}

// POST - Add new brand
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, category, founded_year, country } = body
    
    // Validate required fields
    if (!name || !slug || !category || !founded_year || !country) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }
    
    // Check if slug already exists
    const { data: existing } = await supabase
      .from('wikilux_content')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()
    
    if (existing) {
      return NextResponse.json({
        success: false,
        message: 'Brand with this slug already exists'
      }, { status: 400 })
    }
    
    // Insert brand
    const { error } = await supabase
      .from('wikilux_content')
      .insert({
        slug,
        brand_name: name,
        content: {},
        translations: {},
        status: 'draft',
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Brand added successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}

// DELETE - Remove brand
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const slug = url.searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({
        success: false,
        message: 'slug parameter required'
      }, { status: 400 })
    }
    
    const { error } = await supabase
      .from('wikilux_content')
      .delete()
      .eq('slug', slug)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Brand deleted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 })
  }
}
