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
    const { company, orgType, firstName, lastName, email, title, country, city, phone } = await req.json()

    if (!company || !orgType || !firstName || !lastName || !email || !title || !country || !city || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fullName = [firstName, lastName].filter(Boolean).join(" ")

    // Check if email already exists
    const { data: existing } = await supabase
      .from("members")
      .select("id, tier_selected, registration_completed")
      .eq("email", email)
      .maybeSingle()

    if (existing) {
      // Genuine duplicate — already selected a tier or completed registration
      if (existing.tier_selected || existing.registration_completed) {
        return NextResponse.json({ error: "Email already exists", code: "EMAIL_EXISTS" }, { status: 409 })
      }

      // Incomplete account created by magic link or OAuth — update with business data
      const { error: updateError } = await supabase
        .from("members")
        .update({
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone,
          country,
          city,
          role: "business",
          status: "pending",
          registration_completed: true,
          tier_selected: true,
          contact_preference: "email",
          company_name: company,
          job_title: title,
          org_type: orgType,
        })
        .eq("id", existing.id)

      if (updateError) {
        console.error("Employer signup update error:", updateError)
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }
    } else {
      // No existing member — insert new row
      const { error } = await supabase
        .from("members")
        .insert({
          email,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone,
          country,
          city,
          role: "business",
          status: "pending",
          registration_completed: true,
          tier_selected: true,
          contact_preference: "email",
          company_name: company,
          job_title: title,
          org_type: orgType,
        })
        .select("id, email, full_name")
        .single()

      if (error) {
        console.error("Employer signup error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
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
      orgType,
      jobTitle: title,
    })
    sendEmail({
      to: ADMIN_ALERT_EMAIL,
      subject: `New JOBLUX employer request | ${fullName} (${company})`,
      body: admin.text,
      bodyHtml: admin.html,
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
