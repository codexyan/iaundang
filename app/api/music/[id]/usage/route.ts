import { NextRequest, NextResponse } from 'next/server'
import { musicTracks } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await musicTracks.incrementUsage(params.id)
  return NextResponse.json({ ok: true })
}
