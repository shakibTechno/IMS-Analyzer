// ─── FiberNetworkPointsOverlay ────────────────────────────────────
// 19,096 multi-operator fiber nodes / waypoints parsed from KMZ.
// Canvas-rendered, coloured by operator.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'
import { FIBER_OP_COLORS, type FiberOp, type FiberOpFilter } from './FiberNetworkLinesOverlay'

interface Props {
  visible:  boolean
  opFilter: FiberOpFilter
}

export default function FiberNetworkPointsOverlay({ visible, opFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || data) return
    fetch('/data/fiber-points.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('FiberNetworkPointsOverlay: fetch failed', err))
  }, [visible, data])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        opFilter.has(String(f.properties?.operator ?? 'Unknown') as FiberOp)
      ),
    }
  }, [data, opFilter])

  const filterKey = [...opFilter].sort().join(',')

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    const op = String(_feat.properties?.operator ?? 'Unknown')
    return L.circleMarker(latlng, {
      radius:      2.5,
      fillColor:   FIBER_OP_COLORS[op] ?? '#94a3b8',
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.8,
      renderer,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p     = feat.properties ?? {}
    const op    = String(p.operator ?? '—')
    const color = FIBER_OP_COLORS[op] ?? '#94a3b8'
    const name  = String(p.name ?? '—')
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:180px;max-width:280px;">
        <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;
                    word-break:break-word;">${name}</div>
        <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                     font-size:10px;font-weight:700;
                     background:${color}18;border:1px solid ${color}44;color:${color};">
          ${op}
        </span>
      </div>`, { maxWidth: 300, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${name.substring(0, 50)}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`fiber-points-${filterKey}`}
      data={filtered}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
