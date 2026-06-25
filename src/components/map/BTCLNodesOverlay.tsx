// ─── BTCLNodesOverlay ─────────────────────────────────────────────
// 29,795 BTCL POP/node points, canvas-rendered for full-zoom performance.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Category helpers ─────────────────────────────────────────────
type NodeCat = 'hop' | 'hh' | 'cp' | 'mh'

export type BTCLNodeFilter = Set<NodeCat>

function categorize(pt: string): NodeCat {
  const t = (pt ?? '').trim()
  if (t === 'HOP' || t === 'Hop') return 'hop'
  if (t.startsWith('HH'))         return 'hh'
  if (t === 'CP' || t.startsWith('CP-')) return 'cp'
  if (t === 'MH')                 return 'mh'
  return 'hop'
}

const NODE_COLORS: Record<NodeCat, string> = {
  hop: '#0891b2',
  hh:  '#d97706',
  cp:  '#16a34a',
  mh:  '#dc2626',
}

// ── Popup ─────────────────────────────────────────────────────────
function buildPopup(p: Record<string, unknown>): string {
  const name  = String(p.pointname ?? '—')
  const type  = String(p.pointtype ?? '—')
  const div   = String(p.division  ?? '—')
  const dist  = String(p.district  ?? '—')
  const upz   = String(p.upazila   ?? '—')
  const year  = String(p.yyyy      ?? '—')
  const color = NODE_COLORS[categorize(type)]

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:200px;max-width:260px;">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:5px;">${name}</div>
      <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                   font-size:10px;font-weight:700;
                   background:${color}18;border:1px solid ${color}44;color:${color};
                   margin-bottom:7px;">${type}</span>
      <div style="border-top:1px solid #f1f5f9;margin:5px 0;"></div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Division</span>
          <span style="font-weight:500">${div}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">District</span>
          <span style="font-weight:500">${dist}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Upazila</span>
          <span style="font-weight:500">${upz}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Year</span>
          <span>${year}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Operator</span>
          <span style="font-weight:600;color:#374151">BTCL</span>
        </div>
      </div>
    </div>`
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  visible:    boolean
  nodeFilter: BTCLNodeFilter
}

export default function BTCLNodesOverlay({ visible, nodeFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || nodeFilter.size === 0 || data) return
    fetch('/data/btcl-nodes.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BTCLNodesOverlay: fetch failed', err))
  }, [visible, nodeFilter, data])

  // Single canvas renderer shared by all 30k markers
  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f => {
        const cat = categorize(String(f.properties?.pointtype ?? ''))
        return nodeFilter.has(cat)
      }),
    }
  }, [data, nodeFilter])

  const filterKey = [...nodeFilter].sort().join(',')

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng) => {
    const cat   = categorize(String(_feat.properties?.pointtype ?? ''))
    const color = NODE_COLORS[cat]
    return L.circleMarker(latlng, {
      renderer,
      radius:      2.5,
      color,
      fillColor:   color,
      fillOpacity: 0.75,
      weight:      0.5,
      opacity:     0.9,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    layer.bindPopup(buildPopup(p), { maxWidth: 280, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${p.pointname ?? ''}</span>
       <span style="font:400 10px system-ui,sans-serif;color:#64748b;margin-left:5px">${p.pointtype ?? ''}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`btcl-nodes-${filterKey}`}
      data={filtered}
      pointToLayer={pointToLayer as (feature: Feature, latlng: L.LatLng) => L.Layer}
      onEachFeature={onEach}
    />
  )
}
