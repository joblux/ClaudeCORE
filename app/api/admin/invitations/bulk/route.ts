import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { contacts } = await req.json()
    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts provided' }, { status: 400 })
    }

    // Batch insert | handle up to 1000+ contacts
    const BATCH_SIZE = 500
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      const batch = contacts.slice(i, i + BATCH_SIZE)
      const rows = batch
        .filter((c: any) => c.email && c.email.includes('@'))
        .map((c: any) => ({
          contact_name: c.name || null,
          contact_email: c.email.toLowerCase().trim(),
          contact_title: c.title || null,
          contact_company: c.company || null,
          status: 'sent',
          invited_by: memberId,
          sent_at: new Date().toISOString(),
          source: 'bulk_import',
        }))

      if (rows.length === 0) continue

      const { data, error } = await supabase
        .from('invitations')
        .upsert(rows, { onConflict: 'contact_email', ignoreDuplicates: true })
        .select('id')

      if (error) {
        errorCount += rows.length
        errors.push(error.message)
      } else {
        successCount += data?.length || 0
        errorCount += rows.length - (data?.length || 0)
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      errorMessages: errors.length > 0 ? errors : undefined,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
