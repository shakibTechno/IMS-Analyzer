import { useState, type ReactNode } from 'react'

// ─── Generic column definition ────────────────────────────────────
export interface Column<T extends object> {
  key:       string
  header:    string
  render?:   (row: T) => ReactNode   // if omitted, uses row[key] as string
  sortable?: boolean
  width?:    string | number
  align?:    'left' | 'center' | 'right'
}

interface Props<T extends object> {
  columns:     Column<T>[]
  data:        T[]
  rowKey:      (row: T) => string
  onRowClick?: (row: T) => void
  emptyMessage?: string
  maxHeight?:  number   // enables internal scroll when set
  compact?:    boolean
}

type SortDir = 'asc' | 'desc'

export default function DataTable<T extends object>({
  columns, data, rowKey, onRowClick, emptyMessage = 'No data', maxHeight, compact,
}: Props<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<SortDir>('asc')

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey] as string | number
    const bv = (b as Record<string, unknown>)[sortKey] as string | number
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const cellPad = compact ? '8px 12px' : '10px 14px'
  const fontSize = compact ? 13 : 14

  return (
    <div style={{
      overflow: maxHeight ? 'auto' : undefined,
      maxHeight: maxHeight,
      border: '1px solid var(--border)',
      borderRadius: 8,
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        fontSize, tableLayout: 'fixed',
      }}>
        {/* Header */}
        <thead>
          <tr style={{ background: 'var(--card-bg-2)', borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                style={{
                  padding: compact ? '9px 12px' : '11px 14px',
                  textAlign: col.align ?? 'left',
                  fontSize: 13, fontWeight: 800, color: 'var(--text-secondary)',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: col.sortable ? 'pointer' : 'default',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  width: col.width,
                  borderRight: '1px solid var(--border)',
                  position: 'sticky', top: 0, zIndex: 2,
                  background: 'var(--card-bg-2)',
                  boxShadow: '0 1px 0 var(--border)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {col.header}
                  {col.sortable && (
                    <span style={{ color: sortKey === col.key ? '#003D7A' : '#cbd5e1', fontSize: 10 }}>
                      {sortKey === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sorted.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : undefined,
                  cursor: onRowClick ? 'pointer' : 'default',
                  background: 'var(--card-bg)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'var(--card-bg-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)' }}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    style={{
                      padding: cellPad,
                      textAlign: col.align ?? 'left',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      borderRight: '1px solid var(--card-bg-2)',
                    }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
