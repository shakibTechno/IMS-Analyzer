import { useState, useEffect, useRef } from 'react'
import type { AdminLevel, BTSOperatorKey, BTSSite } from '@/types/btsReport'
import { BTS_OPERATOR_LABELS, BTS_OPERATOR_COLOR } from '@/types/btsReport'
import { useBTSReport } from '@/hooks/useBTSReport'
import { loadAdminOptions } from '@/hooks/useFiberReport'
import SimplePieChart from '@/components/charts/SimplePieChart'
import Pagination from '@/components/shared/Pagination'

const ALL_OPS: BTSOperatorKey[] = ['gp', 'robi', 'banglalink', 'summit']

// ─── CSV export ───────────────────────────────────────────────────
function exportCSV(rows: BTSSite[], area: string) {
  const headers = ['Operator','Site Name','Site Type','TX','2G','3G','4G','Division','District','Upazila','Lat','Lon']
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.operator,
      `"${r.siteName}"`,
      r.siteType  || '',
      r.txType    || '',
      r.has2G === null ? '' : r.has2G ? 'Yes' : 'No',
      r.has3G === null ? '' : r.has3G ? 'Yes' : 'No',
      r.has4G === null ? '' : r.has4G ? 'Yes' : 'No',
      r.division,
      r.district,
      r.upazila,
      r.lat ?? '',
      r.lon ?? '',
    ].join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `bts-report-${area}.csv`
  a.click()
}

// ─── Gen badge ────────────────────────────────────────────────────
function GenBadge({ value, label }: { value: boolean | null; label: string }) {
  if (value === null) return <span style={{ color: '#cbd5e1', fontSize: 11 }}>—</span>
  return (
    <span style={{
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      background: value ? '#dcfce7' : '#f1f5f9',
      color:      value ? '#166534' : '#94a3b8',
    }}>
      {value ? label : '—'}
    </span>
  )
}

