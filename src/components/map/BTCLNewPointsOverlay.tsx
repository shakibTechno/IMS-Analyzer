// ─── BTCLNewPointsOverlay ─────────────────────────────────────────
// 24,142 BTCL network points from the latest Excel submission.
// Canvas-rendered, coloured by normalised point type.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type BTCLNewPointType = 'CP' | 'HH' | 'HOP' | 'POP' | 'MH' | 'Other'
export type BTCLNewTypeFilter = Set<BTCLNewPointType>

export const BTCL_NEW_COLORS: Record<BTCLNewPointType, string> = {
  CP:    '#f97316',
  HH:    '#06b6d4',
  HOP:   '#8b5cf6',
  POP:   '#22c55e',
  MH:    '#ef4444',
  Other: '#94a3b8',
}

interface Props {
  visible:    boolean
  typeFilter: BTCLNewTypeFilter
}

export default function BTCLNewPointsOverlay({ visible, typeFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || typeFilter.size === 0 || data) return
    fetch('/data/btcl-points-new.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BTCLNewPointsOverlay: fetch failed', err))
  }, [visible, typeFilter, data])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        typeFilter.has(f.properties?.point_type as BTCLNewPointType)
      ),
    }
  }, [data, typeFilter])

  const filterKey = [...typeFilter].sort().join(',')

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    const pt = String(_feat.properties?.point_type ?? 'Other') as BTCLNewPointType
    return L.circleMarker(latlng, {
      radius:      3,
      fillColor:   BTCL_NEW_COLORS[pt] ?? '#94a3b8',
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.85,
      renderer,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p     = feat.properties ?? {}
    const pt    = String(p.point_type ?? 'Other') as BTCLNewPointType
    const color = BTCL_NEW_COLORS[pt] ?? '#94a3b8'
    const name  = String(p.name ?? '—')
    const year  = p.year ? String(p.year) : '—'
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:180px;max-width:280px;">
        <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;
                    word-break:break-word;">${name}</div>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                     font-size:10px;font-weight:700;
                     background:${color}18;border:1px solid ${color}44;color:${color};
                     margin-bottom:5px;">${pt}</span>
        <div style="font-size:11px;color:#64748b;">Year: ${year}</div>
      </div>`, { maxWidth: 300, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${name.substring(0, 50)}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`btcl-new-${filterKey}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
