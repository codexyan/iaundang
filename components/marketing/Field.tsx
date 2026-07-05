import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Field form permukaan publik (order wizard, auth) — label + input + error/hint,
// fokus ring forest. Pengganti INPUT_CLS/LABEL_CLS lokal & Input.tsx legacy (rose).

const INPUT_BASE = cn(
  'w-full px-4 py-3 text-body-base text-graphite placeholder:text-ash bg-chalk',
  'border border-hairline rounded-input transition-colors',
  'focus:outline-none focus:border-forest-light focus:ring-2 focus:ring-forest/15',
)

interface FieldWrapProps {
  label?: string
  error?: string
  hint?: string
  children: React.ReactNode
}

function FieldWrap({ label, error, hint, children }: FieldWrapProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-label-base text-carbon">{label}</label>}
      {children}
      {error && <p className="text-body-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-body-xs text-concrete">{hint}</p>}
    </div>
  )
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <input ref={ref} className={cn(INPUT_BASE, error && 'border-red-400', className)} {...props} />
    </FieldWrap>
  ),
)
InputField.displayName = 'InputField'

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, className, rows = 4, ...props }, ref) => (
    <FieldWrap label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        rows={rows}
        className={cn(INPUT_BASE, 'resize-none', error && 'border-red-400', className)}
        {...props}
      />
    </FieldWrap>
  ),
)
TextareaField.displayName = 'TextareaField'
