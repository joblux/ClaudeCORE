import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { signCvPath } from '@/lib/cv-sign'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let documentId: string | undefined
  try {
    const body = await req.json().catch(() => ({}))
    if (body && typeof body.documentId === 'string') {
      documentId = body.documentId
    }
  } catch {
    // empty body is allowed
  }

  let path: string | null = null

  if (documentId) {
    const { data: doc, error: docErr } = await supabase
      .from('member_documents')
      .select('file_url')
      .eq('id', documentId)
      .eq('member_id', memberId)
      .maybeSingle()

    if (docErr || !doc?.file_url) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    path = doc.file_url
  } else {
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('cv_url')
      .eq('id', memberId)
      .maybeSingle()

    if (memberErr || !member?.cv_url) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    path = member.cv_url
  }

  const { url, error } = await signCvPath(supabase, path!)
  if (!url) {
    console.error('CV sign failed:', error)
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
