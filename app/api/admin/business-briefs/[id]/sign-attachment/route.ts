import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role
  if (!session || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: brief, error: briefErr } = await supabase
    .from('business_briefs')
    .select('attachment_path')
    .eq('id', params.id)
    .maybeSingle()

  if (briefErr || !brief?.attachment_path) {
    return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
  }

  const { data: signed, error: signErr } = await supabase.storage
    .from('business-brief-attachments')
    .createSignedUrl(brief.attachment_path, 3600)

  if (signErr || !signed?.signedUrl) {
    console.error('Brief attachment sign failed:', signErr)
    return NextResponse.json({ error: 'Failed to sign URL' }, { status: 500 })
  }

  return NextResponse.json({ url: signed.signedUrl })
}
