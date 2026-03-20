import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function isAdminRequest(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        updated_by TEXT
      );
      INSERT INTO site_settings (key, value) VALUES ('maintenance_mode', 'false')
      ON CONFLICT (key) DO NOTHING;
    `,
  })

  // If rpc doesn't exist, try direct insert as fallback
  if (error) {
    const { error: insertError } = await supabase
      .from('site_settings')
      .upsert(
        { key: 'maintenance_mode', value: 'false' },
        { onConflict: 'key' }
      )

    if (insertError) {
      return NextResponse.json({ error: 'Failed to initialize settings' }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
