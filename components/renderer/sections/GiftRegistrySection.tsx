'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import type { SectionConfig, NewInvitationData, TemplateMeta, GiftRegistryLink } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb, cardBg, contentPanelBg, hasMediaBg } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

type StyleCtx = {
  accent: string
  text: string
  headingFont: string
  bodyFont: string
}

const MARKETPLACE_LABEL: Record<string, string> = {
  tokopedia: 'Tokopedia',
  shopee: 'Shopee',
  bukalapak: 'Bukalapak',
  lazada: 'Lazada',
  other: 'Wishlist',
}

//  Ornament 

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

//  Section Header 

function SectionHeader({ ctx }: { ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont } = ctx
  return (
    <div className="text-center px-6" style={{ marginBottom: 28 }}>
      <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
        <Ornament accent={accent} />
      </motion.div>

      <motion.p
        style={{
          fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase',
          color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10,
        }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        Daftar Hadiah
      </motion.p>

      <motion.h2
        style={{
          fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont,
          letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.3,
        }}
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
        Wishlist Kami
      </motion.h2>

      <motion.p
        style={{
          fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont,
          lineHeight: 1.9, fontStyle: 'italic',
        }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        Berikut beberapa hadiah yang kami harapkan.<br />Tentu saja, kehadiran Anda adalah hadiah terindah.
      </motion.p>
    </div>
  )
}

//  Marketplace Tag 

function MarketplaceTag({ marketplace, accent, bodyFont }: {
  marketplace?: string; accent: string; bodyFont: string
}) {
  if (!marketplace) return null
  return (
    <p style={{
      fontSize: fsb(7.5), letterSpacing: '0.15em', textTransform: 'uppercase',
      color: `${accent}70`, fontFamily: bodyFont, marginBottom: 6,
    }}>
      {MARKETPLACE_LABEL[marketplace] ?? marketplace}
    </p>
  )
}

//  Link Button 

function LinkButton({ url, accent, bodyFont }: {
  url: string; accent: string; bodyFont: string
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: '8px 0',
        border: `1px solid ${accent}25`,
        color: accent, fontSize: fsb(8.5), fontWeight: 400,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        fontFamily: bodyFont, textDecoration: 'none',
        transition: 'all 0.2s', marginTop: 'auto',
      }}>
      Lihat <ExternalLink size={10} />
    </a>
  )
}

// 
// VARIANT: default  horizontal scroll carousel
// 

function CarouselCard({ item, ctx, index, bg }: {
  item: GiftRegistryLink; ctx: StyleCtx; index: number; bg?: SectionConfig['background']
}) {
  const { accent, text, headingFont, bodyFont } = ctx
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { delay: 0.1 + index * 0.08 } },
      }}
      style={{
        width: 200, flexShrink: 0,
        border: `1px solid ${accent}22`,
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        ...(bg ? cardBg(bg) : {}),
      }}>

      {/* Image */}
      {item.image_url ? (
        <div style={{
          width: '100%', height: 160,
          backgroundImage: `url(${item.image_url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderBottom: `1px solid ${accent}18`,
        }} />
      ) : (
        <div style={{
          width: '100%', height: 120,
          background: `linear-gradient(135deg, ${accent}12, ${accent}22)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderBottom: `1px solid ${accent}18`,
        }}>
          <span style={{ fontSize: 28, color: `${accent}25` }}>&#10029;</span>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '14px 14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <MarketplaceTag marketplace={item.marketplace} accent={accent} bodyFont={bodyFont} />

        <p style={{
          fontSize: fsb(11.5), fontWeight: 400, color: text,
          fontFamily: headingFont, lineHeight: 1.4, marginBottom: 6,
        }}>
          {item.label}
        </p>

        {item.description && (
          <p style={{
            fontSize: fsb(9), color: `${text}75`, fontFamily: bodyFont,
            fontStyle: 'italic', lineHeight: 1.7, marginBottom: 8, flex: 1,
          }}>
            {item.description}
          </p>
        )}

        {item.price && (
          <p style={{
            fontSize: fsb(10.5), fontWeight: 400, color: accent,
            fontFamily: bodyFont, marginBottom: 10,
          }}>
            {item.price}
          </p>
        )}

        <LinkButton url={item.url} accent={accent} bodyFont={bodyFont} />
      </div>
    </motion.div>
  )
}

