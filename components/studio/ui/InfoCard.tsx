/**
 * InfoCard - Information card for auto-managed sections
 * Used for: Gallery, RSVP, Wishes, Countdown (no config needed)
 */

import { LucideIcon } from 'lucide-react'
import SectionCard from './SectionCard'

interface InfoCardProps {
  title: string
  icon: LucideIcon
  message: string
  actionText?: string
  actionHref?: string
}

export default function InfoCard({
  title,
  icon,
  message,
  actionText,
  actionHref,
}: InfoCardProps) {
  return (
    <SectionCard title={title} icon={icon}>
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
          <span className="text-lg">ℹ️</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-900 leading-relaxed">{message}</p>

          {actionText && actionHref && (
            <a
              href={actionHref}
              className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              {actionText}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
