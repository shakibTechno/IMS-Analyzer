import { useState, useEffect, useRef } from 'react'
import type { AdminLevel, TowerOperatorKey, TowerRow } from '@/types/towerReport'
import { TOWER_OPERATORS } from '@/components/map/TowerOverlay'
import { useTowerReport } from '@/hooks/useTowerReport'
import { loadAdminOptions } from '@/hooks/useFiberReport'
import SimplePieChart from '@/components/charts/SimplePieChart'
import Pagination from '@/components/shared/Pagination'

const ALL_OPS  = Object.keys(TOWER_OPERATORS) as TowerOperatorKey[]
const MNO_OPS  = ALL_OPS.filter(k => TOWER_OPERATORS[k].group === 'mno')
const TC_OPS   = ALL_OPS.filter(k => TOWER_OPERATORS[k].group === 'towerco')

// ─── CSV export ───────────────────────────────────────────────────
function exportCSV(rows: TowerRow[], area: string) {
  const headers = ['Operator','Group','Tower ID','Tower Type','Owner','Tenants','Thana','District','Division','Lat','Lon']
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.operator,
      r.group === 'mno' ? 'MNO' : 'TowerCo',
      `"${r.towerId}"`,
      `"${r.towerType}"`,
      `"${r.owner}"`,
      `"${r.tenants.replace(/"/g, '""')}"`,
      `"${r.thana}"`,
      r.district,
      r.division,
      r.lat ?? '',
      r.lon ?? '',
    ].join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `tower-report-${area}.csv`
  a.click()
}

// ─── Summary bar ─────────────────────────────────────────────────
function SummaryBar({ rows }: { rows: TowerRow[] }) {
  const byOp = ALL_OPS.map(k => ({
    label: TOWER_OPERATORS[k].label,
    color: TOWER_OPERATORS[k].color,
    count: rows.filter(r => r.operatorKey === k).length,
  })).filter(o => o.count > 0)

  const mno     = rows.filter(r => r.group === 'mno').length
  const towerco = rows.filter(r => r.group === 'towerco').length
  const shared  = rows.filter(r => r.tenants && r.tenants !== '0').length

  const card = (label: string, value: number, sub?: string, color = 'var(--text-primary)') => (
    <div key={label} style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '12px 16px',
      minWidth: 100,
    }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 1 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        {card('Total Towers', rows.length)}
        {mno     > 0 && card('MNO-owned',     mno)}
        {towerco > 0 && card('TowerCo-owned', towerco)}
        {shared  > 0 && card('With Tenants',  shared, 'shared towers')}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {byOp.map(o => card(o.label, o.count, undefined, o.color))}
      </div>
    </div>
  )
}

// ─── Charts row ───────────────────────────────────────────────────
function ChartsRow({ rows }: { rows: TowerRow[] }) {
  if (rows.length === 0) return null

  const byOperator = ALL_OPS
    .map(k => ({ name: TOWER_OPERATORS[k].label, value: rows.filter(r => r.operatorKey === k).length, color: TOWER_OPERATORS[k].color }))
    .filter(d => d.value > 0)

  const byType = [
    { name: 'Ground-based', color: '#059669', value: rows.filter(r => r.typeBucket === 'Ground-based').length },
    { name: 'Rooftop',      color: '#1d4ed8', value: rows.filter(r => r.typeBucket === 'Rooftop').length },
    { name: 'Other',        color: '#94a3b8', value: rows.filter(r => r.typeBucket === 'Other').length },
  ].filter(d => d.value > 0)

  const byGroup = [
    { name: 'MNO-owned',     color: '#0066cc', value: rows.filter(r => r.group === 'mno').length },
    { name: 'TowerCo-owned', color: '#7c3aed', value: rows.filter(r => r.group === 'towerco').length },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
      <SimplePieChart title="Towers by Operator" data={byOperator} />
      {byType.length  > 1 && <SimplePieChart title="Tower Type"      data={byType} />}
      {byGroup.length > 1 && <SimplePieChart title="MNO vs TowerCo"  data={byGroup} />}
    </div>
  )
}

