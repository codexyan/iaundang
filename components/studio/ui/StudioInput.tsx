'use client'
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react'
import { inputClass, textareaClass } from './FormField'

// Field primitive editor (Arah A) — token via kelas Tailwind, fokus via CSS
// (bukan JS state). Chevron select memakai data-URI dengan warna netral token.
const fieldClass =
  'bg-chalk text-graphite placeholder:text-ash border border-hairline ' +
  'focus:outline-none focus:border-forest-light focus:ring-2 focus:ring-forest/15'

export function StudioInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = '', ...rest } = props
  return <input {...rest} className={`${inputClass} ${fieldClass} ${className}`} />
}

export function StudioTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = '', ...rest } = props
  return <textarea {...rest} className={`${textareaClass} ${fieldClass} ${className}`} />
}

export function StudioSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = '', style, children, ...rest } = props
  return (
    <select
      {...rest}
      className={`${inputClass} ${fieldClass} cursor-pointer appearance-none ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1a1' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: 36,
        ...style,
      }}
    >
      {children}
    </select>
  )
}

// Toggle switch dengan aksen gold
export function StudioToggle({
  checked, onChange, label, desc,
}: { checked: boolean; onChange: () => void; label: string; desc?: string }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2 ${
        checked
          ? 'bg-forest-50 border border-forest-light/30'
          : 'bg-ivory border border-hairline hover:border-ash/50'
      }`}
    >
      <div>
        <p className="text-ui-base font-semibold text-graphite">{label}</p>
        {desc && <p className="text-ui-xs text-concrete mt-0.5">{desc}</p>}
      </div>
      <span
        className={`relative shrink-0 w-[42px] h-6 rounded-full transition-colors ${checked ? 'bg-gold-dark' : 'bg-smoke'}`}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-chalk shadow transition-transform"
          style={{ transform: checked ? 'translateX(22px)' : 'translateX(4px)' }}
        />
      </span>
    </button>
  )
}

// Divider ornamental — belah ketupat gold tipis sebagai aksen
export function StudioDivider({ label }: { label?: string }) {
  if (!label) return <div className="h-px bg-hairline" />
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-px bg-hairline" />
      <span className="text-ui-eyebrow text-ash">{label}</span>
      <span className="text-gold-dark text-ui-2xs leading-none" aria-hidden>◇</span>
      <div className="flex-1 h-px bg-hairline" />
    </div>
  )
}
