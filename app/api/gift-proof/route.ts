import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { invitations, giftProofs } from '@/lib/db'

const schema = z.object({
  invitationId: z.string().min(1),
  name:         z.string().min(1).max(100),
  proofUrl:     z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })

  const { invitationId, name, proofUrl } = parsed.data

  // Skip DB check for preview mode
  if (invitationId !== 'preview') {
    const inv = await invitations.findById(invitationId)
    if (!inv || !inv.is_published) {
      return NextResponse.json({ error: 'Undangan tidak ditemukan' }, { status: 404 })
    }
    const proof = await giftProofs.create({ invitation_id: invitationId, name, proof_url: proofUrl })
    return NextResponse.json({ proof }, { status: 201 })
  }

  return NextResponse.json({ proof: { id: 'preview', invitation_id: invitationId, name, proof_url: proofUrl, created_at: new Date().toISOString() } }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const invitationId = req.nextUrl.searchParams.get('invitationId') ?? ''
  if (!invitationId) return NextResponse.json({ proofs: [] })
  return NextResponse.json({ proofs: await giftProofs.findByInvitationId(invitationId) })
}
