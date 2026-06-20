'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from 'framer-motion'
import { Menu, X, LayoutDashboard, PenLine, Megaphone, Shield, ChevronRight } from 'lucide-react'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/#fitur', label: 'Fitur' },
  { href: '/#templates', label: 'Template' },
  { href: '/#harga', label: 'Harga' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQ' },
]

const ROLE_LINKS: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
  admin: [
    { href: '/admin', label: 'Admin Panel', icon: <Shield className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  content_writer: [
    { href: '/writer', label: 'Writer', icon: <PenLine className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  affiliate: [
    { href: '/affiliate', label: 'Affiliate', icon: <Megaphone className="w-4 h-4" /> },
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  user: [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [scrollState, setScrollState] = useState<'top' | 'scrolled' | 'hidden'>('top')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lastY, setLastY] = useState(0)

  const { scrollY } = useScroll()

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(({ user }) => { setUser(user ?? null); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  useMotionValueEvent(scrollY, 'change', useCallback((latest: number) => {
    if (latest < 20) {
      setScrollState('top')
    } else if (latest > lastY && latest > 100) {
      setScrollState('hidden')
    } else {
      setScrollState('scrolled')
    }
    setLastY(latest)
  }, [lastY]))

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/')
    router.refresh()
  }

  const isLanding = pathname === '/'
  const roleLinks = ROLE_LINKS[user?.role ?? 'user'] ?? ROLE_LINKS.user

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          y: scrollState === 'hidden' ? -100 : 0,
          opacity: scrollState === 'hidden' ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className="fixed top-0 inset-x-0 z-50"
      >
        {/* Outer container   adds horizontal margin on scroll for floating pill effect */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            scrollState === 'scrolled'
              ? 'mx-3 sm:mx-6 mt-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.6)_inset]'
              : isLanding
                ? 'bg-transparent'
                : 'bg-white/80 backdrop-blur-xl border-b border-stone-200/40'
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Logo variant="horizontal" size="sm" />
            </motion.div>

            {/* Desktop nav   center-aligned pill navigation */}
            <div className="hidden md:flex items-center">
              <div className={`flex items-center gap-0.5 px-1 py-1 rounded-xl transition-all duration-300 ${
                scrollState === 'scrolled' ? 'bg-stone-100/60' : 'bg-white/40 backdrop-blur-sm'
              }`}>
                {NAV_LINKS.map((link, i) => {
                  const isAnchor = link.href.startsWith('/#')
                  const isActive = !isAnchor && pathname.startsWith(link.href)
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        href={link.href}
                        className={`relative text-[13px] font-medium px-3.5 py-1.5 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'text-forest-700 bg-white shadow-sm'
                            : 'text-stone-500 hover:text-stone-800 hover:bg-white/70'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              {!loaded ? (
                <div className="flex gap-2">
                  <div className="w-16 h-7 bg-stone-100/80 rounded-lg animate-pulse" />
                  <div className="w-20 h-7 bg-stone-100/80 rounded-lg animate-pulse" />
                </div>
              ) : user ? (
                <>
                  <span className="hidden lg:block text-xs text-stone-400 truncate max-w-[120px]">
                    {user.email}
                  </span>
                  <div className="hidden md:flex items-center gap-1">
                    {roleLinks.map((rl) => (
                      <Link
                        key={rl.href}
                        href={rl.href}
                        className={`text-[13px] font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                          pathname === rl.href
                            ? 'text-forest-700 bg-forest-50'
                            : 'text-stone-600 hover:text-forest-600 hover:bg-forest-50/60'
                        }`}
                      >
                        {rl.icon}
                        <span className="hidden lg:inline">{rl.label}</span>
                      </Link>
                    ))}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="hidden md:inline-flex text-[13px] text-stone-400 hover:text-stone-600 px-2.5 py-1.5 rounded-lg hover:bg-stone-100/60 transition-all duration-200"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-1.5"
                >
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex text-[13px] font-medium text-stone-600 hover:text-stone-900 px-3.5 py-1.5 rounded-lg hover:bg-stone-100/60 transition-all duration-200"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="group relative text-[13px] font-semibold text-white px-4 py-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-forest-500/20"
                    style={{
                      background: 'linear-gradient(135deg, #2c4a34 0%, #3a5a40 100%)',
                    }}
                  >
                    <span className="relative z-10 flex items-center gap-1">
                      Mulai Gratis
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                    </span>
                  </Link>
                </motion.div>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden ml-0.5 p-2 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-stone-100/60 transition-all duration-200"
                aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu   full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-3 top-[72px] z-50 md:hidden"
            >
              <div className="bg-white/95 backdrop-blur-2xl rounded-2xl border border-stone-200/60 shadow-2xl shadow-stone-900/10 overflow-hidden">
                <div className="p-2 space-y-0.5">
                  {NAV_LINKS.map((link, i) => {
                    const isAnchor = link.href.startsWith('/#')
                    const isActive = !isAnchor && pathname.startsWith(link.href)
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.03 * i, duration: 0.3 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center justify-between text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                            isActive
                              ? 'text-forest-700 bg-forest-50'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                          }`}
                        >
                          {link.label}
                          <ChevronRight size={14} className="text-stone-300" />
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="border-t border-stone-100 p-2 space-y-0.5">
                  {user ? (
                    <>
                      <p className="px-4 py-2 text-xs text-stone-400 truncate">{user.email}</p>
                      {roleLinks.map((rl) => (
                        <Link
                          key={rl.href}
                          href={rl.href}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-2.5 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-200 ${
                            pathname === rl.href
                              ? 'text-forest-700 bg-forest-50'
                              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                          }`}
                        >
                          {rl.icon}
                          {rl.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => { setMobileOpen(false); handleLogout() }}
                        className="w-full flex items-center gap-2.5 text-sm font-medium text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl transition-all duration-200"
                      >
                        Keluar
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2 px-2 pb-1">
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-medium text-stone-600 text-center px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-all duration-200"
                      >
                        Masuk
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm font-semibold text-center text-white px-4 py-2.5 rounded-xl transition-all duration-200"
                        style={{ background: 'linear-gradient(135deg, #2c4a34 0%, #3a5a40 100%)' }}
                      >
                        Mulai Gratis
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
