'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { Reorder, useDragControls, motion, AnimatePresence } from 'framer-motion'
import {
  CheckSquare, MessageSquare, BookOpen, Eye, X, Loader2, Check, RefreshCw,
  User, Calendar, Sparkles, Music, Quote, Image, Gift, FileText,
  Maximize2, ExternalLink, Lock, Video, Radio, Instagram, QrCode, ShoppingBag,
  GripVertical, ArrowUpDown, Palette,
} from 'lucide-react'
import type { Invitation, NewInvitationData, TemplateRecord, OpeningType, TierFeatures } from '@/lib/types'
import type { PackageTier } from '@/lib/packages'
import { calculateCompleteness } from '@/lib/studio-progress'
import { usePackageGating } from '@/hooks/usePackageGating'
import GalleryManager from '@/components/dashboard/GalleryManager'
import LockedOverlay from './ui/LockedOverlay'

const InvitationRenderer = dynamic(() => import('@/components/renderer/InvitationRenderer'), { ssr: false })

import OpeningForm from './forms/OpeningForm'
import LoadingForm from './forms/LoadingForm'
import MusicForm from './forms/MusicForm'
import QuoteForm from './forms/QuoteForm'
import BasicInfoForm from './forms/BasicInfoForm'
import EventDetailsForm from './forms/EventDetailsForm'
import GiftForm from './forms/GiftForm'
import StoryForm from './forms/StoryForm'
import VideoForm from './forms/VideoForm'
import LivestreamForm from './forms/LivestreamForm'
import IGStoryForm from './forms/IGStoryForm'
import QRCodeForm from './forms/QRCodeForm'
import GiftRegistryForm from './forms/GiftRegistryForm'
import ColorPaletteForm from './forms/ColorPaletteForm'
import InfoCard from './ui/InfoCard'
import FormField from './ui/FormField'
import { StudioInput, StudioTextarea } from './ui/StudioInput'
import SectionCard from './ui/SectionCard'
import SectionAppearanceControls from './SectionAppearanceControls'

interface Props {
  invitation: Invitation
  template: TemplateRecord
  onSaved: (inv: Invitation) => void
  isAdmin?: boolean
}

function initData(inv: Invitation): NewInvitationData {
  const d = inv.data as unknown as NewInvitationData
  return {
    groom_name: d.groom_name ?? '',
    bride_name: d.bride_name ?? '',
    groom_nickname: d.groom_nickname ?? '',
    bride_nickname: d.bride_nickname ?? '',
    groom_parents: d.groom_parents ?? '',
    bride_parents: d.bride_parents ?? '',
    groom_father: d.groom_father ?? '',
    groom_mother: d.groom_mother ?? '',
    bride_father: d.bride_father ?? '',
    bride_mother: d.bride_mother ?? '',
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
    opening_groom_name: d.opening_groom_name ?? '',
    opening_bride_name: d.opening_bride_name ?? '',
    opening_name_gap: d.opening_name_gap,
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
    section_background_overrides: d.section_background_overrides ?? {},
    section_transition_overrides: d.section_transition_overrides ?? {},
  }
}

interface NavItem { id: string; label: string; icon: React.ElementType; locked?: boolean; requiredTier?: string; group: string; required?: boolean }
interface NavGroup { label: string; items: NavItem[] }

const NAV_SECTION_TYPE: Record<string, string> = {
  info: 'profiles', acara: 'events', cerita: 'story', galeri: 'gallery',
  hadiah: 'gift', quote: 'quote', penutup: 'closing', video: 'video',
  livestream: 'livestream', ig_story: 'ig-story', qrcode: 'qrcode',
  gift_registry: 'gift-registry', musik: 'wishes',
}

