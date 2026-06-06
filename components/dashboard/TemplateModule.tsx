'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Crown, Check, ExternalLink, ShoppingBag, Eye, X, Sparkles } from 'lucide-react'
import type { Invitation, NewInvitationData } from '@/lib/types'
import { LEGACY_TEMPLATE_IDS } from '@/lib/types'
import { getPackage, formatPrice, PACKAGES, type PackageTier } from '@/lib/packages'
import InvitationStudio from '../studio/InvitationStudio'
import InvitationWizard from './InvitationWizard'

// ── Types ──────────────────────────────────────────────────────

export interface TemplateInfo {
  id: string
  name: string
  category: string
  thumbnailUrl: string
  demoUrl: string
  isNew: boolean
}

interface Props {
  invitation: Invitation
  allTemplates: TemplateInfo[]
  onInvitationUpdate: (inv: Invitation) => void
}

// ── Package badge ──────────────────────────────────────────────

function PackageBadge({ tier }: { tier: PackageTier }) {
  const pkg = getPackage(tier)
  const colors: Record<PackageTier, string> = {
    starter: 'bg-blue-50 text-blue-700 border-blue-200',
    premium: 'bg-gold-50 text-gold-700 border-gold-200',
    ultimate: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${colors[tier]}`}>
      {pkg.emoji} Paket {pkg.name}
    </span>
  )
}

// ── Buy template modal ─────────────────────────────────────────

function BuyTemplateModal({ allTemplates, currentId, onClose }: {
  allTemplates: TemplateInfo[]
  currentId: string
  onClose: () => void
}) {
  const otherTemplates = allTemplates.filter(t => t.id !== currentId)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Beli Template Baru</h3>
            <p className="text-sm text-gray-500 mt-0.5">Template baru = undangan baru dengan link baru</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Info box */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">💡</span>
              <div>
                <p className="font-semibold mb-1">Bagaimana cara kerja ganti template?</p>
                <ul className="text-xs space-y-1 text-amber-700">
                  <li>• Template yang sudah dibeli TIDAK bisa ditukar gratis</li>
                  <li>• Membeli template baru membuat <strong>undangan baru</strong> dengan subdomain baru</li>
                  <li>• Data dari undangan lama bisa dicopy manual</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template list */}
          <div className="grid grid-cols-2 gap-3">
            {otherTemplates.map(t => (
              <div key={t.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gold-200 transition-colors group">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {t.thumbnailUrl && (
                    <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" />
                  )}
                  {t.isNew && (
                    <span className="absolute top-2 right-2 text-[9px] bg-gold-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                  <a
                    href={t.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    <span className="flex items-center gap-1 bg-white text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                      <Eye size={12} /> Preview
                    </span>
                  </a>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 capitalize mb-2">{t.category}</p>
                  <button className="w-full py-2 bg-gold-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5">
                    <ShoppingBag size={11} />
                    Beli — Rp 149.000
                  </button>
                </div>
              </div>
            ))}
          </div>

          {otherTemplates.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Tidak ada template lain tersedia saat ini.
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────

export default function TemplateModule({ invitation, allTemplates, onInvitationUpdate }: Props) {
  const [showBuyModal, setShowBuyModal] = useState(false)

  const tier = (invitation.package_tier ?? 'premium') as PackageTier
  const pkg = getPackage(tier)
  const isLegacy = (LEGACY_TEMPLATE_IDS as string[]).includes(invitation.template_id)
  const currentTemplate = allTemplates.find(t => t.id === invitation.template_id)

  // Find the TemplateRecord for new templates (for the editor)
  // We need to pass this to InvitationStudio which uses it for preview
  const [templateRecord, setTemplateRecord] = useState<import('@/lib/types').TemplateRecord | null>(null)

  // For new templates, we need the full TemplateRecord from templateRecords store
  // Since this is a client component, we'll fetch it on mount
  const [loadingTemplate, setLoadingTemplate] = useState(!isLegacy)

  useEffect(() => {
    if (isLegacy) return
    import('@/lib/template-configs/javanese-gold').then(m => {
      if (m.default.id === invitation.template_id) {
        setTemplateRecord(m.default)
      }
      setLoadingTemplate(false)
    }).catch(() => setLoadingTemplate(false))
  }, [invitation.template_id, isLegacy])

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header — template info + package */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Template thumbnail + info */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
              {currentTemplate?.thumbnailUrl ? (
                <img src={currentTemplate.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">🎨</div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-gray-900 text-base">
                  {currentTemplate?.name ?? invitation.template_id.replace(/-/g, ' ')}
                </h2>
                {currentTemplate?.isNew && (
                  <span className="text-[10px] bg-gold-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PackageBadge tier={tier} />
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Lock size={11} /> Template terkunci
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            {currentTemplate?.demoUrl && (
              <a
                href={currentTemplate.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:border-rose-300 hover:text-gold-600 transition-colors"
              >
                <Eye size={12} /> Preview
              </a>
            )}
            <button
              onClick={() => setShowBuyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gold-50 hover:bg-gold-100 border border-gold-200 rounded-xl text-xs text-gold-700 font-semibold transition-colors"
            >
              <ShoppingBag size={12} /> Beli Template Lain
            </button>
          </div>
        </div>

        {/* Package features summary */}
        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Foto Galeri', value: pkg.maxPhotos === -1 ? 'Unlimited' : `${pkg.maxPhotos} foto` },
            { label: 'Kirim Undangan', value: pkg.maxGuests === -1 ? 'Unlimited' : `${pkg.maxGuests} tamu` },
            { label: 'Masa Aktif', value: `${pkg.activeMonths} bulan` },
            { label: 'Drag & Drop', value: pkg.canReorderSections ? '✓ Aktif' : '🔒 Ultimate' },
          ].map(f => (
            <div key={f.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">{f.label}</p>
              <p className="text-sm font-bold text-gray-800 mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Unified editor */}
      {isLegacy ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-sm font-bold text-gray-900">Edit Undangan</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Template lama</span>
          </div>
          <InvitationWizard invitation={invitation} userId="" onSaved={onInvitationUpdate} />
        </div>
      ) : loadingTemplate ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-rose-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Memuat editor...</p>
        </div>
      ) : templateRecord ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <InvitationStudio
            invitation={invitation}
            template={templateRecord}
            onSaved={onInvitationUpdate}
          />
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-700">
          Template config tidak ditemukan. Hubungi admin.
        </div>
      )}

      {/* Upgrade banner (if not ultimate) */}
      {tier !== 'ultimate' && (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} className="text-amber-400" />
                <span className="font-bold text-sm">Upgrade ke {PACKAGES.ultimate.emoji} Ultimate</span>
              </div>
              <ul className="space-y-1 mb-3">
                {[
                  'Foto unlimited',
                  'Drag & drop urutan section',
                  'Kirim ke tamu unlimited',
                  'Aktif 24 bulan',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-gray-300">
                    <Check size={11} className="text-green-400" /> {f}
                  </li>
                ))}
              </ul>
              <p className="text-xl font-bold">{formatPrice(PACKAGES.ultimate.price)}</p>
              <p className="text-gray-500 text-xs">tambahan dari paket {pkg.name}</p>
            </div>
            <button className="shrink-0 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-gray-900 text-sm font-bold rounded-xl transition-colors">
              Upgrade →
            </button>
          </div>
        </div>
      )}

      {/* Buy template modal */}
      <AnimatePresence>
        {showBuyModal && (
          <BuyTemplateModal
            allTemplates={allTemplates}
            currentId={invitation.template_id}
            onClose={() => setShowBuyModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
