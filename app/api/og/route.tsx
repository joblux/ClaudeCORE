import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
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
          backgroundColor: '#1a1a1a',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: 6,
            fontFamily: 'sans-serif',
          }}
        >
          JOBLUX.
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 500,
            color: '#a58e28',
            letterSpacing: 8,
            marginTop: 20,
            textTransform: 'uppercase',
          }}
        >
          Luxury Talents Society
        </div>
        <div
          style={{
            width: 200,
            height: 1,
            backgroundColor: '#a58e28',
            opacity: 0.5,
            marginTop: 30,
          }}
        />
        <div
          style={{
            fontSize: 11,
            color: '#555555',
            letterSpacing: 3,
            marginTop: 16,
          }}
        >
          PARIS · LONDON · NEW YORK · DUBAI · SINGAPORE
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
