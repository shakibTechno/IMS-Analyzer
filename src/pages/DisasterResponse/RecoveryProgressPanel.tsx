import type { DisasterStats } from '@/hooks/useDisasterStats'

interface Props {
  stats: DisasterStats
}

// ─── RecoveryProgressPanel ────────────────────────────────────────
// Large conic-gradient recovery ring + site status breakdown.

export default function RecoveryProgressPanel({ stats }: Props) {
  const {
    recoveryPercent,
    sitesRestored,
    sitesStillDown,
    sitesStillDegraded,
    sitesTotal,
  } = stats

  const ringColor = recoveryPercent >= 75 ? '#22c55e'
                  : recoveryPercent >= 50 ? '#f59e0b'
                  : '#ef4444'

  const ringDeg = Math.round((recoveryPercent / 100) * 360)

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '20px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
        textTransform: 'uppercase', letterSpacing: '0.05em', alignSelf: 'flex-start' }}>
        Recovery Progress
      </div>

      {/* Conic-gradient ring */}
      <div style={{ position: 'relative', width: 140, height: 140 }}>
        <div style={{
          width: 140, height: 140, borderRadius: '50%',
          background: `conic-gradient(${ringColor} 0deg ${ringDeg}deg, var(--card-bg-2) ${ringDeg}deg 360deg)`,
        }} />
        {/* Inner white circle for donut effect */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 100, height: 100, borderRadius: '50%',
          background: 'var(--card-bg)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: ringColor, lineHeight: 1 }}>
            {recoveryPercent}%
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>recovered</span>
        </div>
      </div>

      {/* Site status breakdown */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { label: 'Restored / Active', value: sitesRestored,      color: '#22c55e', icon: '✅' },
          { label: 'Still Down',        value: sitesStillDown,     color: '#ef4444', icon: '🔴' },
          { label: 'Degraded',          value: sitesStillDegraded, color: '#f59e0b', icon: '🟡' },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 12px', borderRadius: 7,
            background: `${row.color}0d`, border: `1px solid ${row.color}22`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 14 }}>{row.icon}</span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)' }}>{row.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: row.color,
                fontVariantNumeric: 'tabular-nums' }}>
                {row.value}
              </span>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>/ {sitesTotal}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: '100%' }}>
        <div style={{ height: 8, background: 'var(--card-bg-2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${recoveryPercent}%`,
            background: `linear-gradient(90deg, ${ringColor}, ${ringColor}cc)`,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 4, fontSize: 10, color: '#94a3b8',
        }}>
          <span>0%</span>
          <span>Target: 100% ({sitesTotal} sites)</span>
        </div>
      </div>
    </div>
  )
}
