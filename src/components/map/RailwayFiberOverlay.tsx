// ─── RailwayFiberOverlay ────────────────────────────────────────────
// Bangladesh Railway NTTN fiber network (BTRC/LI/NTTN-435, Railway/2014-5).
// 363 station-to-station segments, 361 unique station nodes.
// Colour-coded by total fiber core count.

import { useState, useEffect, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Colors ───────────────────────────────────────────────────────────
export const BR_CORE_COLOR: Record<string, string> = {
  '8':  '#94a3b8',
  '16': '#64748b',
  '32': '#0d9488',
  '48': '#2563eb',
  '72': '#ea580c',
  '96': '#7c3aed',
}

const BR_CORE_WEIGHT: Record<string, number> = {
  '8':  1.2,
  '16': 1.5,
  '32': 2.0,
  '48': 2.6,
  '72': 3.0,
  '96': 3.4,
}

const CORE_LABEL: Record<string, string> = {
  '8':  '8 Core',
  '16': '16 Core',
  '32': '32 Core',
  '48': '48 Core',
  '72': '72 Core',
  '96': '96 Core',
}

const NODE_COLOR = '#b45309'

// ── Helpers ───────────────────────────────────────────────────────────
function coreKey(total: unknown): string {
  const n = Number(total)
  if (n <= 8)  return '8'
  if (n <= 16) return '16'
  if (n <= 32) return '32'
  if (n <= 48) return '48'
  if (n <= 72) return '72'
  return '96'
}

function lineStyle(feature?: Feature): L.PathOptions {
  const key   = coreKey(feature?.properties?.total_core)
  const color = BR_CORE_COLOR[key] ?? '#94a3b8'
  return {
    color,
    weight:  BR_CORE_WEIGHT[key] ?? 1.5,
    opacity: 0.88,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

function buildLinePopup(p: Record<string, unknown>): string {
  const nameA  = (p.name_a as string) ?? '—'
  const nameB  = (p.name_b as string) ?? '—'
  const lenKm  = Number(p.len_km ?? 0)
  const total  = Number(p.total_core ?? 0)
  const used   = Number(p.used_core  ?? 0)
  const unused = Number(p.unused_core ?? 0)
  const key    = coreKey(total)
  const color  = BR_CORE_COLOR[key] ?? '#94a3b8'
  const label  = CORE_LABEL[key] ?? `${total} Core`

  const utilPct = total > 0 ? Math.round((used / total) * 100) : 0
  const utilColor = utilPct >= 90 ? '#dc2626' : utilPct >= 60 ? '#d97706' : '#16a34a'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:200px;max-width:260px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px">BR Fiber Link</div>
      <div style="font-size:11px;color:#475569;margin-bottom:8px">
        ${nameA} <span style="color:#94a3b8">→</span> ${nameB}
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${color}18;border:1px solid ${color}55;
                     color:${color};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block"></span>
          ${label}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">BR-NTTN</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:60px;flex-shrink:0">Length</span>
          <span>${lenKm > 0 ? lenKm.toFixed(2) + ' km' : '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:60px;flex-shrink:0">Cores</span>
          <span>${total} total &nbsp;·&nbsp; <span style="color:#16a34a">${unused} free</span> &nbsp;·&nbsp; <span style="color:${utilColor}">${used} used (${utilPct}%)</span></span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:60px;flex-shrink:0">Type</span>
          <span>Burial (Underground)</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:60px;flex-shrink:0">Operator</span>
          <span style="font-weight:600;color:#374151">Bangladesh Railway</span>
        </div>
      </div>
    </div>`
}

function buildNodePopup(name: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:175px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px">${name || 'Railway Station'}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${NODE_COLOR}18;border:1px solid ${NODE_COLOR}55;
                     color:${NODE_COLOR};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${NODE_COLOR};display:inline-block"></span>
          Station / POP
        </span>
      </div>
      <div style="font-size:11px;color:#64748b">Bangladesh Railway fiber node</div>
    </div>`
}

// ── Component ─────────────────────────────────────────────────────────

interface Props {
  visible:     boolean
  coreFilters: Set<string>   // '8' | '16' | '32' | '48' | '72' | '96'
  showNodes:   boolean
}

export default function RailwayFiberOverlay({ visible, coreFilters, showNodes }: Props) {
  const [lines,  setLines]  = useState<FeatureCollection | null>(null)
  const [points, setPoints] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    if (!visible || (coreFilters.size === 0 && !showNodes)) return
    if (!lines) fetch('/data/br-fiber-lines.geojson?v=3')
      .then(r => r.json()).then(setLines)
      .catch(err => console.warn('RailwayFiberOverlay lines failed', err))
    if (!points) fetch('/data/br-fiber-nodes.geojson?v=3')
      .then(r => r.json()).then(setPoints)
      .catch(err => console.warn('RailwayFiberOverlay nodes failed', err))
  }, [visible, coreFilters, showNodes, lines, points])

  const filteredLines = useMemo(() => {
    if (!lines) return null
    return {
      ...lines,
      features: lines.features.filter(f =>
        coreFilters.has(coreKey(f.properties?.total_core))
      ),
    }
  }, [lines, coreFilters])

  const lineKey = [...coreFilters].sort().join(',')

  if (!visible) return null

  return (
    <>
      {/* Lines first (under nodes) */}
      {filteredLines && filteredLines.features.length > 0 && (
        <GeoJSON
          key={`br-fiber-lines-${lineKey}`}
          data={filteredLines}
          style={lineStyle}
          onEachFeature={(feature, layer) =>
            layer.bindPopup(buildLinePopup(feature.properties ?? {}), { maxWidth: 270 })
          }
        />
      )}

      {/* Station nodes on top */}
      {showNodes && points && (
        <GeoJSON
          key="br-fiber-nodes"
          data={points}
          pointToLayer={(feature, latlng) => {
            const name = (feature.properties?.name as string) ?? ''
            const marker = L.circleMarker(latlng, {
              radius:      4,
              color:       'white',
              weight:      1.2,
              fillColor:   NODE_COLOR,
              fillOpacity: 0.9,
              opacity:     1,
              interactive: true,
            })
            marker.bindPopup(buildNodePopup(name), { maxWidth: 240, offset: L.point(0, -6) })
            return marker
          }}
        />
      )}
    </>
  )
}
