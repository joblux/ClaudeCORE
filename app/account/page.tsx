import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import AccountClient from "./AccountClient"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) redirect("/join")

  const memberId = (session.user as any).memberId
  const status = (session.user as any).status
  const role = (session.user as any).role

  if (!memberId) redirect("/join")
  if (status === "new") redirect("/join")
  if (status === "pending") redirect("/members/pending")
  if (status !== "approved" && role !== "admin") redirect("/members")

  // Fetch full member data from Supabase
  const { data: member } = await supabase
    .from("members")
    .select("id, email, first_name, last_name, full_name, role, status, city, country, phone, phone_country_code, job_title, current_employer, company_name, bio, avatar_url, created_at, approved_at")
    .eq("id", memberId)
    .maybeSingle()

  return <AccountClient member={member || { email: session.user.email, role, status }} />
}
