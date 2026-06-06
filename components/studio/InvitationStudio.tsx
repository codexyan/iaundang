/**
 * InvitationStudio - Main invitation editor component
 * Simplified, modular architecture replacing 1171-line monolith
 *
 * IMPROVEMENTS:
 * ✅ Modular forms (separate files)
 * ✅ Better UX copy (user-friendly)
 * ✅ Progress tracking
 * ✅ Breadcrumbs navigation
 * ✅ Visual hierarchy
 * ✅ Removed unnecessary features (video upload, venue photos)
 * ✅ Max 3 gift accounts
 */

'use client'

import { useState, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import { Clock, Image, Gift, CheckSquare, MessageSquare, Heart, BookOpen } from 'lucide-react'
import type { Invitation, NewInvitationData, TemplateRecord, GiftAccount } from '@/lib/types'
import InvitationPreview from '@/components/renderer/InvitationPreview'

// New modular components
import StudioHeader from './StudioHeader'
import BasicInfoForm from './forms/BasicInfoForm'
import EventDetailsForm from './forms/EventDetailsForm'
import ProfilesForm from './forms/ProfilesForm'
import GiftForm from './forms/GiftForm'
import InfoCard from './ui/InfoCard'
import FormField, { textareaClass } from './ui/FormField'
import SectionCard from './ui/SectionCard'

interface Props {
  invitation: Invitation
  template: TemplateRecord
  onSaved: (inv: Invitation) => void
}

// Helper: Initialize data from invitation
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
    hero_video_url: '', // REMOVED: Video upload feature
    akad: d.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' },
    resepsi: d.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' },
    story_title: d.story_title ?? '',
    story_text: d.story_text ?? '',
    closing_text: d.closing_text ?? '',
    thank_you_message: d.thank_you_message ?? '',
    gift_accounts: d.gift_accounts ?? [],
    gallery_photos: d.gallery_photos ?? [],
    story_chapters: d.story_chapters ?? [],
    music_url: d.music_url ?? '',
    livestream_url: d.livestream_url ?? '',
  }
}

// Helper: Calculate completion progress
function calculateProgress(data: NewInvitationData) {
  const required = [
    data.groom_name,
    data.bride_name,
    data.couple_photo_url,
    data.akad.date,
    data.akad.time,
    data.akad.venue_name,
    data.akad.venue_address,
    data.resepsi.date,
    data.resepsi.time,
    data.resepsi.venue_name,
    data.resepsi.venue_address,
  ]

  const filled = required.filter(Boolean).length
  const total = required.length

  const missing: string[] = []
  if (!data.groom_name) missing.push('Nama Mempelai Pria')
  if (!data.bride_name) missing.push('Nama Mempelai Wanita')
  if (!data.couple_photo_url) missing.push('Foto Pembuka')
  if (!data.akad.date) missing.push('Tanggal Akad')
  if (!data.akad.venue_name) missing.push('Tempat Akad')
  if (!data.resepsi.date) missing.push('Tanggal Resepsi')
  if (!data.resepsi.venue_name) missing.push('Tempat Resepsi')

  return {
    percentage: Math.round((filled / total) * 100),
    requiredFieldsCount: filled,
    totalRequiredFields: total,
    missingFields: missing,
  }
}

