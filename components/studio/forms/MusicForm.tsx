'use client'

import { useState, useRef, useEffect } from 'react'
import { Music, Loader2, Play, Pause, Trash2, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import FormField from '../ui/FormField'
import { StudioInput } from '../ui/StudioInput'
import SectionCard from '../ui/SectionCard'

interface MusicFormProps {
  musicUrl: string
  musicTitle: string
  onMusicUrlChange: (url: string) => void
  onMusicTitleChange: (title: string) => void
}

interface LibraryTrack {
  id: string
  title: string
  artist: string
  category: string
  url: string
  usage_count: number
}

export default function MusicForm({
  musicUrl,
  musicTitle,
  onMusicUrlChange,
  onMusicTitleChange,
}: MusicFormProps) {
  const [playing, setPlaying] = useState(false)
  const [previewId, setPreviewId] = useState<string | null>(null)
  const [library, setLibrary] = useState<LibraryTrack[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filterCat, setFilterCat] = useState('all')
  const [search, setSearch] = useState('')
  const [loadingLib, setLoadingLib] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)
  const previewAudioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetch('/api/music')
      .then(r => r.json())
      .then(data => {
        setLibrary(data.tracks || [])
        setCategories(data.categories || [])
      })
      .catch(() => {})
      .finally(() => setLoadingLib(false))
  }, [])

  function selectFromLibrary(track: LibraryTrack) {
    stopPreview()
    onMusicUrlChange(track.url)
    onMusicTitleChange(track.artist ? `${track.title} - ${track.artist}` : track.title)
    toast.success(`Dipilih: ${track.title}`)
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

  function togglePreview(track: LibraryTrack) {
    if (previewId === track.id) {
      stopPreview()
      return
    }
    if (previewAudioRef.current) {
      previewAudioRef.current.src = track.url
      previewAudioRef.current.play()
      setPreviewId(track.id)
    }
  }

  function stopPreview() {
    previewAudioRef.current?.pause()
    setPreviewId(null)
  }

  function removeMusic() {
    onMusicUrlChange('')
    onMusicTitleChange('')
    setPlaying(false)
    audioRef.current?.pause()
  }

  const filtered = library.filter(t => {
    if (filterCat !== 'all' && t.category !== filterCat) return false
    if (search) {
      const q = search.toLowerCase()
      return t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <SectionCard
      title="Musik Latar"
      icon={Music}
      description="Pilih musik dari perpustakaan untuk undangan kamu"
    >
      {musicUrl && <audio ref={audioRef} src={musicUrl} onEnded={() => setPlaying(false)} />}
      <audio ref={previewAudioRef} onEnded={() => setPreviewId(null)} />

      {musicUrl ? (
        <div className="p-4 border-2 border-forest bg-forest-50 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-forest text-white flex items-center justify-center">
              <Music size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-graphite">{musicTitle || 'Musik Terpilih'}</p>
              <p className="text-xs text-concrete truncate">{musicUrl}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={togglePlay}
                className="w-9 h-9 rounded-lg bg-forest text-white hover:bg-forest-deep flex items-center justify-center transition-colors"
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
            <StudioInput
              type="text"
              value={musicTitle}
              onChange={(e) => onMusicTitleChange(e.target.value)}
              placeholder="Perfect - Ed Sheeran"
            />
          </FormField>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-graphite">Pilih dari Perpustakaan</p>

          {/* Search & Filter */}
          {library.length > 4 && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ash" />
                <input
                  type="text"
                  placeholder="Cari lagu..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-hairline rounded-lg focus:ring-1 focus:ring-forest/40 focus:border-forest-light outline-none"
                />
              </div>
              {categories.length > 1 && (
                <select
                  value={filterCat}
                  onChange={e => setFilterCat(e.target.value)}
                  className="px-2 py-1.5 text-sm border border-hairline rounded-lg focus:ring-1 focus:ring-forest/40 outline-none bg-white"
                >
                  <option value="all">Semua</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          )}

          {loadingLib ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={20} className="animate-spin text-ash" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-ash text-center py-4">
              {library.length === 0 ? 'Belum ada musik tersedia' : 'Tidak ditemukan'}
            </p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filtered.map(track => (
                <div
                  key={track.id}
                  className="w-full p-3 border border-hairline rounded-lg hover:border-gold-dark/50 hover:bg-forest-50 transition-all flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => togglePreview(track)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      previewId === track.id
                        ? 'bg-forest text-white'
                        : 'bg-mist text-concrete hover:bg-forest-50'
                    }`}
                  >
                    {previewId === track.id ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-graphite truncate">{track.title}</p>
                    <p className="text-xs text-concrete truncate">
                      {track.artist || track.category}
                      {track.usage_count > 0 && (
                        <span className="text-ash"> · {track.usage_count}x dipilih</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => selectFromLibrary(track)}
                    className="px-3 py-1.5 text-xs font-medium bg-forest text-white rounded-lg hover:bg-forest-deep transition-colors shrink-0"
                  >
                    Pilih
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="p-3 bg-forest-50 border border-forest-100 rounded-lg">
        <p className="text-xs text-forest-deep">
          <strong>Tips:</strong> Musik mulai diputar sejak halaman pembuka ditampilkan. Tamu bisa pause/play melalui kontrol musik. Pilih lagu yang sesuai dengan suasana pernikahan.
        </p>
      </div>
    </SectionCard>
  )
}
