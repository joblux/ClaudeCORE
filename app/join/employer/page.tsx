import type { Metadata } from "next"
import EmployerSignupClient from "./EmployerSignupClient"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function EmployerSignupPage() {
  return <EmployerSignupClient />
}
