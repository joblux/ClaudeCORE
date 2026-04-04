import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const user = session.user as any

  // Only insider role can submit (role holds tier value: 'insider', 'insider_contributor', etc.)
  const insiderRoles = ['insider', 'insider_contributor', 'insider_key_speaker']
  if (!insiderRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Only Trusted Contributors can submit Insider Voices' }, { status: 403 })
  }

  const body = await req.json()
  const { title, excerpt, bodyText, authorName, authorRole, coverImageUrl, externalLink } = body

  if (!title || !excerpt || !bodyText) {
    return NextResponse.json({ error: 'Title, hook quote, and body are required' }, { status: 400 })
  }

  // Generate unique slug
  const baseSlug = slugify(title)
  const slug = `${baseSlug}-${Date.now().toString(36)}`

  const { data, error } = await supabase
    .from('bloglux_articles')
    .insert({
      slug,
      title,
      excerpt,           // the hook quote shown on the card
      body: bodyText,    // full article body
      category: 'Insider Voice',
      author_name: authorName || user.name || 'Insider Voice',
      author_role: authorRole || '',
      cover_image_url: coverImageUrl || null,
      status: 'draft',   // goes to approval queue
      content_origin: 'contributed',
      read_time_minutes: Math.ceil(bodyText.split(' ').length / 200),
      meta_title: title,
      meta_description: excerpt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, slug')
    .single()

  if (error) {
    console.error('Voice submit error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // TODO: send admin notification email via SES when configured

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug })
}
