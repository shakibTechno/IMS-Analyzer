// ─── KPICard ──────────────────────────────────────────────────────
// Metric display card with optional trend arrow and color accent.

interface Props {
  title:       string
  value:       number | string
  unit?:       string               // appended after value: "%" or " sites"
  icon?:       string               // emoji
  trend?:      'up' | 'down' | 'neutral'
  trendValue?: string               // e.g. "+3 since yesterday"
  accentColor?: string              // left-border accent hex
  subtitle?:   string               // small text below value
  size?:       'sm' | 'md'
}

function TrendArrow({ trend, trendValue }: { trend: 'up' | 'down' | 'neutral'; trendValue?: string }) {
  const color = trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : '#94a3b8'
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 2 }}>
      <span style={{ color, fontSize: 8, fontWeight: 700 }}>{arrow}</span>
      {trendValue && (
        <span style={{ color: '#94a3b8', fontSize: 8 }}>{trendValue}</span>
      )}
    </div>
  )
}

export default function KPICard({
  title, value, unit, icon, trend, trendValue, accentColor, subtitle, size = 'md',
}: Props) {
  const isSmall = size === 'sm'

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 4,
      border: '1px solid var(--border)',
      borderLeft: accentColor ? `2px solid ${accentColor}` : '1px solid var(--border)',
      padding: isSmall ? '4px 6px' : '6px 7px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
      minWidth: 0,
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {icon && <span style={{ fontSize: isSmall ? 9 : 11 }}>{icon}</span>}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span style={{
          fontSize: isSmall ? 13 : 16,
          fontWeight: 700,
          color: accentColor ?? 'var(--text-primary)',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: isSmall ? 8 : 9, fontWeight: 500, color: '#94a3b8' }}>
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>{subtitle}</div>
      )}

      {trend && (
        <TrendArrow trend={trend} trendValue={trendValue} />
      )}
    </div>
  )
}