function DefaultVariant({ registry, ctx, bg }: { registry: GiftRegistryLink[]; ctx: StyleCtx; bg: SectionConfig['background'] }) {
  const { accent, text, bodyFont } = ctx
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  function scroll(dir: 'left' | 'right') {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -216 : 216, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
      style={{ position: 'relative' }}>

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        style={{
          display: 'flex', gap: 14,
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          paddingLeft: 24, paddingRight: 24, paddingBottom: 4,
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
        }}>
        {registry.map((item, i) => (
          <div key={i} style={{ scrollSnapAlign: 'start' }}>
            <CarouselCard item={item} ctx={ctx} index={i} bg={bg} />
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      {registry.length > 1 && (
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 16 }}>
          <motion.button onClick={() => scroll('left')} whileTap={{ scale: 0.85 }}
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}12`, border: `1px solid ${accent}28`,
              borderRadius: '50%', cursor: 'pointer',
              opacity: canScrollLeft ? 1 : 0.3, transition: 'opacity 0.2s',
            }}>
            <ChevronLeft size={14} color={accent} />
          </motion.button>

          <span style={{ fontSize: fsb(8), color: `${text}65`, letterSpacing: '0.15em', fontFamily: bodyFont }}>
            {registry.length} hadiah
          </span>

          <motion.button onClick={() => scroll('right')} whileTap={{ scale: 0.85 }}
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${accent}12`, border: `1px solid ${accent}28`,
              borderRadius: '50%', cursor: 'pointer',
              opacity: canScrollRight ? 1 : 0.3, transition: 'opacity 0.2s',
            }}>
            <ChevronRight size={14} color={accent} />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

// 
// VARIANT: grid  2-column compact grid
// 

function GridVariant({ registry, ctx, bg }: { registry: GiftRegistryLink[]; ctx: StyleCtx; bg: SectionConfig['background'] }) {
  const { accent, text, headingFont, bodyFont } = ctx
  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
      style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        padding: '0 24px',
      }}>
      {registry.map((item, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 14 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.07 } },
          }}
          style={{
            border: `1px solid ${accent}22`,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            ...cardBg(bg),
          }}>

          {/* Image */}
          {item.image_url ? (
            <div style={{
              width: '100%', height: 120,
              backgroundImage: `url(${item.image_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              borderBottom: `1px solid ${accent}18`,
            }} />
          ) : (
            <div style={{
              width: '100%', height: 80,
              background: `linear-gradient(135deg, ${accent}12, ${accent}22)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderBottom: `1px solid ${accent}18`,
            }}>
              <span style={{ fontSize: 22, color: `${accent}25` }}>&#10029;</span>
            </div>
          )}

          {/* Content */}
          <div style={{ padding: '10px 10px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <MarketplaceTag marketplace={item.marketplace} accent={accent} bodyFont={bodyFont} />

            <p style={{
              fontSize: fsb(10.5), fontWeight: 400, color: text,
              fontFamily: headingFont, lineHeight: 1.4, marginBottom: 8,
            }}>
              {item.label}
            </p>

            {item.price && (
              <p style={{
                fontSize: fsb(9.5), fontWeight: 400, color: accent,
                fontFamily: bodyFont, marginBottom: 8,
              }}>
                {item.price}
              </p>
            )}

            <LinkButton url={item.url} accent={accent} bodyFont={bodyFont} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

// 
// VARIANT: list  full-width stacked rows, image left
// 

function ListVariant({ registry, ctx, bg }: { registry: GiftRegistryLink[]; ctx: StyleCtx; bg: SectionConfig['background'] }) {
  const { accent, text, headingFont, bodyFont } = ctx
  const isMedia = hasMediaBg(bg)
  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
      style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: isMedia ? 8 : 0 }}>
      {registry.map((item, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, x: -10 },
            visible: { opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.08 } },
          }}
          style={{
            display: 'flex', gap: 14, alignItems: 'center',
            padding: isMedia ? '14px' : '14px 0',
            borderBottom: !isMedia && i < registry.length - 1 ? `1px solid ${accent}20` : 'none',
            ...contentPanelBg(bg),
          }}>

          {/* Image  small square */}
          {item.image_url ? (
            <div style={{
              width: 56, height: 56, flexShrink: 0,
              backgroundImage: `url(${item.image_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              border: `1px solid ${accent}20`,
            }} />
          ) : (
            <div style={{
              width: 56, height: 56, flexShrink: 0,
              background: `linear-gradient(135deg, ${accent}10, ${accent}1a)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${accent}20`,
            }}>
              <span style={{ fontSize: 18, color: `${accent}25` }}>&#10029;</span>
            </div>
          )}

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <MarketplaceTag marketplace={item.marketplace} accent={accent} bodyFont={bodyFont} />

            <p style={{
              fontSize: fsb(11), fontWeight: 400, color: text,
              fontFamily: headingFont, lineHeight: 1.4, marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </p>

            {item.description && (
              <p style={{
                fontSize: fsb(8.5), color: `${text}60`, fontFamily: bodyFont,
                fontStyle: 'italic', lineHeight: 1.6,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.description}
              </p>
            )}

            {item.price && (
              <p style={{
                fontSize: fsb(9), fontWeight: 400, color: accent,
                fontFamily: bodyFont, marginTop: 2,
              }}>
                {item.price}
              </p>
            )}
          </div>

          {/* Arrow link */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${accent}18`,
              color: accent, textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
            <ExternalLink size={13} />
          </a>
        </motion.div>
      ))}
    </motion.div>
  )
}

