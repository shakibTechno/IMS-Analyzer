// ─── Operator types ───────────────────────────────────────────────

export type OperatorType = 'mno' | 'nttn' | 'tower_company'

export interface Operator {
  id: string           // "OP-GP", "OP-ROBI", "OP-BL", "OP-BGFCL", "OP-EDOTCO"
  name: string         // "Grameenphone Ltd."
  shortName: string    // "GP"
  type: OperatorType
  color: string        // hex color for charts
  initials: string     // 2-letter badge label (fallback when no logo)
  logo?: string        // imported PNG asset URL — undefined = show initials badge
}
