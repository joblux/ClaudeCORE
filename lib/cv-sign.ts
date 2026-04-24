import type { SupabaseClient } from '@supabase/supabase-js'

const CV_BUCKET = 'member-cvs'
const SIGNED_URL_TTL_SECONDS = 3600

export async function signCvPath(
  supabase: SupabaseClient,
  path: string
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(CV_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)

  if (error || !data?.signedUrl) {
    return { url: null, error: error?.message || 'Failed to sign CV URL' }
  }

  return { url: data.signedUrl, error: null }
}
