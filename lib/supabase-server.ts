import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client for public content pages.
 * Uses the anon key — no auth/cookies needed for public data.
 */
export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
