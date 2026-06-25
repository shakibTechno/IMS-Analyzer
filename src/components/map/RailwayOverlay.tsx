// ─── RailwayOverlay ────────────────────────────────────────────────
// Renders Bangladesh railway network from bd-railways.geojson.
// Colour-coded by gauge type:
//   Meter gauge single  — amber   #b45309
//   Broad gauge single  — navy    #1e3a8a
//   Broad gauge double  — purple  #6d28d9  (thicker weight)

import { useState, useEffect } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

const GAUGE_COLOR: Record<string, string> = {
  'Meter gauge single': '#78350f',
  'Broad gauge single': '#1e1b4b',
  'Broad gauge double': '#4c1d95',
}
const GAUGE_WEIGHT: Record<string, number> = {
  'Meter gauge single': 2.5,
  'Broad gauge single': 3.2,
  'Broad gauge double': 4.0,
}
const DEFAULT_COLOR  = '#1c1917'
const DEFAULT_WEIGHT = 2.5

function lineStyle(feature?: Feature): L.PathOptions {
  const gauge = (feature?.properties?.gauge as string) ?? ''
  return {
    color:   GAUGE_COLOR[gauge]  ?? DEFAULT_COLOR,
    weight:  GAUGE_WEIGHT[gauge] ?? DEFAULT_WEIGHT,
    opacity: 0.9,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

function buildPopup(props: Record<string, unknown>): string {
  const gauge  = (props.gauge  as string) ?? '—'
  const lenKm  = Number(props.len_km ?? 0).toFixed(2)
  const name   = (props.name   as string) ?? ''
  const color  = GAUGE_COLOR[gauge] ?? DEFAULT_COLOR

  const nameRow = name ? `
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px">Line</span>
          <span style="font-weight:600;color:#374151">${name}</span>
        </div>` : ''

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:170px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px">Railway Line</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${color}18;border:1px solid ${color}55;
                     color:${color};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block"></span>
          ${gauge}
        </span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        ${nameRow}
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px">Length</span>
          <span>${lenKm} km</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px">Network</span>
          <span style="font-weight:600;color:#374151">Bangladesh Railway</span>
        </div>
      </div>
    </div>`
}

function onEachFeature(feature: Feature, layer: L.Layer) {
  layer.bindPopup(buildPopup(feature.properties ?? {}), { maxWidth: 240 })
}

interface Props { visible: boolean }

export default function RailwayOverlay({ visible }: Props) {
  const [data, setData] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible) return
    fetch('/data/bd-railways.geojson')
      .then(r => r.json())
      .then(setData)
      .catch(err => console.warn('RailwayOverlay: failed to load', err))
  }, [visible])

  if (!visible || !data) return null

  return (
    <GeoJSON
      key="railways"
      data={data}
      style={lineStyle}
      onEachFeature={onEachFeature}
    />
  )
}

// Export colors for legend / panel use
export { GAUGE_COLOR }
