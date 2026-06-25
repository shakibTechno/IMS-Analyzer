// ─── Filter state types ───────────────────────────────────────────

import type { SiteStatus, AssetType } from './site'
import type { OperatorType } from './operator'

export type TimePeriod = 'live' | '24h' | '7d' | '30d'

export interface FilterState {
  period: TimePeriod
  division: string | null
  district: string | null
  operatorId: string | null
  operatorType: OperatorType | null
  assetType: AssetType | null
  statusFilter: SiteStatus[] | null   // null = show all statuses
}
