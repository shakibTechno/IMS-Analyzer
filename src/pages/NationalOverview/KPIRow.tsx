import KPICard from '@/components/cards/KPICard'
import type { KPIs } from '@/utils/dataHelpers'

interface Props {
  kpis: KPIs
}

// ─── KPIRow ───────────────────────────────────────────────────────
// Six metric cards in a responsive grid: total, active%, down, degraded,
// active outages, compliance rate. Accent colors match status tokens.

export default function KPIRow({ kpis }: Props) {
  const compColor = kpis.complianceRate >= 90
    ? '#22c55e'
    : kpis.complianceRate >= 75 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gap: 10,
    }}>
      <KPICard
        title="Total Sites"
        value={kpis.total}
        icon="🗼"
        accentColor="#3b82f6"
        subtitle="Monitored nationwide"
      />
      <KPICard
        title="Active"
        value={kpis.activePct}
        unit="%"
        icon="✅"
        accentColor="#22c55e"
        subtitle={`${kpis.activeCount} sites`}
        trend={kpis.activePct >= 90 ? 'up' : 'down'}
      />
      <KPICard
        title="Down"
        value={kpis.downCount}
        unit=" sites"
        icon="🔴"
        accentColor="#ef4444"
        subtitle={`${kpis.downPct}% of total`}
        trend={kpis.downCount > 0 ? 'down' : 'neutral'}
      />
      <KPICard
        title="Degraded"
        value={kpis.degradedCount}
        unit=" sites"
        icon="🟡"
        accentColor="#f59e0b"
        subtitle={`${kpis.degradedPct}% of total`}
        trend={kpis.degradedCount > 0 ? 'down' : 'neutral'}
      />
      <KPICard
        title="Active Outages"
        value={kpis.activeOutages}
        icon="⚠️"
        accentColor={kpis.activeOutages > 0 ? '#ef4444' : '#22c55e'}
        subtitle={kpis.activeOutages > 0 ? 'Requires attention' : 'All clear'}
        trend={kpis.activeOutages > 0 ? 'down' : 'neutral'}
      />
      <KPICard
        title="Compliance"
        value={kpis.complianceRate}
        unit="%"
        icon="📋"
        accentColor={compColor}
        subtitle="Submission rate"
        trend={kpis.complianceRate >= 90 ? 'up' : kpis.complianceRate >= 75 ? 'neutral' : 'down'}
      />
    </div>
  )
}
