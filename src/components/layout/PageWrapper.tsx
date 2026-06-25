import type { ReactNode } from 'react'

interface Props {
  children:    ReactNode
  maxWidth?:   number | string   // defaults to unconstrained (full width)
  padding?:    string            // defaults to "20px 24px"
  noPadding?:  boolean           // true for full-bleed pages (map views)
}

// ─── PageWrapper ──────────────────────────────────────────────────
// Consistent scroll container + padding for all page content.
// Pages that embed Leaflet maps pass noPadding=true and handle their
// own layout since the map needs a height-constrained container.

export default function PageWrapper({ children, maxWidth, padding, noPadding }: Props) {
  return (
    <div style={{
      height: '100%',
      overflow: 'auto',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        maxWidth: maxWidth ?? undefined,
        margin: maxWidth ? '0 auto' : undefined,
        padding: noPadding ? 0 : (padding ?? '20px 24px'),
        minHeight: '100%',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
    </div>
  )
}
