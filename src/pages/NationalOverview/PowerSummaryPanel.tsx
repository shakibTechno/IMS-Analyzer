import PowerSourcePieChart from '@/components/charts/PowerSourcePieChart'
import { POWER_COLORS } from '@/utils/statusColors'
import type { PowerSource } from '@/types/site'
import type { KPIs } from '@/utils/dataHelpers'

interface Props {
  kpis: KPIs
}

const SOURCES: PowerSource[] = ['grid', 'generator', 'battery', 'solar']

// ─── PowerSummaryPanel ────────────────────────────────────────────
// Donut chart + simple stat rows for power source distribution.

export default function PowerSummaryPanel({ kpis }: Props) {
  const chartData = SOURCES.map(source => ({
    source,
    count: kpis.powerBreakdown[source],
  })).filter(d => d.count > 0)

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10,
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Power Sources
      </div>

      <PowerSourcePieChart data={chartData} height={160} showLegend={false} />

      {/* Stat rows below chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        {SOURCES.map(source => {
          const count = kpis.powerBreakdown[source]
          if (count === 0) return null
          const pct   = kpis.powerBreakdownPct[source]
          const c     = POWER_COLORS[source]
          return (
            <div key={source} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{c.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{c.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Progress bar */}
                <div style={{ width: 60, height: 4, background: 'var(--card-bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: c.hex, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                  minWidth: 24, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  {count}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', minWidth: 32 }}>({pct}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
