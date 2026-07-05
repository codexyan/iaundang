import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Fraunces } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

// Font display serif (Arah A — Elegant Editorial): hanya untuk heading via
// utility .font-display, bukan body text. Subset latin, weight 500/600 saja.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'iaundang: Buat Undangan Digital Premium, Tanpa Coding, Tanpa Ribet',
    template: '%s | iaundang',
  },
  description:
    'Platform self-service untuk pasangan: pilih template undangan sinematik, kustomisasi langsung dari dashboard, kirim link personal ke setiap tamu. Tanpa skill desain, tanpa coding.',
  keywords: ['undangan digital', 'undangan pernikahan premium', 'template undangan', 'wedding invitation', 'iaundang'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'iaundang: Undangan Digital Premium Tanpa Coding',
    description: 'Pilih template sinematik, kustomisasi dari dashboard, bagikan link personal ke tamu. Tanpa ribet.',
    url: 'https://iaundang.online',
    siteName: 'iaundang',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable} ${fraunces.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
