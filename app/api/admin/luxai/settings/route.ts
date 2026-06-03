import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await supabase
      .from('luxai_settings')
      .select('*')
    
    const settings: Record<string, any> = {}
    data?.forEach(item => {
      settings[item.key] = item.value
    })
    
    return NextResponse.json({ settings })
  } catch (error) {
    return NextResponse.json({ settings: {} })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    for (const [key, value] of Object.entries(body)) {
      await supabase
        .from('luxai_settings')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        }, {
          onConflict: 'key'
        })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
