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
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid #EDE8E2', backgroundColor: '#FEFDFB' }}
    >
      {/* Header */}
      <div
        className="relative flex items-start gap-3 px-4 py-3.5"
        style={{
          borderBottom: '1px solid #EDE8E2',
          background: 'linear-gradient(135deg, #FAF9F6 0%, #FEFDFB 100%)',
        }}
      >
        {/* Left gold accent bar */}
        <div
          className="absolute left-0 top-4 bottom-4 rounded-r-full"
          style={{ width: 3, backgroundColor: '#C9A961' }}
        />

        {/* Icon */}
        {Icon && (
          <div
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
            style={{ backgroundColor: '#F5EDD8' }}
          >
            <Icon size={14} color="#9A7A3F" strokeWidth={1.8} />
          </div>
        )}

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>
              {title}
            </h3>
            {showBadge && (
              <span style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase' as const,
                letterSpacing: '0.06em', color: '#9A7A3F',
                backgroundColor: '#F5EDD8',
                padding: '2px 7px', borderRadius: 99,
              }}>
                {showBadge}
              </span>
            )}
          </div>
          {description && (
            <p style={{ fontSize: 11, marginTop: 2, color: '#A8A29E', lineHeight: 1.5 }}>
              {description}
            </p>
          )}
        </div>

        {/* Corner ornament */}
        <svg
          className="absolute top-2.5 right-3 opacity-20 pointer-events-none"
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          aria-hidden="true"
        >
          <path d="M14 2 L14 7 M14 2 L9 2" stroke="#C9A961" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="14" cy="2" r="1.5" fill="#C9A961" />
        </svg>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4" style={{ backgroundColor: '#FEFDFB' }}>
        {children}
      </div>
    </div>
  )
}
