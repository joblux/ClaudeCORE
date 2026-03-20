import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { DIRECTORY_ACCESS_ROLES } from '@/types/directory'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.memberId || session.user.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role || 'professional'
    if (!DIRECTORY_ACCESS_ROLES.includes(role as any)) {
      return NextResponse.json({ error: 'Insufficient access' }, { status: 403 })
    }

    const { member_id, message } = await req.json()

    if (!member_id || !message?.trim()) {
      return NextResponse.json(
        { error: 'member_id and message are required' },
        { status: 400 }
      )
    }

    const db = supabaseAdmin() as any

    // Fetch target member info
    const { data: targetMember } = await db
      .from('members')
      .select('id, full_name, job_title, maison, current_employer')
      .eq('id', member_id)
      .eq('status', 'approved')
      .single()

    if (!targetMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const target = targetMember as any

    // Fetch requester info
    const { data: requester } = await db
      .from('members')
      .select('id, full_name, job_title, maison, current_employer, role')
      .eq('id', session.user.memberId)
      .single()

    const req_ = (requester as any) || {}
    const requesterName = req_.full_name || session.user.name || 'A member'
    const requesterRole = req_.role || role
    const targetName = target.full_name || 'Unknown Member'
    const targetTitle = target.job_title || ''
    const targetEmployer = target.maison || target.current_employer || ''

    // Create conversation
    const subject = `Introduction Request: ${targetName}`
    const body = `${requesterName} (${requesterRole}) has requested an introduction to ${targetName}${targetTitle ? ` (${targetTitle}` : ''}${targetEmployer ? ` at ${targetEmployer})` : targetTitle ? ')' : ''}.\n\nMessage:\n${message.trim()}`

    const { data: conversation, error: convError } = await db
      .from('conversations')
      .insert({
        participant_type: 'candidate',
        member_id: session.user.memberId,
        subject,
        status: 'active',
      })
      .select()
      .single()

    if (convError) {
      console.error('Error creating intro conversation:', convError)
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
    }

    const conv = conversation as any

    // Create the initial message
    const { error: msgError } = await db
      .from('messages')
      .insert({
        conversation_id: conv.id,
        sender_type: 'candidate',
        sender_name: requesterName,
        body,
        sent_at: new Date().toISOString(),
      })

    if (msgError) {
      console.error('Error creating intro message:', msgError)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    // Update conversation with last message
    await db
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: body.slice(0, 100),
        unread_count: 1,
      })
      .eq('id', conv.id)

    return NextResponse.json({ success: true, conversation_id: conv.id }, { status: 201 })
  } catch (err) {
    console.error('Request intro API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
