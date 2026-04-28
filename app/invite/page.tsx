import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import InviteClient from "./InviteClient"

export default async function InvitePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) redirect("/auth/signin")

  const memberId = (session.user as any).memberId
  const status = (session.user as any).status
  const role = (session.user as any).role

  if (!memberId) redirect("/auth/signin")
  if (status === "new") redirect("/join")
  if (status === "pending") redirect("/members/pending")
  if (status !== "approved" && role !== "admin") redirect("/auth/signin")

  return <InviteClient />
}
