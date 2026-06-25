import { useFilterStore } from '@/store/filterStore'
import PeriodSelect   from './PeriodSelect'
import DistrictSelect from './DistrictSelect'
import OperatorSelect from './OperatorSelect'
import AssetTypeSelect from './AssetTypeSelect'

// ─── FilterBar ────────────────────────────────────────────────────
// Horizontal strip with all filter selects + reset button.
// Reads hasActiveFilters() from Zustand to show/hide reset.

interface Props {
  show?: {
    period?:   boolean
    location?: boolean
    operator?: boolean
    asset?:    boolean
  }
  direction?: 'row' | 'column'
  compact?:   boolean
}

export default function FilterBar({ show = {}, direction = 'row', compact }: Props) {
  const {
    period:   showPeriod   = true,
    location: showLocation = true,
    operator: showOperator = true,
    asset:    showAsset    = true,
  } = show

  const isColumn = direction === 'column'
  const hasActive   = useFilterStore(s => s.hasActiveFilters())
  const resetFilters = useFilterStore(s => s.resetFilters)

  return (
    <div style={{
      display: 'flex',
      flexDirection: isColumn ? 'column' : 'row',
      alignItems: isColumn ? 'stretch' : 'center',
      flexWrap: isColumn ? 'nowrap' : 'wrap',
      gap: isColumn ? 6 : 8,
      padding: isColumn ? '4px 0' : '8px 0',
    }}>
      {isColumn && (
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
          Filters
        </div>
      )}

      {showPeriod && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Period</span>
          <PeriodSelect />
        </div>
      )}

      {showPeriod && !isColumn && (showLocation || showOperator || showAsset) && (
        <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />
      )}

      {showLocation && <DistrictSelect compact={compact} />}
      {showOperator && <OperatorSelect compact={compact} />}
      {showAsset    && <AssetTypeSelect compact={compact} />}

      {hasActive && (
        <button
          onClick={resetFilters}
          style={{
            height: 32, padding: '0 10px', fontSize: 12,
            borderRadius: 6, border: '1px solid #fca5a5',
            background: '#fef2f2', color: '#dc2626',
            cursor: 'pointer', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
          aria-label="Reset all filters"
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
          Reset
        </button>
      )}
    </div>
  )
}
