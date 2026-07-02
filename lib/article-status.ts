// Shared editorial-status metadata for article dashboards (writer & future admin UI).

export const ARTICLE_STATUSES = [
  'draft',
  'pending_review',
  'needs_revision',
  'scheduled',
  'published',
  'archived',
] as const

export type ArticleStatus = typeof ARTICLE_STATUSES[number]

export const STATUS_META: Record<ArticleStatus, { label: string; badgeClass: string; dotClass: string }> = {
  draft:          { label: 'Draft',           badgeClass: 'bg-gray-100 text-gray-600',        dotClass: 'bg-gray-400' },
  pending_review: { label: 'Menunggu Review', badgeClass: 'bg-amber-100 text-amber-700',      dotClass: 'bg-amber-500' },
  needs_revision: { label: 'Perlu Revisi',    badgeClass: 'bg-red-100 text-red-700',          dotClass: 'bg-red-500' },
  scheduled:      { label: 'Terjadwal',       badgeClass: 'bg-blue-100 text-blue-700',        dotClass: 'bg-blue-500' },
  published:      { label: 'Published',       badgeClass: 'bg-emerald-100 text-emerald-700', dotClass: 'bg-emerald-500' },
  archived:       { label: 'Diarsipkan',      badgeClass: 'bg-stone-200 text-stone-600',      dotClass: 'bg-stone-500' },
}

export function statusMeta(status: string) {
  return STATUS_META[status as ArticleStatus] ?? STATUS_META.draft
}
