// ─── OPGWOverlay ───────────────────────────────────────────────────
// Renders the Bangladesh Power Grid OPGW transmission network.
//
// Line colours by type:
//   400 kV T/L  — yellow  (#eab308)
//   230 kV T/L  — green   (#16a34a)
//   132 kV T/L  — orange  (#f97316)
//   UG Cable    — blue    (#3b82f6)
//   Others      — slate   (#64748b)

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON, CircleMarker } from 'react-leaflet'
import type { FeatureCollection, Feature, LineString, MultiLineString } from 'geojson'
import L from 'leaflet'

// ── Colour map ────────────────────────────────────────────────────

function layerColor(layer: string): string {
  if (layer.includes('400kV')) return '#dc2626'
  if (layer.includes('230kV')) return '#16a34a'
  if (layer.includes('132kV')) return '#f97316'
  if (layer === 'UG Cable')    return '#3b82f6'
  return '#eab308'
}

// Map a raw layer string to a filter key
function filterKey(layer: string): string {
  if (layer.includes('400kV')) return '400kV'
  if (layer.includes('230kV')) return '230kV'
  if (layer.includes('132kV')) return '132kV'
  if (layer === 'UG Cable')    return 'UG'
  return 'other'
}

// ── Line style ────────────────────────────────────────────────────

function lineStyle(feature?: Feature): L.PathOptions {
  const layer = (feature?.properties?.layer as string) ?? ''
  const color = layerColor(layer)

  let weight  = 1.5
  let opacity = 0.85

  if (layer.includes('400kV'))         { weight = 2.8 }
  else if (layer.includes('230kV'))    { weight = 2.2 }
  else if (layer.includes('132kV'))    { weight = 1.8 }
  else if (layer === 'UG Cable')       { weight = 1.5; opacity = 0.75 }
  else if (layer.startsWith('PS Con')) { weight = 1.2; opacity = 0.6 }

  return { color, weight, opacity, lineCap: 'round', lineJoin: 'round', interactive: false }
}

// ── Endpoint extraction ───────────────────────────────────────────

interface Endpoint {
  pos:   [number, number]
  color: string
}

function extractEndpoints(features: Feature[]): Endpoint[] {
  const pts: Endpoint[] = []
  for (const f of features) {
    const layer = (f.properties?.layer as string) ?? ''
    const color = layerColor(layer)
    const geom  = f.geometry
    if (!geom) continue
    if (geom.type === 'LineString') {
      const coords = (geom as LineString).coordinates
      if (coords.length >= 2) {
        pts.push({ pos: [coords[0][1],                 coords[0][0]],                 color })
        pts.push({ pos: [coords[coords.length-1][1],   coords[coords.length-1][0]],   color })
      }
    } else if (geom.type === 'MultiLineString') {
      for (const line of (geom as MultiLineString).coordinates) {
        if (line.length >= 2) {
          pts.push({ pos: [line[0][1],             line[0][0]],             color })
          pts.push({ pos: [line[line.length-1][1], line[line.length-1][0]], color })
        }
      }
    }
  }
  return pts
}

// ── Component ─────────────────────────────────────────────────────

interface Props {
  visible:     boolean
  lineFilters: Set<string>   // '400kV' | '230kV' | '132kV' | 'UG' | 'other'
}

export default function OPGWOverlay({ visible, lineFilters }: Props) {
  const [geo, setGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || lineFilters.size === 0 || geo) return
    fetch('/data/opgw-lines.geojson')
      .then(r => r.json())
      .then(setGeo)
      .catch(err => console.warn('OPGWOverlay: GeoJSON failed', err))
  }, [visible, lineFilters, geo])

  const filtered = useMemo(() => {
    if (!geo) return null
    return {
      ...geo,
      features: geo.features.filter(f =>
        lineFilters.has(filterKey((f.properties?.layer as string) ?? ''))
      ),
    }
  }, [geo, lineFilters])

  const endpoints = useMemo(
    () => (filtered ? extractEndpoints(filtered.features) : []),
    [filtered]
  )

  const lineKey = [...lineFilters].sort().join(',')

  if (!visible || !filtered) return null

  return (
    <>
      <GeoJSON
        key={`opgw-lines-${lineKey}`}
        data={filtered}
        style={lineStyle}
      />
      {endpoints.map((ep, i) => (
        <CircleMarker
          key={`ep-${i}`}
          center={ep.pos}
          radius={3}
          pathOptions={{
            color: 'white', weight: 1.5,
            fillColor: ep.color, fillOpacity: 1,
            opacity: 0.9, interactive: false,
          }}
        />
      ))}
    </>
  )
}
