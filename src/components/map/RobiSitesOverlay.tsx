// ─── RobiSitesOverlay ────────────────────────────────────────────────
// 18,838 Robi BTS sites coloured by backhaul type.
// MW only (13,760) → amber  Fiber only (1,632) → blue  Both (3,446) → purple

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type RobiTxType   = 'MW' | 'Fiber' | 'Both'
export type RobiTxFilter = Set<RobiTxType>

export const ROBI_TX_COLORS: Record<RobiTxType, string> = {
  MW:    '#f59e0b',
  Fiber: '#2563eb',
  Both:  '#8b5cf6',
}

const ROBI_TX_LABELS: Record<RobiTxType, string> = {
  MW:    'MW Connected',
  Fiber: 'Fiber Connected',
  Both:  'MW + Fiber',
}

interface Props {
  visible:   boolean
  txFilter:  RobiTxFilter
}

export default function RobiSitesOverlay({ visible, txFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || txFilter.size === 0 || data) return
    fetch('/data/robi-sites.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('RobiSitesOverlay: fetch failed', err))
  }, [visible, txFilter, data])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f => txFilter.has(f.properties?.tx as RobiTxType)),
    }
  }, [data, txFilter])

  const filterKey = [...txFilter].sort().join(',')

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    const tx = _feat.properties?.tx as RobiTxType
    return L.circleMarker(latlng, {
      radius:      2.5,
      fillColor:   ROBI_TX_COLORS[tx] ?? '#94a3b8',
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.85,
      renderer,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p        = feat.properties ?? {}
    const tx       = p.tx as RobiTxType
    const label    = ROBI_TX_LABELS[tx] ?? tx
    const name     = String(p.name     ?? '—')
    const division = String(p.division ?? '') || '—'
    const district = String(p.district ?? '') || '—'
    const upazila  = String(p.upazila  ?? '') || '—'
    const row = (key: string, val: string) =>
      `<tr>
        <td style="color:#94a3b8;font-weight:600;padding:2px 10px 2px 0;white-space:nowrap;">${key}</td>
        <td style="color:#1e293b;">${val}</td>
       </tr>`
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:200px;max-width:300px;">
        <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px;
                    word-break:break-word;">${name}</div>
        <table style="border-collapse:collapse;width:100%;font-size:11px;">
          ${row('Operator', 'Robi')}
          ${row('Backhaul', label)}
          ${row('Upazila',  upazila)}
          ${row('District', district)}
          ${row('Division', division)}
        </table>
      </div>`, { maxWidth: 320, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${name}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`robi-sites-${filterKey}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
