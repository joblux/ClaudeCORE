import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/ses'
import { contactConfirmationEmail, adminNewContactEmail, ADMIN_ALERT_EMAIL } from '@/lib/email-templates'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, category, subcategory, message, website_url, form_load_timestamp } = body

    // 1. Honeypot | if filled, silently return success (trap bots)
    if (website_url) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    }

    // 2. Timing check | if submitted in under 5 seconds, silently return success
    if (form_load_timestamp && Date.now() - form_load_timestamp < 5000) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    }

    // 3. Validate fields
    if (!name?.trim() || !email?.trim() || !category?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (message.trim().length < 20) {
      return NextResponse.json({ error: 'Message must be at least 20 characters' }, { status: 400 })
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // 4. Rate limit by IP | max 3 per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', oneHourAgo)

    if (count && count >= 3) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
    }

    // 5. Check if user is authenticated
    let memberId: string | null = null
    try {
      const session = await getServerSession(authOptions)
      memberId = (session?.user as any)?.memberId || null
    } catch {}

    // 6. Store in database
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        member_id: memberId,
        name: name.trim(),
        email: email.trim(),
        category: category.trim(),
        subcategory: (subcategory || '').trim() || null,
        message: message.trim(),
        ip_address: ip,
        form_load_timestamp: form_load_timestamp || null,
      })

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Send confirmation email to the sender
    const { html: confirmHtml, text: confirmText } = contactConfirmationEmail({
      firstName: name.trim().split(' ')[0],
    })
    sendEmail({
      to: email.trim(),
      subject: 'We received your message',
      body: confirmText,
      bodyHtml: confirmHtml,
    }).catch(() => {})

    // Send admin alert
    const { html: adminHtml, text: adminText } = adminNewContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: `${category}${subcategory ? ' | ' + subcategory : ''}`,
      messagePreview: message.trim().slice(0, 300),
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New contact: ${name.trim()} | ${category}`,
      body: adminText,
      bodyHtml: adminHtml,
    }).catch(() => {})

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
