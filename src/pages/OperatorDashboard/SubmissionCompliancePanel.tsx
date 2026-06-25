import { useMemo } from 'react'
import ComplianceTimeline from '@/components/charts/ComplianceTimeline'
import SectionHeader      from '@/components/shared/SectionHeader'
import { SUBMISSION_HISTORY } from '@/data/submissionHistory'
import { formatComplianceRate } from '@/utils/formatters'

interface Props {
  operatorId: string
}

// ─── SubmissionCompliancePanel ────────────────────────────────────
// Stacked bar chart of daily on-time / late / missing submissions
// for the selected operator, plus summary stats.

export default function SubmissionCompliancePanel({ operatorId }: Props) {
  const history = useMemo(
    () => SUBMISSION_HISTORY.filter(r => r.operatorId === operatorId)
          .sort((a, b) => a.date.localeCompare(b.date)),
    [operatorId],
  )

  const avgCompliance = useMemo(() => {
    if (!history.length) return 0
    return Math.round(history.reduce((s, r) => s + r.complianceRate, 0) / history.length)
  }, [history])

  const lowestDay = useMemo(() => {
    if (!history.length) return null
    return history.reduce((lo, r) => r.complianceRate < lo.complianceRate ? r : lo)
  }, [history])

  const compliance = formatComplianceRate(avgCompliance)

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title="Submission Compliance — 7 Days"
        subtitle="Daily on-time / late / missing submissions"
        action={
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: `${compliance.color}18`, borderRadius: 6,
            padding: '4px 10px',
          }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>7-day avg</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: compliance.color }}>
              {avgCompliance}%
            </span>
          </div>
        }
      />

      <ComplianceTimeline data={history} height={200} />

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)',
      }}>
        {[
          { label: 'Total Expected', value: history.reduce((s, r) => s + r.totalExpected, 0).toLocaleString() },
          { label: 'Total Submitted', value: history.reduce((s, r) => s + r.submitted, 0).toLocaleString() },
          { label: 'Lowest Day', value: lowestDay ? `${lowestDay.complianceRate}% (${lowestDay.date.slice(5)})` : '—' },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
