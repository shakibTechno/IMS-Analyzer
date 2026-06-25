import { useState, useEffect, useRef } from 'react'
import type { AdminLevel, OperatorKey, FiberSegment } from '@/types/fiberReport'
import { OPERATOR_LABELS } from '@/types/fiberReport'
import { useFiberReport, loadAdminOptions } from '@/hooks/useFiberReport'
import SimplePieChart from '@/components/charts/SimplePieChart'
import Pagination from '@/components/shared/Pagination'

// ─── Colour helpers ───────────────────────────────────────────────
const OP_COLOR: Record<OperatorKey, string> = {
  btcl:       '#1d4ed8',
  banglalink: '#dc2626',
  bahon:      '#7c3aed',
  brfiber:    '#059669',
  is3:        '#d97706',
  oprlines:   '#64748b',
}

const MATCH_STYLE: Record<FiberSegment['matchSide'], { label: string; bg: string; color: string }> = {
  both:        { label: 'Both',   bg: '#dcfce7', color: '#166534' },
  origin:      { label: 'Origin', bg: '#dbeafe', color: '#1e40af' },
  destination: { label: 'Dest',  bg: '#fef3c7', color: '#92400e' },
  all:         { label: 'Both',   bg: '#dcfce7', color: '#166534' },
}

// ─── Tiny badge ───────────────────────────────────────────────────
function Badge({ side }: { side: FiberSegment['matchSide'] }) {
  const { label, bg, color } = MATCH_STYLE[side]
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color,
    }}>
      {label}
    </span>
  )
}

// ─── Export CSV ───────────────────────────────────────────────────
function exportCSV(rows: FiberSegment[], origin: string, destination: string) {
  const headers = ['Operator','Line Name','Type','From','To','Cores','Used','Free','Route KM','Division','District','Upazila','Match']
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.operator,
      `"${r.lineName.replace(/"/g, '""')}"`,
      r.lineType,
      `"${r.fromNode}"`,
      `"${r.toNode}"`,
      r.coreCount ?? '',
      r.coresUsed ?? '',
      r.coresFree ?? '',
      r.routeKm   ?? '',
      r.division,
      r.district,
      r.upazila,
      r.matchSide,
    ].join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `fiber-report-${origin}-${destination}.csv`
  a.click()
}

