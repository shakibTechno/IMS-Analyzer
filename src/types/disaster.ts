// ─── Disaster Response types ──────────────────────────────────────

export interface SiteSnapshot {
  totalSites: number
  activeSites: number
  downSites: number
  degradedSites: number
}

export interface OperatorImpact {
  operatorId: string
  totalSitesInDistrict: number
  affectedSites: number          // down + degraded
  restoredSites: number          // sites that returned to active after disaster onset
  percentRestored: number        // 0-100
}

export interface DisasterScenario {
  id: string
  name: string                   // "Sylhet Flash Flood 2026"
  affectedDistrict: string       // "Sylhet"
  affectedDivision: string       // "Sylhet"
  activatedAt: string            // ISO timestamp
  activatedBy: string            // "BTRC Admin"
  status: 'active' | 'resolved'
  baseline: SiteSnapshot & { snapshotTime: string }
  current: SiteSnapshot & { lastUpdated: string }
  recoveryPercent: number        // (current.activeSites / baseline.activeSites) * 100
  operatorImpact: OperatorImpact[]
}
