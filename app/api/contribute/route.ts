import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 })
  }

  const user = session.user as any
  const memberId = user.memberId
  const memberStatus = user.status

  if (!memberId || memberStatus !== 'approved') {
    return NextResponse.json({ success: false, message: 'You must be an approved member to contribute' }, { status: 403 })
  }

  // Get contributor name and email from member record
  const { data: member } = await supabase
    .from('members')
    .select('email, first_name, last_name, full_name')
    .eq('id', memberId)
    .single()

  if (!member?.email) {
    return NextResponse.json({ success: false, message: 'Member record not found' }, { status: 500 })
  }

  const contributorName = member.full_name || [member.first_name, member.last_name].filter(Boolean).join(' ') || 'JOBLUX Member'
  const contributorEmail = member.email

  try {
    const body = await request.json()
    const { brand_slug, issue_description, suggested_correction, source_url } = body

    // Validate required fields
    if (!brand_slug || !issue_description || !suggested_correction) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 })
    }

    // Insert contribution
    const { error } = await supabase
      .from('brand_contributions')
      .insert({
        brand_slug,
        user_id: memberId,
        contributor_name: contributorName,
        contributor_email: contributorEmail,
        issue_description,
        suggested_correction,
        source_url: source_url || null,
        created_at: new Date().toISOString(),
      })

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Correction submitted successfully' })
  } catch (error: any) {
    console.error('Brand correction submission error:', error)
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 })
  }
}
