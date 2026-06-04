import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { invitations } from '@/lib/db'


interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const updated = await invitations.update(params.id, body)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ invitation: updated })
}
