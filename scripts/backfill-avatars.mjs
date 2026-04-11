// One-shot backfill: download every members.avatar_url that is not already
// hosted in the dedicated 'avatars' Supabase Storage bucket, upload the
// bytes to avatars/{id}.jpg, and rewrite avatar_url to the resulting
// Supabase public URL.
//
// Storage doctrine — DO NOT mix concerns:
//   bucket 'avatars' = account/header avatars ONLY
//   bucket 'media'   = generic media library, hotel photos, article
//                      covers, bloglux uploads, etc.
//   future bucket    = Profilux private photos (separate, private)
//
// Idempotent: rerun safely. Members already in the avatars bucket are skipped.
// Also cleans up legacy 'media/avatars/{id}.jpg' artefacts left over from
// the brief period before the dedicated bucket existed.
//
// Usage (from project root):
//   node scripts/backfill-avatars.mjs

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key)

const AVATAR_BUCKET = 'avatars'
const LEGACY_MEDIA_AVATAR_PREFIX = '/storage/v1/object/public/media/avatars/'

function isInDedicatedAvatarsBucket(u) {
  if (!u) return false
  return u.includes('/storage/v1/object/public/avatars/')
}

function isLegacyMediaAvatar(u) {
  if (!u) return false
  return u.includes(LEGACY_MEDIA_AVATAR_PREFIX)
}

async function removeLegacyMediaArtefact(memberId) {
  // Best-effort cleanup of any leftover bytes in media/avatars/{id}.jpg
  // from the brief window before the dedicated bucket existed.
  const legacyPath = `avatars/${memberId}.jpg`
  const { error } = await supabase.storage.from('media').remove([legacyPath])
  if (error && !/not found/i.test(error.message)) {
    console.warn(`    legacy media cleanup warning for ${memberId}: ${error.message}`)
  }
}

async function backfillOne(member) {
  const { id, email, avatar_url } = member
  if (!avatar_url) {
    console.log(`  ${email}: no avatar_url, skipping`)
    return { skipped: true }
  }
  if (isInDedicatedAvatarsBucket(avatar_url)) {
    console.log(`  ${email}: already in dedicated 'avatars' bucket, skipping`)
    return { skipped: true }
  }

  console.log(`  ${email}: fetching ${avatar_url.substring(0, 80)}...`)
  let res
  try {
    res = await fetch(avatar_url)
  } catch (err) {
    console.error(`  ${email}: fetch threw — ${err.message}`)
    return { error: err.message }
  }
  if (!res.ok) {
    console.error(`  ${email}: fetch returned ${res.status}`)
    return { error: `HTTP ${res.status}` }
  }

  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buf = Buffer.from(await res.arrayBuffer())
  const storagePath = `${id}.jpg`

  const { error: uploadErr } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, buf, { contentType, upsert: true })

  if (uploadErr) {
    console.error(`  ${email}: upload failed — ${uploadErr.message}`)
    return { error: uploadErr.message }
  }

  const { data: urlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(storagePath)

  const newUrl = urlData.publicUrl
  if (!newUrl) {
    console.error(`  ${email}: getPublicUrl returned empty`)
    return { error: 'no public url' }
  }

  const { error: updateErr } = await supabase
    .from('members')
    .update({ avatar_url: newUrl })
    .eq('id', id)

  if (updateErr) {
    console.error(`  ${email}: db update failed — ${updateErr.message}`)
    return { error: updateErr.message }
  }

  // If the source URL was a legacy media/avatars/ object, delete the bytes
  // from the wrong bucket so the only copy lives in the dedicated one.
  if (isLegacyMediaAvatar(avatar_url)) {
    await removeLegacyMediaArtefact(id)
    console.log(`    cleaned up legacy media/avatars/${id}.jpg`)
  }

  console.log(`  ${email}: ✓ ${newUrl.substring(0, 80)}...`)
  return { ok: true, newUrl }
}

async function main() {
  const { data: members, error } = await supabase
    .from('members')
    .select('id, email, avatar_url')
    .not('avatar_url', 'is', null)
    .neq('avatar_url', '')

  if (error) {
    console.error('Failed to load members:', error.message)
    process.exit(1)
  }

  console.log(`Found ${members.length} member(s) with avatar_url\n`)

  const results = { ok: 0, skipped: 0, error: 0 }
  for (const m of members) {
    const r = await backfillOne(m)
    if (r.ok) results.ok++
    else if (r.skipped) results.skipped++
    else results.error++
  }

  console.log(`\nDone. ok=${results.ok} skipped=${results.skipped} error=${results.error}`)
}

main().catch((err) => {
  console.error('Backfill crashed:', err)
  process.exit(1)
})
