import type { AdminLevel } from '@/types/fiberReport'
import type { TowerOperatorKey } from '@/components/map/TowerOverlay'
import { TOWER_OPERATORS } from '@/components/map/TowerOverlay'
import type { TowerRow } from '@/types/towerReport'

type Props = Record<string, unknown>

// ─── Name normalization ───────────────────────────────────────────
// Tower Excel data spells admin names many ways (Jessore/Jashore,
// Comilla/Cumilla, BOGRA/Bogura...). Normalize: lowercase, strip
// non-alphanumerics, then map known variants to the boundary-file name.
const ALIASES: Record<string, string> = {
  barisal:          'barishal',
  chittagong:       'chattogram',
  comilla:          'cumilla',
  bogra:            'bogura',
  jessore:          'jashore',
  jhalakathi:       'jhalokati',
  jhalakati:        'jhalokati',
  jhalokathi:       'jhalokati',
  netrokona:        'netrakona',
  chapainawabganj:  'chapainababganj',
  chapainawabgonj:  'chapainababganj',
  nawabganj:        'chapainababganj',
  maulvibazar:      'moulvibazar',
  moulovibazar:     'moulvibazar',
  laxmipur:         'lakshmipur',
  jhenaida:         'jhenaidah',
  khagrachari:      'khagrachhari',
  bbaria:           'brahmanbaria',
  brammanbaria:     'brahmanbaria',
  panchgarh:        'panchagarh',
  sunamgnaj:        'sunamganj',
  narshingdi:       'narsingdi',
  mymenshigh:       'mymensingh',
  munshigonj:       'munshiganj',
  gopalgonj:        'gopalganj',
  thakugaon:        'thakurgaon',
}

export function normalizeAdminName(raw: string): string {
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, '')
  return ALIASES[key] ?? key
}

// GP thana values look like "BANDARBAN_BANDARBAN SADAR" — keep the
// part after the last underscore before normalizing.
function normalizeThana(raw: string): string {
  const idx = raw.lastIndexOf('_')
  return normalizeAdminName(idx >= 0 ? raw.slice(idx + 1) : raw)
}

function thanaMatches(rawThana: string, target: string): boolean {
  const a = normalizeThana(rawThana)
  const b = normalizeAdminName(target)
  if (!a || !b) return false
  if (a === b) return true
  // handles suffixed values like "Barishal Sadar (Kotwali)"
  return (a.length > 3 && b.length > 3) && (a.includes(b) || b.includes(a))
}

// ─── Tower type buckets ───────────────────────────────────────────
export type TowerTypeBucket = 'Ground-based' | 'Rooftop' | 'Other'

export function towerTypeBucket(raw: string): TowerTypeBucket {
  const t = raw.toUpperCase()
  if (!t) return 'Other'
  if (t.startsWith('RT') || t.includes('ROOF')) return 'Rooftop'
  if (t.startsWith('GB') || t.startsWith('GF') || t.includes('GREEN FIELD') ||
      t.includes('GROUND') || t.includes('GUYED')) return 'Ground-based'
  return 'Other'
}

// ─── Filter ───────────────────────────────────────────────────────
// All 8 tower GeoJSONs share one schema: id, t, o, tn, div, dist, th.
export function filterTowers(
  op: TowerOperatorKey,
  features: { properties: Props; geometry: { coordinates: number[] } }[],
  level: AdminLevel,
  area: string,
): TowerRow[] {
  const target = normalizeAdminName(area)

  return features.flatMap((f, i) => {
    const p = f.properties
    const div  = String(p.div  ?? '')
    const dist = String(p.dist ?? '')
    const th   = String(p.th   ?? '')

    let match = false
    if (level === 'division')      match = normalizeAdminName(div)  === target
    else if (level === 'district') match = normalizeAdminName(dist) === target
    else                           match = thanaMatches(th, area)
    if (!match) return []

    const [lon, lat] = f.geometry.coordinates
    const type = String(p.t ?? '')
    return [{
      id:          `${op}-${i}`,
      operatorKey: op,
      operator:    TOWER_OPERATORS[op].label,
      group:       TOWER_OPERATORS[op].group,
      towerId:     String(p.id ?? ''),
      towerType:   type,
      typeBucket:  towerTypeBucket(type),
      owner:       String(p.o  ?? ''),
      tenants:     String(p.tn ?? ''),
      division:    div,
      district:    dist,
      thana:       th.includes('_') ? th.slice(th.lastIndexOf('_') + 1) : th,
      lat:         typeof lat === 'number' ? lat : null,
      lon:         typeof lon === 'number' ? lon : null,
    }]
  })
}
