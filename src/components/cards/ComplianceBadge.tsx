import type { SubmissionStatus } from '@/types/site'
import { COMPLIANCE_COLORS } from '@/utils/statusColors'
import { formatSubmissionStatus } from '@/utils/formatters'

interface Props {
  status: SubmissionStatus
  size?:  'sm' | 'md'
}

export default function ComplianceBadge({ status, size = 'md' }: Props) {
  const c       = COMPLIANCE_COLORS[status]
  const isSmall = size === 'sm'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: isSmall ? '1px 6px' : '2px 8px',
      borderRadius: 9999,
      background: c.hex + '18',
      border: `1px solid ${c.hex}40`,
      color: c.hex,
      fontSize: isSmall ? 10 : 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isSmall ? 5 : 6, height: isSmall ? 5 : 6,
        borderRadius: '50%', background: c.hex, flexShrink: 0,
      }} />
      {formatSubmissionStatus(status)}
    </span>
  )
}
