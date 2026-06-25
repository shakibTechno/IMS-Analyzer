// ─── FHLFONOverlay ─────────────────────────────────────────────────
// Renders Fiber@Home Limited's national fiber optic network (FHLFON).
// Lines   : 18,405 segments — click for core utilisation popup
// Points  : primary (CO/BTS/FDH, 29 K) always shown
//           detail  (JE/EP/FAT, 66 K)  only at zoom ≥ 11
//           all points clickable — popup card with type/name/district/coords
//           name labels at zoom ≥ 13 (CO / BTS only)

import { useState, useEffect, useRef, useMemo } from 'react'
import { GeoJSON, useMapEvents } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Style constants ──────────────────────────────────────────────

const LINE_WEIGHT: Record<string, number> = {
  Aerial: 1.6, Burial: 1.4,
}
const LINE_COLORS: Record<string, string> = {
  Aerial: '#4338ca',  // indigo
  Burial: '#fbbf24',  // light yellow
}

const PT_STYLES: Record<string, { color: string; radius: number; border: string }> = {
  CO:  { color: '#1e1b4b', radius: 6, border: 'white' },
  BTS: { color: '#4338ca', radius: 4, border: 'white' },
  FDH: { color: '#818cf8', radius: 3, border: 'white' },
  JE:  { color: '#6366f1', radius: 2, border: '#818cf8' },
  EP:  { color: '#a5b4fc', radius: 2, border: '#6366f1' },
  FAT: { color: '#c7d2fe', radius: 2, border: '#6366f1' },
}

// Full display names for point types
const PT_NAMES: Record<string, string> = {
  CO:  'Central Office',
  BTS: 'Base Transceiver Station',
  FDH: 'Fiber Distribution Hub',
  JE:  'Junction Element',
  EP:  'End Point',
  FAT: 'Fiber Access Terminal',
}

// Badge colors for point type pills (bg / border / text)
const PT_BADGE: Record<string, { bg: string; bd: string; tx: string }> = {
  CO:  { bg: 'rgba(30,27,75,0.08)',   bd: 'rgba(30,27,75,0.25)',   tx: '#1e1b4b' },
  BTS: { bg: 'rgba(67,56,202,0.08)',  bd: 'rgba(67,56,202,0.25)',  tx: '#4338ca' },
  FDH: { bg: 'rgba(129,140,248,0.1)', bd: 'rgba(129,140,248,0.3)', tx: '#6366f1' },
  JE:  { bg: 'rgba(99,102,241,0.08)', bd: 'rgba(99,102,241,0.25)', tx: '#6366f1' },
  EP:  { bg: 'rgba(165,180,252,0.1)', bd: 'rgba(99,102,241,0.2)',  tx: '#4f46e5' },
  FAT: { bg: 'rgba(199,210,254,0.1)', bd: 'rgba(99,102,241,0.2)',  tx: '#4f46e5' },
}

// ── Popup HTML builders ──────────────────────────────────────────

