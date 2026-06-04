import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp']

function isAllowedImage(file: File): boolean {
  // Cek ekstensi filename (lebih reliable dari MIME type antar OS/browser)
  const ext = path.extname(file.name).toLowerCase()
  if (ALLOWED_EXTS.includes(ext)) return true
  // Fallback: cek MIME type
  return file.type.startsWith('image/')
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string | null) ?? 'covers'

  if (!file) return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File terlalu besar (maks 5MB)' }, { status: 400 })
  if (!isAllowedImage(file)) {
    return NextResponse.json({ error: 'Format tidak didukung — gunakan JPG, PNG, atau WebP' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name).toLowerCase() || '.jpg'
  const filename = `thumb-${Date.now()}${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(path.join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/${folder}/${filename}` }, { status: 201 })
}
