// ─── Site types ───────────────────────────────────────────────────

export type SiteStatus = 'active' | 'down' | 'degraded'

export type PowerSource = 'grid' | 'generator' | 'battery' | 'solar'

export type AssetType = 'tower' | 'bts' | 'nttn_pop'

export type SubmissionStatus = 'on_time' | 'late' | 'missing'

export interface Site {
  id: string                      // e.g. "DHK-001", "SYL-003"
  name: string                    // e.g. "Gulshan Tower 1"
  type: AssetType
  operatorId: string              // FK → operators.ts
  tenants: string[]               // operator IDs co-located on this site
  division: string                // "Dhaka" | "Chattogram" | ...
  district: string                // "Dhaka" | "Sylhet Sadar" | ...
  upazila: string
  lat: number
  lng: number
  status: SiteStatus
  powerSource: PowerSource
  hasActiveOutage: boolean
  lastSubmission: string          // ISO timestamp
  submissionStatus: SubmissionStatus
}
