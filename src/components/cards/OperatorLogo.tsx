// ─── OperatorLogo ─────────────────────────────────────────────────
// Renders an operator's brand logo if available, otherwise falls back
// to the coloured initials square.  Drop-in replacement wherever an
// operator badge was previously shown with initials only.
//
// Props:
//   operator  — Operator object (must have color + initials; logo optional)
//   size      — bounding box in px (both width and height). Default 28.
//   radius    — border-radius in px. Default: size * 0.28 (rounded square)

import type { Operator } from '@/types/operator'

interface Props {
  operator: Operator
  size?:    number
  radius?:  number
}

export default function OperatorLogo({ operator, size = 28, radius }: Props) {
  const r = radius ?? Math.round(size * 0.28)

  if (operator.logo) {
    return (
      <img
        src={operator.logo}
        alt={operator.shortName}
        style={{
          width:      size,
          height:     size,
          borderRadius: r,
          objectFit:  'contain',
          background: 'white',
          border:     '1px solid #e2e8f0',
          flexShrink: 0,
          display:    'block',
          padding:    Math.max(2, size * 0.08),
        }}
      />
    )
  }

  // Fallback: coloured square with initials
  return (
    <div style={{
      width:           size,
      height:          size,
      borderRadius:    r,
      background:      operator.color,
      color:           'white',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      fontSize:        Math.round(size * 0.35),
      fontWeight:      800,
      letterSpacing:   '0.03em',
      flexShrink:      0,
    }}>
      {operator.initials}
    </div>
  )
}
