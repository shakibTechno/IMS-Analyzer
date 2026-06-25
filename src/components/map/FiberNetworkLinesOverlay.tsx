// ─── FiberNetworkLinesOverlay ─────────────────────────────────────
// 8,163 multi-operator fiber line segments parsed from KMZ.
// Coloured by operator: GP/Robi/BTCL/BL/MOTN/BSCCL/Unknown.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type FiberOp = 'GP' | 'Robi' | 'BTCL' | 'BL' | 'MOTN' | 'BSCCL' | 'Unknown'
export type FiberOpFilter = Set<FiberOp>

export const FIBER_OP_COLORS: Record<string, string> = {
  GP:      '#e11d48',
  Robi:    '#ea580c',
  BTCL:    '#0891b2',
  BL:      '#f59e0b',
  MOTN:    '#8b5cf6',
  BSCCL:   '#10b981',
  Unknown: '#94a3b8',
}

function lineStyle(feature?: Feature): L.PathOptions {
  const op = String(feature?.properties?.operator ?? 'Unknown')
  return {
    color:   FIBER_OP_COLORS[op] ?? '#94a3b8',
    weight:  1.6,
    opacity: 0.8,
    lineCap: 'round',
    lineJoin:'round',
  }
}

function buildPopup(p: Record<string, unknown>): string {
  const name = String(p.name     ?? '—')
  const op   = String(p.operator ?? '—')
  const dist = p.dist_km != null ? `${Number(p.dist_km).toFixed(2)} km` : '—'
  const color = FIBER_OP_COLORS[op] ?? '#94a3b8'

  // Split "Origin - Destination (X Km)" into parts
  const match = name.match(/^(.+?)\s*-\s*(.+?)\s*\(/)
  const origin = match ? match[1].trim() : name
  const dest   = match ? match[2].trim() : '—'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:220px;max-width:300px;">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;
                  word-break:break-word;">${name}</div>
      <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                   font-size:10px;font-weight:700;
                   background:${color}18;border:1px solid ${color}44;color:${color};
                   margin-bottom:7px;">${op}</span>
      <div style="border-top:1px solid #f1f5f9;margin:5px 0;"></div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">From</span>
          <span style="font-weight:500;word-break:break-word">${origin}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">To</span>
          <span style="font-weight:500;word-break:break-word">${dest}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:68px;flex-shrink:0;">Distance</span>
          <span>${dist}</span>
        </div>
      </div>
    </div>`
}

interface Props {
  visible:   boolean
  opFilter:  FiberOpFilter
}

export default function FiberNetworkLinesOverlay({ visible, opFilter }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || data) return
    fetch('/data/fiber-lines.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('FiberNetworkLinesOverlay: fetch failed', err))
  }, [visible, data])

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

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    layer.bindPopup(buildPopup(p), { maxWidth: 320, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${String(p.name ?? '').substring(0, 60)}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`fiber-lines-${filterKey}`}
      data={filtered}
      style={lineStyle as () => L.PathOptions}
      onEachFeature={onEach}
    />
  )
}
