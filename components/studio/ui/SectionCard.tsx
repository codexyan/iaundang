'use client'
import type { ElementType, ReactNode } from 'react'

interface SectionCardProps {
  title: string
  description?: string
  icon?: ElementType
  children: ReactNode
  badge?: string
  /** Menandai section wajib diisi; menampilkan badge "Wajib" bila badge tidak diisi manual */
  required?: boolean
}

export default function SectionCard({
  title, description, icon: Icon, children, badge, required,
}: SectionCardProps) {
  const showBadge = badge ?? (required ? 'Wajib' : undefined)

  return (
    <div className="rounded-card overflow-hidden border border-hairline bg-chalk shadow-card">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-ivory border-b border-hairline">
        {/* Icon */}
        {Icon && (
          <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 bg-forest-50">
            <Icon size={14} className="text-forest" strokeWidth={1.8} />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-ui-base font-bold text-graphite">{title}</h3>
            {showBadge && (
              <span className="text-ui-2xs font-bold uppercase tracking-[0.06em] text-gold-700 bg-gold-50 border border-gold-200 px-1.5 py-0.5 rounded-pill">
                {showBadge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-ui-xs text-concrete mt-0.5">{description}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4 bg-chalk">
        {children}
      </div>
    </div>
  )
}
