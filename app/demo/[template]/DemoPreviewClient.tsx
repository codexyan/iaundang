'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Pencil, X } from 'lucide-react'
import type { Invitation, Gallery, Wish, Guest, Template } from '@/lib/types'
import { TEMPLATES } from '@/lib/types'
import ModernWhiteTemplate from '@/components/templates/modern-white/ModernWhiteTemplate'
import FloralGardenTemplate from '@/components/templates/floral-garden/FloralGardenTemplate'
import DarkElegantTemplate from '@/components/templates/dark-elegant/DarkElegantTemplate'

interface Props {
  templateId: Template
  defaultInvitation: Invitation
  galleries: Gallery[]
  wishes: Wish[]
  guests: Guest[]
}

export default function DemoPreviewClient({
  templateId, defaultInvitation, galleries, wishes, guests,
}: Props) {
  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [akadDate, setAkadDate] = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  const tpl = TEMPLATES.find((t) => t.id === templateId)

  // Preview langsung pakai nama default   user bisa ganti opsional
  const invitation: Invitation = {
    ...defaultInvitation,
    template_id: templateId,
    data: {
      ...defaultInvitation.data,
      groomName: groomName.trim() || defaultInvitation.data.groomName,
      brideName: brideName.trim() || defaultInvitation.data.brideName,
      akadDate: akadDate ? new Date(akadDate).toISOString() : defaultInvitation.data.akadDate,
      resepsiDate: akadDate ? new Date(akadDate).toISOString() : defaultInvitation.data.resepsiDate,
    },
  }

  const displayGroom = groomName.trim() || defaultInvitation.data.groomName
  const displayBride = brideName.trim() || defaultInvitation.data.brideName
  const isCustomized = groomName.trim() || brideName.trim()

  const templateProps = { invitation, galleries, wishes, guests }

  return (
    <div className="relative">
      {/* Sticky bar atas */}
      <div className="fixed top-0 left-0 right-0 z-[200] bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <Link
            href="/templates"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors shrink-0"
          >
            <ArrowLeft size={14} /> Template lain
          </Link>

          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-sans font-bold text-gray-800 truncate">
              {displayGroom} <span className="text-rose-400">&amp;</span> {displayBride}
            </p>
            {!isCustomized && (
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
                contoh
              </span>
            )}
          </div>

          <Link
            href={`/order?template=${templateId}`}
            className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shrink-0"
          >
            Pakai template ini →
          </Link>
        </div>
      </div>

      {/* Template preview */}
      <div className="pt-12">
        {templateId === 'floral-garden' && <FloralGardenTemplate {...templateProps} />}
        {templateId === 'dark-elegant' && <DarkElegantTemplate {...templateProps} />}
        {templateId === 'modern-white' && <ModernWhiteTemplate {...templateProps} />}
      </div>

      {/* Floating panel ganti nama   opsional */}
      <div className="fixed bottom-5 right-4 z-[199] flex flex-col items-end gap-2">
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-72"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Ganti dengan nama kalian</p>
                  <p className="text-xs text-gray-400 mt-0.5">Preview langsung berubah</p>
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama mempelai pria</label>
                  <input
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder={defaultInvitation.data.groomName}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nama mempelai wanita</label>
                  <input
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder={defaultInvitation.data.brideName}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tanggal acara <span className="text-gray-300">(opsional)</span></label>
                  <input
                    type="date"
                    value={akadDate}
                    onChange={(e) => setAkadDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all"
                  />
                </div>
              </div>

              <Link
                href={`/order?template=${templateId}`}
                className="mt-4 block w-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold text-center py-2.5 rounded-xl transition-colors"
              >
                Suka? Buat yang aslinya →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setPanelOpen((v) => !v)}
          className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg transition-colors ${
            panelOpen
              ? 'bg-gray-100 text-gray-600'
              : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
          }`}
        >
          <Pencil size={12} />
          {isCustomized ? 'Edit nama' : 'Coba dengan nama kalian'}
        </motion.button>
      </div>
    </div>
  )
}