function buildPointPopup(
  pt: string, nm: string, dist: string,
  lat: number, lng: number
): string {
  const typeName  = PT_NAMES[pt]  ?? pt
  const badge     = PT_BADGE[pt]  ?? PT_BADGE.CO
  const dot       = PT_STYLES[pt]?.color ?? '#4338ca'
  const coordStr  = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  const title     = nm || typeName

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:185px;max-width:230px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:6px;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${title}">
        ${title}
      </div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${badge.bg};border:1px solid ${badge.bd};
                     color:${badge.tx};font-size:10px;font-weight:600;white-space:nowrap">
          <span style="width:5px;height:5px;border-radius:50%;background:${dot};display:inline-block;flex-shrink:0"></span>
          ${pt}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;
                     padding:2px 6px;border-radius:4px;white-space:nowrap">Fiber@Home</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Type</span>
          <span>${typeName}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">District</span>
          <span>${dist || '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Coords</span>
          <span style="font-variant-numeric:tabular-nums;font-family:monospace;font-size:10px">${coordStr}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:#4338ca;font-weight:600">Fiber@Home</span>
        </div>
      </div>
    </div>
  `
}

function buildLinePopup(lt: string, cn: number, cu: number, km: number): string {
  const pct    = cn > 0 ? Math.round((cu / cn) * 100) : 0
  const barClr = pct > 60 ? '#ef4444' : pct > 30 ? '#f59e0b' : '#22c55e'
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:170px">
      <div style="font-weight:700;color:#1e1b4b;font-size:13px;margin-bottom:6px">${lt} Cable</div>
      <div style="height:4px;background:#e2e8f0;border-radius:2px;margin-bottom:6px">
        <div style="height:4px;width:${pct}%;background:${barClr};border-radius:2px"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Cores</span>
          <span>${cn} total / ${cu} in use (${pct}%)</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Length</span>
          <span>${km} km</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:54px;flex-shrink:0">Network</span>
          <span style="color:#4338ca;font-weight:600">Fiber@Home</span>
        </div>
      </div>
    </div>
  `
}

// ── Style helpers ────────────────────────────────────────────────

function lineStyle(feature?: Feature): L.PathOptions {
  const lt = (feature?.properties?.lt as string) ?? 'Aerial'
  return {
    color:     LINE_COLORS[lt] ?? LINE_COLORS.Aerial,
    weight:    LINE_WEIGHT[lt] ?? 1.4,
    opacity:   0.75,
    dashArray: undefined,
    lineCap:   'round',
    lineJoin:  'round',
  }
}

function onEachLine(feature: Feature, layer: L.Layer) {
  const p  = feature.properties ?? {}
  layer.bindPopup(
    buildLinePopup(
      (p.lt as string) ?? 'Unknown',
      (p.cn as number) ?? 0,
      (p.cu as number) ?? 0,
      (p.km as number) ?? 0,
    ),
    { maxWidth: 220 }
  )
}

// ── pointToLayer factory ─────────────────────────────────────────

function makeMarker(
  feature: Feature,
  latlng: L.LatLng,
  fillOpacity = 0.9,
  showLabel = false,
): L.CircleMarker {
  const pt   = (feature.properties?.pt   as string) ?? 'CO'
  const nm   = (feature.properties?.nm   as string) ?? ''
  const dist = (feature.properties?.dist as string) ?? ''
  const s    = PT_STYLES[pt] ?? PT_STYLES.CO

  const marker = L.circleMarker(latlng, {
    radius:      s.radius,
    color:       s.border,
    weight:      1,
    fillColor:   s.color,
    fillOpacity,
    opacity:     fillOpacity,
    interactive: true,
  })

  marker.bindPopup(
    buildPointPopup(pt, nm, dist, latlng.lat, latlng.lng),
    { maxWidth: 230, offset: L.point(0, -s.radius - 2) }
  )

  if (showLabel && (pt === 'CO' || pt === 'BTS') && nm) {
    marker.bindTooltip(nm, {
      permanent: true, direction: 'top',
      offset: [0, -s.radius - 2],
      className: 'fhlfon-label',
    })
  }

  return marker
}

// ── Component ────────────────────────────────────────────────────

interface Props {
  visible:      boolean
  lineFilters:  Set<string>   // 'Aerial' | 'Burial' | 'OPGW'
  pointFilters: Set<string>   // 'CO' | 'BTS' | 'FDH' | 'JE' | 'EP' | 'FAT'
}

export default function FHLFONOverlay({ visible, lineFilters, pointFilters }: Props) {
  const [lines,   setLines]   = useState<FeatureCollection | null>(null)
  const [primary, setPrimary] = useState<FeatureCollection | null>(null)
  const [detail,  setDetail]  = useState<FeatureCollection | null>(null)
  const [zoom,    setZoom]    = useState(7)
  const detailFetched = useRef(false)

  useMapEvents({
    zoomend: e => setZoom(e.target.getZoom()),
    moveend: e => setZoom(e.target.getZoom()),
  })

  useEffect(() => {
    if (!visible || (lineFilters.size === 0 && pointFilters.size === 0)) return
    if (!lines) fetch('/data/fhlfon-lines.geojson')
      .then(r => r.json()).then(setLines)
      .catch(err => console.warn('FHLFON lines failed', err))
    if (!primary) fetch('/data/fhlfon-points-primary.geojson')
      .then(r => r.json()).then(setPrimary)
      .catch(err => console.warn('FHLFON primary points failed', err))
  }, [visible, lineFilters, pointFilters, lines, primary])

  useEffect(() => {
    if (!visible || zoom < 11 || pointFilters.size === 0 || detailFetched.current) return
    detailFetched.current = true
    fetch('/data/fhlfon-points-detail.geojson')
      .then(r => r.json()).then(setDetail)
      .catch(err => console.warn('FHLFON detail points failed', err))
  }, [visible, zoom, pointFilters])

  const filteredLines = useMemo(() => {
    if (!lines) return null
    return { ...lines, features: lines.features.filter(f => lineFilters.has(f.properties?.lt ?? 'Aerial')) }
  }, [lines, lineFilters])

  const filteredPrimary = useMemo(() => {
    if (!primary) return null
    return { ...primary, features: primary.features.filter(f => pointFilters.has(f.properties?.pt ?? 'CO')) }
  }, [primary, pointFilters])

  const filteredDetail = useMemo(() => {
    if (!detail) return null
    return { ...detail, features: detail.features.filter(f => pointFilters.has(f.properties?.pt ?? 'JE')) }
  }, [detail, pointFilters])

  const lineKey    = [...lineFilters].sort().join(',')
  const primaryKey = [...pointFilters].filter(p => ['CO','BTS','FDH'].includes(p)).sort().join(',')
  const detailKey  = [...pointFilters].filter(p => ['JE','EP','FAT'].includes(p)).sort().join(',')

  if (!visible) return null

  const showLabels = zoom >= 13

  return (
    <>
      {/* Lines */}
      {filteredLines && filteredLines.features.length > 0 && (
        <GeoJSON
          key={`fhlfon-lines-${lineKey}`}
          data={filteredLines}
          style={lineStyle}
          onEachFeature={onEachLine}
        />
      )}

      {/* Primary points: CO / BTS / FDH */}
      {filteredPrimary && filteredPrimary.features.length > 0 && (
        <GeoJSON
          key={`fhlfon-primary-${showLabels}-${primaryKey}`}
          data={filteredPrimary}
          pointToLayer={(feature, latlng) =>
            makeMarker(feature, latlng, 0.9, showLabels)
          }
        />
      )}

      {/* Detail points: JE / EP / FAT — zoom ≥ 11 only */}
      {zoom >= 11 && filteredDetail && filteredDetail.features.length > 0 && (
        <GeoJSON
          key={`fhlfon-detail-${detailKey}`}
          data={filteredDetail}
          pointToLayer={(feature, latlng) =>
            makeMarker(feature, latlng, 0.85, false)
          }
        />
      )}

      <style>{`
        .fhlfon-label {
          background: rgba(30,27,75,0.85);
          border: none;
          color: #e0e7ff;
          font-size: 9px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .fhlfon-label::before { display: none; }
      `}</style>
    </>
  )
}
