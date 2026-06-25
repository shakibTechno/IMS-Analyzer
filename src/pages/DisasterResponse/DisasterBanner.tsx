import type { DisasterStats } from '@/hooks/useDisasterStats'

interface Props {
  stats: DisasterStats
}

// ─── DisasterBanner ───────────────────────────────────────────────
// Full-width pulsing red banner pinned at top of the disaster page.
// Injects a keyframe animation via <style> so no CSS file is needed.

export default function DisasterBanner({ stats }: Props) {
  const { scenario, hoursActive, activatedAtLabel } = stats
  const daysActive  = Math.floor(hoursActive / 24)
  const hoursRem    = hoursActive % 24
  const durationStr = daysActive > 0
    ? `${daysActive}d ${hoursRem}h`
    : `${hoursActive}h`

  return (
    <>
      <style>{`
        @keyframes disasterPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.6; }
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
        borderRadius: 8, padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
      }}>
        {/* Left: icon + name + location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 28,
            animation: 'disasterPulse 1.8s ease-in-out infinite',
            display: 'block',
          }}>
            🚨
          </span>
          <div>
            <div style={{
              fontSize: 16, fontWeight: 800, color: 'white',
              letterSpacing: '0.02em', marginBottom: 3,
            }}>
              {scenario.name.toUpperCase()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 11, background: 'rgba(255,255,255,0.15)',
                color: '#fecaca', borderRadius: 4, padding: '2px 8px', fontWeight: 600,
              }}>
                ● ACTIVE OBSERVATION
              </span>
              <span style={{ fontSize: 12, color: '#fca5a5' }}>
                {scenario.affectedDivision} Division · {scenario.affectedDistrict} District
              </span>
              <span style={{ fontSize: 11, color: '#fca5a5' }}>
                Activated: {activatedAtLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: duration + activated by */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#fca5a5',
            fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {durationStr}
          </div>
          <div style={{ fontSize: 10, color: '#fecaca', marginTop: 2 }}>
            observation duration
          </div>
          <div style={{ fontSize: 10, color: '#fca5a5', marginTop: 4 }}>
            Activated by: {scenario.activatedBy}
          </div>
        </div>
      </div>
    </>
  )
}
