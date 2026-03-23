import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { adminNewMemberEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const VALID_TIERS = ['rising', 'pro', 'professional', 'business', 'executive', 'insider']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if (!memberId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  try {
    const body = await req.json()
    const { tier, sectors, domains } = body

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    // Build update object
    const updateData: any = {
      role: tier,
      registration_completed: true,
      tier_selected: true,
      city: body.city || null,
      country: body.country || null,
      contact_preference: body.contact_preference || 'email_only',
      profile_visibility: body.profile_visibility || 'team_only',
      phone: body.phone || null,
    }

    // Tier-specific fields
    if (tier === 'rising') {
      updateData.university = body.university || null
      updateData.field_of_study = body.field_of_study || null
      updateData.graduation_year = body.graduation_year ? parseInt(body.graduation_year) : null
      updateData.seeking_role = body.seeking_role || null
    } else if (tier === 'pro') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.department = body.department || null
    } else if (tier === 'professional') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.seniority = body.seniority || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
    } else if (tier === 'executive') {
      updateData.job_title = body.job_title || null
      updateData.maison = body.maison || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
    } else if (tier === 'business') {
      updateData.maison = body.maison || null
      updateData.company_email = body.company_email || null
      updateData.job_title = body.job_title || null
      updateData.department = body.department || null
      updateData.company_website = body.company_website || null
      updateData.company_size = body.company_size || null
      updateData.how_heard = body.how_heard || null
    } else if (tier === 'insider') {
      updateData.speciality = body.speciality || null
      updateData.consulting_firm = body.consulting_firm || null
      updateData.expertise_tags = body.expertise_tags || null
      updateData.years_in_luxury = body.years_in_luxury ? parseInt(body.years_in_luxury) : null
      updateData.linkedin_url = body.website || null // reuse linkedin_url field for website
      updateData.how_heard = body.how_heard || null
    }

    // Update member
    const { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', memberId)
      .select('id, email, full_name, role, status, registration_completed')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Insert sectors
    if (sectors && Array.isArray(sectors) && sectors.length > 0) {
      await supabase.from('member_sectors').delete().eq('member_id', memberId)
      const sectorRows = sectors.map((s: any) => ({
        member_id: memberId,
        sector: s.name,
        rank: s.rank,
      }))
      await supabase.from('member_sectors').insert(sectorRows)
    }

    // Insert domains
    if (domains && Array.isArray(domains) && domains.length > 0) {
      await supabase.from('member_domains').delete().eq('member_id', memberId)
      const domainRows = domains.map((d: any) => ({
        member_id: memberId,
        domain: d.name,
        rank: d.rank,
      }))
      await supabase.from('member_domains').insert(domainRows)
    }

    // Business/Insider: send admin notification email
    if (tier === 'business' || tier === 'insider') {
      const memberName = data.full_name || data.email
      const company = body.maison || body.consulting_firm || 'Unknown'
      const { html, text } = adminNewMemberEmail({
        name: memberName,
        email: data.email,
        tier: tier === 'business' ? 'Business' : 'Insider',
        company,
        registrationDate: new Date().toISOString().split('T')[0],
      })
      sendEmail({
        to: ADMIN_ALERT_EMAIL,
        subject: `New access request: ${memberName} (${tier === 'business' ? 'Business' : 'Insider'})`,
        body: text,
        bodyHtml: html,
      }).catch(() => {})
    }

    // Rising/Pro/Pro+/Executive: trigger AI review in background
    if (['rising', 'pro', 'professional', 'executive'].includes(tier)) {
      fetch(`${process.env.NEXTAUTH_URL}/api/admin/members/ai-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-key': process.env.NEXTAUTH_SECRET || '',
        },
        body: JSON.stringify({ member_id: memberId }),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
