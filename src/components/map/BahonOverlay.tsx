// ─── BahonOverlay ──────────────────────────────────────────────────
// Renders Bahon Limited's national fiber network.
// Lines  : 7,763 segments — click for core utilisation popup
// Points : 12,817 network nodes (zoom ≥ 12) — click for location card
//
// Cable-type colours:
//   OH  (Overhead)       — red     #dc2626  solid  1.8 px
//   UG  (Underground)    — brown   #78350f  dashed 1.8 px
//   WC  (Wall Clamped)   — amber   #d97706  solid  1.2 px
//   Other                — slate   #94a3b8  solid  1.0 px

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Style constants ──────────────────────────────────────────────

export const BAHON_COLOR    = '#dc2626'
const BAHON_UG_COLOR = '#78350f'
const BAHON_WC_COLOR = '#d97706'
const BAHON_OT_COLOR = '#94a3b8'

const CT_DISPLAY: Record<string, string> = {
  OH:    'Overhead',
  UG:    'Underground',
  WC:    'Wall Clamped',
  Other: 'Other',
}

const CT_COLOR: Record<string, string> = {
  OH:    BAHON_COLOR,
  UG:    BAHON_UG_COLOR,
  WC:    BAHON_WC_COLOR,
  Other: BAHON_OT_COLOR,
}

// Badge colours (bg / border / text)
const CT_BADGE: Record<string, { bg: string; bd: string; tx: string }> = {
  OH:    { bg: 'rgba(6,182,212,0.08)',   bd: 'rgba(6,182,212,0.3)',   tx: '#0e7490' },
  UG:    { bg: 'rgba(120,53,15,0.08)',   bd: 'rgba(120,53,15,0.3)',   tx: '#78350f' },
  WC:    { bg: 'rgba(217,119,6,0.08)',   bd: 'rgba(217,119,6,0.3)',   tx: '#b45309' },
  Other: { bg: 'rgba(148,163,184,0.1)',  bd: 'rgba(148,163,184,0.3)', tx: '#64748b' },
}

// ── Helpers ──────────────────────────────────────────────────────

function fmtLength(m: number): string {
  if (!m) return '—'
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`
}

// ── Line style ───────────────────────────────────────────────────

function lineStyle(feature?: Feature): L.PathOptions {
  const ct = (feature?.properties?.ct as string) ?? 'Other'
  return {
    color:     CT_COLOR[ct] ?? BAHON_OT_COLOR,
    weight:    ct === 'OH' ? 1.8 : ct === 'UG' ? 1.8 : ct === 'WC' ? 1.2 : 1.0,
    opacity:   ct === 'WC' ? 0.65 : 0.82,
    dashArray: undefined,
    lineCap:   'round',
    lineJoin:  'round',
  }
}

// ── Popup builders ───────────────────────────────────────────────

function buildLinePopup(p: Record<string, unknown>): string {
  const ct   = (p.ct  as string) ?? 'Other'
  const a    = (p.a   as string) ?? ''
  const b    = (p.b   as string) ?? ''
  const div  = (p.div as string) ?? ''
  const dist = (p.dist as string) ?? ''
  const cn   = Number(p.cn  ?? 0)
  const cu   = Number(p.cu  ?? 0)
  const pct  = Number(p.pct ?? 0)
  const m    = Number(p.m   ?? 0)

  const badge  = CT_BADGE[ct]  ?? CT_BADGE.Other
  const color  = CT_COLOR[ct]  ?? BAHON_OT_COLOR
  const ctName = CT_DISPLAY[ct] ?? ct
  const barClr = pct > 60 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#22c55e'

  const routeRow = (a || b)
    ? `<div style="display:flex;gap:6px">
         <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Route</span>
         <span style="overflow:hidden;text-overflow:ellipsis">${a || '—'} → ${b || '—'}</span>
       </div>`
    : ''

  const locationRow = (dist || div)
    ? `<div style="display:flex;gap:6px">
         <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Location</span>
         <span>${[dist, div].filter(Boolean).join(', ')}</span>
       </div>`
    : ''

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:185px;max-width:240px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px">${ctName} Cable</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${badge.bg};border:1px solid ${badge.bd};
                     color:${badge.tx};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>
          ${ct}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">Bahon Ltd</span>
      </div>
      <div style="height:4px;background:#e2e8f0;border-radius:2px;margin-bottom:7px">
        <div style="height:4px;width:${pct}%;background:${barClr};border-radius:2px"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        ${routeRow}
        ${locationRow}
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Cores</span>
          <span>${cn} total / ${cu} in use (${pct}%)</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Length</span>
          <span>${fmtLength(m)}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:${BAHON_COLOR};font-weight:600">Bahon Limited</span>
        </div>
      </div>
    </div>`
}

