'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  ChevronRight, ChevronLeft, Check, Crown, Rocket, Gem,
  Copy, CreditCard, Send, Loader2, CheckCircle2,
  User, Users, Globe, ShoppingBag, Clock, X, Landmark,
} from 'lucide-react'
import BankCard, { QrisCard } from '@/components/ui/BankCard'
import toast, { Toaster } from 'react-hot-toast'

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
  templateId: string
  templateName: string
  tiers: TierInfo[]
  paymentConfig: PaymentConfig
}

type Step = 0 | 1 | 2 | 3

const STEP_LABELS = [
  { icon: User, label: 'Data Mempelai' },
  { icon: Globe, label: 'Subdomain & Kontak' },
  { icon: ShoppingBag, label: 'Pilih Paket' },
  { icon: CreditCard, label: 'Pembayaran' },
]

const TIER_ICONS: Record<string, React.ElementType> = { rocket: Rocket, crown: Crown, gem: Gem }

type FeatureItem = { label: string; included: boolean; section?: boolean }

function buildTierFeatureList(tierId: string, f: TierFeatures): FeatureItem[] {
  const list: FeatureItem[] = []

  // Kapasitas & durasi
  list.push({ label: `Hingga ${f.max_photos} foto`, included: true })
  list.push({ label: `Maks ${f.max_guests} tamu`, included: true })
  list.push({ label: `Aktif ${f.validity_days} hari`, included: true })

  // Section yang ditampilkan
  list.push({ label: 'Section musik latar', included: f.music, section: true })
  list.push({ label: 'Section RSVP & konfirmasi hadir', included: f.rsvp, section: true })
  list.push({ label: 'Section galeri foto', included: f.gallery, section: true })
  list.push({ label: 'Section ucapan & doa', included: f.wishes, section: true })
  list.push({ label: 'Section hitung mundur', included: f.countdown, section: true })
  list.push({ label: 'Section amplop & rekening', included: f.gift, section: true })
  list.push({ label: 'Section wishlist hadiah', included: f.gift_registry, section: true })
  list.push({ label: 'Section kisah perjalanan cinta', included: f.story, section: true })
  list.push({ label: 'Section video highlight', included: f.video, section: true })

  // Fitur ekstra
  list.push({ label: 'Tanpa watermark', included: f.remove_watermark })
  list.push({ label: 'QR code kehadiran tamu', included: f.qrcode })
  list.push({ label: 'Custom domain sendiri', included: f.custom_domain })
  list.push({ label: 'Priority support WhatsApp', included: f.priority_support })
  return list
}

const INPUT_CLS = 'w-full px-4 py-3 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 transition-colors'
const LABEL_CLS = 'block text-xs font-semibold text-stone-600 mb-1.5'