// 
// VARIANT: minimal  text only, no images
// 

function MinimalVariant({ registry, ctx, bg }: { registry: GiftRegistryLink[]; ctx: StyleCtx; bg: SectionConfig['background'] }) {
  const { accent, text, headingFont, bodyFont } = ctx
  const isMedia = hasMediaBg(bg)
  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
      style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: isMedia ? 8 : 0 }}>
      {registry.map((item, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.06 } },
          }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            padding: isMedia ? '12px 14px' : '12px 0',
            borderBottom: !isMedia && i < registry.length - 1 ? `1px solid ${accent}20` : 'none',
            ...contentPanelBg(bg),
          }}>

          {/* Label + marketplace */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: fsb(11), fontWeight: 400, color: text,
              fontFamily: headingFont, lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.label}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
              {item.marketplace && (
                <span style={{
                  fontSize: fsb(7.5), letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: `${accent}70`, fontFamily: bodyFont,
                }}>
                  {MARKETPLACE_LABEL[item.marketplace] ?? item.marketplace}
                </span>
              )}
              {item.price && (
                <span style={{
                  fontSize: fsb(8.5), fontWeight: 400, color: `${accent}90`,
                  fontFamily: bodyFont,
                }}>
                  {item.price}
                </span>
              )}
            </div>
          </div>

          {/* Bordered "Lihat" button */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 14px',
              border: `1px solid ${accent}25`,
              color: accent, fontSize: fsb(8), fontWeight: 400,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              fontFamily: bodyFont, textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
            Lihat <ExternalLink size={9} />
          </a>
        </motion.div>
      ))}
    </motion.div>
  )
}

// 
// Main export
// 

export default function GiftRegistrySection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)
  const registry = data.gift_registry ?? []

  const headingFont = `'${font.heading}', serif`
  const bodyFont = `'${font.body}', serif`

  if (registry.length === 0) return null

  const variant = section.style_variant ?? 'default'
  const ctx: StyleCtx = { accent, text, headingFont, bodyFont }

  return (
    <SectionWrapper section={section} className="px-0">
      <div className="w-full py-14">

        {/* Header */}
        <SectionHeader ctx={ctx} />

        {/* Variant body */}
        {variant === 'grid' && <GridVariant registry={registry} ctx={ctx} bg={section.background} />}
        {variant === 'list' && <ListVariant registry={registry} ctx={ctx} bg={section.background} />}
        {variant === 'minimal' && <MinimalVariant registry={registry} ctx={ctx} bg={section.background} />}
        {(variant === 'default' || !['grid', 'list', 'minimal'].includes(variant)) && (
          <DefaultVariant registry={registry} ctx={ctx} bg={section.background} />
        )}

      </div>
    </SectionWrapper>
  )
}
