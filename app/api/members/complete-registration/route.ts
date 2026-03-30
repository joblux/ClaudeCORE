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

const VALID_TIERS = ['rising', 'pro', 'professional', 'business', 'insider']

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

    const { firstName, lastName, contactPref, phone, city, country, cv_url, status: requestedStatus } = body
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || null
    const memberStatus = requestedStatus === 'incomplete' ? 'incomplete' : 'pending'

    // Build update object
    const updateData: any = {
      role: tier,
      status: memberStatus,
      registration_completed: memberStatus === 'pending',
      tier_selected: true,
      full_name: fullName,
      first_name: firstName || null,
      last_name: lastName || null,
      contact_preference: contactPref || 'email',
      phone: phone || null,
      city: city || null,
      country: country || null,
      cv_url: cv_url || null,
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

    // Send admin notification for all tiers
    const memberName = data.full_name || data.email
    const tierLabels: Record<string, string> = {
      rising: 'Emerging Professional',
      pro: 'Established Professional',
      professional: 'Established Professional',
      executive: 'Senior & Executive',
      business: 'Luxury Employer',
      insider: 'Trusted Contributor',
    }
    const tierDisplay = tierLabels[tier] || tier
    const { html, text } = adminNewMemberEmail({
      name: memberName,
      email: data.email,
      tier: tierDisplay,
      company: [city, country].filter(Boolean).join(', ') || undefined,
      registrationDate: new Date().toISOString().split('T')[0],
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New JOBLUX access request — ${memberName}`,
      body: text,
      bodyHtml: html,
    }).catch(() => {})

    return NextResponse.json({ success: true, member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
