import { useMemo } from 'react'
import { SITES } from '@/data/sites'
import { OPERATOR_MAP } from '@/data/operators'
import SectionHeader from '@/components/shared/SectionHeader'
import { formatAssetType } from '@/utils/formatters'

interface Props {
  operatorId: string
}

// ─── TenancyBreakdownPanel ────────────────────────────────────────
// Shows two views depending on operator type:
//   Tower company  → which MNOs are hosted on their towers (tenants)
//   MNO / NTTN     → which towers they are co-located on (as tenants)

export default function TenancyBreakdownPanel({ operatorId }: Props) {
  const operator = OPERATOR_MAP[operatorId]

  // Sites OWNED by this operator
  const ownedSites = useMemo(
    () => SITES.filter(s => s.operatorId === operatorId),
    [operatorId],
  )

  // Sites where this operator appears as a TENANT
  const tenantSites = useMemo(
    () => SITES.filter(s => s.tenants.includes(operatorId)),
    [operatorId],
  )

  // For tower companies: build tenant frequency map
  const tenantFreq = useMemo(() => {
    if (operator?.type !== 'tower_company') return null
    const freq: Record<string, number> = {}
    for (const site of ownedSites) {
      for (const tid of site.tenants) {
        freq[tid] = (freq[tid] ?? 0) + 1
      }
    }
    return Object.entries(freq)
      .map(([tid, count]) => ({ operator: OPERATOR_MAP[tid], count }))
      .filter(e => e.operator)
      .sort((a, b) => b.count - a.count)
  }, [operatorId, ownedSites, operator])

  // Asset type breakdown for owned sites
  const assetBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of ownedSites) {
      map[s.type] = (map[s.type] ?? 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [ownedSites])

  const isTowerCo = operator?.type === 'tower_company'

  return (
    <div style={{
      background: 'var(--card-bg)', borderRadius: 8, border: '1px solid var(--border)',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title={isTowerCo ? 'Tenant Breakdown' : 'Site & Tenancy Profile'}
        subtitle={
          isTowerCo
            ? `${ownedSites.length} towers · tenant operator distribution`
            : `${ownedSites.length} owned · ${tenantSites.length} co-located`
        }
      />

      {/* Asset type pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {assetBreakdown.map(([type, count]) => (
          <div key={type} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'var(--card-bg-2)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatAssetType(type)}</span>
          </div>
        ))}
      </div>

      {/* Tower company: tenant operator bars */}
      {isTowerCo && tenantFreq && tenantFreq.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hosted Operators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tenantFreq.map(({ operator: op, count }) => {
              const pct = ownedSites.length > 0 ? Math.round((count / ownedSites.length) * 100) : 0
              return (
                <div key={op.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: op.color, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 10, fontWeight: 800,
                    color: 'white', flexShrink: 0,
                  }}>
                    {op.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{op.shortName}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {count} tower{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--card-bg-2)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: op.color, borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* MNO/NTTN: co-location list */}
      {!isTowerCo && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 8,
            textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Co-Located On ({tenantSites.length} towers)
          </div>
          {tenantSites.length === 0 ? (
            <div style={{ fontSize: 12, color: '#94a3b8' }}>No shared tower arrangements</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
              {tenantSites.map(site => {
                const owner = OPERATOR_MAP[site.operatorId]
                return (
                  <div key={site.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '5px 8px', background: 'var(--card-bg-2)', borderRadius: 5,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {site.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{site.division} · {site.district}</div>
                    </div>
                    {owner && (
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: owner.color,
                        background: `${owner.color}18`, borderRadius: 4,
                        padding: '2px 6px', flexShrink: 0, marginLeft: 8,
                      }}>
                        {owner.initials}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
