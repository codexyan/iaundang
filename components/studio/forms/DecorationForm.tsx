'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Layers, Trash2, ChevronDown, ChevronUp, ImageIcon, Move } from 'lucide-react'
import type { DecorationAsset, AssetPosition, AssetAnimation, TemplateRecord, NewInvitationData } from '@/lib/types'
import { ANIMATION_PRESETS, IDLE_PRESETS, SECTION_LABELS } from '@/lib/decoration-presets'
import { DECORATION_BUNDLES, type PresetBundle } from '@/lib/decoration-preset-bundles'
import { resolveAssetUrl } from '@/lib/built-in-assets'
import SectionCard from '../ui/SectionCard'
import ImageUploadField from '@/components/admin/ImageUploadField'
import LockedOverlay from '../ui/LockedOverlay'

//  Types 

type DecorationScope = 'opening' | string

interface Props {
  template: TemplateRecord
  data: NewInvitationData
  onUpdate: (patch: Partial<NewInvitationData>) => void
  canEdit: boolean
  maxAssets: number
  requiredTier?: string
}

//  Anchor → pixel position (same logic as DecorationAssetLayer) 

const ANCHOR_POS: Record<string, (w: number, cw: number, ch: number) => { x: number; y: number }> = {
  'top-left':       (w, _cw, _ch) => ({ x: 0, y: 0 }),
  'top-center':     (w, cw) => ({ x: (cw - w) / 2, y: 0 }),
  'top-right':      (w, cw) => ({ x: cw - w, y: 0 }),
  'center-left':    (w, _cw, ch) => ({ x: 0, y: (ch - w) / 2 }),
  'center':         (w, cw, ch) => ({ x: (cw - w) / 2, y: (ch - w) / 2 }),
  'center-right':   (w, cw, ch) => ({ x: cw - w, y: (ch - w) / 2 }),
  'bottom-left':    (w, _cw, ch) => ({ x: 0, y: ch - w }),
  'bottom-center':  (w, cw, ch) => ({ x: (cw - w) / 2, y: ch - w }),
  'bottom-right':   (w, cw, ch) => ({ x: cw - w, y: ch - w }),
}

function getAssetPixelPos(asset: DecorationAsset, cw: number, ch: number) {
  const w = (asset.width ?? 80) * (asset.scale ?? 1)
  const anchorFn = ANCHOR_POS[asset.position ?? 'top-left'] ?? ANCHOR_POS['top-left']
  const anchor = anchorFn(w, cw, ch)
  return {
    x: anchor.x + (asset.offset_x ?? 0),
    y: anchor.y + (asset.offset_y ?? 0),
    w,
  }
}

//  Helpers 

function makeId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function getAssetsForScope(data: NewInvitationData, scope: DecorationScope): DecorationAsset[] {
  if (scope === 'opening') return data.opening_decoration_overrides ?? []
  return (data.section_decoration_overrides ?? {})[scope] ?? []
}

function buildPatch(scope: DecorationScope, assets: DecorationAsset[], data: NewInvitationData): Partial<NewInvitationData> {
  if (scope === 'opening') return { opening_decoration_overrides: assets }
  return { section_decoration_overrides: { ...(data.section_decoration_overrides ?? {}), [scope]: assets } }
}

// Logical canvas dimensions (matches renderer)
const CANVAS_W = 390
const CANVAS_H = 845

//  Main component 

