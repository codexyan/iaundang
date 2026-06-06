/**
 * ProfilesForm - Couple profiles (OPTIONAL)
 * Photos and short bios for both bride and groom
 */

'use client'

import { Users } from 'lucide-react'
import FormField, { inputClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'
import ImageUploadField from '@/components/admin/ImageUploadField'

interface ProfilesFormProps {
  groomParents: string
  groomPhotoUrl: string
  groomBio: string
  brideParents: string
  bridePhotoUrl: string
  brideBio: string
  onGroomParentsChange: (value: string) => void
  onGroomPhotoChange: (url: string) => void
  onGroomBioChange: (value: string) => void
  onBrideParentsChange: (value: string) => void
  onBridePhotoChange: (url: string) => void
  onBrideBioChange: (value: string) => void
}

export default function ProfilesForm({
  groomParents,
  groomPhotoUrl,
  groomBio,
  brideParents,
  bridePhotoUrl,
  brideBio,
  onGroomParentsChange,
  onGroomPhotoChange,
  onGroomBioChange,
  onBrideParentsChange,
  onBridePhotoChange,
  onBrideBioChange,
}: ProfilesFormProps) {
  return (
    <SectionCard
      title="Foto Mempelai"
      icon={Users}
      description="Foto dan bio singkat kedua mempelai (opsional)"
    >
      {/* Groom */}
      <div className="p-4 bg-blue-50/50 rounded-xl space-y-3 border border-blue-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
            👨
          </div>
          <h4 className="font-bold text-blue-900">Mempelai Pria</h4>
        </div>

        <FormField
          label="Nama Orang Tua"
          hint="Contoh: Bpk. Ahmad & Ibu Sri"
        >
          <input
            type="text"
            className={inputClass}
            value={groomParents}
            onChange={(e) => onGroomParentsChange(e.target.value)}
            placeholder="Bpk. ... & Ibu ..."
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Foto Profil" hint="Foto mempelai pria">
            <ImageUploadField
              value={groomPhotoUrl}
              onChange={onGroomPhotoChange}
              hint="Foto close-up wajah (opsional)"
            />
          </FormField>

          <FormField label="Bio Singkat" hint="Profesi, hobi, atau quote">
            <input
              type="text"
              className={inputClass}
              value={groomBio}
              onChange={(e) => onGroomBioChange(e.target.value)}
              placeholder="Software Engineer, 28 thn"
            />
          </FormField>
        </div>
      </div>

      {/* Bride */}
      <div className="p-4 bg-rose-50/50 rounded-xl space-y-3 border border-rose-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
            👰
          </div>
          <h4 className="font-bold text-rose-900">Mempelai Wanita</h4>
        </div>

        <FormField
          label="Nama Orang Tua"
          hint="Contoh: Bpk. Hendra & Ibu Dewi"
        >
          <input
            type="text"
            className={inputClass}
            value={brideParents}
            onChange={(e) => onBrideParentsChange(e.target.value)}
            placeholder="Bpk. ... & Ibu ..."
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Foto Profil" hint="Foto mempelai wanita">
            <ImageUploadField
              value={bridePhotoUrl}
              onChange={onBridePhotoChange}
              hint="Foto close-up wajah (opsional)"
            />
          </FormField>

          <FormField label="Bio Singkat" hint="Profesi, hobi, atau quote">
            <input
              type="text"
              className={inputClass}
              value={brideBio}
              onChange={(e) => onBrideBioChange(e.target.value)}
              placeholder="Desainer, 25 thn"
            />
          </FormField>
        </div>
      </div>
    </SectionCard>
  )
}
