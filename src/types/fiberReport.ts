export type AdminLevel = 'division' | 'district' | 'upazila'

export type OperatorKey =
  | 'btcl'
  | 'banglalink'
  | 'bahon'
  | 'brfiber'
  | 'is3'
  | 'oprlines'

export const OPERATOR_LABELS: Record<OperatorKey, string> = {
  btcl:       'BTCL',
  banglalink: 'Banglalink',
  bahon:      'Bahon',
  brfiber:    'BR Fiber',
  is3:        'IS3',
  oprlines:   'Operator Lines',
}

export interface FiberSegment {
  id:          string
  operatorKey: OperatorKey
  operator:    string
  lineName:    string
  lineType:    string
  fromNode:    string
  toNode:      string
  coreCount:   number | null
  coresUsed:   number | null
  coresFree:   number | null
  routeKm:     number | null
  division:    string
  district:    string
  upazila:     string
  matchSide:   'both' | 'origin' | 'destination' | 'all'
}

export interface ReportFilters {
  level:       AdminLevel
  origin:      string
  destination: string
  operators:   Set<OperatorKey>
}