export default function DecorationForm({ template, data, onUpdate, canEdit, maxAssets, requiredTier }: Props) {
  const [scope, setScope] = useState<DecorationScope>('opening')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const assets = getAssetsForScope(data, scope)
  const enabledSections = template.config.sections.filter(s => s.enabled).sort((a, b) => a.order - b.order)

  const updateAssets = useCallback((newAssets: DecorationAsset[]) => {
    onUpdate(buildPatch(scope, newAssets, data))
  }, [scope, data, onUpdate])

  const addAsset = useCallback((url: string) => {
    if (maxAssets >= 0 && assets.length >= maxAssets) return
    const id = makeId()
    updateAssets([...assets, {
      id, url,
      position: 'top-center' as AssetPosition,
      width: 100, scale: 1, rotation: 0, opacity: 85,
      offset_x: 0, offset_y: 0, z_layer: assets.length,
      animation: 'fade-in', animation_delay: 0,
      idle_animation: 'none', idle_speed: 'normal',
      exit_animation: 'none', exit_delay: 0,
    }])
    setSelectedId(id)
    setExpandedId(id)
  }, [assets, maxAssets, updateAssets])

  const updateAsset = useCallback((id: string, patch: Partial<DecorationAsset>) => {
    updateAssets(assets.map(a => a.id === id ? { ...a, ...patch } : a))
  }, [assets, updateAssets])

  const removeAsset = useCallback((id: string) => {
    updateAssets(assets.filter(a => a.id !== id))
    if (selectedId === id) setSelectedId(null)
    if (expandedId === id) setExpandedId(null)
  }, [assets, selectedId, expandedId, updateAssets])

  const applyPresetBundle = useCallback((bundle: PresetBundle) => {
    let next = bundle.assets.map((a, i) => ({ ...a, id: makeId(), z_layer: i }))
    if (maxAssets >= 0 && next.length > maxAssets) next = next.slice(0, maxAssets)
    updateAssets(next)
    setSelectedId(null)
    setExpandedId(null)
  }, [maxAssets, updateAssets])

  const scopeTabs: { id: DecorationScope; label: string }[] = [
    { id: 'opening', label: 'Opening' },
    ...enabledSections.map(s => ({
      id: s.id,
      label: SECTION_LABELS[s.type] ?? s.type,
    })),
  ]

  return (
    <SectionCard title="Dekorasi" icon={Layers} description="Tambah & geser ornamen langsung">
      <div className="relative space-y-3">

        {/*  Scope picker  */}
        <div>
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">Pilih Area</p>
          <div className="flex gap-1 flex-wrap">
            {scopeTabs.map(tab => {
              const count = getAssetsForScope(data, tab.id).length
              const active = scope === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setScope(tab.id); setSelectedId(null); setExpandedId(null) }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                    active
                      ? tab.id === 'opening' ? 'bg-violet-600 text-white' : 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`text-[9px] px-1 rounded-full ${active ? 'bg-white/25' : 'bg-stone-300/60'}`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/*  Preset bundles  */}
        <div>
          <p className="text-xs font-semibold text-stone-700 mb-1">Preset Dekorasi</p>
          <p className="text-[10px] text-stone-400 mb-2">Terapkan set dekorasi siap pakai, lalu sesuaikan sesuai selera</p>
          <div className="grid grid-cols-2 gap-2">
            {DECORATION_BUNDLES.map(bundle => (
              <button
                key={bundle.id}
                type="button"
                onClick={() => applyPresetBundle(bundle)}
                className="p-3 rounded-xl border border-stone-200 hover:border-forest-300 hover:bg-forest-50 text-left transition-all"
              >
                <span className="text-lg block mb-1">{bundle.thumbnail}</span>
                <p className="text-[11px] font-semibold text-stone-700">{bundle.name}</p>
                <p className="text-[9px] text-stone-400 mt-0.5 leading-tight">{bundle.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/*  Draggable Canvas  */}
        <DragCanvas
          assets={assets}
          selectedId={selectedId}
          onSelect={(id) => { setSelectedId(id); if (id) setExpandedId(id) }}
          onMove={(id, dx, dy) => {
            const a = assets.find(x => x.id === id)
            if (!a) return
            updateAsset(id, {
              offset_x: (a.offset_x ?? 0) + dx,
              offset_y: (a.offset_y ?? 0) + dy,
            })
          }}
          isOpening={scope === 'opening'}
        />

        {/*  Upload  */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <ImageUploadField
              label="Tambah Ornamen"
              hint="PNG transparan disarankan"
              value={undefined}
              onChange={(url) => { if (url) addAsset(url) }}
              uploadUrl="/api/user/upload"
            />
          </div>
          {maxAssets >= 0 && (
            <p className="text-[10px] text-stone-400 shrink-0 pb-2 tabular-nums">
              {assets.length}/{maxAssets}
            </p>
          )}
        </div>

        {/*  Asset list  */}
        {assets.length > 0 && (
          <div className="space-y-1.5">
            {assets.map((asset, idx) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                index={idx}
                isSelected={selectedId === asset.id}
                isExpanded={expandedId === asset.id}
                onSelect={() => { setSelectedId(asset.id); setExpandedId(asset.id) }}
                onToggle={() => setExpandedId(expandedId === asset.id ? null : asset.id)}
                onUpdate={(patch) => updateAsset(asset.id, patch)}
                onRemove={() => removeAsset(asset.id)}
              />
            ))}
          </div>
        )}

        {assets.length === 0 && (
          <div className="text-center py-4 text-stone-300">
            <ImageIcon size={24} className="mx-auto mb-1.5 opacity-50" />
            <p className="text-xs">Belum ada ornamen</p>
            <p className="text-[10px] mt-0.5">Upload gambar di atas, lalu geser di canvas</p>
          </div>
        )}

        {!canEdit && requiredTier && (
          <LockedOverlay requiredTier={requiredTier} />
        )}
      </div>
    </SectionCard>
  )
}

//  Drag Canvas 
// Interactive canvas where user can drag ornaments freely.
// Maps pointer movements to offset_x/offset_y in the logical 390×845 space.

function DragCanvas({ assets, selectedId, onSelect, onMove, isOpening }: {
  assets: DecorationAsset[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onMove: (id: string, dx: number, dy: number) => void
  isOpening: boolean
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number } | null>(null)

  // Get scale factor: how many logical pixels per visual pixel
  const getScale = useCallback(() => {
    if (!canvasRef.current) return 1
    const rect = canvasRef.current.getBoundingClientRect()
    return CANVAS_W / rect.width
  }, [])

  // Pointer drag handlers on window
  useEffect(() => {
    if (!dragging) return

    const scale = getScale()
    let lastX = dragging.startX
    let lastY = dragging.startY

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault()
      const dx = (e.clientX - lastX) * scale
      const dy = (e.clientY - lastY) * scale
      lastX = e.clientX
      lastY = e.clientY
      onMove(dragging.id, Math.round(dx), Math.round(dy))
    }

    const onPointerUp = () => {
      setDragging(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [dragging, getScale, onMove])

  const handlePointerDown = (e: React.PointerEvent, assetId: string) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(assetId)
    setDragging({ id: assetId, startX: e.clientX, startY: e.clientY })
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) onSelect(null)
  }

  // Visual canvas height   show phone aspect ratio
  // Canvas width fills parent, height proportional
  const aspectRatio = CANVAS_H / CANVAS_W // ~2.167

  return (
    <div
      ref={canvasRef}
      className={`relative rounded-xl border-2 select-none touch-none ${
        isOpening ? 'border-violet-200 bg-gradient-to-b from-violet-50 to-violet-100/50' : 'border-stone-200 bg-gradient-to-b from-stone-50 to-stone-100/50'
      } ${dragging ? 'cursor-grabbing' : 'cursor-default'}`}
      style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}`, maxHeight: 320 }}
      onClick={handleCanvasClick}
    >
      {/* Grid guides */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" preserveAspectRatio="none" viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}>
        <line x1={CANVAS_W / 2} y1={0} x2={CANVAS_W / 2} y2={CANVAS_H} stroke="#94a3b8" strokeWidth={1} strokeDasharray="8 8" />
        <line x1={0} y1={CANVAS_H / 2} x2={CANVAS_W} y2={CANVAS_H / 2} stroke="#94a3b8" strokeWidth={1} strokeDasharray="8 8" />
        <line x1={0} y1={CANVAS_H / 4} x2={CANVAS_W} y2={CANVAS_H / 4} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="4 12" />
        <line x1={0} y1={CANVAS_H * 3 / 4} x2={CANVAS_W} y2={CANVAS_H * 3 / 4} stroke="#94a3b8" strokeWidth={0.5} strokeDasharray="4 12" />
      </svg>

      {/* Background label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={`text-sm font-bold uppercase tracking-[0.3em] ${
          isOpening ? 'text-violet-200/60' : 'text-stone-200/60'
        }`}>
          {isOpening ? 'OPENING' : 'SECTION'}
        </span>
      </div>

      {/* Rendered assets */}
      {assets.map(asset => {
        const pos = getAssetPixelPos(asset, CANVAS_W, CANVAS_H)
        const isSelected = asset.id === selectedId
        const isDragging = dragging?.id === asset.id
        return (
          <div
            key={asset.id}
            className={`absolute ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              left: `${(pos.x / CANVAS_W) * 100}%`,
              top: `${(pos.y / CANVAS_H) * 100}%`,
              width: `${(pos.w / CANVAS_W) * 100}%`,
              zIndex: 10 + (asset.z_layer ?? 0) + (isSelected ? 50 : 0),
            }}
            onPointerDown={(e) => handlePointerDown(e, asset.id)}
          >
            <img
              src={resolveAssetUrl(asset.url)} alt="" draggable={false}
              className="w-full h-auto pointer-events-none"
              style={{
                opacity: (asset.opacity ?? 100) / 100,
                transform: `rotate(${asset.rotation ?? 0}deg)`,
              }}
            />
            {/* Selection border */}
            {isSelected && (
              <div className="absolute -inset-[3px] border-2 border-violet-500 rounded-sm pointer-events-none">
                <div className="absolute -top-[3px] -left-[3px] w-[6px] h-[6px] bg-violet-500 rounded-full" />
                <div className="absolute -top-[3px] -right-[3px] w-[6px] h-[6px] bg-violet-500 rounded-full" />
                <div className="absolute -bottom-[3px] -left-[3px] w-[6px] h-[6px] bg-violet-500 rounded-full" />
                <div className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] bg-violet-500 rounded-full" />
              </div>
            )}
            {/* Drag hint */}
            {isSelected && !isDragging && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                <Move size={8} className="inline mr-0.5 -mt-0.5" />geser
              </div>
            )}
          </div>
        )
      })}

      {/* Hint when no assets */}
      {assets.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1">
          <Move size={16} className="text-stone-300" />
          <p className="text-[10px] text-stone-400">Upload ornamen, lalu geser di sini</p>
        </div>
      )}

      {/* Hint when assets exist but none selected */}
      {assets.length > 0 && !selectedId && !dragging && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[9px] px-3 py-1 rounded-full pointer-events-none whitespace-nowrap z-50">
          Klik ornamen untuk memilih, lalu geser
        </div>
      )}
    </div>
  )
}

