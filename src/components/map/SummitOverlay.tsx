// ─── SummitOverlay ───────────────────────────────────────────────────
// Summit Communication Limited fiber network.
// 5 GeoJSON files, loaded lazily, major lines zoom-gated at ≥ 9.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection, Feature } from 'geojson'
import L from 'leaflet'

// ── Zoom hook ─────────────────────────────────────────────────────
function useZoom(): number {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useEffect(() => {
    const h = () => setZoom(map.getZoom())
    map.on('zoomend', h)
    return () => { map.off('zoomend', h) }
  }, [map])
  return zoom
}

// ── Style helpers ─────────────────────────────────────────────────
function lineStyle(feature?: Feature): L.PathOptions {
  const p = feature?.properties ?? {}
  return {
    color:   p.color  ?? '#64748b',
    weight:  p.weight ?? 1.5,
    opacity: 0.82,
    lineCap:  'round',
    lineJoin: 'round',
  }
}

// Node radius by type
function nodeRadius(pt_type: string): number {
  if (['POP', 'COLO/PoP', 'PoP(Damaged)'].includes(pt_type)) return 5
  if (pt_type.startsWith('Node') || pt_type === 'BS') return 4
  return 3
}

// ── Popup builders ────────────────────────────────────────────────
function linePopup(p: Record<string, unknown>): string {
  const color    = String(p.color   ?? '#64748b')
  const lineType = String(p.line_type ?? '—')
  const pathAlong= String(p.path_along ?? '—')
  const name     = String(p.line_name  ?? '—')
  const cores    = Number(p.total_core ?? 0)
  const used     = Number(p.core_used  ?? 0)
  const unused   = Number(p.core_unused ?? 0)
  const km       = Number(p.route_km   ?? 0)
  const infra    = String(p.infra_type ?? '—')
  const utilPct  = cores > 0 ? Math.round((used / cores) * 100) : 0
  const utilColor= utilPct >= 90 ? '#dc2626' : utilPct >= 60 ? '#d97706' : '#16a34a'

  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:215px;max-width:270px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:3px">Summit Fiber Link</div>
      <div style="font-size:10.5px;color:#475569;margin-bottom:8px;word-break:break-word">${name}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;flex-wrap:wrap">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;
                     border-radius:9999px;background:${color}18;border:1px solid ${color}55;
                     color:${color};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block"></span>
          ${lineType}
        </span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">${pathAlong}</span>
        <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 6px;border-radius:4px">${infra}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;color:#475569;font-size:11px">
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Length</span>
          <span>${km > 0 ? km.toFixed(3) + ' km' : '—'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Cores</span>
          <span>${cores} total &nbsp;·&nbsp; <span style="color:#16a34a">${unused} free</span> &nbsp;·&nbsp; <span style="color:${utilColor}">${used} used (${utilPct}%)</span></span>
        </div>
        <div style="display:flex;gap:6px">
          <span style="color:#94a3b8;min-width:64px;flex-shrink:0">Operator</span>
          <span style="font-weight:600;color:#374151">Summit Communications</span>
        </div>
      </div>
    </div>`
}

function nodePopup(p: Record<string, unknown>): string {
  const color = String(p.color     ?? '#7c3aed')
  const type  = String(p.point_type ?? '—')
  const name  = String(p.point_name ?? '—')
  return `
    <div style="font-family:system-ui,sans-serif;font-size:12px;line-height:1.4;min-width:180px">
      <div style="font-weight:700;color:#1e293b;font-size:13px;margin-bottom:4px">${name || 'Summit Node'}</div>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;
                     border-radius:9999px;background:${color}18;border:1px solid ${color}55;
                     color:${color};font-size:10px;font-weight:600">
          <span style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block"></span>
          ${type}
        </span>
      </div>
      <div style="font-size:11px;color:#64748b">Summit Communication Limited</div>
    </div>`
}

// ── Sub-layer component ────────────────────────────────────────────
interface LineLayerProps {
  url:      string
  filterFn: (f: Feature) => boolean
  cacheKey: string
}

function LineLayer({ url, filterFn, cacheKey }: LineLayerProps) {
  const [data, setData] = useState<FeatureCollection | null>(null)
  useEffect(() => {
    fetch(url)
      .then(r => r.json()).then(setData)
      .catch(err => console.warn('SummitOverlay line fetch failed', url, err))
  }, [url])

  const filtered = useMemo(() => {
    if (!data) return null
    const features = data.features.filter(filterFn)
    return { ...data, features }
  }, [data, filterFn])

  if (!filtered || filtered.features.length === 0) return null
  return (
    <GeoJSON
      key={`${cacheKey}-${filtered.features.length}`}
      data={filtered}
      style={lineStyle as () => L.PathOptions}
      onEachFeature={(feat, layer) =>
        layer.bindPopup(linePopup(feat.properties ?? {}), { maxWidth: 280 })
      }
    />
  )
}

// ── Main component ────────────────────────────────────────────────

export interface SummitLineFilters {
  backbone: boolean   // >=96 core + aerial >=48
  major:    boolean   // burial 48-95 core  (zoom >= 9)
  pgcb:     boolean   // PGCB grid route
  railway:  boolean   // railway route
}

interface Props {
  visible:     boolean
  lineFilters: SummitLineFilters
  showNodes:   boolean
  showBTS:     boolean
}

export default function SummitOverlay({ visible, lineFilters, showNodes, showBTS }: Props) {
  const zoom = useZoom()
  const [nodes,    setNodes]    = useState<FeatureCollection | null>(null)
  const [bts,      setBts]      = useState<FeatureCollection | null>(null)

  // Load point files once on first visibility
  useEffect(() => {
    if (!visible) return
    if (showNodes && !nodes)
      fetch('/data/summit-nodes.geojson?v=1')
        .then(r => r.json()).then(setNodes)
        .catch(err => console.warn('SummitOverlay nodes failed', err))
  }, [visible, showNodes, nodes])

  useEffect(() => {
    if (!visible) return
    if (showBTS && !bts)
      fetch('/data/summit-bts.geojson?v=1')
        .then(r => r.json()).then(setBts)
        .catch(err => console.warn('SummitOverlay bts failed', err))
  }, [visible, showBTS, bts])

  const alwaysTrue  = useCallback(() => true, [])
  const isPGCB      = useCallback((f: Feature) => f.properties?.path_along === 'PGCB Grid line', [])
  const isRailway   = useCallback((f: Feature) => f.properties?.path_along === 'Railway', [])

  if (!visible) return null

  return (
    <>
      {/* ── Backbone lines (≥96 core + aerial ≥48) ──── */}
      {lineFilters.backbone && (
        <LineLayer
          url="/data/summit-lines-backbone.geojson?v=1"
          filterFn={alwaysTrue}
          cacheKey="summit-backbone"
        />
      )}

      {/* ── Major burial lines (48–95 core), zoom-gated ── */}
      {lineFilters.major && zoom >= 9 && (
        <LineLayer
          url="/data/summit-lines-major.geojson?v=1"
          filterFn={alwaysTrue}
          cacheKey="summit-major"
        />
      )}

      {/* ── Infra: PGCB route ─────────────────────────── */}
      {lineFilters.pgcb && (
        <LineLayer
          url="/data/summit-lines-infra.geojson?v=1"
          filterFn={isPGCB}
          cacheKey="summit-pgcb"
        />
      )}

      {/* ── Infra: Railway route ──────────────────────── */}
      {lineFilters.railway && (
        <LineLayer
          url="/data/summit-lines-infra.geojson?v=1"
          filterFn={isRailway}
          cacheKey="summit-railway"
        />
      )}

      {/* ── Network nodes ─────────────────────────────── */}
      {showNodes && nodes && (
        <GeoJSON
          key="summit-nodes"
          data={nodes}
          pointToLayer={(feat, latlng) => {
            const p     = feat.properties ?? {}
            const color = String(p.color      ?? '#7c3aed')
            const r     = nodeRadius(String(p.point_type ?? ''))
            const marker = L.circleMarker(latlng, {
              radius:      r,
              color:       'white',
              weight:      1,
              fillColor:   color,
              fillOpacity: 0.88,
              opacity:     1,
              interactive: true,
            })
            marker.bindPopup(nodePopup(p), { maxWidth: 240, offset: L.point(0, -4) })
            return marker
          }}
        />
      )}

      {/* ── BTS sites, zoom-gated ────────────────────── */}
      {showBTS && bts && zoom >= 11 && (
        <GeoJSON
          key="summit-bts"
          data={bts}
          pointToLayer={(feat, latlng) => {
            const p = feat.properties ?? {}
            const marker = L.circleMarker(latlng, {
              radius:      3,
              color:       'white',
              weight:      0.8,
              fillColor:   '#f59e0b',
              fillOpacity: 0.80,
              opacity:     1,
              interactive: true,
            })
            marker.bindPopup(nodePopup(p), { maxWidth: 220, offset: L.point(0, -4) })
            return marker
          }}
        />
      )}
    </>
  )
}
