// ─── IS3Overlay ────────────────────────────────────────────────────
// Renders FHL's Info Sarker-3 (IS3) rural fiber network.
// Lines  : 3,383 segments, clickable popup with core type + name + length
// Points : 477 endpoint nodes, clickable popup with coordinates
//
// Core-type colours:
//   48 Core   — red     (#dc2626)  2.5 px solid
//   24 Core   — teal    (#0d9488)  1.8 px solid
//   12 Core   — amber   (#ca8a04)  1.2 px solid
//   Messenger — fuchsia (#c026d3)  1.5 px dashed
//   Ring      — green   (#16a34a)  1.4 px dashed
//   CBD       — indigo  (#4f46e5)  1.2 px solid
//   Other     — slate   (#64748b)  1.0 px

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Style constants ──────────────────────────────────────────────

export const IS3_COLORS: Record<string, string> = {
  '48':   '#dc2626',
  '24':   '#0d9488',
  '12':   '#ca8a04',
  'msg':  '#c026d3',
  'ring': '#16a34a',
  'cbd':  '#4f46e5',
  'other':'#64748b',
}

const CORE_DISPLAY: Record<string, string> = {
  '48':   '48 Core',
  '24':   '24 Core',
  '12':   '12 Core',
  'msg':  'Messenger',
  'ring': 'Ring Protection',
  'cbd':  'CBD Duct',
  'other':'Other',
}

const CORE_BADGE: Record<string, { bg: string; bd: string; tx: string }> = {
  '48':   { bg: 'rgba(220,38,38,0.08)',   bd: 'rgba(220,38,38,0.3)',   tx: '#991b1b' },
  '24':   { bg: 'rgba(13,148,136,0.08)',  bd: 'rgba(13,148,136,0.3)',  tx: '#0f766e' },
  '12':   { bg: 'rgba(202,138,4,0.08)',   bd: 'rgba(202,138,4,0.3)',   tx: '#92400e' },
  'msg':  { bg: 'rgba(192,38,211,0.08)',  bd: 'rgba(192,38,211,0.3)',  tx: '#86198f' },
  'ring': { bg: 'rgba(22,163,74,0.08)',   bd: 'rgba(22,163,74,0.3)',   tx: '#15803d' },
  'cbd':  { bg: 'rgba(79,70,229,0.08)',   bd: 'rgba(79,70,229,0.3)',   tx: '#3730a3' },
  'other':{ bg: 'rgba(100,116,132,0.08)', bd: 'rgba(100,116,132,0.3)', tx: '#475569' },
}

// ── Line style ───────────────────────────────────────────────────

function lineStyle(feature?: Feature): L.PathOptions {
  const cores = (feature?.properties?.cores as string) ?? 'other'
  const color = IS3_COLORS[cores] ?? IS3_COLORS.other

  let weight    = 1.0
  let dashArray: string | undefined
  let opacity   = 0.80

  switch (cores) {
    case '48':   weight = 2.5;                                    break
    case '24':   weight = 1.8;                                    break
    case '12':   weight = 1.2; opacity = 0.78;                    break
    case 'msg':  weight = 1.5; opacity = 0.75; break
    case 'ring': weight = 1.4; opacity = 0.85; break
    case 'cbd':  weight = 1.2;                                    break
    default:     weight = 1.0; opacity = 0.55;
  }

  return { color, weight, opacity, dashArray, lineCap: 'round', lineJoin: 'round' }
}

// ── Popup builders ───────────────────────────────────────────────

