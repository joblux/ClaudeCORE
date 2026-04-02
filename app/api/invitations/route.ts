import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { randomBytes } from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function generateInviteCode(): string {
  return randomBytes(8).toString('hex')
}

// GET /api/invitations | get member's sent invitations
export async function GET() {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId

  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('invited_by', memberId)
    .order('sent_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Stats
  const total = data?.length || 0
  const clicked = data?.filter((i: any) => i.status === 'clicked' || i.status === 'registered' || i.status === 'approved').length || 0
  const registered = data?.filter((i: any) => i.status === 'registered' || i.status === 'approved').length || 0

  return NextResponse.json({
    invitations: data || [],
    stats: { total, clicked, registered },
  })
}

// POST /api/invitations | send invitations
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId

  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { contacts, source } = body

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    // Get member's referral code
    const { data: member } = await supabase
      .from('members')
      .select('referral_code, full_name')
      .eq('id', memberId)
      .single()

    const referralCode = member?.referral_code || generateInviteCode()

    // If member doesn't have a referral code, create one
    if (!member?.referral_code) {
      await supabase
        .from('members')
        .update({ referral_code: referralCode })
        .eq('id', memberId)
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://www.luxuryrecruiter.com'
    const results: any[] = []

    for (const contact of contacts) {
      const email = contact.email?.toLowerCase()?.trim()
      if (!email) continue

      // Check if already invited by this member
      const { data: existing } = await supabase
        .from('invitations')
        .select('id')
        .eq('invited_by', memberId)
        .eq('contact_email', email)
        .single()

      if (existing) {
        results.push({ email, status: 'already_invited' })
        continue
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('members')
        .select('id')
        .eq('email', email)
        .single()

      if (existingMember) {
        results.push({ email, status: 'already_member' })
        continue
      }

      const inviteCode = generateInviteCode()
      const inviteLink = `${baseUrl}/join?ref=${referralCode}&invite=${inviteCode}`

      const { error: insertError } = await supabase
        .from('invitations')
        .insert({
          invited_by: memberId,
          contact_name: contact.name || null,
          contact_email: email,
          contact_title: contact.title || null,
          contact_company: contact.company || null,
          source: source || 'manual',
          status: 'sent',
          invite_link: inviteLink,
        })

      if (insertError) {
        results.push({ email, status: 'error', error: insertError.message })
      } else {
        results.push({ email, status: 'sent', invite_link: inviteLink })
      }
    }

    // Update invite count directly
    const { data: memberData } = await supabase
      .from('members')
      .select('invite_count')
      .eq('id', memberId)
      .single()

    const currentCount = memberData?.invite_count || 0
    const sentCount = results.filter(r => r.status === 'sent').length

    await supabase
      .from('members')
      .update({ invite_count: currentCount + sentCount })
      .eq('id', memberId)

    return NextResponse.json({
      success: true,
      results,
      summary: {
        sent: results.filter((r) => r.status === 'sent').length,
        already_invited: results.filter((r) => r.status === 'already_invited').length,
        already_member: results.filter((r) => r.status === 'already_member').length,
        errors: results.filter((r) => r.status === 'error').length,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
