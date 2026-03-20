import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['luxuryistime@gmail.com', 'alex@joblux.com']

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function isAdminRequest(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }

  return NextResponse.json({ maintenance_mode: data.value === 'true' })
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  // Get current value
  const { data: current, error: fetchError } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'maintenance_mode')
    .single()

  if (fetchError) {
    return NextResponse.json({ error: 'Failed to fetch setting' }, { status: 500 })
  }

  const newValue = current.value === 'true' ? 'false' : 'true'

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({
      value: newValue,
      updated_at: new Date().toISOString(),
      updated_by: 'admin',
    })
    .eq('key', 'maintenance_mode')

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }

  return NextResponse.json({ maintenance_mode: newValue === 'true' })
}
