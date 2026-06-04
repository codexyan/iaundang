import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSession } from '@/lib/session-server'
import { invitations } from '@/lib/db'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

// POST /api/galleries/music — upload musik background
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const invitationId = formData.get('invitationId') as string
  const file = formData.get('file') as File | null

  if (!file || !invitationId) {
    return NextResponse.json({ error: 'File dan invitationId wajib diisi' }, { status: 400 })
  }

  const inv = await invitations.findById(invitationId)
  if (!inv || inv.user_id !== session.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File terlalu besar (max 20MB)' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name) || '.mp3'
  const filename = `music-${session.userId}-${Date.now()}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, filename), buffer)

  const musicUrl = `/uploads/${filename}`
  await invitations.update(invitationId, {
    data: { ...inv.data, musicUrl },
  })

  return NextResponse.json({ musicUrl })
}
