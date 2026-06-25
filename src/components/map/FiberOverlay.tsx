// ─── FiberOverlay ─────────────────────────────────────────────────
// Renders the BGFCL NTTN fiber backbone on the map.
//
// Two-layer approach:
//
//   Layer 1 — Road network backdrop (bd-fiber-highways.geojson)
//     Real OSM highway geometry for N1–N8.  Rendered as thin grey lines
//     so the map shows that fiber follows actual road corridors.
//     OSM ref coverage for Bangladesh is inconsistent (N4/N6 are partial),
//     so this layer is purely visual context — it does NOT drive connectivity.
//
//   Layer 2 — Fiber routes (fiberRoutes.ts manual waypoints)
//     All 18 routes across all tiers, waypoints carefully aligned to
//     highway corridors. This layer guarantees full network connectivity.
//     Colored by status: active=blue / degraded=amber / cut=red.
//
// Visual encoding:
//   Thickness  — Tier 1 (3.5 px) > Tier 2 (2.2 px) > Tier 3 (1.5 px)
//   Color      — active=blue / degraded=amber / cut=red
//   Dash       — degraded routes use a longer dash; cut routes animated
//   Animation  — .fiber-cut class drives stroke-dashoffset in index.css

import { useState, useEffect } from 'react'
import { Polyline, GeoJSON }   from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import { FIBER_ROUTES, FIBER_COLOR, FIBER_WEIGHT } from '@/data/fiberRoutes'
import type { FiberRoute } from '@/data/fiberRoutes'
import L from 'leaflet'

// ── Style: road backdrop ──────────────────────────────────────────
const ROAD_BACKDROP_STYLE: L.PathOptions = {
  color:       '#94a3b8',
  weight:      1.5,
  opacity:     0.35,
  dashArray:   undefined,
  lineCap:     'round',
  lineJoin:    'round',
  interactive: false,
}

// ── Style: fiber routes ───────────────────────────────────────────
function fiberStyle(route: FiberRoute) {
  const color  = FIBER_COLOR[route.status]
  const weight = FIBER_WEIGHT[route.tier]
  const isCut  = route.status === 'cut'
  const isDeg  = route.status === 'degraded'

  return {
    color,
    weight,
    opacity:     isCut ? 0.95 : isDeg ? 0.78 : 0.92,
    dashArray:   isCut ? '6 5' : isDeg ? '10 7' : undefined,
    lineCap:     'round'  as const,
    lineJoin:    'round'  as const,
    className:   isCut ? 'fiber-cut' : undefined,
    interactive: false,
  }
}

// ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean
}

export default function FiberOverlay({ visible }: Props) {
  const [roadGeo, setRoadGeo] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/data/bd-fiber-highways.geojson')
      .then(r => r.json())
      .then(setRoadGeo)
      .catch(err => console.warn('FiberOverlay: highway GeoJSON failed', err))
  }, [])

  if (!visible) return null

  return (
    <>
      {/* ── Layer 1: Real OSM road geometry (grey backdrop) ──────── */}
      {roadGeo && (
        <GeoJSON
          key="road-backdrop"
          data={roadGeo}
          style={() => ROAD_BACKDROP_STYLE}
        />
      )}

      {/* ── Layer 2: Fiber routes — all 18, full connectivity ────── */}
      {FIBER_ROUTES.map(route => (
        <Polyline
          key={route.id}
          positions={route.coords}
          pathOptions={fiberStyle(route)}
        />
      ))}
    </>
  )
}
