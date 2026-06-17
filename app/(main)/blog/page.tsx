import Link from 'next/link'
import { articles } from '@/lib/db'
import { FileText, ArrowRight, Clock, Eye, Search, Tag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Blog — Tips & Inspirasi Pernikahan | iaundang',
  description: 'Artikel seputar persiapan pernikahan, undangan digital, dan inspirasi untuk hari spesial kalian.',
}

export default async function BlogPage() {
  const list = await articles.findPublished()

  const allTags = Array.from(
    new Set(list.flatMap(a => a.tags.split(',').map(t => t.trim()).filter(Boolean)))
  ).slice(0, 12)

  const featured = list.find(a => a.settings.featured || a.settings.pinned) || list[0]
  const rest = list.filter(a => a.id !== featured?.id)

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-50/80 to-white pt-12 pb-6 sm:pt-20 sm:pb-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold tracking-[.18em] uppercase text-emerald-600 mb-3">Blog</p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 leading-tight">
              Tips & Inspirasi Pernikahan
            </h1>
            <p className="mt-4 text-stone-500 text-base sm:text-lg leading-relaxed">
              Panduan lengkap persiapan pernikahan, inspirasi undangan digital,
              dan cerita dari pasangan yang sudah menggunakan iaundang.
            </p>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {allTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-stone-200 text-stone-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors cursor-default"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        {list.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500 font-medium">Belum ada artikel</p>
            <p className="text-sm text-stone-400 mt-1">Segera hadir artikel menarik untuk kalian.</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <Link
                href={`/blog/${featured.slug}`}
                className="group block bg-white rounded-2xl sm:rounded-3xl border border-stone-100 overflow-hidden hover:shadow-xl hover:shadow-stone-100/50 transition-all duration-500 mb-10 sm:mb-14"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-stone-100">
                    {featured.coverUrl ? (
                      <img
                        src={featured.coverUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full min-h-[240px] bg-gradient-to-br from-emerald-50 to-stone-50 flex items-center justify-center">
                        <FileText className="w-16 h-16 text-emerald-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        Artikel Pilihan
                      </span>
                      {featured.tags && (
                        <span className="text-xs text-stone-400">
                          {featured.tags.split(',')[0].trim()}
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug mb-3">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-stone-500 leading-relaxed line-clamp-3 mb-5">{featured.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-stone-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                          {featured.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-stone-600">{featured.authorName}</span>
                      </div>
                      {featured.publishedAt && (
                        <span>{new Date(featured.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {Math.max(1, Math.ceil(featured.content.split(/\s+/).length / 200))} mnt
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {rest.map(article => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.slug}`}
                    className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/50 transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-stone-100">
                      {article.coverUrl ? (
                        <img
                          src={article.coverUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-stone-50 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-emerald-200" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      {article.tags && (
                        <span className="text-xs text-emerald-600 font-medium mb-2">
                          {article.tags.split(',')[0].trim()}
                        </span>
                      )}
                      <h2 className="text-lg font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug mb-2 line-clamp-2">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-sm text-stone-400 line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
                      )}
                      <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold">
                            {article.authorName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-stone-500">{article.authorName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-stone-400">
                          {article.publishedAt && (
                            <span>{new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {article.viewsCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
