/**
 * FormField - Reusable form field wrapper with consistent styling
 * Usage: Wrap all form inputs for uniform appearance and validation display
 */

interface FormFieldProps {
  label: string
  hint?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  htmlFor?: string
}

export default function FormField({
  label,
  hint,
  required = false,
  error,
  children,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5">
        <span className="text-ui-eyebrow text-concrete">{label}</span>
        {required && (
          <span className="w-[5px] h-[5px] rounded-full bg-gold-dark shrink-0" title="Wajib diisi" />
        )}
      </label>

      {children}

      {hint && !error && (
        <p className="text-ui-xs text-concrete">{hint}</p>
      )}

      {error && (
        <p className="text-ui-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  )
}

// Base layout untuk field editor — warna/border diterapkan via StudioInput (fieldClass)
export const inputClass = 'w-full px-3.5 py-2.5 rounded-input text-ui-base transition-colors duration-200'
export const textareaClass = inputClass + ' resize-none'
