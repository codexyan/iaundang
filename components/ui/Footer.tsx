import Link from 'next/link'
import { Instagram, Mail, MessageCircle, Github, Twitter } from 'lucide-react'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-dark-gradient text-stone-300">

      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-champagne-500 to-gold-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="mb-3">
              <Logo variant="light" size="lg" href="/" />
            </div>
            <p className="text-stone-400 text-sm leading-relaxed mb-6 max-w-sm">
              Platform undangan digital premium untuk pasangan modern. Buat undangan cantik tanpa coding, kirim ke tamu dengan satu klik.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/akundang.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800/50 border border-stone-700/50 flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 transition-all duration-300 group"
              >
                <Instagram className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://twitter.com/akundang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800/50 border border-stone-700/50 flex items-center justify-center hover:bg-blue-500 hover:border-blue-500 transition-all duration-300 group"
              >
                <Twitter className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://wa.me/628123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800/50 border border-stone-700/50 flex items-center justify-center hover:bg-green-500 hover:border-green-500 transition-all duration-300 group"
              >
                <MessageCircle className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
              </a>
              <a
                href="https://github.com/akundang"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-stone-800/50 border border-stone-700/50 flex items-center justify-center hover:bg-stone-600 hover:border-stone-600 transition-all duration-300 group"
              >
                <Github className="w-4 h-4 text-stone-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">Produk</h4>
            <ul className="space-y-3">
              {[
                { href: '/templates', label: 'Template' },
                { href: '/#fitur', label: 'Fitur' },
                { href: '/#harga', label: 'Harga' },
                { href: '/demo/modern-white', label: 'Demo Live' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">Perusahaan</h4>
            <ul className="space-y-3">
              {[
                { href: '/#tentang', label: 'Tentang Kami' },
                { href: '/#testimoni', label: 'Testimoni' },
                { href: '/#faq', label: 'FAQ' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">Akun</h4>
            <ul className="space-y-3">
              {[
                { href: '/login', label: 'Masuk' },
                { href: '/register', label: 'Daftar' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/reset-password', label: 'Reset Password' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-400 hover:text-gold-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / CTA */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-sm mb-4">Kontak</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a
                  href="mailto:halo@akundang.id"
                  className="text-sm text-stone-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  halo@akundang.id
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/628123456789"
                  className="text-sm text-stone-400 hover:text-gold-400 transition-colors duration-200 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
            </ul>

            {/* Mini CTA */}
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 bg-gold-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Mulai Gratis
            </Link>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-stone-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Copyright */}
            <p className="text-stone-500 text-xs text-center sm:text-left">
              © {currentYear} <span className="text-stone-400 font-medium">Akundang</span>. Semua hak dilindungi. Dibuat dengan semangat untuk pasangan Indonesia.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6 text-xs">
              <Link
                href="/privacy"
                className="text-stone-500 hover:text-stone-300 transition-colors"
              >
                Privasi
              </Link>
              <Link
                href="/terms"
                className="text-stone-500 hover:text-stone-300 transition-colors"
              >
                Syarat & Ketentuan
              </Link>
            </div>

          </div>
        </div>

      </div>
    </footer>
  )
}
