import type { Alert } from '@/types/alert'
import { ALERT_COLORS } from '@/utils/statusColors'
import { formatTimeAgo, formatAlertType } from '@/utils/formatters'

// ─── Alert type icons ─────────────────────────────────────────────
const ALERT_TYPE_ICONS: Record<string, string> = {
  rapid_degradation: '📉',
  operator_blackout: '📵',
  power_cascade:     '⚡',
  submission_gap:    '⏱️',
}

interface Props {
  alert: Alert
}

export default function AlertItem({ alert }: Props) {
  const colors = ALERT_COLORS[alert.severity]
  const icon   = ALERT_TYPE_ICONS[alert.type] ?? '🔔'

  return (
    <div style={{
      display: 'flex', gap: 10,
      padding: '10px 14px',
      borderBottom: '1px solid #f1f5f9',
      borderLeft: `3px solid ${colors.hex}`,
      background: alert.acknowledged ? '#fafafa' : 'white',
      opacity: alert.acknowledged ? 0.6 : 1,
    }}>
      {/* Icon */}
      <div style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 2 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>
            {alert.title}
          </div>
          {/* Severity badge */}
          <span style={{
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
            background: colors.hex + '22', color: colors.hex,
            letterSpacing: '0.05em',
          }}>
            {colors.label}
          </span>
        </div>

        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.45, marginBottom: 4 }}>
          {alert.description}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, color: '#94a3b8',
            background: '#f8fafc', padding: '1px 6px', borderRadius: 4,
            border: '1px solid #e2e8f0',
          }}>
            {formatAlertType(alert.type)}
          </span>
          {alert.district && (
            <span style={{ fontSize: 10, color: '#94a3b8' }}>
              📍 {alert.district}
            </span>
          )}
          <span style={{ fontSize: 10, color: '#cbd5e1', marginLeft: 'auto' }}>
            {formatTimeAgo(alert.triggeredAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
