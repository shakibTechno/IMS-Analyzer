/**
 * Fetch Bangladesh major highway geometries from OpenStreetMap (Overpass API).
 *
 * Fetches trunk + primary roads, merges connected segments into routes,
 * and writes public/data/bd-highways.geojson  — a FeatureCollection of
 * LineString features, one per connected highway corridor.
 *
 * Run: node scripts/fetch-highways.mjs
 */

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const OUT   = resolve(__dir, '..', 'public', 'data', 'bd-highways.geojson')

// ── Overpass query ────────────────────────────────────────────────
// Gets trunk + primary highway ways inside Bangladesh with full geometry.
const QUERY = `
[out:json][timeout:180][maxsize:200000000];
area["ISO3166-1"="BD"]["admin_level"="2"]->.bd;
(
  way["highway"~"^(trunk|primary)$"](area.bd);
);
out geom qt;
`.trim()

// ── Coordinate rounding (4dp ≈ 11m) ──────────────────────────────
const r = n => Math.round(n * 10000) / 10000

// ── RDP simplification ────────────────────────────────────────────
function perpDist(pt, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1]
  if (dx === 0 && dy === 0) return Math.hypot(pt[0]-a[0], pt[1]-a[1])
  const t = ((pt[0]-a[0])*dx + (pt[1]-a[1])*dy) / (dx*dx + dy*dy)
  return Math.hypot(pt[0]-(a[0]+t*dx), pt[1]-(a[1]+t*dy))
}
function rdp(pts, eps) {
  if (pts.length < 3) return pts
  let maxD = 0, idx = 0
  for (let i = 1; i < pts.length-1; i++) {
    const d = perpDist(pts[i], pts[0], pts[pts.length-1])
    if (d > maxD) { maxD = d; idx = i }
  }
  if (maxD > eps) {
    return [...rdp(pts.slice(0, idx+1), eps).slice(0,-1), ...rdp(pts.slice(idx), eps)]
  }
  return [pts[0], pts[pts.length-1]]
}

// ── Fetch from Overpass API ───────────────────────────────────────
async function fetchOverpass(query) {
  const url  = 'https://overpass-api.de/api/interpreter'
  const body = new URLSearchParams({ data: query })

  console.log('Fetching from Overpass API…')
  const res  = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}: ${res.statusText}`)
  return res.json()
}

// ── Build GeoJSON features from OSM ways ─────────────────────────
function buildFeatures(osmData) {
  const features = []

  for (const el of osmData.elements) {
    if (el.type !== 'way' || !el.geometry) continue
    if (el.geometry.length < 2) continue

    // OSM geometry is [{lat, lon}, …] — convert to [lng, lat] for GeoJSON
    const raw = el.geometry.map(n => [n.lon, n.lat])
    // Simplify with ε=0.0005° (~50m)
    const simplified = rdp(raw, 0.0005).map(([x,y]) => [r(x), r(y)])
    if (simplified.length < 2) continue

    features.push({
      type: 'Feature',
      properties: {
        osm_id:  el.id,
        highway: el.tags?.highway ?? 'road',
        name:    el.tags?.name ?? el.tags?.['name:en'] ?? null,
        ref:     el.tags?.ref ?? null,        // e.g. "N1", "N2"
        oneway:  el.tags?.oneway === 'yes',
      },
      geometry: {
        type:        'LineString',
        coordinates: simplified,
      },
    })
  }

  return features
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  let osmData
  try {
    osmData = await fetchOverpass(QUERY)
  } catch (err) {
    console.error('Failed to fetch from Overpass:', err.message)
    process.exit(1)
  }

  console.log(`Got ${osmData.elements.length} OSM elements`)

  const features = buildFeatures(osmData)
  console.log(`Built ${features.length} LineString features`)

  const refs = [...new Set(features.map(f => f.properties.ref).filter(Boolean))].sort()
  console.log('Route refs found:', refs.slice(0, 30).join(', '))

  const fc = { type: 'FeatureCollection', features }
  const json = JSON.stringify(fc)
  writeFileSync(OUT, json)
  console.log(`Written → bd-highways.geojson  (${(json.length/1024).toFixed(1)} KB, ${features.length} segments)`)
}

main()
