import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { paymentProofs, invitations } from '@/lib/db'


interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as { status: 'approved' | 'rejected'; admin_notes?: string; packageDuration?: number }
  const proof = await paymentProofs.findById(params.id)
  if (!proof) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await paymentProofs.update(params.id, {
    status: body.status,
    admin_notes: body.admin_notes || '',
    reviewed_at: new Date().toISOString(),
  })

  // Kalau disetujui, aktifkan undangan
  if (body.status === 'approved') {
    const duration = body.packageDuration ?? 6
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + duration)
    await invitations.update(proof.invitation_id, {
      is_paid: true,
      is_published: true,
      expires_at: expiresAt.toISOString(),
    })
  }

  return NextResponse.json({ proof: updated })
}
