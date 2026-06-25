import KPICard from '@/components/cards/KPICard'
import type { OperatorKPIs } from '@/utils/dataHelpers'
import type { Operator } from '@/types/operator'

interface Props {
  kpis:     OperatorKPIs
  operator: Operator
}

// ─── OperatorKPIRow ───────────────────────────────────────────────
// 5 metric cards specific to the selected operator.

export default function OperatorKPIRow({ kpis, operator }: Props) {
  const compColor = kpis.sevenDayAvgComp >= 90
    ? '#22c55e'
    : kpis.sevenDayAvgComp >= 75 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 10,
    }}>
      <KPICard
        title="Total Sites"
        value={kpis.totalSites}
        icon="🗼"
        accentColor={operator.color}
        subtitle={`Owned by ${operator.shortName}`}
      />
      <KPICard
        title="Active"
        value={kpis.activePct}
        unit="%"
        icon="✅"
        accentColor="#22c55e"
        subtitle={`${kpis.activeSites} sites`}
        trend={kpis.activePct >= 90 ? 'up' : 'down'}
      />
      <KPICard
        title="Down"
        value={kpis.downSites}
        unit=" sites"
        icon="🔴"
        accentColor={kpis.downSites > 0 ? '#ef4444' : '#22c55e'}
        trend={kpis.downSites > 0 ? 'down' : 'neutral'}
      />
      <KPICard
        title="Degraded"
        value={kpis.degradedSites}
        unit=" sites"
        icon="🟡"
        accentColor={kpis.degradedSites > 0 ? '#f59e0b' : '#22c55e'}
        trend={kpis.degradedSites > 0 ? 'down' : 'neutral'}
      />
      <KPICard
        title="7-Day Compliance"
        value={kpis.sevenDayAvgComp}
        unit="%"
        icon="📋"
        accentColor={compColor}
        subtitle="Avg submission rate"
        trend={kpis.sevenDayAvgComp >= 90 ? 'up' : kpis.sevenDayAvgComp >= 75 ? 'neutral' : 'down'}
        trendValue={kpis.sevenDayAvgComp < 75 ? 'Below 75% target' : undefined}
      />
    </div>
  )
}
