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
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const memberId = typeof body?.memberId === 'string' ? body.memberId : undefined
  const documentId = typeof body?.documentId === 'string' ? body.documentId : undefined

  if ((memberId && documentId) || (!memberId && !documentId)) {
    return NextResponse.json({ error: 'Provide exactly one of memberId or documentId' }, { status: 400 })
  }

  let path: string | null = null

  if (memberId) {
    const { data: member, error: memberErr } = await supabase
      .from('members')
      .select('cv_url')
      .eq('id', memberId)
      .maybeSingle()

    if (memberErr || !member?.cv_url) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    path = member.cv_url
  } else if (documentId) {
    const { data: doc, error: docErr } = await supabase
      .from('member_documents')
      .select('file_url')
      .eq('id', documentId)
      .eq('document_type', 'cv')
      .maybeSingle()

    if (docErr || !doc?.file_url) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    path = doc.file_url
  }

  const { url, error } = await signCvPath(supabase, path!)
  if (!url) {
    console.error('Admin CV sign failed:', error)
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
