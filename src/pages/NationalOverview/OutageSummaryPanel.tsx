import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { OUTAGE_LOG } from '@/data/outageLog'
import { SITE_MAP } from '@/data/sites'
import { OPERATOR_MAP } from '@/data/operators'
import { formatTimeAgo, formatOutageDuration } from '@/utils/formatters'

// ─── OutageSummaryPanel ───────────────────────────────────────────
// Shows up to 6 most recent incidents (ongoing first), with site link.

const TYPE_ICON: Record<string, string> = {
  power_failure:          '⚡',
  link_outage:            '🔗',
  equipment_fault:        '🔧',
  scheduled_maintenance:  '🛠️',
}

const TYPE_LABEL: Record<string, string> = {
  power_failure:          'Power Failure',
  link_outage:            'Link Outage',
  equipment_fault:        'Equipment Fault',
  scheduled_maintenance:  'Maintenance',
}

export default function OutageSummaryPanel() {
  const navigate = useNavigate()

  const incidents = useMemo(() => {
    return [...OUTAGE_LOG]
      .sort((a, b) => {
        if (!a.resolved && b.resolved) return -1
        if (a.resolved && !b.resolved) return  1
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      })
      .slice(0, 6)
  }, [])

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Recent Outages
        </span>
        <span style={{
          fontSize: 11, background: '#fef2f2', color: '#dc2626',
          borderRadius: 9999, padding: '2px 8px', fontWeight: 600,
        }}>
          {OUTAGE_LOG.filter(o => !o.resolved).length} ongoing
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {incidents.map(inc => {
          const site = SITE_MAP[inc.siteId]
          const op   = OPERATOR_MAP[inc.operatorId]
          const isOngoing = !inc.resolved

          return (
            <div
              key={inc.id}
              onClick={() => navigate(`/sites/${inc.siteId}`)}
              style={{
                padding: '7px 8px', borderRadius: 6, cursor: 'pointer',
                borderLeft: isOngoing ? '3px solid #ef4444' : '3px solid var(--border)',
                background: isOngoing ? 'rgba(239,68,68,0.07)' : 'transparent',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--card-bg-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = isOngoing ? 'rgba(239,68,68,0.07)' : 'transparent')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{TYPE_ICON[inc.type]}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {site?.name ?? inc.siteId}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {TYPE_LABEL[inc.type]} · {op?.shortName ?? inc.operatorId}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: isOngoing ? '#dc2626' : '#94a3b8', fontWeight: isOngoing ? 600 : 400 }}>
                    {isOngoing ? 'Ongoing' : formatTimeAgo(inc.startTime)}
                  </div>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>
                    {formatOutageDuration(inc.startTime, inc.endTime)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
