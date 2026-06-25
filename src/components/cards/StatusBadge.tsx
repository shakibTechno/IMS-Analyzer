import type { SiteStatus } from '@/types/site'
import { STATUS_COLORS } from '@/utils/statusColors'

interface Props {
  status:  SiteStatus
  variant?: 'dot'        // dot only
           | 'pill'      // dot + text (default)
           | 'solid'     // solid background chip
  size?:   'sm' | 'md'
}

export default function StatusBadge({ status, variant = 'pill', size = 'md' }: Props) {
  const c     = STATUS_COLORS[status]
  const isSmall = size === 'sm'

  if (variant === 'dot') {
    return (
      <span style={{
        display: 'inline-block',
        width:  isSmall ? 7 : 9,
        height: isSmall ? 7 : 9,
        borderRadius: '50%',
        background: c.hex,
        flexShrink: 0,
      }} />
    )
  }

  if (variant === 'solid') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: isSmall ? '2px 7px' : '3px 9px',
        borderRadius: 9999,
        background: c.hex,
        color: 'white',
        fontSize: isSmall ? 10 : 11,
        fontWeight: 700,
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap',
      }}>
        {c.label}
      </span>
    )
  }

  // default: pill (dot + text on tinted background)
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: isSmall ? '2px 7px' : '3px 9px',
      borderRadius: 9999,
      background: c.hex + '18',
      border: `1px solid ${c.hex}44`,
      color: c.hex,
      fontSize: isSmall ? 10 : 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: isSmall ? 5 : 6, height: isSmall ? 5 : 6,
        borderRadius: '50%', background: c.hex, flexShrink: 0,
      }} />
      {c.label}
    </span>
  )
}
