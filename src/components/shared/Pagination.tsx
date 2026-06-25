interface Props {
  page:           number
  totalPages:     number
  pageSize:       number
  totalItems:     number
  onPageChange:   (p: number) => void
  onPageSizeChange: (s: number) => void
}

const PAGE_SIZES = [25, 50, 100, 250]

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  const left  = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  pages.push(1)
  if (left > 2)       pages.push('…')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < total - 1) pages.push('…')
  pages.push(total)
  return pages
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 32, height: 32,
  padding: '0 8px',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#475569',
  transition: 'all 0.1s',
  userSelect: 'none',
}

export default function Pagination({ page, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange }: Props) {
  if (totalPages <= 1 && totalItems <= PAGE_SIZES[0]) return null

  const start = (page - 1) * pageSize + 1
  const end   = Math.min(page * pageSize, totalItems)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 10,
      padding: '12px 16px',
      borderTop: '1px solid #f1f5f9',
      background: '#fafafa',
      borderRadius: '0 0 8px 8px',
      fontSize: 12,
    }}>
      {/* Left: count + page size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
        <span>
          Showing <strong style={{ color: '#1e293b' }}>{start.toLocaleString()}–{end.toLocaleString()}</strong> of{' '}
          <strong style={{ color: '#1e293b' }}>{totalItems.toLocaleString()}</strong>
        </span>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
          style={{
            padding: '3px 6px', borderRadius: 5, border: '1px solid #e2e8f0',
            background: 'white', fontSize: 12, color: '#1e293b', cursor: 'pointer',
          }}
        >
          {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Right: page buttons */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* Prev */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            style={{
              ...btnBase,
              opacity: page === 1 ? 0.4 : 1,
              cursor:  page === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            ‹
          </button>

          {pageWindow(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: '#94a3b8', fontSize: 12 }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                style={{
                  ...btnBase,
                  background: p === page ? '#1d4ed8' : 'white',
                  color:      p === page ? 'white'   : '#475569',
                  borderColor: p === page ? '#1d4ed8' : '#e2e8f0',
                }}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            style={{
              ...btnBase,
              opacity: page === totalPages ? 0.4 : 1,
              cursor:  page === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
