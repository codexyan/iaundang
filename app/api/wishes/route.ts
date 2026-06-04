import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { invitations, wishes } from '@/lib/db'

const schema = z.object({
  invitationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { invitationId, name, message } = parsed.data

  const inv = await invitations.findById(invitationId)
  if (!inv || !inv.is_published) {
    return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
  }

  const wish = await wishes.create({ invitation_id: invitationId, name, message })
  return NextResponse.json({ wish })
}

// GET /api/wishes?invitationId=xxx — untuk dashboard
export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitationId') || ''
  return NextResponse.json({ wishes: await wishes.findByInvitationId(invitationId) })
}
