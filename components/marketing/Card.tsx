import { cn } from '@/lib/utils'

// Kartu permukaan publik: chalk di atas canvas ivory, border hairline, shadow-card.

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padded?: boolean
}

export function Card({ hover = false, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-chalk border border-hairline shadow-card',
        padded && 'p-6 sm:p-7',
        hover &&
          'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-ash/40',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
