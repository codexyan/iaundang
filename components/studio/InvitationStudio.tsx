'use client'

import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import {
  CheckSquare, MessageSquare, BookOpen, Eye, X, Loader2, Check, RefreshCw,
  Palette, User, Calendar, Sparkles, Music, Quote, Heart, Image, Gift, FileText,
  ChevronDown, Layers,
} from 'lucide-react'
import type { Invitation, NewInvitationData, TemplateRecord, OpeningType } from '@/lib/types'
import type { PackageTier } from '@/lib/packages'
import { usePackageGating } from '@/hooks/usePackageGating'
import InvitationPreview from '@/components/renderer/InvitationPreview'
import GalleryManager from '@/components/dashboard/GalleryManager'
import LockedOverlay from './ui/LockedOverlay'

const CoverPagePreview = dynamic(() => import('@/components/renderer/CoverPagePreview'), { ssr: false })
const LoadingScreen = dynamic(() => import('@/components/renderer/LoadingScreen'), { ssr: false })

import StudioHeader from './StudioHeader'
import ColorPaletteForm from './forms/ColorPaletteForm'
import OpeningForm from './forms/OpeningForm'
import MusicForm from './forms/MusicForm'
import QuoteForm from './forms/QuoteForm'
import BasicInfoForm from './forms/BasicInfoForm'
import EventDetailsForm from './forms/EventDetailsForm'
import ProfilesForm from './forms/ProfilesForm'
import GiftForm from './forms/GiftForm'
import StoryForm from './forms/StoryForm'
import DecorationForm from './forms/DecorationForm'
import InfoCard from './ui/InfoCard'
import FormField, { textareaClass } from './ui/FormField'
import SectionCard from './ui/SectionCard'

interface Props {
  invitation: Invitation
  template: TemplateRecord
  onSaved: (inv: Invitation) => void
  embedded?: boolean
}

function initData(inv: Invitation): NewInvitationData {
  const d = inv.data as unknown as NewInvitationData
  return {
    groom_name: d.groom_name ?? '',
    bride_name: d.bride_name ?? '',
    groom_parents: d.groom_parents ?? '',
    bride_parents: d.bride_parents ?? '',
    tagline: d.tagline ?? '',
    groom_photo_url: d.groom_photo_url ?? '',
    bride_photo_url: d.bride_photo_url ?? '',
    groom_bio: d.groom_bio ?? '',
    bride_bio: d.bride_bio ?? '',
    couple_photo_url: d.couple_photo_url ?? '',
    primary_color: d.primary_color ?? '#2c4a34',
    accent_color: d.accent_color ?? '#c9a961',
    text_color: d.text_color ?? '#1a1a1a',
    background_color: d.background_color ?? '#fefdf8',
    opening_type: d.opening_type ?? 'fade-reveal',
    opening_greeting: d.opening_greeting ?? 'Assalamualaikum Warahmatullahi Wabarakatuh',
    opening_subtitle: d.opening_subtitle ?? 'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.',
    music_url: d.music_url ?? '',
    music_title: d.music_title ?? '',
    quote_arabic: d.quote_arabic ?? '',
    quote_translation: d.quote_translation ?? '',
    quote_source: d.quote_source ?? '',
    akad: d.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' },
    resepsi: d.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' },
    story_title: d.story_title ?? '',
    story_text: d.story_text ?? '',
    story_chapters: d.story_chapters ?? [],
    story_timeline: d.story_timeline ?? [],
    gift_accounts: d.gift_accounts ?? [],
    gallery_photos: d.gallery_photos ?? [],
    closing_text: d.closing_text ?? '',
    thank_you_message: d.thank_you_message ?? '',
    hero_video_url: '',
    livestream_url: d.livestream_url ?? '',
    video_embed_url: d.video_embed_url ?? '',
    video_caption: d.video_caption ?? '',
    section_decoration_overrides: d.section_decoration_overrides ?? {},
  }
}