//  Asset Card 

function AssetCard({ asset, index, isSelected, isExpanded, onSelect, onToggle, onUpdate, onRemove }: {
  asset: DecorationAsset
  index: number
  isSelected: boolean
  isExpanded: boolean
  onSelect: () => void
  onToggle: () => void
  onUpdate: (patch: Partial<DecorationAsset>) => void
  onRemove: () => void
}) {
  return (
    <div className={`rounded-lg border transition-all ${
      isSelected ? 'border-violet-400 bg-violet-50/40 shadow-sm' : 'border-stone-200 bg-white'
    }`}>
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-stone-50/50 transition-colors"
        onClick={() => { onSelect(); onToggle() }}
      >
        <img src={resolveAssetUrl(asset.url)} alt="" draggable={false} className="w-7 h-7 rounded object-contain bg-stone-100 shrink-0" />
        <span className="flex-1 text-xs text-stone-600 truncate">Ornamen {index + 1}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="p-1 rounded hover:bg-rose-100 text-stone-300 hover:text-rose-500 transition-colors"
        >
          <Trash2 size={12} />
        </button>
        {isExpanded ? <ChevronUp size={12} className="text-stone-400" /> : <ChevronDown size={12} className="text-stone-400" />}
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-stone-100 pt-2">
          <Slider label="Ukuran" value={asset.scale ?? 1} min={0.3} max={3} step={0.1}
            display={`${Math.round((asset.scale ?? 1) * 100)}%`}
            onChange={(v) => onUpdate({ scale: v })} />
          <Slider label="Rotasi" value={asset.rotation ?? 0} min={0} max={360} step={5}
            display={`${asset.rotation ?? 0}°`}
            onChange={(v) => onUpdate({ rotation: v })} />
          <Slider label="Opacity" value={asset.opacity ?? 100} min={10} max={100} step={5}
            display={`${asset.opacity ?? 100}%`}
            onChange={(v) => onUpdate({ opacity: v })} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] font-medium text-stone-500 mb-1">Animasi</p>
              <select
                value={asset.animation ?? 'fade-in'}
                onChange={(e) => onUpdate({ animation: e.target.value as AssetAnimation })}
                className="w-full text-[11px] rounded-lg border border-stone-200 px-2 py-1.5 bg-white text-stone-700"
              >
                {ANIMATION_PRESETS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[10px] font-medium text-stone-500 mb-1">Loop</p>
              <select
                value={asset.idle_animation ?? 'none'}
                onChange={(e) => onUpdate({ idle_animation: e.target.value as DecorationAsset['idle_animation'] })}
                className="w-full text-[11px] rounded-lg border border-stone-200 px-2 py-1.5 bg-white text-stone-700"
              >
                {IDLE_PRESETS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

//  Slider 

function Slider({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number; display: string
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <p className="text-[10px] font-medium text-stone-500">{label}</p>
        <p className="text-[10px] text-stone-400 tabular-nums">{display}</p>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none bg-stone-200 accent-violet-500"
      />
    </div>
  )
}
