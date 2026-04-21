import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    const email = body?.email

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 })
    }

    const normalized = email.toLowerCase().trim()

    const { data: member } = await supabase
      .from("members")
      .select("id")
      .eq("email", normalized)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ status: "ok" })
    }

    const { data: accounts } = await supabase
      .from("nextauth_accounts")
      .select("provider")
      .eq("member_id", member.id)
      .neq("provider", "email")
      .limit(1)

    if (accounts && accounts.length > 0) {
      return NextResponse.json({ status: "provider_mismatch", provider: accounts[0].provider })
    }

    return NextResponse.json({ status: "ok" })
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 })
  }
}
