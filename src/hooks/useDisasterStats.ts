// ─── useDisasterStats ─────────────────────────────────────────────
// Derives enriched disaster response metrics from the static scenario.
// Returns computed fields useful for dashboard panels and charts.

import { useMemo } from 'react'
import { DISASTER_SCENARIO } from '@/data/disasterScenario'
import { SITES } from '@/data/sites'
import { OPERATORS } from '@/data/operators'
import type { DisasterScenario, OperatorImpact } from '@/types/disaster'

export interface DisasterStats {
  scenario: DisasterScenario

  // Recovery
  recoveryPercent:     number    // 0-100
  sitesRestored:       number
  sitesStillDown:      number
  sitesStillDegraded:  number
  sitesTotal:          number

  // Duration
  hoursActive:         number    // hours since activation
  activatedAtLabel:    string    // "11 Apr 2026, 06:35"

  // Affected sites list
  affectedSites: Array<{
    id:           string
    name:         string
    status:       string
    operatorName: string
    district:     string
  }>

  // Per-operator impact (enriched with operator names)
  operatorImpact: Array<OperatorImpact & { operatorName: string; operatorColor: string }>

  // Baseline comparison rows for table
  comparisonRows: Array<{
    metric:    string
    baseline:  string | number
    current:   string | number
    delta:     string
    improved:  boolean
  }>
}

export function useDisasterStats(): DisasterStats {
  return useMemo(() => {
    const s = DISASTER_SCENARIO

    const recoveryPercent    = s.recoveryPercent
    const sitesRestored      = s.current.activeSites
    const sitesStillDown     = s.current.downSites
    const sitesStillDegraded = s.current.degradedSites
    const sitesTotal         = s.baseline.totalSites

    // Hours active since activation
    const now         = new Date('2026-04-13T08:00:00+06:00')
    const activatedAt = new Date(s.activatedAt)
    const hoursActive = Math.round((now.getTime() - activatedAt.getTime()) / 3_600_000)

    const activatedAtLabel = activatedAt.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })

    // Affected sites (down or degraded in the disaster district)
    const affectedSites = SITES
      .filter(site =>
        site.division === s.affectedDivision &&
        (site.status === 'down' || site.status === 'degraded')
      )
      .map(site => {
        const op = OPERATORS.find(o => o.id === site.operatorId)
        return {
          id:           site.id,
          name:         site.name,
          status:       site.status,
          operatorName: op?.shortName ?? site.operatorId,
          district:     site.district,
        }
      })

    // Enriched operator impact
    const operatorImpact = s.operatorImpact.map(impact => {
      const op = OPERATORS.find(o => o.id === impact.operatorId)
      return {
        ...impact,
        operatorName:  op?.shortName   ?? impact.operatorId,
        operatorColor: op?.color       ?? '#6b7280',
      }
    })

    // Baseline comparison table rows
    const baselineActivePct  = Math.round((s.baseline.activeSites  / s.baseline.totalSites) * 100)
    const currentActivePct   = Math.round((s.current.activeSites   / s.current.totalSites)  * 100)
    const deltaActivePct     = currentActivePct - baselineActivePct

    const comparisonRows = [
      {
        metric:   'Total Sites',
        baseline:  s.baseline.totalSites,
        current:   s.current.totalSites,
        delta:    '—',
        improved: true,
      },
      {
        metric:   'Active Sites',
        baseline: `${s.baseline.activeSites} (${baselineActivePct}%)`,
        current:  `${s.current.activeSites} (${currentActivePct}%)`,
        delta:    `${deltaActivePct > 0 ? '+' : ''}${deltaActivePct}%`,
        improved: deltaActivePct >= 0,
      },
      {
        metric:   'Down Sites',
        baseline:  s.baseline.downSites,
        current:   s.current.downSites,
        delta:    `+${s.current.downSites - s.baseline.downSites}`,
        improved: false,
      },
      {
        metric:   'Degraded Sites',
        baseline:  s.baseline.degradedSites,
        current:   s.current.degradedSites,
        delta:    `+${s.current.degradedSites - s.baseline.degradedSites}`,
        improved: false,
      },
      {
        metric:   'Recovery Progress',
        baseline: '100%',
        current:  `${recoveryPercent}%`,
        delta:    `−${100 - recoveryPercent}%`,
        improved: recoveryPercent >= 75,
      },
    ]

    return {
      scenario: s,
      recoveryPercent,
      sitesRestored,
      sitesStillDown,
      sitesStillDegraded,
      sitesTotal,
      hoursActive,
      activatedAtLabel,
      affectedSites,
      operatorImpact,
      comparisonRows,
    }
  }, [])  // static data — only compute once
}
