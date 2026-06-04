import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSession } from '@/lib/session-server'

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'user'

  if (!file) return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Maksimal 8MB' }, { status: 400 })

  const ext = path.extname(file.name).toLowerCase()
  if (!ALLOWED_EXTS.includes(ext) && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Format tidak didukung' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const safeName = `${session.userId.slice(0, 8)}-${Date.now()}${ext || '.jpg'}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, safeName), Buffer.from(bytes))

  return NextResponse.json({ url: `/uploads/${folder}/${safeName}` }, { status: 201 })
}
