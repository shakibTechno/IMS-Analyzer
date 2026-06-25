import { useMemo } from 'react'
import { OUTAGE_LOG } from '@/data/outageLog'
import { formatTimestamp, formatOutageDuration, formatTimeAgo } from '@/utils/formatters'
import SectionHeader from '@/components/shared/SectionHeader'
import EmptyState    from '@/components/shared/EmptyState'

interface Props {
  siteId: string
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
  scheduled_maintenance: 'Scheduled Maintenance',
}

// ─── OutageIncidentLog ────────────────────────────────────────────
// Full incident history for a single site. Ongoing shown first.

export default function OutageIncidentLog({ siteId }: Props) {
  const incidents = useMemo(() =>
    OUTAGE_LOG
      .filter(i => i.siteId === siteId)
      .sort((a, b) => {
        if (!a.resolved && b.resolved) return -1
        if (a.resolved && !b.resolved)  return 1
        return new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      }),
    [siteId],
  )

  const ongoingCount = incidents.filter(i => !i.resolved).length

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title="Outage Incident Log"
        subtitle={`${incidents.length} incident${incidents.length !== 1 ? 's' : ''} on record`}
        action={ongoingCount > 0 ? (
          <span style={{
            fontSize: 11, background: '#fef2f2', color: '#dc2626',
            borderRadius: 9999, padding: '2px 8px', fontWeight: 700,
          }}>
            {ongoingCount} ongoing
          </span>
        ) : undefined}
      />

      {incidents.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No outages recorded"
          message="This site has no outage incidents in the dataset."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {incidents.map(inc => {
            const isOngoing = !inc.resolved
            return (
              <div
                key={inc.id}
                style={{
                  borderRadius: 7, overflow: 'hidden',
                  border: isOngoing ? '1px solid #fca5a5' : '1px solid #f1f5f9',
                  background: isOngoing ? '#fef9f9' : 'white',
                }}
              >
                {/* Header row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderBottom: '1px solid',
                  borderBottomColor: isOngoing ? '#fca5a5' : '#f1f5f9',
                  background: isOngoing ? '#fee2e2' : '#f8fafc',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{TYPE_ICON[inc.type]}</span>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                        {TYPE_LABEL[inc.type]}
                      </span>
                      <span style={{
                        marginLeft: 8, fontSize: 10, fontFamily: 'monospace',
                        color: '#64748b', background: '#e2e8f0',
                        borderRadius: 3, padding: '1px 5px',
                      }}>
                        {inc.id}
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: isOngoing ? '#dc2626' : '#22c55e',
                    background: isOngoing ? '#fee2e2' : '#dcfce7',
                    borderRadius: 9999, padding: '2px 8px',
                  }}>
                    {isOngoing ? '● Ongoing' : '✓ Resolved'}
                  </span>
                </div>

                {/* Detail grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 0, padding: '10px 12px',
                }}>
                  {[
                    { label: 'Started',   value: formatTimestamp(inc.startTime) },
                    { label: 'Duration',  value: formatOutageDuration(inc.startTime, inc.endTime) },
                    { label: 'Reported',  value: formatTimeAgo(inc.startTime) },
                    { label: 'Resolved',  value: inc.endTime ? formatTimestamp(inc.endTime) : '—' },
                  ].map(row => (
                    <div key={row.label} style={{ marginBottom: 6 }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600,
                        textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {row.label}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginTop: 1 }}>
                        {row.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {inc.notes && (
                  <div style={{
                    padding: '8px 12px', borderTop: '1px solid #f1f5f9',
                    fontSize: 11, color: '#64748b', fontStyle: 'italic',
                  }}>
                    {inc.notes}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
