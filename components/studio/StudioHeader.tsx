/**
 * StudioHeader - Navigation and progress tracking
 * Breadcrumbs + Completion indicator + Save status
 */

'use client'

import Link from 'next/link'
import { ChevronRight, Check, Loader2, Home } from 'lucide-react'
import ProgressBar from './ui/ProgressBar'

interface StudioHeaderProps {
  invitationSlug: string
  groomName?: string
  brideName?: string
  completionPercentage: number
  requiredFieldsCount: number
  totalRequiredFields: number
  missingFields?: string[]
  saveStatus?: 'idle' | 'saving' | 'saved'
}

export default function StudioHeader({
  invitationSlug,
  groomName,
  brideName,
  completionPercentage,
  requiredFieldsCount,
  totalRequiredFields,
  missingFields = [],
  saveStatus = 'idle',
}: StudioHeaderProps) {
  const coupleNames = [groomName, brideName].filter(Boolean).join(' & ') || 'Undangan Baru'

  return (
    <div className="bg-white border-b border-stone-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm mb-4" aria-label="Breadcrumb">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 transition-colors"
          >
            <Home size={16} />
            <span>Dashboard</span>
          </Link>

          <ChevronRight size={14} className="text-stone-400" />

          <Link
            href="/dashboard"
            className="text-stone-600 hover:text-stone-900 transition-colors"
          >
            Undangan Saya
          </Link>

          <ChevronRight size={14} className="text-stone-400" />

          <span className="font-semibold text-stone-900">{coupleNames}</span>

          {saveStatus !== 'idle' && (
            <>
              <span className="mx-2">•</span>
              <div className="flex items-center gap-1.5">
                {saveStatus === 'saving' && (
                  <>
                    <Loader2 size={14} className="animate-spin text-stone-400" />
                    <span className="text-stone-500 text-xs">Menyimpan...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <>
                    <Check size={14} className="text-green-600" />
                    <span className="text-green-600 text-xs font-medium">Tersimpan</span>
                  </>
                )}
              </div>
            </>
          )}
        </nav>

        {/* Progress */}
        <div className="max-w-2xl">
          <ProgressBar
            current={requiredFieldsCount}
            total={totalRequiredFields}
            requiredFields={missingFields}
          />
        </div>

        {/* Helper text */}
        <p className="text-xs text-stone-500 mt-3">
          💡 <strong>Tips:</strong> Semua perubahan otomatis tersimpan. Isi minimal info dasar & detail acara untuk publish.
        </p>
      </div>
    </div>
  )
}
