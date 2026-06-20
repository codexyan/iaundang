'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  title?: string
}

export default function MusicPlayer({ src, title = 'Musik Pengiring' }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Try autoplay
    audio.play().then(() => setPlaying(true)).catch(() => {
      // Autoplay blocked   user must tap
    })
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={src} loop />
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-lg border border-gray-100 hover:scale-105 transition-transform"
        title={playing ? 'Pause musik' : 'Play musik'}
        aria-label={playing ? 'Pause musik' : 'Play musik'}
      >
        {playing ? '⏸' : '▶️'}
      </button>
    </>
  )
}
