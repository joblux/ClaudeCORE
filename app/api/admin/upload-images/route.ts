import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ensureBucket, fetchAndUpload } from '@/lib/luxai/imageHost'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { images, slug } = await req.json() as {
      images: Array<{ url: string; index: number }>
      slug: string
    }

    if (!images?.length || !slug) {
      return NextResponse.json({ error: 'Missing images or slug' }, { status: 400 })
    }

    await ensureBucket()

    const timestamp = Date.now()
    const seen = new Map<string, string>() // dedupe

    // Process in batches of 5
    const BATCH = 5
    const results: Array<{ originalUrl: string; newUrl: string; success: boolean; error?: string }> = []

    for (let i = 0; i < images.length; i += BATCH) {
      const batch = images.slice(i, i + BATCH)
      const settled = await Promise.allSettled(
        batch.map(async (img) => {
          // Dedupe
          if (seen.has(img.url)) {
            return { originalUrl: img.url, newUrl: seen.get(img.url)!, success: true }
          }

          try {
            const path = `articles/${slug}/${timestamp}-${img.index}`
            const publicUrl = await fetchAndUpload(img.url, path)
            seen.set(img.url, publicUrl)
            return { originalUrl: img.url, newUrl: publicUrl, success: true }
          } catch (err: any) {
            return { originalUrl: img.url, newUrl: '', success: false, error: err.message }
          }
        })
      )

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          results.push({ originalUrl: '', newUrl: '', success: false, error: result.reason?.message })
        }
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
