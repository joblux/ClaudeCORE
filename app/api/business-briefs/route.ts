import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/ses'
import { adminNewBriefEmail, briefReceivedEmail, RECRUITING_ALERT_EMAIL } from '@/lib/email-templates'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if (!memberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('business_briefs')
    .select('id, company_name, brief_type, status, created_at')
    .eq('created_by', memberId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ briefs: data || [] })
}

const ATTACHMENT_MAX_SIZE = 10 * 1024 * 1024
const ATTACHMENT_ALLOWED_EXTS = ['.pdf', '.doc', '.docx']

export async function POST(req: Request) {
  try {
    // Require authenticated business member before any work
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const body: Record<string, string> = {}
    formData.forEach((value, key) => {
      if (typeof value === 'string') body[key] = value
    })

    // Validate required fields
    const required = ['company_name', 'company_type', 'brief_type', 'sector', 'urgency', 'confidentiality_level', 'brief_summary', 'contact_name', 'contact_email', 'preferred_follow_up']
    for (const field of required) {
      if (!body[field] || !body[field].trim()) {
        return NextResponse.json({ success: false, error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Optional attachment validation
    const attachment = formData.get('attachment') as File | null
    if (attachment && attachment.size > 0) {
      const lower = attachment.name.toLowerCase()
      const validExt = ATTACHMENT_ALLOWED_EXTS.some(ext => lower.endsWith(ext))
      if (!validExt) {
        return NextResponse.json({ success: false, error: 'Unsupported file type. Please upload a PDF or Word document.' }, { status: 400 })
      }
      if (attachment.size > ATTACHMENT_MAX_SIZE) {
        return NextResponse.json({ success: false, error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
      }
    }

    const record = {
      company_name: body.company_name.trim(),
      company_website: body.company_website?.trim() || null,
      company_type: body.company_type,
      geography: body.geography?.trim() || null,
      brief_type: body.brief_type,
      sector: body.sector,
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
      status: 'under_review',
      created_by: memberId,
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('business_briefs')
      .insert(record)
      .select('id')
      .maybeSingle()

    if (error || !inserted) {
      return NextResponse.json({ success: false, error: error?.message || 'Insert failed' }, { status: 500 })
    }

    // Upload attachment if present, then update row + sign URL for email
    let attachmentSignedUrl: string | null = null
    let attachmentFilename: string | null = null
    if (attachment && attachment.size > 0) {
      try {
        const buffer = Buffer.from(await attachment.arrayBuffer())
        const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const path = `${inserted.id}/${Date.now()}-${safeName}`
        const { error: uploadError } = await supabaseAdmin.storage
          .from('business-brief-attachments')
          .upload(path, buffer, {
            contentType: attachment.type || 'application/octet-stream',
            upsert: false,
          })
        if (!uploadError) {
          await supabaseAdmin
            .from('business_briefs')
            .update({ attachment_path: path, attachment_filename: attachment.name })
            .eq('id', inserted.id)
          attachmentFilename = attachment.name
          const { data: signed } = await supabaseAdmin.storage
            .from('business-brief-attachments')
            .createSignedUrl(path, 259200)
          attachmentSignedUrl = signed?.signedUrl || null
        } else {
          console.error('Brief attachment upload failed:', uploadError)
        }
      } catch (uploadErr) {
        console.error('Brief attachment processing error:', uploadErr)
      }
    }

    // Admin notification
    const admin = adminNewBriefEmail({
      briefId: inserted.id,
      companyName: record.company_name,
      companyWebsite: record.company_website,
      companyType: record.company_type,
      geography: record.geography,
      briefType: record.brief_type,
      sector: record.sector,
      urgency: record.urgency,
      confidentiality: record.confidentiality_level,
      mandateTitle: record.mandate_title,
      seniorityLevel: record.seniority_level,
      functionArea: record.function,
      location: record.location,
      compensationRange: record.compensation_range,
      contactName: record.contact_name,
      contactEmail: record.contact_email,
      contactRole: record.contact_role,
      preferredFollowUp: record.preferred_follow_up,
      bestTiming: record.best_timing,
      summary: record.brief_summary,
      additionalContext: record.additional_context,
      attachmentUrl: attachmentSignedUrl || undefined,
      attachmentFilename: attachmentFilename || undefined,
    })
    await sendEmail({
      to: RECRUITING_ALERT_EMAIL,
      subject: `New Business Brief — ${record.company_name}`,
      body: admin.text,
      bodyHtml: admin.html,
    })

    // User confirmation
    const firstName = record.contact_name.split(' ')[0] || record.contact_name
    const user = briefReceivedEmail({
      firstName,
      companyName: record.company_name,
    })
    let accountHolderEmail: string | null = null
    if (memberId) {
      const { data: holder } = await supabaseAdmin
        .from('members')
        .select('email')
        .eq('id', memberId)
        .maybeSingle()
      accountHolderEmail = holder?.email ?? null
    }
    const recipients = Array.from(new Set(
      [record.contact_email, accountHolderEmail]
        .filter((e): e is string => typeof e === 'string' && e.length > 0)
        .map(e => e.trim().toLowerCase())
    ))
    for (const to of recipients) {
      await sendEmail({
        to,
        subject: 'Your brief has been received',
        body: user.text,
        bodyHtml: user.html,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
