'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { LoadingConfig } from '@/lib/types'

interface Props {
  config: LoadingConfig
  onDone: () => void
  isPreview?: boolean
}

export default function LoadingScreen({ config, onDone, isPreview = false }: Props) {
  useEffect(() => {
    const timer = setTimeout(onDone, 1600)
    return () => clearTimeout(timer)
  }, [onDone])

  return (
    <div
      className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex flex-col items-center justify-center`}
      style={{ backgroundColor: config.background_color }}
    >
      {config.logo_image && (
        <img src={config.logo_image} alt="logo" className="h-14 mb-8 object-contain" />
      )}

      <motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Ornament */}
        <motion.div
          className="text-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(212,175,55,0.6))' }}
        >
          💍
        </motion.div>

        <p
          className="text-sm tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {config.text}
        </p>

        {/* Dot animation */}
        <div className="flex gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
