import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { OUTAGE_LOG } from '@/data/outageLog'
import { SITE_MAP } from '@/data/sites'
import { formatTimeAgo, formatOutageDuration } from '@/utils/formatters'

interface Props {
  operatorId: string
}

const TYPE_ICON: Record<string, string> = {
  power_failure:         '⚡',
  link_outage:           '🔗',
  equipment_fault:       '🔧',
  scheduled_maintenance: '🛠️',
}

const TYPE_LABEL: Record<string, string> = {
  power_failure:         'Power Failure',
  link_outage:           'Link Outage',
  equipment_fault:       'Equipment Fault',
  scheduled_maintenance: 'Maintenance',
}

// ─── OutageHistoryPanel ───────────────────────────────────────────
// All outage incidents for the selected operator (ongoing first).

export default function OutageHistoryPanel({ operatorId }: Props) {
  const navigate = useNavigate()

  const incidents = useMemo(() => {
    return OUTAGE_LOG
      .filter(i => i.operatorId === operatorId)
      .sort((a, b) => {
        if (!a.resolved && b.resolved) return -1
        if (a.resolved && !b.resolved) return  1
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      })
  }, [operatorId])

  const ongoingCount = incidents.filter(i => !i.resolved).length

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Outage History
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
            Last 7 days · {incidents.length} incident{incidents.length !== 1 ? 's' : ''}
          </div>
        </div>
        {ongoingCount > 0 && (
          <span style={{
            fontSize: 11, background: '#fef2f2', color: '#dc2626',
            borderRadius: 9999, padding: '2px 8px', fontWeight: 700,
          }}>
            {ongoingCount} ongoing
          </span>
        )}
      </div>

      {incidents.length === 0 ? (
        <div style={{
          padding: '24px 0', textAlign: 'center',
          color: '#94a3b8', fontSize: 13,
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
          No outages recorded in the past 7 days
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 340, overflowY: 'auto' }}>
          {incidents.map(inc => {
            const site      = SITE_MAP[inc.siteId]
            const isOngoing = !inc.resolved

            return (
              <div
                key={inc.id}
                onClick={() => navigate(`/sites/${inc.siteId}`)}
                style={{
                  padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                  borderLeft: isOngoing ? '3px solid #ef4444' : '3px solid var(--border)',
                  background: isOngoing ? 'rgba(239,68,68,0.07)' : 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = isOngoing ? 'rgba(239,68,68,0.12)' : 'var(--card-bg-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = isOngoing ? 'rgba(239,68,68,0.07)' : 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, minWidth: 0 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{TYPE_ICON[inc.type]}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {site?.name ?? inc.siteId}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                        {TYPE_LABEL[inc.type]}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inc.notes}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: isOngoing ? 700 : 400,
                      color: isOngoing ? '#dc2626' : '#94a3b8' }}>
                      {isOngoing ? 'Ongoing' : formatTimeAgo(inc.startTime)}
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                      {formatOutageDuration(inc.startTime, inc.endTime)}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