function buildLinePopup(p: Record<string, unknown>): string {
  const cores  = (p.cores  as string) ?? 'other'
  const name   = (p.name   as string) ?? ''
  const layer  = (p.layer  as string) ?? ''
  const len_km = Number(p.len_km ?? 0)

  const color   = IS3_COLORS[cores]   ?? IS3_COLORS.other
  const badge   = CORE_BADGE[cores]   ?? CORE_BADGE.other
  const display = CORE_DISPLAY[cores] ?? 'Other'
  const lenStr  = len_km > 0 ? `${len_km.toFixed(2)} km` : '—'

  const routeName  = (name && name !== 'Untitled Path' && name !== 'Placemark') ? name : ''
  const layerClean = layer.replace(/^IS3_[A-Za-z]+_/, '')

  const nameRow = routeName
    ? `<div style="display:flex;gap:6px">
         <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Route</span>
         <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${routeName}</span>
       </div>`
    : ''

  const layerRow = layerClean
    ? `<div style="display:flex;gap:6px">
         <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Layer</span>
         <span>${layerClean}</span>
       </div>`
    : ''

  const coreTag = cores === 'msg' ? 'MSG' : cores === 'ring' ? 'RING' : cores === 'cbd' ? 'CBD' : `${cores.toUpperCase()}F`

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:185px;max-width:240px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px">${display}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${badge.bg};border:1px solid ${badge.bd};
                     color:${badge.tx};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>
          ${coreTag}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">InfoSarkar-3</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        ${nameRow}
        ${layerRow}
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Length</span>
          <span>${lenStr}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:#7c3aed;font-weight:600">InfoSarkar-3</span>
        </div>
      </div>
    </div>`
}

function buildPointPopup(nm: string, lat: number, lng: number): string {
  const title    = nm || 'Network Node'
  const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:185px;max-width:230px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${title}">
        ${title}
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:rgba(124,58,237,0.08);
                     border:1px solid rgba(124,58,237,0.3);
                     color:#6d28d9;font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:#7c3aed;display:inline-block;flex-shrink:0"></span>
          Node
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">InfoSarkar-3</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Coords</span>
          <span style="font-family:monospace;font-size:10px;font-variant-numeric:tabular-nums">${coordStr}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:#7c3aed;font-weight:600">InfoSarkar-3</span>
        </div>
      </div>
    </div>`
}

function onEachLine(feature: Feature, layer: L.Layer) {
  layer.bindPopup(buildLinePopup(feature.properties ?? {}), { maxWidth: 250 })
}

// ── Component ────────────────────────────────────────────────────

interface Props {
  visible:     boolean
  lineFilters: Set<string>   // '48' | '24' | '12' | 'msg' | 'ring' | 'cbd' | 'other'
  showNodes:   boolean
}

export default function IS3Overlay({ visible, lineFilters, showNodes }: Props) {
  const [lines,  setLines]  = useState<FeatureCollection | null>(null)
  const [points, setPoints] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || (lineFilters.size === 0 && !showNodes)) return
    if (!lines) fetch('/data/is3-lines.geojson')
      .then(r => r.json()).then(setLines)
      .catch(err => console.warn('IS3Overlay lines failed', err))
    if (!points) fetch('/data/is3-points.geojson')
      .then(r => r.json()).then(setPoints)
      .catch(err => console.warn('IS3Overlay points failed', err))
  }, [visible, lineFilters, showNodes, lines, points])

  const filteredLines = useMemo(() => {
    if (!lines) return null
    return {
      ...lines,
      features: lines.features.filter(f => lineFilters.has(f.properties?.cores ?? 'other')),
    }
  }, [lines, lineFilters])

  const lineKey = [...lineFilters].sort().join(',')

  if (!visible) return null

  return (
    <>
      {filteredLines && filteredLines.features.length > 0 && (
        <GeoJSON
          key={`is3-lines-${lineKey}`}
          data={filteredLines}
          style={lineStyle}
          onEachFeature={onEachLine}
        />
      )}

      {showNodes && points && (
        <GeoJSON
          key="is3-points"
          data={points}
          pointToLayer={(feature, latlng) => {
            const nm = (feature.properties?.nm as string) ?? ''
            const marker = L.circleMarker(latlng, {
              radius:      4,
              color:       'white',
              weight:      1.2,
              fillColor:   '#7c3aed',
              fillOpacity: 0.9,
              opacity:     0.9,
              interactive: true,
            })
            marker.bindPopup(
              buildPointPopup(nm, latlng.lat, latlng.lng),
              { maxWidth: 240, offset: L.point(0, -6) }
            )
            return marker
          }}
        />
      )}
    </>
  )
}
