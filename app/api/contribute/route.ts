import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      brand_slug,
      user_id,
      contributor_name,
      contributor_email,
      issue_description,
      suggested_correction,
      source_url
    } = body

    // Validate required fields
    if (!brand_slug || !contributor_name || !contributor_email || !issue_description || !suggested_correction) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(contributor_email)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email address'
      }, { status: 400 })
    }

    // Insert contribution
    const { error } = await supabase
      .from('brand_contributions')
      .insert({
        brand_slug,
        user_id: user_id || null,
        contributor_name,
        contributor_email,
        issue_description,
        suggested_correction,
        source_url: source_url || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Send email notification to admin (optional - implement SES if needed)
    // await sendAdminNotification(...)

    return NextResponse.json({
      success: true,
      message: 'Contribution submitted successfully'
    })

  } catch (error: any) {
    console.error('Contribution submission error:', error)
    return NextResponse.json({
      success: false,
      message: error.message || 'Internal server error'
    }, { status: 500 })
  }
}
