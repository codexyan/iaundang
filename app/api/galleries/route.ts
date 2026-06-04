import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { galleries, invitations } from '@/lib/db'

// GET /api/galleries?invitationId=xxx
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const invitationId = req.nextUrl.searchParams.get('invitationId') || ''
  const inv = await invitations.findById(invitationId)
  if (!inv || inv.user_id !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ galleries: await galleries.findByInvitationId(invitationId) })
}
