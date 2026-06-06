'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'icon-only'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  href?: string
  className?: string
}

const sizeConfig = {
  sm: {
    horizontal: { width: 140, height: 40 },
    vertical: { width: 100, height: 100 },
    icon: { width: 32, height: 32 },
  },
  md: {
    horizontal: { width: 180, height: 52 },
    vertical: { width: 140, height: 140 },
    icon: { width: 48, height: 48 },
  },
  lg: {
    horizontal: { width: 240, height: 70 },
    vertical: { width: 180, height: 180 },
    icon: { width: 64, height: 64 },
  },
  xl: {
    horizontal: { width: 320, height: 92 },
    vertical: { width: 240, height: 240 },
    icon: { width: 96, height: 96 },
  },
}

export default function Logo({
  variant = 'horizontal',
  size = 'md',
  animated = false,
  href = '/',
  className = '',
}: LogoProps) {
  const dimensions = sizeConfig[size][variant === 'icon-only' ? 'icon' : variant]

  const LogoImage = () => (
    <motion.div
      initial={animated ? { opacity: 0, y: -10 } : {}}
      animate={animated ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
      }}
    >
      <Image
        src={variant === 'vertical' ? '/logos/logo-vertical.png' : '/logos/logo-horizontal.png'}
        alt="Iaundang - Digital Wedding Invitation"
        fill
        className="object-contain"
        priority
        quality={100}
      />
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-block">
        <LogoImage />
      </Link>
    )
  }

  return <LogoImage />
}
