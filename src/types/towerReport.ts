import type { AdminLevel } from './fiberReport'
import type { TowerOperatorKey } from '@/components/map/TowerOverlay'
import type { TowerTypeBucket } from '@/utils/towerReportFilter'

export type { AdminLevel, TowerOperatorKey }

export interface TowerRow {
  id:          string
  operatorKey: TowerOperatorKey
  operator:    string
  group:       'mno' | 'towerco'
  towerId:     string
  towerType:   string
  typeBucket:  TowerTypeBucket
  owner:       string
  tenants:     string
  division:    string
  district:    string
  thana:       string
  lat:         number | null
  lon:         number | null
}

export interface TowerReportFilters {
  level:     AdminLevel
  area:      string
  operators: Set<TowerOperatorKey>
}
