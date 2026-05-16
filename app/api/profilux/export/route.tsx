import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { renderToBuffer } from '@react-pdf/renderer'
import { resolveProfiLux } from '@/lib/profilux'
import { ProfiLuxPDF } from '@/lib/profilux/pdf/ProfiLuxPDF'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: member, error: memberErr } = await supabase
    .from('members')
    .select('id')
    .eq('email', session.user.email)
    .maybeSingle()

  if (memberErr) {
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
  if (!member) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const view = await resolveProfiLux(member.id, supabase)
  if (!view) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const buffer = await renderToBuffer(<ProfiLuxPDF view={view} />)
  const body = new Uint8Array(buffer)

  const filename = `profilux-${member.id}.pdf`

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