// Phone mockup component
function PhoneMockup({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <div className="bg-stone-100 rounded-[2.5rem] p-3 shadow-2xl w-[320px]">
      <div className="bg-white rounded-[2rem] overflow-hidden" style={{ aspectRatio: '9/19.5' }}>
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Main component
export default function InvitationStudio({ invitation, template, onSaved }: Props) {
  const [data, setData] = useState<NewInvitationData>(() => initData(invitation))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const timer = useRef<ReturnType<typeof setTimeout>>()

  const progress = calculateProgress(data)

  // Auto-save with debounce
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
        } catch (error) {
          toast.error('Gagal menyimpan perubahan')
          setSaveStatus('idle')
        }
      }, 800)
    },
    [invitation.id, onSaved]
  )

  // Update data handler
  function updateData(patch: Partial<NewInvitationData>) {
    const updated = { ...data, ...patch }
    setData(updated)
    scheduleSave(updated)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header with breadcrumbs & progress */}
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

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left: Forms */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* REQUIRED SECTION 1: Basic Info */}
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

            {/* REQUIRED SECTION 2: Event Details */}
            <EventDetailsForm
              akad={data.akad}
              resepsi={data.resepsi}
              onAkadChange={(patch) => updateData({ akad: { ...data.akad, ...patch } })}
              onResepsiChange={(patch) => updateData({ resepsi: { ...data.resepsi, ...patch } })}
            />

            {/* OPTIONAL: Countdown */}
            <InfoCard
              title="Hitung Mundur"
              icon={Clock}
              message="Hitung mundur otomatis dihitung dari tanggal akad yang Anda isi di Detail Acara."
            />

            {/* OPTIONAL: Couple Profiles */}
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

            {/* OPTIONAL: Love Story (SIMPLIFIED - single text) */}
            <SectionCard
              title="Kisah Cinta"
              icon={Heart}
              description="Cerita pertemuan atau perjalanan cinta Anda (opsional)"
            >
              <FormField
                label="Cerita Cinta Anda"
                hint="Tulis cerita singkat tentang bagaimana Anda berdua bertemu dan jatuh cinta"
              >
                <textarea
                  className={textareaClass}
                  rows={6}
                  value={data.story_text}
                  onChange={(e) => updateData({ story_text: e.target.value })}
                  placeholder="Kami pertama kali bertemu di..."
                />
              </FormField>
            </SectionCard>

            {/* OPTIONAL: Gallery */}
            <InfoCard
              title="Galeri Foto"
              icon={Image}
              message="Upload dan kelola foto galeri undangan Anda di tab Galeri."
              actionText="Buka Galeri"
              actionHref="#"
            />

            {/* OPTIONAL: Gift Accounts (max 3) */}
            <GiftForm
              accounts={data.gift_accounts as GiftAccount[]}
              onAccountsChange={(accounts) => updateData({ gift_accounts: accounts })}
            />

            {/* OPTIONAL: RSVP */}
            <InfoCard
              title="Konfirmasi Kehadiran"
              icon={CheckSquare}
              message="Form RSVP otomatis tampil di undangan. Lihat daftar tamu yang sudah konfirmasi di tab RSVP."
              actionText="Lihat Daftar RSVP"
              actionHref="#"
            />

            {/* OPTIONAL: Wishes */}
            <InfoCard
              title="Buku Ucapan"
              icon={MessageSquare}
              message="Buku ucapan otomatis tersedia di undangan. Tamu bisa menulis ucapan dan doa untuk Anda berdua."
            />

            {/* OPTIONAL: Closing */}
            <SectionCard
              title="Penutup"
              icon={BookOpen}
              description="Pesan penutup dan ucapan terima kasih (opsional)"
            >
              <FormField
                label="Kalimat Penutup"
                hint="Ucapan terima kasih atau kalimat penutup undangan"
              >
                <textarea
                  className={textareaClass}
                  rows={3}
                  value={data.closing_text}
                  onChange={(e) => updateData({ closing_text: e.target.value })}
                  placeholder="Merupakan suatu kehormatan dan kebahagiaan bagi kami..."
                />
              </FormField>

              <FormField
                label="Pesan Terima Kasih"
                hint="Pesan singkat terima kasih untuk para tamu"
              >
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

          {/* Right: Preview */}
          <div className="hidden lg:block shrink-0">
            <div className="sticky top-24">
              <PhoneMockup slug={invitation.slug}>
                <InvitationPreview
                  template={template}
                  data={data}
                  invitationId={invitation.id}
                />
              </PhoneMockup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
