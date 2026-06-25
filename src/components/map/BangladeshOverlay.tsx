// ─── BangladeshOverlay ────────────────────────────────────────────
// Loads the real Bangladesh boundary GeoJSON (simplified to 35 KB),
// then renders two layers:
//
//   1. World fog-of-war — a world-covering Polygon with every
//      Bangladesh sub-polygon (mainland + coastal islands) cut out
//      as holes, creating the focus-on-BD effect.
//
//   2. Country border — the GeoJSON outline rendered as a thin
//      blue stroke (BTRC brand color) with no fill.
//
// Renders nothing until the fetch resolves (fast on localhost).

import { useState, useEffect } from 'react'
import { Polygon, GeoJSON } from 'react-leaflet'
import type { GeoJsonObject, MultiPolygon, Polygon as GeoPolygon } from 'geojson'

type LatLng = [number, number]

// World outer ring — covers the entire map extent
const WORLD: LatLng[] = [[-90, -180], [90, -180], [90, 180], [-90, 180]]

// Extract outer rings from a GeoJSON Polygon or MultiPolygon.
// GeoJSON coordinates are [lng, lat]; Leaflet needs [lat, lng].
function extractOuterRings(geom: MultiPolygon | GeoPolygon): LatLng[][] {
  if (geom.type === 'Polygon') {
    return [geom.coordinates[0].map(([lng, lat]) => [lat, lng] as LatLng)]
  }
  // MultiPolygon: one outer ring per sub-polygon (mainland + islands)
  return geom.coordinates.map(poly =>
    poly[0].map(([lng, lat]) => [lat, lng] as LatLng)
  )
}

export default function BangladeshOverlay() {
  const [holes,   setHoles]   = useState<LatLng[][] | null>(null)
  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(null)

  useEffect(() => {
    fetch('/data/bd-outline.geojson')
      .then(r => r.json())
      .then(fc => {
        const geom = fc.features[0].geometry as MultiPolygon | GeoPolygon
        setHoles(extractOuterRings(geom))
        setGeoJson(fc as GeoJsonObject)
      })
      .catch(err => console.warn('BangladeshOverlay: failed to load outline', err))
  }, [])

  if (!holes || !geoJson) return null

  return (
    <>
      {/* ── Fog-of-war: world rect with BD polygon(s) as holes ── */}
      <Polygon
        positions={[WORLD, ...holes]}
        pathOptions={{
          fillColor:   '#0f172a',
          fillOpacity: 0.42,
          stroke:      false,
          interactive: false,
        }}
      />

      {/* ── Border yellow glow (wide, behind main line) ─────── */}
      <GeoJSON
        data={geoJson}
        style={() => ({
          fill:        false,
          color:       '#fbbf24',
          weight:      7,
          opacity:     0.45,
          interactive: false,
        })}
      />

      {/* ── Country border highlight ─────────────────────────── */}
      <GeoJSON
        data={geoJson}
        style={() => ({
          fill:        false,
          color:       '#0f172a',
          weight:      2.2,
          opacity:     1,
          interactive: false,
        })}
      />
    </>
  )
}
