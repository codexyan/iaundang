'use client'

import { Lock, ArrowUpRight } from 'lucide-react'

interface Props {
  requiredTier: string
  onUpgrade?: () => void
}

export default function LockedOverlay({ requiredTier, onUpgrade }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-card bg-chalk/85 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-center px-6">
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Lock size={18} className="text-amber-600" />
        </div>
        <p className="text-ui-sm text-concrete">
          Tersedia di paket <span className="font-bold text-graphite">{requiredTier}</span>
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="mt-1 px-3 py-1.5 text-ui-xs font-semibold rounded-button bg-amber-500 text-white flex items-center gap-1 hover:bg-amber-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2"
          >
            Upgrade <ArrowUpRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
