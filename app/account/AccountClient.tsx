'use client'
import { redirect } from "next/navigation"
export default function AccountClient({ member }: { member: any }) {
  redirect("/dashboard")
}
