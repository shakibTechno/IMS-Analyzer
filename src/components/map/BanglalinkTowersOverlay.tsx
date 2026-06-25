// ─── BanglalinkTowersOverlay ─────────────────────────────────────────
// 13,208 Banglalink tower sites (2G/3G/4G), colour-coded by generation.
// Zoom-gated: renders at zoom ≥ 8 only.

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import L from 'leaflet'

// ── Zoom hook ─────────────────────────────────────────────────────
function useZoom(): number {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useEffect(() => {
    const h = () => setZoom(map.getZoom())
    map.on('zoomend', h)
    return () => { map.off('zoomend', h) }
  }, [map])
  return zoom
}

// ── Generation colour ─────────────────────────────────────────────
function genColor(f3g: unknown, f4g: unknown): string {
  if (f4g === 1) return '#2563eb'   // has 4G → blue
  if (f3g === 1) return '#16a34a'   // 3G only → green
  return '#dc2626'                  // 2G only → red
}

// ── Generation badges HTML ────────────────────────────────────────
function genBadges(f2g: unknown, f3g: unknown, f4g: unknown): string {
  const badge = (label: string, active: boolean, color: string) =>
    `<span style="
      display:inline-flex;align-items:center;padding:1px 7px;
      border-radius:9999px;font-size:10px;font-weight:700;
      background:${active ? color + '18' : '#f1f5f9'};
      border:1px solid ${active ? color + '66' : '#e2e8f0'};
      color:${active ? color : '#94a3b8'};
    ">${label}</span>`
  return [
    badge('2G', f2g === 1, '#dc2626'),
    badge('3G', f3g === 1, '#16a34a'),
    badge('4G', f4g === 1, '#2563eb'),
  ].join('')
}

// ── Card popup ────────────────────────────────────────────────────
function buildPopup(p: Record<string, unknown>): string {
  const sitecode  = String(p.sitecode  ?? '—')
  const sitetype  = String(p.sitetype  ?? '—')
  const locname   = String(p.locname   ?? '—')
  const division  = String(p.division  ?? '—')
  const district  = String(p.district  ?? '—')
  const upazila   = String(p.upazila   ?? '—')
  const union_    = String(p.union     ?? '—')
  const vendor    = String(p.vendor    ?? '—')
  const yyyy      = String(p.yyyy      ?? '—')
  const color     = genColor(p.f3g, p.f4g)

  const siteTypeColor =
    sitetype === 'Macro'      ? '#1d4ed8' :
    sitetype === 'IBS'        ? '#7c3aed' :
    sitetype === 'Micro'      ? '#0891b2' : '#64748b'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:230px;max-width:280px;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;
                  gap:8px;margin-bottom:6px;">
        <div>
          <div style="font-weight:700;color:#1e293b;font-size:13px;line-height:1.3">
            ${locname !== '—' ? locname : sitecode}
          </div>
          <div style="font-size:10px;color:#64748b;margin-top:1px">${sitecode}</div>
        </div>
        <span style="flex-shrink:0;display:inline-flex;align-items:center;padding:2px 8px;
                     border-radius:9999px;font-size:10px;font-weight:700;
                     background:${siteTypeColor}18;border:1px solid ${siteTypeColor}44;
                     color:${siteTypeColor};white-space:nowrap;">
          ${sitetype}
        </span>
      </div>

      <!-- Generation badges -->
      <div style="display:flex;gap:4px;margin-bottom:8px;">
        ${genBadges(p.f2g, p.f3g, p.f4g)}
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f1f5f9;margin-bottom:7px;"></div>

      <!-- Location details -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;
                  margin-bottom:7px;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Division</span>
          <span style="font-weight:500;color:#334155">${division}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">District</span>
          <span style="font-weight:500;color:#334155">${district}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Upazila</span>
          <span>${upazila}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Union</span>
          <span>${union_}</span>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top:1px solid #f1f5f9;margin-bottom:7px;"></div>

      <!-- Technical details -->
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Vendor</span>
          <span style="word-break:break-word">${vendor}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Est. year</span>
          <span>${yyyy}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:56px;flex-shrink:0;">Operator</span>
          <span style="font-weight:600;color:#374151">
            <span style="display:inline-block;width:7px;height:7px;border-radius:50%;
                         background:${color};margin-right:4px;vertical-align:middle;"></span>
            Banglalink
          </span>
        </div>
      </div>
    </div>`
}

// ── Filter helpers ────────────────────────────────────────────────
export type BLGenFilter = Set<'4G' | '3G' | '2G'>

function passesFilter(p: Record<string, unknown>, genFilter: BLGenFilter): boolean {
  if (genFilter.has('4G') && p.f4g === 1) return true
  if (genFilter.has('3G') && p.f3g === 1 && p.f4g !== 1) return true
  if (genFilter.has('2G') && p.f3g !== 1 && p.f4g !== 1) return true
  return false
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  visible:   boolean
  genFilter: BLGenFilter
}

export default function BanglalinkTowersOverlay({ visible, genFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)
  const zoom = useZoom()

  useEffect(() => {
    if (!visible || genFilter.size === 0 || data) return
    fetch('/data/bl-towers.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BanglalinkTowersOverlay: fetch failed', err))
  }, [visible, genFilter, data])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        passesFilter(f.properties ?? {}, genFilter)
      ),
    }
  }, [data, genFilter])

  const filterKey = [...genFilter].sort().join(',')

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`bl-towers-${filterKey}`}
      data={filtered}
      pointToLayer={(feat, latlng) => {
        const p     = feat.properties ?? {}
        const color = genColor(p.f3g, p.f4g)
        const r     = zoom >= 12 ? 5 : zoom >= 10 ? 4 : 3
        const marker = L.circleMarker(latlng, {
          radius:      r,
          color:       'white',
          weight:      1,
          fillColor:   color,
          fillOpacity: 0.88,
          opacity:     1,
          interactive: true,
        })
        marker.bindPopup(buildPopup(p), {
          maxWidth:   300,
          className:  'bl-tower-popup',
          offset:     L.point(0, -4),
        })
        return marker
      }}
    />
  )
}
