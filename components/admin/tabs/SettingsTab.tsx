'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Save, Image as ImageIcon, User, Phone, Globe2,
  Instagram, Twitter, Github, Mail,
  Shield, Key, Loader2, Check, Palette,
  PanelTop, PanelBottom, LayoutDashboard, Monitor, Smartphone,
  ToggleLeft, ToggleRight, Info,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ImageUploadField from '../ImageUploadField'

//  Types 

interface LogoUsage {
  navbar: boolean
  footer: boolean
  dashboard: boolean
  favicon: boolean
}

export interface SiteSettings {
  siteName: string
  siteTagline: string
  logoHorizontalUrl: string
  logoVerticalUrl: string
  contactEmail: string
  contactWhatsapp: string
  socialInstagram: string
  socialTwitter: string
  socialGithub: string
  appDomain: string
  demoSubdomain: string
  logoUsage?: LogoUsage
}

interface Props {
  settings: SiteSettings
  adminEmail: string
  onSave: (s: SiteSettings) => Promise<void>
}

type SubTab = 'branding' | 'logo-usage' | 'account' | 'contact'

const SUB_TABS: { id: SubTab; label: string; icon: React.ElementType; mobileLabel: string }[] = [
  { id: 'branding',   label: 'Branding',           icon: Palette,          mobileLabel: 'Brand' },
  { id: 'logo-usage', label: 'Penggunaan Logo',    icon: Monitor,          mobileLabel: 'Logo' },
  { id: 'account',    label: 'Akun Admin',         icon: Shield,           mobileLabel: 'Akun' },
  { id: 'contact',    label: 'Kontak & Sosial',    icon: Globe2,           mobileLabel: 'Kontak' },
]

//  Shared components 

