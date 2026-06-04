import { NextResponse } from 'next/server'
import { settings } from '@/lib/db'

// Public endpoint — user dashboard baca ini untuk tampilkan info pembayaran
export async function GET() {
  const s = await settings.get()
  return NextResponse.json({
    bankAccounts: s.bankAccounts.filter((b) => b.isActive),
    qrisImageUrl: s.qrisImageUrl,
    paymentInstructions: s.paymentInstructions,
    confirmationWhatsapp: s.confirmationWhatsapp,
    price: s.price,
    packageName: s.packageName,
    packageDuration: s.packageDuration,
  })
}
