import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Allowed file extensions and their MIME types
const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.rtf', '.txt', '.jpg', '.jpeg', '.png']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * GET /api/members/documents
 * List all documents for the authenticated member, ordered by uploaded_at DESC.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('member_documents')
      .select('*')
      .eq('member_id', session.user.memberId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Fetch documents error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ documents: data })
  } catch (err) {
    console.error('GET /api/members/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/members/documents
 * Upload a document via multipart/form-data.
 * Fields: file (File), document_type (string), label (string, optional).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const documentType = formData.get('document_type') as string | null
    const label = formData.get('label') as string | null

    if (!file) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    if (!documentType?.trim()) {
      return NextResponse.json({ error: 'document_type is required' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 })
    }

    // Validate file extension
    const fileName = file.name.toLowerCase()
    const ext = '.' + fileName.split('.').pop()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 }
      )
    }

    // Build storage path: {memberId}/{timestamp}-{filename}
    const timestamp = Date.now()
    const storagePath = `${session.user.memberId}/${timestamp}-${file.name}`

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('member-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('member-documents')
      .getPublicUrl(storagePath)

    // Save metadata to member_documents table
    const { data: document, error: insertError } = await supabase
      .from('member_documents')
      .insert({
        member_id: session.user.memberId,
        document_type: documentType.trim(),
        label: label?.trim() || null,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        url: urlData.publicUrl,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Document record insert error:', insertError)
      // Attempt to clean up the uploaded file
      await supabase.storage.from('member-documents').remove([storagePath])
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ document }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/members/documents?id=xxx
 * Delete a document from both storage and database. Verifies ownership.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id query parameter is required' }, { status: 400 })
    }

    // Verify ownership and get storage path
    const { data: existing, error: fetchError } = await supabase
      .from('member_documents')
      .select('id, member_id, storage_path')
      .eq('id', id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    if (existing.member_id !== session.user.memberId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from storage
    if (existing.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('member-documents')
        .remove([existing.storage_path])

      if (storageError) {
        console.error('Storage delete error:', storageError)
        // Continue to delete the database record even if storage delete fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('member_documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Document record delete error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/members/documents error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
