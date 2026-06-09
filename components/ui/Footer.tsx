import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, MessageCircle, Github, Twitter } from 'lucide-react'

const productLinks = [
  { href: '/templates', label: 'Template' },
  { href: '/#fitur', label: 'Fitur' },
  { href: '/#harga', label: 'Harga' },
  { href: '/demo/modern-white', label: 'Demo Live' },
]

const companyLinks = [
  { href: '/#tentang', label: 'Tentang Kami' },
  { href: '/#testimoni', label: 'Testimoni' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/blog', label: 'Blog' },
]

const accountLinks = [
  { href: '/login', label: 'Masuk' },
  { href: '/register', label: 'Daftar' },
  { href: '/dashboard', label: 'Dashboard' },
]

const socials = [
  { href: 'https://instagram.com/akundang.id', icon: Instagram, hoverBg: 'hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200' },
  { href: 'https://twitter.com/akundang', icon: Twitter, hoverBg: 'hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200' },
  { href: 'https://wa.me/628123456789', icon: MessageCircle, hoverBg: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200' },
  { href: 'https://github.com/akundang', icon: Github, hoverBg: 'hover:bg-stone-100 hover:text-stone-700 hover:border-stone-300' },
]

function FooterLinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-stone-800 font-semibold text-sm mb-3 sm:mb-4">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-stone-500 hover:text-forest-500 transition-colors duration-200"
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

  return (
    <footer className="relative bg-white border-t border-stone-200">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand Section */}
          <div className="lg:col-span-4">
            <div className="mb-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/logos/logo-horizontal.png"
                  alt="Akundang - Digital Wedding Invitation"
                  width={160}
                  height={46}
                  className="object-contain"
                  priority
                />
              </Link>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-5 max-w-xs">
              Platform undangan digital premium untuk pasangan modern Indonesia.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2.5">
              {socials.map(({ href, icon: Icon, hoverBg }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400 ${hoverBg} transition-all duration-300`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-6 sm:gap-8">
            <FooterLinkGroup title="Produk" links={productLinks} />
            <FooterLinkGroup title="Perusahaan" links={companyLinks} />
            <FooterLinkGroup title="Akun" links={accountLinks} />
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="text-stone-800 font-semibold text-sm mb-3 sm:mb-4">Kontak</h4>
            <ul className="space-y-2.5 mb-5">
              <li>
                <a
                  href="mailto:halo@akundang.id"
                  className="text-sm text-stone-500 hover:text-forest-500 transition-colors duration-200 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  halo@akundang.id
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/628123456789"
                  className="text-sm text-stone-500 hover:text-forest-500 transition-colors duration-200 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  WhatsApp
                </a>
              </li>
            </ul>

            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 bg-forest-500 text-white text-sm font-semibold rounded-lg hover:bg-forest-600 transition-all shadow-sm hover:shadow-md"
            >
              Mulai Gratis
            </Link>
          </div>

        </div>

        {/* Divider & Bottom */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-stone-100">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-stone-400 text-xs text-center sm:text-left">
              © {currentYear} <span className="text-stone-500 font-medium">Akundang</span>. Semua hak dilindungi.
            </p>

            <div className="flex items-center gap-5 text-xs">
              <Link
                href="/privacy"
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                Privasi
              </Link>
              <Link
                href="/terms"
                className="text-stone-400 hover:text-stone-600 transition-colors"
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
