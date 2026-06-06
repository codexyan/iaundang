/**
 * Database layer — Prisma + Supabase PostgreSQL
 * Interface identik dengan versi JSON sebelumnya, semua fungsi sekarang async.
 */

import { prisma } from './prisma'
import type { Invitation, Gallery, Guest, Wish, TemplateRecord, TemplatePackageRequirement, TemplateCategory, ColorPalette } from './types'
import JAVANESE_GOLD from './template-configs/javanese-gold'

// ─── TYPE EXPORTS ────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'user'

export interface DbUser {
  id: string
  email: string
  password_hash: string
  role?: UserRole
  created_at: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  logoUrl: string
  isActive: boolean
}

export interface AdminTemplateConfig {
  id: string
  name: string
  description: string
  thumbnailUrl: string
  demoSlug: string
  tags: string[]
  enabled: boolean
  sortOrder: number
  themeColor: string
  isBuiltIn: boolean
  features: {
    gallery: boolean
    music: boolean
    countdown: boolean
    rsvp: boolean
    wishes: boolean
  }
  price: number
  required_package: TemplatePackageRequirement
}

export interface AppSettings {
  price: number
  packageName: string
  packageDuration: number
  promoEndDate: string
  templates: AdminTemplateConfig[]
  categories: TemplateCategory[]
  colorPalettes: ColorPalette[]
  bankAccounts: BankAccount[]
  qrisImageUrl: string
  paymentInstructions: string
  confirmationWhatsapp: string
  siteName: string
  contactWhatsapp: string
  contactEmail: string
  maintenanceMode: boolean
}

export interface PaymentProof {
  id: string
  invitation_id: string
  user_id: string
  user_email: string
  slug: string
  amount: number
  bank_name: string
  transfer_date: string
  proof_url: string
  notes: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string
  created_at: string
  reviewed_at: string | null
}

// ─── MAPPERS ─────────────────────────────────────────────────────────────────

function mapUser(u: { id: string; email: string; passwordHash: string; role: string; createdAt: Date }): DbUser {
  return { id: u.id, email: u.email, password_hash: u.passwordHash, role: u.role as UserRole, created_at: u.createdAt.toISOString() }
}

function mapInvitation(i: {
  id: string; userId: string; slug: string; templateId: string; data: unknown;
  packageTier: string | null; isPublished: boolean; isPaid: boolean;
  expiresAt: Date | null; createdAt: Date
}): Invitation {
  return {
    id: i.id, user_id: i.userId, slug: i.slug, template_id: i.templateId,
    data: i.data as Invitation['data'],
    package_tier: (i.packageTier ?? undefined) as Invitation['package_tier'],
    is_published: i.isPublished, is_paid: i.isPaid,
    expires_at: i.expiresAt ? i.expiresAt.toISOString() : null,
    created_at: i.createdAt.toISOString(),
  }
}

function mapGallery(g: { id: string; invitationId: string; url: string; order: number }): Gallery {
  return { id: g.id, invitation_id: g.invitationId, url: g.url, order: g.order }
}

function mapGuest(g: { id: string; invitationId: string; name: string; attending: boolean; totalGuests: number; createdAt: Date }): Guest {
  return { id: g.id, invitation_id: g.invitationId, name: g.name, attending: g.attending, total_guests: g.totalGuests, created_at: g.createdAt.toISOString() }
}

function mapWish(w: { id: string; invitationId: string; name: string; message: string; createdAt: Date }): Wish {
  return { id: w.id, invitation_id: w.invitationId, name: w.name, message: w.message, created_at: w.createdAt.toISOString() }
}

function mapTemplateRecord(t: {
  id: string; name: string; slug: string; category: string; config: unknown;
  thumbnailUrl: string; status: string; sortOrder: number; usageCount: number;
  price: number; requiredPackage: string; createdAt: Date
}): TemplateRecord {
  return {
    id: t.id, name: t.name, slug: t.slug, category: t.category,
    config: t.config as TemplateRecord['config'],
    thumbnail_url: t.thumbnailUrl, status: t.status as TemplateRecord['status'],
    sort_order: t.sortOrder, usage_count: t.usageCount, price: t.price,
    required_package: t.requiredPackage as TemplatePackageRequirement,
    created_at: t.createdAt.toISOString(),
  }
}

