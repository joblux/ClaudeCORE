import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profilux')
    .select('*')
    .eq('email', session.user.email)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If no profilux record yet, seed from members table
  if (!data) {
    const { data: member } = await supabase
      .from('members')
      .select('first_name, last_name, city, country, job_title, current_employer, bio, phone')
      .eq('email', session.user.email)
      .single()

    if (member) {
      return NextResponse.json({
        profile: {
          firstName: member.first_name || '',
          lastName: member.last_name || '',
          city: member.city || '',
          nationality: member.country || '',
          headline: member.job_title ? `${member.job_title}${member.current_employer ? ' · ' + member.current_employer : ''}` : '',
          bio: member.bio || '',
          experience: [],
          specialisations: [],
          languages: [],
          sectors: [],
          markets: [],
          salaryExpectation: 0,
          salaryCurrency: 'EUR',
          availability: '',
          sharingEnabled: false,
          shareSlug: null,
        }
      })
    }
  }

  if (data) {
    // If first/last name empty in profilux, fall back to members table
    let firstName = data.first_name || ''
    let lastName = data.last_name || ''
    if (!firstName && !lastName) {
      const { data: member } = await supabase
        .from('members')
        .select('first_name, last_name')
        .eq('email', session.user.email)
        .single()
      if (member) {
        firstName = member.first_name || ''
        lastName = member.last_name || ''
      }
    }
    return NextResponse.json({
      profile: {
        firstName,
        lastName,
        city: data.city || '',
        nationality: data.nationality || '',
        headline: data.headline || '',
        bio: data.bio || '',
        experience: data.experience || [],
        specialisations: data.specialisations || [],
        languages: data.languages || [],
        sectors: data.sectors || [],
        markets: data.markets || [],
        salaryExpectation: data.salary_expectation || 0,
        salaryCurrency: data.salary_currency || 'EUR',
        availability: data.availability || '',
        sharingEnabled: data.sharing_enabled || false,
        shareSlug: data.share_slug || null,
        photoUrl: data.photo_url || null,
      }
    })
  }

  return NextResponse.json({ profile: null })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const { data: existing } = await supabase
    .from('profilux')
    .select('id, share_slug')
    .eq('email', session.user.email)
    .single()

  const profileData = {
    email: session.user.email,
    first_name: body.firstName,
    last_name: body.lastName,
    city: body.city,
    nationality: body.nationality,
    headline: body.headline,
    bio: body.bio,
    experience: body.experience,
    specialisations: body.specialisations,
    languages: body.languages,
    sectors: body.sectors,
    markets: body.markets,
    salary_expectation: body.salaryExpectation,
    availability: body.availability,
    sharing_enabled: body.sharingEnabled,
    share_slug: existing?.share_slug || body.shareSlug || null,
    updated_at: new Date().toISOString(),
  }

  if (existing?.id) {
    const { error } = await supabase
      .from('profilux')
      .update(profileData)
      .eq('id', existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('profilux')
      .insert({ ...profileData, created_at: new Date().toISOString() })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
