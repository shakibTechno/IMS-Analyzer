import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper   from '@/components/layout/PageWrapper'
import FilterBar     from '@/components/filters/FilterBar'
import DataTable, { type Column } from '@/components/shared/DataTable'
import StatusBadge   from '@/components/cards/StatusBadge'
import PowerBadge    from '@/components/cards/PowerBadge'
import EmptyState    from '@/components/shared/EmptyState'
import { useFilteredSites } from '@/hooks/useFilteredSites'
import { useFilterStore }   from '@/store/filterStore'
import { useThemeStore }    from '@/store/themeStore'
import { OPERATOR_MAP } from '@/data/operators'
import OperatorLogo     from '@/components/cards/OperatorLogo'
import { formatTimeAgo, formatAssetType } from '@/utils/formatters'
import type { Site, SiteStatus } from '@/types/site'

// ─── SiteDirectory ────────────────────────────────────────────────
// Searchable, sortable table of all sites.
// Filters from Zustand FilterBar + local text search.
// Clicking a row navigates to /sites/:siteId

const COLUMNS: Column<Site>[] = [
  {
    key: 'id', header: 'Site ID', width: 100, sortable: true,
    render: row => (
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)',
        background: 'var(--card-bg-2)', borderRadius: 4, padding: '2px 6px' }}>
        {row.id}
      </span>
    ),
  },
  {
    key: 'name', header: 'Site Name', sortable: true,
    render: row => (
      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.name}</span>
    ),
  },
  {
    key: 'type', header: 'Type', width: 90, sortable: true,
    render: row => (
      <span style={{ fontSize: 11, color: 'var(--text-secondary)',
        background: 'var(--card-bg-2)', border: '1px solid var(--border)',
        borderRadius: 4, padding: '2px 7px' }}>
        {formatAssetType(row.type)}
      </span>
    ),
  },
  {
    key: 'operatorId', header: 'Operator', width: 120, sortable: true,
    render: row => {
      const op = OPERATOR_MAP[row.operatorId]
      if (!op) return row.operatorId
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <OperatorLogo operator={op} size={20} />
          <span style={{ fontSize: 12, color: op.color, fontWeight: 600 }}>{op.shortName}</span>
        </div>
      )
    },
  },
  {
    key: 'division', header: 'Division', width: 110, sortable: true,
    render: row => <span style={{ color: 'var(--text-primary)' }}>{row.division}</span>,
  },
  {
    key: 'district', header: 'District', width: 120, sortable: true,
    render: row => <span style={{ color: 'var(--text-primary)' }}>{row.district}</span>,
  },
  {
    key: 'status', header: 'Status', width: 100, sortable: true,
    render: row => <StatusBadge status={row.status} variant="pill" size="sm" />,
  },
  {
    key: 'powerSource', header: 'Power', width: 110, sortable: true,
    render: row => <PowerBadge source={row.powerSource} />,
  },
  {
    key: 'submissionStatus', header: 'Submission', width: 100, sortable: true,
    render: row => {
      const color = row.submissionStatus === 'on_time' ? '#22c55e'
                  : row.submissionStatus === 'late'    ? '#f59e0b' : '#ef4444'
      const label = row.submissionStatus === 'on_time' ? '✓ On Time'
                  : row.submissionStatus === 'late'    ? '⚠ Late' : '✗ Missing'
      return <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    },
  },
  {
    key: 'lastSubmission', header: 'Last Seen', width: 100,
    render: row => (
      <span style={{ fontSize: 11, color: '#94a3b8' }}>
        {formatTimeAgo(row.lastSubmission)}
      </span>
    ),
  },
]