function mapPaymentProof(p: {
  id: string; invitationId: string; userId: string; userEmail: string; slug: string;
  amount: number; bankName: string; transferDate: string; proofUrl: string; notes: string;
  status: string; adminNotes: string; createdAt: Date; reviewedAt: Date | null
}): PaymentProof {
  return {
    id: p.id, invitation_id: p.invitationId, user_id: p.userId, user_email: p.userEmail,
    slug: p.slug, amount: p.amount, bank_name: p.bankName, transfer_date: p.transferDate,
    proof_url: p.proofUrl, notes: p.notes, status: p.status as PaymentProof['status'],
    admin_notes: p.adminNotes, created_at: p.createdAt.toISOString(),
    reviewed_at: p.reviewedAt ? p.reviewedAt.toISOString() : null,
  }
}

// ─── USERS ───────────────────────────────────────────────────────────────────

export const users = {
  async findByEmail(email: string): Promise<DbUser | null> {
    const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    return u ? mapUser(u) : null
  },
  async findById(id: string): Promise<DbUser | null> {
    const u = await prisma.user.findUnique({ where: { id } })
    return u ? mapUser(u) : null
  },
  async create(data: { email: string; password_hash: string; role?: UserRole }): Promise<DbUser> {
    const u = await prisma.user.create({
      data: { email: data.email.toLowerCase(), passwordHash: data.password_hash, role: data.role ?? 'user' },
    })
    return mapUser(u)
  },
  async findAll(): Promise<DbUser[]> {
    const all = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    return all.map(mapUser)
  },
  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } })
  },
}

// ─── INVITATIONS ─────────────────────────────────────────────────────────────

export const invitations = {
  async findBySlug(slug: string): Promise<Invitation | null> {
    const i = await prisma.invitation.findUnique({ where: { slug } })
    return i ? mapInvitation(i) : null
  },
  async findByUserId(userId: string): Promise<Invitation | null> {
    const i = await prisma.invitation.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return i ? mapInvitation(i) : null
  },
  async findById(id: string): Promise<Invitation | null> {
    const i = await prisma.invitation.findUnique({ where: { id } })
    return i ? mapInvitation(i) : null
  },
  async findAll(): Promise<Invitation[]> {
    const all = await prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } })
    return all.map(mapInvitation)
  },
  async create(data: Omit<Invitation, 'id' | 'created_at'>): Promise<Invitation> {
    const i = await prisma.invitation.create({
      data: {
        userId: data.user_id, slug: data.slug, templateId: data.template_id,
        data: data.data as object,
        packageTier: data.package_tier ?? null,
        isPublished: data.is_published, isPaid: data.is_paid,
        expiresAt: data.expires_at ? new Date(data.expires_at) : null,
      },
    })
    return mapInvitation(i)
  },
  async update(id: string, data: Partial<Omit<Invitation, 'id' | 'created_at' | 'user_id'>>): Promise<Invitation | null> {
    try {
      const i = await prisma.invitation.update({
        where: { id },
        data: {
          ...(data.slug !== undefined && { slug: data.slug }),
          ...(data.template_id !== undefined && { templateId: data.template_id }),
          ...(data.data !== undefined && { data: data.data as object }),
          ...(data.package_tier !== undefined && { packageTier: data.package_tier }),
          ...(data.is_published !== undefined && { isPublished: data.is_published }),
          ...(data.is_paid !== undefined && { isPaid: data.is_paid }),
          ...(data.expires_at !== undefined && { expiresAt: data.expires_at ? new Date(data.expires_at) : null }),
        },
      })
      return mapInvitation(i)
    } catch {
      return null
    }
  },
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.invitation.count({ where: { slug, ...(excludeId && { id: { not: excludeId } }) } })
    return count > 0
  },
}

// ─── GALLERIES ───────────────────────────────────────────────────────────────

