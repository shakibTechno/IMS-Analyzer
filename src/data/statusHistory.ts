// ─── Procedural status history generator ─────────────────────────
//
// Generates 30-day hourly status snapshots per site.
// Uses a seeded LCG (Linear Congruential Generator) so results are
// deterministic — same siteId + hour always produces the same status.
//
// Key behaviours:
//   - Active sites: ~90-95% of hours show 'active'
//   - Down sites:   last 48h mostly 'down' (disaster/outage onset)
//   - Degraded:     scattered degraded hours, current status preserved
//   - Sylhet disaster sites: sharp degradation from hour -48 onward

import type { SiteStatus, PowerSource } from '@/types/site'
import { SITES } from './sites'

export interface StatusSnapshot {
  timestamp: string    // ISO, hourly resolution
  status: SiteStatus
  powerSource: PowerSource
}

// ─── Simple seeded LCG ────────────────────────────────────────────
function lcgSeed(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash || 1
}

function lcgNext(seed: number): number {
  // Parameters from Numerical Recipes
  return ((seed * 1664525 + 1013904223) >>> 0) / 0xFFFFFFFF
}

// ─── Power source jitter ──────────────────────────────────────────
// Simulates brief power source transitions (e.g. grid→generator during outage)
function pickPower(basePower: PowerSource, rand: number, status: SiteStatus): PowerSource {
  if (status === 'down') return basePower  // last known before going down
  if (status === 'degraded' && rand < 0.3) {
    // Degraded often means running on backup
    if (basePower === 'grid') return rand < 0.15 ? 'generator' : 'grid'
  }
  // Small chance of power source transitions even when active
  if (rand < 0.04 && basePower === 'grid') return 'generator'
  return basePower
}

// ─── Main generator ───────────────────────────────────────────────
export function generateStatusHistory(
  siteId: string,
  days: 1 | 7 | 30 = 7,
): StatusSnapshot[] {
  const site = SITES.find(s => s.id === siteId)
  if (!site) return []

  const hours = days * 24
  const now = new Date('2026-04-13T08:00:00+06:00')
  const snapshots: StatusSnapshot[] = []

  // Disaster onset: 48h before now for Sylhet disaster sites
  const isDisasterSite = ['SYL-005', 'SYL-006', 'SYL-007', 'SYL-008'].includes(siteId)
  const isDownSite = site.status === 'down'
  const isDegradedSite = site.status === 'degraded'

  let seed = lcgSeed(siteId)

  for (let i = hours - 1; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000)
    seed = lcgSeed(siteId + i.toString())
    const rand = lcgNext(seed)
    const rand2 = lcgNext(lcgSeed(siteId + i + 'b'))

    let status: SiteStatus

    if (isDisasterSite && i < 48) {
      // Disaster window: mostly down, with brief partial recovery for SYL-008
      if (siteId === 'SYL-008') {
        status = i < 6 ? 'degraded' : 'down'
      } else {
        status = 'down'
      }
    } else if (isDownSite && i < 12) {
      // Non-disaster down sites: went down recently
      status = rand < 0.2 ? 'degraded' : 'down'
    } else if (isDegradedSite && i < 24) {
      // Currently degraded: oscillates between degraded and active
      status = rand < 0.55 ? 'degraded' : 'active'
    } else {
      // Normal operation: mostly active with occasional blips
      if (rand < 0.03) {
        status = 'down'
      } else if (rand < 0.10) {
        status = 'degraded'
      } else {
        status = 'active'
      }
    }

    const powerSource = pickPower(site.powerSource, rand2, status)

    snapshots.push({
      timestamp: ts.toISOString(),
      status,
      powerSource,
    })
  }

  return snapshots
}

// ─── Aggregate: count per status per day (for charts) ─────────────
export interface DailyStatusCount {
  date: string        // "Apr 07"
  active: number
  degraded: number
  down: number
}

export function getDailyStatusCounts(
  siteId: string,
  days: 1 | 7 | 30 = 7,
): DailyStatusCount[] {
  const snapshots = generateStatusHistory(siteId, days)
  const byDate: Record<string, DailyStatusCount> = {}

  for (const snap of snapshots) {
    const d = new Date(snap.timestamp)
    const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    if (!byDate[key]) byDate[key] = { date: key, active: 0, degraded: 0, down: 0 }
    byDate[key][snap.status]++
  }

  return Object.values(byDate)
}

// ─── Aggregate: national hourly counts (for overview chart) ───────
export interface NationalHourlyCount {
  time: string        // "08:00"
  active: number
  degraded: number
  down: number
}

export function getNationalHourlyCounts(hours = 24): NationalHourlyCount[] {
  const result: NationalHourlyCount[] = []
  const now = new Date('2026-04-13T08:00:00+06:00')

  for (let i = hours - 1; i >= 0; i--) {
    const ts = new Date(now.getTime() - i * 60 * 60 * 1000)
    const label = ts.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
    let active = 0, degraded = 0, down = 0

    for (const site of SITES) {
      const seed = lcgSeed(site.id + i.toString())
      const rand = lcgNext(seed)
      const isDisasterSite = ['SYL-005', 'SYL-006', 'SYL-007', 'SYL-008'].includes(site.id)

      let status: SiteStatus
      if (isDisasterSite && i < 48) {
        status = 'down'
      } else if (site.status === 'down' && i < 12) {
        status = rand < 0.3 ? 'degraded' : 'down'
      } else if (site.status === 'degraded' && i < 24) {
        status = rand < 0.5 ? 'degraded' : 'active'
      } else {
        status = rand < 0.03 ? 'down' : rand < 0.10 ? 'degraded' : 'active'
      }

      if (status === 'active') active++
      else if (status === 'degraded') degraded++
      else down++
    }

    result.push({ time: label, active, degraded, down })
  }

  return result
}
