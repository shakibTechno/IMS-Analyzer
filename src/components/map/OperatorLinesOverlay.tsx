// ─── OperatorLinesOverlay ────────────────────────────────────────────
// NTTN operator fiber routes along Bangladesh Railway tracks.
// 6 operators, 53 routes colour-coded by operator.

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export const OPR_COLOR: Record<string, string> = {
  '1': '#ef4444',  // Summit
  '2': '#3b82f6',  // Bahon
  '3': '#8b5cf6',  // Fiber@Home
  '4': '#f59e0b',  // Banglalink
  '5': '#10b981',  // Robi
  '6': '#06b6d4',  // Grameenphone
}

export const OPR_NAME: Record<string, string> = {
  '1': 'Summit',
  '2': 'Bahon',
  '3': 'Fiber@Home',
  '4': 'Banglalink',
  '5': 'Robi',
  '6': 'Grameenphone',
}

const OPR_FULL: Record<string, string> = {
  '1': 'Summit Communication Limited',
  '2': 'Bahon Limited',
  '3': 'Fiber @ Home Ltd',
  '4': 'Banglalink Digital Communication Ltd',
  '5': 'Robi Axiata PLC',
  '6': 'Grameenphone Limited',
}

function lineStyle(feature?: Feature): L.PathOptions {
  const code  = String(feature?.properties?.op_code ?? '1')
  const color = OPR_COLOR[code] ?? '#64748b'
  return {
    color,
    weight:  2.2,
    opacity: 0.85,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

function buildPopup(p: Record<string, unknown>): string {
  const code    = String(p.op_code ?? '1')
  const color   = OPR_COLOR[code]  ?? '#64748b'
  const opShort = OPR_NAME[code]   ?? '—'
  const opFull  = OPR_FULL[code]   ?? '—'
  const line    = (p.line_name  as string) ?? '—'
  const cores   = Number(p.total_core ?? 48)
  const year    = p.year ? String(p.year) : '—'
  const km      = Number(p.route_km ?? 0)

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:210px;max-width:270px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:3px">Railway Fiber Route</div>
      <div style="font-size:11px;color:#475569;margin-bottom:8px">${line}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;
                     border-radius:9999px;background:${color}18;border:1px solid ${color}55;
                     color:${color};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block"></span>
          ${opShort}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">NTTN</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Operator</span>
          <span style="font-weight:600;color:#374151">${opFull}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Route length</span>
          <span>${km > 0 ? km.toFixed(1) + ' km' : '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Fiber cores</span>
          <span>${cores} core</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Year</span>
          <span>${year}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Type</span>
          <span>Burial (Underground), Railway ROW</span>
        </div>
      </div>
    </div>`
}

// ── Component ─────────────────────────────────────────────────────────

interface Props {
  visible:    boolean
  opFilters:  Set<string>   // '1'..'6'
}

export default function OperatorLinesOverlay({ visible, opFilters }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || opFilters.size === 0 || data) return
    fetch('/data/opr-lines.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('OperatorLinesOverlay fetch failed', err))
  }, [visible, opFilters, data])

  const filtered = useMemo(() => {
    if (!data) return null
    return {
      ...data,
      features: data.features.filter(f =>
        opFilters.has(String(f.properties?.op_code))
      ),
    }
  }, [data, opFilters])

  const key = [...opFilters].sort().join(',')

  if (!visible || !filtered || filtered.features.length === 0) return null

  return (
    <GeoJSON
      key={`opr-lines-${key}`}
      data={filtered}
      style={lineStyle}
      onEachFeature={(feature, layer) =>
        layer.bindPopup(buildPopup(feature.properties ?? {}), { maxWidth: 280 })
      }
    />
  )
}
