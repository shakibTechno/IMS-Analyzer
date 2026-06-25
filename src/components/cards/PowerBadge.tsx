import type { PowerSource } from '@/types/site'
import { POWER_COLORS } from '@/utils/statusColors'

interface Props {
  source: PowerSource
  showLabel?: boolean   // default true
  size?:  'sm' | 'md'
}

export default function PowerBadge({ source, showLabel = true, size = 'md' }: Props) {
  const c       = POWER_COLORS[source]
  const isSmall = size === 'sm'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: isSmall ? '1px 6px' : '2px 8px',
      borderRadius: 6,
      background: c.hex + '15',
      border: `1px solid ${c.hex}33`,
      color: c.hex,
      fontSize: isSmall ? 10 : 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: isSmall ? 10 : 12, lineHeight: 1 }}>{c.icon}</span>
      {showLabel && c.label}
    </span>
  )
}
