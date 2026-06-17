'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Invitation, Gallery, Wish, Guest } from '@/lib/types'
import { formatDate, getInvitationUrl } from '@/lib/utils'
import OpeningAnimation from '../shared/OpeningAnimation'
import CountdownTimer from '../shared/CountdownTimer'
import RSVPForm from '../shared/RSVPForm'
import WishesSection from '../shared/WishesSection'
import MusicPlayer from '../shared/MusicPlayer'

interface Props {
  invitation: Invitation
  galleries: Gallery[]
  wishes: Wish[]
  guests: Guest[]
}

export default function DarkElegantTemplate({ invitation, galleries, wishes, guests }: Props) {
  const [opened, setOpened] = useState(false)
  const d = invitation.data
  const url = getInvitationUrl(invitation.slug)
  const [guestName, setGuestName] = useState<string | undefined>()
  useEffect(() => {
    const to = new URLSearchParams(window.location.search).get('to')
    if (to) setGuestName(to)
  }, [])

  const attending = guests.filter((g) => g.attending).reduce((acc, g) => acc + g.total_guests, 0)

  return (
    <>
      <OpeningAnimation
        groomName={d.groomName}
        brideName={d.brideName}
        guestName={guestName}
        onOpen={() => setOpened(true)}
        accentColor="#d4af37"
        bg="#0f0f0f"
      />

      {d.musicUrl && <MusicPlayer src={d.musicUrl} title={d.musicTitle} />}

      <div
        className={`font-sans text-amber-50 transition-opacity duration-500 ${opened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: '#0f0f0f' }}
      >
        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
          {d.heroPhotoUrl && (
            <div className="absolute inset-0">
              <Image src={d.heroPhotoUrl} alt="Hero" fill className="object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-12 bg-amber-400/50" />
              <p className="text-amber-400 text-xs uppercase tracking-[0.4em]">
                {d.openingText || 'Pernikahan'}
              </p>
              <div className="h-px w-12 bg-amber-400/50" />
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight">
              {d.groomName}
            </h1>
            <p className="text-3xl font-serif text-amber-400 my-4">&</p>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight">
              {d.brideName}
            </h1>
            <p className="text-amber-300/70 text-sm mt-8">{formatDate(d.akadDate)}</p>
          </motion.div>
        </section>

        {/* Countdown */}
        <section className="py-14 text-center" style={{ background: '#1a1a1a' }}>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-400/70 mb-6">Menuju Hari Istimewa</p>
          <CountdownTimer targetDate={d.akadDate} className="text-amber-100" />
        </section>

        {/* Acara */}
        <section className="py-16 px-6">
          <h2 className="font-serif text-2xl font-bold text-center mb-10 text-amber-100">Detail Acara</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { label: 'Akad Nikah', venue: d.akadVenue, date: d.akadDate, time: d.akadTime, address: d.akadAddress, maps: d.akadMapsUrl },
              { label: 'Resepsi', venue: d.resepsiVenue, date: d.resepsiDate, time: d.resepsiTime, address: d.resepsiAddress, maps: d.resepsiMapsUrl },
            ].map((ev) => (
              <div key={ev.label} className="rounded-2xl p-6 text-center border border-amber-900/50" style={{ background: '#1a1a1a' }}>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-400 mb-2">{ev.label}</p>
                <p className="font-serif text-xl font-bold text-amber-100">{ev.venue}</p>
                <p className="text-sm text-amber-200/60 mt-1">{formatDate(ev.date)} • {ev.time}</p>
                <p className="text-sm text-amber-200/40 mt-0.5">{ev.address}</p>
                {ev.maps && (
                  <a href={ev.maps} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-amber-400 border border-amber-900 px-4 py-1.5 rounded-full hover:bg-amber-900/30 transition-colors">
                    📍 Buka Maps
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {galleries.length > 0 && (
          <section className="py-16 px-6" style={{ background: '#1a1a1a' }}>
            <h2 className="font-serif text-2xl font-bold text-center mb-8 text-amber-100">Galeri</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleries.map((g) => (
                <div key={g.id} className="aspect-square rounded-xl overflow-hidden border border-amber-900/30">
                  <Image src={g.url} alt="" width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 opacity-90 hover:opacity-100" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="py-16 px-6">
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-2xl font-bold text-center text-amber-100 mb-2">RSVP</h2>
            {attending > 0 && <p className="text-center text-sm text-amber-200/50 mb-6">{attending} tamu telah konfirmasi hadir</p>}
            <RSVPForm invitationId={invitation.id} accentColor="#d4af37" />
          </div>
        </section>

        {/* Wishes */}
        <section className="py-16 px-6" style={{ background: '#1a1a1a' }}>
          <div className="max-w-md mx-auto">
            <h2 className="font-serif text-2xl font-bold text-center text-amber-100 mb-8">Buku Ucapan</h2>
            <WishesSection invitationId={invitation.id} initialWishes={wishes} />
          </div>
        </section>

        {/* Share */}
        <section className="py-14 text-center px-6" style={{ background: '#0a0a0a' }}>
          <div className="h-px w-16 bg-amber-400/30 mx-auto mb-8" />
          <p className="font-serif text-xl font-bold text-amber-100 mb-6">Bagikan Undangan</p>
          <a
            href={`https://wa.me/?text=Yth. Bapak/Ibu/Saudara/i, kami mengundang kehadiran Anda di pernikahan kami. Selengkapnya: ${url}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors"
          >
            💬 Share via WhatsApp
          </a>
          <p className="text-amber-900 text-xs mt-10">Dibuat dengan iaundang.id</p>
        </section>
      </div>
    </>
  )
}
