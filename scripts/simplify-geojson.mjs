/**
 * Simplify Bangladesh admin GeoJSON for web rendering.
 *
 * Pipeline:
 *   1. Ramer-Douglas-Peucker vertex reduction  (epsilon = 0.004°, ~400m)
 *   2. Coordinate precision clamp to 4 dp      (~11m, invisible at zoom 5-10)
 *   3. Strip all properties except the ones we use
 *
 * Output sizes (target):
 *   bd-outline.geojson   < 150 KB   (admin0 country polygon)
 *   bd-divisions.geojson < 400 KB   (admin1 division polygons × 8)
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir  = dirname(fileURLToPath(import.meta.url))
const ROOT   = resolve(__dir, '..')
const IN_DIR = resolve(ROOT, 'bgd_admin_boundaries.geojson')
const OUT    = resolve(ROOT, 'public', 'data')

// ── Ramer–Douglas–Peucker ─────────────────────────────────────────
function perpendicularDist(pt, lineStart, lineEnd) {
  const dx = lineEnd[0] - lineStart[0]
  const dy = lineEnd[1] - lineStart[1]
  if (dx === 0 && dy === 0) {
    return Math.hypot(pt[0] - lineStart[0], pt[1] - lineStart[1])
  }
  const t = ((pt[0] - lineStart[0]) * dx + (pt[1] - lineStart[1]) * dy) / (dx * dx + dy * dy)
  return Math.hypot(pt[0] - (lineStart[0] + t * dx), pt[1] - (lineStart[1] + t * dy))
}

function rdp(points, epsilon) {
  if (points.length < 3) return points
  let maxDist = 0, maxIdx = 0
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDist(points[i], points[0], points[points.length - 1])
    if (d > maxDist) { maxDist = d; maxIdx = i }
  }
  if (maxDist > epsilon) {
    const left  = rdp(points.slice(0, maxIdx + 1), epsilon)
    const right = rdp(points.slice(maxIdx),         epsilon)
    return [...left.slice(0, -1), ...right]
  }
  return [points[0], points[points.length - 1]]
}

// ── Coordinate rounding ───────────────────────────────────────────
const P = 4
const r = n => Math.round(n * 10000) / 10000

function roundRing(ring) { return ring.map(([x, y]) => [r(x), r(y)]) }

function simplifyRing(ring, eps) {
  const simplified = rdp(ring, eps)
  // GeoJSON rings must close — ensure first === last
  if (simplified[0][0] !== simplified[simplified.length - 1][0] ||
      simplified[0][1] !== simplified[simplified.length - 1][1]) {
    simplified.push(simplified[0])
  }
  return simplified.map(([x, y]) => [r(x), r(y)])
}

function simplifyGeometry(geom, eps) {
  switch (geom.type) {
    case 'Polygon':
      return { type: 'Polygon', coordinates: geom.coordinates.map(ring => simplifyRing(ring, eps)) }
    case 'MultiPolygon':
      return {
        type: 'MultiPolygon',
        coordinates: geom.coordinates.map(poly => poly.map(ring => simplifyRing(ring, eps))),
      }
    default:
      return geom
  }
}

// ── Process ───────────────────────────────────────────────────────
function processFile(filename, eps, propPicker) {
  const raw  = readFileSync(resolve(IN_DIR, filename), 'utf8')
  const fc   = JSON.parse(raw)
  const out  = {
    type: 'FeatureCollection',
    features: fc.features.map(f => ({
      type: 'Feature',
      properties: propPicker(f.properties),
      geometry: simplifyGeometry(f.geometry, eps),
    })),
  }
  return JSON.stringify(out)
}

// ── admin0: country outline ───────────────────────────────────────
console.log('Processing admin0 (country outline)…')
const outlineJson = processFile('bgd_admin0.geojson', 0.004, () => ({ name: 'Bangladesh' }))
writeFileSync(resolve(OUT, 'bd-outline.geojson'), outlineJson)
console.log('  → bd-outline.geojson', (outlineJson.length / 1024).toFixed(1), 'KB')

// ── admin1: division polygons ─────────────────────────────────────
console.log('Processing admin1 (divisions)…')
const divisionsJson = processFile('bgd_admin1.geojson', 0.004, p => ({
  name:   p.adm1_name,
  pcode:  p.adm1_pcode,
  lat:    p.center_lat,
  lon:    p.center_lon,
}))
writeFileSync(resolve(OUT, 'bd-divisions.geojson'), divisionsJson)
console.log('  → bd-divisions.geojson', (divisionsJson.length / 1024).toFixed(1), 'KB')

// ── admin2: district polygons (64 districts) ──────────────────────
console.log('Processing admin2 (districts)…')
const districtsJson = processFile('bgd_admin2.geojson', 0.003, p => ({
  name:     p.adm2_name,
  division: p.adm1_name,
  pcode:    p.adm2_pcode,
  lat:      p.center_lat,
  lon:      p.center_lon,
}))
writeFileSync(resolve(OUT, 'bd-districts.geojson'), districtsJson)
console.log('  → bd-districts.geojson', (districtsJson.length / 1024).toFixed(1), 'KB')

console.log('Done.')
