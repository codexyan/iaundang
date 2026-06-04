import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { paymentProofs } from '@/lib/db'


export async function GET() {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ proofs: await paymentProofs.findAll() })
}
