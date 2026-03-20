import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    // Fetch the member by resume slug, only if public
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(
        'id, first_name, last_name, avatar_url, city, country, open_to_relocation, role, resume_headline, resume_show_email, resume_show_phone, email, phone'
      )
      .eq('resume_slug', slug)
      .eq('resume_public', true)
      .maybeSingle()

    if (memberError) {
      console.error('Resume fetch error:', memberError)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    if (!member) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 })
    }

    const memberId = member.id

    // Fetch related data in parallel
    const [workExp, education, languages, sectors] = await Promise.all([
      supabase
        .from('work_experiences')
        .select('*')
        .eq('member_id', memberId)
        .order('start_date', { ascending: false }),

      supabase
        .from('education_records')
        .select('*')
        .eq('member_id', memberId)
        .order('graduation_year', { ascending: false }),

      supabase
        .from('member_languages')
        .select('*')
        .eq('member_id', memberId),

      supabase
        .from('member_sectors')
        .select('*')
        .eq('member_id', memberId)
        .then((res) => {
          // If the table doesn't exist, return empty array
          if (res.error?.code === '42P01' || res.error?.message?.includes('does not exist')) {
            return { data: [], error: null }
          }
          return res
        }),
    ])

    // Build the response, respecting privacy toggles
    const resume: Record<string, unknown> = {
      first_name: member.first_name,
      last_name: member.last_name,
      avatar_url: member.avatar_url,
      city: member.city,
      country: member.country,
      open_to_relocation: member.open_to_relocation,
      role: member.role,
      resume_headline: member.resume_headline,
      work_experiences: workExp.data || [],
      education_records: education.data || [],
      languages: languages.data || [],
      sectors: sectors.data || [],
    }

    // Only include contact info if the member has opted in
    if (member.resume_show_email) {
      resume.email = member.email
    }
    if (member.resume_show_phone) {
      resume.phone = member.phone
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