function buildPointPopup(
  nm: string, dist: string, div: string,
  lat: number, lng: number,
): string {
  const coordStr = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  const title    = nm || 'Network Node'
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:185px;max-width:230px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${title}">
        ${title}
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:rgba(6,182,212,0.08);
                     border:1px solid rgba(6,182,212,0.3);
                     color:#0e7490;font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:#16a34a;display:inline-block;flex-shrink:0"></span>
          Node
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">Bahon Ltd</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">District</span>
          <span>${dist || '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Division</span>
          <span>${div || '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Coords</span>
          <span style="font-family:monospace;font-size:10px;font-variant-numeric:tabular-nums">${coordStr}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:${BAHON_COLOR};font-weight:600">Bahon Limited</span>
        </div>
      </div>
    </div>`
}

// ── Event handlers ───────────────────────────────────────────────

function onEachLine(feature: Feature, layer: L.Layer) {
  layer.bindPopup(buildLinePopup(feature.properties ?? {}), { maxWidth: 250 })
}

// ── Component ────────────────────────────────────────────────────

interface Props {
  visible:     boolean
  lineFilters: Set<string>   // 'OH' | 'UG' | 'WC'
  showNodes:   boolean
}

export default function BahonOverlay({ visible, lineFilters, showNodes }: Props) {
  const [lines,  setLines]  = useState<FeatureCollection | null>(null)
  const [points, setPoints] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || lineFilters.size === 0) return
    if (!lines) fetch('/data/bahon-lines.geojson')
      .then(r => r.json()).then(setLines)
      .catch(err => console.warn('BahonOverlay lines failed', err))
    if (!points) fetch('/data/bahon-points.geojson')
      .then(r => r.json()).then(setPoints)
      .catch(err => console.warn('BahonOverlay points failed', err))
  }, [visible, lineFilters, lines, points])

  const filteredLines = useMemo(() => {
    if (!lines) return null
    return {
      ...lines,
      features: lines.features.filter(f => lineFilters.has(f.properties?.ct ?? 'Other')),
    }
  }, [lines, lineFilters])

  const lineKey = [...lineFilters].sort().join(',')

  if (!visible) return null

  return (
    <>
      {/* Network nodes — rendered first so lines draw on top */}
      {showNodes && points && (
        <GeoJSON
          key="bahon-points"
          data={points}
          pointToLayer={(feature, latlng) => {
            const nm   = (feature.properties?.nm   as string) ?? ''
            const dist = (feature.properties?.dist as string) ?? ''
            const div  = (feature.properties?.div  as string) ?? ''
            const marker = L.circleMarker(latlng, {
              radius:      4,
              color:       'white',
              weight:      1.2,
              fillColor:   '#16a34a',
              fillOpacity: 0.9,
              opacity:     0.9,
              interactive: true,
            })
            marker.bindPopup(
              buildPointPopup(nm, dist, div, latlng.lat, latlng.lng),
              { maxWidth: 240, offset: L.point(0, -6) }
            )
            return marker
          }}
        />
      )}

      {/* Lines — rendered last so they sit on top of nodes */}
      {filteredLines && filteredLines.features.length > 0 && (
        <GeoJSON
          key={`bahon-lines-${lineKey}`}
          data={filteredLines}
          style={lineStyle}
          onEachFeature={onEachLine}
        />
      )}
    </>
  )
}
