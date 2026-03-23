"use client"

import { useEffect } from "react"

interface Props {
  secondsLeft: number
  onDismiss: () => void
}

export default function InactivityWarningModal({ secondsLeft, onDismiss }: Props) {
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`

  // Clicking anywhere on the page dismisses
  useEffect(() => {
    const handler = () => onDismiss()
    // Use a short delay so the click that might have triggered the modal doesn't immediately dismiss it
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handler)
      window.addEventListener("keydown", handler)
      window.addEventListener("touchstart", handler)
    }, 100)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("mousedown", handler)
      window.removeEventListener("keydown", handler)
      window.removeEventListener("touchstart", handler)
    }
  }, [onDismiss])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "16px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "4px",
          maxWidth: "400px",
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* JOBLUX wordmark */}
        <div
          style={{
            fontFamily: "'Gill Sans', 'Gill Sans MT', Calibri, sans-serif",
            fontSize: "18px",
            fontWeight: 600,
            color: "#1a1a1a",
            letterSpacing: "3px",
            marginBottom: "24px",
          }}
        >
          JOBLUX
        </div>

        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "24px",
            fontWeight: 400,
            color: "#1a1a1a",
            margin: "0 0 12px",
          }}
        >
          Still there?
        </h2>

        {/* Countdown */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#1a1a1a",
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            margin: "16px 0",
            letterSpacing: "2px",
          }}
        >
          {display}
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#777",
            lineHeight: 1.6,
            margin: "0 0 28px",
          }}
        >
          Your session will expire due to inactivity.
        </p>

        <button
          onClick={onDismiss}
          style={{
            display: "inline-block",
            backgroundColor: "#1a1a1a",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: 600,
            padding: "14px 32px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            letterSpacing: "0.5px",
            textTransform: "uppercase" as const,
          }}
        >
          I&apos;m still here
        </button>
      </div>
    </div>
  )
}
