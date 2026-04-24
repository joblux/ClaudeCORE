"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { signOut } from "next-auth/react"
import { useMember } from "./auth-hooks"

// ── Configuration ──
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes
const WARNING_BEFORE_MS = 5 * 60 * 1000       // Show warning at 55 min (5 min before logout)
const CHECK_INTERVAL_MS = 30 * 1000            // Check every 30s in normal mode
const COUNTDOWN_INTERVAL_MS = 1000             // Check every 1s during warning
const STORAGE_KEY = "joblux_last_activity"
const FORM_STORAGE_KEY = "joblux_unsaved_form"
const RETURN_TO_KEY = "joblux_return_to"
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const

function now() {
  return Date.now()
}

function getLastActivity(): number {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? parseInt(stored, 10) : now()
  } catch {
    return now()
  }
}

function setLastActivity(ts: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(ts))
  } catch {}
}

/** Serialize all form data on the current page into sessionStorage */
function saveFormData() {
  try {
    const forms = document.querySelectorAll("form")
    const data: Record<string, string> = {}
    let hasData = false

    // Collect from all forms and loose inputs
    const inputs = document.querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input, textarea, select")

    inputs.forEach((el) => {
      const key = el.name || el.id
      if (!key) return
      if (el.type === "hidden" || el.type === "password" || el.type === "submit") return

      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        if (el.checked) {
          data[key] = el.value
          hasData = true
        }
      } else {
        if (el.value) {
          data[key] = el.value
          hasData = true
        }
      }
    })

    if (hasData) {
      sessionStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          path: window.location.pathname + window.location.search,
          data,
          savedAt: now(),
        })
      )
    }
  } catch {}
}

/** Restore form data after re-login. Returns true if data was restored. */
export function restoreFormData(): { restored: boolean; path?: string } {
  try {
    const raw = sessionStorage.getItem(FORM_STORAGE_KEY)
    if (!raw) return { restored: false }

    const { path, data, savedAt } = JSON.parse(raw)
    const ageMs = now() - savedAt
    if (ageMs > 24 * 60 * 60 * 1000) {
      // Older than 24 hours — discard
      sessionStorage.removeItem(FORM_STORAGE_KEY)
      return { restored: false }
    }

    return { restored: true, path }
  } catch {
    return { restored: false }
  }
}

/** Populate form fields from saved data. Call after navigation to the saved path. */
export function populateFormFields(): boolean {
  try {
    const raw = sessionStorage.getItem(FORM_STORAGE_KEY)
    if (!raw) return false

    const { data } = JSON.parse(raw)
    let populated = false

    Object.entries(data).forEach(([key, value]) => {
      const el = document.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >(`[name="${key}"], #${CSS.escape(key)}`)
      if (!el) return

      if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
        el.checked = el.value === value
      } else {
        el.value = value as string
        // Trigger React's onChange
        const nativeSet = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          "value"
        )?.set || Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        )?.set
        if (nativeSet) {
          nativeSet.call(el, value)
          el.dispatchEvent(new Event("input", { bubbles: true }))
          el.dispatchEvent(new Event("change", { bubbles: true }))
        }
      }
      populated = true
    })

    sessionStorage.removeItem(FORM_STORAGE_KEY)
    return populated
  } catch {
    return false
  }
}

export function useInactivityLogout() {
  const { isAuthenticated, isAdmin, isLoading } = useMember()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300) // 5 minutes
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Admin or unauthenticated — skip everything
  const shouldRun = isAuthenticated && !isAdmin && !isLoading

  const recordActivity = useCallback(() => {
    if (!shouldRun) return
    setLastActivity(now())

    // If warning is showing, dismiss it
    if (showWarning) {
      setShowWarning(false)
      setSecondsLeft(300)
    }
  }, [shouldRun, showWarning])

  const performLogout = useCallback(() => {
    saveFormData()
    // Save return path for post-login redirect
    try {
      sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search)
    } catch {}
    // Clean up storage
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    signOut({ callbackUrl: "/members?error=inactivity" })
  }, [])

  // Attach activity listeners
  useEffect(() => {
    if (!shouldRun) return

    // Set initial activity
    setLastActivity(now())

    const handler = () => recordActivity()
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handler, { passive: true }))

    // Listen for cross-tab activity updates
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        // Another tab recorded activity — dismiss warning if showing
        if (showWarning) {
          setShowWarning(false)
          setSecondsLeft(300)
        }
      }
    }
    window.addEventListener("storage", storageHandler)

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handler))
      window.removeEventListener("storage", storageHandler)
    }
  }, [shouldRun, recordActivity, showWarning])

  // Main check interval (every 30s)
  useEffect(() => {
    if (!shouldRun) return

    intervalRef.current = setInterval(() => {
      const last = getLastActivity()
      const elapsed = now() - last

      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        performLogout()
      } else if (elapsed >= INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS && !showWarning) {
        setShowWarning(true)
        const remaining = Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed)
        setSecondsLeft(Math.ceil(remaining / 1000))
      }
    }, CHECK_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [shouldRun, showWarning, performLogout])

  // Warning countdown (every 1s)
  useEffect(() => {
    if (!showWarning || !shouldRun) {
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current)
      return
    }

    warningIntervalRef.current = setInterval(() => {
      const last = getLastActivity()
      const elapsed = now() - last
      const remaining = Math.max(0, INACTIVITY_TIMEOUT_MS - elapsed)
      const secs = Math.ceil(remaining / 1000)

      if (secs <= 0) {
        performLogout()
      } else {
        setSecondsLeft(secs)
      }
    }, COUNTDOWN_INTERVAL_MS)

    return () => {
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current)
    }
  }, [showWarning, shouldRun, performLogout])

  const dismissWarning = useCallback(() => {
    recordActivity()
  }, [recordActivity])

  return { showWarning, secondsLeft, dismissWarning }
}