// ─── Result table ─────────────────────────────────────────────────
function ResultTable({ rows, area }: { rows: TowerRow[]; area: string }) {
  const [sortCol,  setSortCol]  = useState<keyof TowerRow>('operator')
  const [sortAsc,  setSortAsc]  = useState(true)
  const [opFilter, setOpFilter] = useState<TowerOperatorKey | 'all'>('all')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const toggleSort = (col: keyof TowerRow) => {
    if (sortCol === col) setSortAsc(v => !v)
    else { setSortCol(col); setSortAsc(true) }
    setPage(1)
  }

  const filtered = rows
    .filter(r => opFilter === 'all' || r.operatorKey === opFilter)
    .sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortAsc ? cmp : -cmp
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize)

  const presentOps = ALL_OPS.filter(k => rows.some(r => r.operatorKey === k))

  const th = (col: keyof TowerRow, label: string): React.ReactNode => (
    <th
      key={col}
      onClick={() => toggleSort(col)}
      style={{
        padding: '8px 12px',
        textAlign: 'left',
        fontSize: 11,
        fontWeight: 700,
        color: sortCol === col ? '#1d4ed8' : '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        borderBottom: '2px solid var(--border)',
        background: 'var(--card-bg-2)',
      }}
    >
      {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
    </th>
  )

  const td: React.CSSProperties = {
    padding: '7px 12px',
    fontSize: 12.5,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
    maxWidth: 200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{rows.length.toLocaleString()}</strong> towers found
        </div>

        {[
          { key: 'all' as const, label: `All (${rows.length})` },
          ...presentOps.map(k => ({
            key: k as TowerOperatorKey | 'all',
            label: `${TOWER_OPERATORS[k].label} (${rows.filter(r => r.operatorKey === k).length})`,
          })),
        ].map(p => (
          <button
            key={String(p.key)}
            onClick={() => { setOpFilter(p.key); setPage(1) }}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: opFilter === p.key ? `2px solid ${p.key !== 'all' ? TOWER_OPERATORS[p.key].color : '#1d4ed8'}` : '1px solid var(--border)',
              background: opFilter === p.key ? (p.key !== 'all' ? TOWER_OPERATORS[p.key].color + '14' : '#eff6ff') : 'var(--card-bg)',
              color: opFilter === p.key ? (p.key !== 'all' ? TOWER_OPERATORS[p.key].color : '#1d4ed8') : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}

        <button
          onClick={() => exportCSV(filtered, area)}
          style={{
            padding: '6px 14px',
            borderRadius: 7,
            border: '1px solid #d1fae5',
            background: '#ecfdf5',
            color: '#065f46',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ↓ CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {th('operator',  'Operator')}
              {th('towerId',   'Tower ID')}
              {th('typeBucket','Category')}
              {th('towerType', 'Type')}
              {th('tenants',   'Tenants')}
              {th('thana',     'Thana')}
              {th('district',  'District')}
              {th('division',  'Division')}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, idx) => (
              <tr key={r.id} style={{ background: idx % 2 === 0 ? 'var(--card-bg)' : 'var(--card-bg-2)' }}>
                <td style={td}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: TOWER_OPERATORS[r.operatorKey].color + '18',
                    color: TOWER_OPERATORS[r.operatorKey].color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {r.operator}
                  </span>
                </td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{r.towerId || '—'}</td>
                <td style={td}>
                  <span style={{
                    padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: r.typeBucket === 'Ground-based' ? '#dcfce7' : r.typeBucket === 'Rooftop' ? '#dbeafe' : '#f1f5f9',
                    color:      r.typeBucket === 'Ground-based' ? '#166534' : r.typeBucket === 'Rooftop' ? '#1e40af' : '#64748b',
                  }}>
                    {r.typeBucket}
                  </span>
                </td>
                <td style={{ ...td, color: '#64748b' }}>{r.towerType || '—'}</td>
                <td style={{ ...td, maxWidth: 220 }} title={r.tenants}>{r.tenants && r.tenants !== '0' ? r.tenants : '—'}</td>
                <td style={td}>{r.thana || '—'}</td>
                <td style={td}>{r.district || '—'}</td>
                <td style={td}>{r.division || '—'}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No towers found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={s => { setPageSize(s); setPage(1) }}
        />
      </div>
    </div>
  )
}

// ─── Filter panel ─────────────────────────────────────────────────
const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: 7,
  border: '1px solid var(--border)',
  background: 'var(--card-bg)',
  fontSize: 13,
  color: 'var(--text-primary)',
  outline: 'none',
  cursor: 'pointer',
}

function OperatorToggles({ keys, operators, onToggle }: {
  keys: TowerOperatorKey[]
  operators: Set<TowerOperatorKey>
  onToggle: (k: TowerOperatorKey) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {keys.map(key => {
        const active = operators.has(key)
        const color  = TOWER_OPERATORS[key].color
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            style={{
              padding: '5px 13px',
              borderRadius: 6,
              border:     active ? `2px solid ${color}` : '1px solid var(--border)',
              background: active ? color + '14' : 'var(--card-bg-2)',
              color:      active ? color        : '#94a3b8',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {TOWER_OPERATORS[key].label}
          </button>
        )
      })}
    </div>
  )
}

function FilterPanel({ onGenerate, loading }: {
  onGenerate: (f: { level: AdminLevel; area: string; operators: Set<TowerOperatorKey> }) => void
  loading: boolean
}) {
  const [level,      setLevel]      = useState<AdminLevel>('district')
  const [options,    setOptions]    = useState<string[]>([])
  const [optLoading, setOptLoading] = useState(false)
  const [area,       setArea]       = useState('')
  const [operators,  setOperators]  = useState<Set<TowerOperatorKey>>(new Set(ALL_OPS))

  useEffect(() => {
    setOptLoading(true)
    setArea('')
    loadAdminOptions(level)
      .then(setOptions)
      .finally(() => setOptLoading(false))
  }, [level])

  function toggleOp(key: TowerOperatorKey) {
    setOperators(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else               next.add(key)
      return next
    })
  }

  const canGenerate = !!area && operators.size > 0 && !loading

  const groupLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: '0.07em',
    margin: '8px 0 5px',
  }

  return (
    <div style={{
      background: 'var(--card-bg)',
      borderRadius: 10,
      border: '1px solid var(--border)',
      padding: 20,
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
        Filter Parameters
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 18 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            Level
          </label>
          <select value={level} onChange={e => setLevel(e.target.value as AdminLevel)} style={selectStyle}>
            <option value="division">Division</option>
            <option value="district">District</option>
            <option value="upazila">Upazila</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
          <select
            value={area}
            onChange={e => setArea(e.target.value)}
            style={selectStyle}
            disabled={optLoading}
          >
            <option value="">— Select —</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Operators */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Operators
          </span>
          <button onClick={() => setOperators(new Set(ALL_OPS))} style={{ fontSize: 11, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>All</button>
          <button onClick={() => setOperators(new Set())}        style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>None</button>
        </div>
        <div style={groupLabel}>MNO Towers</div>
        <OperatorToggles keys={MNO_OPS} operators={operators} onToggle={toggleOp} />
        <div style={groupLabel}>TowerCo</div>
        <OperatorToggles keys={TC_OPS} operators={operators} onToggle={toggleOp} />
      </div>

      <button
        onClick={() => onGenerate({ level, area, operators })}
        disabled={!canGenerate}
        style={{
          padding: '10px 28px',
          borderRadius: 8,
          border: 'none',
          background: canGenerate ? '#1d4ed8' : '#e2e8f0',
          color:      canGenerate ? 'white'   : '#94a3b8',
          fontSize: 13,
          fontWeight: 700,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s',
        }}
      >
        {loading ? 'Generating…' : 'Generate Report'}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function TowerReport() {
  const { results, loading, error, generate, clear } = useTowerReport()
  const [hasGenerated, setHasGenerated] = useState(false)
  const [lastArea,     setLastArea]     = useState('')
  const tableRef = useRef<HTMLDivElement>(null)

  async function handleGenerate(filters: Parameters<typeof generate>[0]) {
    setLastArea(filters.area)
    setHasGenerated(true)
    await generate(filters)
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', background: 'var(--bg-base)', minHeight: '100%' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Tower Report</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          View towers within a geographic area across MNOs (GP, Robi, Banglalink, Teletalk) and
          TowerCos (edotco, Summit Towers, Kirtonkhola, Frontier Towers).
        </p>
      </div>

      <FilterPanel onGenerate={handleGenerate} loading={loading} />

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#dc2626', fontSize: 13, marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading tower data…
        </div>
      )}

      {hasGenerated && !loading && (
        <div ref={tableRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Results — {lastArea}
            </h2>
            <button
              onClick={() => { clear(); setHasGenerated(false) }}
              style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px', cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
          <SummaryBar rows={results} />
          <ChartsRow rows={results} />
          <ResultTable rows={results} area={lastArea} />
        </div>
      )}
    </div>
  )
}
