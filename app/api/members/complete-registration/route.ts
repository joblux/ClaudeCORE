import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_TIERS = ['rising', 'pro', 'professional', 'business', 'executive', 'insider']

// POST /api/members/complete-registration
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId

  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tier } = body

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be one of: rising, professional, business, insider' },
        { status: 400 }
      )
    }

    // Build update object based on tier
    const updateData: any = {
      role: tier,
      registration_completed: true,
      tier_selected: true,
      city: body.city || null,
      country: body.country || null,
      linkedin_url: body.linkedin_url || null,
      phone: body.phone || null,
      bio: body.bio || null,
    }

    // Tier-specific fields
    if (tier === 'professional' || tier === 'pro' || tier === 'executive') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.seniority = body.seniority || null
      updateData.years_in_luxury = body.years_in_luxury || null
      updateData.department = body.department || null
    } else if (tier === 'business') {
      updateData.maison = body.maison || null
      updateData.job_title = body.job_title || null
      updateData.hiring_needs = body.hiring_needs || null
    } else if (tier === 'insider') {
      updateData.speciality = body.speciality || null
      updateData.consulting_firm = body.consulting_firm || null
      updateData.areas_of_expertise = body.areas_of_expertise || null
    } else if (tier === 'rising') {
      updateData.university = body.university || null
      updateData.field_of_study = body.field_of_study || null
      updateData.graduation_year = body.graduation_year || null
    }

    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select('id, email, role, status, registration_completed')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
