import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'

const MAX_IMAGE_SIZE = 5  * 1024 * 1024  // 5 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024  // 50 MB

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg']
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp']
const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.ogg']

// Whitelist allowed folders to prevent path traversal
const ALLOWED_FOLDERS = ['covers', 'thumbnails', 'assets', 'templates', 'decorations']

function fileKind(file: File): 'image' | 'video' | null {
  if (IMAGE_TYPES.includes(file.type)) return 'image'
  if (VIDEO_TYPES.includes(file.type)) return 'video'
  const ext = path.extname(file.name).toLowerCase()
  if (IMAGE_EXTS.includes(ext)) return 'image'
  if (VIDEO_EXTS.includes(ext)) return 'video'
  return null
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folderParam = (formData.get('folder') as string | null) ?? 'covers'

    // Sanitize folder parameter to prevent path traversal
    const folder = ALLOWED_FOLDERS.includes(folderParam) ? folderParam : 'covers'

    if (!file) {
      return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })
    }

    const kind = fileKind(file)
    if (!kind) {
      return NextResponse.json({ error: 'Format tidak didukung — gunakan JPG, PNG, WebP, MP4, atau WebM' }, { status: 400 })
    }

    const maxSize = kind === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File terlalu besar (maks ${kind === 'video' ? '50MB untuk video' : '5MB untuk foto'})` },
        { status: 400 }
      )
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase()
    const allowedExts = kind === 'video' ? VIDEO_EXTS : IMAGE_EXTS
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'Ekstensi file tidak valid' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    const filename = `${kind}-${timestamp}-${random}${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder)
    await fs.mkdir(uploadDir, { recursive: true })

    const filepath = path.join(uploadDir, filename)
    await fs.writeFile(filepath, buffer)

    return NextResponse.json({ url: `/uploads/${folder}/${filename}` }, { status: 201 })
  } catch (error) {
    console.error('Admin upload error:', error)
    return NextResponse.json(
      { error: 'Gagal mengupload file. Silakan coba lagi.' },
      { status: 500 }
    )
  }
}
