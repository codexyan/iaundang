import sharp from 'sharp'

// Standards for article images (see admin prompt): keep dimensions/quality
// consistent so blog layout stays clean and images load fast.
export const ARTICLE_IMAGE = {
  maxWidth: 1600,          // above this is wasted — article column is ~800-900px
  coverRatio: 1.91,        // OG / social-share standard (1200x630)
  coverMinWidth: 800,      // below this, warn "may look blurry on large screens"
  quality: 80,             // visually lossless-ish for photos
  maxBytes: 2 * 1024 * 1024,
}

export type ImageVariant = 'cover' | 'inline'

export interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  contentType: string
  ext: string
  /** true if the SOURCE was smaller than the recommended minimum */
  lowRes: boolean
}

/**
 * Auto-resize + compress an article image before it hits storage.
 * - cover: crop to 1.91:1, cap width at 1600px
 * - inline: cap width at 1600px (never upscale), keep aspect ratio
 * Animated GIFs are passed through untouched so animation is preserved.
 * On any failure the original buffer is returned (never blocks the upload).
 */
export async function processArticleImage(input: Buffer, variant: ImageVariant): Promise<ProcessedImage> {
  try {
    const base = sharp(input, { failOn: 'none' }).rotate() // honour EXIF orientation
    const meta = await base.metadata()

    // Preserve animated GIFs as-is (sharp would flatten the animation).
    if (meta.format === 'gif' && (meta.pages ?? 1) > 1) {
      return { buffer: input, width: meta.width ?? 0, height: meta.height ?? 0, contentType: 'image/gif', ext: '.gif', lowRes: (meta.width ?? 0) < ARTICLE_IMAGE.coverMinWidth }
    }

    const srcW = meta.width ?? 0
    let pipeline = base

    if (variant === 'cover') {
      const targetW = Math.min(srcW || ARTICLE_IMAGE.maxWidth, ARTICLE_IMAGE.maxWidth)
      const targetH = Math.round(targetW / ARTICLE_IMAGE.coverRatio)
      pipeline = pipeline.resize(targetW, targetH, { fit: 'cover', position: 'centre' })
    } else {
      pipeline = pipeline.resize({ width: ARTICLE_IMAGE.maxWidth, withoutEnlargement: true })
    }

    const out = await pipeline.webp({ quality: ARTICLE_IMAGE.quality }).toBuffer({ resolveWithObject: true })
    return {
      buffer: out.data,
      width: out.info.width,
      height: out.info.height,
      contentType: 'image/webp',
      ext: '.webp',
      lowRes: (variant === 'cover' ? srcW : srcW) > 0 && srcW < ARTICLE_IMAGE.coverMinWidth,
    }
  } catch {
    // Never block an upload on processing failure — store the original.
    return { buffer: input, width: 0, height: 0, contentType: 'application/octet-stream', ext: '', lowRes: false }
  }
}
