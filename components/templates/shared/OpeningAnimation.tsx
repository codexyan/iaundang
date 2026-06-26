'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  groomName: string
  brideName: string
  guestName?: string
  onOpen: () => void
  accentColor?: string
  bg?: string
}

export default function OpeningAnimation({
  groomName,
  brideName,
  guestName,
  onOpen,
  accentColor = '#e11d48',
  bg = '#fff',
}: Props) {
  const [opened, setOpened] = useState(false)

  function handleOpen() {
    setOpened(true)
    setTimeout(onOpen, 800)
  }

  return (
    <AnimatePresence>
      {!opened && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-8"
          style={{ backgroundColor: bg }}
        >
          {/* Top label */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs tracking-widest uppercase opacity-50"
          >
            Undangan Pernikahan
          </motion.p>

          {/* Center: couple names */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="font-sans text-4xl sm:text-5xl font-bold leading-tight">
              {groomName}
            </h1>
            <p className="text-3xl font-sans opacity-40 my-3">&amp;</p>
            <h1 className="font-sans text-4xl sm:text-5xl font-bold leading-tight">
              {brideName}
            </h1>

            <button
              onClick={handleOpen}
              className="mt-10 px-8 py-3 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 mx-auto"
              style={{ backgroundColor: accentColor }}
            >
              <span>💌</span> Buka Undangan
            </button>
          </motion.div>

          {/* Bottom: Kepada Yth */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-xs opacity-40 tracking-wide">Kepada Yth:</p>
            <p className="text-sm font-semibold mt-1 opacity-80">
              {guestName ?? 'Bapak/Ibu/Saudara/i'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
