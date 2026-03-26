import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const downloadLocation = searchParams.get('download_location')

    if (!downloadLocation) {
      return NextResponse.json({ error: 'download_location is required' }, { status: 400 })
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY
    if (!accessKey) {
      return NextResponse.json({ error: 'Unsplash not configured' }, { status: 503 })
    }

    // Trigger the download event as required by Unsplash API guidelines
    const res = await fetch(`${downloadLocation}?client_id=${accessKey}`)

    if (!res.ok) {
      console.error('Unsplash download trigger failed:', res.status)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Download trigger error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