function calculateProgress(data: NewInvitationData) {
  const required = [
    data.groom_name, data.bride_name, data.couple_photo_url,
    data.akad?.date, data.akad?.time, data.akad?.venue_name, data.akad?.venue_address,
    data.resepsi?.date, data.resepsi?.time, data.resepsi?.venue_name, data.resepsi?.venue_address,
  ]
  const filled = required.filter(Boolean).length
  const total = required.length
  const missing: string[] = []
  if (!data.groom_name) missing.push('Nama Mempelai Pria')
  if (!data.bride_name) missing.push('Nama Mempelai Wanita')
  if (!data.couple_photo_url) missing.push('Foto Pembuka')
  if (!data.akad?.date) missing.push('Tanggal Akad')
  if (!data.akad?.venue_name) missing.push('Tempat Akad')
  if (!data.resepsi?.date) missing.push('Tanggal Resepsi')
  if (!data.resepsi?.venue_name) missing.push('Tempat Resepsi')
  return { percentage: Math.round((filled / total) * 100), requiredFieldsCount: filled, totalRequiredFields: total, missingFields: missing }
}

const SECTIONS = [
  { id: 'warna', label: 'Warna', icon: Palette },
  { id: 'dekorasi', label: 'Dekorasi', icon: Layers },
  { id: 'info', label: 'Info Dasar', icon: User },
  { id: 'acara', label: 'Acara', icon: Calendar },
  { id: 'opening', label: 'Pembuka', icon: Sparkles },
  { id: 'musik', label: 'Musik', icon: Music },
  { id: 'quote', label: 'Doa', icon: Quote },
  { id: 'profil', label: 'Profil', icon: Heart },
  { id: 'cerita', label: 'Cerita', icon: BookOpen },
  { id: 'galeri', label: 'Galeri', icon: Image },
  { id: 'hadiah', label: 'Hadiah', icon: Gift },
  { id: 'penutup', label: 'Penutup', icon: FileText },
] as const

