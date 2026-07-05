import { cn } from '@/lib/utils'

type Variant = 'neutral' | 'forest' | 'gold' | 'outline'

const VARIANTS: Record<Variant, string> = {
  neutral: 'bg-mist text-carbon border border-hairline',
  forest: 'bg-forest-50 text-forest border border-forest-100',
  gold: 'bg-gold-50 text-gold-700 border border-gold-200',
  outline: 'bg-transparent text-concrete border border-hairline',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

export function Badge({ variant = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-label-sm uppercase tracking-[0.08em] px-3 py-1 rounded-pill',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  )
}
