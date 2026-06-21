'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import {
  ChevronRight, ChevronLeft, Check, Crown, Rocket, Gem,
  Copy, QrCode, CreditCard, Send, Loader2, CheckCircle2,
  User, Users, Globe, Palette, ShoppingBag, Clock, X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface TemplateInfo {
  id: string
  name: string
  category: string
  thumbnail_url: string
  config: {
    meta: { color_scheme: { primary: string; accent: string; text: string } }
    opening?: { cover_photo_url?: string; background_image?: string }
  }
}

interface TierFeatures {
  max_photos: number
  max_guests: number
  music: boolean
  custom_music: boolean
  opening_animation: boolean
  rsvp: boolean
  wishes: boolean
  countdown: boolean
  gallery: boolean
  gift: boolean
  gift_registry: boolean
  story: boolean
  video: boolean
  livestream: boolean
  qrcode: boolean
  custom_domain: boolean
  subdomain: boolean
  remove_watermark: boolean
  analytics: boolean
  priority_support: boolean
  validity_days: number
}

interface TierInfo {
  id: string
  label: string
  price: number
  description: string
  color: string
  icon: string
  highlight: boolean
  features: TierFeatures | null
}

interface PaymentConfig {
  bankAccounts: { id: string; bankName: string; accountNumber: string; accountName: string }[]
  qrisImageUrl: string
  paymentInstructions: string
  confirmationWhatsapp: string
}

interface Props {
  templates: TemplateInfo[]
  tiers: TierInfo[]
  paymentConfig: PaymentConfig
  initialTemplate?: string
}

type Step = 0 | 1 | 2 | 3 | 4

const STEP_LABELS = [
  { icon: User, label: 'Data Mempelai' },
  { icon: Globe, label: 'Subdomain & Kontak' },
  { icon: Palette, label: 'Pilih Template' },
  { icon: ShoppingBag, label: 'Pilih Paket' },
  { icon: CreditCard, label: 'Pembayaran' },
]

const TIER_ICONS: Record<string, React.ElementType> = { rocket: Rocket, crown: Crown, gem: Gem }

function buildTierFeatureList(tierId: string, f: TierFeatures): { label: string; included: boolean }[] {
  const list: { label: string; included: boolean }[] = []
  list.push({ label: `Foto hingga ${f.max_photos} buah`, included: true })
  list.push({ label: `Maks ${f.max_guests} tamu undangan`, included: true })
  list.push({ label: `Aktif ${f.validity_days} hari`, included: true })
  list.push({ label: 'Musik pengiring', included: f.music })
  list.push({ label: 'RSVP online', included: f.rsvp })
  list.push({ label: 'Galeri foto', included: f.gallery })
  list.push({ label: 'Ucapan & doa tamu', included: f.wishes })
  list.push({ label: 'Countdown hari H', included: f.countdown })
  list.push({ label: 'Amplop digital', included: f.gift })
  list.push({ label: 'Wishlist hadiah', included: f.gift_registry })
  list.push({ label: 'Kisah cinta', included: f.story })
  list.push({ label: 'Video prewedding', included: f.video })
  if (tierId === 'eksklusif' || f.qrcode) {
    list.push({ label: 'QR code kehadiran', included: f.qrcode })
  }
  if (tierId === 'eksklusif' || f.custom_domain) {
    list.push({ label: 'Custom domain', included: f.custom_domain })
  }
  list.push({ label: 'Priority support', included: f.priority_support })
  return list
}

const INPUT_CLS = 'w-full px-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 transition-colors'
const LABEL_CLS = 'block text-xs font-semibold text-stone-600 mb-1.5'