function Field({
  label, hint, icon: Icon, value, onChange, placeholder, type = 'text', disabled = false,
}: {
  label: string; hint?: string; icon?: React.ElementType; value: string
  onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400 ${Icon ? 'pl-9 pr-3' : 'px-3'} py-2.5`}
        />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-2 group" type="button">
      {enabled ? (
        <ToggleRight className="w-6 h-6 text-indigo-600" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-gray-300 group-hover:text-gray-400" />
      )}
      <span className={`text-xs font-medium ${enabled ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
    </button>
  )
}

//  Logo Usage Preview Card 

function LogoUsageCard({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  preview,
}: {
  icon: React.ElementType
  title: string
  description: string
  enabled: boolean
  onToggle: () => void
  preview: React.ReactNode
}) {
  return (
    <div className={`rounded-xl border transition-all ${enabled ? 'border-indigo-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50/50'}`}>
      {/* Preview */}
      <div className={`rounded-t-xl overflow-hidden border-b ${enabled ? 'border-indigo-100' : 'border-gray-100'}`}>
        <div className={`h-20 sm:h-24 flex items-center justify-center transition-opacity ${enabled ? 'opacity-100' : 'opacity-30'}`}>
          {preview}
        </div>
      </div>
      {/* Controls */}
      <div className="p-3 sm:p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${enabled ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{title}</p>
            <p className="text-[10px] text-gray-400 leading-snug mt-0.5">{description}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          type="button"
          className="shrink-0"
        >
          {enabled ? (
            <ToggleRight className="w-7 h-7 text-indigo-600" />
          ) : (
            <ToggleLeft className="w-7 h-7 text-gray-300 hover:text-gray-400 transition-colors" />
          )}
        </button>
      </div>
    </div>
  )
}

//  Sub-tab: Branding 

function BrandingPanel({
  form, update,
}: {
  form: SiteSettings
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void
}) {
  return (
    <div className="space-y-6">
      {/* Identity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Identitas Brand</h3>
        <p className="text-[11px] text-gray-400 mb-4">Nama dan tagline yang tampil di seluruh website</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nama Brand"
            value={form.siteName}
            onChange={(v) => update('siteName', v)}
            placeholder="iaundang"
          />
          <Field
            label="Tagline"
            value={form.siteTagline}
            onChange={(v) => update('siteTagline', v)}
            placeholder="Digital Wedding Invitation"
          />
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Domain & Subdomain */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Domain & Subdomain</h3>
        <p className="text-[11px] text-gray-400 mb-4">Konfigurasi domain utama dan subdomain demo untuk preview template gratis</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Domain Utama"
            icon={Globe2}
            value={form.appDomain ?? ''}
            onChange={(v) => update('appDomain', v)}
            placeholder="iaundang.id"
            hint="Domain utama website (tanpa http://). Digunakan untuk routing subdomain."
          />
          <Field
            label="Subdomain Demo"
            icon={Globe2}
            value={form.demoSubdomain ?? ''}
            onChange={(v) => update('demoSubdomain', v)}
            placeholder="demo"
            hint={`Template gratis bisa diakses di ${form.demoSubdomain || 'demo'}.${form.appDomain || 'iaundang.id'}`}
          />
        </div>
        <div className="mt-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3">
          <p className="text-[11px] text-indigo-700 font-medium mb-1">Pola URL Undangan</p>
          <div className="space-y-1">
            <p className="text-[10px] text-indigo-600 font-mono">
              User: <span className="font-semibold">nama-pasangan.{form.appDomain || 'iaundang.id'}</span>
            </p>
            <p className="text-[10px] text-indigo-600 font-mono">
              Demo: <span className="font-semibold">{form.demoSubdomain || 'demo'}.{form.appDomain || 'iaundang.id'}</span>
            </p>
            <p className="text-[10px] text-indigo-600 font-mono">
              Localhost: <span className="font-semibold">localhost:3000?slug=nama-pasangan</span>
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Logo upload */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Logo</h3>
        <p className="text-[11px] text-gray-400 mb-4">Upload logo untuk tampilan di berbagai konteks. Atur di mana logo tampil melalui tab Penggunaan Logo.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Horizontal</p>
              <span className="text-[9px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">Rasio ~4:1</span>
            </div>
            <ImageUploadField
              value={form.logoHorizontalUrl || undefined}
              onChange={(url) => update('logoHorizontalUrl', url ?? '')}
              hint="Digunakan di Navbar, Footer, dan Dashboard"
            />
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">Vertikal / Ikon</p>
              <span className="text-[9px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">Rasio 1:1</span>
            </div>
            <ImageUploadField
              value={form.logoVerticalUrl || undefined}
              onChange={(url) => update('logoVerticalUrl', url ?? '')}
              hint="Digunakan di loading screen dan favicon"
            />
          </div>
        </div>
      </div>

      {/* Live preview */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
        <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-3">Preview Logo</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Horizontal (terang)</p>
            <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-center h-16">
              {form.logoHorizontalUrl ? (
                <Image src={form.logoHorizontalUrl} alt="Logo horizontal" width={140} height={40} className="object-contain max-h-10" />
              ) : (
                <span className="text-xs text-gray-300">Belum ada logo</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Horizontal (gelap)</p>
            <div className="bg-stone-900 rounded-lg border border-stone-700 p-4 flex items-center justify-center h-16">
              {form.logoHorizontalUrl ? (
                <Image src={form.logoHorizontalUrl} alt="Logo horizontal dark" width={140} height={40} className="object-contain max-h-10" style={{ filter: 'brightness(1.15)' }} />
              ) : (
                <span className="text-xs text-stone-600">Belum ada logo</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

//  Sub-tab: Logo Usage 

function LogoUsagePanel({
  form, update,
}: {
  form: SiteSettings
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void
}) {
  const usage: LogoUsage = form.logoUsage ?? { navbar: true, footer: true, dashboard: true, favicon: true }

  function toggleUsage(key: keyof LogoUsage) {
    update('logoUsage', { ...usage, [key]: !usage[key] })
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Kontrol Penggunaan Logo</h3>
        <p className="text-[11px] text-gray-400 mb-4">Pilih di mana logo brand ditampilkan. Nonaktifkan untuk menggunakan teks sebagai pengganti.</p>
      </div>

      {/* Desktop / Tablet: 2 cols, Mobile: 1 col */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <LogoUsageCard
          icon={PanelTop}
          title="Navbar"
          description="Logo di navigasi atas halaman utama dan semua halaman publik"
          enabled={usage.navbar}
          onToggle={() => toggleUsage('navbar')}
          preview={
            <div className="w-full px-4 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                {usage.navbar && form.logoHorizontalUrl ? (
                  <Image src={form.logoHorizontalUrl} alt="" width={100} height={28} className="object-contain" />
                ) : (
                  <span className="text-sm font-bold text-gray-700">{form.siteName || 'Brand'}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <div className="w-10 h-5 bg-gray-100 rounded" />
                <div className="w-14 h-5 bg-indigo-100 rounded" />
              </div>
            </div>
          }
        />

        <LogoUsageCard
          icon={PanelBottom}
          title="Footer"
          description="Logo di bagian bawah halaman utama website"
          enabled={usage.footer}
          onToggle={() => toggleUsage('footer')}
          preview={
            <div className="w-full px-4 flex items-center bg-white">
              <div className="flex items-center gap-3">
                {usage.footer && form.logoHorizontalUrl ? (
                  <Image src={form.logoHorizontalUrl} alt="" width={90} height={26} className="object-contain" />
                ) : (
                  <span className="text-xs font-bold text-gray-600">{form.siteName || 'Brand'}</span>
                )}
                <div className="h-6 w-px bg-gray-200" />
                <div className="space-y-1">
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full" />
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full" />
                </div>
              </div>
            </div>
          }
        />

        <LogoUsageCard
          icon={LayoutDashboard}
          title="Dashboard Admin"
          description="Logo atau ikon di sidebar panel admin (halaman ini)"
          enabled={usage.dashboard}
          onToggle={() => toggleUsage('dashboard')}
          preview={
            <div className="flex items-center gap-3 px-4">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                {usage.dashboard && form.logoVerticalUrl ? (
                  <Image src={form.logoVerticalUrl} alt="" width={20} height={20} className="object-contain" />
                ) : (
                  <span className="text-[10px] font-bold text-white">A</span>
                )}
              </div>
              <div>
                <div className="w-14 h-2 bg-gray-800 rounded-full mb-1" />
                <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
              </div>
            </div>
          }
        />

        <LogoUsageCard
          icon={Globe2}
          title="Favicon"
          description="Ikon kecil di tab browser (menggunakan logo vertikal)"
          enabled={usage.favicon}
          onToggle={() => toggleUsage('favicon')}
          preview={
            <div className="flex items-center gap-2 px-4">
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-1 border border-gray-200">
                <div className="w-3.5 h-3.5 rounded-sm bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {usage.favicon && form.logoVerticalUrl ? (
                    <Image src={form.logoVerticalUrl} alt="" width={12} height={12} className="object-contain" />
                  ) : (
                    <span className="text-[6px] font-bold text-indigo-500">A</span>
                  )}
                </div>
                <span className="text-[9px] text-gray-500 font-medium">{form.siteName || 'Site'}</span>
                <span className="text-[8px] text-gray-300 ml-1">×</span>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-50 rounded-md px-2 py-1 border border-gray-100">
                <div className="w-3.5 h-3.5 rounded-sm bg-gray-200" />
                <span className="text-[9px] text-gray-400">New Tab</span>
              </div>
            </div>
          }
        />
      </div>

      {/* Device preview */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-3.5 h-3.5 text-stone-400" />
          <p className="text-[11px] text-stone-500">
            Perubahan penggunaan logo akan langsung terlihat setelah menyimpan dan me-refresh halaman.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <Monitor className="w-3 h-3" /> Desktop
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-stone-400">
            <Smartphone className="w-3 h-3" /> Mobile
          </div>
          <span className="text-[10px] text-stone-300">· tampilan menyesuaikan otomatis</span>
        </div>
      </div>
    </div>
  )
}

//  Sub-tab: Account 

function AccountPanel({ adminEmail }: { adminEmail: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Informasi Akun</h3>
        <p className="text-[11px] text-gray-400 mb-4">Akun administrator yang saat ini login ke panel ini</p>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-white uppercase">{adminEmail.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{adminEmail}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Superadmin</span>
              <span className="text-[10px] text-gray-400">Akses penuh ke semua modul</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white/80 rounded-lg p-3 border border-indigo-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-xs text-gray-700 font-mono truncate">{adminEmail}</p>
          </div>
          <div className="bg-white/80 rounded-lg p-3 border border-indigo-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Role</p>
            <p className="text-xs text-gray-700">Administrator (Superadmin)</p>
          </div>
        </div>
      </div>

      {/* Password */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Keamanan</h4>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 rounded-lg p-3.5 border border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-700">Password</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Di-hash dengan bcrypt · Terakhir diubah: -</p>
          </div>
          <button
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
            onClick={() => toast('Fitur ganti password akan tersedia segera', { icon: '�' })}
          >
            Ganti Password
          </button>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-semibold text-gray-900">Hak Akses</h4>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            'Kelola Pengguna', 'Kelola Undangan', 'Kelola Template',
            'Verifikasi Pembayaran', 'Pengaturan Sistem', 'Konten Website',
          ].map((perm) => (
            <div key={perm} className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-2.5 py-1.5 border border-emerald-100">
              <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="text-[10px] text-emerald-700 font-medium">{perm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Environment */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
        <p className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Catatan:</strong> Email admin dikelola via environment variable <code className="text-[10px] bg-amber-100 px-1 rounded font-mono">ADMIN_EMAIL</code>. Untuk mengganti admin, update variabel tersebut di server.
        </p>
      </div>
    </div>
  )
}

//  Sub-tab: Contact 

function ContactPanel({
  form, update,
}: {
  form: SiteSettings
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Informasi Kontak</h3>
        <p className="text-[11px] text-gray-400 mb-4">Kontak utama yang ditampilkan di landing page, footer, dan halaman bantuan</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Email Kontak"
            icon={Mail}
            value={form.contactEmail}
            onChange={(v) => update('contactEmail', v)}
            placeholder="halo@iaundang.id"
            type="email"
            hint="Ditampilkan di footer website"
          />
          <Field
            label="WhatsApp"
            icon={Phone}
            value={form.contactWhatsapp}
            onChange={(v) => update('contactWhatsapp', v)}
            placeholder="628123456789"
            hint="Format internasional tanpa +"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Media Sosial</h3>
        <p className="text-[11px] text-gray-400 mb-4">Link sosial media yang ditampilkan di footer dan halaman kontak</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Instagram"
            icon={Instagram}
            value={form.socialInstagram}
            onChange={(v) => update('socialInstagram', v)}
            placeholder="iaundang.id"
            hint="Username tanpa @"
          />
          <Field
            label="Twitter / X"
            icon={Twitter}
            value={form.socialTwitter}
            onChange={(v) => update('socialTwitter', v)}
            placeholder="iaundang"
            hint="Username tanpa @"
          />
        </div>
        <Field
          label="GitHub"
          icon={Github}
          value={form.socialGithub}
          onChange={(v) => update('socialGithub', v)}
          placeholder="iaundang"
          hint="Repository atau organisasi"
        />
      </div>

      {/* Preview */}
      <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
        <p className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide mb-3">Preview Footer</p>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap items-center gap-3">
          {form.contactEmail && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Mail className="w-3 h-3" /> {form.contactEmail}
            </span>
          )}
          {form.contactWhatsapp && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Phone className="w-3 h-3" /> +{form.contactWhatsapp}
            </span>
          )}
          {form.socialInstagram && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Instagram className="w-3 h-3" /> @{form.socialInstagram}
            </span>
          )}
          {form.socialTwitter && (
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <Twitter className="w-3 h-3" /> @{form.socialTwitter}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

//  Main component 

export default function SettingsTab({ settings: initial, adminEmail, onSave }: Props) {
  const [form, setForm] = useState<SiteSettings>(initial)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subTab, setSubTab] = useState<SubTab>('branding')

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial)

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header - responsive */}
      <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">Pengaturan</h1>
            <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">Branding, logo, akun admin, dan kontak</p>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all shrink-0 ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : hasChanges
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{saving ? 'Menyimpan...' : saved ? 'Tersimpan!' : 'Simpan'}</span>
          </button>
        </div>

        {/* Sub-tabs - scrollable on mobile */}
        <div className="mt-3 -mb-px flex gap-0.5 overflow-x-auto scrollbar-hide">
          {SUB_TABS.map(({ id, label, icon: Icon, mobileLabel }) => {
            const isActive = subTab === id
            return (
              <button
                key={id}
                onClick={() => setSubTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="sm:hidden">{mobileLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content - responsive padding */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-8 max-w-3xl">
          {subTab === 'branding' && <BrandingPanel form={form} update={update} />}
          {subTab === 'logo-usage' && <LogoUsagePanel form={form} update={update} />}
          {subTab === 'account' && <AccountPanel adminEmail={adminEmail} />}
          {subTab === 'contact' && <ContactPanel form={form} update={update} />}
        </div>
      </div>
    </div>
  )
}
