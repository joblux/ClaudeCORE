"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { restoreFormData, populateFormFields } from "@/lib/useInactivityLogout"

/**
 * Checks for saved form data after login and restores it.
 * Place this component in the dashboard or any post-login page.
 */
export default function FormRestoreHandler() {
  const router = useRouter()
  const [toast, setToast] = useState(false)

  useEffect(() => {
    const { restored, path } = restoreFormData()
    if (!restored || !path) return

    // If we're already on the saved path, populate immediately
    if (window.location.pathname + window.location.search === path) {
      // Small delay to let the page render
      setTimeout(() => {
        const didPopulate = populateFormFields()
        if (didPopulate) setToast(true)
      }, 500)
    } else {
      // Navigate to the saved path — the restoration will happen on that page
      router.push(path)
    }
  }, [router])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(false), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99998,
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        padding: "14px 20px",
        borderRadius: "4px",
        fontSize: "13px",
        fontWeight: 500,
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "360px",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <span style={{ color: "#B8975C" }}>&#10003;</span>
      Your unsaved work has been restored.
      <button
        onClick={() => setToast(false)}
        style={{
          marginLeft: "8px",
          background: "none",
          border: "none",
          color: "#666",
          cursor: "pointer",
          fontSize: "16px",
          padding: "0 4px",
        }}
      >
        &times;
      </button>
    </div>
  )
}