// ─── Result table ─────────────────────────────────────────────────
function ResultTable({ rows, origin, destination }: {
  rows:        FiberSegment[]
  origin:      string
  destination: string
}) {
  const [sortCol,    setSortCol]    = useState<keyof FiberSegment>('matchSide')
  const [sortAsc,    setSortAsc]    = useState(true)
  const [matchFilter,setMatchFilter]= useState<FiberSegment['matchSide'] | 'all'>('all')
  const [page,       setPage]       = useState(1)
  const [pageSize,   setPageSize]   = useState(50)

  const toggleSort = (col: keyof FiberSegment) => {
    if (sortCol === col) setSortAsc(v => !v)
    else { setSortCol(col); setSortAsc(true) }
    setPage(1)
  }

  const filtered = rows
    .filter(r => matchFilter === 'all' || r.matchSide === matchFilter)
    .sort((a, b) => {
      const av = a[sortCol] ?? ''
      const bv = b[sortCol] ?? ''
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sortAsc ? cmp : -cmp
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible    = filtered.slice((page - 1) * pageSize, page * pageSize)

  const both  = rows.filter(r => r.matchSide === 'both').length
  const ori   = rows.filter(r => r.matchSide === 'origin').length
  const dest  = rows.filter(r => r.matchSide === 'destination').length

  const thStyle = (col: keyof FiberSegment): React.CSSProperties => ({
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
  })

  const tdStyle: React.CSSProperties = {
    padding: '8px 12px',
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
      {/* Summary bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>
          <strong style={{ color: 'var(--text-primary)' }}>{rows.length}</strong> segment{rows.length !== 1 ? 's' : ''} found
        </div>

        {/* Match filter pills */}
        {[
          { key: 'all'         as const, label: `All (${rows.length})` },
          { key: 'both'        as const, label: `Both endpoints (${both})` },
          { key: 'origin'      as const, label: `Origin only (${ori})` },
          { key: 'destination' as const, label: `Destination only (${dest})` },
        ].map(p => (
          <button
            key={p.key + p.label}
            onClick={() => { setMatchFilter(p.key); setPage(1) }}
            style={{
              padding: '4px 12px',
              borderRadius: 9999,
              border: matchFilter === p.key ? '2px solid #1d4ed8' : '1px solid var(--border)',
              background: matchFilter === p.key ? '#eff6ff' : 'var(--card-bg)',
              color: matchFilter === p.key ? '#1d4ed8' : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}

        <button
          onClick={() => exportCSV(filtered, origin, destination)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
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
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr>
              {(
                [
                  ['operator',  'Operator'],
                  ['lineName',  'Line Name'],
                  ['lineType',  'Type'],
                  ['fromNode',  'From'],
                  ['toNode',    'To'],
                  ['coreCount', 'Cores'],
                  ['coresUsed', 'Used'],
                  ['coresFree', 'Free'],
                  ['routeKm',   'KM'],
                  ['matchSide', 'Match'],
                ] as [keyof FiberSegment, string][]
              ).map(([col, label]) => (
                <th key={col} style={thStyle(col)} onClick={() => toggleSort(col)}>
                  {label} {sortCol === col ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, idx) => (
              <tr
                key={r.id}
                style={{ background: idx % 2 === 0 ? 'var(--card-bg)' : 'var(--card-bg-2)' }}
              >
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: OP_COLOR[r.operatorKey] + '18',
                    color: OP_COLOR[r.operatorKey],
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {r.operator}
                  </span>
                </td>
                <td style={{ ...tdStyle, maxWidth: 240 }} title={r.lineName}>{r.lineName}</td>
                <td style={{ ...tdStyle, color: '#64748b' }}>{r.lineType || '—'}</td>
                <td style={{ ...tdStyle, maxWidth: 180 }} title={r.fromNode}>{r.fromNode || '—'}</td>
                <td style={{ ...tdStyle, maxWidth: 180 }} title={r.toNode}>{r.toNode || '—'}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                  {r.coreCount ?? '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', color: '#dc2626' }}>
                  {r.coresUsed ?? '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace', color: '#16a34a' }}>
                  {r.coresFree ?? '—'}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: 'monospace' }}>
                  {r.routeKm != null ? r.routeKm.toFixed(1) : '—'}
                </td>
                <td style={tdStyle}>
                  <Badge side={r.matchSide} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  No segments found for this filter.
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
const ALL_OPS: OperatorKey[] = ['btcl', 'banglalink', 'bahon', 'brfiber', 'is3', 'oprlines']

// ─── Charts row ───────────────────────────────────────────────────
function ChartsRow({ rows }: { rows: FiberSegment[] }) {
  if (rows.length === 0) return null

  const byOperator = ALL_OPS
    .map(k => ({ name: OPERATOR_LABELS[k], value: rows.filter(r => r.operatorKey === k).length, color: OP_COLOR[k] }))
    .filter(d => d.value > 0)

  const byMatch = [
    { name: 'Both endpoints', color: '#16a34a', value: rows.filter(r => r.matchSide === 'both').length },
    { name: 'Origin only',    color: '#1d4ed8', value: rows.filter(r => r.matchSide === 'origin').length },
    { name: 'Dest only',      color: '#d97706', value: rows.filter(r => r.matchSide === 'destination').length },
  ].filter(d => d.value > 0)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 }}>
      <SimplePieChart title="Segments by Operator" data={byOperator} />
      {byMatch.length > 1 && <SimplePieChart title="Match Type" data={byMatch} />}
    </div>
  )
}

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
  onGenerate: (filters: {
    level: AdminLevel
    origin: string
    destination: string
    operators: Set<OperatorKey>
  }) => void
  loading: boolean
}) {
  const [level, setLevel]       = useState<AdminLevel>('district')
  const [options, setOptions]   = useState<string[]>([])
  const [optLoading, setOptLoading] = useState(false)
  const [origin, setOrigin]     = useState('')
  const [destination, setDest]  = useState('')
  const [operators, setOperators] = useState<Set<OperatorKey>>(
    new Set(ALL_OPS)
  )

  useEffect(() => {
    setOptLoading(true)
    setOrigin('')
    setDest('')
    loadAdminOptions(level)
      .then(setOptions)
      .finally(() => setOptLoading(false))
  }, [level])

  function toggleOp(key: OperatorKey) {
    setOperators(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else               next.add(key)
      return next
    })
  }

  function handleGenerate() {
    if (!origin || !destination || operators.size === 0) return
    onGenerate({ level, origin, destination, operators })
  }

  const canGenerate = !!origin && !!destination && operators.size > 0 && !loading

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 18 }}>
        {/* Level */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            Level
          </label>
          <select
            value={level}
            onChange={e => setLevel(e.target.value as AdminLevel)}
            style={selectStyle}
          >
            <option value="division">Division</option>
            <option value="district">District</option>
            <option value="upazila">Upazila</option>
          </select>
        </div>

        {/* Origin */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            Origin {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            style={selectStyle}
            disabled={optLoading}
          >
            <option value="">— Select —</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Destination */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
            Destination {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
          <select
            value={destination}
            onChange={e => setDest(e.target.value)}
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
          <button
            onClick={() => setOperators(new Set(ALL_OPS))}
            style={{ fontSize: 11, color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            All
          </button>
          <button
            onClick={() => setOperators(new Set())}
            style={{ fontSize: 11, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            None
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_OPS.map(key => {
            const active = operators.has(key)
            return (
              <button
                key={key}
                onClick={() => toggleOp(key)}
                style={{
                  padding: '5px 13px',
                  borderRadius: 6,
                  border: active ? `2px solid ${OP_COLOR[key]}` : '1px solid var(--border)',
                  background: active ? OP_COLOR[key] + '14' : 'var(--card-bg-2)',
                  color: active ? OP_COLOR[key] : '#94a3b8',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {OPERATOR_LABELS[key]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        style={{
          padding: '10px 28px',
          borderRadius: 8,
          border: 'none',
          background: canGenerate ? '#1d4ed8' : '#e2e8f0',
          color: canGenerate ? 'white' : '#94a3b8',
          fontSize: 13,
          fontWeight: 700,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          transition: 'background 0.15s',
        }}
      >
        {loading ? 'Generating…' : 'Generate Report'}
      </button>

      {!origin && !destination && (
        <span style={{ marginLeft: 12, fontSize: 12, color: '#94a3b8' }}>
          Select origin and destination to continue
        </span>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────
export default function FiberLineReport() {
  const { results, loading, error, generate, clear } = useFiberReport()
  const [hasGenerated, setHasGenerated] = useState(false)
  const [lastOrigin, setLastOrigin]     = useState('')
  const [lastDest,   setLastDest]       = useState('')

  const tableRef = useRef<HTMLDivElement>(null)

  async function handleGenerate(filters: Parameters<typeof generate>[0]) {
    setLastOrigin(filters.origin)
    setLastDest(filters.destination)
    setHasGenerated(true)
    await generate(filters)
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto', background: 'var(--bg-base)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Fiber Line Report
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
          Find fiber segments connecting two geographic areas across operators.
        </p>
      </div>

      <FilterPanel onGenerate={handleGenerate} loading={loading} />

      {error && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 8,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
          Loading fiber data…
        </div>
      )}

      {hasGenerated && !loading && (
        <div ref={tableRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Results — {lastOrigin} → {lastDest}
            </h2>
            <button
              onClick={() => { clear(); setHasGenerated(false) }}
              style={{
                fontSize: 12, color: 'var(--text-secondary)', background: 'none',
                border: '1px solid var(--border)', borderRadius: 6,
                padding: '3px 10px', cursor: 'pointer',
              }}
            >
              Clear
            </button>
          </div>
          <ChartsRow rows={results} />
          <ResultTable rows={results} origin={lastOrigin} destination={lastDest} />
        </div>
      )}
    </div>
  )
}
