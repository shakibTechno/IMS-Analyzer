import { useFilterStore } from '@/store/filterStore'
import { SITES, DIVISIONS } from '@/data/sites'

function selectStyle(compact?: boolean): React.CSSProperties {
  return compact
    ? { height: 20, padding: '0 5px', fontSize: 10, borderRadius: 4, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', minWidth: 90 }
    : { height: 32, padding: '0 8px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-primary)', cursor: 'pointer', outline: 'none', minWidth: 120 }
}

export default function DistrictSelect({ compact }: { compact?: boolean }) {
  const division    = useFilterStore(s => s.division)
  const district    = useFilterStore(s => s.district)
  const setDivision = useFilterStore(s => s.setDivision)
  const setDistrict = useFilterStore(s => s.setDistrict)

  // Districts available in the selected division (or all if no division)
  const districts = division
    ? [...new Set(SITES.filter(s => s.division === division).map(s => s.district))].sort()
    : [...new Set(SITES.map(s => s.district))].sort()

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {/* Division */}
      <select
        value={division ?? ''}
        onChange={e => setDivision(e.target.value || null)}
        style={selectStyle(compact)}
        aria-label="Division"
      >
        <option value="">All Divisions</option>
        {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* District — only shown when division selected */}
      {division && (
        <select
          value={district ?? ''}
          onChange={e => setDistrict(e.target.value || null)}
          style={selectStyle(compact)}
          aria-label="District"
        >
          <option value="">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      )}
    </div>
  )
}
