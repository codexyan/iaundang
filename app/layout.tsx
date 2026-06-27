import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from 'react-hot-toast'

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
    url: 'https://iaundang.id',
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
    <html lang="id" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
