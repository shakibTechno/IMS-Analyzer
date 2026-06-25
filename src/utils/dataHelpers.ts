// ─── Pure data aggregation helpers ───────────────────────────────
// No side effects. No React. Input → output only.
// All functions are safe to call outside React components.

import type { Site, PowerSource } from '@/types/site'
import type { FilterState } from '@/types/filters'
import { SITES } from '@/data/sites'
import { OPERATORS } from '@/data/operators'
import { SUBMISSION_HISTORY } from '@/data/submissionHistory'

// ─── Filtering ────────────────────────────────────────────────────

export function getFilteredSites(sites: Site[], filters: FilterState): Site[] {
  return sites.filter(site => {
    if (filters.division     && site.division   !== filters.division)     return false
    if (filters.district     && site.district   !== filters.district)     return false
    if (filters.operatorId   && site.operatorId !== filters.operatorId)   return false
    if (filters.assetType    && site.type       !== filters.assetType)    return false
    if (filters.operatorType) {
      const op = OPERATORS.find(o => o.id === site.operatorId)
      if (!op || op.type !== filters.operatorType) return false
    }
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      if (!filters.statusFilter.includes(site.status)) return false
    }
    return true
  })
}

export function getOperatorSites(sites: Site[], operatorId: string): Site[] {
  return sites.filter(s => s.operatorId === operatorId)
}

// ─── KPI aggregation ─────────────────────────────────────────────

export interface KPIs {
  total:          number
  activeCount:    number
  downCount:      number
  degradedCount:  number
  activePct:      number   // 0-100
  downPct:        number
  degradedPct:    number
  activeOutages:  number
  complianceRate: number   // 0-100, based on submissionStatus
  powerBreakdown: Record<PowerSource, number>
  powerBreakdownPct: Record<PowerSource, number>
}

export function getKPIs(sites: Site[]): KPIs {
  const total      = sites.length
  const activeCount   = sites.filter(s => s.status === 'active').length
  const downCount     = sites.filter(s => s.status === 'down').length
  const degradedCount = sites.filter(s => s.status === 'degraded').length
  const activeOutages = sites.filter(s => s.hasActiveOutage).length

  const onTime = sites.filter(s => s.submissionStatus === 'on_time').length
  const complianceRate = total > 0 ? Math.round((onTime / total) * 100) : 0

  const powerBreakdown: Record<PowerSource, number> = {
    grid: 0, generator: 0, battery: 0, solar: 0,
  }
  for (const site of sites) {
    powerBreakdown[site.powerSource]++
  }

  const powerBreakdownPct: Record<PowerSource, number> = {
    grid:      total > 0 ? Math.round((powerBreakdown.grid      / total) * 100) : 0,
    generator: total > 0 ? Math.round((powerBreakdown.generator / total) * 100) : 0,
    battery:   total > 0 ? Math.round((powerBreakdown.battery   / total) * 100) : 0,
    solar:     total > 0 ? Math.round((powerBreakdown.solar     / total) * 100) : 0,
  }

  return {
    total,
    activeCount,
    downCount,
    degradedCount,
    activePct:    total > 0 ? Math.round((activeCount   / total) * 100) : 0,
    downPct:      total > 0 ? Math.round((downCount     / total) * 100) : 0,
    degradedPct:  total > 0 ? Math.round((degradedCount / total) * 100) : 0,
    activeOutages,
    complianceRate,
    powerBreakdown,
    powerBreakdownPct,
  }
}

// ─── Operator KPIs ────────────────────────────────────────────────

export interface OperatorKPIs {
  operatorId:       string
  totalSites:       number
  activeSites:      number
  downSites:        number
  degradedSites:    number
  activePct:        number
  complianceRate:   number   // from submissionHistory (7-day average)
  sevenDayAvgComp:  number
}

export function getOperatorKPIs(operatorId: string): OperatorKPIs {
  const sites = SITES.filter(s => s.operatorId === operatorId)
  const total       = sites.length
  const activeSites = sites.filter(s => s.status === 'active').length
  const downSites   = sites.filter(s => s.status === 'down').length
  const degraded    = sites.filter(s => s.status === 'degraded').length

  // 7-day average compliance from submission history
  const opHistory = SUBMISSION_HISTORY.filter(r => r.operatorId === operatorId)
  const avgComp = opHistory.length > 0
    ? Math.round(opHistory.reduce((sum, r) => sum + r.complianceRate, 0) / opHistory.length)
    : 0

  return {
    operatorId,
    totalSites:      total,
    activeSites,
    downSites,
    degradedSites:   degraded,
    activePct:       total > 0 ? Math.round((activeSites / total) * 100) : 0,
    complianceRate:  avgComp,
    sevenDayAvgComp: avgComp,
  }
}

// ─── National summary stats ───────────────────────────────────────

export interface NationalSummary {
  totalSites:         number
  totalActive:        number
  totalDown:          number
  totalDegraded:      number
  activePct:          number
  totalOperators:     number
  totalActiveOutages: number
  avgComplianceRate:  number
  powerBreakdown:     Record<PowerSource, number>
}

export function getNationalSummary(): NationalSummary {
  const kpis = getKPIs(SITES)
  return {
    totalSites:         kpis.total,
    totalActive:        kpis.activeCount,
    totalDown:          kpis.downCount,
    totalDegraded:      kpis.degradedCount,
    activePct:          kpis.activePct,
    totalOperators:     OPERATORS.length,
    totalActiveOutages: kpis.activeOutages,
    avgComplianceRate:  kpis.complianceRate,
    powerBreakdown:     kpis.powerBreakdown,
  }
}

// ─── Division breakdown ────────────────────────────────────────────

export interface DivisionSummary {
  division:    string
  total:       number
  active:      number
  down:        number
  degraded:    number
  activePct:   number
}

export function getDivisionBreakdown(): DivisionSummary[] {
  const byDivision: Record<string, Site[]> = {}
  for (const site of SITES) {
    if (!byDivision[site.division]) byDivision[site.division] = []
    byDivision[site.division].push(site)
  }

  return Object.entries(byDivision).map(([division, sites]) => {
    const total    = sites.length
    const active   = sites.filter(s => s.status === 'active').length
    const down     = sites.filter(s => s.status === 'down').length
    const degraded = sites.filter(s => s.status === 'degraded').length
    return {
      division,
      total,
      active,
      down,
      degraded,
      activePct: total > 0 ? Math.round((active / total) * 100) : 0,
    }
  }).sort((a, b) => b.total - a.total)
}

// ─── Tenancy helpers ──────────────────────────────────────────────

export interface TenancySummary {
  totalTowerSites:   number   // sites where type === 'tower'
  sharedTowers:      number   // towers with ≥ 1 tenant
  exclusiveTowers:   number   // towers with 0 tenants
  avgTenantsPerTower: number
}

export function getTenancySummary(sites: Site[]): TenancySummary {
  const towers = sites.filter(s => s.type === 'tower')
  const shared  = towers.filter(s => s.tenants.length > 0)
  const exclusive = towers.filter(s => s.tenants.length === 0)
  const totalTenants = towers.reduce((sum, s) => sum + s.tenants.length, 0)
  return {
    totalTowerSites:    towers.length,
    sharedTowers:       shared.length,
    exclusiveTowers:    exclusive.length,
    avgTenantsPerTower: towers.length > 0
      ? Math.round((totalTenants / towers.length) * 10) / 10
      : 0,
  }
}
