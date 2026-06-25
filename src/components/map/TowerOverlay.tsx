// ─── TowerOverlay ─────────────────────────────────────────────────
// Generic tower-site overlay for MNO + TowerCo tower datasets.
// One instance per operator; fetch deferred until first shown.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

export type TowerOperatorKey =
  | 'gp' | 'robi' | 'bl' | 'tt'
  | 'edotco' | 'stl' | 'kbtl' | 'ftl'

export const TOWER_OPERATORS: Record<TowerOperatorKey, { label: string; color: string; group: 'mno' | 'towerco' }> = {
  gp:     { label: 'Grameenphone',      color: '#0066cc', group: 'mno' },
  robi:   { label: 'Robi',              color: '#e31837', group: 'mno' },
  bl:     { label: 'Banglalink',        color: '#f59e0b', group: 'mno' },
  tt:     { label: 'Teletalk',          color: '#16a34a', group: 'mno' },
  edotco: { label: 'edotco',            color: '#7c3aed', group: 'towerco' },
  stl:    { label: 'Summit Towers',     color: '#0891b2', group: 'towerco' },
  kbtl:   { label: 'Kirtonkhola (KBTL)', color: '#db2777', group: 'towerco' },
  ftl:    { label: 'Frontier Towers',   color: '#65a30d', group: 'towerco' },
}

interface Props {
  operator: TowerOperatorKey
  visible:  boolean
}

export default function TowerOverlay({ operator, visible }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)
  const { label, color } = TOWER_OPERATORS[operator]

  useEffect(() => {
    if (!visible || data) return
    fetch(`/data/tower-${operator}.geojson`)
      .then(r => r.json()).then(setData)
      .catch(err => console.warn(`TowerOverlay(${operator}): fetch failed`, err))
  }, [visible, data, operator])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    return L.circleMarker(latlng, {
      radius:      2.5,
      fillColor:   color,
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.85,
      renderer,
    })
  }, [renderer, color])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    const id      = String(p.id   ?? '') || '—'
    const type    = String(p.t    ?? '') || '—'
    const owner   = String(p.o    ?? '') || '—'
    const tenants = String(p.tn   ?? '') || '—'
    const thana   = String(p.th   ?? '') || '—'
    const dist    = String(p.dist ?? '') || '—'
    const div     = String(p.div  ?? '') || '—'
    const row = (key: string, val: string) =>
      `<tr>
        <td style="color:#94a3b8;font-weight:600;padding:2px 10px 2px 0;white-space:nowrap;vertical-align:top;">${key}</td>
        <td style="color:#1e293b;word-break:break-word;">${val}</td>
       </tr>`
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:200px;max-width:300px;">
        <div style="font-weight:700;color:${color};font-size:13px;margin-bottom:6px;
                    word-break:break-word;">${id}</div>
        <table style="border-collapse:collapse;width:100%;font-size:11px;">
          ${row('Operator', label)}
          ${row('Tower Type', type)}
          ${row('Owner', owner)}
          ${row('Tenants', tenants)}
          ${row('Thana', thana)}
          ${row('District', dist)}
          ${row('Division', div)}
        </table>
      </div>`, { maxWidth: 320, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${id}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [color, label])

  if (!visible || !data || data.features.length === 0) return null

  return (
    <GeoJSON
      key={`tower-${operator}`}
      data={data}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
