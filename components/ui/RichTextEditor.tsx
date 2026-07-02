'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { Markdown } from 'tiptap-markdown'
import { useEffect, useRef, useState } from 'react'
import {
  Bold, Italic, Code, Heading2, Heading3, List, ListOrdered,
  Quote, Link2, Image as ImageIcon, Minus, Table as TableIcon,
  Undo2, Redo2, X, Globe, ArrowUpRight,
} from 'lucide-react'
import ImagePicker from './ImagePicker'
import { isInternalHref } from '@/lib/article-markdown'

// Link mark extended with a `title` attribute. Markdown has no rel, so we
// smuggle the rel intent through the markdown title token `[t](url "nofollow")`,
// which prosemirror-markdown round-trips. The public renderer maps title → rel.
const LinkWithTitle = Link.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      title: { default: null },
    }
  },
})

type Rel = 'dofollow' | 'nofollow' | 'sponsored'

interface Props {
  value: string
  onChange: (markdown: string) => void
  uploadUrl?: string
  folder?: string
  placeholder?: string
  minHeight?: number
  /** Called after a link is inserted, so the editor host can track backlinks. */
  onInsertLink?: (info: { url: string; internal: boolean }) => void
}

export default function RichTextEditor({
  value,
  onChange,
  uploadUrl = '/api/admin/upload',
  folder = 'assets',
  placeholder = 'Tulis konten artikel di sini...',
  minHeight = 440,
  onInsertLink,
}: Props) {
  const [showImage, setShowImage] = useState(false)
  const [linkInit, setLinkInit] = useState<{ text: string; url: string; rel: Rel } | null>(null)
  const lastEmitted = useRef(value)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      LinkWithTitle.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Markdown.configure({ html: false, transformPastedText: true, transformCopiedText: true, linkify: true, breaks: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-stone max-w-none focus:outline-none px-5 py-4',
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => {
      const md = editor.storage.markdown.getMarkdown()
      lastEmitted.current = md
      onChange(md)
    },
  })

  useEffect(() => {
    if (!editor) return
    if (value !== lastEmitted.current) {
      lastEmitted.current = value
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  if (!editor) {
    return <div className="border border-gray-200 rounded-xl bg-white" style={{ minHeight: minHeight + 48 }} />
  }

  const insertImage = (url: string, alt: string) => {
    if (!url) return
    editor.chain().focus().setImage({ src: url, alt }).run()
    setShowImage(false)
  }

  const openLink = () => {
    const { from, to } = editor.state.selection
    const selText = editor.state.doc.textBetween(from, to, ' ')
    const attrs = editor.getAttributes('link')
    const rel: Rel = attrs.title === 'nofollow' ? 'nofollow' : attrs.title === 'sponsored' ? 'sponsored' : 'dofollow'
    setLinkInit({ text: selText, url: (attrs.href as string) || '', rel })
  }

  const applyLink = (url: string, text: string, rel: Rel) => {
    const title = rel === 'dofollow' ? null : rel
    const { from, to } = editor.state.selection
    if (from !== to) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url, title } as { href: string }).run()
    } else {
      editor.chain().focus().insertContent({ type: 'text', text: text || url, marks: [{ type: 'link', attrs: { href: url, title } }] }).run()
    }
    onInsertLink?.({ url, internal: isInternalHref(url) })
    setLinkInit(null)
  }

  const removeLink = () => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setLinkInit(null) }

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5 sticky top-0 z-10">
        <TB icon={Undo2} title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} />
        <TB icon={Redo2} title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} />
        <Sep />
        <TB icon={Heading2} title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} />
        <TB icon={Heading3} title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} />
        <Sep />
        <TB icon={Bold} title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} />
        <TB icon={Italic} title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} />
        <TB icon={Code} title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} />
        <Sep />
        <TB icon={List} title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} />
        <TB icon={ListOrdered} title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} />
        <TB icon={Quote} title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} />
        <Sep />
        <TB icon={ImageIcon} title="Sisipkan Gambar" onClick={() => setShowImage(true)} accent />
        <TB icon={Link2} title="Sisipkan/Ubah Link" onClick={openLink} active={editor.isActive('link')} accent />
        <TB icon={TableIcon} title="Sisipkan Tabel" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} accent />
        <Sep />
        <TB icon={Minus} title="Garis Pemisah" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
      </div>

      <EditorContent editor={editor} />

      {showImage && <ImageInsertModal uploadUrl={uploadUrl} folder={folder} onInsert={insertImage} onClose={() => setShowImage(false)} />}
      {linkInit && <LinkModal init={linkInit} onApply={applyLink} onRemove={editor.isActive('link') ? removeLink : undefined} onClose={() => setLinkInit(null)} />}
    </div>
  )
}

