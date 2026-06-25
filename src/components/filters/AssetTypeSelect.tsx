import { useFilterStore } from '@/store/filterStore'
import type { AssetType } from '@/types/site'

const OPTIONS: { value: AssetType; label: string }[] = [
  { value: 'tower',    label: 'Tower' },
  { value: 'bts',      label: 'BTS' },
  { value: 'nttn_pop', label: 'NTTN PoP' },
]

export default function AssetTypeSelect({ compact }: { compact?: boolean }) {
  const style: React.CSSProperties = compact
    ? { height: 20, padding: '0 5px', fontSize: 10, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', minWidth: 85 }
    : { height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', minWidth: 110 }
  const assetType    = useFilterStore(s => s.assetType)
  const setAssetType = useFilterStore(s => s.setAssetType)

  return (
    <select
      value={assetType ?? ''}
      onChange={e => setAssetType((e.target.value as AssetType) || null)}
      style={style}
      aria-label="Asset type"
    >
      <option value="">All Assets</option>
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
