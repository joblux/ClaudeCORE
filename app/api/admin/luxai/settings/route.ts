import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await supabase
      .from('luxai_settings')
      .select('*')
      .single()

    return NextResponse.json({ settings: data })
  } catch (error) {
    console.error('Failed to fetch LUXAI settings:', error)
    return NextResponse.json({ settings: null })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as any)?.role === 'admin'
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await req.json()

    // Upsert settings (single row)
    const { error } = await supabase
      .from('luxai_settings')
      .upsert({
        id: 'default',
        ...settings,
        updated_at: new Date().toISOString(),
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save LUXAI settings:', error)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
