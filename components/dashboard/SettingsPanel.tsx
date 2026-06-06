'use client'

import type { Invitation } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface Props {
  invitation: Invitation
}

export default function SettingsPanel({ invitation }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-rose-500 font-semibold">Pengaturan</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Kelola akun & undangan</h2>
            <p className="mt-2 text-sm text-gray-500 max-w-2xl">Pengaturan dasar untuk undangan Anda dan preferensi dashboard.</p>
          </div>
          <div className="rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Slug: <span className="font-medium text-gray-900">{invitation.slug}.akundang.id</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Preferensi notifikasi</p>
            <p className="text-sm text-gray-500 mt-2">Aktifkan notifikasi email untuk pembaruan undangan dan transaksi.</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white border border-gray-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Email notifikasi</p>
                <p className="text-xs text-gray-500">Pesan akan dikirim ke alamat email akun Anda.</p>
              </div>
              <Button variant="secondary" size="sm">Ubah</Button>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Akun pengguna</p>
            <p className="text-sm text-gray-500 mt-2">Kelola akses dan informasi dasar akun.</p>
            <div className="mt-4 rounded-2xl bg-white border border-gray-200 p-4">
              <p className="text-xs text-gray-400">Email login</p>
              <p className="mt-1 font-medium text-gray-900">{invitation.user_id}@example.com</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
          <p className="text-sm font-semibold text-gray-900">Informasi undangan</p>
          <p className="text-sm text-gray-500 mt-2">Slug undangan ini akan digunakan di semua modul terkait.</p>
          <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-xs text-gray-500">Link undangan</p>
            <p className="text-sm font-medium text-gold-600 mt-1">https://{invitation.slug}.akundang.id</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Alamat Hadiah</p>
              <p className="text-sm text-gray-500 mt-2">Tempat pengiriman hadiah dan nomor kontak penerima.</p>
            </div>
            <Button variant="secondary" size="sm">Ubah</Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Alamat</p>
              <p className="mt-1 text-sm text-gray-700">{invitation.data.giftAddress || 'Belum diatur'}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Penerima</p>
              <p className="mt-1 text-sm text-gray-700">{invitation.data.giftRecipient || 'Belum diatur'}</p>
              <p className="text-xs text-gray-500 mt-1">{invitation.data.giftContact || 'No. WA belum diatur'}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Transfer / QRIS</p>
              <p className="text-sm text-gray-500 mt-2">Berikan informasi rekening atau QRIS yang bisa dipakai tamu yang tidak bisa hadir.</p>
            </div>
            <Button variant="secondary" size="sm">Ubah</Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Bank / QRIS</p>
              <p className="mt-1 text-sm text-gray-700">{invitation.data.paymentBankName || invitation.data.paymentQris || 'Belum diatur'}</p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Rekening</p>
              <p className="mt-1 text-sm text-gray-700">{invitation.data.paymentAccountNumber || 'Belum diatur'}</p>
              <p className="text-xs text-gray-500 mt-1">{invitation.data.paymentAccountName || ''}</p>
            </div>
          </div>
          {invitation.data.paymentNote && (
            <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
              {invitation.data.paymentNote}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
