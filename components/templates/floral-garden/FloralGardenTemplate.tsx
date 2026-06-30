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

export default function FloralGardenTemplate({ invitation, galleries, wishes, guests }: Props) {
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
        accentColor="#be185d"
        bg="#fdf2f8"
      />

      {d.musicUrl && <MusicPlayer src={d.musicUrl} title={d.musicTitle} />}

      <div
        className={`font-sans text-pink-900 transition-opacity duration-500 ${opened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{ background: '#fdf2f8' }}
      >
        {/* Decorative header */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 text-[120px] opacity-10">🌸</div>
            <div className="absolute top-10 right-0 text-[100px] opacity-10">🌺</div>
            <div className="absolute bottom-10 left-10 text-[80px] opacity-10">🌷</div>
            <div className="absolute bottom-0 right-0 text-[120px] opacity-10">🌼</div>
          </div>

          {d.heroPhotoUrl && (
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-pink-200 mb-8">
              <Image src={d.heroPhotoUrl} alt="Hero" width={160} height={160} className="object-cover w-full h-full" />
            </div>
          )}

          <p className="text-pink-400 text-xs uppercase tracking-[0.3em] mb-4">
            {d.openingText || 'Undangan Pernikahan'}
          </p>
          <h1 className="font-sans text-4xl sm:text-5xl font-bold text-pink-900 leading-tight">
            {d.groomName} <span className="text-pink-400">&</span> {d.brideName}
          </h1>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-12 bg-pink-300" />
            <span className="text-pink-400 text-sm">{formatDate(d.akadDate)}</span>
            <div className="h-px w-12 bg-pink-300" />
          </div>
        </section>

        {/* Countdown */}
        <section className="py-14 text-center" style={{ background: '#fce7f3' }}>
          <p className="text-xs uppercase tracking-widest text-pink-500 mb-6">Menuju Hari Bahagia 🌸</p>
          <CountdownTimer targetDate={d.akadDate} className="text-pink-900" />
        </section>

        {/* Acara */}
        <section className="py-16 px-6">
          <h2 className="font-sans text-2xl font-bold text-center mb-10">Detail Acara</h2>
          <div className="max-w-2xl mx-auto space-y-6">
            {[
              { label: 'Akad Nikah', venue: d.akadVenue, date: d.akadDate, time: d.akadTime, address: d.akadAddress, maps: d.akadMapsUrl },
              { label: 'Resepsi', venue: d.resepsiVenue, date: d.resepsiDate, time: d.resepsiTime, address: d.resepsiAddress, maps: d.resepsiMapsUrl },
            ].map((ev) => (
              <div key={ev.label} className="rounded-2xl p-6 text-center border border-pink-200 bg-white/70">
                <p className="text-xs uppercase tracking-widest text-pink-400 mb-2">{ev.label}</p>
                <p className="font-sans text-xl font-bold">{ev.venue}</p>
                <p className="text-sm opacity-70 mt-1">{formatDate(ev.date)} • {ev.time}</p>
                <p className="text-sm opacity-50 mt-0.5">{ev.address}</p>
                {ev.maps && (
                  <a href={ev.maps} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-3 text-xs text-pink-600 border border-pink-200 px-4 py-1.5 rounded-full hover:bg-pink-50">
                    📍 Buka Maps
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Gallery */}
        {galleries.length > 0 && (
          <section className="py-16 px-6" style={{ background: '#fce7f3' }}>
            <h2 className="font-sans text-2xl font-bold text-center mb-8">Galeri Foto 💐</h2>
            <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleries.map((g) => (
                <div key={g.id} className="aspect-square rounded-2xl overflow-hidden border border-pink-200">
                  <Image src={g.url} alt="" width={400} height={400} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="py-16 px-6">
          <div className="max-w-md mx-auto">
            <h2 className="font-sans text-2xl font-bold text-center mb-2">RSVP 🌷</h2>
            {attending > 0 && <p className="text-center text-sm opacity-60 mb-6">{attending} tamu sudah konfirmasi</p>}
            <RSVPForm invitationId={invitation.id} accentColor="#be185d" />
          </div>
        </section>

        {/* Wishes */}
        <section className="py-16 px-6" style={{ background: '#fce7f3' }}>
          <div className="max-w-md mx-auto">
            <h2 className="font-sans text-2xl font-bold text-center mb-8">Buku Ucapan 💌</h2>
            <WishesSection invitationId={invitation.id} initialWishes={wishes} />
          </div>
        </section>

        {/* Share & Footer */}
        <section className="py-14 text-center px-6" style={{ background: '#be185d', color: 'white' }}>
          <p className="font-sans text-xl font-bold mb-6">Bagikan Undangan 🌸</p>
          <a
            href={`https://wa.me/?text=Yth. Bapak/Ibu/Saudara/i, kami mengundang kehadiran Anda di pernikahan kami. Selengkapnya: ${url}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors"
          >
            💬 Share via WhatsApp
          </a>
          <p className="text-pink-200 text-xs mt-8">Dibuat dengan ❤️ di iaundang.online</p>
        </section>
      </div>
    </>
  )
}
