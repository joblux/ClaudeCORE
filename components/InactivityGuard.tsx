"use client"

import { useInactivityLogout } from "@/lib/useInactivityLogout"
import InactivityWarningModal from "./InactivityWarningModal"

/**
 * Wraps the app to provide inactivity auto-logout.
 * Admin users are exempt — the hook returns early for them.
 */
export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  const { showWarning, secondsLeft, dismissWarning } = useInactivityLogout()

  return (
    <>
      {children}
      {showWarning && (
        <InactivityWarningModal secondsLeft={secondsLeft} onDismiss={dismissWarning} />
      )}
    </>
  )
}