export default function OrderForm({ templateId, templateName, tiers, paymentConfig }: Props) {
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

  // Step 2: Package
  const [packageTier, setPackageTier] = useState('')

  // Step 3: Payment result
  const [order, setOrder] = useState<{ order_number: string; total_amount: number; unique_code: number; amount: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

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
      case 2: return !!packageTier
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
      const { order: newOrder, paymentUrl } = await res.json()

      if (paymentUrl) {
        toast.success('Mengalihkan ke halaman pembayaran...')
        window.location.href = paymentUrl
        return
      }

      setOrder(newOrder)
      setStep(3)
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
      `🌐 Subdomain: ${subdomain}.iaundang.online`,
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
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-stone-900">Buat Undangan Digital</h1>
          <p className="mt-2 text-sm text-stone-400">
            Template: <span className="font-semibold text-stone-600">{templateName}</span>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-8 flex-wrap">
          {STEP_LABELS.map((s, i) => {
            const Icon = s.icon
            const isActive = step === i
            const isDone = i < step
            const canGoBack = isDone && step !== 3
            return (
              <div key={i} className="flex items-center">
                {i > 0 && <div className={`w-6 sm:w-10 h-0.5 mx-1 rounded-full ${isDone ? 'bg-forest-400' : 'bg-stone-200'}`} />}
                <button
                  type="button"
                  onClick={() => { if (canGoBack) setStep(i as Step) }}
                  disabled={!canGoBack && !isActive}
                  className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors ${
                    isActive ? 'bg-forest-100 text-forest-700' :
                    isDone ? 'text-forest-500 hover:bg-forest-50 cursor-pointer' : 'text-stone-400 cursor-default'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isActive ? 'bg-forest-600 text-white' :
                    isDone ? 'bg-forest-200 text-forest-700' : 'bg-stone-200 text-stone-500'
                  }`}>
                    {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-[0_1px_3px_rgba(10,10,10,0.04),0_12px_32px_-16px_rgba(10,10,10,0.10)] overflow-hidden">

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
                      .iaundang.online
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
                  <p className="text-[11px] text-stone-400 mt-1">Ini akan menjadi alamat undangan kalian. Contoh: rizky-aulia.iaundang.online</p>
                </div>

                <div>
                  <label className={LABEL_CLS}>Email *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" className={INPUT_CLS} />
                  <p className="text-[11px] text-stone-400 mt-1">Kami akan kirim akses login ke email ini begitu pembayaran kalian terkonfirmasi</p>
                </div>

                <div>
                  <label className={LABEL_CLS}>WhatsApp</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="08123456789" className={INPUT_CLS} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Package */}
          {step === 2 && (
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
                          : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-md'
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
                      {f && (() => {
                        const features = buildTierFeatureList(tier.id, f)
                        const basics = features.filter(ft => !ft.section)
                        const sections = features.filter(ft => ft.section)
                        return (
                          <div className="px-5 pb-5 flex-1">
                            <div className="border-t border-stone-100 pt-3 space-y-3">
                              <ul className="space-y-1.5">
                                {basics.slice(0, 3).map((feat, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <Check size={12} strokeWidth={3} className="text-forest-500 mt-0.5 shrink-0" />
                                    <span className="text-[12px] leading-snug text-stone-700">{feat.label}</span>
                                  </li>
                                ))}
                              </ul>
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Section undangan</p>
                                <ul className="space-y-1">
                                  {sections.map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      {feat.included ? (
                                        <Check size={11} strokeWidth={3} className="text-forest-500 mt-0.5 shrink-0" />
                                      ) : (
                                        <X size={11} strokeWidth={2} className="text-stone-300 mt-0.5 shrink-0" />
                                      )}
                                      <span className={`text-[11px] leading-snug ${feat.included ? 'text-stone-600' : 'text-stone-400 line-through'}`}>
                                        {feat.label}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              {basics.slice(3).some(ft => ft.included) && (
                                <div>
                                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Fitur ekstra</p>
                                  <ul className="space-y-1">
                                    {basics.slice(3).map((feat, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        {feat.included ? (
                                          <Check size={11} strokeWidth={3} className="text-forest-500 mt-0.5 shrink-0" />
                                        ) : (
                                          <X size={11} strokeWidth={2} className="text-stone-300 mt-0.5 shrink-0" />
                                        )}
                                        <span className={`text-[11px] leading-snug ${feat.included ? 'text-stone-600' : 'text-stone-400 line-through'}`}>
                                          {feat.label}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })()}

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
                    <div className="flex justify-between"><span className="text-stone-500">Subdomain</span><span className="font-mono text-stone-800">{subdomain}.iaundang.online</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Template</span><span className="font-medium text-stone-800">{templateName}</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Paket</span><span className="font-medium text-stone-800">{selectedTier.label}</span></div>
                    <div className="border-t border-stone-200 my-2" />
                    <div className="flex justify-between text-base"><span className="font-semibold text-stone-700">Total</span><span className="font-bold text-stone-900">Rp {selectedTier.price.toLocaleString('id-ID')}</span></div>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-3">* Kami tambahkan kode unik kecil saat konfirmasi supaya pembayaran kalian lebih mudah dicek</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Confirmation */}
          {step === 3 && order && (() => {
            const hasBank = paymentConfig.bankAccounts.length > 0
            const hasQris = !!paymentConfig.qrisImageUrl
            const selectedBank = paymentConfig.bankAccounts.find(b => b.id === selectedPayment)

            return (
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={28} className="text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-1">Pesanan Berhasil Dibuat!</h2>
                  <p className="text-sm text-stone-500">Pilih metode pembayaran lalu transfer sesuai nominal</p>
                </div>

                {/* Order number & amount side by side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-2xl bg-forest-50 border border-forest-200 p-4 text-center">
                    <p className="text-[11px] text-forest-600 font-semibold uppercase tracking-wider mb-1">Nomor Pesanan</p>
                    <p className="text-lg font-bold font-mono text-forest-800">{order.order_number}</p>
                  </div>
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center">
                    <p className="text-[11px] text-amber-700 font-semibold uppercase tracking-wider mb-1">Total Transfer</p>
                    <p className="text-2xl font-bold text-amber-900">
                      Rp {order.total_amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-[11px] text-amber-600 mt-0.5">
                      Rp {order.amount.toLocaleString('id-ID')} + Rp {order.unique_code} (kode unik)
                    </p>
                    <button onClick={() => copyText(String(order.total_amount), 'amount')} className="mt-1.5 inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900 font-medium">
                      {copied === 'amount' ? <Check size={12} /> : <Copy size={12} />} Salin nominal
                    </button>
                  </div>
                </div>

                {/* Important notice */}
                <div className="rounded-xl bg-red-50 border border-red-100 p-3 mb-8">
                  <p className="text-xs text-red-700 font-medium text-center">
                    Pastikan transfer sesuai nominal di atas (termasuk kode unik) agar pembayaran mudah diverifikasi
                  </p>
                </div>

                {/* Payment method selection */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-stone-800 mb-1">Pilih metode pembayaran</p>
                  <p className="text-xs text-stone-400 mb-4">Klik kartu rekening atau QRIS yang ingin kamu gunakan untuk transfer</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentConfig.bankAccounts.map(bank => (
                      <BankCard
                        key={bank.id}
                        bankName={bank.bankName}
                        accountNumber={bank.accountNumber}
                        accountName={bank.accountName}
                        selectable
                        selected={selectedPayment === bank.id}
                        onClick={() => setSelectedPayment(bank.id)}
                      />
                    ))}
                    {hasQris && (
                      <QrisCard
                        imageUrl={paymentConfig.qrisImageUrl}
                        selectable
                        selected={selectedPayment === 'qris'}
                        onClick={() => setSelectedPayment('qris')}
                      />
                    )}
                  </div>

                  {!hasBank && !hasQris && (
                    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-6 text-center">
                      <Landmark size={24} className="text-stone-300 mx-auto mb-2" />
                      <p className="text-xs text-stone-500">Hubungi admin via WhatsApp untuk info metode pembayaran</p>
                    </div>
                  )}
                </div>

                {/* Selected payment detail */}
                {selectedPayment && selectedPayment !== 'qris' && selectedBank && (
                  <div className="mb-8 rounded-2xl bg-stone-50 border border-stone-200 p-5">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Detail Transfer</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Bank</span>
                        <span className="text-sm font-semibold text-stone-900">{selectedBank.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">No. Rekening</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono font-bold text-stone-900">{selectedBank.accountNumber}</span>
                          <button onClick={() => copyText(selectedBank.accountNumber, selectedBank.id)} className="text-stone-400 hover:text-forest-600">
                            {copied === selectedBank.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-stone-500">Atas Nama</span>
                        <span className="text-sm font-semibold text-stone-900">{selectedBank.accountName}</span>
                      </div>
                      <div className="border-t border-stone-200 pt-2 mt-2 flex justify-between items-center">
                        <span className="text-sm font-semibold text-stone-700">Nominal Transfer</span>
                        <span className="text-base font-bold text-amber-700">Rp {order.total_amount.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === 'qris' && hasQris && (
                  <div className="mb-8 rounded-2xl bg-stone-50 border border-stone-200 p-5 text-center">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Scan QRIS untuk Bayar</p>
                    <div className="inline-block rounded-xl bg-white border border-stone-200 p-3 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={paymentConfig.qrisImageUrl} alt="QRIS" className="w-52 h-52 object-contain" />
                    </div>
                    <p className="text-sm font-bold text-amber-700 mt-4">Rp {order.total_amount.toLocaleString('id-ID')}</p>
                    <p className="text-[11px] text-stone-400 mt-1">Pastikan nominal sesuai termasuk kode unik</p>
                  </div>
                )}

                {/* Payment instructions */}
                {selectedPayment && paymentConfig.paymentInstructions && (
                  <div className="mb-8 rounded-2xl bg-blue-50 border border-blue-100 p-5">
                    <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Instruksi Pembayaran</p>
                    <div className="text-xs text-blue-900/80 leading-relaxed whitespace-pre-line">
                      {paymentConfig.paymentInstructions}
                    </div>
                  </div>
                )}

                {/* CTA: Konfirmasi WA */}
                <div className="rounded-2xl bg-green-50 border border-green-200 p-5 mb-6">
                  <p className="text-sm font-semibold text-green-900 mb-1">Sudah transfer?</p>
                  <p className="text-xs text-green-700 mb-4">Kirimkan bukti transfer ke WhatsApp admin untuk verifikasi pembayaran.</p>
                  {paymentConfig.confirmationWhatsapp && (
                    <button
                      onClick={openWhatsApp}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20"
                    >
                      <Send size={16} />
                      Kirim Bukti Transfer via WhatsApp
                    </button>
                  )}
                </div>

                {/* Next steps */}
                <div className="rounded-xl bg-stone-50 border border-stone-100 p-4">
                  <div className="flex items-start gap-2">
                    <Clock size={14} className="text-stone-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-stone-700">Langkah selanjutnya</p>
                      <ol className="text-[11px] text-stone-500 mt-1 space-y-1 list-decimal list-inside">
                        <li>Pilih metode pembayaran di atas</li>
                        <li>Transfer sesuai nominal unik</li>
                        <li>Screenshot bukti transfer</li>
                        <li>Kirim bukti ke WhatsApp admin (klik tombol di atas)</li>
                        <li>Admin verifikasi pembayaran (maks 1x24 jam kerja)</li>
                        <li>Terima akun login via WhatsApp / email</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Navigation */}
          {step < 3 && (
            <div className="flex items-center justify-between px-6 sm:px-8 py-4 border-t border-stone-100 bg-stone-50/50">
              {step > 0 ? (
                <button onClick={() => setStep((step - 1) as Step)} className="flex items-center gap-1 min-h-[44px] px-3 py-2.5 -ml-2 rounded-xl text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-100 font-medium transition-colors">
                  <ChevronLeft size={16} /> Kembali
                </button>
              ) : <div />}

              {step === 2 ? (
                <button
                  onClick={handleSubmitOrder}
                  disabled={!canNext() || submitting}
                  className="flex items-center gap-2 min-h-[44px] px-7 py-3 bg-forest-600 text-white text-sm font-bold rounded-xl hover:bg-forest-700 transition-colors shadow-lg shadow-forest-600/20 disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                  Buat Pesanan
                </button>
              ) : (
                <button
                  onClick={() => setStep((step + 1) as Step)}
                  disabled={!canNext()}
                  className="flex items-center gap-1 min-h-[44px] px-6 py-3 bg-forest-600 text-white text-sm font-semibold rounded-xl hover:bg-forest-700 transition-colors disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:cursor-not-allowed"
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
