import { LucideIcon } from 'lucide-react'
import LockedOverlay from './LockedOverlay'

interface SectionCardProps {
  title: string
  icon: LucideIcon
  required?: boolean
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'required' | 'optional'
  locked?: boolean
  requiredTier?: string
  onUpgrade?: () => void
}

export default function SectionCard({
  title,
  icon: Icon,
  required = false,
  description,
  children,
  variant = 'default',
  locked,
  requiredTier,
  onUpgrade,
}: SectionCardProps) {
  const isRequired = required || variant === 'required'

  return (
    <div
      className={`
        relative rounded-xl border p-5 transition-all
        ${locked ? 'border-stone-200/50 bg-stone-50/50' :
          isRequired
            ? 'border-gold-200/80 bg-white shadow-sm'
            : 'border-stone-200/80 bg-white'
        }
      `}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`
            w-8 h-8 rounded-lg flex items-center justify-center shrink-0
            ${locked ? 'bg-stone-100 text-stone-300' :
              isRequired
                ? 'bg-gold-100 text-gold-700'
                : 'bg-stone-100 text-stone-500'
            }
          `}
        >
          <Icon size={16} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            {title}
            {isRequired && !locked && (
              <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-semibold uppercase tracking-wider rounded">
                Wajib
              </span>
            )}
          </h3>

          {description && (
            <p className="text-[11px] text-stone-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3.5">
        {children}
      </div>

      {locked && requiredTier && (
        <LockedOverlay requiredTier={requiredTier} onUpgrade={onUpgrade} />
      )}
    </div>
  )
}
