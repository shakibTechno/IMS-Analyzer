import { useFilterStore } from '@/store/filterStore'
import { getDivisionBreakdown } from '@/utils/dataHelpers'
import { formatComplianceRate } from '@/utils/formatters'
import { useMemo } from 'react'

// ─── DivisionBreakdownPanel ───────────────────────────────────────
// Table of 8 divisions with site counts and status bars.
// Clicking a row sets the division filter.

const DIVISION_FLAG: Record<string, string> = {
  Dhaka:       '🏙️',
  Chattogram:  '⚓',
  Sylhet:      '🌊',  // disaster
  Rajshahi:    '🌾',
  Khulna:      '🐅',
  Barisal:     '🚢',
  Rangpur:     '🌿',
  Mymensingh:  '🏛️',
}

export default function DivisionBreakdownPanel() {
  const setDivision   = useFilterStore(s => s.setDivision)
  const activeDivision = useFilterStore(s => s.division)
  const breakdown = useMemo(() => getDivisionBreakdown(), [])

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      padding: '14px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 16px' }}>
        Division Breakdown
      </div>

      {/* Header row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 48px 48px 48px 56px 60px',
        padding: '4px 16px', gap: 8, borderBottom: '1px solid #f1f5f9',
      }}>
        {['Division', 'Total', 'Active', 'Down', 'Deg.', 'Health'].map(h => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: h === 'Division' ? 'left' : 'right' }}>
            {h}
          </span>
        ))}
      </div>

      {breakdown.map(row => {
        const isActive  = activeDivision === row.division
        const compliance = formatComplianceRate(row.activePct)

        return (
          <div
            key={row.division}
            onClick={() => setDivision(isActive ? null : row.division)}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 48px 48px 48px 56px 60px',
              padding: '7px 16px', gap: 8,
              background: isActive ? '#eff6ff' : 'transparent',
              borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
          >
            {/* Division name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span style={{ fontSize: 13 }}>{DIVISION_FLAG[row.division] ?? '📍'}</span>
              <span style={{
                fontSize: 12, fontWeight: isActive ? 700 : 500,
                color: isActive ? '#1d4ed8' : '#374151',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {row.division}
              </span>
              {row.division === 'Sylhet' && (
                <span style={{ fontSize: 9, background: '#fee2e2', color: '#dc2626',
                  borderRadius: 3, padding: '1px 4px', fontWeight: 700, flexShrink: 0 }}>
                  DISASTER
                </span>
              )}
            </div>

            {/* Counts */}
            <span style={{ fontSize: 12, color: '#1e293b', textAlign: 'right',
              fontVariantNumeric: 'tabular-nums' }}>{row.total}</span>
            <span style={{ fontSize: 12, color: '#22c55e', textAlign: 'right',
              fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{row.active}</span>
            <span style={{ fontSize: 12, color: row.down > 0 ? '#ef4444' : '#94a3b8',
              textAlign: 'right', fontWeight: row.down > 0 ? 700 : 400,
              fontVariantNumeric: 'tabular-nums' }}>{row.down}</span>
            <span style={{ fontSize: 12, color: row.degraded > 0 ? '#f59e0b' : '#94a3b8',
              textAlign: 'right', fontWeight: row.degraded > 0 ? 700 : 400,
              fontVariantNumeric: 'tabular-nums' }}>{row.degraded}</span>

            {/* Health % */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: compliance.color }}>
                {row.activePct}%
              </span>
            </div>
          </div>
        )
      })}

      {activeDivision && (
        <div style={{ padding: '6px 16px', borderTop: '1px solid #f1f5f9' }}>
          <button
            onClick={() => setDivision(null)}
            style={{
              fontSize: 11, color: '#3b82f6', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, fontWeight: 500,
            }}
          >
            ← Show all divisions
          </button>
        </div>
      )}
    </div>
  )
}
