import { useState, useMemo } from 'react'
import PageWrapper from '@/components/layout/PageWrapper'
import { OPERATOR_MAP } from '@/data/operators'
import { getOperatorKPIs } from '@/utils/dataHelpers'
import { SITES } from '@/data/sites'
import { formatOperatorType } from '@/utils/formatters'
import OperatorSelector         from './OperatorSelector'
import OperatorKPIRow           from './OperatorKPIRow'
import SubmissionCompliancePanel from './SubmissionCompliancePanel'
import OutageHistoryPanel        from './OutageHistoryPanel'
import TenancyBreakdownPanel     from './TenancyBreakdownPanel'

// ─── OperatorDashboard ────────────────────────────────────────────
// Per-operator view with local selection state (not global filter).
// Layout: tabs → KPIs → compliance chart + outage history + tenancy

export default function OperatorDashboard() {
  const [selectedId, setSelectedId] = useState('OP-GP')

  const operator = OPERATOR_MAP[selectedId]
  const kpis     = useMemo(() => getOperatorKPIs(selectedId), [selectedId])

  const ownedSites = useMemo(
    () => SITES.filter(s => s.operatorId === selectedId),
    [selectedId],
  )

  const divisionCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of ownedSites) {
      map[s.division] = (map[s.division] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [ownedSites])

  if (!operator) return null

  return (
    <PageWrapper>
      {/* ── Operator tabs ──────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <OperatorSelector selectedId={selectedId} onChange={setSelectedId} />
      </div>

      {/* ── Operator header banner ────────────────────────────── */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
        borderLeft: `4px solid ${operator.color}`,
        padding: '12px 16px', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, background: operator.color,
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, flexShrink: 0,
          }}>
            {operator.initials}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{operator.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
              {formatOperatorType(operator.type)} · {ownedSites.length} sites across{' '}
              {divisionCounts.length} division{divisionCounts.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Division mini-badges */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 320 }}>
          {divisionCounts.map(([div, cnt]) => (
            <span key={div} style={{
              fontSize: 10, padding: '2px 7px', borderRadius: 9999,
              background: `${operator.color}18`, color: operator.color,
              fontWeight: 600,
            }}>
              {div} ({cnt})
            </span>
          ))}
        </div>
      </div>

      {/* ── KPI row ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <OperatorKPIRow kpis={kpis} operator={operator} />
      </div>

      {/* ── Main body ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <SubmissionCompliancePanel operatorId={selectedId} />
        <OutageHistoryPanel operatorId={selectedId} />
      </div>

      {/* ── Tenancy panel ─────────────────────────────────────── */}
      <TenancyBreakdownPanel operatorId={selectedId} />
    </PageWrapper>
  )
}
