import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(req: NextRequest) {
  const { photos } = await req.json() as { photos: Array<{ id: string; sort_order: number }> }

  if (!photos?.length) {
    return NextResponse.json({ error: 'photos array required' }, { status: 400 })
  }

  for (const p of photos) {
    await supabase
      .from('escape_hotel_photos')
      .update({ sort_order: p.sort_order })
      .eq('id', p.id)
  }

  return NextResponse.json({ success: true })
}
