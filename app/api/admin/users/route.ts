import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { users, invitations } from '@/lib/db'


export async function GET() {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allUsers = await users.findAll()
  const allInvitations = await invitations.findAll()

  const data = allUsers.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    invitation: allInvitations.find((i) => i.user_id === u.id) ?? null,
  }))

  return NextResponse.json({ users: data })
}
