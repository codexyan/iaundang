import { blogTypography } from '@/lib/db'

// Server component: injects the admin-configured blog typography as CSS
// variables/rules scoped to .markdown-content, without touching globals.css.
export default async function BlogTypographyStyle() {
  const t = await blogTypography.get()
  const css = `
.markdown-content {
  font-family: ${t.bodyFont};
  font-size: ${t.bodySize}px;
  line-height: ${t.lineHeight};
}
.markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4 {
  font-family: ${t.headingFont};
}
.markdown-content h2 { font-size: ${(t.bodySize * t.h2Scale).toFixed(1)}px; }
.markdown-content h3 { font-size: ${(t.bodySize * t.h3Scale).toFixed(1)}px; }
`.trim()
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
