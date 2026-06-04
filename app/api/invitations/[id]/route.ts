import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { invitations } from '@/lib/db'

interface Params { params: { id: string } }

// PATCH /api/invitations/[id] — update undangan
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const inv = await invitations.findById(params.id)
  if (!inv || inv.user_id !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()

  // Jika ada slug baru, cek ketersediaannya
  if (body.slug && body.slug !== inv.slug && await invitations.slugExists(body.slug, params.id)) {
    return NextResponse.json({ error: 'Slug sudah dipakai' }, { status: 409 })
  }

  const updated = await invitations.update(params.id, body)
  return NextResponse.json({ invitation: updated })
}