function buildNavGroups(
  gating: { isSectionAllowed: (id: string) => boolean; getRequiredTier: (id: string) => string | undefined },
  templateSections: { type: string; enabled: boolean }[],
): { groups: NavGroup[]; sections: NavItem[] } {
  const enabledTypes = new Set(templateSections.filter(s => s.enabled).map(s => s.type))

  function item(id: string, label: string, icon: React.ElementType, groupLabel: string, gateKey?: string, required = false): NavItem | null {
    const sectionType = NAV_SECTION_TYPE[id]
    if (sectionType && !enabledTypes.has(sectionType)) return null
    const isLocked = gateKey ? !gating.isSectionAllowed(gateKey) : false
    return { id, label, icon, locked: isLocked, requiredTier: isLocked ? gating.getRequiredTier(gateKey!) : undefined, group: groupLabel, required }
  }

  // Urutan mengikuti alur pengisian yang logis: isi data dasar dulu,
  // baru atur tampilan, lalu cerita/media, interaksi tamu, dan fitur lanjutan.
  const allGroups: { label: string; rawItems: (NavItem | null)[] }[] = [
    {
      label: 'Info Dasar',
      rawItems: [
        item('info', 'Mempelai', User, 'Info Dasar', undefined, true),
        item('acara', 'Acara', Calendar, 'Info Dasar', undefined, true),
      ],
    },
    {
      label: 'Tampilan',
      rawItems: [
        item('warna', 'Tema Warna', Palette, 'Tampilan'),
        item('opening', 'Pembuka', Sparkles, 'Tampilan'),
        item('loading', 'Loading', Loader2, 'Tampilan'),
      ],
    },
    {
      label: 'Cerita & Media',
      rawItems: [
        item('quote', 'Quote & Doa', Quote, 'Cerita & Media'),
        item('cerita', 'Cerita', BookOpen, 'Cerita & Media', 'cerita'),
        item('galeri', 'Galeri', Image, 'Cerita & Media', 'galeri'),
        item('musik', 'Musik', Music, 'Cerita & Media', 'musik'),
        item('video', 'Video Pre-Wedding', Video, 'Cerita & Media', 'video'),
      ],
    },
    {
      label: 'Interaksi Tamu',
      rawItems: [
        item('hadiah', 'Hadiah', Gift, 'Interaksi Tamu', 'hadiah'),
        item('gift_registry', 'Gift Registry', ShoppingBag, 'Interaksi Tamu', 'gift_registry'),
        item('penutup', 'Penutup', FileText, 'Interaksi Tamu'),
      ],
    },
    {
      label: 'Fitur Lanjutan',
      rawItems: [
        item('livestream', 'Live Streaming', Radio, 'Fitur Lanjutan', 'livestream'),
        item('ig_story', 'IG Story', Instagram, 'Fitur Lanjutan', 'ig_story'),
        item('qrcode', 'QR Code', QrCode, 'Fitur Lanjutan', 'qrcode'),
      ],
    },
  ]

  const groups: NavGroup[] = allGroups
    .map(g => ({ label: g.label, items: g.rawItems.filter((i): i is NavItem => i !== null) }))
    .filter(g => g.items.length > 0)

  return { groups, sections: groups.flatMap(g => g.items) }
}

/* ─── Draggable Section Item ─── */

function DraggableSectionItem({ section, active, onClick }: { section: NavItem; active: boolean; onClick: () => void }) {
  const controls = useDragControls()
  const SIcon = section.icon

  return (
    <Reorder.Item
      value={section.id}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all group relative overflow-hidden"
      style={
        active
          ? { background: 'linear-gradient(135deg, #2C4A34 0%, #1A3020 100%)', color: '#FFFFFF', padding: '8px 10px' }
          : { backgroundColor: 'transparent', color: section.locked ? '#C9C2B8' : '#78716C', padding: '8px 10px' }
      }
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { if (!active) e.currentTarget.style.backgroundColor = '#F0EDE8' }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 rounded"
        style={{ color: active ? 'rgba(201,169,97,0.6)' : '#C9C2B8' }}
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical size={14} />
      </div>
      <button onClick={onClick} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
        <div
          className="w-7 h-7 flex items-center justify-center shrink-0 transition-colors"
          style={{ backgroundColor: active ? 'rgba(201,169,97,0.15)' : '#EDE8E2', borderRadius: 7 }}
        >
          <SIcon size={14} strokeWidth={active ? 2.2 : 1.8} color={active ? 'rgba(201,169,97,0.9)' : section.locked ? '#C9C2B8' : '#A8A29E'} />
          {section.locked && !active && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center">
              <Lock size={7} className="text-white" />
            </div>
          )}
        </div>
        <span className="text-[12px] truncate" style={{ fontWeight: active ? 600 : 500 }}>
          {section.label}
        </span>
      </button>
    </Reorder.Item>
  )
}

