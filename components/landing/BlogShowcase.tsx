import Link from 'next/link'
import { articles } from '@/lib/db'
import { ArrowRight, FileText, Clock, Eye } from 'lucide-react'

export default async function BlogShowcase() {
  let latest: Awaited<ReturnType<typeof articles.findPublished>> = []
  try {
    const list = await articles.findPublished()
    latest = list.slice(0, 3)
  } catch {
    return null
  }

  if (latest.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-white to-stone-50/50">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-14">
          <p className="text-xs font-semibold tracking-[.18em] uppercase text-forest-400 mb-3">Blog</p>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
            Artikel Terbaru
          </h2>
          <p className="mt-3 text-stone-400 text-sm sm:text-base max-w-lg mx-auto">
            Tips persiapan pernikahan, inspirasi undangan digital, dan cerita dari pasangan nyata.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-10 sm:mb-12">
          {latest.map(article => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-stone-200 hover:shadow-xl hover:shadow-stone-100/50 transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-stone-100 relative">
                {article.coverUrl ? (
                  <img
                    src={article.coverUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-forest-50 to-stone-50 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-forest-200" />
                  </div>
                )}
                {article.tags && (
                  <span className="absolute top-3 left-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-forest-600">
                    {article.tags.split(',')[0].trim()}
                  </span>
                )}
              </div>
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-stone-900 group-hover:text-forest-600 transition-colors leading-snug mb-2 line-clamp-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-sm text-stone-400 line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-forest-600 text-[10px] font-bold">
                      {article.authorName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-stone-500">{article.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      {Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))} mnt
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-600 border border-forest-200 hover:border-forest-300 px-6 py-3 rounded-xl transition-all hover:shadow-sm"
          >
            Lihat Semua Artikel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