export default function InvitationStudio({ invitation, template, onSaved, embedded }: Props) {
  const [data, setData] = useState<NewInvitationData>(() => initData(invitation))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('warna')
  const [previewMode, setPreviewMode] = useState<'opening' | 'loading' | 'invitation'>('opening')
  const [previewKey, setPreviewKey] = useState(0)

  const timer = useRef<ReturnType<typeof setTimeout>>()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const progress = calculateProgress(data)
  const gating = usePackageGating((invitation as unknown as Record<string, unknown>).package_tier as PackageTier | undefined)

  const scheduleSave = useCallback(
    (updatedData: NewInvitationData) => {
      clearTimeout(timer.current)
      setSaveStatus('saving')
      timer.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/invitations/${invitation.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: updatedData }),
          })
          if (!res.ok) throw new Error('Save failed')
          const { invitation: updated } = await res.json()
          onSaved(updated)
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus('idle'), 2000)
        } catch {
          toast.error('Gagal menyimpan perubahan')
          setSaveStatus('idle')
        }
      }, 800)
    },
    [invitation.id, onSaved]
  )

  function updateData(patch: Partial<NewInvitationData>) {
    const updated = { ...data, ...patch }
    setData(updated)
    scheduleSave(updated)
  }

  function scrollToSection(id: string) {
    setActiveSection(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const forms = (
    <div className="space-y-3.5">
      <div ref={el => { sectionRefs.current['warna'] = el }}>
        <ColorPaletteForm
          primaryColor={data.primary_color || '#2c4a34'}
          accentColor={data.accent_color || '#c9a961'}
          textColor={data.text_color || '#1a1a1a'}
          backgroundColor={data.background_color || '#fefdf8'}
          onPrimaryColorChange={(val) => updateData({ primary_color: val })}
          onAccentColorChange={(val) => updateData({ accent_color: val })}
          onTextColorChange={(val) => updateData({ text_color: val })}
          onBackgroundColorChange={(val) => updateData({ background_color: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['dekorasi'] = el }} className="relative">
        <DecorationForm
          template={template}
          data={data}
          onUpdate={updateData}
          canEdit={gating.canEditDecorations}
          maxAssets={gating.maxDecorationAssets}
          requiredTier={gating.canEditDecorations ? undefined : (gating.getRequiredTier('dekorasi') ?? 'Popular')}
        />
      </div>

      <div ref={el => { sectionRefs.current['info'] = el }}>
        <BasicInfoForm
          groomName={data.groom_name}
          brideName={data.bride_name}
          couplePhotoUrl={data.couple_photo_url}
          tagline={data.tagline}
          onGroomNameChange={(val) => updateData({ groom_name: val })}
          onBrideNameChange={(val) => updateData({ bride_name: val })}
          onCouplePhotoChange={(url) => updateData({ couple_photo_url: url })}
          onTaglineChange={(val) => updateData({ tagline: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['acara'] = el }}>
        <EventDetailsForm
          akad={data.akad}
          resepsi={data.resepsi}
          onAkadChange={(patch) => updateData({ akad: { ...(data.akad ?? { date: '', time: '', venue_name: '', venue_address: '' }), ...patch } as NewInvitationData['akad'] })}
          onResepsiChange={(patch) => updateData({ resepsi: { ...(data.resepsi ?? { date: '', time: '', venue_name: '', venue_address: '' }), ...patch } as NewInvitationData['resepsi'] })}
        />
      </div>

      <div ref={el => { sectionRefs.current['opening'] = el }}>
        <OpeningForm
          openingType={(data.opening_type as OpeningType) || 'fade-reveal'}
          openingGreeting={data.opening_greeting || ''}
          openingSubtitle={data.opening_subtitle || ''}
          onOpeningTypeChange={(val) => updateData({ opening_type: val })}
          onOpeningGreetingChange={(val) => updateData({ opening_greeting: val })}
          onOpeningSubtitleChange={(val) => updateData({ opening_subtitle: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['musik'] = el }}>
        <MusicForm
          musicUrl={data.music_url || ''}
          musicTitle={data.music_title || ''}
          onMusicUrlChange={(val) => updateData({ music_url: val })}
          onMusicTitleChange={(val) => updateData({ music_title: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['quote'] = el }}>
        <QuoteForm
          quoteArabic={data.quote_arabic || ''}
          quoteTranslation={data.quote_translation || ''}
          quoteSource={data.quote_source || ''}
          onQuoteArabicChange={(val) => updateData({ quote_arabic: val })}
          onQuoteTranslationChange={(val) => updateData({ quote_translation: val })}
          onQuoteSourceChange={(val) => updateData({ quote_source: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['profil'] = el }}>
        <ProfilesForm
          groomParents={data.groom_parents}
          groomPhotoUrl={data.groom_photo_url}
          groomBio={data.groom_bio}
          brideParents={data.bride_parents}
          bridePhotoUrl={data.bride_photo_url}
          brideBio={data.bride_bio}
          onGroomParentsChange={(val) => updateData({ groom_parents: val })}
          onGroomPhotoChange={(url) => updateData({ groom_photo_url: url })}
          onGroomBioChange={(val) => updateData({ groom_bio: val })}
          onBrideParentsChange={(val) => updateData({ bride_parents: val })}
          onBridePhotoChange={(url) => updateData({ bride_photo_url: url })}
          onBrideBioChange={(val) => updateData({ bride_bio: val })}
        />
      </div>

      <div ref={el => { sectionRefs.current['cerita'] = el }} className="relative">
        <StoryForm
          storyTitle={data.story_title ?? ''}
          storyText={data.story_text ?? ''}
          chapters={data.story_chapters ?? []}
          onStoryTitleChange={(val) => updateData({ story_title: val })}
          onStoryTextChange={(val) => updateData({ story_text: val })}
          onChaptersChange={(chapters) => updateData({ story_chapters: chapters })}
        />
        {!gating.isSectionAllowed('cerita') && (
          <LockedOverlay requiredTier={gating.getRequiredTier('cerita') ?? 'Popular'} />
        )}
      </div>

      <div ref={el => { sectionRefs.current['galeri'] = el }}>
        <GalleryManager invitation={invitation} />
      </div>

      <div ref={el => { sectionRefs.current['hadiah'] = el }} className="relative">
        <GiftForm
          accounts={data.gift_accounts ?? []}
          onAccountsChange={(accounts) => updateData({ gift_accounts: accounts })}
        />
        {!gating.isSectionAllowed('hadiah') && (
          <LockedOverlay requiredTier={gating.getRequiredTier('hadiah') ?? 'Popular'} />
        )}
      </div>

      <InfoCard
        title="Konfirmasi Kehadiran"
        icon={CheckSquare}
        message="Form RSVP otomatis tampil di undangan. Lihat daftar tamu yang sudah konfirmasi di tab RSVP."
        actionText="Lihat Daftar RSVP"
        actionHref="#"
      />

      <InfoCard
        title="Buku Ucapan"
        icon={MessageSquare}
        message="Buku ucapan otomatis tersedia di undangan. Tamu bisa menulis ucapan dan doa untuk Anda berdua."
      />

      <div ref={el => { sectionRefs.current['penutup'] = el }}>
        <SectionCard title="Penutup" icon={BookOpen} description="Pesan penutup dan ucapan terima kasih (opsional)">
          <FormField label="Kalimat Penutup" hint="Ucapan terima kasih atau kalimat penutup undangan">
            <textarea
              className={textareaClass}
              rows={3}
              value={data.closing_text}
              onChange={(e) => updateData({ closing_text: e.target.value })}
              placeholder="Merupakan suatu kehormatan dan kebahagiaan bagi kami..."
            />
          </FormField>
          <FormField label="Pesan Terima Kasih" hint="Pesan singkat terima kasih untuk para tamu">
            <input
              type="text"
              className={textareaClass}
              value={data.thank_you_message}
              onChange={(e) => updateData({ thank_you_message: e.target.value })}
              placeholder="Terima kasih atas doa dan kehadiran Anda"
            />
          </FormField>
        </SectionCard>
      </div>
    </div>
  )

  // ── Embedded mode (inside dashboard) ─────────────────────────
  if (embedded) {
    return (
      <div className="flex gap-6">
        {/* Left column: sticky header + scrollable forms */}
        <div className="flex-1 min-w-0">
          {/* Sticky header */}
          <div className="sticky top-0 z-10 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 bg-[#f8f7f4]/95 backdrop-blur-xl border-b border-stone-200/60">
            {/* Top row */}
            <div className="flex items-center gap-3 pt-3 pb-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Progress ring */}
                <div className="relative w-10 h-10 shrink-0">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="#e7e5e4" strokeWidth="3" />
                    <circle
                      cx="20" cy="20" r="16" fill="none"
                      stroke="url(#progress-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={`${progress.percentage} ${100 - progress.percentage}`}
                      pathLength="100"
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-stone-600">
                    {progress.percentage}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800">Edit Undangan</p>
                    {saveStatus === 'saving' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                        <Loader2 size={9} className="animate-spin" /> Menyimpan
                      </span>
                    )}
                    {saveStatus === 'saved' && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <Check size={9} /> Tersimpan
                      </span>
                    )}
                  </div>
                  {progress.missingFields.length > 0 && (
                    <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                      Belum: {progress.missingFields.slice(0, 2).join(', ')}{progress.missingFields.length > 2 ? ` +${progress.missingFields.length - 2}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section nav */}
            <div className="flex gap-0.5 overflow-x-auto pb-2.5 scrollbar-hide -mx-1 px-1">
              {SECTIONS.map(s => {
                const active = activeSection === s.id
                const SIcon = s.icon
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      active
                        ? 'bg-[#1a1a1a] text-white shadow-sm'
                        : 'text-stone-400 hover:bg-stone-200/60 hover:text-stone-600'
                    }`}
                  >
                    <SIcon size={12} strokeWidth={active ? 2 : 1.5} />
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Forms */}
          <div className="pt-4 space-y-4">
            {forms}
          </div>
        </div>

        {/* Right column: sticky phone preview */}
        <div className="hidden lg:block shrink-0 w-[300px]">
          <div className="sticky top-0 pt-3">
            {/* Preview mode tabs */}
            <div className="flex items-center gap-1 mb-3">
              <div className="flex bg-stone-200/60 rounded-xl p-0.5 gap-0.5 flex-1">
                {([
                  { mode: 'opening' as const, label: 'Opening' },
                  { mode: 'loading' as const, label: 'Loading' },
                  { mode: 'invitation' as const, label: 'Undangan' },
                ]).map(pm => (
                  <button
                    key={pm.mode}
                    onClick={() => { setPreviewMode(pm.mode); setPreviewKey(k => k + 1) }}
                    className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-medium transition-all ${
                      previewMode === pm.mode
                        ? 'bg-white text-stone-800 shadow-sm'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPreviewKey(k => k + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all"
                title="Refresh preview"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {/* Phone frame */}
            <div
              className="relative bg-[#1a1a1a] rounded-[36px] shadow-2xl ring-1 ring-stone-300/20"
              style={{ width: 300, padding: 7 }}
            >
              {/* Dynamic island */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] rounded-full z-20"
                style={{ top: 10, width: 64, height: 18 }}
              />

              {/* Screen */}
              <div
                className="rounded-[30px] overflow-hidden bg-stone-950"
                style={{ width: 286, height: 620, position: 'relative' }}
              >
                {/* Opening preview */}
                <div
                  key={`opening-${previewKey}`}
                  style={{
                    position: 'absolute', inset: 0, overflow: 'hidden',
                    visibility: previewMode === 'opening' ? 'visible' : 'hidden',
                    pointerEvents: previewMode === 'opening' ? 'auto' : 'none',
                  }}
                >
                  <div style={{ width: 390, zoom: 286 / 390, height: 845 }}>
                    <CoverPagePreview
                      template={template}
                      data={data}
                      previewGuestName="Bapak & Ibu"
                      containerHeight={845}
                      onEnter={() => { setPreviewMode('invitation'); setPreviewKey(k => k + 1) }}
                    />
                  </div>
                </div>

                {/* Loading preview */}
                <div
                  key={`loading-${previewKey}`}
                  style={{
                    position: 'absolute', inset: 0, overflow: 'hidden',
                    visibility: previewMode === 'loading' ? 'visible' : 'hidden',
                    pointerEvents: previewMode === 'loading' ? 'auto' : 'none',
                  }}
                >
                  <div style={{ width: 390, zoom: 286 / 390, height: 845, position: 'relative' }}>
                    <LoadingScreen
                      config={template.config.loading}
                      onDone={() => {}}
                      isPreview
                    />
                  </div>
                </div>

                {/* Invitation preview */}
                <div
                  key={`inv-${previewKey}`}
                  style={{
                    position: 'absolute', inset: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                    visibility: previewMode === 'invitation' ? 'visible' : 'hidden',
                    pointerEvents: previewMode === 'invitation' ? 'auto' : 'none',
                  }}
                >
                  <div style={{ width: 390, zoom: 286 / 390 }}>
                    <InvitationPreview
                      template={template}
                      data={data}
                      invitationId={invitation.id}
                      isPreview
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-[10px] text-stone-300 mt-3 tracking-wide font-medium">
              Live Preview
            </p>
          </div>
        </div>

        {/* Mobile: floating preview button + modal */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-[#1a1a1a] text-white rounded-2xl shadow-xl shadow-stone-900/30 flex items-center justify-center hover:bg-stone-800 transition-all"
        >
          <Eye size={20} />
        </button>
        {showPreview && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div className="relative w-full max-w-[300px]" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-500 hover:text-stone-700"
              >
                <X size={16} />
              </button>
              <div
                className="bg-[#1a1a1a] rounded-[36px] shadow-xl ring-1 ring-stone-800/50"
                style={{ padding: 7 }}
              >
                <div className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] rounded-full z-20" style={{ top: 10, width: 64, height: 18 }} />
                <div className="rounded-[30px] overflow-hidden bg-stone-950" style={{ width: 286, height: 620, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'none',
                    WebkitOverflowScrolling: 'touch',
                  }}>
                    <div style={{ width: 390, zoom: 286 / 390 }}>
                      <InvitationPreview template={template} data={data} invitationId={invitation.id} isPreview />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Standalone mode (full page) ──────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      <StudioHeader
        invitationSlug={invitation.slug}
        groomName={data.groom_name}
        brideName={data.bride_name}
        completionPercentage={progress.percentage}
        requiredFieldsCount={progress.requiredFieldsCount}
        totalRequiredFields={progress.totalRequiredFields}
        missingFields={progress.missingFields}
        saveStatus={saveStatus}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            {forms}
          </div>

          <div className="hidden lg:block shrink-0">
            <div className="sticky top-24">
              <div className="bg-stone-100 rounded-[2.5rem] p-3 shadow-2xl w-[320px]">
                <div className="bg-white rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
                  <div className="h-full overflow-y-auto">
                    <InvitationPreview
                      template={template}
                      data={data}
                      invitationId={invitation.id}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