// ─── Summary bar ─────────────────────────────────────────────────
function SummaryBar({ rows }: { rows: BTSSite[] }) {
  const byOp = ALL_OPS.map(k => ({
    key: k,
    label: BTS_OPERATOR_LABELS[k],
    color: BTS_OPERATOR_COLOR[k],
    count: rows.filter(r => r.operatorKey === k).length,
  })).filter(o => o.count > 0)

  const tx = {
    fiber: rows.filter(r => r.txType.toLowerCase().includes('fiber')).length,
    mw:    rows.filter(r => r.txType.toLowerCase().includes('mw') || r.txType.toLowerCase().includes('microwave')).length,
    both:  rows.filter(r => r.txType.toLowerCase() === 'both').length,
  }

  const gen = {
    g2: rows.filter(r => r.has2G === true).length,
    g3: rows.filter(r => r.has3G === true).length,
    g4: rows.filter(r => r.has4G === true).length,
  }

  const card = (label: string, value: number, sub?: string, color = 'var(--text-primary)') => (
    <div style={{
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
        {card('Total BTS', rows.length)}
        {byOp.map(o => card(o.label, o.count, undefined, o.color))}
      </div>
      {(tx.fiber + tx.mw + tx.both > 0 || gen.g2 + gen.g3 + gen.g4 > 0) && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {tx.fiber > 0 && card('Fiber TX',     tx.fiber)}
          {tx.mw    > 0 && card('Microwave TX', tx.mw)}
          {tx.both  > 0 && card('Both TX',      tx.both)}
          {gen.g2   > 0 && card('2G Sites',     gen.g2,  'Banglalink only')}
          {gen.g3   > 0 && card('3G Sites',     gen.g3,  'Banglalink only')}
          {gen.g4   > 0 && card('4G Sites',     gen.g4,  'Banglalink only')}
        </div>
      )}
    </div>
  )
}

// ─── Charts row ───────────────────────────────────────────────────
function ChartsRow({ rows }: { rows: BTSSite[] }) {
  if (rows.length === 0) return null

  const byOperator = ALL_OPS
    .map(k => ({ name: BTS_OPERATOR_LABELS[k], value: rows.filter(r => r.operatorKey === k).length, color: BTS_OPERATOR_COLOR[k] }))
    .filter(d => d.value > 0)

  const txTypes = [
    { name: 'Fiber',      color: '#1d4ed8', value: rows.filter(r => r.txType.toLowerCase() === 'fiber').length },
    { name: 'Microwave',  color: '#f59e0b', value: rows.filter(r => r.txType.toLowerCase() === 'mw' || r.txType.toLowerCase() === 'microwave').length },
    { name: 'Both',       color: '#059669', value: rows.filter(r => r.txType.toLowerCase() === 'both').length },
    { name: 'Unknown',    color: '#cbd5e1', value: rows.filter(r => !r.txType).length },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
      <SimplePieChart title="Sites by Operator" data={byOperator} />
      {txTypes.length > 1 && <SimplePieChart title="TX Type Distribution" data={txTypes} />}
    </div>
  )
}

// ─── Result table ─────────────────────────────────────────────────
function ResultTable({ rows, area }: { rows: BTSSite[]; area: string }) {
  const [sortCol, setSortCol] = useState<keyof BTSSite>('operator')
  const [sortAsc, setSortAsc] = useState(true)
  const [opFilter, setOpFilter] = useState<BTSOperatorKey | 'all'>('all')
  const [page,     setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const toggleSort = (col: keyof BTSSite) => {
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

  const th = (col: keyof BTSSite, label: string, right = false): React.ReactNode => (
    <th
      key={col}
      onClick={() => toggleSort(col)}
      style={{
        padding: '8px 12px',
        textAlign: right ? 'right' : 'left',
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
    maxWidth: 180,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{rows.length.toLocaleString()}</strong> sites found
        </div>

        {/* Operator filter */}
        {[
          { key: 'all' as const, label: `All (${rows.length})` },
          ...presentOps.map(k => ({
            key: k as BTSOperatorKey | 'all',
            label: `${BTS_OPERATOR_LABELS[k]} (${rows.filter(r => r.operatorKey === k).length})`,
          })),
        ].map(p => (
          <button
            key={String(p.key)}
            onClick={() => { setOpFilter(p.key); setPage(1) }}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: opFilter === p.key ? `2px solid ${p.key !== 'all' ? BTS_OPERATOR_COLOR[p.key] : '#1d4ed8'}` : '1px solid var(--border)',
              background: opFilter === p.key ? (p.key !== 'all' ? BTS_OPERATOR_COLOR[p.key] + '14' : '#eff6ff') : 'var(--card-bg)',
              color: opFilter === p.key ? (p.key !== 'all' ? BTS_OPERATOR_COLOR[p.key] : '#1d4ed8') : '#64748b',
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
              {th('siteName',  'Site Name')}
              {th('siteType',  'Type')}
              {th('txType',    'TX')}
              {th('has2G',     '2G')}
              {th('has3G',     '3G')}
              {th('has4G',     '4G')}
              {th('district',  'District')}
              {th('upazila',   'Upazila')}
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
                    background: BTS_OPERATOR_COLOR[r.operatorKey] + '18',
                    color: BTS_OPERATOR_COLOR[r.operatorKey],
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {r.operator}
                  </span>
                </td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 12 }}>{r.siteName}</td>
                <td style={{ ...td, color: '#64748b' }}>{r.siteType || '—'}</td>
                <td style={td}>
                  {r.txType ? (
                    <span style={{
                      padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                      background: r.txType === 'Fiber' ? '#dbeafe' : r.txType === 'MW' ? '#fef3c7' : '#f0fdf4',
                      color:      r.txType === 'Fiber' ? '#1e40af' : r.txType === 'MW' ? '#92400e' : '#166534',
                    }}>
                      {r.txType}
                    </span>
                  ) : '—'}
                </td>
                <td style={{ ...td, textAlign: 'center' }}><GenBadge value={r.has2G} label="2G" /></td>
                <td style={{ ...td, textAlign: 'center' }}><GenBadge value={r.has3G} label="3G" /></td>
                <td style={{ ...td, textAlign: 'center' }}><GenBadge value={r.has4G} label="4G" /></td>
                <td style={td}>{r.district}</td>
                <td style={td}>{r.upazila}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No BTS sites found for this filter.
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

function FilterPanel({ onGenerate, loading }: {
  onGenerate: (f: { level: AdminLevel; area: string; operators: Set<BTSOperatorKey> }) => void
  loading: boolean
}) {
  const [level,     setLevel]     = useState<AdminLevel>('district')
  const [options,   setOptions]   = useState<string[]>([])
  const [optLoading,setOptLoading]= useState(false)
  const [area,      setArea]      = useState('')
  const [operators, setOperators] = useState<Set<BTSOperatorKey>>(new Set(ALL_OPS))

  useEffect(() => {
    setOptLoading(true)
    setArea('')
    loadAdminOptions(level)
      .then(setOptions)
      .finally(() => setOptLoading(false))
  }, [level])

  function toggleOp(key: BTSOperatorKey) {
    setOperators(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else               next.add(key)
      return next
    })
  }

  const canGenerate = !!area && operators.size > 0 && !loading

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Operators
          </span>
          <button onClick={() => setOperators(new Set(ALL_OPS))} style={{ fontSize: 11, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>All</button>
          <button onClick={() => setOperators(new Set())}         style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>None</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_OPS.map(key => {
            const active = operators.has(key)
            const color  = BTS_OPERATOR_COLOR[key]
            return (
              <button
                key={key}
                onClick={() => toggleOp(key)}
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
                {BTS_OPERATOR_LABELS[key]}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: '6px 0 0' }}>
          Summit uses point-in-polygon matching (slightly slower).
        </p>
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
export default function BTSReport() {
  const { results, loading, error, generate, clear } = useBTSReport()
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>BTS Report</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          View BTS sites within a geographic area across Grameenphone, Robi, Banglalink, and Summit.
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
          Loading BTS data…
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
