import { useNavigate } from 'react-router-dom'
import type { Site } from '@/types/site'
import StatusBadge  from '@/components/cards/StatusBadge'
import PowerBadge   from '@/components/cards/PowerBadge'
import OperatorLogo from '@/components/cards/OperatorLogo'
import { STATUS_COLORS } from '@/utils/statusColors'
import { OPERATOR_MAP } from '@/data/operators'
import { formatAssetType, formatTimestamp, formatTimeAgo } from '@/utils/formatters'

interface Props {
  site: Site
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr',
      gap: 8, padding: '8px 0', borderBottom: '1px solid #f1f5f9',
      alignItems: 'center',
    }}>
      <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: '#1e293b' }}>{children}</span>
    </div>
  )
}

// ─── SiteAttributesCard ───────────────────────────────────────────
// Full attribute panel for a single site.

export default function SiteAttributesCard({ site }: Props) {
  const navigate  = useNavigate()
  const operator  = OPERATOR_MAP[site.operatorId]
  const sc        = STATUS_COLORS[site.status]
  const tenants   = site.tenants.map(tid => OPERATOR_MAP[tid]).filter(Boolean)

  return (
    <div style={{
      background: 'white', borderRadius: 8, border: '1px solid #e2e8f0',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Colored header band */}
      <div style={{
        background: sc.hex, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'white', marginBottom: 2 }}>
            {site.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, background: 'rgba(255,255,255,0.25)', color: 'white',
              borderRadius: 4, padding: '2px 7px', fontFamily: 'monospace', fontWeight: 600,
            }}>
              {site.id}
            </span>
            <span style={{
              fontSize: 11, background: 'rgba(255,255,255,0.2)', color: 'white',
              borderRadius: 4, padding: '2px 7px', fontWeight: 500,
            }}>
              {formatAssetType(site.type)}
            </span>
            {site.hasActiveOutage && (
              <span style={{
                fontSize: 11, background: '#7f1d1d', color: 'white',
                borderRadius: 4, padding: '2px 7px', fontWeight: 700,
              }}>
                ⚠ ACTIVE OUTAGE
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={site.status} variant="solid" />
      </div>

      {/* Attribute rows */}
      <div style={{ padding: '0 18px' }}>
        <Row label="Operator">
          {operator ? (
            <button
              onClick={() => navigate('/operators')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <OperatorLogo operator={operator} size={24} />
              <span style={{ fontWeight: 600, color: operator.color }}>{operator.name}</span>
            </button>
          ) : site.operatorId}
        </Row>

        <Row label="Location">
          <span style={{ color: '#374151' }}>
            {site.upazila}, {site.district}, {site.division}
          </span>
        </Row>

        <Row label="Coordinates">
          <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>
            {site.lat.toFixed(4)}°N, {site.lng.toFixed(4)}°E
          </span>
        </Row>

        <Row label="Power Source">
          <PowerBadge source={site.powerSource} />
        </Row>

        <Row label="Last Report">
          <div>
            <span style={{ fontWeight: 600 }}>{formatTimeAgo(site.lastSubmission)}</span>
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>
              ({formatTimestamp(site.lastSubmission)})
            </span>
          </div>
        </Row>

        <Row label="Submission">
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: site.submissionStatus === 'on_time' ? '#22c55e'
                 : site.submissionStatus === 'late'    ? '#f59e0b' : '#ef4444',
          }}>
            {site.submissionStatus === 'on_time' ? '✓ On Time'
           : site.submissionStatus === 'late'    ? '⚠ Late' : '✗ Missing'}
          </span>
        </Row>

        {/* Tenants row — only for towers with tenants */}
        {site.tenants.length > 0 && (
          <Row label="Tenants">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tenants.map(op => (
                <div key={op.id} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: `${op.color}12`, border: `1px solid ${op.color}44`,
                  borderRadius: 5, padding: '3px 8px 3px 4px',
                }}>
                  <OperatorLogo operator={op} size={16} />
                  <span style={{ fontSize: 11, color: op.color, fontWeight: 600 }}>{op.shortName}</span>
                </div>
              ))}
            </div>
          </Row>
        )}

        {/* Padding at bottom */}
        <div style={{ height: 8 }} />
      </div>
    </div>
  )
}
