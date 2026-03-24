import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADVISOR_EMAIL = 'mo.mzaour@fora.travel'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      first_name, last_name, email, phone, preferred_language,
      travel_styles, destinations, preferred_dates, special_needs,
      budget_range, notes, source_context, source_page,
    } = body

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data: consultation, error } = await supabase
      .from('escape_consultations')
      .insert({
        first_name: first_name?.trim() || null,
        last_name: last_name?.trim() || null,
        email: email.trim(),
        phone: phone?.trim() || null,
        preferred_language: preferred_language?.trim() || null,
        travel_styles: travel_styles || [],
        destinations: destinations?.trim() || null,
        preferred_dates: preferred_dates?.trim() || null,
        special_needs: special_needs?.trim() || null,
        budget_range: budget_range?.trim() || null,
        notes: notes?.trim() || null,
        source_context: source_context?.trim() || null,
        source_page: source_page || null,
        status: 'new',
      })
      .select('id')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email to advisor
    const fullName = [first_name, last_name].filter(Boolean).join(' ') || 'A visitor'
    const subject = `New Escape consultation: ${source_context || 'General inquiry'}`
    const emailBody = [
      `New travel consultation from JOBLUX Escape`,
      ``,
      `Name: ${fullName}`,
      `Email: ${email.trim()}`,
      phone ? `Phone: ${phone.trim()}` : null,
      preferred_language ? `Preferred language: ${preferred_language.trim()}` : null,
      travel_styles?.length > 0 ? `Travel styles: ${travel_styles.join(', ')}` : null,
      destinations ? `Destinations: ${destinations.trim()}` : null,
      preferred_dates ? `Preferred dates: ${preferred_dates.trim()}` : null,
      budget_range ? `Budget: ${budget_range.trim()}` : null,
      special_needs ? `Special needs: ${special_needs.trim()}` : null,
      notes ? `Notes: ${notes.trim()}` : null,
      ``,
      source_context ? `Source: ${source_context}` : null,
      source_page ? `Page: ${source_page}` : null,
      `Submitted: ${new Date().toISOString()}`,
    ].filter(Boolean).join('\n')

    sendEmail({
      to: ADVISOR_EMAIL,
      subject,
      body: emailBody,
      bodyHtml: `<pre style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">${emailBody}</pre>`,
    }).catch(() => {})

    return NextResponse.json({ success: true, id: consultation.id }, { status: 201 })
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
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (search) {
    query = query.or(`first_name.ilike.%${search}%,email.ilike.%${search}%,destinations.ilike.%${search}%`)
  }

  const { data, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ consultations: data, total: count, page, limit })
}
