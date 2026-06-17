'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, MessageCircle } from 'lucide-react'

const productLinks = [
  { href: '/templates', label: 'Template' },
  { href: '/#fitur', label: 'Fitur' },
  { href: '/#harga', label: 'Harga' },
  { href: '/demo/renderer?id=javanese-gold', label: 'Demo Live' },
]

const companyLinks = [
  { href: '/#cara-kerja', label: 'Cara Kerja' },
  { href: '/#testimoni', label: 'Testimoni' },
  { href: '/blog', label: 'Blog' },
  { href: '/#faq', label: 'FAQ' },
]

const socials = [
  { href: 'https://instagram.com/iaundang.id', icon: Instagram, label: 'Instagram' },
  { href: 'https://wa.me/628123456789', icon: MessageCircle, label: 'WhatsApp' },
]

function FooterLinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-stone-800 font-semibold text-[13px] mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] text-stone-400 hover:text-stone-700 transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [user, setUser] = useState<{ email: string; role?: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then(({ user }) => setUser(user ?? null))
      .catch(() => {})
  }, [])

  const accountLinks = user
    ? [
        ...(user.role === 'admin'
          ? [{ href: '/admin', label: 'Admin Panel' }]
          : user.role === 'content_writer'
            ? [{ href: '/writer', label: 'Writer Dashboard' }]
            : user.role === 'affiliate'
              ? [{ href: '/affiliate', label: 'Affiliate' }]
              : []),
        { href: '/dashboard', label: 'Dashboard' },
      ]
    : [
        { href: '/login', label: 'Masuk' },
        { href: '/register', label: 'Daftar' },
      ]

  return (
    <footer className="relative bg-[#fafaf9] border-t border-stone-100">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/logos/logo-horizontal.png"
                alt="iaundang"
                width={140}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
            <p className="text-stone-400 text-[13px] leading-relaxed mb-5 max-w-[280px]">
              Platform undangan digital premium untuk pasangan modern Indonesia.
            </p>
            <div className="flex items-center gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white border border-stone-200/60 flex items-center justify-center text-stone-400 hover:text-stone-600 hover:border-stone-300 hover:shadow-sm transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-6 sm:gap-8">
            <FooterLinkGroup title="Produk" links={productLinks} />
            <FooterLinkGroup title="Perusahaan" links={companyLinks} />
            <FooterLinkGroup title="Akun" links={accountLinks} />
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-stone-800 font-semibold text-[13px] mb-4">Kontak</h4>
            <ul className="space-y-2.5 mb-5">
              <li>
                <a
                  href="mailto:halo@iaundang.id"
                  className="text-[13px] text-stone-400 hover:text-stone-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  halo@iaundang.id
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/628123456789"
                  className="text-[13px] text-stone-400 hover:text-stone-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  WhatsApp
                </a>
              </li>
            </ul>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 bg-forest-500 text-white text-[13px] font-semibold rounded-lg hover:bg-forest-600 transition-all shadow-sm"
            >
              Mulai Gratis
            </Link>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-stone-200/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-stone-400 text-[12px]">
              &copy; {currentYear} <span className="text-stone-500 font-medium">iaundang</span>. Semua hak dilindungi.
            </p>
            <div className="flex items-center gap-5 text-[12px]">
              <Link href="/privacy" className="text-stone-400 hover:text-stone-600 transition-colors">
                Privasi
              </Link>
              <Link href="/terms" className="text-stone-400 hover:text-stone-600 transition-colors">
                Syarat &amp; Ketentuan
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}
