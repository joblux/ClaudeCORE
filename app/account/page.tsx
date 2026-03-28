import { requireApproved } from "@/lib/auth-server"
import AccountClient from "./AccountClient"

export default async function AccountPage() {
  const member = await requireApproved()
  return <AccountClient member={member} />
}
