// ─── Display formatting utilities ─────────────────────────────────
// Pure functions. No React. No side effects.
// All date inputs are ISO strings or Date objects.

// ─── Timestamps ──────────────────────────────────────────────────

/** "13 Apr 2026, 07:45" */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** "07:45" */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

/** "13 Apr 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

/** "Apr 07" — for chart axis labels */
export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short',
  })
}

/**
 * Time elapsed since an ISO timestamp — "2h 15m ago", "just now", "3d ago"
 * Reference point: fixed demo time 2026-04-13T08:00:00+06:00
 */
export function formatTimeAgo(iso: string): string {
  const now  = new Date('2026-04-13T08:00:00+06:00').getTime()
  const then = new Date(iso).getTime()
  const diffMs = now - then

  if (diffMs < 0)              return 'just now'
  if (diffMs < 60_000)         return 'just now'
  if (diffMs < 3_600_000) {
    const m = Math.floor(diffMs / 60_000)
    return `${m}m ago`
  }
  if (diffMs < 86_400_000) {
    const h = Math.floor(diffMs / 3_600_000)
    const m = Math.floor((diffMs % 3_600_000) / 60_000)
    return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
  }
  const d = Math.floor(diffMs / 86_400_000)
  return `${d}d ago`
}

// ─── Durations ────────────────────────────────────────────────────

/** 265 → "4h 25m" */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return 'Ongoing'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/** Duration between two ISO timestamps, or "Ongoing" if endTime is null */
export function formatOutageDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return 'Ongoing'
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime()
  return formatDuration(Math.round(diffMs / 60_000))
}

// ─── Numbers & percentages ────────────────────────────────────────

/** 72.6 → "72.6%" */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** 72 → "72%" (integer, no decimals) */
export function formatPct(value: number): string {
  return `${Math.round(value)}%`
}

/** 1234 → "1,234" */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

/** Compliance rate with color hint: 90+ = good, 75-89 = warning, <75 = danger */
export function formatComplianceRate(rate: number): {
  label: string
  color: string
  level: 'good' | 'warning' | 'danger'
} {
  const label = `${rate}%`
  if (rate >= 90) return { label, color: '#22c55e', level: 'good'    }
  if (rate >= 75) return { label, color: '#f59e0b', level: 'warning' }
  return              { label, color: '#ef4444', level: 'danger'  }
}

// ─── Site / asset labels ──────────────────────────────────────────

/** "tower" → "Tower" */
export function formatAssetType(type: string): string {
  const map: Record<string, string> = {
    tower:    'Tower',
    bts:      'BTS',
    nttn_pop: 'NTTN PoP',
  }
  return map[type] ?? type
}

/** "mno" → "Mobile Network Operator" */
export function formatOperatorType(type: string): string {
  const map: Record<string, string> = {
    mno:           'Mobile Network Operator',
    nttn:          'NTTN Operator',
    tower_company: 'Tower Company',
  }
  return map[type] ?? type
}

/** "mno" → "MNO" */
export function formatOperatorTypeShort(type: string): string {
  const map: Record<string, string> = {
    mno:           'MNO',
    nttn:          'NTTN',
    tower_company: 'Tower Co.',
  }
  return map[type] ?? type
}

/** "on_time" → "On Time" */
export function formatSubmissionStatus(status: string): string {
  const map: Record<string, string> = {
    on_time: 'On Time',
    late:    'Late',
    missing: 'Missing',
  }
  return map[status] ?? status
}

/** Alert type → readable label */
export function formatAlertType(type: string): string {
  const map: Record<string, string> = {
    rapid_degradation: 'Rapid Degradation',
    operator_blackout: 'Operator Blackout',
    power_cascade:     'Power Cascade',
    submission_gap:    'Submission Gap',
  }
  return map[type] ?? type
}