/* ─── Static Section Item ─── */

function StaticSectionItem({ section, active, onClick }: { section: NavItem; active: boolean; onClick: () => void }) {
  const SIcon = section.icon
  const iconColor = active ? 'rgba(201,169,97,0.9)' : section.locked ? '#C9C2B8' : '#A8A29E'
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 rounded-xl transition-all text-left group relative overflow-hidden"
      style={
        active
          ? { background: 'linear-gradient(135deg, #2C4A34 0%, #1A3020 100%)', color: '#FFFFFF', padding: '8px 10px' }
          : { backgroundColor: 'transparent', color: section.locked ? '#C9C2B8' : '#78716C', padding: '8px 10px' }
      }
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = '#F0EDE8' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {active && (
        <div style={{ position: 'absolute', top: 0, left: 12, right: 12, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,169,97,0.4), transparent)' }} />
      )}
      <div
        className="relative w-7 h-7 flex items-center justify-center shrink-0 transition-colors"
        style={{ backgroundColor: active ? 'rgba(201,169,97,0.15)' : '#EDE8E2', borderRadius: 7 }}
      >
        <SIcon size={14} strokeWidth={active ? 2.2 : 1.8} color={iconColor} />
        {section.locked && !active && (
          <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center">
            <Lock size={7} className="text-white" />
          </div>
        )}
      </div>
      <span className="text-[12px] truncate flex-1" style={{ fontWeight: active ? 600 : 500 }}>
        {section.label}
      </span>
      {section.required && !section.locked && (
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: active ? 'rgba(201,169,97,0.9)' : '#C9A961', flexShrink: 0, marginLeft: 'auto' }} title="Wajib diisi" />
      )}
      {section.locked && section.requiredTier && (
        <span className="text-[9px] font-semibold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
          {section.requiredTier}
        </span>
      )}
    </button>
  )
}

const SECTION_TYPE_FEATURE: Record<string, keyof TierFeatures> = {
  hero: 'hero', profiles: 'profiles', events: 'events', quote: 'quote',
  countdown: 'countdown', gallery: 'gallery', rsvp: 'rsvp', wishes: 'wishes',
  story: 'story', video: 'video', gift: 'gift', 'gift-registry': 'gift_registry',
  livestream: 'livestream', 'ig-story': 'ig_story', qrcode: 'qrcode', closing: 'closing',
}

