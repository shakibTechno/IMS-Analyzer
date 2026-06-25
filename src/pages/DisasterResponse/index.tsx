import PageWrapper from '@/components/layout/PageWrapper'
import KPICard      from '@/components/cards/KPICard'
import { useDisasterStats } from '@/hooks/useDisasterStats'
import DisasterBanner        from './DisasterBanner'
import RecoveryProgressPanel from './RecoveryProgressPanel'
import BaselineComparisonTable from './BaselineComparisonTable'
import OperatorImpactTable     from './OperatorImpactTable'
import AffectedSitesMap        from './AffectedSitesMap'

// ─── DisasterResponse ─────────────────────────────────────────────
// Route: /disaster
// Full situation-awareness view for the active Sylhet flood event.
//
// Layout:
//   1. Pulsing red banner (event name, duration, activated by)
//   2. KPI row (recovery%, down count, hours active)
//   3. Map (left) + Recovery ring (right)
//   4. Baseline comparison (left) + Operator impact (right)

export default function DisasterResponse() {
  const stats = useDisasterStats()

  const compColor = stats.recoveryPercent >= 75 ? '#22c55e'
                  : stats.recoveryPercent >= 50 ? '#f59e0b'
                  : '#ef4444'

  return (
    <PageWrapper>
      {/* ── Alert banner ────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <DisasterBanner stats={stats} />
      </div>

      {/* ── KPI row ──────────────────────────────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10, marginBottom: 14,
      }}>
        <KPICard
          title="Recovery Progress"
          value={stats.recoveryPercent}
          unit="%"
          icon="📈"
          accentColor={compColor}
          subtitle={`${stats.sitesRestored} of ${stats.sitesTotal} sites restored`}
          trend={stats.recoveryPercent >= 75 ? 'up' : 'down'}
        />
        <KPICard
          title="Sites Down"
          value={stats.sitesStillDown}
          unit=" sites"
          icon="🔴"
          accentColor="#ef4444"
          subtitle="Requiring immediate action"
          trend="down"
        />
        <KPICard
          title="Sites Degraded"
          value={stats.sitesStillDegraded}
          unit=" sites"
          icon="🟡"
          accentColor="#f59e0b"
          subtitle="Partial service only"
          trend={stats.sitesStillDegraded > 0 ? 'down' : 'neutral'}
        />
        <KPICard
          title="Observation Duration"
          value={stats.hoursActive}
          unit="h"
          icon="⏱️"
          accentColor="#6366f1"
          subtitle={`Active since ${stats.activatedAtLabel}`}
          trend="neutral"
        />
      </div>

      {/* ── Map + Recovery ring ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, marginBottom: 12 }}>
        <AffectedSitesMap stats={stats} />
        <RecoveryProgressPanel stats={stats} />
      </div>

      {/* ── Baseline table + Operator impact ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BaselineComparisonTable stats={stats} />
        <OperatorImpactTable     stats={stats} />
      </div>
    </PageWrapper>
  )
}
