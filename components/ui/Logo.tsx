'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface LogoProps {
  variant?: 'default' | 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  href?: string
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-2xl sm:text-3xl lg:text-4xl',
}

export default function Logo({
  variant = 'default',
  size = 'md',
  animated = false,
  href = '/'
}: LogoProps) {
  const akColor = variant === 'light'
    ? 'text-white'
    : variant === 'dark'
    ? 'text-stone-900'
    : 'text-gold-600'

  const undangColor = variant === 'light'
    ? 'text-white/90'
    : variant === 'dark'
    ? 'text-stone-900'
    : 'text-stone-900'

  const LogoContent = () => (
    <div className="inline-flex items-center gap-0.5 group">
      <motion.div
        className="relative"
        initial={animated ? { opacity: 0, x: -10 } : {}}
        animate={animated ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={`${sizeClasses[size]} font-bold tracking-tight ${akColor} transition-colors group-hover:text-gold-500`}>
          ak
        </span>
        {/* Gold dot accent */}
        <motion.div
          className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-gold-500 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={animated ? { scale: 0 } : {}}
          animate={animated ? { scale: 1 } : {}}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        />
      </motion.div>

      <motion.span
        className={`${sizeClasses[size]} font-bold tracking-tight ${undangColor} transition-colors group-hover:text-stone-700`}
        initial={animated ? { opacity: 0, x: 10 } : {}}
        animate={animated ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        undang
      </motion.span>

      {/* Elegant underline on hover */}
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-500 to-champagne-500 opacity-0 group-hover:opacity-100 scale-x-0 group-hover:scale-x-100 transition-all duration-300 origin-left"
        style={{ transformOrigin: 'left' }}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block relative">
        <LogoContent />
      </Link>
    )
  }

  return (
    <div className="inline-block relative">
      <LogoContent />
    </div>
  )
}
