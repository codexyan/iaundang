import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { invitations, guests } from '@/lib/db'

export const dynamic = 'force-dynamic'

const schema = z.object({
  invitationId: z.string().uuid(),
  name: z.string().min(1).max(100),
  attending: z.boolean(),
  totalGuests: z.number().min(0).max(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
    }

    const { invitationId, name, attending, totalGuests } = parsed.data

    const inv = await invitations.findById(invitationId)
    if (!inv || !inv.is_published) {
      return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
    }

    const guest = await guests.create({
      invitation_id: invitationId,
      name,
      phone: '',
      group: '',
      note: '',
      source: 'rsvp',
      attending,
      total_guests: totalGuests,
    })

    return NextResponse.json({ guest })
  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan RSVP' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const invitationId = req.nextUrl.searchParams.get('invitationId') || ''
    return NextResponse.json({ guests: await guests.findByInvitationId(invitationId) })
  } catch (error) {
    console.error('RSVP GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat data RSVP' }, { status: 500 })
  }
}
