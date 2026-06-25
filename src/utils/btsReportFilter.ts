import type { BTSSite, BTSOperatorKey, AdminLevel } from '@/types/btsReport'

type Props    = Record<string, unknown>
type Coord    = [number, number]
type Ring     = Coord[]
type Geometry = { type: string; coordinates?: unknown; geometries?: Geometry[] }

function s(v: unknown): string { return v == null ? '' : String(v) }
function n(v: unknown): number | null { return typeof v === 'number' ? v : null }
function b(v: unknown): boolean | null {
  if (v === 1 || v === true)  return true
  if (v === 0 || v === false) return false
  return null
}
function ci(a: string, x: string): boolean {
  return a.toLowerCase() === x.toLowerCase()
}

// ─── Point-in-polygon (ray casting) ──────────────────────────────
function raycast(pt: Coord, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i] as Coord
    const [xj, yj] = ring[j] as Coord
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function pipPolygon(pt: Coord, rings: Ring[]): boolean {
  if (!raycast(pt, rings[0])) return false
  for (let i = 1; i < rings.length; i++) {
    if (raycast(pt, rings[i])) return false // inside a hole
  }
  return true
}

export function pointInGeometry(pt: Coord, geo: Geometry): boolean {
  if (geo.type === 'Polygon') {
    return pipPolygon(pt, geo.coordinates as Ring[])
  }
  if (geo.type === 'MultiPolygon') {
    return (geo.coordinates as Ring[][]).some(rings => pipPolygon(pt, rings))
  }
  if (geo.type === 'GeometryCollection') {
    return (geo.geometries ?? []).some(g => pointInGeometry(pt, g))
  }
  return false
}

// ─── GP (gp-sites.geojson) ────────────────────────────────────────
// Direct match on division/district/upazila
export function filterGP(
  features: { properties: Props; geometry: { coordinates: number[] } }[],
  level: AdminLevel,
  area: string,
): BTSSite[] {
  const field: Record<AdminLevel, string> = { division: 'division', district: 'district', upazila: 'upazila' }
  return features.flatMap((f, i) => {
    if (!ci(s(f.properties[field[level]]), area)) return []
    const [lon, lat] = f.geometry.coordinates
    return [{
      id:          `gp-${i}`,
      operatorKey: 'gp' as BTSOperatorKey,
      operator:    'Grameenphone',
      siteName:    s(f.properties.name),
      siteType:    '',
      txType:      s(f.properties.tx),
      has2G:       null,
      has3G:       null,
      has4G:       null,
      division:    s(f.properties.division),
      district:    s(f.properties.district),
      upazila:     s(f.properties.upazila),
      lat:         typeof lat === 'number' ? lat : null,
      lon:         typeof lon === 'number' ? lon : null,
    }]
  })
}

// ─── Robi (robi-sites.geojson) ────────────────────────────────────
export function filterRobi(
  features: { properties: Props; geometry: { coordinates: number[] } }[],
  level: AdminLevel,
  area: string,
): BTSSite[] {
  const field: Record<AdminLevel, string> = { division: 'division', district: 'district', upazila: 'upazila' }
  return features.flatMap((f, i) => {
    if (!ci(s(f.properties[field[level]]), area)) return []
    const [lon, lat] = f.geometry.coordinates
    return [{
      id:          `robi-${i}`,
      operatorKey: 'robi' as BTSOperatorKey,
      operator:    'Robi',
      siteName:    s(f.properties.name),
      siteType:    '',
      txType:      s(f.properties.tx),
      has2G:       null,
      has3G:       null,
      has4G:       null,
      division:    s(f.properties.division),
      district:    s(f.properties.district),
      upazila:     s(f.properties.upazila),
      lat:         typeof lat === 'number' ? lat : null,
      lon:         typeof lon === 'number' ? lon : null,
    }]
  })
}

// ─── Banglalink (bl-towers.geojson) ──────────────────────────────
// Has f2g/f3g/f4g + sitetype
export function filterBanglalink(
  features: { properties: Props; geometry: { coordinates: number[] } }[],
  level: AdminLevel,
  area: string,
): BTSSite[] {
  const field: Record<AdminLevel, string> = { division: 'division', district: 'district', upazila: 'upazila' }
  return features.flatMap((f, i) => {
    const p = f.properties
    if (!ci(s(p[field[level]]), area)) return []
    const [lon, lat] = f.geometry.coordinates
    return [{
      id:          `bl-${i}`,
      operatorKey: 'banglalink' as BTSOperatorKey,
      operator:    'Banglalink',
      siteName:    s(p.sitecode) || s(p.sitename),
      siteType:    s(p.sitetype),
      txType:      '',
      has2G:       b(p.f2g),
      has3G:       b(p.f3g),
      has4G:       b(p.f4g),
      division:    s(p.division),
      district:    s(p.district),
      upazila:     s(p.upazila),
      lat:         n(p.latdd) ?? (typeof lat === 'number' ? lat : null),
      lon:         n(p.londd) ?? (typeof lon === 'number' ? lon : null),
    }]
  })
}

// ─── Summit (summit-bts.geojson) ─────────────────────────────────
// No admin fields — use point-in-polygon against boundary polygon
export function filterSummit(
  features: { properties: Props; geometry: { coordinates: number[] } }[],
  areaGeometry: Geometry,
  areaName: string,
): BTSSite[] {
  return features.flatMap((f, i) => {
    const [lon, lat] = f.geometry.coordinates
    if (!pointInGeometry([lon, lat], areaGeometry)) return []
    return [{
      id:          `summit-${i}`,
      operatorKey: 'summit' as BTSOperatorKey,
      operator:    'Summit',
      siteName:    s(f.properties.point_name),
      siteType:    s(f.properties.point_type),
      txType:      '',
      has2G:       null,
      has3G:       null,
      has4G:       null,
      division:    areaName,
      district:    areaName,
      upazila:     areaName,
      lat:         typeof lat === 'number' ? lat : null,
      lon:         typeof lon === 'number' ? lon : null,
    }]
  })
}
