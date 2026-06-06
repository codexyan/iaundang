/**
 * GiftForm - Digital envelope (OPTIONAL)
 * Simplified: Maximum 3 accounts
 */

'use client'

import { Gift, Plus, Trash2 } from 'lucide-react'
import FormField, { inputClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'

interface GiftAccount {
  id: string
  bank_name: string
  account_number: string
  account_name: string
}

interface GiftFormProps {
  accounts: GiftAccount[]
  onAccountsChange: (accounts: GiftAccount[]) => void
}

export default function GiftForm({ accounts, onAccountsChange }: GiftFormProps) {
  function addAccount() {
    if (accounts.length >= 3) {
      alert('Maksimal 3 rekening')
      return
    }

    const newAccount: GiftAccount = {
      id: Date.now().toString(),
      bank_name: '',
      account_number: '',
      account_name: '',
    }

    onAccountsChange([...accounts, newAccount])
  }

  function updateAccount(id: string, field: keyof GiftAccount, value: string) {
    const updated = accounts.map((acc) =>
      acc.id === id ? { ...acc, [field]: value } : acc
    )
    onAccountsChange(updated)
  }

  function removeAccount(id: string) {
    onAccountsChange(accounts.filter((acc) => acc.id !== id))
  }

  return (
    <SectionCard
      title="Amplop Digital"
      icon={Gift}
      description="Rekening bank untuk hadiah (opsional, maks. 3)"
    >
      <div className="space-y-3">
        {accounts.map((account, index) => (
          <div
            key={account.id}
            className="p-4 border border-stone-200 rounded-xl space-y-3 relative group hover:border-gold-300 transition-colors"
          >
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeAccount(account.id)}
              className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              title="Hapus rekening"
            >
              <Trash2 size={14} />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <span className="text-sm font-semibold text-stone-700">
                Rekening {index + 1}
              </span>
            </div>

            <FormField label="Nama Bank" hint="Contoh: BCA, Mandiri, BRI">
              <input
                type="text"
                className={inputClass}
                value={account.bank_name}
                onChange={(e) => updateAccount(account.id, 'bank_name', e.target.value)}
                placeholder="BCA"
              />
            </FormField>

            <FormField label="Nomor Rekening" hint="Masukkan nomor rekening bank">
              <input
                type="text"
                className={inputClass}
                value={account.account_number}
                onChange={(e) => updateAccount(account.id, 'account_number', e.target.value)}
                placeholder="1234567890"
              />
            </FormField>

            <FormField label="Nama Pemilik" hint="Sesuai dengan nama di rekening">
              <input
                type="text"
                className={inputClass}
                value={account.account_name}
                onChange={(e) => updateAccount(account.id, 'account_name', e.target.value)}
                placeholder="Ahmad Budi Santoso"
              />
            </FormField>
          </div>
        ))}

        {accounts.length < 3 && (
          <button
            type="button"
            onClick={addAccount}
            className="w-full py-3 border-2 border-dashed border-stone-300 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-stone-600 hover:border-gold-400 hover:text-gold-600 hover:bg-gold-50/50 transition-all"
          >
            <Plus size={18} />
            Tambah Rekening ({accounts.length}/3)
          </button>
        )}

        {accounts.length === 0 && (
          <div className="text-center py-8 text-stone-400">
            <Gift size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Belum ada rekening. Klik tombol di atas untuk menambah.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
