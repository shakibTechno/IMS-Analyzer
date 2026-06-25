import type { DisasterStats } from '@/hooks/useDisasterStats'
import SectionHeader from '@/components/shared/SectionHeader'

interface Props {
  stats: DisasterStats
}

// ─── OperatorImpactTable ──────────────────────────────────────────
// Per-operator impact breakdown with recovery progress bars.

export default function OperatorImpactTable({ stats }: Props) {
  const { operatorImpact } = stats

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title="Operator Impact"
        subtitle="Sites in affected division per operator"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {operatorImpact.map(op => {
          const pct     = op.percentRestored
          const barColor = pct === 100 ? '#22c55e'
                         : pct >= 50   ? '#f59e0b'
                         : '#ef4444'

          const statusLabel = pct === 100 ? 'Fully Restored'
                            : pct === 0   ? 'All Affected'
                            : `${pct}% Restored`

          return (
            <div key={op.operatorId} style={{
              padding: '10px 12px', borderRadius: 7,
              border: '1px solid var(--border)',
              background: op.affectedSites > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.08)',
            }}>
              {/* Operator header */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: op.operatorColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0,
                  }}>
                    {op.operatorId.replace('OP-', '')}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {op.operatorName}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: barColor,
                  background: `${barColor}18`,
                  borderRadius: 9999, padding: '2px 8px',
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* Stats row */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4, marginBottom: 8,
              }}>
                {[
                  { label: 'In Division', value: op.totalSitesInDistrict, color: '#64748b' },
                  { label: 'Affected',    value: op.affectedSites,        color: '#ef4444' },
                  { label: 'Restored',    value: op.restoredSites,        color: '#22c55e' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: stat.color,
                      fontVariantNumeric: 'tabular-nums' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recovery bar */}
              <div style={{ height: 6, background: 'var(--card-bg-2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${pct}%`,
                  background: barColor,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
