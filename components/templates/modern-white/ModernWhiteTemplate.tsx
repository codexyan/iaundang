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

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

export default function ModernWhiteTemplate({ invitation, galleries, wishes, guests }: Props) {
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
        accentColor="#e11d48"
        bg="#fafafa"
      />

      {d.musicUrl && <MusicPlayer src={d.musicUrl} title={d.musicTitle} />}

      <div className={`font-sans text-gray-800 bg-white transition-opacity duration-500 ${opened ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

        {/* Hero */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 bg-gradient-to-b from-rose-50 to-white">
          {d.heroPhotoUrl && (
            <div className="absolute inset-0 overflow-hidden">
              <Image src={d.heroPhotoUrl} alt="Hero" fill className="object-cover opacity-10" />
            </div>
          )}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="relative z-10">
            <p className="text-rose-400 tracking-widest text-xs uppercase mb-6">
              {d.openingText || 'Kami mengundang kehadiran Bapak/Ibu/Saudara/i'}
            </p>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
              {d.groomName}
            </h1>
            <p className="text-3xl font-serif text-rose-300 my-3">&</p>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
              {d.brideName}
            </h1>
            <div className="mt-8 h-px w-24 bg-rose-200 mx-auto" />
            <p className="mt-6 text-gray-500 text-sm">
              {formatDate(d.akadDate)}
            </p>
          </motion.div>
        </section>

        {/* Countdown */}
        <section className="py-16 bg-white text-center">
          <p className="text-xs uppercase tracking-widest text-rose-400 mb-6">Menuju Hari Bahagia</p>
          <CountdownTimer targetDate={d.akadDate} className="text-gray-900" />
        </section>

        {/* Detail Acara */}
        <section className="py-16 bg-rose-50">
          <div className="max-w-2xl mx-auto px-6 space-y-10">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-900 mb-8">
              Detail Acara
            </h2>

            {/* Akad */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">Akad Nikah</p>
              <p className="font-serif text-xl font-bold">{d.akadVenue}</p>
              <p className="text-gray-500 text-sm mt-2">{formatDate(d.akadDate)} • {d.akadTime}</p>
              <p className="text-gray-400 text-sm mt-1">{d.akadAddress}</p>
              {d.akadMapsUrl && (
                <a
                  href={d.akadMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-rose-600 border border-rose-200 px-4 py-2 rounded-full hover:bg-rose-50 transition-colors"
                >
                  📍 Buka Maps
                </a>
              )}
            </div>

            {/* Resepsi */}
            <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
              <p className="text-xs uppercase tracking-widest text-rose-400 mb-3">Resepsi</p>
              <p className="font-serif text-xl font-bold">{d.resepsiVenue}</p>
              <p className="text-gray-500 text-sm mt-2">{formatDate(d.resepsiDate)} • {d.resepsiTime}</p>
              <p className="text-gray-400 text-sm mt-1">{d.resepsiAddress}</p>
              {d.resepsiMapsUrl && (
                <a
                  href={d.resepsiMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-sm text-rose-600 border border-rose-200 px-4 py-2 rounded-full hover:bg-rose-50 transition-colors"
                >
                  📍 Buka Maps
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Gallery */}
        {galleries.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="font-serif text-2xl font-bold text-center text-gray-900 mb-8">
                Galeri Foto
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleries.map((g) => (
                  <div key={g.id} className="aspect-square rounded-xl overflow-hidden">
                    <Image
                      src={g.url}
                      alt="Galeri"
                      width={400}
                      height={400}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="py-16 bg-rose-50">
          <div className="max-w-md mx-auto px-6">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-900 mb-2">
              RSVP
            </h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              {attending > 0 && `${attending} tamu sudah konfirmasi hadir`}
            </p>
            <RSVPForm invitationId={invitation.id} accentColor="#e11d48" />
          </div>
        </section>

        {/* Wishes */}
        <section className="py-16 bg-white">
          <div className="max-w-md mx-auto px-6">
            <h2 className="font-serif text-2xl font-bold text-center text-gray-900 mb-8">
              Buku Ucapan
            </h2>
            <WishesSection invitationId={invitation.id} initialWishes={wishes} />
          </div>
        </section>

        {/* Share */}
        <section className="py-16 bg-rose-600 text-white text-center">
          <p className="font-serif text-xl font-bold mb-2">Bagikan Undangan</p>
          <p className="text-rose-200 text-sm mb-6">Kirim link ini ke semua tamu undangan</p>
          <a
            href={`https://wa.me/?text=Yth. Bapak/Ibu/Saudara/i, kami mengundang kehadiran Anda di pernikahan kami. Selengkapnya: ${url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium text-sm transition-colors"
          >
            <span>💬</span> Share via WhatsApp
          </a>
        </section>

        {/* Closing */}
        <section className="py-10 bg-rose-50 text-center">
          <p className="font-serif text-lg text-gray-800">{d.closingText || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami atas kehadiran Bapak/Ibu/Saudara/i.'}</p>
          <p className="text-gray-400 text-xs mt-4">Dibuat dengan iaundang.id</p>
        </section>
      </div>
    </>
  )
}