export default function SiteDirectory() {
  const navigate      = useNavigate()
  const isDark        = useThemeStore(s => s.theme === 'dark')
  const sites          = useFilteredSites()
  const resetFilters   = useFilterStore(s => s.resetFilters)
  const statusFilter   = useFilterStore(s => s.statusFilter)
  const setStatusFilter = useFilterStore(s => s.setStatusFilter)
  const [search, setSearch] = useState('')

  // Toggle a status in the multi-select filter.
  // Selecting the last remaining active status resets to null (show all).
  function toggleStatus(status: SiteStatus) {
    if (!statusFilter) {
      setStatusFilter([status])
    } else if (statusFilter.includes(status)) {
      const next = statusFilter.filter(s => s !== status)
      setStatusFilter(next.length > 0 ? next : null)
    } else {
      const next = [...statusFilter, status]
      setStatusFilter(next.length === 3 ? null : next)
    }
  }

  // Local text search across id, name, district, division
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sites
    return sites.filter(s =>
      s.id.toLowerCase().includes(q)      ||
      s.name.toLowerCase().includes(q)    ||
      s.district.toLowerCase().includes(q)||
      s.division.toLowerCase().includes(q)
    )
  }, [sites, search])

  // Status summary counts
  const counts = useMemo(() => ({
    active:   filtered.filter(s => s.status === 'active').length,
    degraded: filtered.filter(s => s.status === 'degraded').length,
    down:     filtered.filter(s => s.status === 'down').length,
  }), [filtered])

  return (
    <PageWrapper>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
          Site Directory
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
          All monitored telecommunications infrastructure sites
        </p>
      </div>

      {/* ── Filters + status toggles + search — all in one row ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: 8, marginBottom: 12, flexWrap: 'wrap',
      }}>
        <FilterBar show={{ period: false }} />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: 'var(--border)', flexShrink: 0 }} />

        {/* Status filter label */}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', flexShrink: 0 }}>
          Status:
        </span>

        {/* Status toggle pills */}
        {([
          { status: 'active'   as SiteStatus, label: 'Active',   count: counts.active,   color: '#22c55e', bg: '#f0fdf4', border: '#22c55e55' },
          { status: 'degraded' as SiteStatus, label: 'Degraded', count: counts.degraded, color: '#f59e0b', bg: '#fffbeb', border: '#f59e0b55' },
          { status: 'down'     as SiteStatus, label: 'Down',     count: counts.down,     color: '#ef4444', bg: '#fef2f2', border: '#ef444455' },
        ]).map(s => {
          const isActive = !statusFilter || statusFilter.includes(s.status)
          return (
            <button
              key={s.label}
              onClick={() => toggleStatus(s.status)}
              title={isActive && statusFilter ? `Remove ${s.label} filter` : `Show ${s.label} only`}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                background: isActive ? s.bg : 'var(--card-bg)',
                border: isActive ? `1px solid ${s.border}` : '1px solid var(--border)',
                opacity: isActive ? 1 : 0.5,
                transition: 'all 0.15s', outline: 'none',
              }}
            >
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: isActive ? s.color : '#cbd5e1',
              }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? s.color : '#94a3b8' }}>
                {s.count}
              </span>
              <span style={{ fontSize: 11, color: isActive ? '#475569' : '#94a3b8' }}>
                {s.label}
              </span>
            </button>
          )
        })}

        {/* Clear status filter */}
        {statusFilter && (
          <button
            onClick={() => setStatusFilter(null)}
            style={{
              padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
              border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fca5a5',
              background: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2',
              fontSize: 11, fontWeight: 600, color: isDark ? '#f87171' : '#ef4444',
              transition: 'all 0.15s', outline: 'none',
            }}
          >
            ✕ Clear
          </button>
        )}

      </div>

      {/* ── Search row ──────────────────────────────────────────── */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <input
            type="text"
            placeholder="Search ID, name, district…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              height: 32, padding: '0 10px 0 30px', fontSize: 12,
              borderRadius: 6, border: '1px solid var(--border)',
              background: 'var(--card-bg)', color: 'var(--text-primary)', outline: 'none',
              width: 260,
            }}
          />
          <span style={{
            position: 'absolute', left: 9, top: '50%',
            transform: 'translateY(-50%)', fontSize: 13, color: '#94a3b8',
            pointerEvents: 'none',
          }}>🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 6, top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                border: 'none', cursor: 'pointer', fontSize: 14,
                color: '#94a3b8', padding: 0, lineHeight: 1,
              }}
            >×</button>
          )}
        </div>
      </div>

      {/* ── Result count ───────────────────────────────────────── */}
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>
        Showing {filtered.length} of {sites.length} sites
        {statusFilter && (
          <span> — status: <strong style={{ color: 'var(--text-secondary)' }}>{statusFilter.join(', ')}</strong></span>
        )}
        {search && <span> matching "<strong style={{ color: 'var(--text-secondary)' }}>{search}</strong>"</span>}
      </div>

      {/* ── Site table / empty state ───────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No sites match your filters"
          message={
            search
              ? `No sites found for "${search}". Try a different search term or clear your filters.`
              : 'The current filter combination returned no results. Adjust the filters above.'
          }
          action={
            <button
              onClick={() => { setSearch(''); resetFilters() }}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                background: '#003D7A', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              Clear all filters
            </button>
          }
        />
      ) : (
        <>
          <DataTable<Site>
            columns={COLUMNS}
            data={filtered}
            rowKey={s => s.id}
            onRowClick={s => navigate(`/sites/${s.id}`)}
            maxHeight={720}
            compact
          />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            Click any row to view site detail
          </div>
        </>
      )}
    </PageWrapper>
  )
}
