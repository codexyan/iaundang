'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Plus, Edit3, Trash2, Eye, EyeOff, Search, BarChart3,
  Save, ExternalLink, Clock, TrendingUp,
  Heart, MessageSquare, Tag, Image as ImageIcon, Bold, Italic,
  Heading2, Heading3, List, ListOrdered, Quote, Link2, Minus,
  ChevronLeft,
} from 'lucide-react'

interface ArticleData {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string
  authorId: string | null
  authorName: string
  authorAvatar: string
  isPublished: boolean
  publishedAt: string | null
  allowLikes: boolean
  allowComments: boolean
  likesCount: number
  viewsCount: number
  metaTitle: string
  metaDesc: string
  tags: string
  createdAt: string
  updatedAt: string
}

type View = 'list' | 'editor'

export default function WriterDashboard() {
  const [articles, setArticles] = useState<ArticleData[]>([])
  const [view, setView] = useState<View>('list')
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Editor state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [tags, setTags] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [authorName, setAuthorName] = useState('')

  const fetchArticles = useCallback(async () => {
    const res = await fetch('/api/writer/articles')
    if (res.ok) {
      const data = await res.json()
      setArticles(data.articles)
    }
  }, [])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const filtered = articles.filter(a => {
    if (filter === 'published' && !a.isPublished) return false
    if (filter === 'draft' && a.isPublished) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.isPublished).length,
    drafts: articles.filter(a => !a.isPublished).length,
    totalViews: articles.reduce((s, a) => s + a.viewsCount, 0),
    totalLikes: articles.reduce((s, a) => s + a.likesCount, 0),
  }

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function openEditor(article?: ArticleData) {
    if (article) {
      setEditingArticle(article)
      setTitle(article.title)
      setSlug(article.slug)
      setExcerpt(article.excerpt)
      setContent(article.content)
      setCoverUrl(article.coverUrl)
      setTags(article.tags)
      setMetaTitle(article.metaTitle)
      setMetaDesc(article.metaDesc)
      setAuthorName(article.authorName)
    } else {
      setEditingArticle(null)
      setTitle('')
      setSlug('')
      setExcerpt('')
      setContent('')
      setCoverUrl('')
      setTags('')
      setMetaTitle('')
      setMetaDesc('')
      setAuthorName('')
    }
    setPreviewMode(false)
    setView('editor')
  }

  async function handleSave(publish?: boolean) {
    if (!title || !slug) return
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        title, slug, excerpt, content, coverUrl, tags, metaTitle, metaDesc, authorName,
      }
      if (publish !== undefined) {
        payload.isPublished = publish
        if (publish) payload.publishedAt = new Date().toISOString()
      }

      const url = editingArticle
        ? `/api/writer/articles/${editingArticle.id}`
        : '/api/writer/articles'
      const method = editingArticle ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        setEditingArticle(data.article)
        await fetchArticles()
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus artikel ini?')) return
    await fetch(`/api/writer/articles/${id}`, { method: 'DELETE' })
    await fetchArticles()
    if (editingArticle?.id === id) setView('list')
  }

  function insertMarkdown(prefix: string, suffix: string = '') {
    const textarea = document.querySelector<HTMLTextAreaElement>('#content-editor')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const replacement = `${prefix}${selected || 'teks'}${suffix}`
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = start + prefix.length
      textarea.selectionEnd = start + prefix.length + (selected || 'teks').length
    }, 0)
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-stone-50">
        {/* Editor Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali</span>
            </button>

            <div className="flex-1 min-w-0 text-center">
              <p className="text-sm font-medium text-stone-700 truncate">
                {editingArticle ? 'Edit Artikel' : 'Artikel Baru'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-stone-400">
                {wordCount} kata &middot; {readTime} mnt baca
              </span>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !title || !slug}
                className="px-3 py-1.5 text-sm border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-50"
              >
                <span className="hidden sm:inline">{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
                <Save className="w-4 h-4 sm:hidden" />
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !title || !slug}
                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {editingArticle?.isPublished ? 'Update' : 'Publish'}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              if (!editingArticle) setSlug(generateSlug(e.target.value))
            }}
            placeholder="Judul artikel..."
            className="w-full text-2xl sm:text-3xl font-sans font-bold text-stone-900 bg-transparent border-none outline-none placeholder:text-stone-300 mb-4"
          />

          {/* Slug */}
          <div className="flex items-center gap-2 mb-6 text-sm text-stone-400">
            <span>/blog/</span>
            <input
              type="text"
              value={slug}
              onChange={e => setSlug(generateSlug(e.target.value))}
              className="bg-stone-100 px-2 py-1 rounded text-stone-600 border-none outline-none flex-1 min-w-0"
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            {coverUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={coverUrl} alt="Cover" className="w-full aspect-[2/1] object-cover" />
                <button
                  onClick={() => setCoverUrl('')}
                  className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-lg hover:bg-black/70"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center">
                <ImageIcon className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <input
                  type="text"
                  placeholder="Paste URL gambar cover..."
                  onBlur={e => setCoverUrl(e.target.value)}
                  className="text-sm text-center w-full max-w-md mx-auto bg-transparent border-none outline-none text-stone-500 placeholder:text-stone-300"
                />
              </div>
            )}
          </div>

          {/* Excerpt */}
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Ringkasan singkat artikel (ditampilkan di kartu blog)..."
            rows={2}
            className="w-full text-base text-stone-500 bg-transparent border-none outline-none resize-none placeholder:text-stone-300 mb-6"
          />

          {/* Toolbar */}
          <div className="sticky top-[57px] z-20 bg-white border border-stone-200 rounded-xl p-2 mb-4 flex flex-wrap gap-1">
            <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-stone-100 rounded-lg" title="Bold"><Bold className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('*', '*')} className="p-2 hover:bg-stone-100 rounded-lg" title="Italic"><Italic className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n## ')} className="p-2 hover:bg-stone-100 rounded-lg" title="Heading 2"><Heading2 className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n### ')} className="p-2 hover:bg-stone-100 rounded-lg" title="Heading 3"><Heading3 className="w-4 h-4" /></button>
            <div className="w-px bg-stone-200 mx-1" />
            <button onClick={() => insertMarkdown('\n- ')} className="p-2 hover:bg-stone-100 rounded-lg" title="Bullet List"><List className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n1. ')} className="p-2 hover:bg-stone-100 rounded-lg" title="Numbered List"><ListOrdered className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n> ')} className="p-2 hover:bg-stone-100 rounded-lg" title="Quote"><Quote className="w-4 h-4" /></button>
            <div className="w-px bg-stone-200 mx-1" />
            <button onClick={() => insertMarkdown('[', '](url)')} className="p-2 hover:bg-stone-100 rounded-lg" title="Link"><Link2 className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n![alt](', ')')} className="p-2 hover:bg-stone-100 rounded-lg" title="Image"><ImageIcon className="w-4 h-4" /></button>
            <button onClick={() => insertMarkdown('\n---\n')} className="p-2 hover:bg-stone-100 rounded-lg" title="Separator"><Minus className="w-4 h-4" /></button>
            <div className="flex-1" />
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 text-xs rounded-lg ${previewMode ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-stone-100 text-stone-500'}`}
            >
              {previewMode ? 'Edit' : 'Preview'}
            </button>
          </div>

          {/* Content Area */}
          {previewMode ? (
            <div className="prose prose-stone max-w-none min-h-[400px] bg-white rounded-xl border border-stone-200 p-6 sm:p-8">
              <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
            </div>
          ) : (
            <textarea
              id="content-editor"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Tulis artikel di sini... (mendukung Markdown)"
              className="w-full min-h-[400px] sm:min-h-[500px] bg-white rounded-xl border border-stone-200 p-6 sm:p-8 text-base leading-relaxed text-stone-700 font-mono outline-none resize-y placeholder:text-stone-300"
            />
          )}

          {/* Meta / Tags Panel */}
          <details className="mt-8 bg-white rounded-xl border border-stone-200 overflow-hidden">
            <summary className="px-6 py-4 text-sm font-medium text-stone-700 cursor-pointer hover:bg-stone-50">
              SEO & Pengaturan
            </summary>
            <div className="px-6 pb-6 space-y-4 border-t border-stone-100 pt-4">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Nama Penulis</label>
                <input type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Nama penulis" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Tags (pisahkan dengan koma)</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="pernikahan, tips, undangan digital" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Meta Title</label>
                <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="Judul untuk SEO..." className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
                <p className="text-xs text-stone-400 mt-1">{metaTitle.length}/60 karakter</p>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Meta Description</label>
                <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder="Deskripsi untuk SEO..." rows={2} className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none resize-none focus:border-emerald-300" />
                <p className="text-xs text-stone-400 mt-1">{metaDesc.length}/160 karakter</p>
              </div>
            </div>
          </details>

          {/* Delete button for existing articles */}
          {editingArticle && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleDelete(editingArticle.id)}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Hapus Artikel
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Writer Dashboard</h1>
              <p className="text-sm text-stone-400 mt-0.5">Kelola artikel dan konten blog</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, icon: FileText, color: 'text-stone-600' },
              { label: 'Published', value: stats.published, icon: Eye, color: 'text-emerald-600' },
              { label: 'Draft', value: stats.drafts, icon: EyeOff, color: 'text-amber-600' },
              { label: 'Views', value: stats.totalViews, icon: TrendingUp, color: 'text-blue-600' },
              { label: 'Likes', value: stats.totalLikes, icon: Heart, color: 'text-rose-600' },
            ].map(s => (
              <div key={s.label} className="bg-stone-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-stone-400">{s.label}</span>
                </div>
                <p className="text-lg font-bold text-stone-700">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            {(['all', 'published', 'draft'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === f ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'
                }`}
              >
                {f === 'all' ? 'Semua' : f === 'published' ? 'Published' : 'Draft'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300 bg-white"
              />
            </div>
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tulis Artikel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-100">
            <FileText className="w-12 h-12 text-stone-200 mx-auto mb-4" />
            <p className="text-stone-500 font-medium">Belum ada artikel</p>
            <p className="text-sm text-stone-400 mt-1 mb-6">Mulai tulis artikel pertamamu.</p>
            <button
              onClick={() => openEditor()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Tulis Artikel Baru
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(article => (
              <div
                key={article.id}
                className="bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-all p-4 sm:p-5 flex gap-4"
              >
                {/* Thumbnail */}
                {article.coverUrl ? (
                  <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                    <img src={article.coverUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="hidden sm:flex w-24 h-24 rounded-lg bg-stone-50 items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-stone-200" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900 truncate">{article.title}</h3>
                      <p className="text-sm text-stone-400 line-clamp-1 mt-0.5">{article.excerpt || 'Belum ada ringkasan'}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      article.isPublished
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {article.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(article.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {article.viewsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {article.likesCount}
                    </span>
                    {article.tags && (
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        {article.tags.split(',')[0].trim()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => openEditor(article)}
                      className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {article.isPublished && (
                      <a
                        href={`/blog/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Lihat
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-xs px-3 py-1.5 hover:bg-red-50 rounded-lg text-red-500 flex items-center gap-1 ml-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function simpleMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:12px;margin:16px 0" />')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:#059669">$1</a>')
  html = html.replace(/^> (.+)$/gm, '<blockquote style="border-left:3px solid #d4d4d8;padding-left:16px;color:#78716c;margin:12px 0">$1</blockquote>')
  html = html.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0" />')
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*<\/li>)/, '<ul style="padding-left:20px">$1</ul>')
  html = html.replace(/\n\n/g, '</p><p>')
  html = `<p>${html}</p>`
  html = html.replace(/<p><(h[1-3]|blockquote|hr|ul|ol)/g, '<$1')
  html = html.replace(/<\/(h[1-3]|blockquote|ul|ol)><\/p>/g, '</$1>')

  return html
}
