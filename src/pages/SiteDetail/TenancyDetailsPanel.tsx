import { useMemo } from 'react'
import { SITES } from '@/data/sites'
import { OPERATOR_MAP } from '@/data/operators'
import { formatAssetType } from '@/utils/formatters'
import SectionHeader from '@/components/shared/SectionHeader'
import StatusBadge   from '@/components/cards/StatusBadge'
import OperatorLogo  from '@/components/cards/OperatorLogo'
import type { Site } from '@/types/site'

interface Props {
  site: Site
}

// ─── TenancyDetailsPanel ──────────────────────────────────────────
// For towers: lists the MNO tenants co-located on this site.
// For BTS/NTTN PoP: shows the host tower this site sits on (if any).

export default function TenancyDetailsPanel({ site }: Props) {
  const operator = OPERATOR_MAP[site.operatorId]

  // For BTS / NTTN PoP: find if this operator is a tenant somewhere
  const hostSites = useMemo(() => {
    if (site.type !== 'bts' && site.type !== 'nttn_pop') return []
    return SITES.filter(s =>
      s.type === 'tower' &&
      s.district === site.district &&
      s.tenants.includes(site.operatorId)
    )
  }, [site])

  // Tenant operators for this tower
  const tenantOps = site.tenants
    .map(tid => OPERATOR_MAP[tid])
    .filter(Boolean)

  const isTower = site.type === 'tower'

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      <SectionHeader
        title="Tenancy Details"
        subtitle={
          isTower
            ? tenantOps.length > 0
              ? `${tenantOps.length} tenant operator${tenantOps.length > 1 ? 's' : ''} sharing this tower`
              : 'Exclusive use — no tenants'
            : 'Co-location profile'
        }
      />

      {/* ── Tower view: tenant list ─────────────────────────── */}
      {isTower && tenantOps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tenantOps.map(op => {
            return (
              <div key={op.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 7,
                background: `${op.color}08`, border: `1px solid ${op.color}22`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <OperatorLogo operator={op} size={34} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{op.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                      {op.type === 'mno' ? 'Mobile Network Operator'
                       : op.type === 'nttn' ? 'NTTN Operator'
                       : 'Tower Company'} · Tenant
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>co-located</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isTower && tenantOps.length === 0 && (
        <div style={{
          padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12,
        }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>🗼</div>
          This tower has no co-located tenants.
          <br />
          <span style={{ fontSize: 11 }}>Exclusively operated by{' '}
            <span style={{ color: operator?.color, fontWeight: 600 }}>{operator?.shortName}</span>.
          </span>
        </div>
      )}

      {/* ── BTS / NTTN PoP view ────────────────────────────── */}
      {!isTower && (
        <div>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
            This <strong>{formatAssetType(site.type)}</strong> is operated by{' '}
            <span style={{ color: operator?.color, fontWeight: 600 }}>
              {operator?.shortName ?? site.operatorId}
            </span>.
            {hostSites.length > 0
              ? ` It shares infrastructure with ${hostSites.length} nearby tower${hostSites.length > 1 ? 's' : ''} in ${site.district}.`
              : ' No shared tower arrangements in this district.'
            }
          </div>

          {hostSites.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8',
                textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                Nearby Shared Towers
              </div>
              {hostSites.map(hs => {
                const hostOp = OPERATOR_MAP[hs.operatorId]
                return (
                  <div key={hs.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', background: '#f8fafc', borderRadius: 6,
                  }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#1e293b' }}>{hs.name}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        {hs.id} · {hostOp?.shortName ?? hs.operatorId}
                      </div>
                    </div>
                    <StatusBadge status={hs.status} variant="pill" size="sm" />
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
