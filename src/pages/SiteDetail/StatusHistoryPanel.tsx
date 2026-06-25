import { useMemo } from 'react'
import { generateStatusHistory, getDailyStatusCounts } from '@/data/statusHistory'
import { STATUS_COLORS } from '@/utils/statusColors'
import type { SiteStatus } from '@/types/site'
import SectionHeader from '@/components/shared/SectionHeader'

interface Props {
  siteId: string
}

const STATUS_HEX: Record<SiteStatus, string> = {
  active:   '#22c55e',
  degraded: '#f59e0b',
  down:     '#ef4444',
}

// ─── StatusHistoryPanel ───────────────────────────────────────────
// Two sub-panels:
//   1. 24-hour block timeline (hourly colored segments)
//   2. 7-day daily summary (hours per status as stacked segments)

export default function StatusHistoryPanel({ siteId }: Props) {
  const last24h = useMemo(
    () => generateStatusHistory(siteId, 1),
    [siteId],
  )

  const daily7d = useMemo(
    () => getDailyStatusCounts(siteId, 7),
    [siteId],
  )

  // Uptime % for last 24h
  const activeHours = last24h.filter(s => s.status === 'active').length
  const uptimePct   = last24h.length > 0 ? Math.round((activeHours / last24h.length) * 100) : 0

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* ── 24-hour timeline ─────────────────────────────────── */}
      <SectionHeader
        title="Last 24 Hours"
        subtitle="Hourly status — each block = 1 hour"
        action={
          <div style={{
            fontSize: 13, fontWeight: 700,
            color: uptimePct >= 95 ? '#22c55e' : uptimePct >= 75 ? '#f59e0b' : '#ef4444',
          }}>
            {uptimePct}% uptime
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 2, marginBottom: 4 }}>
        {last24h.map((snap, i) => (
          <div
            key={i}
            title={`${new Date(snap.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} — ${snap.status}`}
            style={{
              flex: 1, height: 24, borderRadius: 2,
              background: STATUS_HEX[snap.status],
              opacity: snap.status === 'active' ? 0.7 : 1,
              cursor: 'default',
              transition: 'opacity 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = snap.status === 'active' ? '0.7' : '1')}
          />
        ))}
      </div>

      {/* Time axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        {[-24, -18, -12, -6, 0].map(offset => {
          const d = new Date('2026-04-13T08:00:00+06:00')
          d.setHours(d.getHours() + offset)
          return (
            <span key={offset} style={{ fontSize: 10, color: '#94a3b8' }}>
              {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {(['active', 'degraded', 'down'] as SiteStatus[]).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: STATUS_HEX[s] }} />
            <span style={{ fontSize: 11, color: '#64748b' }}>
              {STATUS_COLORS[s].label} ({last24h.filter(x => x.status === s).length}h)
            </span>
          </div>
        ))}
      </div>

      {/* ── 7-day daily summary ───────────────────────────────── */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
        <SectionHeader
          title="7-Day Summary"
          subtitle="Hours per status per day"
        />

        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end' }}>
          {daily7d.map(day => {
            const total = day.active + day.degraded + day.down
            if (total === 0) return null
            return (
              <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {/* Stacked bar */}
                <div style={{ width: '100%', height: 80, display: 'flex', flexDirection: 'column-reverse', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: `${(day.active   / total) * 100}%`, background: STATUS_HEX.active,   minHeight: day.active   > 0 ? 2 : 0 }} />
                  <div style={{ height: `${(day.degraded / total) * 100}%`, background: STATUS_HEX.degraded, minHeight: day.degraded > 0 ? 2 : 0 }} />
                  <div style={{ height: `${(day.down     / total) * 100}%`, background: STATUS_HEX.down,     minHeight: day.down     > 0 ? 2 : 0 }} />
                </div>
                {/* Date label */}
                <span style={{ fontSize: 10, color: '#94a3b8' }}>{day.date.slice(0, 5)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
