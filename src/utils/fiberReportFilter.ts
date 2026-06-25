import type { FiberSegment, OperatorKey, AdminLevel } from '@/types/fiberReport'

type Props = Record<string, unknown>

function n(v: unknown): number | null {
  return typeof v === 'number' ? v : null
}
function s(v: unknown): string {
  return v == null ? '' : String(v)
}

function ci(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
function contains(haystack: unknown, needle: string): boolean {
  if (typeof haystack !== 'string') return false
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function side(
  mo: boolean,
  md: boolean,
): FiberSegment['matchSide'] | null {
  if (mo && md) return 'both'
  if (mo)       return 'origin'
  if (md)       return 'destination'
  return null
}

// ─── BTCL (fiber-lines.geojson) ───────────────────────────────────
// name: "Ghatail - Madhupur (19 Km)" — text search only
export function filterBTCL(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const name = s(p.name)
    const ms = side(contains(name, origin), contains(name, destination))
    if (!ms) return []
    const parts = name.split(' - ')
    const from = parts[0]?.trim() || name
    const to   = parts[1]?.replace(/\s*\(.*\)/, '').trim() || from
    return [{
      id:          `btcl-${i}`,
      operatorKey: 'btcl' as OperatorKey,
      operator:    'BTCL',
      lineName:    name,
      lineType:    '',
      fromNode:    from,
      toNode:      to,
      coreCount:   null,
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.dist_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── Banglalink (bl-lines.geojson) ───────────────────────────────
// Has division/district/upazila fields — direct equality match
export function filterBanglalink(
  features: { properties: Props }[],
  level: AdminLevel,
  origin: string,
  destination: string,
): FiberSegment[] {
  const fieldMap: Record<AdminLevel, string> = {
    division: 'division',
    district: 'district',
    upazila:  'upazila',
  }
  const field = fieldMap[level]

  return features.flatMap((f, i) => {
    const p = f.properties
    const val = s(p[field])
    const mo = ci(val, origin)
    const md = ci(val, destination)
    const ms = side(mo, md)
    if (!ms) return []
    const coreno = n(p.coreno)
    const coreuse = n(p.coreuse)
    const coreready = n(p.coreready)
    const district = s(p.district)
    const upazila  = s(p.upazila)
    const division = s(p.division)
    return [{
      id:          `bl-${i}`,
      operatorKey: 'banglalink' as OperatorKey,
      operator:    'Banglalink',
      lineName:    s(p.linename),
      lineType:    s(p.linetype),
      fromNode:    district || division,
      toNode:      upazila  || district || division,
      coreCount:   coreno,
      coresUsed:   coreuse,
      coresFree:   coreready,
      routeKm:     n(p.routelenkm),
      division,
      district,
      upazila,
      matchSide:   ms,
    }]
  })
}

// ─── Bahon (bahon-lines.geojson) ─────────────────────────────────
// div/dist — direct match for div/dist level; text search in a/b for upazila
export function filterBahon(
  features: { properties: Props }[],
  level: AdminLevel,
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    let mo = false
    let md = false

    if (level === 'division') {
      mo = ci(s(p.div), origin)
      md = ci(s(p.div), destination)
    } else if (level === 'district') {
      mo = ci(s(p.dist), origin)
      md = ci(s(p.dist), destination)
    } else {
      // upazila — fall back to text search in node names
      mo = contains(p.a, origin) || contains(p.b, origin)
      md = contains(p.a, destination) || contains(p.b, destination)
    }

    const ms = side(mo, md)
    if (!ms) return []
    const cn   = n(p.cn)
    const cu   = n(p.cu)
    const a    = s(p.a)
    const b    = s(p.b)
    const div  = s(p.div)
    const dist = s(p.dist)
    const fallback = dist || div
    const from = a || fallback
    const to   = b || fallback
    return [{
      id:          `bahon-${i}`,
      operatorKey: 'bahon' as OperatorKey,
      operator:    'Bahon',
      lineName:    (a && b) ? a + ' – ' + b : fallback,
      lineType:    s(p.ct),
      fromNode:    from,
      toNode:      to,
      coreCount:   cn,
      coresUsed:   cu,
      coresFree:   cn !== null && cu !== null ? cn - cu : null,
      routeKm:     n(p.m) !== null ? Math.round((n(p.m) as number) / 100) / 10 : null,
      division:    div,
      district:    dist,
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── BR Fiber (br-fiber-lines.geojson) ───────────────────────────
// name_a, name_b — text search
export function filterBRFiber(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const na = s(p.name_a)
    const nb = s(p.name_b)
    const mo = contains(na, origin)  || contains(nb, origin)
    const md = contains(na, destination) || contains(nb, destination)
    const ms = side(mo, md)
    if (!ms) return []
    const total  = n(p.total_core)
    const used   = n(p.used_core)
    const unused = n(p.unused_core)
    return [{
      id:          `br-${i}`,
      operatorKey: 'brfiber' as OperatorKey,
      operator:    'BR Fiber',
      lineName:    na + ' – ' + nb,
      lineType:    '',
      fromNode:    na,
      toNode:      nb,
      coreCount:   total,
      coresUsed:   used,
      coresFree:   unused,
      routeKm:     n(p.len_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── IS3 (is3-lines.geojson) ─────────────────────────────────────
// name — text search
export function filterIS3(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const name = s(p.name)
    const ms = side(contains(name, origin), contains(name, destination))
    if (!ms) return []
    const cores = typeof p.cores === 'number' ? p.cores : (parseInt(String(p.cores)) || null)
    const layer = s(p.layer)
    // names like "Deluti union to Dacope POP" — split on " to " (case-insensitive)
    const toIdx = name.toLowerCase().indexOf(' to ')
    const from  = toIdx >= 0 ? name.slice(0, toIdx).trim() : (layer || name)
    const to    = toIdx >= 0 ? name.slice(toIdx + 4).trim() : (layer || name)
    return [{
      id:          `is3-${i}`,
      operatorKey: 'is3' as OperatorKey,
      operator:    'IS3',
      lineName:    name,
      lineType:    layer,
      fromNode:    from,
      toNode:      to,
      coreCount:   cores,
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.len_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}

// ─── Operator Lines (opr-lines.geojson) ──────────────────────────
// line_name — text search
export function filterOprLines(
  features: { properties: Props }[],
  origin: string,
  destination: string,
): FiberSegment[] {
  return features.flatMap((f, i) => {
    const p = f.properties
    const lname = s(p.line_name)
    const ms = side(contains(lname, origin), contains(lname, destination))
    if (!ms) return []
    const dashIdx = lname.indexOf('-')
    const from    = dashIdx >= 0 ? lname.slice(0, dashIdx).trim() : lname
    const to      = dashIdx >= 0 ? lname.slice(dashIdx + 1).trim() : lname
    return [{
      id:          `opr-${i}`,
      operatorKey: 'oprlines' as OperatorKey,
      operator:    s(p.op_name),
      lineName:    lname,
      lineType:    '',
      fromNode:    from,
      toNode:      to,
      coreCount:   n(p.total_core),
      coresUsed:   null,
      coresFree:   null,
      routeKm:     n(p.route_km),
      division:    '',
      district:    '',
      upazila:     '',
      matchSide:   ms,
    }]
  })
}
