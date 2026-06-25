// ─── Alert types ──────────────────────────────────────────────────

export type AlertType =
  | 'rapid_degradation'
  | 'operator_blackout'
  | 'power_cascade'
  | 'submission_gap'

export type AlertSeverity = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  district: string | null
  operatorId: string | null
  triggeredAt: string       // ISO timestamp
  acknowledged: boolean
}
