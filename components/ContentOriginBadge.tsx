'use client'

import { useSession } from 'next-auth/react'

type Origin = 'seed' | 'ai' | 'contributed' | null | undefined

const BADGE_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  seed: {
    label: 'SEED',
    bg: 'rgba(100,100,100,0.15)',
    color: '#666',
    border: 'rgba(100,100,100,0.3)',
  },
  ai: {
    label: 'AI',
    bg: 'rgba(165,142,40,0.12)',
    color: '#a58e28',
    border: 'rgba(165,142,40,0.3)',
  },
  contributed: {
    label: 'CONTRIB',
    bg: 'rgba(63,185,80,0.12)',
    color: '#3fb950',
    border: 'rgba(63,185,80,0.3)',
  },
}

interface Props {
  origin: Origin
  className?: string
}

export function ContentOriginBadge({ origin, className = '' }: Props) {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === 'admin'

  // Only show to admins
  if (!isAdmin || !origin) return null

  const config = BADGE_CONFIG[origin]
  if (!config) return null

  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold tracking-[0.12em] px-1.5 py-[2px] rounded ${className}`}
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
      title={
        origin === 'seed'
          ? 'Placeholder content — to be replaced'
          : origin === 'ai'
          ? 'LUXAI generated content'
          : 'User contributed content'
      }
    >
      {config.label}
    </span>
  )
}
