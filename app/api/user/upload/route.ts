import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getSession } from '@/lib/session-server'
import { uploadToStorage } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MAX_IMAGE = 8 * 1024 * 1024   // 8 MB
const MAX_VIDEO = 80 * 1024 * 1024  // 80 MB
const MAX_AUDIO = 15 * 1024 * 1024  // 15 MB
const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const VIDEO_EXTS = ['.mp4', '.webm', '.mov']
const AUDIO_EXTS = ['.mp3', '.m4a', '.wav', '.ogg', '.aac']
const ALLOWED_FOLDERS = ['user', 'music', 'photos', 'videos']

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
    const safeName = `${session.userId.slice(0, 8)}-${Date.now()}${ext || (isVideo ? '.mp4' : isAudio ? '.mp3' : '.jpg')}`
    const storagePath = `${folder}/${safeName}`

    const publicUrl = await uploadToStorage(buffer, storagePath, file.type || 'application/octet-stream')

    return NextResponse.json({ url: publicUrl, type: kind }, { status: 201 })
  } catch (error) {
    console.error('User upload error:', error)
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
}
