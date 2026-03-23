import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { escapeConsultationEmail, adminNewEscapeEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, contact_preference, trip_types, destination_text, experience_prefs, occasion, preferred_dates, duration, date_flexibility, budget_range, plan_scope, past_trips_text, favorite_hotels, additional_notes, travelers, is_cruise, cruise_details } = body

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Check if user is logged in
    let userId: string | null = null
    let tier: string | undefined
    try {
      const session = await getServerSession(authOptions)
      if (session?.user?.memberId) {
        userId = session.user.memberId
        const { data: member } = await supabase
          .from('members')
          .select('role')
          .eq('id', userId)
          .single()
        tier = member?.role
      }
    } catch {}

    const { data: consultation, error } = await supabase
      .from('escape_consultations')
      .insert({
        user_id: userId,
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        contact_preference: contact_preference || 'email',
        trip_types: trip_types || [],
        destination_text: destination_text?.trim() || null,
        experience_prefs: experience_prefs || [],
        occasion: occasion || null,
        preferred_dates: preferred_dates?.trim() || null,
        duration: duration?.trim() || null,
        date_flexibility: date_flexibility || null,
        budget_range: budget_range || null,
        plan_scope: plan_scope || [],
        past_trips_text: past_trips_text?.trim() || null,
        favorite_hotels: favorite_hotels?.trim() || null,
        additional_notes: additional_notes?.trim() || null,
        travelers: travelers || [],
        is_cruise: is_cruise || false,
        cruise_details: cruise_details || null,
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send confirmation email to visitor
    const firstName = name.trim().split(' ')[0]
    const { html: confirmHtml, text: confirmText } = escapeConsultationEmail({ firstName })
    sendEmail({
      to: email.trim(),
      subject: 'We received your travel request',
      body: confirmText,
      bodyHtml: confirmHtml,
    }).catch(() => {})

    // Send admin alert
    const { html: adminHtml, text: adminText } = adminNewEscapeEmail({
      name: name.trim(),
      email: email.trim(),
      tripType: trip_types?.[0] || undefined,
      destination: destination_text?.trim() || undefined,
      budget: budget_range || undefined,
      dates: preferred_dates?.trim() || undefined,
      tier: tier || 'Visitor',
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New travel request: ${name.trim()} — ${destination_text?.trim() || 'TBD'}`,
      body: adminText,
      bodyHtml: adminHtml,
    }).catch(() => {})

    return NextResponse.json({ success: true, consultation_id: consultation.id }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = (page - 1) * limit

  let query = supabase
    .from('escape_consultations')
    .select('*, member:members!user_id(full_name, role, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,destination_text.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ consultations: data, total: count, page, limit })
}
