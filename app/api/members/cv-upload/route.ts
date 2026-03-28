// Run in Supabase SQL editor:
// INSERT INTO storage.buckets (id, name, public) VALUES ('member-cvs', 'member-cvs', false) ON CONFLICT DO NOTHING;

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  const memberId = (session?.user as any)?.memberId
  if (!memberId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('cv') as File | null
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    // Validate file type
    const fileName = file.name.toLowerCase()
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload a PDF or Word document.' }, { status: 400 })
    }

    // Validate file size
    const buffer = Buffer.from(await file.arrayBuffer())
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${memberId}/${timestamp}-${safeName}`

    const { data, error } = await supabase.storage
      .from('member-cvs')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.error('Supabase storage error:', error)
      return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 })
    }

    // Get the URL (signed or public depending on bucket config)
    const { data: urlData } = supabase.storage
      .from('member-cvs')
      .getPublicUrl(data.path)

    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err) {
    console.error('CV upload error:', err)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
