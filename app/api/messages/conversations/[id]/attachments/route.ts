import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/messages/conversations/[id]/attachments
 * Upload a file attachment for a conversation.
 * Accepts multipart form data with a 'file' field and optional 'message_id'.
 * Stores the file in Supabase Storage bucket 'message-attachments'
 * under the path conversations/{id}/.
 * Admin only.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { id } = await params

  try {
    // Verify the conversation exists
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', id)
      .single()

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const messageId = formData.get('message_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Generate a unique file path in the storage bucket
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `conversations/${id}/${timestamp}_${sanitizedName}`

    // Read the file as a buffer for upload
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('message-attachments')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get the public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(storagePath)

    // Save metadata to the message_attachments table
    const attachmentData: Record<string, unknown> = {
      conversation_id: id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      url: urlData.publicUrl,
      uploaded_by: session.user.memberId,
    }

    if (messageId) {
      attachmentData.message_id = messageId
    }

    const { data: attachment, error: insertError } = await supabase
      .from('message_attachments')
      .insert(attachmentData)
      .select()
      .single()

    if (insertError) {
      console.error('Error saving attachment metadata:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error uploading attachment:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
