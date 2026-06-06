/**
 * MusicForm - Background music settings (TIER 1 CRITICAL)
 * Upload music or choose from library
 */

'use client'

import { useState, useRef } from 'react'
import { Music, Upload, Loader2, Play, Pause, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import FormField, { inputClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'

interface MusicFormProps {
  musicUrl: string
  musicTitle: string
  onMusicUrlChange: (url: string) => void
  onMusicTitleChange: (title: string) => void
}

// Pre-selected wedding songs library
const MUSIC_LIBRARY = [
  {
    title: 'Perfect - Ed Sheeran',
    url: 'https://www.bensound.com/bensound-music/bensound-romantic.mp3',
  },
  {
    title: 'A Thousand Years - Christina Perri',
    url: 'https://www.bensound.com/bensound-music/bensound-love.mp3',
  },
  {
    title: 'Marry You - Bruno Mars',
    url: 'https://www.bensound.com/bensound-music/bensound-happiness.mp3',
  },
  {
    title: 'All of Me - John Legend',
    url: 'https://www.bensound.com/bensound-music/bensound-tenderness.mp3',
  },
]

export default function MusicForm({
  musicUrl,
  musicTitle,
  onMusicUrlChange,
  onMusicTitleChange,
}: MusicFormProps) {
  const [uploading, setUploading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  async function handleUpload(file: File) {
    if (!file.type.startsWith('audio/')) {
      toast.error('File harus berupa audio (MP3, M4A, dll)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }

    setUploading(true)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'music')

      const res = await fetch('/api/user/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')

      const { url } = await res.json()
      onMusicUrlChange(url)
      onMusicTitleChange(file.name.replace(/\.[^/.]+$/, ''))
      toast.success('Musik berhasil diupload!')
    } catch (error) {
      toast.error('Gagal upload musik')
    } finally {
      setUploading(false)
    }
  }

  function selectFromLibrary(song: typeof MUSIC_LIBRARY[0]) {
    onMusicUrlChange(song.url)
    onMusicTitleChange(song.title)
    toast.success(`Dipilih: ${song.title}`)
  }

  function togglePlay() {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  function removeMusic() {
    onMusicUrlChange('')
    onMusicTitleChange('')
    setPlaying(false)
    if (audioRef.current) audioRef.current.pause()
  }

  return (
    <SectionCard
      title="Musik Latar"
      icon={Music}
      description="Musik yang diputar saat membuka undangan (opsional)"
    >
      {/* Audio player (hidden) */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Current Music */}
      {musicUrl ? (
        <div className="p-4 border-2 border-gold-300 bg-gold-50 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold-500 text-white flex items-center justify-center">
              <Music size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-900">{musicTitle || 'Musik Terpilih'}</p>
              <p className="text-xs text-stone-600 truncate">{musicUrl}</p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-gold-500 text-white hover:bg-gold-600 flex items-center justify-center transition-colors"
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <button
                type="button"
                onClick={removeMusic}
                className="w-9 h-9 rounded-lg bg-red-500 text-white hover:bg-red-600 flex items-center justify-center transition-colors"
                title="Hapus musik"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <FormField label="Judul Musik" hint="Nama lagu yang ditampilkan">
            <input
              type="text"
              className={inputClass}
              value={musicTitle}
              onChange={(e) => onMusicTitleChange(e.target.value)}
              placeholder="Perfect - Ed Sheeran"
            />
          </FormField>
        </div>
      ) : (
        <>
          {/* Music Library */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-stone-700">Pilih dari Perpustakaan</p>
            <div className="space-y-2">
              {MUSIC_LIBRARY.map((song) => (
                <button
                  key={song.title}
                  type="button"
                  onClick={() => selectFromLibrary(song)}
                  className="w-full p-3 border border-stone-200 rounded-lg hover:border-gold-400 hover:bg-gold-50 transition-all flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                    <Music size={20} className="text-stone-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{song.title}</p>
                    <p className="text-xs text-stone-500">Klik untuk memilih</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Custom */}
          <div className="pt-4 border-t border-stone-200">
            <p className="text-sm font-semibold text-stone-700 mb-2">Atau Upload Musik Sendiri</p>

            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full py-4 border-2 border-dashed border-stone-300 rounded-xl hover:border-gold-400 hover:bg-gold-50 transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 size={24} className="animate-spin text-gold-500" />
                  <span className="text-sm font-medium text-stone-600">Mengupload...</span>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-stone-500" />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-stone-700">Upload file musik</p>
                    <p className="text-xs text-stone-500 mt-1">MP3, M4A, atau WAV (maks. 10MB)</p>
                  </div>
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* Settings Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Tips:</strong> Musik akan diputar otomatis saat tamu membuka undangan. Pastikan memilih lagu yang tidak terlalu keras dan sesuai dengan tema pernikahan.
        </p>
      </div>
    </SectionCard>
  )
}
