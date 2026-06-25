// ─── BTCLUnionOverlay ─────────────────────────────────────────────
// 966 union-level BTCL project rollout locations, coloured by division.

import { useState, useEffect, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Division colours ─────────────────────────────────────────────
const DIV_COLORS: Record<string, string> = {
  Barisal:    '#0ea5e9',
  Chittagong: '#f59e0b',
  Khulna:     '#10b981',
  Dhaka:      '#6366f1',
  Rajshahi:   '#f97316',
  Sylhet:     '#8b5cf6',
  Rangpur:    '#06b6d4',
  Mymensingh: '#ec4899',
}

function divColor(division: string): string {
  return DIV_COLORS[division] ?? '#64748b'
}

// ── Popup ─────────────────────────────────────────────────────────
function buildPopup(p: Record<string, unknown>): string {
  const union    = String(p.union    ?? '—')
  const thana    = String(p.thana    ?? '—')
  const district = String(p.district ?? '—')
  const division = String(p.division ?? '—')
  const lat      = Number(p.latitude  ?? 0)
  const lon      = Number(p.longitude ?? 0)
  const color    = divColor(division)

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                min-width:200px;max-width:260px;">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px;">${union} Union</div>
      <span style="display:inline-flex;align-items:center;padding:2px 8px;border-radius:9999px;
                   font-size:10px;font-weight:700;
                   background:${color}18;border:1px solid ${color}44;color:${color};
                   margin-bottom:7px;">${division}</span>
      <div style="border-top:1px solid #f1f5f9;margin:5px 0;"></div>
      <div style="display:flex;flex-direction:column;gap:3px;font-size:11px;color:#475569;">
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Thana</span>
          <span style="font-weight:500">${thana}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">District</span>
          <span style="font-weight:500">${district}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Division</span>
          <span style="font-weight:500">${division}</span>
        </div>
        <div style="border-top:1px solid #f1f5f9;margin:3px 0;"></div>
        <div style="display:flex;gap:6px;">
          <span style="color:#94a3b8;min-width:70px;flex-shrink:0;">Coordinates</span>
          <span style="font-size:10px;color:#64748b">${lat.toFixed(5)}, ${lon.toFixed(5)}</span>
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
  visible: boolean
}

export default function BTCLUnionOverlay({ visible }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || data) return
    fetch('/data/btcl-union-locations.geojson?v=1')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('BTCLUnionOverlay: fetch failed', err))
  }, [visible, data])

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng) => {
    const division = String(_feat.properties?.division ?? '')
    const color    = divColor(division)
    return L.circleMarker(latlng, {
      radius:      5,
      color:       color,
      fillColor:   color,
      fillOpacity: 0.82,
      weight:      1.2,
      opacity:     1,
    })
  }, [])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p = feat.properties ?? {}
    layer.bindPopup(buildPopup(p), { maxWidth: 280, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${p.union ?? ''} Union</span>
       <span style="font:400 10px system-ui,sans-serif;color:#64748b;margin-left:5px">${p.thana ?? ''}, ${p.district ?? ''}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !data) return null

  return (
    <GeoJSON
      key="btcl-union-locations"
      data={data}
      pointToLayer={pointToLayer as (feature: Feature, latlng: L.LatLng) => L.Layer}
      onEachFeature={onEach}
    />
  )
}
