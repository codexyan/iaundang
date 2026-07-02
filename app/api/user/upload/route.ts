import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getSession } from '@/lib/session-server'
import { uploadToStorage } from '@/lib/supabase'
import { processArticleImage } from '@/lib/image-process'

export const dynamic = 'force-dynamic'

const MAX_IMAGE = 8 * 1024 * 1024   // 8 MB
const MAX_VIDEO = 80 * 1024 * 1024  // 80 MB
const MAX_AUDIO = 15 * 1024 * 1024  // 15 MB
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const VIDEO_EXTS = ['.mp4', '.webm', '.mov']
const AUDIO_EXTS = ['.mp3', '.m4a', '.wav', '.ogg', '.aac']
const ALLOWED_FOLDERS = ['user', 'music', 'photos', 'videos']

const MAGIC_SIGS: { kind: string; bytes: number[]; offset?: number }[] = [
  { kind: 'image', bytes: [0xFF, 0xD8, 0xFF] },
  { kind: 'image', bytes: [0x89, 0x50, 0x4E, 0x47] },
  { kind: 'image', bytes: [0x52, 0x49, 0x46, 0x46] },
  { kind: 'image', bytes: [0x47, 0x49, 0x46, 0x38] },
  { kind: 'video', bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 },
  { kind: 'video', bytes: [0x1A, 0x45, 0xDF, 0xA3] },
  { kind: 'audio', bytes: [0xFF, 0xFB] },
  { kind: 'audio', bytes: [0x49, 0x44, 0x33] },
  { kind: 'audio', bytes: [0x4F, 0x67, 0x67, 0x53] },
  { kind: 'audio', bytes: [0x52, 0x49, 0x46, 0x46] },
]

function validateMagic(buffer: Buffer, kind: string): boolean {
  const sigs = MAGIC_SIGS.filter(s => s.kind === kind)
  if (sigs.length === 0) return true
  return sigs.some(s => {
    const off = s.offset ?? 0
    return s.bytes.every((b, i) => buffer[off + i] === b)
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folderParam = (formData.get('folder') as string | null) ?? 'user'
    const folder = ALLOWED_FOLDERS.includes(folderParam) ? folderParam : 'user'

    if (!file) return NextResponse.json({ error: 'File wajib diisi' }, { status: 400 })

    const ext = path.extname(file.name).toLowerCase()
    const isVideo = VIDEO_EXTS.includes(ext) || file.type.startsWith('video/')
    const isAudio = AUDIO_EXTS.includes(ext) || file.type.startsWith('audio/')
    const isImage = IMAGE_EXTS.includes(ext) || file.type.startsWith('image/')

    if (!isVideo && !isAudio && !isImage) {
      return NextResponse.json({ error: 'Format tidak didukung (JPG/PNG/WebP, MP4/WebM/MOV, atau MP3/M4A/WAV)' }, { status: 400 })
    }

    const maxSize = isVideo ? MAX_VIDEO : isAudio ? MAX_AUDIO : MAX_IMAGE
    if (file.size > maxSize) {
      const label = isVideo ? '80MB untuk video' : isAudio ? '15MB untuk audio' : '8MB untuk foto'
      return NextResponse.json({ error: `Maks ${label}` }, { status: 400 })
    }

    const kind = isVideo ? 'video' : isAudio ? 'audio' : 'image'
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (!validateMagic(buffer, kind)) {
      return NextResponse.json({ error: 'Konten file tidak sesuai dengan format yang dideklarasikan' }, { status: 400 })
    }

    // Article images (writer editor) get auto-resized/compressed via `process`.
    let outBuffer: Buffer | Uint8Array = buffer
    let outExt = ext || (isVideo ? '.mp4' : isAudio ? '.mp3' : '.jpg')
    let outType = file.type || 'application/octet-stream'
    let width: number | undefined
    let height: number | undefined
    let lowRes = false
    const processVariant = formData.get('process') as string | null
    if (kind === 'image' && (processVariant === 'cover' || processVariant === 'inline')) {
      const p = await processArticleImage(buffer, processVariant)
      if (p.ext) { outBuffer = p.buffer; outExt = p.ext; outType = p.contentType; width = p.width; height = p.height; lowRes = p.lowRes }
    }

    const safeName = `${session.userId.slice(0, 8)}-${Date.now()}${outExt}`
    const storagePath = `${folder}/${safeName}`

    const publicUrl = await uploadToStorage(outBuffer, storagePath, outType)

    return NextResponse.json({ url: publicUrl, type: kind, width, height, bytes: outBuffer.length, lowRes }, { status: 201 })
  } catch (error) {
    console.error('User upload error:', error)
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
}
