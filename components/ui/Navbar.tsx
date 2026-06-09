'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'

const NAV_LINKS = [
  { href: '/#fitur', label: 'Fitur' },
  { href: '/#templates', label: 'Template' },
  { href: '/#harga', label: 'Harga' },
  { href: '/#faq', label: 'FAQ' },
]

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(({ user }) => { setUser(user ?? null); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  return (
    <>
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-stone-200/60 shadow-sm'
            : isLanding
              ? 'bg-transparent border-b border-transparent'
              : 'bg-white/95 backdrop-blur-sm border-b border-stone-200/50'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo variant="horizontal" size="sm" />

          {/* Desktop nav links */}
          {isLanding && (
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-colors ${
                    scrolled
                      ? 'text-stone-600 hover:text-forest-500 hover:bg-forest-50'
                      : 'text-stone-500 hover:text-stone-800 hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {!loaded ? (
              <div className="flex gap-2">
                <div className="w-16 h-8 bg-stone-100 rounded-xl animate-pulse" />
                <div className="w-24 h-8 bg-stone-100 rounded-xl animate-pulse" />
              </div>
            ) : user ? (
              <>
                <span className="hidden sm:block text-xs text-stone-400 truncate max-w-[140px] mr-2">
                  {user.email}
                </span>
                <Link
                  href={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="text-sm font-medium text-stone-700 hover:text-forest-500 px-3 py-1.5 rounded-xl hover:bg-forest-50 transition-colors"
                >
                  {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-stone-400 hover:text-stone-700 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-forest-500 hover:bg-forest-600 text-white px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Mulai Gratis
                </Link>
                {/* Mobile menu button */}
                {isLanding && (
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden ml-1 p-2 rounded-xl text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                    aria-label="Toggle menu"
                  >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && isLanding && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border-b border-stone-200 shadow-lg px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-stone-600 hover:text-forest-500 hover:bg-forest-50 px-4 py-2.5 rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-stone-100 mt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm font-medium text-stone-600 hover:text-stone-900 px-4 py-2.5 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  Masuk
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
