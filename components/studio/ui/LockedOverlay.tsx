'use client'

import { Lock, ArrowUpRight } from 'lucide-react'

interface Props {
  requiredTier: string
  onUpgrade?: () => void
}

export default function LockedOverlay({ requiredTier, onUpgrade }: Props) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2 text-center px-6">
        <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
          <Lock size={18} className="text-stone-400" />
        </div>
        <p className="text-xs font-medium text-stone-600">
          Tersedia di paket <span className="font-bold text-stone-800">{requiredTier}</span>
        </p>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="mt-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center gap-1 hover:shadow-md transition-shadow"
          >
            Upgrade <ArrowUpRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
