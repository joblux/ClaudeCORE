import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { data, error } = await supabase
    .from("members")
    .select("first_name, last_name, email, company_name, job_title, org_type, country, city, avatar_url, status, approved_at, role")
    .eq("email", session.user.email)
    .single()
  if (error || !data) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }
  return NextResponse.json(data)
}