function TB({ icon: Icon, title, onClick, active, accent, disabled }: {
  icon: React.ElementType; title: string; onClick: () => void; active?: boolean; accent?: boolean; disabled?: boolean
}) {
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-forest-100 text-forest-700'
        : accent ? 'text-forest-600 hover:bg-forest-50'
        : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
      }`}>
      <Icon className="w-4 h-4" />
    </button>
  )
}

function Sep() { return <div className="w-px h-5 bg-gray-200 mx-1" /> }

function LinkModal({ init, onApply, onRemove, onClose }: {
  init: { text: string; url: string; rel: Rel }
  onApply: (url: string, text: string, rel: Rel) => void
  onRemove?: () => void
  onClose: () => void
}) {
  const [url, setUrl] = useState(init.url)
  const [text, setText] = useState(init.text)
  const [rel, setRel] = useState<Rel>(init.rel)
  const internal = url.trim() ? isInternalHref(url) : false

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-forest-600" /><h3 className="font-bold text-gray-900 text-sm">Sisipkan / Ubah Link</h3></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL</label>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} autoFocus
              placeholder="/blog/artikel-lain atau https://..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
            {url.trim() && (
              <p className={`mt-1.5 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${internal ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                {internal ? <><Globe className="w-3 h-3" />Internal link</> : <><ArrowUpRight className="w-3 h-3" />Link eksternal</>}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teks yang ditampilkan</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Kosongkan untuk pakai teks terpilih / URL"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
          </div>
          {!internal && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Atribut rel (untuk link eksternal)</label>
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                {(['dofollow', 'nofollow', 'sponsored'] as const).map(r => (
                  <button key={r} type="button" onClick={() => setRel(r)}
                    className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md capitalize transition-colors ${rel === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                    {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Dofollow mengalirkan otoritas SEO; Nofollow/Sponsored untuk link berbayar atau tak dijamin.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          {onRemove ? <button onClick={onRemove} className="text-xs font-medium text-red-500 hover:text-red-700">Hapus link</button> : <span />}
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
            <button onClick={() => url.trim() && onApply(url.trim(), text.trim(), internal ? 'dofollow' : rel)} disabled={!url.trim()}
              className="px-4 py-2 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 rounded-lg disabled:opacity-50">Terapkan</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ImageInsertModal({ uploadUrl, folder, onInsert, onClose }: {
  uploadUrl: string; folder: string; onInsert: (url: string, alt: string) => void; onClose: () => void
}) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-forest-600" /><h3 className="font-bold text-gray-900 text-sm">Sisipkan Gambar</h3></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1.5">Gambar</p>
            <ImagePicker value={url} onChange={setUrl} uploadUrl={uploadUrl} folder={folder} previewHeightClass="h-32" variant="inline" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Alt Text (deskripsi gambar)</label>
            <input type="text" value={alt} onChange={e => setAlt(e.target.value)} placeholder="Deskripsi singkat gambar untuk SEO & aksesibilitas"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
          <button onClick={() => onInsert(url, alt)} disabled={!url}
            className="px-4 py-2 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 rounded-lg transition-colors disabled:opacity-50">Sisipkan</button>
        </div>
      </div>
    </div>
  )
}
