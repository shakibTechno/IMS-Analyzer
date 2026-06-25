import { Popup } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import type { Site } from '@/types/site'
import { STATUS_COLORS, POWER_COLORS } from '@/utils/statusColors'
import { formatAssetType, formatTimeAgo } from '@/utils/formatters'
import { getOperator } from '@/data/operators'
import OperatorLogo from '@/components/cards/OperatorLogo'

interface Props {
  site: Site
}

export default function SitePopup({ site }: Props) {
  const navigate = useNavigate()
  const sc = STATUS_COLORS[site.status]
  const pc = POWER_COLORS[site.powerSource]
  const op = getOperator(site.operatorId)

  return (
    <Popup
      minWidth={200}
      maxWidth={240}
      closeButton
    >
      <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12, lineHeight: 1.4 }}>
        {/* Site name + type */}
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, marginBottom: 6 }}>
          {site.name}
        </div>

        {/* Status + Type row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 9999,
            background: sc.hex + '18', border: `1px solid ${sc.hex}44`,
            color: sc.hex, fontSize: 10, fontWeight: 600,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.hex }} />
            {sc.label}
          </span>
          <span style={{
            fontSize: 10, color: '#64748b',
            background: '#f1f5f9', padding: '2px 6px', borderRadius: 4,
          }}>
            {formatAssetType(site.type)}
          </span>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, color: '#475569', fontSize: 11 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#94a3b8', minWidth: 56 }}>Operator</span>
            {op ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <OperatorLogo operator={op} size={18} />
                <span style={{ fontWeight: 600, color: op.color }}>{op.shortName}</span>
              </div>
            ) : (
              <span>{site.operatorId}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ color: '#94a3b8', minWidth: 56 }}>Location</span>
            <span>{site.district}, {site.division}</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ color: '#94a3b8', minWidth: 56 }}>Power</span>
            <span style={{ color: pc.hex, fontWeight: 600 }}>{pc.icon} {pc.label}</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <span style={{ color: '#94a3b8', minWidth: 56 }}>Last seen</span>
            <span>{formatTimeAgo(site.lastSubmission)}</span>
          </div>
        </div>

        {/* Detail link */}
        <button
          onClick={() => navigate(`/sites/${site.id}`)}
          style={{
            display: 'block', width: '100%', marginTop: 10,
            padding: '5px 0', borderRadius: 5,
            background: '#003D7A', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 600,
          }}
        >
          View Site Detail →
        </button>
      </div>
    </Popup>
  )
}
