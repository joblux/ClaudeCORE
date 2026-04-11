import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Account avatar storage doctrine — DO NOT mix concerns:
//   bucket 'avatars' = account/header avatars ONLY (this route)
//   bucket 'media'   = generic media library, hotel photos, article
//                      covers, bloglux uploads, etc.
//   future bucket    = Profilux private photos (separate, private)
//
// members.avatar_url points only at objects inside 'avatars'.
const AVATAR_BUCKET = 'avatars'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const status = (session?.user as any)?.status

    if (!memberId || status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const storagePath = `${memberId}.jpg`

    // Upload to the dedicated 'avatars' bucket. Avatars do NOT go into
    // the general 'media' bucket and are NOT registered in media_library —
    // they are an account-only asset, separate from the editorial library.
    const { error: uploadError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }

    // Get the public URL from the avatars bucket
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(storagePath)

    const avatarUrl = urlData.publicUrl

    // Update member record
    const { error: updateError } = await supabase
      .from('members')
      .update({ avatar_url: avatarUrl })
      .eq('id', memberId)

    if (updateError) {
      console.error('Avatar URL update error:', updateError)
      return NextResponse.json({ error: 'Failed to update avatar URL' }, { status: 500 })
    }

    return NextResponse.json({ avatar_url: avatarUrl })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    const memberId = (session?.user as any)?.memberId
    const status = (session?.user as any)?.status

    if (!memberId || status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storagePath = `${memberId}.jpg`

    // Delete from the dedicated avatars bucket
    const { error: deleteError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove([storagePath])

    if (deleteError) {
      console.error('Avatar delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete avatar' }, { status: 500 })
    }

    // Set avatar_url to null
    const { error: updateError } = await supabase
      .from('members')
      .update({ avatar_url: null })
      .eq('id', memberId)

    if (updateError) {
      console.error('Avatar URL clear error:', updateError)
      return NextResponse.json({ error: 'Failed to clear avatar URL' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Avatar delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
