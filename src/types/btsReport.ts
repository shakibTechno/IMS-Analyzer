import type { AdminLevel } from './fiberReport'
export type { AdminLevel }

export type BTSOperatorKey = 'gp' | 'robi' | 'banglalink' | 'summit'

export const BTS_OPERATOR_LABELS: Record<BTSOperatorKey, string> = {
  gp:         'Grameenphone',
  robi:       'Robi',
  banglalink: 'Banglalink',
  summit:     'Summit',
}

export const BTS_OPERATOR_COLOR: Record<BTSOperatorKey, string> = {
  gp:         '#0066cc',
  robi:       '#e31837',
  banglalink: '#f59e0b',
  summit:     '#7c3aed',
}

export interface BTSSite {
  id:          string
  operatorKey: BTSOperatorKey
  operator:    string
  siteName:    string
  siteType:    string
  txType:      string
  has2G:       boolean | null
  has3G:       boolean | null
  has4G:       boolean | null
  division:    string
  district:    string
  upazila:     string
  lat:         number | null
  lon:         number | null
}

export interface BTSReportFilters {
  level:     AdminLevel
  area:      string
  operators: Set<BTSOperatorKey>
}
