import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendEmail } from "@/lib/ses"
import { employerPendingEmail, adminNewEmployerEmail, ADMIN_ALERT_EMAIL } from "@/lib/email-templates"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { company, orgType, firstName, lastName, email, title, country, phone } = await req.json()

    if (!company || !firstName || !lastName || !email || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id")
      .eq("email", email)
      .single()

    if (existing) {
      return NextResponse.json({ error: "Email already exists", code: "EMAIL_EXISTS" }, { status: 409 })
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ")

    const { data, error } = await supabase
      .from("members")
      .insert({
        email,
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        country,
        role: "business",
        status: "pending",
        registration_completed: true,
        tier_selected: true,
        contact_preference: "email",
        company_name: company,
        job_title: title || null,
        org_type: orgType || null,
      })
      .select("id, email, full_name")
      .single()

    if (error) {
      console.error("Employer signup error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send pending confirmation to employer (#7)
    const pending = employerPendingEmail({ firstName, companyName: company })
    sendEmail({
      to: email,
      subject: "We received your request",
      body: pending.text,
      bodyHtml: pending.html,
    }).catch(() => {})

    // Send admin notification (#9)
    const admin = adminNewEmployerEmail({
      name: fullName,
      email,
      companyName: company,
      orgType: orgType || undefined,
      jobTitle: title || undefined,
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New JOBLUX employer request — ${fullName} (${company})`,
      body: admin.text,
      bodyHtml: admin.html,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
