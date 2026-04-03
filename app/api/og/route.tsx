import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'JOBLUX'
  const subtitle = searchParams.get('subtitle') || 'Luxury Industry Careers Intelligence'
  const type = searchParams.get('type') || 'page'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#222222',
          position: 'relative',
        }}
      >
        {/* Gold accent line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: '#a58e28',
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: '#a58e28',
            letterSpacing: 6,
            fontFamily: 'sans-serif',
            marginBottom: 40,
          }}
        >
          JOBLUX.
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 40 ? 36 : 48,
            fontWeight: 400,
            color: '#ffffff',
            fontFamily: 'serif',
            textAlign: 'center',
            maxWidth: '80%',
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>

        {/* Divider */}
        <div
          style={{
            width: 120,
            height: 1,
            backgroundColor: '#a58e28',
            opacity: 0.6,
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: '#a58e28',
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
          }}
        >
          {subtitle}
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            right: 32,
            fontSize: 11,
            color: '#555555',
            letterSpacing: 2,
            fontFamily: 'sans-serif',
          }}
        >
          joblux.com
        </div>

        {/* Type badge */}
        {type !== 'page' && (
          <div
            style={{
              position: 'absolute',
              top: 24,
              right: 32,
              fontSize: 10,
              color: '#a58e28',
              letterSpacing: 3,
              textTransform: 'uppercase',
              border: '1px solid rgba(165, 142, 40, 0.3)',
              padding: '4px 12px',
              fontFamily: 'sans-serif',
            }}
          >
            {type === 'brand' ? 'WikiLux' : type === 'article' ? 'BlogLux' : type}
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
