import type { DisasterStats } from '@/hooks/useDisasterStats'
import SectionHeader from '@/components/shared/SectionHeader'
import { formatTimestamp } from '@/utils/formatters'

interface Props {
  stats: DisasterStats
}

// ─── BaselineComparisonTable ──────────────────────────────────────
// Pre-disaster baseline vs current state, row by row.

export default function BaselineComparisonTable({ stats }: Props) {
  const { comparisonRows, scenario } = stats

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title="Baseline Comparison"
        subtitle={`Snapshot taken ${formatTimestamp(scenario.baseline.snapshotTime)}`}
      />

      {/* Column headers */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px',
        gap: 8, padding: '6px 10px', marginBottom: 2,
        borderBottom: '2px solid var(--border)',
      }}>
        {['Metric', 'Baseline', 'Current', 'Δ Change'].map(h => (
          <span key={h} style={{
            fontSize: 10, fontWeight: 700, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.05em',
            textAlign: h === 'Metric' ? 'left' : 'right',
          }}>
            {h}
          </span>
        ))}
      </div>

      {/* Data rows */}
      {comparisonRows.map((row, i) => (
        <div
          key={row.metric}
          style={{
            display: 'grid', gridTemplateColumns: '1fr 100px 100px 80px',
            gap: 8, padding: '9px 10px',
            background: i % 2 === 0 ? 'var(--card-bg)' : 'var(--card-bg-2)',
            borderRadius: 5,
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
            {row.metric}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right',
            fontVariantNumeric: 'tabular-nums' }}>
            {row.baseline}
          </span>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
            textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {row.current}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: row.delta === '—' ? '#94a3b8'
                   : row.improved ? '#22c55e' : '#ef4444',
              background: row.delta === '—' ? 'transparent'
                        : row.improved ? '#dcfce7' : '#fee2e2',
              borderRadius: 4, padding: row.delta === '—' ? 0 : '2px 6px',
            }}>
              {row.delta}
            </span>
          </div>
        </div>
      ))}

      {/* Footer note */}
      <div style={{
        marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border)',
        fontSize: 10, color: '#94a3b8',
      }}>
        Disaster ID: {scenario.id} · Last updated:{' '}
        {formatTimestamp(scenario.current.lastUpdated)}
      </div>
    </div>
  )
}
