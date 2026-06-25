import { useFilterStore } from '@/store/filterStore'
import type { TimePeriod } from '@/types/filters'

const OPTIONS: { value: TimePeriod; label: string }[] = [
  { value: 'live', label: 'Live' },
  { value: '24h',  label: 'Last 24h' },
  { value: '7d',   label: 'Last 7d' },
  { value: '30d',  label: 'Last 30d' },
]

const SELECT_STYLE: React.CSSProperties = {
  height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6,
  border: '1px solid #e2e8f0', background: 'white', color: '#374151',
  cursor: 'pointer', outline: 'none',
}

export default function PeriodSelect() {
  const period    = useFilterStore(s => s.period)
  const setPeriod = useFilterStore(s => s.setPeriod)

  return (
    <select
      value={period}
      onChange={e => setPeriod(e.target.value as TimePeriod)}
      style={SELECT_STYLE}
      aria-label="Time period"
    >
      {OPTIONS.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
