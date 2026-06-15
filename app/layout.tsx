import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Akundang: Buat Undangan Digital Premium, Tanpa Coding, Tanpa Ribet',
    template: '%s | Akundang',
  },
  description:
    'Platform self-service untuk pasangan: pilih template undangan sinematik, kustomisasi langsung dari dashboard, kirim link personal ke setiap tamu. Tanpa skill desain, tanpa coding.',
  keywords: ['undangan digital', 'undangan pernikahan premium', 'template undangan', 'wedding invitation', 'Akundang'],
  openGraph: {
    title: 'Akundang: Undangan Digital Premium Tanpa Coding',
    description: 'Pilih template sinematik, kustomisasi dari dashboard, bagikan link personal ke tamu. Tanpa ribet.',
    url: 'https://akundang.id',
    siteName: 'Akundang',
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
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