export default function OrderForm({ templates, tiers, paymentConfig, initialTemplate }: Props) {
  const [step, setStep] = useState<Step>(0)

  // Step 0: Couple data
  const [groomName, setGroomName] = useState('')
  const [brideName, setBrideName] = useState('')
  const [groomNickname, setGroomNickname] = useState('')
  const [brideNickname, setBrideNickname] = useState('')
  const [groomFather, setGroomFather] = useState('')
  const [groomMother, setGroomMother] = useState('')
  const [brideFather, setBrideFather] = useState('')
  const [brideMother, setBrideMother] = useState('')
  const [groomProfession, setGroomProfession] = useState('')
  const [brideProfession, setBrideProfession] = useState('')

  // Step 1: Contact & subdomain
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)

  // Step 2: Template — pre-select from query param
  const [templateId, setTemplateId] = useState(() => {
    if (initialTemplate && templates.some(t => t.id === initialTemplate)) return initialTemplate
    return ''
  })

  // Step 3: Package
  const [packageTier, setPackageTier] = useState('')

  // Step 4: Payment result
  const [order, setOrder] = useState<{ order_number: string; total_amount: number; unique_code: number; amount: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const checkSubdomain = useCallback((slug: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const cleaned = slug.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(cleaned)
    if (cleaned.length < 3) { setSubdomainAvailable(null); return }
    setCheckingSubdomain(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/orders/check-subdomain?slug=${cleaned}`)
        const data = await res.json()
        setSubdomainAvailable(data.available)
      } catch { setSubdomainAvailable(null) }
      finally { setCheckingSubdomain(false) }
    }, 500)
  }, [])

  useEffect(() => {
    if (!groomNickname || !brideNickname) return
    const auto = `${groomNickname}-${brideNickname}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
    if (!subdomain) checkSubdomain(auto)
  }, [groomNickname, brideNickname, subdomain, checkSubdomain])

  function canNext(): boolean {
    switch (step) {
      case 0: return !!(groomName && brideName && groomNickname && brideNickname)
      case 1: return !!(email && subdomain && subdomainAvailable)
      case 2: return !!templateId
      case 3: return !!packageTier
      default: return false
    }
  }

  async function handleSubmitOrder() {
    setSubmitting(true)
    try {
      const tier = tiers.find(t => t.id === packageTier)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, phone,
          groom_name: groomName, bride_name: brideName,
          groom_nickname: groomNickname, bride_nickname: brideNickname,
          groom_father: groomFather, groom_mother: groomMother,
          bride_father: brideFather, bride_mother: brideMother,
          groom_profession: groomProfession, bride_profession: brideProfession,
          subdomain, template_id: templateId,
          package_tier: packageTier, amount: tier?.price ?? 0,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Gagal membuat pesanan')
        return
      }
      const { order: newOrder } = await res.json()
      setOrder(newOrder)
      setStep(4)
      toast.success('Pesanan berhasil dibuat!')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setSubmitting(false) }
  }

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text)
    setCopied(label)
    toast.success('Disalin!')
    setTimeout(() => setCopied(null), 2000)
  }

  function openWhatsApp() {
    if (!paymentConfig.confirmationWhatsapp || !order) return
    const tier = tiers.find(t => t.id === packageTier)
    const msg = [
      `Halo admin iaundang! 👋`,
      ``,
      `Saya ingin konfirmasi pembayaran:`,
      `📋 No. Pesanan: ${order.order_number}`,
      `👤 ${groomNickname} & ${brideNickname}`,
      `📧 Email: ${email}`,
      `📦 Paket: ${tier?.label ?? packageTier}`,
      `💰 Total: Rp ${order.total_amount.toLocaleString('id-ID')}`,
      `🌐 Subdomain: ${subdomain}.iaundang.id`,
      ``,
      `Mohon diverifikasi. Terima kasih! 🙏`,
    ].join('\n')
    window.open(`https://wa.me/${paymentConfig.confirmationWhatsapp}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const selectedTier = tiers.find(t => t.id === packageTier)

  return (
    <div className="min-h-screen bg-[#fafaf9] pt-24 pb-16">
      <Toaster position="top-center" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">Buat Undangan Digital</h1>
          <p className="mt-2 text-sm text-stone-400">Isi data, pilih desain, dan undangan siap dibagikan</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {STEP_LABELS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === i
            const isDone = i < step
            return (
              <div key={i} className="flex items-center">
                {i > 0 && <div className={`w-6 sm:w-10 h-px mx-1 ${isDone ? 'bg-forest-300' : 'bg-stone-200'}`} />}
                <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors ${
                  isActive ? 'bg-forest-100 text-forest-700' :
                  isDone ? 'text-forest-500' : 'text-stone-400'
                }`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive ? 'bg-forest-600 text-white' :
                    isDone ? 'bg-forest-200 text-forest-700' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">

          {/* Step 0: Data Mempelai */}
          {step === 0 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Users size={18} className="text-forest-500" />
                <h2 className="text-lg font-semibold text-stone-900">Data Mempelai</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Groom */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Mempelai Pria</div>
                  <div>
                    <label className={LABEL_CLS}>Nama Lengkap *</label>
                    <input value={groomName} onChange={e => setGroomName(e.target.value)} placeholder="Muhammad Rizky Pratama, S.Kom" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Panggilan *</label>
                    <input value={groomNickname} onChange={e => setGroomNickname(e.target.value)} placeholder="Rizky" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Profesi</label>
                    <input value={groomProfession} onChange={e => setGroomProfession(e.target.value)} placeholder="Software Engineer" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Ayah</label>
                    <input value={groomFather} onChange={e => setGroomFather(e.target.value)} placeholder="Bapak H. Ahmad Pratama" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Ibu</label>
                    <input value={groomMother} onChange={e => setGroomMother(e.target.value)} placeholder="Ibu Hj. Siti Aminah" className={INPUT_CLS} />
                  </div>
                </div>

                {/* Bride */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Mempelai Wanita</div>
                  <div>
                    <label className={LABEL_CLS}>Nama Lengkap *</label>
                    <input value={brideName} onChange={e => setBrideName(e.target.value)} placeholder="Aulia Putri Ramadhani, S.Pd" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Panggilan *</label>
                    <input value={brideNickname} onChange={e => setBrideNickname(e.target.value)} placeholder="Aulia" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Profesi</label>
                    <input value={brideProfession} onChange={e => setBrideProfession(e.target.value)} placeholder="Guru" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Ayah</label>
                    <input value={brideFather} onChange={e => setBrideFather(e.target.value)} placeholder="Bapak Ir. Dedi Ramadhani" className={INPUT_CLS} />
                  </div>
                  <div>
                    <label className={LABEL_CLS}>Nama Ibu</label>
                    <input value={brideMother} onChange={e => setBrideMother(e.target.value)} placeholder="Ibu Nurhasanah" className={INPUT_CLS} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Subdomain & Contact */}
          {step === 1 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Globe size={18} className="text-forest-500" />
                <h2 className="text-lg font-semibold text-stone-900">Subdomain & Kontak</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className={LABEL_CLS}>Subdomain Undangan *</label>
                  <div className="flex items-center gap-0">
                    <input
                      value={subdomain}
                      onChange={e => checkSubdomain(e.target.value)}
                      placeholder="rizky-aulia"
                      className="flex-1 px-4 py-3 text-sm border border-stone-200 rounded-l-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 transition-colors"
                    />
                    <span className="px-4 py-3 text-sm bg-stone-100 border border-l-0 border-stone-200 rounded-r-xl text-stone-500 font-mono whitespace-nowrap">
                      .iaundang.id
                    </span>
                  </div>
                  {subdomain.length >= 3 && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {checkingSubdomain ? (
                        <><Loader2 size={12} className="animate-spin text-stone-400" /><span className="text-xs text-stone-400">Memeriksa...</span></>
                      ) : subdomainAvailable ? (
                        <><CheckCircle2 size={12} className="text-green-500" /><span className="text-xs text-green-600 font-medium">Tersedia!</span></>
                      ) : subdomainAvailable === false ? (
                        <><span className="text-xs text-red-500">Subdomain sudah digunakan, coba yang lain</span></>
                      ) : null}
                    </div>
                  )}
                  <p className="text-[11px] text-stone-400 mt-1">Ini akan menjadi alamat undangan kalian. Contoh: rizky-aulia.iaundang.id</p>
                </div>

                <div>
                  <label className={LABEL_CLS}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" className={INPUT_CLS} />
                  <p className="text-[11px] text-stone-400 mt-1">Kredensial login akan dikirimkan ke email ini setelah pembayaran dikonfirmasi</p>
                </div>

                <div>
                  <label className={LABEL_CLS}>WhatsApp</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08123456789" className={INPUT_CLS} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Template */}
          {step === 2 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Palette size={18} className="text-forest-500" />
                <h2 className="text-lg font-semibold text-stone-900">Pilih Template</h2>
              </div>

              {templates.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-10">Belum ada template tersedia.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {templates.map(t => {
                    const cs = t.config.meta.color_scheme
                    const coverPhoto = t.config.opening?.cover_photo_url || t.config.opening?.background_image
                    const selected = templateId === t.id
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTemplateId(t.id)}
                        className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all ${
                          selected
                            ? 'border-forest-500 shadow-lg shadow-forest-100'
                            : 'border-stone-150 hover:border-stone-300 hover:shadow-md'
                        }`}
                      >
                        <div className="relative" style={{ aspectRatio: '9/16', backgroundColor: cs.primary }}>
                          {coverPhoto && (
                            <Image src={coverPhoto} alt={t.name} fill className="object-cover" sizes="200px" style={{ opacity: 0.6 }} />
                          )}
                          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${cs.primary}dd 70%, ${cs.primary} 100%)` }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-2">
                            <p className="text-[7px] tracking-[0.2em] uppercase" style={{ color: cs.accent }}>The Wedding of</p>
                            <p className="text-xs font-bold mt-1" style={{ color: cs.text, fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                              {groomNickname || 'Rizky'} & {brideNickname || 'Aulia'}
                            </p>
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <p className="text-xs font-semibold text-stone-800">{t.name}</p>
                          {t.category && <p className="text-[10px] text-stone-400">{t.category}</p>}
                        </div>
                        {selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-forest-600 flex items-center justify-center shadow">
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Package */}
          {step === 3 && (
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag size={18} className="text-forest-500" />
                <h2 className="text-lg font-semibold text-stone-900">Pilih Paket</h2>
              </div>

              {/* Tier cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tiers.map(tier => {
                  const TierIcon = TIER_ICONS[tier.icon] ?? Rocket
                  const selected = packageTier === tier.id
                  const f = tier.features
                  return (
                    <button
                      key={tier.id}
                      onClick={() => setPackageTier(tier.id)}
                      className={`relative text-left rounded-2xl border-2 transition-all flex flex-col ${
                        selected
                          ? 'border-forest-500 bg-forest-50/30 shadow-lg shadow-forest-100'
                          : 'border-stone-150 bg-white hover:border-stone-300 hover:shadow-md'
                      }`}
                    >
                      {tier.highlight && (
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-forest-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                          Populer
                        </span>
                      )}

                      {/* Header */}
                      <div className="p-5 pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tier.color}20` }}>
                            <TierIcon size={16} style={{ color: tier.color }} />
                          </div>
                          <span className="font-semibold text-stone-900 text-sm">{tier.label}</span>
                        </div>
                        <p className="text-xl font-bold text-stone-900">
                          Rp {tier.price.toLocaleString('id-ID')}
                        </p>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          sekali bayar {f ? `· aktif ${f.validity_days} hari` : ''}
                        </p>
                      </div>

                      {/* Features */}
                      {f && (
                        <div className="px-5 pb-5 flex-1">
                          <div className="border-t border-stone-100 pt-3">
                            <ul className="space-y-1.5">
                              {buildTierFeatureList(tier.id, f).map((feat, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  {feat.included ? (
                                    <Check size={12} strokeWidth={3} className="text-forest-500 mt-0.5 shrink-0" />
                                  ) : (
                                    <X size={12} strokeWidth={2} className="text-stone-300 mt-0.5 shrink-0" />
                                  )}
                                  <span className={`text-[12px] leading-snug ${feat.included ? 'text-stone-700' : 'text-stone-400 line-through'}`}>
                                    {feat.label}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {selected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-forest-600 flex items-center justify-center">
                          <Check size={12} className="text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Summary */}
              {packageTier && selectedTier && (
                <div className="mt-6 rounded-2xl bg-stone-50 border border-stone-100 p-5">
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Mempelai</span><span className="font-medium text-stone-800">{groomNickname} & {brideNickname}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Subdomain</span><span className="font-mono text-stone-800">{subdomain}.iaundang.id</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Template</span><span className="font-medium text-stone-800">{templates.find(t => t.id === templateId)?.name}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Paket</span><span className="font-medium text-stone-800">{selectedTier.label}</span></div>
                    <div className="border-t border-stone-200 my-2" />
                    <div className="flex justify-between text-base"><span className="font-semibold text-stone-700">Total</span><span className="font-bold text-stone-900">Rp {selectedTier.price.toLocaleString('id-ID')}</span></div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-3">* Kode unik akan ditambahkan saat konfirmasi untuk memudahkan verifikasi</p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Payment Confirmation */}
          {step === 4 && order && (
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-900 mb-1">Pesanan Berhasil Dibuat!</h2>
                <p className="text-sm text-stone-500">Transfer sesuai nominal di bawah untuk mengaktifkan undangan</p>
              </div>

              {/* Order number */}
              <div className="rounded-2xl bg-forest-50 border border-forest-200 p-4 mb-6 text-center">
                <p className="text-[11px] text-forest-600 font-semibold uppercase tracking-wider mb-1">Nomor Pesanan</p>
                <p className="text-lg font-bold font-mono text-forest-800">{order.order_number}</p>
              </div>

              {/* Amount to transfer */}
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-6 text-center">
                <p className="text-xs text-amber-700 mb-2">Transfer tepat sebesar:</p>
                <p className="text-3xl font-bold text-amber-900">
                  Rp {order.total_amount.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-amber-600 mt-1">
                  Rp {order.amount.toLocaleString('id-ID')} + kode unik Rp {order.unique_code}
                </p>
                <button onClick={() => copyText(String(order.total_amount), 'amount')} className="mt-2 inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium">
                  {copied === 'amount' ? <Check size={12} /> : <Copy size={12} />} Salin nominal
                </button>
              </div>

              {/* Bank accounts */}
              {paymentConfig.bankAccounts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={14} className="text-stone-500" />
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Rekening Bank</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentConfig.bankAccounts.map(bank => (
                      <div key={bank.id} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                        <p className="text-xs font-bold text-stone-800 mb-1">{bank.bankName}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-mono text-stone-900">{bank.accountNumber}</p>
                          <button onClick={() => copyText(bank.accountNumber, bank.id)} className="text-stone-400 hover:text-forest-600">
                            {copied === bank.id ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-xs text-stone-500">a.n. {bank.accountName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QRIS */}
              {paymentConfig.qrisImageUrl && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode size={14} className="text-stone-500" />
                    <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">QRIS</p>
                  </div>
                  <div className="inline-block rounded-xl border border-stone-200 bg-white p-3">
                    <img src={paymentConfig.qrisImageUrl} alt="QRIS" className="w-48 h-48 object-contain" />
                  </div>
                </div>
              )}

              {/* Instructions */}
              {paymentConfig.paymentInstructions && (
                <div className="mb-6 rounded-xl bg-blue-50 border border-blue-100 p-4">
                  <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-line">{paymentConfig.paymentInstructions}</p>
                </div>
              )}

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                {paymentConfig.confirmationWhatsapp && (
                  <button
                    onClick={openWhatsApp}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                  >
                    <Send size={16} />
                    Konfirmasi via WhatsApp
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-xl bg-stone-50 border border-stone-100 p-4">
                <div className="flex items-start gap-2">
                  <Clock size={14} className="text-stone-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-stone-700">Apa selanjutnya?</p>
                    <ol className="text-[11px] text-stone-500 mt-1 space-y-1 list-decimal list-inside">
                      <li>Transfer sesuai nominal unik di atas</li>
                      <li>Kirim bukti transfer via WhatsApp ke admin</li>
                      <li>Admin memverifikasi pembayaran (maks 1x24 jam)</li>
                      <li>Anda akan menerima akun login via WhatsApp/email</li>
                      <li>Login ke dashboard dan lengkapi undangan</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-stone-100 bg-stone-50/50">
              {step > 0 ? (
                <button onClick={() => setStep((step - 1) as Step)} className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900 font-medium transition-colors">
                  <ChevronLeft size={16} /> Kembali
                </button>
              ) : <div />}

              {step === 3 ? (
                <button
                  onClick={handleSubmitOrder}
                  disabled={!canNext() || submitting}
                  className="flex items-center gap-2 px-7 py-3 bg-forest-600 text-white text-sm font-bold rounded-xl hover:bg-forest-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-forest-600/20"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                  Buat Pesanan
                </button>
              ) : (
                <button
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={!canNext()}
                  className="flex items-center gap-1 px-6 py-3 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