export default function InvitationStudio({ invitation, template, onSaved, isAdmin }: Props) {
  const [data, setData] = useState<NewInvitationData>(() => initData(invitation))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showPreview, setShowPreview] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('info')
  const [previewKey, setPreviewKey] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [sectionOrder, setSectionOrder] = useState<string[]>([])

  const [debouncedData, setDebouncedData] = useState(data)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => {
    debounceTimer.current = setTimeout(() => setDebouncedData(data), 600)
    return () => clearTimeout(debounceTimer.current)
  }, [data])

  const timer = useRef<ReturnType<typeof setTimeout>>()
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const completeness = calculateCompleteness(data)
  const gating = usePackageGating(isAdmin ? 'eksklusif' : (invitation as unknown as Record<string, unknown>).package_tier as PackageTier | undefined)

  const { groups: NAV_GROUPS, sections: SECTIONS } = useMemo(() => buildNavGroups(gating, template.config.sections), [gating, template.config.sections])

  useEffect(() => {
    setSectionOrder(SECTIONS.map(s => s.id))
  }, [SECTIONS])

  const orderedSections = useMemo(() => {
    if (sectionOrder.length === 0) return SECTIONS
    return sectionOrder
      .map(id => SECTIONS.find(s => s.id === id))
      .filter((s): s is NavItem => s !== undefined)
  }, [sectionOrder, SECTIONS])

  const previewTemplate = useMemo<TemplateRecord>(() => ({
    ...template,
    config: {
      ...template.config,
      opening: {
        ...template.config.opening,
        type: (data.opening_type || template.config.opening.type) as OpeningType,
        subtitle: data.opening_greeting || template.config.opening.subtitle,
        invitation_text: data.opening_subtitle || template.config.opening.invitation_text,
      },
      loading: {
        ...template.config.loading,
        ...(data.loading_config ?? {}),
      },
      sections: template.config.sections.filter(s => {
        const featureKey = SECTION_TYPE_FEATURE[s.type]
        if (!featureKey) return true
        return !!gating.features[featureKey]
      }),
    },
  }), [template, data.opening_type, data.opening_greeting, data.opening_subtitle, data.loading_config, gating.features])

  useEffect(() => {
    setPreviewKey(k => k + 1)
  }, [data.opening_type, data.loading_config])

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

  function renderActiveForm() {
    switch (activeSection) {
      case 'info': return (
        <BasicInfoForm
          groomName={data.groom_name} brideName={data.bride_name}
          groomNickname={data.groom_nickname} brideNickname={data.bride_nickname}
          groomFather={data.groom_father} groomMother={data.groom_mother}
          brideFather={data.bride_father} brideMother={data.bride_mother}
          couplePhotoUrl={data.couple_photo_url} tagline={data.tagline}
          groomPhotoUrl={data.groom_photo_url} bridePhotoUrl={data.bride_photo_url}
          groomBio={data.groom_bio} brideBio={data.bride_bio}
          onGroomNameChange={(val) => updateData({ groom_name: val })}
          onBrideNameChange={(val) => updateData({ bride_name: val })}
          onGroomNicknameChange={(val) => updateData({ groom_nickname: val })}
          onBrideNicknameChange={(val) => updateData({ bride_nickname: val })}
          onGroomFatherChange={(val) => updateData({ groom_father: val })}
          onGroomMotherChange={(val) => updateData({ groom_mother: val })}
          onBrideFatherChange={(val) => updateData({ bride_father: val })}
          onBrideMotherChange={(val) => updateData({ bride_mother: val })}
          onCouplePhotoChange={(url) => updateData({ couple_photo_url: url })}
          onTaglineChange={(val) => updateData({ tagline: val })}
          onGroomPhotoChange={(url) => updateData({ groom_photo_url: url })}
          onBridePhotoChange={(url) => updateData({ bride_photo_url: url })}
          onGroomBioChange={(val) => updateData({ groom_bio: val })}
          onBrideBioChange={(val) => updateData({ bride_bio: val })}
        />
      )
      case 'acara': return (
        <EventDetailsForm
          akad={data.akad} resepsi={data.resepsi}
          onAkadChange={(patch) => updateData({ akad: { ...(data.akad ?? { date: '', time: '', venue_name: '', venue_address: '' }), ...patch } as NewInvitationData['akad'] })}
          onResepsiChange={(patch) => updateData({ resepsi: { ...(data.resepsi ?? { date: '', time: '', venue_name: '', venue_address: '' }), ...patch } as NewInvitationData['resepsi'] })}
        />
      )
      case 'opening': return (
        <OpeningForm
          openingType={(data.opening_type as OpeningType) || 'fade-reveal'}
          openingGreeting={data.opening_greeting || ''} openingSubtitle={data.opening_subtitle || ''}
          openingGroomName={data.opening_groom_name || ''} openingBrideName={data.opening_bride_name || ''}
          groomName={data.groom_name} brideName={data.bride_name}
          nameGap={data.opening_name_gap ?? template.config.opening.couple_name_gap ?? 3}
          onOpeningTypeChange={(val) => updateData({ opening_type: val })}
          onOpeningGreetingChange={(val) => updateData({ opening_greeting: val })}
          onOpeningSubtitleChange={(val) => updateData({ opening_subtitle: val })}
          onOpeningGroomNameChange={(val) => updateData({ opening_groom_name: val })}
          onOpeningBrideNameChange={(val) => updateData({ opening_bride_name: val })}
          onNameGapChange={(val) => updateData({ opening_name_gap: val })}
        />
      )
      case 'loading': return (
        <LoadingForm
          config={{ ...template.config.loading, ...(data.loading_config ?? {}) }}
          onChange={(cfg) => updateData({ loading_config: cfg })}
        />
      )
      case 'warna': return (
        <ColorPaletteForm
          primaryColor={data.primary_color ?? '#2c4a34'}
          accentColor={data.accent_color ?? '#c9a961'}
          textColor={data.text_color ?? '#1a1a1a'}
          backgroundColor={data.background_color ?? '#fefdf8'}
          onPrimaryColorChange={(color) => updateData({ primary_color: color })}
          onAccentColorChange={(color) => updateData({ accent_color: color })}
          onTextColorChange={(color) => updateData({ text_color: color })}
          onBackgroundColorChange={(color) => updateData({ background_color: color })}
          onPresetApply={(colors) => updateData({
            primary_color: colors.primary,
            accent_color: colors.accent,
            text_color: colors.text,
            background_color: colors.background,
          })}
        />
      )
      case 'musik': return (
        <MusicForm
          musicUrl={data.music_url || ''} musicTitle={data.music_title || ''}
          onMusicUrlChange={(val) => updateData({ music_url: val })}
          onMusicTitleChange={(val) => updateData({ music_title: val })}
        />
      )
      case 'quote': return (
        <QuoteForm
          quoteArabic={data.quote_arabic || ''} quoteTranslation={data.quote_translation || ''}
          quoteSource={data.quote_source || ''}
          onQuoteArabicChange={(val) => updateData({ quote_arabic: val })}
          onQuoteTranslationChange={(val) => updateData({ quote_translation: val })}
          onQuoteSourceChange={(val) => updateData({ quote_source: val })}
        />
      )
      case 'cerita': return (
        <StoryForm
          storyTitle={data.story_title ?? ''} storyText={data.story_text ?? ''}
          chapters={data.story_chapters ?? []}
          onStoryTitleChange={(val) => updateData({ story_title: val })}
          onStoryTextChange={(val) => updateData({ story_text: val })}
          onChaptersChange={(chapters) => updateData({ story_chapters: chapters })}
        />
      )
      case 'galeri': return <GalleryManager invitation={invitation} />
      case 'hadiah': return (
        <GiftForm accounts={data.gift_accounts ?? []} onAccountsChange={(accounts) => updateData({ gift_accounts: accounts })} />
      )
      case 'gift_registry': return (
        <GiftRegistryForm items={data.gift_registry ?? []} onItemsChange={(items) => updateData({ gift_registry: items })} />
      )
      case 'video': return (
        <VideoForm
          embedUrl={data.video_embed_url ?? ''} caption={data.video_caption ?? ''}
          onEmbedUrlChange={(val) => updateData({ video_embed_url: val })}
          onCaptionChange={(val) => updateData({ video_caption: val })}
        />
      )
      case 'livestream': return (
        <LivestreamForm url={data.livestream_url ?? ''} onUrlChange={(val) => updateData({ livestream_url: val })} />
      )
      case 'ig_story': return (
        <IGStoryForm imageUrl={data.ig_story_image_url ?? ''} onImageUrlChange={(val) => updateData({ ig_story_image_url: val })} />
      )
      case 'qrcode': return (
        <QRCodeForm
          targetUrl={data.qr_target_url ?? ''} label={data.qr_label ?? ''}
          onTargetUrlChange={(val) => updateData({ qr_target_url: val })}
          onLabelChange={(val) => updateData({ qr_label: val })}
        />
      )
      case 'penutup': return (
        <div className="space-y-3.5">
          <SectionCard title="Penutup" icon={BookOpen} description="Pesan penutup dan ucapan terima kasih (opsional)">
            <FormField label="Kalimat Penutup" hint="Ucapan terima kasih atau kalimat penutup undangan">
              <StudioTextarea rows={3} value={data.closing_text}
                onChange={(e) => updateData({ closing_text: e.target.value })}
                placeholder="Merupakan suatu kehormatan dan kebahagiaan bagi kami..." />
            </FormField>
            <FormField label="Pesan Terima Kasih" hint="Pesan singkat terima kasih untuk para tamu">
              <StudioInput type="text" value={data.thank_you_message}
                onChange={(e) => updateData({ thank_you_message: e.target.value })}
                placeholder="Terima kasih atas doa dan kehadiran Anda" />
            </FormField>
          </SectionCard>
          <InfoCard title="Konfirmasi Kehadiran" icon={CheckSquare}
            message="Form RSVP otomatis tampil di undangan. Lihat daftar tamu yang sudah konfirmasi di tab RSVP."
            actionText="Lihat Daftar RSVP" actionHref="#" />
          <InfoCard title="Buku Ucapan" icon={MessageSquare}
            message="Buku ucapan otomatis tersedia di undangan. Tamu bisa menulis ucapan dan doa untuk Anda berdua." />
        </div>
      )
      default: return null
    }
  }

    const activeItem = SECTIONS.find(s => s.id === activeSection)
    const ActiveIcon = activeItem?.icon ?? Sparkles

    const sectionType = NAV_SECTION_TYPE[activeSection]
    // Section template yang cocok dengan nav item aktif (untuk kontrol Latar Belakang & Transisi).
    // Hanya nav item konten yang punya padanan section render; item level-template (warna/opening/loading) tidak.
    const appearanceSection = sectionType ? template.config.sections.find(s => s.type === sectionType) : undefined
    const previewPhase: 'opening' | 'loading' | 'main' =
      activeSection === 'loading' ? 'loading'
      : sectionType ? 'main'
      : 'opening'
    const previewScrollTo = sectionType
      ? template.config.sections.find(s => s.type === sectionType)?.id
      : undefined

    const renderPhone = (pw: number) => {
      const pad = 6
      const sw = pw - pad * 2
      const sh = Math.round(sw * 2.17)
      const screenR = sw * 0.1
      const z = sw / 390
      return (
        <div className="relative bg-[#1a1a1a] shadow-2xl" style={{ width: pw, borderRadius: pw * 0.12, padding: pad }}>
          <div className="absolute left-1/2 -translate-x-1/2 bg-[#1a1a1a] rounded-full z-20" style={{ top: pad + 4, width: pw * 0.28, height: 14, borderRadius: 10 }} />
          <div style={{ width: sw, height: sh, borderRadius: screenR, position: 'relative', overflow: 'hidden', background: '#000' }}>
            <div style={{ width: 390, height: Math.round(sh / z), zoom: z, position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}>
              <div style={{ width: 390, height: Math.round(sh / z), position: 'relative' }}>
                <InvitationRenderer
                  key={`preview-${previewKey}-${activeSection}`}
                  invitationId={`preview-${invitation.id}`}
                  invitationData={debouncedData}
                  template={previewTemplate}
                  contained
                  noMusic
                  previewGuestName="Bapak & Ibu"
                  initialPhase={previewPhase}
                  scrollToSection={previewScrollTo}
                />
              </div>
            </div>
          </div>
          <div className="mx-auto mt-1 rounded-full bg-stone-600" style={{ width: pw * 0.3, height: 3 }} />
        </div>
      )
    }

    return (
      <div className="flex h-full">
        {/* Left: Section navigation sidebar */}
        <div className="hidden md:flex flex-col shrink-0 overflow-hidden" style={{ width: 210, backgroundColor: '#FAF9F6', borderRight: '1px solid #EDE8E2' }}>
          {/* Sidebar header */}
          <div className="shrink-0 px-3.5 pt-3.5 pb-2" style={{ borderBottom: '1px solid #EDE8E2' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#292524' }}>Konten</h3>
              <button
                onClick={() => setReorderMode(!reorderMode)}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all"
                style={
                  reorderMode
                    ? { background: 'linear-gradient(135deg, #2C4A34, #1A3020)', color: '#FEFDFB' }
                    : { color: '#A8A29E' }
                }
                onMouseEnter={(e) => { if (!reorderMode) e.currentTarget.style.backgroundColor = '#F0EDE8' }}
                onMouseLeave={(e) => { if (!reorderMode) e.currentTarget.style.backgroundColor = 'transparent' }}
                title={reorderMode ? 'Selesai menyusun' : 'Susun ulang section'}
              >
                <ArrowUpDown size={11} />
                {reorderMode ? 'Selesai' : 'Susun'}
              </button>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#EDE8E2' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completeness.percentage}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ background: completeness.percentage === 100 ? '#4A7C59' : '#C9A961' }}
                />
              </div>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#A8A29E' }}>{completeness.percentage}%</span>
            </div>
            {completeness.missingRequired.length > 0 && (
              <p className="text-[10px] text-amber-600 mt-1.5 leading-tight">
                Belum lengkap: {completeness.missingRequired.join(', ')}
              </p>
            )}
          </div>

          {/* Section list */}
          <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <div className="p-2">
              <AnimatePresence mode="wait">
                {reorderMode ? (
                  <motion.div
                    key="reorder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Reorder.Group
                      axis="y"
                      values={sectionOrder}
                      onReorder={setSectionOrder}
                      className="space-y-0.5"
                    >
                      {orderedSections.map(section => (
                        <DraggableSectionItem
                          key={section.id}
                          section={section}
                          active={activeSection === section.id}
                          onClick={() => setActiveSection(section.id)}
                        />
                      ))}
                    </Reorder.Group>
                  </motion.div>
                ) : (
                  <motion.div
                    key="static"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-3"
                  >
                    {NAV_GROUPS.map((group) => (
                      <div key={group.label}>
                        <div style={{ height: 1, backgroundColor: '#EDE8E2', marginBottom: 4 }} />
                        <p className="uppercase select-none" style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', color: '#C9B98A', padding: '10px 14px 4px' }}>
                          {group.label}
                        </p>
                        <div className="space-y-0.5">
                          {group.items.map(section => (
                            <StaticSectionItem
                              key={section.id}
                              section={section}
                              active={activeSection === section.id}
                              onClick={() => setActiveSection(section.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile: horizontal section nav */}
        <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-30 backdrop-blur-xl" style={{ backgroundColor: 'rgba(250,249,246,0.95)', borderTop: '1px solid #EDE8E2' }}>
          <div className="flex overflow-x-auto px-2 py-1.5 gap-0.5" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map(s => {
              const active = activeSection === s.id
              const SIcon = s.icon
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all relative"
                  style={
                    active
                      ? { background: 'linear-gradient(135deg, #2C4A34 0%, #1A3020 100%)', color: '#FFFFFF' }
                      : { color: s.locked ? '#C9C2B8' : '#A8A29E' }
                  }
                >
                  <SIcon size={14} strokeWidth={active ? 2 : 1.5} color={active ? 'rgba(201,169,97,0.9)' : undefined} />
                  <span className="text-[9px] font-medium">{s.label}</span>
                  {s.locked && !active && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-400 flex items-center justify-center">
                      <Lock size={6} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: form content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Section header bar */}
          <div className="shrink-0 backdrop-blur-xl px-4 sm:px-5 py-2.5 flex items-center gap-3" style={{ backgroundColor: 'rgba(250,249,246,0.92)', borderBottom: '1px solid #EDE8E2' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={activeItem?.locked ? { backgroundColor: '#FEF3C7' } : { backgroundColor: '#F5EDD8' }}>
              <ActiveIcon size={15} strokeWidth={2} color={activeItem?.locked ? '#D97706' : '#9A7A3F'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold" style={{ color: '#292524' }}>{activeItem?.label ?? 'Editor'}</h2>
                <AnimatePresence mode="wait">
                  {saveStatus === 'saving' && (
                    <motion.span
                      key="saving"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="inline-flex items-center gap-1 text-[10px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full"
                    >
                      <Loader2 size={9} className="animate-spin" /> Menyimpan…
                    </motion.span>
                  )}
                  {saveStatus === 'saved' && (
                    <motion.span
                      key="saved"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"
                    >
                      <Check size={9} /> Tersimpan
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {activeItem?.locked && activeItem.requiredTier && (
                <p className="text-[10px] text-amber-500 font-medium mt-0.5">
                  Tersedia mulai paket {activeItem.requiredTier}
                </p>
              )}
            </div>

            <button
              onClick={() => setShowPreview(true)}
              className="xl:hidden flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #2C4A34, #1A3020)', color: '#FEFDFB', border: 'none', boxShadow: '0 2px 8px rgba(44,74,52,0.3)' }}
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          {/* Active form */}
          <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
            <div className="px-4 sm:px-5 py-4 max-w-xl mx-auto">
              {/* Completeness indicator (mobile, sidebar shows it on desktop) */}
              <div className="md:hidden mb-4 px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-stone-600">Kelengkapan Undangan</span>
                  <span className="text-xs font-bold text-stone-700">{completeness.percentage}%</span>
                </div>
                <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${completeness.percentage}%` }} />
                </div>
                {completeness.missingRequired.length > 0 && (
                  <p className="text-[10px] text-amber-600 mt-1.5">Belum lengkap: {completeness.missingRequired.join(', ')}</p>
                )}
              </div>
              <div className="relative">
                {renderActiveForm()}
                {appearanceSection && (
                  <div className="mt-3.5">
                    <SectionAppearanceControls
                      section={appearanceSection}
                      data={data}
                      onUpdate={updateData}
                      primaryColor={data.primary_color ?? '#2c4a34'}
                    />
                  </div>
                )}
                {activeItem?.locked && activeItem.requiredTier && (
                  <LockedOverlay requiredTier={activeItem.requiredTier} />
                )}
              </div>
              <div className="h-16 md:h-4" />
            </div>
          </div>
        </div>

        {/* Right: phone preview panel (desktop xl+) */}
        <div className="hidden xl:flex flex-col shrink-0 border-l border-stone-200/60 bg-gradient-to-b from-stone-100/80 to-stone-50/80" style={{ width: 360 }}>
          <div className="flex items-center justify-between px-3 pt-2.5 pb-2 shrink-0">
            <p className="text-[10px] font-semibold text-stone-400">Live Preview</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPreviewKey(k => k + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all" title="Refresh">
                <RefreshCw size={12} />
              </button>
              <button onClick={() => setShowFullscreen(true)} className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-100 transition-all" title="Fullscreen">
                <Maximize2 size={12} />
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 px-2 pb-2">
            {renderPhone(310)}
          </div>
        </div>

        {/* Mobile preview overlay */}
        {showPreview && !showFullscreen && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-end px-4 py-3 shrink-0 gap-2">
              <button onClick={() => setPreviewKey(k => k + 1)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Refresh">
                <RefreshCw size={14} />
              </button>
              <a href={`/invitation/${invitation.slug}`} target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors" title="Buka di tab baru">
                <ExternalLink size={14} />
              </a>
              <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
              {renderPhone(Math.min(380, typeof window !== 'undefined' ? window.innerWidth - 48 : 380))}
            </div>
          </div>
        )}

        {/* Fullscreen preview */}
        {showFullscreen && (
          <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 z-[110] bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div style={{
              width: '100%',
              maxWidth: 430,
              height: '100dvh',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            }}>
              <InvitationRenderer
                key={`fs-${previewKey}`}
                invitationId={`fullscreen-${invitation.id}`}
                invitationData={debouncedData}
                template={previewTemplate}
                contained
                previewGuestName="Bapak & Ibu"
              />
            </div>
          </div>
        )}
      </div>
    )
}
