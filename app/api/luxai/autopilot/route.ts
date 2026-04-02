import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// This endpoint is called by a cron job (external service or Coolify cron)
// It checks which autopilot tasks are due and triggers them
// Recommended: call this every hour, it will only run tasks when due

export async function GET() {
  try {
    const { data: settings } = await supabase
      .from('luxai_settings')
      .select('*')
      .eq('category', 'autopilot')

    if (!settings || settings.length === 0) {
      return NextResponse.json({ success: true, message: 'No autopilot settings configured', ran: [] })
    }

    const now = new Date()
    const ran: string[] = []
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://joblux.com'

    for (const setting of settings) {
      if (!setting.value?.enabled) continue

      const lastRun = setting.value?.last_run_at ? new Date(setting.value.last_run_at) : null
      const frequency = setting.value?.frequency || 'daily'
      const hour = setting.value?.hour || 8

      // Check if it's time to run
      const currentHour = now.getUTCHours()
      if (currentHour !== hour) continue

      let shouldRun = false
      if (!lastRun) {
        shouldRun = true
      } else {
        const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)
        if (frequency === 'daily' && hoursSinceLastRun >= 22) shouldRun = true
        if (frequency === 'every_2_days' && hoursSinceLastRun >= 46) shouldRun = true
        if (frequency === 'weekly' && hoursSinceLastRun >= 166) shouldRun = true
        if (frequency === 'biweekly' && hoursSinceLastRun >= 334) shouldRun = true
        if (frequency === 'monthly' && hoursSinceLastRun >= 718) shouldRun = true
        if (frequency === 'quarterly' && hoursSinceLastRun >= 2150) shouldRun = true
      }

      if (!shouldRun) continue

      const taskType = setting.key
      const count = setting.value?.count || 5

      try {
        let endpoint = ''
        let body: any = {}

        if (taskType === 'signals') {
          endpoint = '/api/luxai/generate-signals'
          body = { count }
        } else if (taskType === 'articles') {
          endpoint = '/api/luxai/generate-article'
          body = { topic: 'career-trends' }
        } else if (taskType === 'brand_refresh') {
          endpoint = '/api/luxai/regenerate-wikilux'
          body = { mode: 'all' }
        } else {
          continue
        }

        const res = await fetch(`${baseUrl}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })
        const result = await res.json()

        if (result.success) {
          // Update last_run_at
          await supabase.from('luxai_settings')
            .update({ value: { ...setting.value, last_run_at: now.toISOString() }, updated_at: now.toISOString() })
            .eq('key', setting.key)
            .eq('category', 'autopilot')
          ran.push(`${taskType}: success`)
        } else {
          ran.push(`${taskType}: failed - ${result.message}`)
        }
      } catch (e: any) {
        ran.push(`${taskType}: error - ${e.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: ran.length > 0 ? `Ran ${ran.length} autopilot tasks` : 'No tasks due right now',
      ran,
      checked_at: now.toISOString()
    })
  } catch (error: any) {
    console.error('Autopilot error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// POST to save/update autopilot settings
export async function POST(request: Request) {
  try {
    const { key, enabled, frequency, count, hour } = await request.json()
    if (!key) return NextResponse.json({ success: false, message: 'key required' }, { status: 400 })

    const value = { enabled: !!enabled, frequency: frequency || 'daily', count: count || 5, hour: hour || 8, last_run_at: null }

    // Upsert setting
    const { data: existing } = await supabase
      .from('luxai_settings')
      .select('key, value')
      .eq('key', key)
      .eq('category', 'autopilot')
      .maybeSingle()

    if (existing) {
      const merged = { ...existing.value, ...value, last_run_at: existing.value?.last_run_at }
      await supabase.from('luxai_settings').update({ value: merged, updated_at: new Date().toISOString() }).eq('key', key).eq('category', 'autopilot')
    } else {
      await supabase.from('luxai_settings').insert({ key, category: 'autopilot', value })
    }

    return NextResponse.json({ success: true, message: `Autopilot "${key}" ${enabled ? 'enabled' : 'disabled'}` })
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
