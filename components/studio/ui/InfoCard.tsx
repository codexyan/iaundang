/**
 * InfoCard - Information card for auto-managed sections
 * Used for: Gallery, RSVP, Wishes, Countdown (no config needed)
 */

import { LucideIcon } from 'lucide-react'

interface InfoCardProps {
  title: string
  icon: LucideIcon
  message: string
  actionText?: string
  actionHref?: string
}

export default function InfoCard({
  title,
  icon: Icon,
  message,
  actionText,
  actionHref,
}: InfoCardProps) {
  return (
    <div className="flex items-start gap-2.5 p-3 bg-ivory border border-hairline rounded-card">
      <div className="w-7 h-7 rounded-md bg-forest-50 text-forest flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-ui-sm font-semibold text-graphite">{title}</p>
        <p className="text-ui-xs text-concrete mt-0.5 leading-relaxed">{message}</p>
        {actionText && actionHref && (
          <a href={actionHref} className="inline-flex items-center gap-1 mt-1.5 text-ui-xs font-medium text-forest hover:text-forest-deep transition-colors">
            {actionText} &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
