import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/ses'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate required fields
    const required = ['company_name', 'sector', 'company_type', 'brief_type', 'urgency', 'confidentiality_level', 'brief_summary', 'contact_name', 'contact_email', 'preferred_follow_up']
    for (const field of required) {
      if (!body[field] || (typeof body[field] === 'string' && !body[field].trim())) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Get session for created_by (nullable)
    let createdBy: string | null = null
    try {
      const session = await getServerSession(authOptions)
      if (session?.user && (session.user as any).memberId) {
        createdBy = (session.user as any).memberId
      }
    } catch {}

    const record = {
      company_name: body.company_name.trim(),
      company_website: body.company_website?.trim() || null,
      sector: body.sector,
      company_type: body.company_type,
      geography: body.geography?.trim() || null,
      brief_type: body.brief_type,
      urgency: body.urgency,
      confidentiality_level: body.confidentiality_level,
      mandate_title: body.mandate_title?.trim() || null,
      brief_summary: body.brief_summary.trim(),
      seniority_level: body.seniority_level || null,
      function: body.function || null,
      location: body.location?.trim() || null,
      compensation_range: body.compensation_range?.trim() || null,
      additional_context: body.additional_context?.trim() || null,
      contact_name: body.contact_name.trim(),
      contact_email: body.contact_email.trim(),
      contact_role: body.contact_role?.trim() || null,
      preferred_follow_up: body.preferred_follow_up,
      best_timing: body.best_timing?.trim() || null,
      status: 'new',
      created_by: createdBy,
    }

    const { error } = await supabaseAdmin.from('business_briefs').insert(record)

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // Send notification email to alex@joblux.com (CC mo@joblux.com)
    await sendEmail({
      to: 'alex@joblux.com',
      cc: 'mo@joblux.com',
      subject: `New Business Brief — ${record.company_name}`,
      body: [
        `New business brief submitted on JOBLUX.`,
        ``,
        `Company: ${record.company_name}`,
        `Brief type: ${record.brief_type}`,
        `Urgency: ${record.urgency}`,
        `Confidentiality: ${record.confidentiality_level}`,
        `Contact: ${record.contact_name} (${record.contact_email})`,
        ``,
        `Summary:`,
        record.brief_summary,
      ].join('\n'),
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
