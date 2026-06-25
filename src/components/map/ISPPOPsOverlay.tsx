// ─── ISPPOPsOverlay ───────────────────────────────────────────────
// 12,310 licensed ISP Points of Presence (POPs) across Bangladesh.
// Single toggle — no sub-filters.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

const ISP_COLOR = '#059669'

interface Props {
  visible: boolean
}

export default function ISPPOPsOverlay({ visible }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || data) return
    fetch('/data/isp-pops.geojson')
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('ISPPOPsOverlay: fetch failed', err))
  }, [visible, data])

  const renderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

  const pointToLayer = useCallback((_feat: Feature, latlng: L.LatLng): L.Layer => {
    return L.circleMarker(latlng, {
      radius:      2.5,
      fillColor:   ISP_COLOR,
      color:       'white',
      weight:      0.5,
      fillOpacity: 0.85,
      renderer,
    })
  }, [renderer])

  const onEach = useCallback((feat: Feature, layer: L.Layer) => {
    const p    = feat.properties ?? {}
    const name = String(p.name  ?? '—')
    const type = String(p.type  ?? '—')
    const nttn = String(p.nttn  ?? '—')
    const row  = (k: string, v: string) =>
      `<tr>
         <td style="color:#94a3b8;font-weight:600;padding:2px 10px 2px 0;white-space:nowrap;">${k}</td>
         <td style="color:#1e293b;">${v}</td>
       </tr>`
    layer.bindPopup(`
      <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.5;
                  min-width:200px;max-width:300px;">
        <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px;
                    word-break:break-word;">${name}</div>
        <table style="border-collapse:collapse;width:100%;font-size:11px;">
          ${row('License Type', type)}
          ${row('NTTN Provider', nttn)}
        </table>
      </div>`, { maxWidth: 320, offset: L.point(0, -4) })
    layer.bindTooltip(
      `<span style="font:600 11px system-ui,sans-serif;color:#1e293b">${name}</span>`,
      { sticky: true, offset: [10, 0], opacity: 0.95 }
    )
  }, [])

  if (!visible || !data) return null

  return (
    <GeoJSON
      key="isp-pops"
      data={data}
      pointToLayer={pointToLayer}
      onEachFeature={onEach}
    />
  )
}
