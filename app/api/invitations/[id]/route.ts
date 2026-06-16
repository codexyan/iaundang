import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { invitations, musicTracks } from '@/lib/db'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const inv = await invitations.findById(params.id)
    if (!inv || inv.user_id !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await invitations.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Invitation delete error:', error)
    return NextResponse.json({ error: 'Gagal menghapus undangan' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const inv = await invitations.findById(params.id)
    if (!inv || inv.user_id !== session.userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = await req.json()

    if (body.slug && body.slug !== inv.slug && await invitations.slugExists(body.slug, params.id)) {
      return NextResponse.json({ error: 'Slug sudah dipakai' }, { status: 409 })
    }

    const newMusicUrl = body.data?.music?.url
    const oldMusicUrl = (inv.data as unknown as { music?: { url?: string } })?.music?.url
    if (newMusicUrl && newMusicUrl !== oldMusicUrl) {
      try {
        const track = await prisma.musicTrack.findFirst({ where: { url: newMusicUrl } })
        if (track) await musicTracks.incrementUsage(track.id)
      } catch { /* non-critical */ }
    }

    const updated = await invitations.update(params.id, body)
    return NextResponse.json({ invitation: updated })
  } catch (error) {
    console.error('Invitation update error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui undangan' }, { status: 500 })
  }
}