export const galleries = {
  async findByInvitationId(invitationId: string): Promise<Gallery[]> {
    const all = await prisma.gallery.findMany({ where: { invitationId }, orderBy: { order: 'asc' } })
    return all.map(mapGallery)
  },
  async findById(id: string): Promise<Gallery | null> {
    const g = await prisma.gallery.findUnique({ where: { id } })
    return g ? mapGallery(g) : null
  },
  async create(data: Omit<Gallery, 'id'>): Promise<Gallery> {
    const g = await prisma.gallery.create({
      data: { invitationId: data.invitation_id, url: data.url, order: data.order },
    })
    return mapGallery(g)
  },
  async delete(id: string): Promise<void> {
    await prisma.gallery.delete({ where: { id } })
  },
}

// ─── GUESTS ──────────────────────────────────────────────────────────────────

export const guests = {
  async findByInvitationId(invitationId: string): Promise<Guest[]> {
    const all = await prisma.guest.findMany({ where: { invitationId }, orderBy: { createdAt: 'desc' } })
    return all.map(mapGuest)
  },
  async create(data: Omit<Guest, 'id' | 'created_at'>): Promise<Guest> {
    const g = await prisma.guest.create({
      data: {
        invitationId: data.invitation_id, name: data.name,
        attending: data.attending, totalGuests: data.total_guests,
      },
    })
    return mapGuest(g)
  },
}

// ─── WISHES ──────────────────────────────────────────────────────────────────

export const wishes = {
  async findByInvitationId(invitationId: string): Promise<Wish[]> {
    const all = await prisma.wish.findMany({ where: { invitationId }, orderBy: { createdAt: 'desc' } })
    return all.map(mapWish)
  },
  async create(data: Omit<Wish, 'id' | 'created_at'>): Promise<Wish> {
    const w = await prisma.wish.create({
      data: { invitationId: data.invitation_id, name: data.name, message: data.message },
    })
    return mapWish(w)
  },
  async delete(id: string): Promise<void> {
    await prisma.wish.delete({ where: { id } })
  },
}

// ─── GIFT PROOFS ─────────────────────────────────────────────────────────────

export interface GiftProofRecord {
  id: string
  invitation_id: string
  name: string
  proof_url: string
  created_at: string
}

export const giftProofs = {
  async create(data: { invitation_id: string; name: string; proof_url: string }): Promise<GiftProofRecord> {
    const r = await prisma.giftProof.create({
      data: { invitationId: data.invitation_id, name: data.name, proofUrl: data.proof_url },
    })
    return { id: r.id, invitation_id: r.invitationId, name: r.name, proof_url: r.proofUrl, created_at: r.createdAt.toISOString() }
  },
  async findByInvitationId(invitationId: string): Promise<GiftProofRecord[]> {
    const all = await prisma.giftProof.findMany({ where: { invitationId }, orderBy: { createdAt: 'desc' } })
    return all.map((r) => ({
      id: r.id, invitation_id: r.invitationId, name: r.name, proof_url: r.proofUrl, created_at: r.createdAt.toISOString(),
    }))
  },
}

// ─── TEMPLATE RECORDS ────────────────────────────────────────────────────────

const BUILT_IN_TEMPLATE_RECORDS: TemplateRecord[] = [JAVANESE_GOLD]

