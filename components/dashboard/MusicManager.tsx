'use client'

import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import type { Invitation } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface Props {
  invitation: Invitation
}

const ADMIN_PLAYLIST = [
  { id: 'admin-1', title: 'Lagu Pilihan A', description: 'Atmosfer romantis, cocok untuk opening.' },
  { id: 'admin-2', title: 'Lagu Pilihan B', description: 'Nuansa hangat dan lembut untuk undangan.' },
  { id: 'admin-3', title: 'Lagu Pilihan C', description: 'Melodi ringan untuk suasana yang elegan.' },
]

export default function MusicManager({ invitation }: Props) {
  const [musicUrl, setMusicUrl] = useState(invitation.data.musicUrl || '')
  const [musicTitle, setMusicTitle] = useState(invitation.data.musicTitle || '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (invitation.data.musicUrl) {
      setMusicUrl(invitation.data.musicUrl)
      setMusicTitle(invitation.data.musicTitle || 'Musik terpasang')
    }
  }, [invitation.data.musicUrl, invitation.data.musicTitle])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'audio/mpeg': ['.mp3'], 'audio/ogg': ['.ogg'] },
    maxSize: 20 * 1024 * 1024,
    maxFiles: 1,
    disabled: uploading,
    onDropAccepted: handleUpload,
    onDropRejected: () => toast.error('File ditolak: format MP3/OGG max 20MB'),
  })

  async function handleUpload(files: File[]) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', files[0])
    formData.append('invitationId', invitation.id)

    const res = await fetch('/api/galleries/music', { method: 'POST', body: formData })
    setUploading(false)
    if (!res.ok) {
      toast.error('Gagal upload musik')
      return
    }

    const { musicUrl: url, musicTitle: title } = await res.json()
    setMusicUrl(url)
    setMusicTitle(title || files[0].name)
    setSelectedId(null)
    toast.success('Musik berhasil diupload!')
  }

  function handleChoosePreset(track: typeof ADMIN_PLAYLIST[number]) {
    setSelectedId(track.id)
    setMusicUrl('')
    setMusicTitle(track.title)
    toast.success(`Pilih musik: ${track.title}`)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-rose-500 font-semibold">Musik</p>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Pilih musik atau upload sendiri</h2>
            <p className="mt-2 text-sm text-gray-500">Admin akan menyediakan pilihan lagu. Pilih satu, atau upload file musik Anda sendiri.</p>
          </div>
          <div className="rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Slug: <span className="font-medium text-gray-900">{invitation.slug}.akundang.id</span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Pilihan musik dari admin</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {ADMIN_PLAYLIST.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleChoosePreset(track)}
                  className={`rounded-3xl border p-4 text-left transition ${selectedId === track.id ? 'border-rose-500 bg-gold-50' : 'border-gray-200 hover:border-rose-300 hover:bg-gold-50/50'}`}
                >
                  <p className="font-semibold text-gray-900">{track.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{track.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Upload musik sendiri</h3>
            <div
              {...getRootProps()}
              className={`rounded-3xl border-2 border-dashed p-6 text-center transition ${isDragActive ? 'border-rose-400 bg-gold-50' : 'border-gray-200 hover:border-rose-300 hover:bg-gold-50/50'} ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input {...getInputProps()} />
              <p className="text-lg font-semibold text-gray-900">{uploading ? 'Mengupload...' : musicUrl ? 'Klik untuk ganti musik' : 'Klik atau seret file MP3/OGG di sini'}</p>
              <p className="text-xs text-gray-500 mt-2">Max 20MB • MP3 / OGG</p>
            </div>
          </div>

          {musicUrl || musicTitle ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Musik saat ini</p>
                  <p className="text-xs text-gray-500 mt-1">{musicTitle || 'Belum ada musik terpasang'}</p>
                </div>
                <span className="text-xs text-gray-500">{musicUrl ? 'File siap digunakan' : 'Pilihan admin'}</span>
              </div>
              {musicUrl && (
                <audio controls src={musicUrl} className="mt-4 w-full h-10" />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
