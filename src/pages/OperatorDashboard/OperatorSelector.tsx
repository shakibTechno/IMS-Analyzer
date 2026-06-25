import { OPERATORS } from '@/data/operators'
import { SITES } from '@/data/sites'
import OperatorLogo from '@/components/cards/OperatorLogo'
interface Props {
  selectedId: string
  onChange:   (id: string) => void
}

const TYPE_LABEL: Record<string, string> = {
  mno:           'MNO',
  nttn:          'NTTN',
  tower_company: 'Tower',
}

// ─── OperatorSelector ─────────────────────────────────────────────
// Horizontal tab row — one button per operator with colored badge.

export default function OperatorSelector({ selectedId, onChange }: Props) {
  return (
    <div style={{
      display: 'flex', gap: 8, flexWrap: 'wrap',
    }}>
      {OPERATORS.map(op => {
        const isSelected = op.id === selectedId
        const siteCount  = SITES.filter(s => s.operatorId === op.id).length

        return (
          <button
            key={op.id}
            onClick={() => onChange(op.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
              border: isSelected ? `2px solid ${op.color}` : '1px solid var(--border)',
              background: isSelected ? `${op.color}12` : 'var(--card-bg)',
              boxShadow: isSelected ? `0 0 0 3px ${op.color}22` : '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s',
              outline: 'none',
            }}
          >
            <OperatorLogo operator={op} size={32} />

            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: 13, fontWeight: isSelected ? 700 : 500,
                color: isSelected ? op.color : 'var(--text-primary)',
              }}>
                {op.shortName}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>
                {TYPE_LABEL[op.type]} · {siteCount} sites
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
