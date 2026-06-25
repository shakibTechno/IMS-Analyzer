import type { Operator } from '@/types/operator'

import gpLogo         from '@/assets/Logo/gp-logo.png'
import robiLogo       from '@/assets/Logo/robi-logo.png'
import banglalinkLogo from '@/assets/Logo/banglalink-logo.png'
import edotcoLogo     from '@/assets/Logo/edotco-logo.png'
import teletalkLogo   from '@/assets/Logo/tt-logo.png'

// ─── 6 licensed operators ─────────────────────────────────────────
// 4 MNOs, 1 NTTN operator, 1 tower company
// Colors chosen to match recognizable brand palettes

export const OPERATORS: Operator[] = [
  {
    id: 'OP-GP',
    name: 'Grameenphone Ltd.',
    shortName: 'Grameenphone',
    type: 'mno',
    color: '#0082C8',
    initials: 'GP',
    logo: gpLogo,
  },
  {
    id: 'OP-ROBI',
    name: 'Robi Axiata Ltd.',
    shortName: 'Robi',
    type: 'mno',
    color: '#E2001A',
    initials: 'RB',
    logo: robiLogo,
  },
  {
    id: 'OP-BL',
    name: 'Banglalink Digital Communications Ltd.',
    shortName: 'Banglalink',
    type: 'mno',
    color: '#F26522',
    initials: 'BL',
    logo: banglalinkLogo,
  },
  {
    id: 'OP-BGFCL',
    name: 'Bangladesh Gas Fields Company Ltd. NTTN',
    shortName: 'BGFCL NTTN',
    type: 'nttn',
    color: '#16a34a',
    initials: 'BG',
    // No logo asset available — initials badge used as fallback
  },
  {
    id: 'OP-TT',
    name: 'Teletalk Bangladesh Limited',
    shortName: 'Teletalk',
    type: 'mno',
    color: '#009FAE',
    initials: 'TT',
    logo: teletalkLogo,
  },
  {
    id: 'OP-EDOTCO',
    name: 'edotco Bangladesh Co. Ltd.',
    shortName: 'Edotco BD',
    type: 'tower_company',
    color: '#7c3aed',
    initials: 'ED',
    logo: edotcoLogo,
  },
]

export const OPERATOR_MAP = Object.fromEntries(
  OPERATORS.map(op => [op.id, op])
) as Record<string, Operator>

export function getOperator(id: string): Operator | undefined {
  return OPERATOR_MAP[id]
}
