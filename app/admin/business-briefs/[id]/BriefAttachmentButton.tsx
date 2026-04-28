'use client'

type Props = {
  briefId: string
  filename: string
}

export default function BriefAttachmentButton({ briefId, filename }: Props) {
  return (
    <button
      onClick={async () => {
        try {
          const res = await fetch(`/api/admin/business-briefs/${briefId}/sign-attachment`, {
            method: 'POST',
          })
          if (!res.ok) {
            console.error('Brief attachment sign failed:', res.status)
            return
          }
          const { url } = await res.json()
          if (url) window.open(url, '_blank', 'noopener,noreferrer')
        } catch (err) {
          console.error('Brief attachment sign error:', err)
        }
      }}
      style={{
        fontSize: 14,
        color: '#111',
        textDecoration: 'underline',
        background: 'transparent',
        border: 0,
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      {filename}
    </button>
  )
}