export const templateRecords = {
  async findAll(): Promise<TemplateRecord[]> {
    const dbRecords = await prisma.templateRecord.findMany({ orderBy: { sortOrder: 'asc' } })
    const mapped = dbRecords.map(mapTemplateRecord)
    // Merge built-ins: DB overrides built-in by id if exists
    const map = new Map<string, TemplateRecord>()
    for (const t of BUILT_IN_TEMPLATE_RECORDS) map.set(t.id, t)
    for (const t of mapped) map.set(t.id, t)
    return Array.from(map.values()).sort((a, b) => a.sort_order - b.sort_order)
  },
  async findById(id: string): Promise<TemplateRecord | null> {
    const builtIn = BUILT_IN_TEMPLATE_RECORDS.find(t => t.id === id)
    const db = await prisma.templateRecord.findUnique({ where: { id } })
    if (db) return mapTemplateRecord(db)
    return builtIn ?? null
  },
  async findBySlug(slug: string): Promise<TemplateRecord | null> {
    const builtIn = BUILT_IN_TEMPLATE_RECORDS.find(t => t.slug === slug)
    const db = await prisma.templateRecord.findUnique({ where: { slug } })
    if (db) return mapTemplateRecord(db)
    return builtIn ?? null
  },
  async findActive(): Promise<TemplateRecord[]> {
    const all = await this.findAll()
    return all.filter(t => t.status === 'active')
  },
  async upsert(record: TemplateRecord): Promise<TemplateRecord> {
    const db = await prisma.templateRecord.upsert({
      where: { id: record.id },
      update: {
        name: record.name, slug: record.slug, category: record.category,
        config: record.config as object, thumbnailUrl: record.thumbnail_url,
        status: record.status, sortOrder: record.sort_order,
        usageCount: record.usage_count, price: record.price,
        requiredPackage: record.required_package,
      },
      create: {
        id: record.id, name: record.name, slug: record.slug, category: record.category,
        config: record.config as object, thumbnailUrl: record.thumbnail_url,
        status: record.status, sortOrder: record.sort_order,
        usageCount: record.usage_count, price: record.price,
        requiredPackage: record.required_package,
      },
    })
    return mapTemplateRecord(db)
  },
  async delete(id: string): Promise<void> {
    await prisma.templateRecord.delete({ where: { id } })
  },
}

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const orders = {
  async findAll(): Promise<unknown[]> {
    return []
  },
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

export const BUILT_IN_CATEGORIES: TemplateCategory[] = [
  { slug: 'modern',      label: 'Modern',      is_built_in: true },
  { slug: 'tradisional', label: 'Tradisional', is_built_in: true },
  { slug: 'minimalis',   label: 'Minimalis',   is_built_in: true },
  { slug: 'floral',      label: 'Floral',      is_built_in: true },
  { slug: 'rustic',      label: 'Rustic',      is_built_in: true },
]

export const BUILT_IN_PALETTES: ColorPalette[] = [
  { id: 'jawa-emas',      name: 'Jawa Emas',       group: 'Nusantara', primary: '#1a4a1a', accent: '#d4af37', text: '#ffffff',  background: '#0f2d0f', is_built_in: true },
  { id: 'jawa-kerajaan',  name: 'Jawa Kerajaan',   group: 'Nusantara', primary: '#2d1b4e', accent: '#c5a028', text: '#f5e6c8', background: '#1a0d30', is_built_in: true },
  { id: 'sumatera-tanah', name: 'Sumatera Tanah',  group: 'Nusantara', primary: '#4a2c17', accent: '#e8a830', text: '#f5ebe0', background: '#2c1a0e', is_built_in: true },
  { id: 'bali-sakral',    name: 'Bali Sakral',     group: 'Nusantara', primary: '#3d0000', accent: '#ffd700', text: '#fff8e7', background: '#1a0000', is_built_in: true },
  { id: 'sunda-hijau',    name: 'Sunda Hijau',     group: 'Nusantara', primary: '#1b3a1b', accent: '#8fbe6f', text: '#f0faf0', background: '#0d1f0d', is_built_in: true },
  { id: 'betawi-merah',   name: 'Betawi Merah',    group: 'Nusantara', primary: '#2c1810', accent: '#e07b30', text: '#fff5ed', background: '#1a0e08', is_built_in: true },
  { id: 'bugis-biru',     name: 'Bugis Biru',      group: 'Nusantara', primary: '#0a1f3d', accent: '#d4aa70', text: '#f0eee8', background: '#050f20', is_built_in: true },
  { id: 'modern-putih',   name: 'Modern Putih',    group: 'Modern',    primary: '#f9f9f9', accent: '#1a1a1a', text: '#1a1a1a', background: '#ffffff', is_built_in: true },
  { id: 'modern-hitam',   name: 'Modern Hitam',    group: 'Modern',    primary: '#0f0f0f', accent: '#e8e0d0', text: '#f5f5f5', background: '#1a1a1a', is_built_in: true },
  { id: 'navy-elegan',    name: 'Navy Elegan',     group: 'Modern',    primary: '#0a192f', accent: '#64ffda', text: '#ccd6f6', background: '#020c1b', is_built_in: true },
  { id: 'sage-tenang',    name: 'Sage Tenang',     group: 'Modern',    primary: '#2c3e2d', accent: '#8fba8f', text: '#f0f4f0', background: '#1a2b1c', is_built_in: true },
  { id: 'charcoal-gold',  name: 'Charcoal Gold',   group: 'Modern',    primary: '#1c1c1c', accent: '#c8a84b', text: '#f0ead8', background: '#111111', is_built_in: true },
  { id: 'rose-garden',    name: 'Rose Garden',     group: 'Floral',    primary: '#3d1020', accent: '#f5a0b5', text: '#fff0f5', background: '#2a0815', is_built_in: true },
  { id: 'lavender-dream', name: 'Lavender Dream',  group: 'Floral',    primary: '#1a0d33', accent: '#b088f9', text: '#f5f0ff', background: '#100820', is_built_in: true },
  { id: 'peony-soft',     name: 'Peony Soft',      group: 'Floral',    primary: '#fdf0f3', accent: '#c45876', text: '#2d1018', background: '#fff5f7', is_built_in: true },
  { id: 'dusty-mauve',    name: 'Dusty Mauve',     group: 'Floral',    primary: '#2e1a28', accent: '#e0a8c8', text: '#f8eef5', background: '#1c0f1a', is_built_in: true },
  { id: 'cream-lembut',   name: 'Cream Lembut',    group: 'Minimalis', primary: '#faf8f5', accent: '#8b7355', text: '#1a1510', background: '#f5f2ed', is_built_in: true },
  { id: 'abu-elegan',     name: 'Abu Elegan',      group: 'Minimalis', primary: '#2a2a2a', accent: '#b8b8b8', text: '#f0f0f0', background: '#1a1a1a', is_built_in: true },
  { id: 'off-white',      name: 'Off White',       group: 'Minimalis', primary: '#fcfaf7', accent: '#6b6b6b', text: '#2a2a2a', background: '#f7f5f2', is_built_in: true },
  { id: 'kayu-tua',       name: 'Kayu Tua',        group: 'Rustic',    primary: '#3d2b1f', accent: '#d4956a', text: '#f5e6d3', background: '#2a1a10', is_built_in: true },
  { id: 'hijau-hutan',    name: 'Hijau Hutan',     group: 'Rustic',    primary: '#1e3a2f', accent: '#8fb870', text: '#e8f4e8', background: '#122518', is_built_in: true },
  { id: 'terracotta',     name: 'Terracotta',      group: 'Rustic',    primary: '#2c1a15', accent: '#c87941', text: '#f5e5d8', background: '#1a0e0a', is_built_in: true },
]

const BUILT_IN_TEMPLATES: AdminTemplateConfig[] = [
  {
    id: 'modern-white', name: 'Modern White', description: 'Bersih, minimalis, elegan.',
    thumbnailUrl: '/templates/modern-white/thumbnail.jpg', demoSlug: 'demo-modern',
    tags: ['minimalis', 'modern', 'putih'], enabled: true, price: 0, required_package: 'all',
    sortOrder: 1, themeColor: '#e11d48', isBuiltIn: true,
    features: { gallery: true, music: true, countdown: true, rsvp: true, wishes: true },
  },
  {
    id: 'floral-garden', name: 'Floral Garden', description: 'Penuh bunga dan warna hangat.',
    thumbnailUrl: '/templates/floral-garden/thumbnail.jpg', demoSlug: 'demo-floral',
    tags: ['bunga', 'romantis', 'feminin'], enabled: true, price: 0, required_package: 'all',
    sortOrder: 2, themeColor: '#ec4899', isBuiltIn: true,
    features: { gallery: true, music: true, countdown: true, rsvp: true, wishes: true },
  },
  {
    id: 'dark-elegant', name: 'Dark Elegant', description: 'Gelap, mewah, dan berkesan.',
    thumbnailUrl: '/templates/dark-elegant/thumbnail.jpg', demoSlug: 'demo-dark',
    tags: ['gelap', 'mewah', 'elegan'], enabled: true, price: 0, required_package: 'all',
    sortOrder: 3, themeColor: '#f59e0b', isBuiltIn: true,
    features: { gallery: true, music: true, countdown: true, rsvp: true, wishes: true },
  },
]

const DEFAULT_SETTINGS: AppSettings = {
  price: 129000, packageName: 'Premium', packageDuration: 6, promoEndDate: '2026-08-31',
  templates: BUILT_IN_TEMPLATES, categories: BUILT_IN_CATEGORIES, colorPalettes: BUILT_IN_PALETTES,
  bankAccounts: [], qrisImageUrl: '',
  paymentInstructions: 'Transfer ke salah satu rekening di bawah ini, kemudian kirimkan bukti transfer.',
  confirmationWhatsapp: '628123456789', siteName: 'Akundang',
  contactWhatsapp: '628123456789', contactEmail: 'halo@akundang.id', maintenanceMode: false,
}

export const settings = {
  async get(): Promise<AppSettings> {
    const row = await prisma.appSetting.findUnique({ where: { key: 'main' } })
    const stored = (row?.value ?? {}) as Partial<AppSettings>

    let templates = BUILT_IN_TEMPLATES
    if (stored.templates && stored.templates.length > 0) {
      templates = stored.templates
      for (const b of BUILT_IN_TEMPLATES) {
        if (!templates.find(t => t.id === b.id)) templates.push(b)
      }
    }

    const storedCategories = (stored.categories ?? []) as TemplateCategory[]
    const categories: TemplateCategory[] = [
      ...BUILT_IN_CATEGORIES,
      ...storedCategories.filter(c => !BUILT_IN_CATEGORIES.find(b => b.slug === c.slug)),
    ]

    const storedPalettes = (stored.colorPalettes ?? []) as ColorPalette[]
    const colorPalettes: ColorPalette[] = [
      ...BUILT_IN_PALETTES,
      ...storedPalettes.filter(p => !BUILT_IN_PALETTES.find(b => b.id === p.id)),
    ]

    return { ...DEFAULT_SETTINGS, ...stored, templates, categories, colorPalettes, bankAccounts: stored.bankAccounts ?? [] }
  },
  async save(data: AppSettings): Promise<void> {
    await prisma.appSetting.upsert({
      where: { key: 'main' },
      update: { value: data as object },
      create: { key: 'main', value: data as object },
    })
  },
}

// ─── PAYMENT PROOFS ──────────────────────────────────────────────────────────

export const paymentProofs = {
  async findAll(): Promise<PaymentProof[]> {
    const all = await prisma.paymentProof.findMany({ orderBy: { createdAt: 'desc' } })
    return all.map(mapPaymentProof)
  },
  async findByUserId(userId: string): Promise<PaymentProof[]> {
    const all = await prisma.paymentProof.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    return all.map(mapPaymentProof)
  },
  async findByInvitationId(invitationId: string): Promise<PaymentProof[]> {
    const all = await prisma.paymentProof.findMany({ where: { invitationId }, orderBy: { createdAt: 'desc' } })
    return all.map(mapPaymentProof)
  },
  async findById(id: string): Promise<PaymentProof | null> {
    const p = await prisma.paymentProof.findUnique({ where: { id } })
    return p ? mapPaymentProof(p) : null
  },
  async create(data: Omit<PaymentProof, 'id' | 'created_at' | 'reviewed_at'>): Promise<PaymentProof> {
    const p = await prisma.paymentProof.create({
      data: {
        invitationId: data.invitation_id, userId: data.user_id, userEmail: data.user_email,
        slug: data.slug, amount: data.amount, bankName: data.bank_name,
        transferDate: data.transfer_date, proofUrl: data.proof_url, notes: data.notes,
        status: data.status, adminNotes: data.admin_notes,
      },
    })
    return mapPaymentProof(p)
  },
  async update(id: string, data: Partial<PaymentProof>): Promise<PaymentProof | null> {
    try {
      const p = await prisma.paymentProof.update({
        where: { id },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.admin_notes !== undefined && { adminNotes: data.admin_notes }),
          ...(data.reviewed_at !== undefined && { reviewedAt: data.reviewed_at ? new Date(data.reviewed_at) : null }),
          ...(data.proof_url !== undefined && { proofUrl: data.proof_url }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.bank_name !== undefined && { bankName: data.bank_name }),
          ...(data.transfer_date !== undefined && { transferDate: data.transfer_date }),
          ...(data.notes !== undefined && { notes: data.notes }),
        },
      })
      return mapPaymentProof(p)
    } catch {
      return null
    }
  },
}
